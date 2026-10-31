import pool from "../config/db.js";

const MAX_QTY = 99;
const GST_RATE = 0; 


const toPaise = (value) => Math.round(Number(value) * 100);

function parseId(value) {
  const s = String(value);
  if (!/^[1-9]\d*$/.test(s)) return null;
  const n = Number(s);
  return Number.isSafeInteger(n) ? n : null;
}

// The user's newest active cart, or null if they don't have one yet
async function getActiveCartId(userId) {
  const [rows] = await pool.execute(
    `SELECT cart_id FROM shopping_carts
     WHERE user_id = ? AND status = 'active'
     ORDER BY cart_id DESC LIMIT 1`,
    [userId]
  );
  return rows[0]?.cart_id ?? null;
}

async function loadCart(userId) {
  const cartId = await getActiveCartId(userId);
  const empty = {
    items: [],
    itemCount: 0,
    totals: { subtotal: 0, discount: 0, gst: 0, total: 0 },
  };
  if (!cartId) return empty;

  const [rows] = await pool.execute(
    `SELECT
       ci.product_id AS productId,
       p.product_name AS name,
       p.size_value,
       p.size_unit,
       p.price,
       ci.quantity,
       (SELECT pi.image_url
          FROM product_images pi
          WHERE pi.product_id = p.product_id
          ORDER BY pi.is_primary DESC, pi.display_order, pi.image_id
          LIMIT 1) AS image,
       (inv.quantity_available - inv.reserved_quantity) AS available
     FROM cart_items ci
     JOIN products p ON p.product_id = ci.product_id
     LEFT JOIN inventory inv ON inv.product_id = p.product_id
     WHERE ci.cart_id = ? AND p.is_active = 1
     ORDER BY ci.cart_item_id`,
    [cartId]
  );

  let subtotalPaise = 0;
  const items = rows.map((r) => {
    const unitPaise = toPaise(r.price);
    const linePaise = unitPaise * r.quantity;
    subtotalPaise += linePaise;
    return {
      productId: r.productId,
      name: r.name,
      size: r.size_value ? `${Number(r.size_value)} ${r.size_unit}` : null,
      image: r.image,
      quantity: r.quantity,
      available: r.available == null ? null : Number(r.available),
      unitPrice: unitPaise / 100,
      lineTotal: linePaise / 100,
    };
  });

  const discountPaise = 0; // applied once promo codes exist
  const gstPaise = Math.round((subtotalPaise - discountPaise) * GST_RATE);

  return {
    items,
    itemCount: items.length,
    totals: {
      subtotal: subtotalPaise / 100,
      discount: discountPaise / 100,
      gst: gstPaise / 100,
      total: (subtotalPaise - discountPaise + gstPaise) / 100,
    },
  };
}

async function getProductStock(productId) {
  const [rows] = await pool.execute(
    `SELECT p.price,
            (inv.quantity_available - inv.reserved_quantity) AS available
     FROM products p
     LEFT JOIN inventory inv ON inv.product_id = p.product_id
     WHERE p.product_id = ? AND p.is_active = 1`,
    [productId]
  );
  if (!rows[0]) return null;
  return {
    price: rows[0].price,
    available: rows[0].available == null ? null : Number(rows[0].available),
  };
}

export async function getCart(req, res) {
  try {
    res.json(await loadCart(req.user.id));
  } catch (error) {
    console.error("Load cart failed:", error.code || error.message);
    res.status(500).json({ message: "Unable to load cart" });
  }
}

export async function addItem(req, res) {
  const productId = parseId(req.body?.productId);
  const quantity = req.body?.quantity === undefined ? 1 : parseId(req.body.quantity);

  if (!productId || !quantity || quantity > MAX_QTY) {
    return res.status(400).json({ message: "Invalid product or quantity" });
  }

  try {
    const product = await getProductStock(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    let cartId = await getActiveCartId(req.user.id);
    if (!cartId) {
      const [result] = await pool.execute(
        "INSERT INTO shopping_carts (user_id) VALUES (?)",
        [req.user.id]
      );
      cartId = result.insertId;
    }

    const [existing] = await pool.execute(
      "SELECT quantity FROM cart_items WHERE cart_id = ? AND product_id = ?",
      [cartId, productId]
    );
    const newQty = Math.min(MAX_QTY, (existing[0]?.quantity ?? 0) + quantity);

    if (product.available !== null && newQty > product.available) {
      return res.status(409).json({ message: `Only ${product.available} available` });
    }

    await pool.execute(
      `INSERT INTO cart_items (cart_id, product_id, quantity, unit_price)
       VALUES (?, ?, ?, ?) AS new_row
       ON DUPLICATE KEY UPDATE
         quantity = new_row.quantity,
         unit_price = new_row.unit_price`,
      [cartId, productId, newQty, product.price]
    );

    res.status(201).json(await loadCart(req.user.id));
  } catch (error) {
    console.error("Add to cart failed:", error.code || error.message);
    res.status(500).json({ message: "Unable to add to cart" });
  }
}

export async function updateItem(req, res) {
  const productId = parseId(req.params.productId);
  const quantity = parseId(req.body?.quantity);

  if (!productId || !quantity || quantity > MAX_QTY) {
    return res.status(400).json({ message: "Quantity must be between 1 and 99" });
  }

  try {
    const cartId = await getActiveCartId(req.user.id);
    if (!cartId) return res.status(404).json({ message: "Item not in cart" });

    const product = await getProductStock(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.available !== null && quantity > product.available) {
      return res.status(409).json({ message: `Only ${product.available} available` });
    }

    const [result] = await pool.execute(
      `UPDATE cart_items SET quantity = ?, unit_price = ?
       WHERE cart_id = ? AND product_id = ?`,
      [quantity, product.price, cartId, productId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    res.json(await loadCart(req.user.id));
  } catch (error) {
    console.error("Update cart failed:", error.code || error.message);
    res.status(500).json({ message: "Unable to update cart" });
  }
}

export async function removeItem(req, res) {
  const productId = parseId(req.params.productId);
  if (!productId) return res.status(400).json({ message: "Invalid product" });

  try {
    const cartId = await getActiveCartId(req.user.id);
    if (cartId) {
      await pool.execute(
        "DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?",
        [cartId, productId]
      );
    }
    res.json(await loadCart(req.user.id));
  } catch (error) {
    console.error("Remove from cart failed:", error.code || error.message);
    res.status(500).json({ message: "Unable to remove item" });
  }
}