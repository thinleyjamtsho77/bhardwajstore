import express from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

// Mounted at /api/admin/categories: staff and admins only
router.use(authenticate, requireRole("staff", "admin"));

router.get("/", listCategories);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;