// @vitest-environment jsdom
import React from "react";
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, Routes, Route } from "react-router";
import Login from "../pages/UserLogin.jsx";
import { useAuth } from "../context/AuthContext";

// using fake auth() function for controlled test
vi.mock("../context/AuthContext", () => ({ useAuth: vi.fn() }));

const fetchMock = vi.fn();
const setUser = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  setUser.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.mocked(useAuth).mockReturnValue({ setUser });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function renderLogin() {
  render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<Login afterLoginTo="/products" />} />
        <Route path="/products" element={<h1>Shopping page</h1>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("User login", () => {
  it("submits credentials, saves the user, and opens the shopping page", async () => {
    const user = userEvent.setup();
    const customer = { id: 1, name: "Test Customer", email: "customer@example.com", role: "customer" };
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => customer });
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "customer@example.com");
    await user.type(screen.getByLabelText("Password", { exact: true }), "Password123!");
    await user.click(screen.getByRole("button", { name: "Login", exact: true }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "customer@example.com", password: "Password123!", rememberMe: true }),
    });
    expect(await screen.findByRole("heading", { name: "Shopping page" })).toBeInTheDocument();
    expect(setUser).toHaveBeenCalledWith(customer);
  });

  it("shows the server error when the credentials are incorrect", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Incorrect email or password" }),
    });
    renderLogin();

    await user.type(screen.getByLabelText("Email"), "customer@example.com");
    await user.type(screen.getByLabelText("Password", { exact: true }), "WrongPassword!");
    await user.click(screen.getByRole("button", { name: "Login", exact: true }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Incorrect email or password");
    expect(setUser).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Login", exact: true })).toBeEnabled();
    expect(screen.queryByRole("heading", { name: "Shopping page" })).not.toBeInTheDocument();
  });
});
