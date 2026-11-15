import { useState } from "react";
import { Link } from "react-router";
import "../assets/styles/services.css";

/* ============================================================
   EDIT HERE: everything below is sample content.
   Confirm the real prices, hours and offers with the store owner.
   ============================================================ */

// Opening hours (24-hour clock, Indian Standard Time)
const OPEN_HOUR = 7; // 7:00 AM
const CLOSE_HOUR = 23; // 11:00 PM
const HOURS_TEXT = "7:00 AM – 11:00 PM";
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Bulk prices: the more kg, the lower the price per kg
const BULK_PRODUCT = "Basmati Rice (sample prices)";
const TIERS = [
  { minKg: 1, price: 20 },
  { minKg: 5, price: 19 },
  { minKg: 10, price: 18 },
  { minKg: 25, price: 16 },
  { minKg: 50, price: 15 },
];

const DEALS = [
  { tag: "Save 10%", title: "Bulk Saver", text: "Buy 10 kg or more and pay ₹18/kg instead of ₹20/kg." },
  { tag: "Wholesale", title: "Restaurants & Caterers", text: "Ordering 50 kg or more regularly? Ask us for a special rate and a weekly supply plan." },
  { tag: "Family", title: "Monthly Grocery Pack", text: "Stock up on flour, oil, pulses, spices and rice once a month and save on every kilo." },
  { tag: "Seasonal", title: "Festival Combos", text: "Special bundles around Diwali, Lohri and Baisakhi. Ask in store for this season's offers." },
];

const SERVICES = [
  { icon: "🛒", title: "Click & Collect", text: "Order online, pick a collection time slot, and pick up your groceries at the store with your pickup token.", link: "/click-and-collect", linkText: "How it works" },
  { icon: "📦", title: "Wholesale & Bulk Orders", text: "Special prices for large orders. Perfect for restaurants, caterers, hostels and big families." },
  { icon: "🌾", title: "Quality You Can Trust", text: "Spices, cereals, pulses, flour, oil and rice, carefully chosen and stored fresh." },
  { icon: "💳", title: "Easy Payment", text: "Pay by card, bank transfer or cash when you collect your order." },
  { icon: "↩️", title: "Cancellations & Refunds", text: "Changed your mind? Read our simple cancellation and refund rules.", link: "/refund-policy", linkText: "Read the policy" },
  { icon: "💬", title: "Help & Support", text: "Questions about orders, prices or products? Check our FAQs or contact the store.", link: "/faqs", linkText: "See FAQs" },
];

const CONTACT = {
  address: "Amritsar, Punjab, India",
  phone: "+91 xxxx-nnnnnn", // replace with the real number
  email: "info@bhardwaj.hotmail.com",
};

/* ============================================================ */

function isOpenNow() {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "Asia/Kolkata",
    }).format(new Date())
  );
  return hour >= OPEN_HOUR && hour < CLOSE_HOUR;
}

function tierLabel(i) {
  const t = TIERS[i];
  const next = TIERS[i + 1];
  if (!next) return `${t.minKg} kg and above`;
  const end = next.minKg - 1;
  return end === t.minKg ? `${t.minKg} kg` : `${t.minKg} – ${end} kg`;
}

function getTier(kg) {
  let match = TIERS[0];
  for (const t of TIERS) {
    if (kg >= t.minKg) match = t;
  }
  return match;
}

