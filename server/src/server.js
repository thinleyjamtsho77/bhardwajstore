import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


import healthRouter from "./routes/health.js";
import categoriesRouter from "./routes/categories.js";
import productsRouter from "./routes/product.js";
import authRouter from "./routes/auth.js";
import cartRouter from "./routes/cart.js";
import staffRouter from "./routes/staff.js";
import adminRouter from "./routes/admin.js";
import checkoutRouter from "./routes/checkout.js";
import { handleStripeWebhook } from "./controllers/stripeWebhook.js";

import checkoutRouter from "./routes/checkout.js";
import { handleStripeWebhook } from "./controllers/stripeWebhook.js";


const app = express();

app.post("/api/webhooks/stripe", express.raw({ type: "application/json" }), handleStripeWebhook);

app.use(express.json());

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use(cookieParser()); // must be before the routes
app.use("/api/catalog", catalogRouter);
app.use("/api/health", healthRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter);
app.use("/api/cart", cartRouter);
app.use("/api/admin/staff", staffRouter);
app.use("/api/admin", adminRouter);
app.use("/api/checkout", checkoutRouter);

const port = Number(process.env.PORT || 5000);

app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});