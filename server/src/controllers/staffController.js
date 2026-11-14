import bcrypt from "bcrypt";
import pool from "../config/db.js";

// "Staff accounts" are users whose role is staff or admin. Customers are never touched here.
const STAFF_ROLES = ["staff", "admin"];
const STATUSES = ["active", "inactive", "blocked"];

function parseId(value) {
  const s = String(value);
  if (!/^[1-9]\d*$/.test(s)) return null;
  const n = Number(s);
  return Number.isSafeInteger(n) ? n : null;
}

const toStaff = (r) => ({
  id: r.user_id,
  name: r.name,
  email: r.email,
  phone: r.phone,
  role: r.role,
  accountStatus: r.account_status,
  createdAt: r.created_at,
});

async function findStaffById(id) {
  const [rows] = await pool.execute(
    `SELECT user_id, name, email, phone, role, account_status, created_at
     FROM users WHERE user_id = ? AND role IN ('staff', 'admin')`,
    [id]
  );
  return rows[0] ?? null;
}

export async function listStaff(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT user_id, name, email, phone, role, account_status, created_at
       FROM users
       WHERE role IN ('staff', 'admin')
       ORDER BY FIELD(role, 'admin', 'staff'), name`
    );
    res.json(rows.map(toStaff));
  } catch (error) {
    console.error("List staff failed:", error.code || error.message);
    res.status(500).json({ message: "Unable to load staff" });
  }
}

export async function createStaff(req, res) {
  const { name, email, phone, password, role = "staff" } = req.body ?? {};

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof role !== "string" ||
    (phone !== undefined && phone !== null && typeof phone !== "string")
  ) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone ? phone.trim() : null;

  if (!cleanName || cleanName.length > 100) {
    return res.status(400).json({ message: "Name must be 1 to 100 characters" });
  }
  if (cleanEmail.length > 100 || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
    return res.status(400).json({ message: "Invalid email address" });
  }
  if (cleanPhone && !/^\+?[0-9\s-]{6,20}$/.test(cleanPhone)) {
    return res.status(400).json({ message: "Invalid phone number" });
  }
  if (password.length < 8 || password.length > 72) {
    return res.status(400).json({ message: "Password must be 8 to 72 characters" });
  }
  if (!STAFF_ROLES.includes(role)) {
    return res.status(400).json({ message: "Role must be staff or admin" });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, phone, password_hash, role, account_status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [cleanName, cleanEmail, cleanPhone, passwordHash, role]
    );

    res.status(201).json({
      id: result.insertId,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      role,
      accountStatus: "active",
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email is already registered" });
    }
    console.error("Create staff failed:", error.code || error.message);
    res.status(500).json({ message: "Unable to create staff account" });
  }
}

export async function updateStaff(req, res) {
  const id = parseId(req.params.id);
  const { role, accountStatus } = req.body ?? {};

  if (!id) return res.status(400).json({ message: "Invalid staff id" });
  if (role === undefined && accountStatus === undefined) {
    return res.status(400).json({ message: "Nothing to update" });
  }
  if (role !== undefined && !STAFF_ROLES.includes(role)) {
    return res.status(400).json({ message: "Role must be staff or admin" });
  }
  if (accountStatus !== undefined && !STATUSES.includes(accountStatus)) {
    return res.status(400).json({ message: "Invalid account status" });
  }

  // Admins can't change themselves, so at least one active admin always remains
  if (id === req.user.id) {
    return res.status(400).json({ message: "You can't change your own role or status" });
  }

  try {
    if (!(await findStaffById(id))) {
      return res.status(404).json({ message: "Staff account not found" });
    }

    await pool.execute(
      `UPDATE users
       SET role = COALESCE(?, role),
           account_status = COALESCE(?, account_status)
       WHERE user_id = ?`,
      [role ?? null, accountStatus ?? null, id]
    );

    res.json(toStaff(await findStaffById(id)));
  } catch (error) {
    console.error("Update staff failed:", error.code || error.message);
    res.status(500).json({ message: "Unable to update staff account" });
  }
}

export async function deleteStaff(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: "Invalid staff id" });

  if (id === req.user.id) {
    return res.status(400).json({ message: "You can't delete your own account" });
  }

  try {
    if (!(await findStaffById(id))) {
      return res.status(404).json({ message: "Staff account not found" });
    }

    await pool.execute(
      "DELETE FROM users WHERE user_id = ? AND role IN ('staff', 'admin')",
      [id]
    );
    res.json({ message: "Staff account deleted" });
  } catch (error) {
    // orders.user_id is ON DELETE RESTRICT, so accounts with orders can't be removed
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        message: "This account has order history and can't be deleted. Set it to inactive instead.",
      });
    }
    console.error("Delete staff failed:", error.code || error.message);
    res.status(500).json({ message: "Unable to delete staff account" });
  }
}