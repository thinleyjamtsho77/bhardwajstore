import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

// Shared by login and logout: clearCookie only works if the options match
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
};

// Makes an unknown email take as long to reject as a wrong password
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

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

export async function login(req, res) {
  const { email, password, rememberMe } = req.body;

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  if (password.length > 72) {
    return res.status(401).json({ message: "Incorrect email or password" });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT user_id, name, email, phone, password_hash, role, account_status
       FROM users WHERE email = ?`,
      [email.trim().toLowerCase()]
    );
    const user = rows[0];

    const passwordOk = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
    if (!user || !passwordOk) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }
    if (user.account_status !== "active") {
      return res.status(403).json({ message: "This account is not active. Please contact the store." });
    }

    const token = jwt.sign(
      { sub: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: rememberMe ? "30d" : "1d" }
    );

    res.cookie("token", token, {
      ...cookieOptions,
      // Remember me = persistent cookie; otherwise it ends when the browser closes
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined,
    });

    res.json({
      id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (error) {
    console.error("Login failed:", error.code || error.message);
    res.status(500).json({ message: "Unable to sign in" });
  }
}

export async function me(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT user_id, name, email, phone, role, account_status
       FROM users WHERE user_id = ?`,
      [req.user.id]
    );
    const user = rows[0];

    // Re-check the database so blocked or deleted users lose access
    if (!user || user.account_status !== "active") {
      res.clearCookie("token", cookieOptions);
      return res.status(401).json({ message: "Session is no longer valid" });
    }

    res.json({
      id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (error) {
    console.error("Load current user failed:", error.code || error.message);
    res.status(500).json({ message: "Unable to load user" });
  }
}

export function logout(req, res) {
  res.clearCookie("token", cookieOptions);
  res.json({ message: "Logged out" });
}