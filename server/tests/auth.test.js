// @vitest-environment node
import { beforeAll, beforeEach, afterAll, describe, it, expect, vi } from "vitest";
import express from "express";
import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Mock only MySQL; use the real routes, controller, password hashing, and JWT code.
// Adjust these two paths if your server does not use a src folder.
vi.mock("../src/config/db.js", () => ({ default: { execute: vi.fn() } }));
import pool from "../src/config/db.js";
import authRoutes from "../src/routes/auth.js";

// A small test app avoids importing your normal app.listen() startup file.
const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

const testSecret = "auth-tests-only-not-a-production-secret";
let customer;

beforeAll(async () => {
  vi.stubEnv("JWT_SECRET", testSecret);
  customer = {
    user_id: 1,
    name: "Test Customer",
    email: "customer@example.com",
    phone: null,
    password_hash: await bcrypt.hash("Password123!", 12),
    role: "customer",
    account_status: "active",
  };
});

beforeEach(() => {
  pool.execute.mockReset();
});

afterAll(() => {
  vi.unstubAllEnvs();
});

describe("Registration API", () => {
  it("creates a customer and sends a hashed password to the database", async () => {
    pool.execute.mockResolvedValueOnce([{ insertId: 1 }, []]);

    const response = await request(app).post("/api/auth/register").send({
      name: "Test Customer",
      email: "customer@example.com",
      password: "Password123!",
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: 1, name: "Test Customer", email: "customer@example.com", phone: null, role: "customer",
    });
    expect(pool.execute).toHaveBeenCalledTimes(1);
    const parameters = pool.execute.mock.calls[0][1];
    expect(parameters.slice(0, 3)).toEqual(["Test Customer", "customer@example.com", null]);
    expect(parameters[3]).not.toBe("Password123!");
    expect(await bcrypt.compare("Password123!", parameters[3])).toBe(true);
    expect(response.body).not.toHaveProperty("password_hash");
  });

  it("rejects an email that is already registered", async () => {
    pool.execute.mockRejectedValueOnce({ code: "ER_DUP_ENTRY" });

    const response = await request(app).post("/api/auth/register").send({
      name: "Test Customer",
      email: "customer@example.com",
      password: "Password123!",
    });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ message: "Email is already registered" });
  });
});

describe("Login API", () => {
  it("accepts correct credentials and sets an HTTP-only authentication cookie", async () => {
    pool.execute.mockResolvedValueOnce([[customer], []]);

    const response = await request(app).post("/api/auth/login").send({
      email: "customer@example.com",
      password: "Password123!",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 1, name: "Test Customer", email: "customer@example.com", phone: null, role: "customer",
    });
    expect(pool.execute).toHaveBeenCalledWith(expect.any(String), ["customer@example.com"]);
    const cookie = response.headers["set-cookie"]?.find((value) => value.startsWith("token="));
    expect(cookie).toContain("HttpOnly");
    const token = decodeURIComponent(cookie.split(";")[0].slice("token=".length));
    expect(jwt.verify(token, testSecret)).toMatchObject({ sub: 1, role: "customer" });
    expect(response.body).not.toHaveProperty("password_hash");
  });

  it("rejects an incorrect password without issuing a cookie", async () => {
    pool.execute.mockResolvedValueOnce([[customer], []]);

    const response = await request(app).post("/api/auth/login").send({
      email: "customer@example.com",
      password: "WrongPassword!",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Incorrect email or password" });
    expect(response.headers["set-cookie"]).toBeUndefined();
  });
});
