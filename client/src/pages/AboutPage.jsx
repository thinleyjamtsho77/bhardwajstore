import { Link } from "react-router";
import InfoPage from "../components/InfoPage";
import { STORE } from "../config/storeInfo";

export default function AboutPage() {
  return (
    <InfoPage
      title="About Us"
      intro="Bhardwaj Grocery Store is a local grocery store in Amritsar, Punjab, and your trusted wholesale store for spices, cereals, pulses and more."
    >
      <section className="ip-section">
        <h2>Who We Are</h2>
        <p>
          We serve families, restaurants and caterers with everyday groceries at
          fair prices. Our website lets you browse products, check prices and
          order ahead, so shopping with us is quick and convenient.
        </p>
        {/* EDIT: add the real story of the store here (when it started, the family, what makes it special) */}
      </section>

      <section className="ip-section">
        <h2>What We Sell</h2>
        <ul>
          <li>Flour and atta</li>
          <li>Cooking oils</li>
          <li>Spices and masalas</li>
          <li>Pulses and dals</li>
          <li>Rice</li>
        </ul>
        <p>
          <Link to="/categories">Browse all categories</Link>
        </p>
      </section>

      <section className="ip-section">
        <h2>Why Shop With Us</h2>
        <ul>
          <li><strong>Wholesale and bulk prices:</strong> buy more and save on every kilo. See our <Link to="/services">Services page</Link>.</li>
          <li><strong>Click &amp; Collect:</strong> order online and collect at a time that suits you. <Link to="/click-and-collect">How it works</Link>.</li>
          <li><strong>Open every day:</strong> {STORE.hours}, seven days a week.</li>
          <li><strong>Quality products:</strong> carefully chosen and stored fresh.</li>
        </ul>
      </section>

      <section className="ip-section">
        <h2>Visit Us</h2>
        <div className="ip-card">
          <p><strong>Address:</strong> <a href={STORE.mapsUrl} target="_blank" rel="noopener noreferrer">{STORE.address}</a></p>
          <p><strong>Phone:</strong> <a href={`tel:${STORE.phoneLink}`}>{STORE.phone}</a></p>
          <p><strong>Email:</strong> <a href={`mailto:${STORE.email}`}>{STORE.email}</a></p>
          <p><strong>Hours:</strong> Every day, {STORE.hours}</p>
        </div>
      </section>
    </InfoPage>
  );
}