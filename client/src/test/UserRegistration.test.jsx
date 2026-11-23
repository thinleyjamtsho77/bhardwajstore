// @vitest-environment jsdom
import React from "react";
import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, Routes, Route, useLocation } from "react-router";
import Register from "../pages/UserRegistration.jsx";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

// Observe the registration flag passed to the login page after success.
function LoginDestination() {
  const location = useLocation();
  return <h1>{location.state?.registered ? "Account created. Please log in." : "Login"}</h1>;
}

function renderRegistration() {
  render(
    <MemoryRouter initialEntries={["/register"]}>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<LoginDestination />} />
      </Routes>
    </MemoryRouter>
  );
}

async function fillForm(user, confirmation = "Password123!") {
  await user.type(screen.getByLabelText("Name", { exact: true }), "Test Customer");
  await user.type(screen.getByLabelText("Email"), "customer@example.com");
  await user.type(screen.getByLabelText("Password", { exact: true }), "Password123!");
  await user.type(screen.getByLabelText("Confirm Password", { exact: true }), confirmation);
  await user.click(screen.getByRole("checkbox", { name: /I accept Terms and Conditions/i }));
}

describe("User registration", () => {
  it("submits valid details and redirects to login with the registration flag", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, name: "Test Customer", email: "customer@example.com" }),
    });
    renderRegistration();

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Sign Up", exact: true }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Customer", email: "customer@example.com", password: "Password123!" }),
    });
    expect(
      await screen.findByRole("heading", { name: "Account created. Please log in." })
    ).toBeInTheDocument();
  });

  it("rejects mismatched passwords without contacting the server", async () => {
    const user = userEvent.setup();
    renderRegistration();

    await fillForm(user, "DifferentPassword!");
    await user.click(screen.getByRole("button", { name: "Sign Up", exact: true }));

    expect(await screen.findByRole("alert")).toHaveTextContent("The two passwords don’t match.");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
