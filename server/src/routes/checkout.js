import express from "express";
import { authenticate } from "../middleware/auth.js";
import { createCheckout } from "../controllers/checkoutController.js";

const router = express.Router();

// POST /api/checkout: signed-in customers only
router.post("/", authenticate, createCheckout);

export default router;