export default function ServicesPage() {
  const [kgInput, setKgInput] = useState("10");
  const open = isOpenNow();

  const qty = Math.max(1, Math.floor(Number(kgInput)) || 1);
  const tier = getTier(qty);
  const total = qty * tier.price;
  const normalTotal = qty * TIERS[0].price;
  const saved = normalTotal - total;

  return (
    <div className="sv-page">
      {/* Intro */}
      <section className="sv-hero">
        <h1>Our Services</h1>
        <p>
          Spices, cereals, pulses, flour, oil and rice, with better prices the
          more you buy.
        </p>
        <div className="sv-hero-actions">
          <Link to="/products" className="sv-btn sv-btn-primary">Shop Products</Link>
          <a href="#wholesale" className="sv-btn sv-btn-light">See Bulk Prices</a>
        </div>
      </section>

      {/* Opening hours */}
      <section className="sv-section">
        <h2>Opening Hours</h2>
        <div className="sv-card sv-hours">
          <span className={`sv-status ${open ? "open" : "closed"}`}>
            {open ? "Open now" : "Closed now"}
          </span>
          <p className="sv-hours-main">Open every day, {HOURS_TEXT}</p>
          <ul className="sv-hours-list">
            {DAYS.map((d) => (
              <li key={d}>
                <span>{d}</span>
                <span>{HOURS_TEXT}</span>
              </li>
            ))}
          </ul>
          <p className="sv-note">Times are shown in Indian Standard Time (IST).</p>
        </div>
      </section>

      {/* Wholesale prices */}
      <section className="sv-section" id="wholesale">
        <h2>Wholesale &amp; Bulk Prices</h2>
        <p className="sv-lead">
          The more you buy, the less you pay per kilo. Example: {BULK_PRODUCT}.
        </p>

        <div className="sv-two-col">
          <div className="sv-card">
            <div className="sv-table-wrap">
              <table className="sv-table">
                <thead>
                  <tr>
                    <th>Quantity</th>
                    <th>Price per kg</th>
                    <th>You save</th>
                  </tr>
                </thead>
                <tbody>
                  {TIERS.map((t, i) => (
                    <tr key={t.minKg}>
                      <td>{tierLabel(i)}</td>
                      <td>₹{t.price}</td>
                      <td>
                        {i === 0
                          ? "-"
                          : `${Math.round((1 - t.price / TIERS[0].price) * 100)}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="sv-card sv-calc">
            <h3>Price Calculator</h3>
            <label>
              How many kg do you need?
              <input
                type="number"
                min="1"
                step="1"
                value={kgInput}
                onChange={(e) => setKgInput(e.target.value)}
              />
            </label>
            <div className="sv-calc-result">
              <p>Price per kg: <strong>₹{tier.price}</strong></p>
              <p>Total for {qty} kg: <strong>₹{total}</strong></p>
              {saved > 0 ? (
                <p className="sv-saving">You save ₹{saved}</p>
              ) : (
                <p className="sv-note">Buy 5 kg or more to start saving.</p>
              )}
            </div>
          </div>
        </div>

        <p className="sv-note">
          Bulk prices apply to selected products. Ask in store or contact us
          for large or regular orders.
        </p>
      </section>

      {/* Deals */}
      <section className="sv-section">
        <h2>Current Deals</h2>
        <div className="sv-grid">
          {DEALS.map((d) => (
            <div className="sv-card sv-deal" key={d.title}>
              <span className="sv-tag">{d.tag}</span>
              <h3>{d.title}</h3>
              <p>{d.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="sv-section">
        <h2>What We Offer</h2>
        <div className="sv-grid">
          {SERVICES.map((s) => (
            <div className="sv-card sv-service" key={s.title}>
              <div className="sv-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              {s.link && <Link to={s.link} className="sv-link">{s.linkText} →</Link>}
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="sv-section">
        <h2>Visit or Contact Us</h2>
        <div className="sv-card sv-contact">
          <p><strong>Address:</strong> {CONTACT.address}</p>
          <p><strong>Phone:</strong> {CONTACT.phone}</p>
          <p>
            <strong>Email:</strong>{" "}
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </p>
          <p><strong>Hours:</strong> Every day, {HOURS_TEXT}</p>
          <p className="sv-note">
            For wholesale or bulk enquiries, call or email us with the products
            and quantities you need.
          </p>
        </div>
      </section>
    </div>
  );
}