import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import "../assets/styles/index.css";
import "../assets/styles/checkout.css";

const money = (n) =>
  "₹ " + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Only cards work for now. The others are shown as in the design but can't be chosen yet.
const PAYMENT_METHODS = [
  { id: "gpay", label: "Google Pay", enabled: false },
  { id: "apple", label: "Apple Pay", enabled: false },
  { id: "card", label: "Credit / Debit Card", enabled: true },
  { id: "upi", label: "UPI", enabled: false },
  { id: "phonepe", label: "PhonePe", enabled: false },
];

const digitsOnly = (value) => value.replace(/\D/g, "");
const formatCardNumber = (value) => digitsOnly(value).slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
const formatExpiry = (value) => {
  const d = digitsOnly(value).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

function isExpired(expiry) {
  const [mm, yy] = expiry.split("/").map(Number);
  // A card is valid through the end of its expiry month
  return new Date() >= new Date(2000 + yy, mm, 1);
}

// Calls the Express API. Throws an Error (with .status) carrying the server's message.
async function request(url, options = {}) {
  let res;
  try {
    res = await fetch(url, { ...options, headers: { "Content-Type": "application/json" } });
  } catch {
    throw new Error("Could not reach the server. Please try again.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw Object.assign(new Error(data.message || `Request failed (HTTP ${res.status}).`), { status: res.status });
  }
  return data;
}

/* ---------- Order Confirmed modal ---------- */

function OrderConfirmedModal({ order, onDone }) {
  const dialogRef = useRef(null);
  const [mail, setMail] = useState({ state: "idle", text: "", previewUrl: null });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  async function sendEmail() {
    setMail({ state: "sending", text: "", previewUrl: null });
    try {
      const result = await request(`/api/checkout/${order.orderNumber}/email`, { method: "POST" });
      setMail({ state: "sent", text: `Details sent to ${result.sentTo}.`, previewUrl: result.previewUrl });
    } catch (err) {
      setMail({ state: "error", text: err.message, previewUrl: null });
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="checkout-modal"
      aria-labelledby="order-confirmed-title"
      // The token is only shown here, so Escape doesn't close it by accident; use Done
      onCancel={(event) => event.preventDefault()}
    >
      <div className="checkout-modal__content">
        <h2 id="order-confirmed-title">Order Confirmed!</h2>
        <p>Your order has been placed successfully.</p>

        <p className="checkout-modal__ids">
          Order No: <strong>{order.orderNumber}</strong> | Pickup Token: <strong>{order.token}</strong>
        </p>

        <p>We will notify you when the order is prepared.</p>
        <p className="checkout-modal__reminder">
          ** Remember to take picture of it and show it during your order pickup
        </p>

        <div className="checkout-modal__actions">
          <button
            type="button"
            className="checkout-btn checkout-btn--outline"
            onClick={sendEmail}
            disabled={mail.state === "sending"}
          >
            {mail.state === "sending" ? "Sending…" : mail.state === "sent" ? "Send again" : "Email me the details"}
          </button>
          <button type="button" className="checkout-btn checkout-btn--green" onClick={onDone}>
            Done
          </button>
        </div>

        <p className="checkout-modal__status" role={mail.state === "error" ? "alert" : "status"}>
          {mail.text}
          {mail.previewUrl && (
            <>
              {" "}
              <a href={mail.previewUrl} target="_blank" rel="noreferrer">View test email</a>
            </>
          )}
        </p>
      </div>
    </dialog>
  );
}

/* ---------- Checkout form ---------- */

function CheckoutForm() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [cart, setCart] = useState(null); // null until the first load finishes
  const [loadError, setLoadError] = useState("");
  const [method, setMethod] = useState("card");
  const [form, setForm] = useState(() => {
    const [first = "", ...rest] = (user?.name ?? "").trim().split(/\s+/);
    return { firstName: first, lastName: rest.join(" "), email: user?.email ?? "", phone: user?.phone ?? "", address: "" };
  });
  const [cardForm, setCardForm] = useState({ name: user?.name ?? "", number: "", expiry: "", cvv: "" });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [placed, setPlaced] = useState(null); // the confirmed order, once paid

  const locked = pending || Boolean(placed);

  // The total comes from the database
  useEffect(() => {
    let ignore = false;

    request("/api/cart")
      .then((data) => {
        if (!ignore) setCart(data);
      })
      .catch((err) => {
        if (ignore) return;
        if (err.status === 401) setUser(null);
        setLoadError(err.message);
      });

    return () => {
      ignore = true;
    };
  }, [setUser]);

  const setField = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }));
  const setCardField = (key, format = (v) => v) => (event) =>
    setCardForm((c) => ({ ...c, [key]: format(event.target.value) }));

  function validate() {
    if (!form.firstName.trim() || !form.lastName.trim()) return "Enter your first and last name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Enter a valid email address.";
    if (!/^\+?[0-9\s-]{6,20}$/.test(form.phone.trim())) return "Enter a valid mobile number.";
    if (form.address.length > 255) return "Address must be 255 characters or fewer.";
    if (!cardForm.name.trim()) return "Enter the name on your card.";

    const cardDigits = digitsOnly(cardForm.number);
    if (cardDigits.length < 13 || cardDigits.length > 19) return "Enter a valid card number.";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardForm.expiry)) return "Enter the expiry date as MM/YY.";
    if (isExpired(cardForm.expiry)) return "This card has expired.";
    if (!/^\d{3,4}$/.test(cardForm.cvv)) return "Enter the 3 or 4 digit CVV.";
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (locked) return;
    setError("");

    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setPending(true);
    try {
      // Simulated payment. 
      const order = await request("/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
        }),
      });

      setCardForm((c) => ({ ...c, number: "", expiry: "", cvv: "" })); // don't keep card data around
      setPlaced(order);
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  if (!cart && !loadError) {
    return <p className="checkout-state" role="status">Loading your cart…</p>;
  }

  if (loadError) {
    return (
      <section className="checkout-state">
        <h1>We couldn’t load your cart</h1>
        <p role="alert">{loadError}</p>
        <Link to="/cart" className="checkout-btn checkout-btn--orange">Back to Cart</Link>
      </section>
    );
  }

  // After payment the cart is emptied on the server, but the confirmation modal must stay up
  if (cart.items.length === 0 && !placed) {
    return (
      <section className="checkout-state">
        <h1>Your cart is empty</h1>
        <p>Add some items before checking out.</p>
        <Link to="/categories" className="checkout-btn checkout-btn--green">Browse products</Link>
      </section>
    );
  }

  return (
    <>
      <form className="checkout-layout" onSubmit={handleSubmit} aria-busy={pending} noValidate>
        {/* Contact information */}
        <section className="checkout-card" aria-labelledby="contact-heading">
          <h1 id="contact-heading" className="checkout-card__title">Contact Information</h1>

          <div className="checkout-grid">
            <div className="checkout-field">
              <label htmlFor="first-name">First Name<span className="checkout-required" aria-hidden="true">*</span></label>
              <input id="first-name" autoComplete="off" value={form.firstName} onChange={setField("firstName")} maxLength={50} required disabled={locked} />
            </div>
            <div className="checkout-field">
              <label htmlFor="last-name">Last Name<span className="checkout-required" aria-hidden="true">*</span></label>
              <input id="last-name" autoComplete="off" value={form.lastName} onChange={setField("lastName")} maxLength={50} required disabled={locked} />
            </div>
          </div>

          <div className="checkout-field">
            <label htmlFor="email">Email Address<span className="checkout-required" aria-hidden="true">*</span></label>
            <input id="email" type="email" autoComplete="off" value={form.email} onChange={setField("email")} maxLength={100} required disabled={locked} aria-describedby="email-note" />
          </div>

          <div className="checkout-field">
            <label htmlFor="phone">Mobile Number<span className="checkout-required" aria-hidden="true">*</span></label>
            <input id="phone" type="tel" autoComplete="off" value={form.phone} onChange={setField("phone")} maxLength={20} required disabled={locked} />
          </div>

          <div className="checkout-field">
            <label htmlFor="address">Home Address <span className="checkout-optional">(optional)</span></label>
            <input id="address" autoComplete="off" value={form.address} onChange={setField("address")} maxLength={255} disabled={locked} />
          </div>

          <p id="email-note" className="checkout-note">
            <span className="checkout-required" aria-hidden="true">**</span> Receipt and order information will be sent to this email
          </p>
        </section>

        {/* Payment */}
        <section className="checkout-card" aria-labelledby="payment-heading">
          <h2 id="payment-heading" className="checkout-card__title">Payment Section</h2>

          <fieldset className="checkout-methods">
            <legend>Select Payment Methods:</legend>
            <div className="checkout-methods__row">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.id}
                  className={`checkout-method ${m.enabled ? "" : "checkout-method--disabled"}`}
                  title={m.enabled ? undefined : "Not available yet"}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value={m.id}
                    checked={method === m.id}
                    disabled={!m.enabled || locked}
                    onChange={() => setMethod(m.id)}
                  />
                  <span>{m.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <p className="checkout-demo-note">
            Demo payment: no money is taken, and your card details are not stored or sent anywhere.
          </p>

          <div className="checkout-grid">
            <div className="checkout-field">
              <label htmlFor="card-number">Card Number</label>
              <input id="card-number" inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" value={cardForm.number} onChange={setCardField("number", formatCardNumber)} disabled={locked} />
            </div>

            <div className="checkout-field">
              <label htmlFor="name-on-card">Name on Card</label>
              <input id="name-on-card" autoComplete="off" placeholder="Name" value={cardForm.name} onChange={setCardField("name")} maxLength={100} disabled={locked} />
            </div>

            <div className="checkout-field">
              <label htmlFor="card-expiry">Expiry Date</label>
              <input id="card-expiry" inputMode="numeric" autoComplete="off" placeholder="MM/YY" value={cardForm.expiry} onChange={setCardField("expiry", formatExpiry)} maxLength={5} disabled={locked} />
            </div>

            <div className="checkout-field checkout-field--narrow">
              <label htmlFor="card-cvv">CVV</label>
              <input id="card-cvv" inputMode="numeric" autoComplete="off" placeholder="CVV" value={cardForm.cvv} onChange={setCardField("cvv", (v) => digitsOnly(v).slice(0, 4))} maxLength={4} disabled={locked} />
            </div>
          </div>

          <p className="checkout-total">
            Total to pay: <strong>{money(cart.totals.total)}</strong>
            <span> ({cart.itemCount} {cart.itemCount === 1 ? "item" : "items"})</span>
          </p>

          {error && <p className="checkout-error" role="alert">{error}</p>}

          <div className="checkout-actions">
            <Link to="/cart" className="checkout-btn checkout-btn--orange" aria-disabled={locked}>Back to Cart</Link>
            <button type="submit" className="checkout-btn checkout-btn--green" disabled={locked}>
              {pending ? "Processing…" : "Make Payment"}
            </button>
          </div>
        </section>
      </form>

      {placed && <OrderConfirmedModal order={placed} onDone={() => navigate("/", { replace: true })} />}
    </>
  );
}

export default function Checkout() {
  return (
    <main className="checkout-page">
      <nav className="checkout-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">›</span>
        <Link to="/cart">Cart</Link>
        <span aria-hidden="true">›</span>
        <span aria-current="page">Checkout</span>
      </nav>

      <CheckoutForm />
    </main>
  );
}
