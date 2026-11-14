import { Link } from "react-router";
import "../assets/styles/admin/admin-coming-soon.css";

/**
 * Placeholder for admin pages that aren't built yet.
 * Renders inside AdminLayout, so the navbar and sidebar stay in place.
 *
 * Props:
 *  - title: the page name, for example "Product Management"
 *  - description (optional): replaces the default message
 */
export default function AdminComingSoon({
  title,
  description = "We’re still building this page. Check back soon.",
}) {
  return (
    <section className="coming-soon" aria-labelledby="coming-soon-title">
      <div className="coming-soon__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor"
             strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" focusable="false">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      </div>

      <p className="coming-soon__badge">Coming soon</p>
      <h1 id="coming-soon-title">{title}</h1>
      <p className="coming-soon__text">{description}</p>

      <Link to="/admin" className="coming-soon__link">Back to Dashboard</Link>
    </section>
  );
}
