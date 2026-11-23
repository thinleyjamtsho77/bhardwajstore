import express from "express";
import { authenticate } from "../middleware/auth.js";
import { placeOrder, emailOrder } from "../controllers/checkoutController.js";

const router = express.Router();

// Signed-in customers only
router.post("/", authenticate, placeOrder);
router.post("/:orderNumber/email", authenticate, emailOrder);

export default router;