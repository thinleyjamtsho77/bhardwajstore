import { useState } from "react";
import { Link, NavLink } from "react-router";
import logo from "../assets/images/logo-header.png";
import "../assets/styles/navbar.css";

const NAV_ITEMS = [
  { label: "Home", to: "/" },
  { label: "Categories", to: "/categories" },
  { label: "Deals", to: "/deals" },
  { label: "FAQs", to: "/faqs" },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor"
         strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <circle cx="10" cy="10" r="6.5" />
      <path d="M15 15l6 6" />
    </svg>
  );
}

function BasketIcon() {
  return (
    <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor"
         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 9V6a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 16 6v3" />
      <path d="M3 9h18l-1.6 10a1.5 1.5 0 0 1-1.5 1.3H6.100a1.500 1.500 0 0 1-1.500-1.300L3 9z" />
      <path d="M9 12.500v5M12 12.500v5M15 12.500v5" />
    </svg>
  );
}

/**
 * Shared site header.
 *
 * Props (all optional):
 *  - cartCount: number shown as a badge on the basket
 *  - user: { name } when logged in (button becomes "Logout")
 *  - onSearch: called when the search icon is clicked
 *  - onLogin / onLogout: auth handlers
 */
export default function Header({ cartCount = 0, user = null, onSearch, onLogin, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="brand" onClick={closeMenu} aria-label="Bhardwaj Grocery Store home">
          <img src={logo} alt="" className="brand__logo" />
        </Link>

        <button
          className="menu-toggle"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          aria-controls="primary-nav"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span /><span /><span />
        </button>

        <nav id="primary-nav" className={`nav ${menuOpen ? "nav--open" : ""}`} aria-label="Primary">
          {NAV_ITEMS.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={closeMenu}
              className={({ isActive }) => `nav__link ${isActive ? "nav__link--active" : ""}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="actions">
          <button className="icon-btn" aria-label="Search" onClick={onSearch}>
            <SearchIcon />
          </button>

          <Link to="/cart" className="icon-btn" aria-label={`Basket, ${cartCount} items`}>
            <BasketIcon />
            {cartCount > 0 && <span className="icon-btn__badge">{cartCount}</span>}
          </Link>

          {user ? (
            <button className="btn-login" onClick={onLogout}>Logout</button>
          ) : (
            <button className="btn-login" onClick={onLogin}>Login</button>
          )}
        </div>
      </div>
    </header>
  );
}
