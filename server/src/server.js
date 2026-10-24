require("dotenv").config();

<<<<<<< Updated upstream
const express = require("express");
const mysql = require("mysql2/promise");
=======
import healthRouter from "./routes/health.js";
import categoriesRouter from "./routes/categories.js";
import productsRouter from "./routes/product.js";
import authRouter from "./routes/auth.js";
>>>>>>> Stashed changes

const app = express();
app.use(express.json());

<<<<<<< Updated upstream
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5,
});
=======
app.use("/api/health", healthRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter);
>>>>>>> Stashed changes

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Database health check failed:", error.code);
    res.status(503).json({ status: "error" });
  }
});
app.get("/api/categories", async (req, res) => {
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
    res.status(500).json({
      message: "Unable to load categories",
    });
  }
});
app.get("/api/products", async (req, res) => {
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
    return res.status(400).json({
      message: "Invalid categoryId",
    });
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
    res.status(500).json({
      message: "Unable to load products",
    });
  }
});
const port = Number(process.env.PORT || 5000);

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
  });