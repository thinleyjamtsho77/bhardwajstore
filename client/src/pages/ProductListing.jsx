import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import { getCategories, getProducts } from "../api/catalogApi";
import "../assets/styles/products.css";

export default function ProductListing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, loading: authLoading } = useAuth();

  // The filters live in the URL, so a link like /products?categoryId=3 opens that category
  const [searchParams, setSearchParams] = useSearchParams();
  const rawCategoryId = searchParams.get("categoryId") ?? "";
  const categoryId = /^[1-9]\d*$/.test(rawCategoryId) ? rawCategoryId : ""; // ignore junk values
  const brand = searchParams.get("brand") ?? "";
  const sort = searchParams.get("sort") ?? "";

  function updateParams(changes) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      for (const [key, value] of Object.entries(changes)) {
        if (value) next.set(key, String(value));
        else next.delete(key);
      }
      return next;
    });
  }

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [cartStatus, setCartStatus] = useState({});
  const pendingProducts = useRef(new Set());

  function setProductStatus(id, type, text) {
    setCartStatus((current) => ({ ...current, [id]: { type, text } }));
  }

  function goToLogin() {
    navigate("/login", {
      state: {
        from: {
          pathname: location.pathname,
          search: location.search,
          hash: location.hash,
        },
      },
    });
  }

  function isOutOfStock(product) {
    // The catalog uses stock; the products API can also provide available stock.
    const available = product.available ?? product.stock;
    return available != null && Number.isFinite(Number(available)) && Number(available) <= 0;
  }

  async function addToCart(product) {
    if (authLoading || isOutOfStock(product) || pendingProducts.current.has(product.id)) return;
    if (!user) {
      goToLogin();
      return;
    }

    pendingProducts.current.add(product.id);
    setProductStatus(product.id, "info", "Adding…");
    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        if (typeof setUser === "function") setUser(null);
        setProductStatus(product.id, "error", "Please sign in again to add items to your cart.");
        goToLogin();
        return;
      }
      if (!response.ok) throw new Error(data?.message || "Could not add to cart.");
      setProductStatus(product.id, "ok", "Added to cart");
    } catch (requestError) {
      setProductStatus(product.id, "error", requestError?.message || "Could not add to cart. Please try again.");
    } finally {
      pendingProducts.current.delete(product.id);
    }
  }

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setError("Could not load categories."));
  }, []);

  useEffect(() => {
    let ignore = false; // a slow response must not overwrite a newer one
    setLoading(true);

    getProducts({ categoryId, brand, sort })
      .then((rows) => {
        if (ignore) return;
        setProducts(rows);
        setError("");
        if (!brand) setBrands([...new Set(rows.map((p) => p.brand).filter(Boolean))]);
      })
      .catch(() => {
        if (!ignore) setError("Could not load products.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [categoryId, brand, sort]);

  const title = categories.find((c) => String(c.id) === String(categoryId))?.name || "All Products";

  // A brand that arrives from the URL must still appear in the dropdown
  const brandOptions = brand && !brands.includes(brand) ? [brand, ...brands] : brands;

  return (
    <div className="listing">
      <aside className="sidebar">
        <h3>Categories</h3>
        <button className={!categoryId ? "active" : ""} onClick={() => updateParams({ categoryId: "", brand: "" })}>
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={String(categoryId) === String(c.id) ? "active" : ""}
            onClick={() => updateParams({ categoryId: c.id, brand: "" })}
          >
            {c.name}
          </button>
        ))}
      </aside>

      <main className="listing-main">
        <div className="listing-top">
          <h2>{title}</h2>
          <div className="listing-controls">
            <select value={brand} onChange={(e) => updateParams({ brand: e.target.value })}>
              <option value="">All brands</option>
              {brandOptions.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <select value={sort} onChange={(e) => updateParams({ sort: e.target.value })}>
              <option value="">Sort product by</option>
              <option value="brand">Brand</option>
              <option value="price_asc">Price: Min to Max</option>
              <option value="price_desc">Price: Max to Min</option>
            </select>
          </div>
        </div>

        {error && <p className="error">{error}</p>}
        {loading && <p>Loading...</p>}
        {!loading && !error && products.length === 0 && <p>No products found.</p>}

        <div className="grid">
          {products.map((p) => {
            const outOfStock = isOutOfStock(p);
            const status = cartStatus[p.id];
            const adding = status?.type === "info";
            return (
            <div className="card" key={p.id}>
              <Link to={`/products/${p.id}`}>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} />
                ) : (
                  <div className="no-image">No image</div>
                )}
                <p className="card-name">{p.name}</p>
              </Link>
              <p className="card-price">
                ₹{Number(p.price)}
                {p.sizeValue ? `/${Number(p.sizeValue)}${p.sizeUnit || ""}` : ""}
              </p>
              {outOfStock && <p className="out">Out of stock</p>}
              <button
                type="button"
                onClick={() => addToCart(p)}
                disabled={outOfStock || adding || Boolean(authLoading)}
                aria-busy={adding}
                aria-describedby={status ? `product-cart-status-${p.id}` : undefined}
              >
                {outOfStock ? "Out of stock" : adding ? "Adding…" : "Add to Cart"}
              </button>
              {status && (
                <p
                  id={`product-cart-status-${p.id}`}
                  className={`product-cart-status product-cart-status--${status.type}`}
                  role={status.type === "error" ? "alert" : "status"}
                  style={{ fontSize: "13px", color: status.type === "error" ? "#c62828" : status.type === "ok" ? "#2e7d32" : "#555" }}
                >
                  {status.text}
                </p>
              )}
            </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
