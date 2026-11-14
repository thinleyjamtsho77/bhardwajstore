import express from "express";
import pool from "../config/db.js";
import { authenticate } from "../middleware/auth.js";
import { listStaff, createStaff, updateStaff, deleteStaff } from "../controllers/staffController.js";

const router = express.Router();

// The login cookie carries the role from when it was issued, so a demoted or deleted
// admin could keep a valid token. For this sensitive area, check the database every time.
async function requireActiveAdmin(req, res, next) {
  try {
    const [rows] = await pool.execute(
      "SELECT role, account_status FROM users WHERE user_id = ?",
      [req.user.id]
    );
    const user = rows[0];

    if (!user || user.account_status !== "active" || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (error) {
    console.error("Admin check failed:", error.code || error.message);
    res.status(500).json({ message: "Unable to verify access" });
  }
}

router.use(authenticate, requireActiveAdmin);

router.get("/", listStaff);
router.post("/", createStaff);
router.patch("/:id", updateStaff);
router.delete("/:id", deleteStaff);

export default router;