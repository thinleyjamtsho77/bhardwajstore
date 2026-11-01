import express from "express";
import pool from "../config/db.js"; 

const router = express.Router();

// GET /api/products                 -> all active products
// GET /api/products?categoryId=1    -> active products in one category
router.get("/", async (req, res) => {
  const rawCategoryId = req.query.categoryId;
  const params = [];
  let where = "p.is_active = 1 AND c.is_active = 1";

  if (rawCategoryId !== undefined) {
    if (typeof rawCategoryId !== "string" || !/^[1-9]\d*$/.test(rawCategoryId)) {
      return res.status(400).json({ message: "categoryId must be a positive integer" });
    }
    const categoryId = Number(rawCategoryId);
    if (!Number.isSafeInteger(categoryId)) {
      return res.status(400).json({ message: "Invalid categoryId" });
    }
    where += " AND p.category_id = ?";
    params.push(categoryId);
  }

  try {
    const [rows] = await pool.execute(
      `SELECT
         p.product_id AS id,
         p.product_name AS name,
         p.category_id AS categoryId,
         p.price,
         p.size_value,
         p.size_unit,
         (SELECT pi.image_url
            FROM product_images pi
            WHERE pi.product_id = p.product_id
            ORDER BY pi.is_primary DESC, pi.display_order, pi.image_id
            LIMIT 1) AS image,
         (inv.quantity_available - inv.reserved_quantity) AS available
       FROM products AS p
       JOIN categories AS c ON p.category_id = c.category_id
       LEFT JOIN inventory AS inv ON inv.product_id = p.product_id
       WHERE ${where}
       ORDER BY p.product_id`,
      params
    );

    res.json(
      rows.map(({ size_value, size_unit, available, ...p }) => ({
        ...p,
        size: size_value ? `${Number(size_value)} ${size_unit}` : null,
        available: available == null ? null : Number(available),
      }))
    );
  } catch (error) {
    console.error("Failed to load products:", error.code);
    res.status(500).json({ message: "Unable to load products" });
  }
});

export default router;