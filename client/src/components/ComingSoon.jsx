import { Link } from "react-router";
import "../assets/styles/store-coming-soon.css";

/**
 * Placeholder for customer pages that aren't built yet.
 * Renders inside MainLayout, so the storefront header and footer stay in place.
 *
 * Props:
 *  - title: the page name, for example "Deals"
 *  - description (optional): replaces the default message
 */
export default function ComingSoon({
  title,
  description = "This page is on its way. In the meantime, you can keep browsing the store.",
}) {
  return (
    <section className="store-soon" aria-labelledby="store-soon-title">
      <div className="store-soon__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor"
             strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" focusable="false">
          <path d="M8 9V6a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 16 6v3" />
          <path d="M3 9h18l-1.6 10a1.5 1.5 0 0 1-1.5 1.3H6.1a1.5 1.5 0 0 1-1.5-1.3L3 9z" />
          <path d="M9 12.5v5M12 12.5v5M15 12.5v5" />
        </svg>
      </div>

      <p className="store-soon__badge">Coming soon</p>
      <h1 id="store-soon-title">{title}</h1>
      <p className="store-soon__text">{description}</p>

      <div className="store-soon__actions">
        <Link to="/" className="store-soon__btn store-soon__btn--green">Back to Home</Link>
        <Link to="/categories" className="store-soon__btn store-soon__btn--outline">Browse products</Link>
      </div>
    </section>
  );
}
