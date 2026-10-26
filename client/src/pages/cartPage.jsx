import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import "../assets/styles/index.css";
import "../assets/styles/cart.css";

// Placeholder items until the cart API exists.
// Images live in client/public/images/products/ and are referenced by URL.
const INITIAL_ITEMS = [
  { id: 1, name: "Basmati Rice", size: "25 kg bag", unitPrice: 1850, qty: 1, image: "/images/products/basmati-rice.png" },
  { id: 2, name: "Garam Masala", size: "1 kg pack", unitPrice: 300, qty: 2, image: "/images/products/garam-masala.png" },
  { id: 3, name: "Chickpeas", size: "500 g pack", unitPrice: 150, qty: 1, image: "/images/products/chickpeas.png" },
  { id: 4, name: "Brown Sugar", size: "1 kg bag", unitPrice: 100, qty: 4, image: "/images/products/brown-sugar.png" },
  { id: 5, name: "Organic Lentils", size: "1 kg pack", unitPrice: 225, qty: 2, image: "/images/products/lentils.png" },
];

const GST_RATE = 0; // set to e.g. 0.05 when GST applies
const MAX_QTY = 99;

const money = (n) =>
  "₹ " + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [promo, setPromo] = useState("");
  const [promoNotice, setPromoNotice] = useState(null);

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
    const discount = 0; // applied once promo codes are supported by the server
    const gst = (subtotal - discount) * GST_RATE;
    return { subtotal, discount, gst, total: subtotal - discount + gst };
  }, [items]);

  function changeQty(id, delta) {
    setItems((list) =>
      list.map((i) =>
        i.id === id ? { ...i, qty: Math.min(MAX_QTY, Math.max(1, i.qty + delta)) } : i
      )
    );
  }

  function removeItem(id) {
    setItems((list) => list.filter((i) => i.id !== id));
  }

  function applyPromo(event) {
    event.preventDefault();
    if (!promo.trim()) {
      setPromoNotice({ type: "error", text: "Enter a promo code." });
      return;
    }
    setPromoNotice({ type: "info", text: "Promo codes aren't available yet." });
  }

  return (
    <main className="cart-page">
      <nav className="cart-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Cart</span>
      </nav>

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

            <ul className="cart-list">
              {items.map((item) => (
                <li key={item.id} className="cart-item">
                  <img className="cart-item__img" src={item.image} alt="" />

                  <div className="cart-item__info">
                    <h2>{item.name}</h2>
                    <p>{item.size}</p>
                  </div>

                  <div className="cart-qty" role="group" aria-label={`Quantity for ${item.name}`}>
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${item.name}`}
                      onClick={() => changeQty(item.id, -1)}
                      disabled={item.qty <= 1}
                    >
                      −
                    </button>
                    <output aria-live="polite">{item.qty}</output>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${item.name}`}
                      onClick={() => changeQty(item.id, 1)}
                      disabled={item.qty >= MAX_QTY}
                    >
                      +
                    </button>
                  </div>

                  <p className="cart-item__price">{money(item.unitPrice * item.qty)}</p>

                  <button
                    type="button"
                    className="cart-item__remove"
                    aria-label={`Remove ${item.name} from cart`}
                    onClick={() => removeItem(item.id)}
                  >
                    <TrashIcon />
                  </button>
                </li>
              ))}
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
