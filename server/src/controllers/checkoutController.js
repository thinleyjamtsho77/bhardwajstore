import { randomBytes } from "node:crypto";
import pool from "../config/db.js";
import { sendMail } from "../config/mailer.js";

const GST_RATE = 0; // Should be same as GST in cart controller

const STORE = {
  name: "Bhardwaj Grocery Store",
  address: "Amritsar, Punjab, India",
  hours: "Mon - Sun 10:00 AM - 9:00 PM",
  email: "info@bhardwaj.hotmail.com",
};

// Conversion to avoid floating point
const toPaise = (value) => Math.round(Number(value) * 100);
const toRupees = (paise) => (paise / 100).toFixed(2);
const formatMoney = (n) =>
  "₹ " + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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

//POST /api/checkout -> Simulated Payment
export async function placeOrder(req, res) {
  const contact = cleanContact(req.body);
  if (contact.error) return res.status(400).json({ message: contact.error });

  const userId = req.user.id;
  let conn;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [carts] = await conn.execute(
      `SELECT cart_id FROM shopping_carts
       WHERE user_id = ? AND status = 'active'
       ORDER BY cart_id DESC LIMIT 1`,
      [userId]
    );

    // Prices always come from the database
    const [lines] = carts[0]
      ? await conn.execute(
          `SELECT ci.product_id, p.product_name, p.sku, p.price, ci.quantity
           FROM cart_items ci
           JOIN products p ON p.product_id = ci.product_id AND p.is_active = 1
           WHERE ci.cart_id = ?
           ORDER BY ci.product_id`, 
          [carts[0].cart_id]
        )
      : [[]];

    if (lines.length === 0) {
      await conn.rollback();
      return res.status(400).json({ message: "Your cart is empty." });
    }

    // Lock each stock row while we check it, so two customers can't buy the last item together
    for (const l of lines) {
      const [inv] = await conn.execute(
        "SELECT quantity_available, reserved_quantity FROM inventory WHERE product_id = ? FOR UPDATE",
        [l.product_id]
      );
      l.tracked = inv.length > 0;
      if (l.tracked) {
        const available = inv[0].quantity_available - inv[0].reserved_quantity;
        if (l.quantity > available) {
          await conn.rollback();
          return res.status(409).json({
            message: `${l.product_name}: only ${available} available. Update your cart and try again.`,
          });
        }
      }
    }

    const priced = lines.map((l) => {
      const unitPaise = toPaise(l.price);
      return { ...l, unitPaise, linePaise: unitPaise * l.quantity };
    });
    const subtotalPaise = priced.reduce((sum, l) => sum + l.linePaise, 0);
    const taxPaise = Math.round(subtotalPaise * GST_RATE);
    const totalPaise = subtotalPaise + taxPaise;

    const [orderResult] = await conn.execute(
      `INSERT INTO orders
         (order_number, user_id, contact_name, contact_email, contact_phone, contact_address,
          order_status, payment_status, subtotal, tax_amount, total_amount)
       VALUES (?, ?, ?, ?, ?, ?, 'confirmed', 'paid', ?, ?, ?)`,
      [
        `TMP-${randomBytes(8).toString("hex")}`,
        userId,
        `${contact.firstName} ${contact.lastName}`,
        contact.email,
        contact.phone,
        contact.address || null,
        toRupees(subtotalPaise),
        toRupees(taxPaise),
        toRupees(totalPaise),
      ]
    );
    const orderId = orderResult.insertId;
    const orderNumber = `BG-${String(orderId).padStart(5, "0")}`;
    await conn.execute("UPDATE orders SET order_number = ? WHERE order_id = ?", [orderNumber, orderId]);

    for (const l of priced) {
      await conn.execute(
        `INSERT INTO order_items (order_id, product_id, product_name, sku, quantity, unit_price, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, l.product_id, l.product_name, l.sku, l.quantity, toRupees(l.unitPaise), toRupees(l.linePaise)]
      );

      if (l.tracked) {
        await conn.execute(
          "UPDATE inventory SET quantity_available = quantity_available - ? WHERE product_id = ?",
          [l.quantity, l.product_id]
        );
        await conn.execute(
          `INSERT INTO inventory_transactions (product_id, transaction_type, quantity_change, reference_id, notes)
           VALUES (?, 'sale', ?, ?, ?)`,
          [l.product_id, -l.quantity, orderId, `Order ${orderNumber}`]
        );
      }
    }

    // The amount paid is recorded here
    await conn.execute(
      `INSERT INTO payments (order_id, payment_method, payment_status, transaction_reference, amount, paid_at)
       VALUES (?, 'card', 'paid', ?, ?, NOW())`,
      [orderId, `SIMULATED-${orderNumber}`, toRupees(totalPaise)]
    );

    // Pickup token, built from its row id like the order number (BGS-0032)
    const [tokenResult] = await conn.execute(
      "INSERT INTO pickup_tokens (order_id, token_number) VALUES (?, ?)",
      [orderId, `TMP${randomBytes(8).toString("hex")}`]
    );
    const token = `BGS-${String(tokenResult.insertId).padStart(4, "0")}`;
    await conn.execute("UPDATE pickup_tokens SET token_number = ? WHERE pickup_token_id = ?", [
      token,
      tokenResult.insertId,
    ]);

    await conn.execute("UPDATE shopping_carts SET status = 'converted' WHERE cart_id = ?", [carts[0].cart_id]);

    await conn.commit();

    res.status(201).json({
      orderNumber,
      token,
      total: totalPaise / 100,
      email: contact.email,
    });
  } catch (error) {
    await conn?.rollback().catch(() => {});
    console.error("Place order failed:", error.code || error.message);
    res.status(500).json({ message: "Unable to place your order. Please try again." });
  } finally {
    conn?.release();
  }
}

// Email the order details

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

// At most 3 emails per order per hour
const EMAIL_LIMIT = 3;
const EMAIL_WINDOW_MS = 60 * 60 * 1000;
const emailLog = new Map();

function buildEmail({ name, order, items }) {
  const rowsText = items.map((i) => `  ${i.quantity} x ${i.product_name}  ${formatMoney(i.line_total)}`).join("\n");

  const text = [
    `Hi ${name},`,
    "",
    "Your order has been placed successfully.",
    "",
    `Order No: ${order.order_number}`,
    `Pickup Token: ${order.token_number}`,
    "",
    "Items:",
    rowsText,
    "",
    `Total paid: ${formatMoney(order.total_amount)}`,
    "",
    "Remember to take a picture of this email or your token and show it when you collect your order.",
    "",
    `${STORE.name}`,
    `${STORE.address}`,
    `Open: ${STORE.hours}`,
    STORE.email,
  ].join("\n");

  const rowsHtml = items
    .map(
      (i) =>
        `<tr><td style="padding:6px 0">${escapeHtml(i.quantity)} × ${escapeHtml(i.product_name)}</td>` +
        `<td style="padding:6px 0;text-align:right">${escapeHtml(formatMoney(i.line_total))}</td></tr>`
    )
    .join("");

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;background:#e9f2e9;border-radius:16px;color:#1a1a1a">
    <h1 style="margin:0 0 8px;font-size:24px;text-align:center">Order Confirmed!</h1>
    <p style="text-align:center;margin:0 0 20px">Hi ${escapeHtml(name)}, your order has been placed successfully.</p>
    <p style="text-align:center;font-size:16px;margin:0 0 20px">
      Order No: <strong>${escapeHtml(order.order_number)}</strong><br>
      Pickup Token: <strong style="font-size:22px">${escapeHtml(order.token_number)}</strong>
    </p>
    <table style="width:100%;border-collapse:collapse;border-top:1px solid #c8d8c8;border-bottom:1px solid #c8d8c8;font-size:14px">${rowsHtml}</table>
    <p style="text-align:right;font-size:16px;margin:12px 0 20px"><strong>Total paid: ${escapeHtml(formatMoney(order.total_amount))}</strong></p>
    <p style="color:#f57c00;font-size:13px;margin:0 0 20px">** Remember to take a picture of this email or your token and show it when you collect your order.</p>
    <p style="font-size:13px;color:#444;margin:0">
      <strong>${escapeHtml(STORE.name)}</strong><br>${escapeHtml(STORE.address)}<br>Open: ${escapeHtml(STORE.hours)}<br>${escapeHtml(STORE.email)}
    </p>
  </div>`;

  return { text, html };
}

// POST /api/checkout/:orderNumber/email

export async function emailOrder(req, res) {
  const orderNumber = String(req.params.orderNumber);
  if (!/^BG-\d{5,}$/.test(orderNumber)) {
    return res.status(400).json({ message: "Invalid order number" });
  }

  const key = `${req.user.id}:${orderNumber}`;
  const now = Date.now();
  const recent = (emailLog.get(key) ?? []).filter((t) => now - t < EMAIL_WINDOW_MS);
  if (recent.length >= EMAIL_LIMIT) {
    return res.status(429).json({ message: "The details were already emailed a few times. Please try again later." });
  }

  try {
    const [orders] = await pool.execute(
      `SELECT o.order_id, o.order_number, o.total_amount, o.contact_name, o.contact_email,
              u.name AS account_name, u.email AS account_email, pt.token_number
       FROM orders o
       JOIN users u ON u.user_id = o.user_id
       LEFT JOIN pickup_tokens pt ON pt.order_id = o.order_id
       WHERE o.order_number = ? AND o.user_id = ?`,
      [orderNumber, req.user.id] // the order must belong to the signed-in user
    );
    const order = orders[0];
    if (!order || !order.token_number) {
      return res.status(404).json({ message: "Order not found" });
    }

    const [items] = await pool.execute(
      "SELECT product_name, quantity, line_total FROM order_items WHERE order_id = ? ORDER BY order_item_id",
      [order.order_id]
    );

    const to = order.contact_email || order.account_email;
    const name = order.contact_name || order.account_name;
    const { text, html } = buildEmail({ name, order, items });

    const result = await sendMail({
      to,
      subject: `Your ${STORE.name} order ${order.order_number}`,
      text,
      html,
    });

    recent.push(now);
    emailLog.set(key, recent);

    res.json({ sentTo: to, previewUrl: result.previewUrl });
  } catch (error) {
    console.error("Email order failed:", error.code || error.message);
    res.status(502).json({ message: "We couldn’t send the email. Please try again." });
  }
}
