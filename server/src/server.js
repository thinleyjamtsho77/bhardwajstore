import "dotenv/config";
import express from "express";
import cors from "cors";

import healthRouter from "./routes/health.js";
import categoriesRouter from "./routes/categories.js";
import productsRouter from "./routes/product.js";
import authRouter from "./routes/auth.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter);

const port = Number(process.env.PORT || 5000);

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});