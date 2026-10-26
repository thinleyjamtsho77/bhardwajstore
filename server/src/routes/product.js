import express from "express";
import pool from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const rawCategoryId = req.query.categoryId;

  if (
    typeof rawCategoryId !== "string" ||
    !/^[1-9]\d*$/.test(rawCategoryId)
  ) {
    return res.status(400).json({
      message: "categoryId must be a positive integer",
    });
  }

  const categoryId = Number(rawCategoryId);

  if (!Number.isSafeInteger(categoryId)) {
    return res.status(400).json({ message: "Invalid categoryId" });
  }

  try {
    const [products] = await pool.execute(
      `SELECT
         p.product_id AS id,
         p.product_name AS name,
         p.category_id AS categoryId,
         p.price
       FROM products AS p
       JOIN categories AS c
         ON p.category_id = c.category_id
       WHERE p.category_id = ?
         AND p.is_active = 1
         AND c.is_active = 1
       ORDER BY p.product_id`,
      [categoryId]
    );

    res.json(products);
  } catch (error) {
    console.error("Failed to load products:", error.code);
    res.status(500).json({ message: "Unable to load products" });
  }
});

export default router;