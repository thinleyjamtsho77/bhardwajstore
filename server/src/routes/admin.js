import express from "express";
import { authenticate, requireRole } from "../middleware/auth.js";
import { getDashboard } from "../controllers/dashboardController.js";

const router = express.Router();

// GET /api/admin/dashboard: staff and admins only
router.get("/dashboard", authenticate, requireRole("staff", "admin"), getDashboard);

export default router;
