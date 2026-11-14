import { randomBytes } from "node:crypto";
import pool from "../config/db.js";
import stripe from "../config/stripe.js";

const CURRENCY = "inr";
const GST_RATE = 0; // set to e.g. 0.05 when GST applies (keep in sync with the cart controller)

// Money is handled in paise (integers) so totals never pick up floating-point errors
const toPaise = (value) => Math.round(Number(value) * 100);
const toRupees = (paise) => (paise / 100).toFixed(2);

function makeOrderNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `BG-${ymd}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

function cleanContact(body) {
  const { firstName, lastName, email, phone, address } = body ?? {};

  if (
    [firstName, lastName, email, phone].some((v) => typeof v !== "string") ||
    (address !== undefined && address !== null && typeof address !== "string")
  ) {
    return { error: "Invalid input" };
  }

  const c = {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    address: address ? address.trim() : "",
  };

  if (!c.firstName || !c.lastName || c.firstName.length > 50 || c.lastName.length > 50) {
    return { error: "Enter your first and last name." };
  }
  if (c.email.length > 100 || !/^\S+@\S+\.\S+$/.test(c.email)) {
    return { error: "Enter a valid email address." };
  }
  if (!/^\+?[0-9\s-]{6,20}$/.test(c.phone)) {
    return { error: "Enter a valid mobile number." };
  }
  if (c.address.length > 255) {
    return { error: "Address must be 255 characters or fewer." };
  }
  return c;
}

/**
 * POST /api/checkout
 * Turns the signed-in user's cart into a pending order, then creates the Stripe PaymentIntent.
 * Prices and totals always come from the database, never from the browser.
 */
export async function createCheckout(req, res) {
  const contact = cleanContact(req.body);
  if (contact.error) return res.status(400).json({ message: contact.error });

  const userId = req.user.id;
  const conn = await pool.getConnection();
  let orderId;
  let orderNumber;
  let totalPaise;
  const staleRefs = [];

  try {
    await conn.beginTransaction();

    const [carts] = await conn.execute(
      `SELECT cart_id FROM shopping_carts
       WHERE user_id = ? AND status = 'active'
       ORDER BY cart_id DESC LIMIT 1`,
      [userId]
    );

    const [lines] = carts[0]
      ? await conn.execute(
          `SELECT ci.product_id, p.product_name, p.sku, p.price, ci.quantity,
                  (inv.quantity_available - inv.reserved_quantity) AS available
           FROM cart_items ci
           JOIN products p ON p.product_id = ci.product_id AND p.is_active = 1
           LEFT JOIN inventory inv ON inv.product_id = p.product_id
           WHERE ci.cart_id = ?`,
          [carts[0].cart_id]
        )
      : [[]];

    if (lines.length === 0) {
      await conn.rollback();
      return res.status(400).json({ message: "Your cart is empty." });
    }

    for (const l of lines) {
      if (l.available != null && l.quantity > Number(l.available)) {
        await conn.rollback();
        return res.status(409).json({
          message: `${l.product_name}: only ${Number(l.available)} available. Update your cart and try again.`,
        });
      }
    }

    const priced = lines.map((l) => {
      const unitPaise = toPaise(l.price);
      return { ...l, unitPaise, linePaise: unitPaise * l.quantity };
    });
    const subtotalPaise = priced.reduce((sum, l) => sum + l.linePaise, 0);
    const taxPaise = Math.round(subtotalPaise * GST_RATE);
    totalPaise = subtotalPaise + taxPaise;

    // A retry after a failed card must not leave duplicate unpaid orders behind
    const [stale] = await conn.execute(
      `SELECT o.order_id, py.transaction_reference
       FROM orders o
       LEFT JOIN payments py ON py.order_id = o.order_id
       WHERE o.user_id = ? AND o.order_status = 'pending' AND o.payment_status IN ('pending', 'failed')`,
      [userId]
    );
    for (const s of stale) {
      await conn.execute("UPDATE orders SET order_status = 'cancelled' WHERE order_id = ?", [s.order_id]);
      await conn.execute(
        "UPDATE payments SET payment_status = 'cancelled' WHERE order_id = ? AND payment_status IN ('pending', 'failed')",
        [s.order_id]
      );
      if (s.transaction_reference) staleRefs.push(s.transaction_reference);
    }

    // The orders table has no contact columns, so the pickup contact goes into the customer notes
    const notes =
      `Contact: ${contact.firstName} ${contact.lastName} | ${contact.email} | ${contact.phone}` +
      (contact.address ? ` | Address: ${contact.address}` : "");

    orderNumber = makeOrderNumber();
    const [orderResult] = await conn.execute(
      `INSERT INTO orders (order_number, user_id, subtotal, tax_amount, total_amount, customer_notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [orderNumber, userId, toRupees(subtotalPaise), toRupees(taxPaise), toRupees(totalPaise), notes]
    );
    orderId = orderResult.insertId;

    for (const l of priced) {
      await conn.execute(
        `INSERT INTO order_items (order_id, product_id, product_name, sku, quantity, unit_price, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, l.product_id, l.product_name, l.sku, l.quantity, toRupees(l.unitPaise), toRupees(l.linePaise)]
      );
    }

    await conn.execute(
      `INSERT INTO payments (order_id, payment_method, payment_status, amount)
       VALUES (?, 'card', 'pending', ?)`,
      [orderId, toRupees(totalPaise)]
    );

    await conn.commit();
  } catch (error) {
    await conn.rollback().catch(() => {});
    console.error("Create order failed:", error.code || error.message);
    return res.status(500).json({ message: "Unable to start checkout. Please try again." });
  } finally {
    conn.release();
  }

  // Stripe call happens after the order exists, so the PaymentIntent can carry its id
  let intent;
  try {
    intent = await stripe.paymentIntents.create(
      {
        amount: totalPaise,
        currency: CURRENCY,
        payment_method_types: ["card"],
        receipt_email: contact.email,
        description: `Bhardwaj Grocery Store order ${orderNumber}`,
        metadata: { order_id: String(orderId), order_number: orderNumber, user_id: String(userId) },
      },
      { idempotencyKey: `pi-order-${orderId}` }
    );
  } catch (error) {
    console.error("Stripe PaymentIntent failed:", error.type, error.code || error.message);
    await pool.execute(
      "UPDATE orders SET order_status = 'cancelled', payment_status = 'failed' WHERE order_id = ?",
      [orderId]
    );
    await pool.execute("UPDATE payments SET payment_status = 'failed' WHERE order_id = ?", [orderId]);
    return res.status(502).json({ message: "The payment service is unavailable. Please try again." });
  }

  try {
    await pool.execute("UPDATE payments SET transaction_reference = ? WHERE order_id = ?", [intent.id, orderId]);

    // Best effort: close the PaymentIntents of the orders we just cancelled
    await Promise.all(staleRefs.map((ref) => stripe.paymentIntents.cancel(ref).catch(() => {})));

    res.status(201).json({
      orderId,
      orderNumber,
      clientSecret: intent.client_secret,
      total: totalPaise / 100,
    });
  } catch (error) {
    console.error("Save payment reference failed:", error.code || error.message);
    res.status(500).json({ message: "Unable to start checkout. Please try again." });
  }
}