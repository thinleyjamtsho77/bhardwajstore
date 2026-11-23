import express from "express";
import pool from "../config/db.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { getDashboard } from "../controllers/dashboardController.js";

const router = express.Router();
router.use(authenticate);
router.get("/dashboard", requireRole("staff", "admin"), getDashboard);
router.use(requireRole("admin"));

function positiveId(value) {
  return typeof value === "string" && /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value))
    ? Number(value)
    : null;
}

router.get("/customers", async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        u.user_id AS id,
        CONCAT('CP', u.user_id) AS customerId,
        u.name,
        u.phone,
        u.email,
        u.account_status AS status,
        COUNT(DISTINCT o.order_id) AS orders,
        COALESCE(SUM(CASE WHEN o.order_status NOT IN ('cancelled', 'refunded') THEN o.total_amount ELSE 0 END), 0) AS spent,
        DATE_FORMAT(u.created_at, '%d %b %Y') AS joined
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.user_id
      WHERE u.role = 'customer'
      GROUP BY u.user_id, u.name, u.phone, u.email, u.account_status, u.created_at
      ORDER BY u.user_id
    `);
    res.json(rows.map((row) => ({ ...row, orders: Number(row.orders), spent: Number(row.spent) })));
  } catch (error) {
    console.error("Admin customer list failed:", error.code);
    res.status(500).json({ message: "Unable to load customers" });
  }
});

router.patch("/customers/:id", async (req, res) => {
  const id = positiveId(req.params.id);
  const { name, email, phone } = req.body ?? {};
  if (!id || typeof name !== "string" || typeof email !== "string" || (phone !== null && typeof phone !== "string")) {
    return res.status(400).json({ message: "Invalid customer details" });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone?.trim() || null;
  if (!cleanName || cleanName.length > 100 || !/^\S+@\S+\.\S+$/.test(cleanEmail) || cleanEmail.length > 100 || (cleanPhone && cleanPhone.length > 20)) {
    return res.status(400).json({ message: "Enter a valid name, email, and phone number" });
  }

  try {
    const [result] = await pool.execute(
      "UPDATE users SET name = ?, email = ?, phone = ? WHERE user_id = ? AND role = 'customer'",
      [cleanName, cleanEmail, cleanPhone, id]
    );
    if (!result.affectedRows) {
      const [customers] = await pool.execute("SELECT user_id FROM users WHERE user_id = ? AND role = 'customer'", [id]);
      if (!customers.length) return res.status(404).json({ message: "Customer not found" });
    }
    res.json({ id, name: cleanName, email: cleanEmail, phone: cleanPhone });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ message: "That email address is already in use" });
    console.error("Admin customer update failed:", error.code);
    res.status(500).json({ message: "Unable to update customer" });
  }
});

router.patch("/customers/:id/status", async (req, res) => {
  const id = positiveId(req.params.id);
  const { status } = req.body ?? {};
  if (!id || !["active", "inactive", "blocked"].includes(status)) {
    return res.status(400).json({ message: "Invalid customer status" });
  }
  try {
    const [result] = await pool.execute(
      "UPDATE users SET account_status = ? WHERE user_id = ? AND role = 'customer'",
      [status, id]
    );
    if (!result.affectedRows) {
      const [customers] = await pool.execute("SELECT user_id FROM users WHERE user_id = ? AND role = 'customer'", [id]);
      if (!customers.length) return res.status(404).json({ message: "Customer not found" });
    }
    res.json({ id, status });
  } catch (error) {
    console.error("Admin customer status update failed:", error.code);
    res.status(500).json({ message: "Unable to update customer status" });
  }
});

router.delete("/customers/:id", async (req, res) => {
  const id = positiveId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid customer ID" });

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [users] = await connection.execute(
      "SELECT user_id FROM users WHERE user_id = ? AND role = 'customer' FOR UPDATE",
      [id]
    );
    if (!users.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Customer not found" });
    }
    const [orders] = await connection.execute("SELECT COUNT(*) AS count FROM orders WHERE user_id = ?", [id]);
    if (Number(orders[0].count) > 0) {
      await connection.rollback();
      return res.status(409).json({ message: "This customer has order history and cannot be deleted. Block the account instead." });
    }
    await connection.execute("DELETE FROM users WHERE user_id = ? AND role = 'customer'", [id]);
    await connection.commit();
    res.json({ id, deleted: true });
  } catch (error) {
    await connection.rollback();
    console.error("Admin customer deletion failed:", error.code);
    res.status(500).json({ message: "Unable to delete customer" });
  } finally {
    connection?.release();
  }
});

router.get("/inventory", async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.product_id AS id,
        CONCAT('CP', p.product_id) AS productId,
        p.product_name AS product,
        c.category_name AS category,
        COALESCE(i.quantity_available, 0) AS stock,
        COALESCE(i.reserved_quantity, 0) AS reserved,
        COALESCE(i.reorder_level, 5) AS reorderLevel,
        DATE_FORMAT(i.last_updated, '%d %b %Y') AS updated
      FROM products p
      JOIN categories c ON c.category_id = p.category_id
      LEFT JOIN inventory i ON i.product_id = p.product_id
      ORDER BY p.product_id
    `);
    res.json(rows.map((row) => {
      const stock = Number(row.stock);
      const reserved = Number(row.reserved);
      const available = stock - reserved;
      const status = available <= 0 ? "Out" : available <= Number(row.reorderLevel) ? "Low" : "In Stock";
      return { ...row, stock, reserved, reorderLevel: Number(row.reorderLevel), available, status };
    }));
  } catch (error) {
    console.error("Admin inventory list failed:", error.code);
    res.status(500).json({ message: "Unable to load inventory" });
  }
});

