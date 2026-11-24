
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";

const MAX_QTY = 99;

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, loading: authLoading } = useAuth();

  const [adding, setAdding] = useState(false);

  const price = Number(product.price);
  const available =
    product.available == null ? null : Number(product.available);

  const outOfStock = available !== null && available <= 0;

  const stockLabel =
    available === null
      ? "Stock unavailable"
      : available > 0
        ? "In Stock"
        : "Out of Stock";

  async function addToCart() {
    if (!product || authLoading || adding || outOfStock) return;

    if (!user) {
      navigate("/login", {
        state: {
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
        },
      });
      return;
    }

    setAdding(true);

    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        if (typeof setUser === "function") setUser(null);

        navigate("/login", {
          state: {
            from: {
              pathname: location.pathname,
              search: location.search,
              hash: location.hash,
            },
          },
        });
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Could not add to cart.");
      }

    } catch (error) {
      console.error("Could not add to cart:", error);
    } finally {
      setAdding(false);
    }
  }

  return (
    <article className="product-card">
      <Link
        to={`/products/${product.id}`}
        className="product-card-link"
        aria-label={`View details for ${product.name}`}
      >
        <div className="product-image-placeholder">
          Product Image
        </div>

        <div className="product-info">
          <strong>{product.name}</strong>
          <strong>
            ${Number.isFinite(price) ? price.toFixed(2) : "—"}
          </strong>
        </div>

        <span
          className={
            available === null
              ? "stock-label unavailable"
              : outOfStock
                ? "stock-label out-of-stock"
                : "stock-label"
          }
        >
          {stockLabel}
        </span>
      </Link>

      <div className="product-actions">
        <button
          type="button"
          className="wishlist-button"
          title="Add to Wishlist"
          aria-label={`Add ${product.name} to wishlist`}
        >
          ♡
        </button>

        <button
          type="button"
          className="add-cart-button"
          onClick={addToCart}
          disabled={adding || authLoading || outOfStock}
        >
          {outOfStock
            ? "Out of Stock"
            : adding
              ? "Adding..."
              : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}
