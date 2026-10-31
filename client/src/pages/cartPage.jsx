import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import "../assets/styles/index.css";
import "../assets/styles/cart.css";

const MAX_QTY = 99;

const money = (n) =>
  n.toLocaleString("en-IN", { style: "currency", currency: "INR" });

// Calls the Express API and returns parsed JSON. Throws Error with a readable message.
async function api(path, options = {}) {
  let res;
  try {
    res = await fetch(`/api/cart${path}`, {
      ...options,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    throw new Error("Could not reach the server. Please try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
         strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16M9 7V4.5h6V7M6 7l1 13h10l1-13M10 11v6M14 11v6" />
    </svg>
  );
}

export default function Cart() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [cart, setCart] = useState(null); // null until the first load finishes
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null); // productId currently being changed
  const [promo, setPromo] = useState("");
  const [promoNotice, setPromoNotice] = useState(null);

  // Load the cart once we know who is signed in
  useEffect(() => {
    if (authLoading || !user) return;
    let ignore = false;

    api("")
      .then((data) => {
        if (!ignore) setCart(data);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });

    return () => {
      ignore = true;
    };
  }, [authLoading, user]);

  const change = useCallback(async (productId, request) => {
    setError("");
    setBusyId(productId);
    try {
      setCart(await request());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }, []);

  const changeQty = (item, delta) => {
    const quantity = Math.min(MAX_QTY, Math.max(1, item.quantity + delta));
    if (quantity === item.quantity) return;
    change(item.productId, () =>
      api(`/items/${item.productId}`, { method: "PATCH", body: JSON.stringify({ quantity }) })
    );
  };

  const removeItem = (item) =>
    change(item.productId, () => api(`/items/${item.productId}`, { method: "DELETE" }));

  function applyPromo(event) {
    event.preventDefault();
    if (!promo.trim()) {
      setPromoNotice({ type: "error", text: "Enter a promo code." });
      return;
    }
    setPromoNotice({ type: "info", text: "Promo codes aren't available yet." });
  }

  const breadcrumb = (
    <nav className="cart-breadcrumb" aria-label="Breadcrumb">
      <Link to="/">Home</Link>
      <span aria-hidden="true">›</span>
      <span aria-current="page">Cart</span>
    </nav>
  );

  // Waiting for /me or for the first cart response
  if (authLoading || (user && !cart && !error)) {
    return (
      <main className="cart-page">
        {breadcrumb}
        <p className="cart-empty" role="status">Loading your cart…</p>
      </main>
    );
  }

  // Carts belong to accounts, so guests are asked to sign in
  if (!user) {
    return (
      <main className="cart-page">
        {breadcrumb}
        <section className="cart-empty">
          <h1>Sign in to view your cart</h1>
          <p>Your cart is saved to your account.</p>
          <Link to="/login" state={{ from: { pathname: "/cart" } }} className="cart-btn">
            Log in
          </Link>
        </section>
      </main>
    );
  }

  // First load failed
  if (!cart) {
    return (
      <main className="cart-page">
        {breadcrumb}
        <section className="cart-empty">
          <h1>We couldn’t load your cart</h1>
          <p role="alert">{error}</p>
          <button type="button" className="cart-btn" onClick={() => window.location.reload()}>
            Try again
          </button>
        </section>
      </main>
    );
  }
  const { items = [], itemCount = 0, totals } = cart ?? {};

  return (
    <main className="cart-page">
      {breadcrumb}

      {items.length === 0 ? (
        <section className="cart-empty">
          <h1>Your cart is empty</h1>
          <p>Add some spices, cereals or pulses to get started.</p>
          <Link to="/categories" className="cart-btn">Browse products</Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-card" aria-labelledby="cart-title">
            <h1 id="cart-title" className="cart-title">
              Cart <span>({itemCount} {itemCount === 1 ? "item" : "items"})</span>
            </h1>

            {error && <p className="cart-notice cart-notice--error" role="alert">{error}</p>}

            <ul className="cart-list">
              {items.map((item) => {
                const busy = busyId === item.productId;
                const maxQty = Math.min(MAX_QTY, item.available ?? MAX_QTY);
                return (
                  <li key={item.productId} className="cart-item" aria-busy={busy}>
                    {item.image ? (
                      <img className="cart-item__img" src={item.image} alt="" />
                    ) : (
                      <div className="cart-item__img" aria-hidden="true" />
                    )}

                    <div className="cart-item__info">
                      <h2>{item.name}</h2>
                      {item.size && <p>{item.size}</p>}
                    </div>

                    <div className="cart-qty" role="group" aria-label={`Quantity for ${item.name}`}>
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${item.name}`}
                        onClick={() => changeQty(item, -1)}
                        disabled={busy || item.quantity <= 1}
                      >
                        −
                      </button>
                      <output aria-live="polite">{item.quantity}</output>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${item.name}`}
                        onClick={() => changeQty(item, 1)}
                        disabled={busy || item.quantity >= maxQty}
                      >
                        +
                      </button>
                    </div>

                    <p className="cart-item__price">{money(item.lineTotal)}</p>

                    <button
                      type="button"
                      className="cart-item__remove"
                      aria-label={`Remove ${item.name} from cart`}
                      onClick={() => removeItem(item)}
                      disabled={busy}
                    >
                      <TrashIcon />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <aside className="cart-card cart-summary" aria-labelledby="summary-title">
            <h2 id="summary-title" className="cart-summary__title">Order Summary</h2>

            <form className="cart-promo" onSubmit={applyPromo}>
              <label htmlFor="promo" className="visually-hidden">Promo code</label>
              <input
                id="promo"
                type="text"
                placeholder="Enter promo code here.."
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                autoComplete="off"
              />
              <button type="submit">Apply</button>
            </form>
            {promoNotice && (
              <p className={`cart-notice cart-notice--${promoNotice.type}`} role="status">
                {promoNotice.text}
              </p>
            )}

            <dl className="cart-totals">
              <div><dt>Subtotal</dt><dd>{money(totals.subtotal)}</dd></div>
              <div><dt>Discount</dt><dd>{money(totals.discount)}</dd></div>
              <div><dt>GST</dt><dd>{money(totals.gst)}</dd></div>
              <div className="cart-totals__total"><dt>Total</dt><dd>{money(totals.total)}</dd></div>
            </dl>

            <button type="button" className="cart-checkout" onClick={() => navigate("/checkout")}>
              Continue to checkout
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}
