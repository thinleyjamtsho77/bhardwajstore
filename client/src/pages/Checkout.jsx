import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useAuth } from "../context/AuthContext";
import "../assets/styles/index.css";
import "../assets/styles/checkout.css";

// The publishable key is safe in the browser. The secret key must never be.
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

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

// Styling for the card inputs, which Stripe draws inside its own secure iframes
const FIELD_STYLE = {
  style: {
    base: {
      fontSize: "15px",
      color: "#1a1a1a",
      fontFamily: 'Roboto, "Segoe UI", Arial, sans-serif',
      "::placeholder": { color: "#777" },
    },
    invalid: { color: "#c62828" },
  },
};

const EMPTY_CARD = { number: { complete: false, error: "" }, expiry: { complete: false, error: "" }, cvc: { complete: false, error: "" } };

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
    throw Object.assign(new Error(data.message || "Something went wrong."), { status: res.status });
  }
  return data;
}

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [cart, setCart] = useState(null); // null until the first load finishes
  const [loadError, setLoadError] = useState("");
  const [method, setMethod] = useState("card");
  const [form, setForm] = useState(() => {
    const [first = "", ...rest] = (user?.name ?? "").trim().split(/\s+/);
    return { firstName: first, lastName: rest.join(" "), email: user?.email ?? "", phone: user?.phone ?? "", address: "" };
  });
  const [nameOnCard, setNameOnCard] = useState(user?.name ?? "");
  const [card, setCard] = useState(EMPTY_CARD);
  const [focused, setFocused] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  // The cart (and therefore the total) comes from the database
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

  const cardEvents = (key) => ({
    onChange: (event) =>
      setCard((c) => ({ ...c, [key]: { complete: event.complete, error: event.error?.message ?? "" } })),
    onFocus: () => setFocused(key),
    onBlur: () => setFocused(""),
  });

  const fieldClass = (key) =>
    `checkout-stripe ${focused === key ? "checkout-stripe--focus" : ""} ${card[key].error ? "checkout-stripe--invalid" : ""}`;

  function validate() {
    if (!form.firstName.trim() || !form.lastName.trim()) return "Enter your first and last name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Enter a valid email address.";
    if (!/^\+?[0-9\s-]{6,20}$/.test(form.phone.trim())) return "Enter a valid mobile number.";
    if (form.address.length > 255) return "Address must be 255 characters or fewer.";
    if (!nameOnCard.trim()) return "Enter the name on your card.";
    if (!card.number.complete || !card.expiry.complete || !card.cvc.complete) {
      return "Enter your complete card details.";
    }
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (pending || !stripe || !elements) return;
    setError("");

    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setPending(true);
    try {
      // 1. The server builds the order from the saved cart and creates the PaymentIntent
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

      // 2. Card details go straight from Stripe's fields to Stripe. They never touch our server.
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(order.clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: nameOnCard.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
          },
        },
      });

      if (stripeError) {
        setError(stripeError.message || "Your payment didn’t go through. Please try again.");
        setPending(false);
        return;
      }

      // The order is confirmed by Stripe's webhook, not by this redirect
      if (paymentIntent.status === "succeeded" || paymentIntent.status === "processing") {
        navigate(`/order-confirmation/${order.orderNumber}`, { replace: true });
        return;
      }

      setError("Your payment wasn’t completed. Please try again.");
      setPending(false);
    } catch (err) {
      setError(err.message);
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

  if (cart.items.length === 0) {
    return (
      <section className="checkout-state">
        <h1>Your cart is empty</h1>
        <p>Add some items before checking out.</p>
        <Link to="/categories" className="checkout-btn checkout-btn--green">Browse products</Link>
      </section>
    );
  }

  return (
    <form className="checkout-layout" onSubmit={handleSubmit} aria-busy={pending} noValidate>
      {/* Contact information */}
      <section className="checkout-card" aria-labelledby="contact-heading">
        <h1 id="contact-heading" className="checkout-card__title">Contact Information</h1>

        <div className="checkout-grid">
          <div className="checkout-field">
            <label htmlFor="first-name">First Name<span className="checkout-required" aria-hidden="true">*</span></label>
            <input id="first-name" autoComplete="given-name" value={form.firstName} onChange={setField("firstName")} maxLength={50} required disabled={pending} />
          </div>
          <div className="checkout-field">
            <label htmlFor="last-name">Last Name<span className="checkout-required" aria-hidden="true">*</span></label>
            <input id="last-name" autoComplete="family-name" value={form.lastName} onChange={setField("lastName")} maxLength={50} required disabled={pending} />
          </div>
        </div>

        <div className="checkout-field">
          <label htmlFor="email">Email Address<span className="checkout-required" aria-hidden="true">*</span></label>
          <input id="email" type="email" autoComplete="email" value={form.email} onChange={setField("email")} maxLength={100} required disabled={pending} aria-describedby="email-note" />
        </div>

        <div className="checkout-field">
          <label htmlFor="phone">Mobile Number<span className="checkout-required" aria-hidden="true">*</span></label>
          <input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={setField("phone")} maxLength={20} required disabled={pending} />
        </div>

        <div className="checkout-field">
          <label htmlFor="address">Home Address <span className="checkout-optional">(optional)</span></label>
          <input id="address" autoComplete="street-address" value={form.address} onChange={setField("address")} maxLength={255} disabled={pending} />
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
                  disabled={!m.enabled || pending}
                  onChange={() => setMethod(m.id)}
                />
                <span>{m.label}</span>
              </label>
            ))}
          </div>
          <p className="checkout-note">Card payments are available now. Other methods are coming soon.</p>
        </fieldset>

        <div className="checkout-grid">
          <div className="checkout-field">
            <label htmlFor="card-number">Card Number</label>
            <div className={fieldClass("number")}>
              <CardNumberElement id="card-number" options={{ ...FIELD_STYLE, placeholder: "0000 0000 0000 0000", showIcon: true }} {...cardEvents("number")} />
            </div>
            {card.number.error && <p className="checkout-error-text" role="alert">{card.number.error}</p>}
          </div>

          <div className="checkout-field">
            <label htmlFor="name-on-card">Name on Card</label>
            <input id="name-on-card" autoComplete="cc-name" value={nameOnCard} onChange={(e) => setNameOnCard(e.target.value)} placeholder="Name" maxLength={100} disabled={pending} />
          </div>

          <div className="checkout-field">
            <label htmlFor="card-expiry">Expiry Date</label>
            <div className={fieldClass("expiry")}>
              <CardExpiryElement id="card-expiry" options={{ ...FIELD_STYLE, placeholder: "MM/YY" }} {...cardEvents("expiry")} />
            </div>
            {card.expiry.error && <p className="checkout-error-text" role="alert">{card.expiry.error}</p>}
          </div>

          <div className="checkout-field checkout-field--narrow">
            <label htmlFor="card-cvc">CVV</label>
            <div className={fieldClass("cvc")}>
              <CardCvcElement id="card-cvc" options={{ ...FIELD_STYLE, placeholder: "CVV" }} {...cardEvents("cvc")} />
            </div>
            {card.cvc.error && <p className="checkout-error-text" role="alert">{card.cvc.error}</p>}
          </div>
        </div>

        <p className="checkout-total">
          Total to pay: <strong>{money(cart.totals.total)}</strong>
          <span> ({cart.itemCount} {cart.itemCount === 1 ? "item" : "items"})</span>
        </p>

        {error && <p className="checkout-error" role="alert">{error}</p>}

        <div className="checkout-actions">
          <Link to="/cart" className="checkout-btn checkout-btn--orange" aria-disabled={pending}>Back to Cart</Link>
          <button type="submit" className="checkout-btn checkout-btn--green" disabled={pending || !stripe}>
            {pending ? "Processing…" : "Make Payment"}
          </button>
        </div>
      </section>
    </form>
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

      {stripePromise ? (
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      ) : (
        <p className="checkout-state" role="alert">
          Payments aren’t set up yet. Add VITE_STRIPE_PUBLISHABLE_KEY to client/.env and restart the dev server.
        </p>
      )}
    </main>
  );
}
