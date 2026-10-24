import bcrypt from "bcrypt";
import pool from "../config/db.js";

export async function register(req, res) {
  const { name, email, phone, password } = req.body;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    (phone !== undefined && phone !== null && typeof phone !== "string")
  ) {
    return res.status(400).json({ message: "Invalid input" });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone ? phone.trim() : null;

  if (!cleanName || !cleanEmail || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }
  if (cleanName.length > 100) {
    return res.status(400).json({ message: "Name must be 100 characters or fewer" });
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

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await pool.execute(
      `INSERT INTO users (name, email, phone, password_hash)
       VALUES (?, ?, ?, ?)`,
      [cleanName, cleanEmail, cleanPhone, passwordHash]
    );

    res.status(201).json({
      id: result.insertId,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      role: "customer",
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email is already registered" });
    }
    console.error("Registration failed:", error.code);
    res.status(500).json({ message: "Unable to register" });
  }
}