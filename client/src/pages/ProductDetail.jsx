import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import { getProduct } from "../api/catalogApi";
import "../assets/styles/products.css";

const MAX_QTY = 99;

function availableStock(product) {
  const raw = product?.available ?? product?.stock;
  if (raw == null) return null;
  const available = Number(raw);
  return Number.isFinite(available) ? Math.max(0, Math.floor(available)) : null;
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, loading: authLoading } = useAuth();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const [cartStatus, setCartStatus] = useState({});
  const pendingProducts = useRef(new Set());

  function setProductStatus(productId, type, text) {
    setCartStatus((current) => ({ ...current, [productId]: { type, text } }));
  }

  function goToLogin() {
    navigate("/login", {
      state: { from: { pathname: location.pathname, search: location.search, hash: location.hash } },
    });
  }

  async function addToCart() {
    if (!product || authLoading) return;
    const productId = product.id ?? id;
    const available = availableStock(product);
    const limit = available === null ? MAX_QTY : Math.min(MAX_QTY, available);
    if (limit <= 0 || pendingProducts.current.has(productId)) return;
    if (!user) {
      goToLogin();
      return;
    }
    if (!Number.isInteger(qty) || qty < 1 || qty > limit) {
      setProductStatus(productId, "error", `Choose a quantity from 1 to ${limit}.`);
      return;
    }

    pendingProducts.current.add(productId);
    setProductStatus(productId, "info", "Adding…");
    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: qty }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        if (typeof setUser === "function") setUser(null);
        setProductStatus(productId, "error", "Please sign in again to add items to your cart.");
        goToLogin();
        return;
      }
      if (!response.ok) throw new Error(data?.message || "Could not add to cart.");
      setProductStatus(productId, "ok", "Added to cart");
    } catch (requestError) {
      setProductStatus(productId, "error", requestError?.message || "Could not add to cart. Please try again.");
    } finally {
      pendingProducts.current.delete(productId);
    }
  }

  useEffect(() => {
    let ignore = false;
    setProduct(null);
    setQty(1);
    setError("");
    getProduct(id)
      .then((data) => { if (!ignore) setProduct(data); })
      .catch((requestError) => { if (!ignore) setError(requestError.message); });
    return () => { ignore = true; };
  }, [id]);

  if (error) {
    return (
      <div className="detail-message">
        <p>{error}</p>
        <Link to="/products">Back to products</Link>
      </div>
    );
  }
  if (!product) return <p className="detail-message">Loading...</p>;

  const size = product.sizeValue ? `${Number(product.sizeValue)}${product.sizeUnit || ""}` : "";
  const available = availableStock(product);
  const outOfStock = available !== null && available <= 0;
  const maxQty = available === null ? MAX_QTY : Math.min(MAX_QTY, available);
  const status = cartStatus[product.id ?? id];
  const adding = status?.type === "info";

  return (
    <div className="detail">
      <div className="detail-image">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="no-image big">No image</div>
        )}
      </div>

      <div className="detail-info">
        <p className="breadcrumb">
          <Link to="/products">Products</Link> / {product.categoryName}
        </p>
        <h2>{product.name}</h2>
        {product.brand && <p className="muted">Brand: {product.brand}</p>}
        <h3>₹{Number(product.price)}{size && `/${size}`}</h3>
        <p>{product.description}</p>

        <p className={outOfStock ? "out" : available === null ? "muted" : "in-stock"}>
          {outOfStock ? "Out of stock" : available === null ? "Stock availability not provided" : `In stock (${available} available)`}
        </p>

        <p>Quantity</p>
        <div className="qty">
          <button type="button" aria-label="Decrease quantity" disabled={outOfStock || adding || qty <= 1} onClick={() => setQty((current) => Math.max(1, current - 1))}>-</button>
          <span aria-live="polite">{qty}</span>
          <button type="button" aria-label="Increase quantity" disabled={outOfStock || adding || qty >= maxQty} onClick={() => setQty((current) => Math.min(maxQty, current + 1))}>+</button>
        </div>

        <button type="button" className="primary" onClick={addToCart} disabled={outOfStock || adding || Boolean(authLoading)} aria-busy={adding} aria-describedby={status ? "detail-cart-status" : undefined}>
          {outOfStock ? "Out of stock" : adding ? "Adding…" : "Add to Cart"}
        </button>
        {status && (
          <p id="detail-cart-status" className={`product-cart-status product-cart-status--${status.type}`} role={status.type === "error" ? "alert" : "status"} style={{ fontSize: "13px", color: status.type === "error" ? "#c62828" : status.type === "ok" ? "#2e7d32" : "#555" }}>
            {status.text}
          </p>
        )}
      </div>
    </div>
  );
}
