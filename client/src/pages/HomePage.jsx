import { useRef } from "react";
import { Link } from "react-router";
import "../assets/styles/index.css";
import "../assets/styles/home.css";

const img = (file) => new URL(`../assets/images/${file}`, import.meta.url).href;
const categories_img = (file) => new URL(`../assets/images/categories/${file}`, import.meta.url).href;

const CATEGORIES = [
  { slug: "spices", name: "Spices", image: categories_img("spices.png") },,
  { slug: "cereals", name: "Cereals", image: categories_img("cereals.png") },
  { slug: "flours", name: "Flours", image: categories_img("flours.png") },
  { slug: "oils-ghee", name: "Oils & Ghee", image: categories_img("oil_category.png") },
  { slug: "pulses-lentils", name: "Pulses & Lentils", image: categories_img("pulses.png") },
  { slug: "dry-fruits-nuts", name: "Dry Fruits & Nuts", image: categories_img("nuts.png") },
];

const DEALS = [
  { tag: "Save 10%", title: "Bulk Saver", text: "Buy 10 kg or more and pay ₹18/kg instead of ₹20/kg." },
  { tag: "Wholesale", title: "Restaurants & Caterers", text: "Ordering 50 kg or more regularly? Ask us for a special rate and a weekly supply plan." },
  { tag: "Family", title: "Monthly Grocery Pack", text: "Stock up on flour, oil, pulses, spices and rice once a month and save on every kilo." },
  { tag: "Seasonal", title: "Festival Combos", text: "Special bundles around Diwali, Lohri and Baisakhi. Ask in store for this season's offers." },
];


const BEST_SELLERS = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: "Cumin seeds (Jeera)",
  price: "₹40/100g",
  image: img("cumin_seeds.jpg"),
}));

const STEPS = [
  { title: "Browse Products Online", text: "Explore wholesale spices, cereals, flours, pulses, oils, and other dry grocery items online.", icon: "search" },
  { title: "Add to Cart & Pay", text: "Select the quantity you need, add items to your cart, and complete payment online.", icon: "pay" },
  { title: "Receive Pickup Token", text: "After payment, get your order confirmation with a pickup token number and pickup time.", icon: "token" },
  { title: "Collect from Store", text: "Visit Bhardwaj Grocery Store and show your pickup token at the shopkeeper's counter.", icon: "store" },
];

const BENEFITS = [
  { title: "Wholesale Price", icon: "tag" },
  { title: "Bulk Ordering", icon: "cart" },
  { title: "Authentic Quality", icon: "medal" },
];

function StepIcon({ name }) {
  const common = {
    viewBox: "0 0 24 24", width: 32, height: 32, fill: "none",
    stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round",
    strokeLinejoin: "round", "aria-hidden": true,
  };
  switch (name) {
    case "search":
      return <svg {...common}><circle cx="10" cy="10" r="6.5" /><path d="M15 15l6 6" /></svg>;
    case "pay":
      return <svg {...common}><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18M7 15h4" /></svg>;
    case "token":
      return <svg {...common}><path d="M4 8a2 2 0 0 0 0 4v4h16v-4a2 2 0 0 1 0-4V6H4z" /><path d="M12 8v8" strokeDasharray="2 2" /></svg>;
    default:
      return <svg {...common}><path d="M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9h16M10 20v-6h4v6" /></svg>;
  }
}

function BenefitIcon({ name }) {
  const common = { viewBox: "0 0 24 24", width: 64, height: 64, "aria-hidden": true };
  if (name === "tag") {
    return (
      <svg {...common}>
        <path d="M3 3h9l9 9-9 9-9-9z" fill="#2e7d32" />
        <circle cx="7.5" cy="7.5" r="1.5" fill="#fff" />
        <path d="M9 15l5-5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "cart") {
    return (
      <svg {...common} fill="none" stroke="#2e7d32" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h3l2.5 11h11L21 6H6" />
        <circle cx="9" cy="19" r="1.6" /><circle cx="17" cy="19" r="1.6" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M7 2h10l-3 7h-4z" fill="#2e7d32" />
      <circle cx="12" cy="15" r="6" fill="#f9c60a" stroke="#e0a800" strokeWidth="1" />
      <text x="12" y="18" textAnchor="middle" fontSize="8" fontWeight="700" fill="#b37d00">1</text>
    </svg>
  );
}

export default function Home() {
  const trackRef = useRef(null);

  function scrollProducts(direction) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <div className="home">
      {/* Hero */}
      <section className="home-hero" aria-labelledby="hero-title">
        <div className="home-hero__content">
          <h1 id="hero-title">Wholesale Spices, Cereals &amp; Others</h1>
          <p>
            Order quality Indian staples in bulk at fair prices and collect your
            order from Bhardwaj Grocery Store.
          </p>
          <Link to="/products" className="home-btn">View Products</Link>
        </div>
      </section>

      {/* Shop by category */}
      <section className="home-section" aria-labelledby="cat-title">
        <h2 id="cat-title" className="home-title">Shop by Category</h2>
        <ul className="home-categories">
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link to={`/categories/${c.slug}`} className="home-category">
                <img src={c.image} alt="" loading="lazy" />
                <span>{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Best selling */}
      <section className="home-section" aria-labelledby="best-title">
        <div className="home-section__head">
          <h2 id="best-title" className="home-title">Best Selling Products</h2>
          <Link to="/products" className="home-link">View All Products</Link>
        </div>

        <div className="home-carousel">
          <button type="button" className="home-carousel__btn" aria-label="Previous products" onClick={() => scrollProducts(-1)}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
          </button>

          <ul className="home-carousel__track" ref={trackRef}>
            {BEST_SELLERS.map((p) => (
              <li key={p.id} className="home-product">
                <img src={p.image} alt="" loading="lazy" />
                <h3>{p.name}</h3>
                <p>{p.price}</p>
                <button type="button" className="home-product__add" onClick={() => {}}>
                  Add to cart
                </button>
              </li>
            ))}
          </ul>

          <button type="button" className="home-carousel__btn" aria-label="Next products" onClick={() => scrollProducts(1)}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </section>

      {/* Wholesale deals */}
      <section className="home-deals" aria-labelledby="deals-title">
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

      {/* How click & collect works */}
      <section className="home-section" aria-labelledby="how-title">
        <h2 id="how-title" className="home-title">How Click &amp; Collect Works</h2>
        <ol className="home-steps">
          {STEPS.map((s) => (
            <li key={s.title} className="home-step">
              <StepIcon name={s.icon} />
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Why choose us */}
      <section className="home-section" aria-labelledby="why-title">
        <h2 id="why-title" className="home-title">Why Choose Us?</h2>
        <ul className="home-benefits">
          {BENEFITS.map((b) => (
            <li key={b.title}>
              <BenefitIcon name={b.icon} />
              <span>{b.title}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
