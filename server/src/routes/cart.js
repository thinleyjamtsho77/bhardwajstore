import express from "express";
import { getCart, addItem, updateItem, removeItem } from "../controllers/cartController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Every cart route needs a signed-in user
router.use(authenticate);

router.get("/", getCart);
router.post("/items", addItem);
router.patch("/items/:productId", updateItem);
router.delete("/items/:productId", removeItem);

export default router;