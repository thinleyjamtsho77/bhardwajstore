import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

const BASE_SELECT = `
  SELECT
    p.product_id AS id,
    p.product_name AS name,
    p.brand,
    p.description,
    p.sku,
    p.price,
    p.size_value AS sizeValue,
    p.size_unit AS sizeUnit,
    p.is_active AS isActive,
    c.category_id AS categoryId,
    c.category_name AS categoryName,
    COALESCE(i.quantity_available, 0) AS stock,
    (SELECT pi.image_url FROM product_images pi
      WHERE pi.product_id = p.product_id
      ORDER BY pi.is_primary DESC, pi.display_order ASC LIMIT 1) AS imageUrl
  FROM products p
  JOIN categories c ON c.category_id = p.category_id
  LEFT JOIN inventory i ON i.product_id = p.product_id
`;

const SORTS = {
    brand: "p.brand ASC",
    price_asc: "p.price ASC",
    price_desc: "p.price DESC",
};

const UNITS = ["g", "kg", "ml", "l", "piece", "pack"];

function cleanProduct(body) {
    const name = String(body.name || "").trim();
    const categoryName = String(body.categoryName || "").trim();
    const price = Number(body.price);
    const stock = Number(body.stock ?? 0);
    const sizeValue =
        body.sizeValue === "" || body.sizeValue == null ? null : Number(body.sizeValue);
    const sizeUnit = sizeValue !== null && UNITS.includes(body.sizeUnit) ? body.sizeUnit : null;

    if (!name) return { error: "Product name is required" };
    if (!categoryName && !Number(body.categoryId)) return { error: "Please enter a category" };
    if (!(price >= 0)) return { error: "Price must be 0 or more" };
    if (!Number.isInteger(stock) || stock < 0) return { error: "Stock must be a whole number, 0 or more" };
    if (sizeValue !== null && !(sizeValue > 0)) return { error: "Size must be more than 0" };

    const inactive = [0, "0", false, "inactive"].includes(body.isActive);

    return {
        data: {
            name,
            categoryName,
            categoryId: Number(body.categoryId) || null,
            price,
            stock,
            sizeValue,
            sizeUnit,
            isActive: inactive ? 0 : 1,
            brand: String(body.brand || "").trim() || null,
            description: String(body.description || "").trim() || null,
            sku: String(body.sku || "").trim(),
            imageUrl: String(body.imageUrl || "").trim() || null,
        },
    };
}

// Find the category by name, or create it if it is new
async function resolveCategoryId(conn, data) {
    if (data.categoryName) {
        const [rows] = await conn.query(
            "SELECT category_id FROM categories WHERE category_name = ?",
            [data.categoryName]
        );
        if (rows.length) return rows[0].category_id;
        const [result] = await conn.query(
            "INSERT INTO categories (category_name) VALUES (?)",
            [data.categoryName]
        );
        return result.insertId;
    }
    return data.categoryId;
}

// PUBLIC: list active products (optional ?categoryId=3&brand=MDH&sort=price_asc)
router.get("/", async (req, res) => {
    try {
        const where = ["p.is_active = 1"];
        const params = [];
        if (req.query.categoryId) {
            where.push("p.category_id = ?");
            params.push(Number(req.query.categoryId));
        }
        if (req.query.brand) {
            where.push("p.brand = ?");
            params.push(req.query.brand);
        }
        const orderBy = SORTS[req.query.sort] || "p.product_id ASC";
        const [rows] = await pool.query(
            `${BASE_SELECT} WHERE ${where.join(" AND ")} ORDER BY ${orderBy}`,
            params
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Could not load products" });
    }
});

// ADMIN: list everything, including inactive products
router.get("/admin/list", async (req, res) => {
    try {
        const [rows] = await pool.query(`${BASE_SELECT} ORDER BY p.product_id DESC`);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Could not load products" });
    }
});

// PUBLIC: one product
router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ message: "Invalid product id" });
        }
        const [rows] = await pool.query(
            `${BASE_SELECT} WHERE p.product_id = ? AND p.is_active = 1`,
            [id]
        );
        if (rows.length === 0) return res.status(404).json({ message: "Product not found" });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Could not load product" });
    }
});

// ADMIN: add product
router.post("/admin", async (req, res) => {
    const { data, error } = cleanProduct(req.body);
    if (error) return res.status(400).json({ message: error });

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const categoryId = await resolveCategoryId(conn, data);
        const sku = data.sku || `SKU-${Date.now()}`;
        const [result] = await conn.query(
            `INSERT INTO products
        (category_id, product_name, brand, description, sku, size_value, size_unit, price, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [categoryId, data.name, data.brand, data.description, sku,
                data.sizeValue, data.sizeUnit, data.price, data.isActive]
        );
        const productId = result.insertId;
        await conn.query(
            "INSERT INTO inventory (product_id, quantity_available) VALUES (?, ?)",
            [productId, data.stock]
        );
        if (data.imageUrl) {
            await conn.query(
                "INSERT INTO product_images (product_id, image_url, alt_text, is_primary) VALUES (?, ?, ?, 1)",
                [productId, data.imageUrl, data.name]
            );
        }
        await conn.commit();
        res.status(201).json({ id: productId });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "That SKU already exists" });
        }
        res.status(500).json({ message: "Could not add product" });
    } finally {
        conn.release();
    }
});

// ADMIN: edit product
router.put("/admin/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ message: "Invalid product id" });
    }
    const { data, error } = cleanProduct(req.body);
    if (error) return res.status(400).json({ message: error });

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const categoryId = await resolveCategoryId(conn, data);
        const [result] = await conn.query(
            `UPDATE products SET category_id=?, product_name=?, brand=?, description=?,
         sku=COALESCE(NULLIF(?, ''), sku), size_value=?, size_unit=?, price=?, is_active=?
       WHERE product_id=?`,
            [categoryId, data.name, data.brand, data.description, data.sku,
                data.sizeValue, data.sizeUnit, data.price, data.isActive, id]
        );
        if (result.affectedRows === 0) {
            await conn.rollback();
            return res.status(404).json({ message: "Product not found" });
        }
        await conn.query(
            `INSERT INTO inventory (product_id, quantity_available) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE quantity_available = VALUES(quantity_available)`,
            [id, data.stock]
        );
        if (data.imageUrl) {
            const [upd] = await conn.query(
                "UPDATE product_images SET image_url=? WHERE product_id=? AND is_primary=1",
                [data.imageUrl, id]
            );
            if (upd.affectedRows === 0) {
                await conn.query(
                    "INSERT INTO product_images (product_id, image_url, alt_text, is_primary) VALUES (?, ?, ?, 1)",
                    [id, data.imageUrl, data.name]
                );
            }
        }
        await conn.commit();
        res.json({ message: "Updated" });
    } catch (err) {
        await conn.rollback();
        console.error(err);
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "That SKU already exists" });
        }
        res.status(500).json({ message: "Could not update product" });
    } finally {
        conn.release();
    }
});

// ADMIN: delete product
router.delete("/admin/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const [result] = await pool.query("DELETE FROM products WHERE product_id = ?", [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product deleted" });
    } catch (err) {
        console.error(err);
        if (err.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                message: "This product has stock history, so it can't be deleted. Set its status to Inactive instead.",
            });
        }
        res.status(500).json({ message: "Could not delete product" });
    }
});

export default router;