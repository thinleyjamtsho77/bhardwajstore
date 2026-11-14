import { randomInt } from "node:crypto";
import pool from "../config/db.js";
import stripe from "../config/stripe.js";

const toPaise = (value) => Math.round(Number(value) * 100);

/**
 * Express route handler. It only verifies the signature and calls processStripeEvent,
 * so the same function can later be called from a Lambda fed by EventBridge or SQS.
 *
 * Needs the raw body: register it BEFORE express.json() in server.js.
 */
export async function handleStripeWebhook(req, res) {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature check failed:", error.message);
    return res.status(400).send("Invalid signature");
  }

  try {
    await processStripeEvent(event);
    res.json({ received: true });
  } catch (error) {
    // A non-2xx response makes Stripe retry the event later
    console.error("Webhook handling failed:", event.type, error.code || error.message);
    res.status(500).json({ message: "Webhook handler error" });
  }
}

export async function processStripeEvent(event) {
  switch (event.type) {
    case "payment_intent.succeeded":
      return markOrderPaid(event.data.object);
    case "payment_intent.payment_failed":
      return markPaymentFailed(event.data.object);
    default:
      return; // events we don't subscribe to are ignored
  }
}

function orderIdFrom(intent) {
  const id = Number(intent.metadata?.order_id);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

async function createPickupToken(conn, orderId) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const token = `BG-${randomInt(100000, 1000000)}`;
    try {
      await conn.execute("INSERT INTO pickup_tokens (order_id, token_number) VALUES (?, ?)", [orderId, token]);
      return;
    } catch (error) {
      if (error.code !== "ER_DUP_ENTRY") throw error;
      if (!String(error.sqlMessage).includes("token_number")) return; // this order already has a token
    }
  }
  throw new Error("Could not generate a unique pickup token");
}

async function markOrderPaid(intent) {
  const orderId = orderIdFrom(intent);
  if (!orderId) {
    console.warn("payment_intent.succeeded without an order_id:", intent.id);
    return;
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [orders] = await conn.execute(
      "SELECT order_id, user_id, total_amount, payment_status FROM orders WHERE order_id = ? FOR UPDATE",
      [orderId]
    );
    const order = orders[0];

    // Stripe can deliver an event more than once, so this must be safe to repeat
    if (!order || order.payment_status === "paid") {
      await conn.rollback();
      return;
    }

    if (toPaise(order.total_amount) !== intent.amount_received) {
      await conn.rollback();
      console.error(`Amount mismatch for order ${orderId}: charged ${intent.amount_received}, expected ${toPaise(order.total_amount)}`);
      return; // needs a human to look at it; retrying won't help
    }

    await conn.execute(
      "UPDATE orders SET payment_status = 'paid', order_status = 'confirmed' WHERE order_id = ?",
      [orderId]
    );
    await conn.execute(
      "UPDATE payments SET payment_status = 'paid', paid_at = NOW(), transaction_reference = ? WHERE order_id = ?",
      [intent.id, orderId]
    );

    // Take the sold items out of stock and keep an audit trail
    const [items] = await conn.execute(
      "SELECT product_id, quantity FROM order_items WHERE order_id = ? AND product_id IS NOT NULL",
      [orderId]
    );
    for (const item of items) {
      await conn.execute(
        `UPDATE inventory
         SET quantity_available = IF(quantity_available >= ?, quantity_available - ?, 0)
         WHERE product_id = ?`,
        [item.quantity, item.quantity, item.product_id]
      );
      await conn.execute(
        `INSERT INTO inventory_transactions (product_id, transaction_type, quantity_change, reference_id, notes)
         VALUES (?, 'sale', ?, ?, ?)`,
        [item.product_id, -item.quantity, orderId, `Order ${orderId}`]
      );
    }

    await createPickupToken(conn, orderId);

    await conn.execute(
      "UPDATE shopping_carts SET status = 'converted' WHERE user_id = ? AND status = 'active'",
      [order.user_id]
    );

    await conn.commit();
  } catch (error) {
    await conn.rollback().catch(() => {});
    throw error;
  } finally {
    conn.release();
  }
}

async function markPaymentFailed(intent) {
  const orderId = orderIdFrom(intent);
  if (!orderId) return;

  await pool.execute(
    "UPDATE payments SET payment_status = 'failed' WHERE order_id = ? AND payment_status = 'pending'",
    [orderId]
  );
  await pool.execute(
    "UPDATE orders SET payment_status = 'failed' WHERE order_id = ? AND payment_status = 'pending'",
    [orderId]
  );
}