async function writeInventory(productId, actorId, quantity, transactionType, addQuantity = false) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [products] = await connection.execute("SELECT product_id FROM products WHERE product_id = ? FOR UPDATE", [productId]);
    if (!products.length) {
      await connection.rollback();
      return { status: 404, body: { message: "Product not found" } };
    }
    const [inventory] = await connection.execute(
      "SELECT quantity_available, reserved_quantity FROM inventory WHERE product_id = ? FOR UPDATE",
      [productId]
    );
    const currentStock = inventory.length ? Number(inventory[0].quantity_available) : 0;
    const reserved = inventory.length ? Number(inventory[0].reserved_quantity) : 0;
    const nextQuantity = addQuantity ? currentStock + quantity : quantity;
    if (!Number.isSafeInteger(nextQuantity)) {
      await connection.rollback();
      return { status: 400, body: { message: "Stock quantity is too large" } };
    }
    if (nextQuantity < reserved) {
      await connection.rollback();
      return { status: 400, body: { message: `Stock cannot be lower than ${reserved} reserved units` } };
    }
    const change = nextQuantity - currentStock;
    if (!inventory.length) {
      await connection.execute("INSERT INTO inventory (product_id, quantity_available) VALUES (?, ?)", [productId, nextQuantity]);
    } else if (change !== 0) {
      await connection.execute("UPDATE inventory SET quantity_available = ? WHERE product_id = ?", [nextQuantity, productId]);
    }
    if (change !== 0) {
      await connection.execute(
        "INSERT INTO inventory_transactions (product_id, created_by, transaction_type, quantity_change, notes) VALUES (?, ?, ?, ?, ?)",
        [productId, actorId, transactionType, change, transactionType === "purchase" ? "Stock restock" : "Admin stock adjustment"]
      );
    }
    await connection.commit();
    return { status: 200, body: { id: productId, stock: nextQuantity, reserved, available: nextQuantity - reserved } };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

router.patch("/inventory/:id/stock", async (req, res) => {
  const id = positiveId(req.params.id);
  const { stock } = req.body ?? {};
  if (!id || !Number.isSafeInteger(stock) || stock < 0) {
    return res.status(400).json({ message: "Stock must be a non-negative whole number" });
  }
  try {
    const result = await writeInventory(id, req.user.id, stock, "adjustment");
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Admin stock adjustment failed:", error.code);
    res.status(500).json({ message: "Unable to update stock" });
  }
});

router.post("/inventory/:id/restock", async (req, res) => {
  const id = positiveId(req.params.id);
  const { quantity } = req.body ?? {};
  if (!id || !Number.isSafeInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ message: "Restock quantity must be a positive whole number" });
  }
  try {
    const result = await writeInventory(id, req.user.id, quantity, "purchase", true);
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Admin restock failed:", error.code);
    res.status(500).json({ message: "Unable to restock product" });
  }
});

export default router;
