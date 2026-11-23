// @vitest-environment jsdom

import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, useLocation } from "react-router";
import Home from "../pages/HomePage.jsx";


// Observe navigation without needing your application's other page components.
function CurrentPath() {
  const { pathname } = useLocation();
  return <output aria-label="Current path">{pathname}</output>;
}

// Function to start every test at the homepage route.
function renderHome() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Home />
      <CurrentPath />
    </MemoryRouter>
  );
}

const categories = [
  { name: "Spices", slug: "spices" },
  { name: "Cereals", slug: "cereals" },
  { name: "Flours", slug: "flours" },
  { name: "Oils & Ghee", slug: "oils-ghee" },
  { name: "Pulses & Lentils", slug: "pulses-lentils" },
  { name: "Dry Fruits & Nuts", slug: "dry-fruits-nuts" },
];

describe("HomePage", () => {
  it("introduces the store and its click-and-collect service", () => {
    renderHome();

    const hero = screen.getByRole("region", {
      name: "Wholesale Spices, Cereals & Others",
    });

    expect(
      within(hero).getByRole("heading", {
        level: 1,
        name: "Wholesale Spices, Cereals & Others",
      })
    ).toBeInTheDocument();

    expect(hero).toHaveTextContent(
      "Order quality Indian staples in bulk at fair prices and collect your order from Bhardwaj Grocery Store."
    );
  });

  it.each(["View Products", "View All Products"])(
    'navigates to /categories through "%s"',
    async (label) => {
      const user = userEvent.setup();
      renderHome();

      const link = screen.getByRole("link", { name: label, exact: true });
      expect(link).toHaveAttribute("href", "/categories");

      await user.click(link);

      expect(screen.getByLabelText("Current path")).toHaveTextContent(
        /^\/categories$/
      );
    }
  );

  it("shows six shopping categories", () => {
    renderHome();

    const section = screen.getByRole("region", { name: "Shop by Category" });
    expect(within(section).getAllByRole("listitem")).toHaveLength(6);
    expect(within(section).getAllByRole("link")).toHaveLength(6);
  });

  it.each(categories)(
    "navigates to the $name category",
    async ({ name, slug }) => {
      const user = userEvent.setup();
      renderHome();

      const section = screen.getByRole("region", { name: "Shop by Category" });
      const link = within(section).getByRole("link", { name, exact: true });
      const destination = `/categories/${slug}`;

      expect(link).toHaveAttribute("href", destination);

      await user.click(link);

      expect(screen.getByLabelText("Current path").textContent).toBe(destination);
    }
  );

  it("shows eight placeholder best sellers with their prices and cart buttons", () => {
    renderHome();

    const section = screen.getByRole("region", { name: "Best Selling Products" });
    const products = within(section).getAllByRole("listitem");

    expect(products).toHaveLength(8);

    for (const product of products) {
      expect(
        within(product).getByRole("heading", {
          level: 3,
          name: "Cumin seeds (Jeera)",
        })
      ).toBeInTheDocument();
      expect(within(product).getByText("₹40/100g")).toBeInTheDocument();
      expect(
        within(product).getByRole("button", { name: "Add to cart" })
      ).toBeEnabled();
    }
  });

  it.each([
    { label: "Next products", expectedLeft: 800 },
    { label: "Previous products", expectedLeft: -800 },
  ])(
    'requests a smooth carousel scroll through "$label"',
    async ({ label, expectedLeft }) => {
      const user = userEvent.setup();
      renderHome();

      const section = screen.getByRole("region", { name: "Best Selling Products" });
      const track = within(section).getByRole("list");
      const scrollBy = vi.fn();

      
      Object.defineProperty(track, "clientWidth", {
        configurable: true,
        value: 1000,
      });
      Object.defineProperty(track, "scrollBy", {
        configurable: true,
        value: scrollBy,
      });

      await user.click(within(section).getByRole("button", { name: label }));

      expect(scrollBy).toHaveBeenCalledTimes(1);
      expect(scrollBy).toHaveBeenCalledWith({
        left: expectedLeft,
        behavior: "smooth",
      });
    }
  );

  it("shows the wholesale deals placeholder", () => {
    renderHome();

    const section = screen.getByRole("region", { name: "Wholesale Deals" });
    expect(
      within(section).getByText("New bulk deals will appear here soon.")
    ).toBeInTheDocument();
  });

  it("explains the four click-and-collect steps in order", () => {
    renderHome();

    const section = screen.getByRole("region", {
      name: "How Click & Collect Works",
    });
    const steps = within(section).getAllByRole("listitem");
    const expectedSteps = [
      {
        title: "Browse Products Online",
        text: "Explore wholesale spices, cereals, flours, pulses, oils, and other dry grocery items online.",
      },
      {
        title: "Add to Cart & Pay",
        text: "Select the quantity you need, add items to your cart, and complete payment online.",
      },
      {
        title: "Receive Pickup Token",
        text: "After payment, get your order confirmation with a pickup token number and pickup time.",
      },
      {
        title: "Collect from Store",
        text: "Visit Bhardwaj Grocery Store and show your pickup token at the shopkeeper's counter.",
      },
    ];

    expect(steps).toHaveLength(4);
    expectedSteps.forEach(({ title, text }, index) => {
      expect(
        within(steps[index]).getByRole("heading", { level: 3, name: title })
      ).toBeInTheDocument();
      expect(steps[index]).toHaveTextContent(text);
    });
  });

  it("shows the three reasons to choose the store", () => {
    renderHome();

    const section = screen.getByRole("region", { name: "Why Choose Us?" });
    expect(within(section).getAllByRole("listitem")).toHaveLength(3);

    for (const benefit of ["Wholesale Price", "Bulk Ordering", "Authentic Quality"]) {
      expect(within(section).getByText(benefit)).toBeInTheDocument();
    }
  });
});
