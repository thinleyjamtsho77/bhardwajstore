import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

// TEMPORARY page for testing the cart.

const money = (value) =>
  "₹ " + Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const styles = `
.tmp-products { max-width: 1200px; margin: 0 auto; padding: 24px 48px 64px; font-family: Roboto, "Segoe UI", Arial, sans-serif; }
.tmp-products__top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.tmp-products__top h1 { margin: 0; font-size: 28px; }
.tmp-products__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; list-style: none; margin: 0; padding: 0; }
.tmp-card { display: flex; flex-direction: column; gap: 6px; padding: 12px; border: 1px solid #ddd; border-radius: 8px; background: #fff; }
.tmp-card img, .tmp-card__noimg { width: 100%; aspect-ratio: 1; object-fit: contain; background: #f5f5f5; border-radius: 4px; }
.tmp-card h2 { margin: 6px 0 0; font-size: 15px; font-weight: 500; }
.tmp-card p { margin: 0; font-size: 13px; color: #555; }
.tmp-card button { margin-top: auto; padding: 8px; border: 0; border-radius: 4px; background: #2e7d32; color: #fff; cursor: pointer; }
.tmp-card button:disabled { background: #999; cursor: not-allowed; }
.tmp-card__status { min-height: 1.2em; font-size: 12px; }
.tmp-card__status--ok { color: #2e7d32; }
.tmp-card__status--error { color: #c62828; }
@media (max-width: 640px) { .tmp-products { padding: 16px; } }
`;

export default function AllProducts() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState({}); // productId -> { type, text }

  useEffect(() => {
    let ignore = false;

    fetch("/api/products")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Unable to load products."))))
      .then((data) => {
        if (!ignore) setProducts(data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  function setProductStatus(id, type, text) {
    setStatus((s) => ({ ...s, [id]: { type, text } }));
  }

  async function addToCart(product) {
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/all-products" } } });
      return;
    }

    setProductStatus(product.id, "info", "Adding…");
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Could not add to cart.");
      setProductStatus(product.id, "ok", "Added to cart");
    } catch (err) {
      setProductStatus(product.id, "error", err.message);
    }
  }

  return (
    <main className="tmp-products">
      <style>{styles}</style>

      <div className="tmp-products__top">
        <h1>All products (temporary)</h1>
        <Link to="/cart">Go to cart</Link>
      </div>

      {loading && <p role="status">Loading products…</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && products.length === 0 && <p>No products found.</p>}

      <ul className="tmp-products__grid">
        {products.map((p) => {
          const outOfStock = p.available !== null && p.available <= 0;
          const s = status[p.id];
          return (
            <li key={p.id} className="tmp-card">
              {p.image ? <img src={p.image} alt="" loading="lazy" /> : <div className="tmp-card__noimg" aria-hidden="true" />}
              <h2>{p.name}</h2>
              {p.size && <p>{p.size}</p>}
              <p><strong>{money(p.price)}</strong></p>
              <button type="button" onClick={() => addToCart(p)} disabled={outOfStock}>
                {outOfStock ? "Out of stock" : "Add to cart"}
              </button>
              <span className={`tmp-card__status tmp-card__status--${s?.type ?? ""}`} role="status">
                {s?.text}
              </span>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
