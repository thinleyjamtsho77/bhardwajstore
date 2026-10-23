import express from "express";
import pool from "../config/db.js";


const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [categories] = await pool.query(`
      SELECT
        category_id AS id,
        category_name AS name
      FROM categories
      WHERE is_active = 1
      ORDER BY category_id
    `);

    res.json(categories);
  } catch (error) {
    console.error("Failed to load categories:", error.code);
    res.status(500).json({ message: "Unable to load categories" });
  }
});

export default router;