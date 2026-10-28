import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
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
      <path d="M3 9h18l-1.6 10a1.5 1.5 0 0 1-1.5 1.3H6.1a1.5 1.5 0 0 1-1.5-1.3L3 9z" />
      <path d="M9 12.5v5M12 12.5v5M15 12.5v5" />
    </svg>
  );
}

/**
 * Shared site header.
 *
 * Props (all optional):
 *  - cartCount: number shown as a badge on the basket
 *  - onSearch: called when the search icon is clicked
 *
 * Auth state comes from useAuth(), so this must render inside <AuthProvider>.
 */

function getInitials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

export default function Header({ cartCount = 0, onSearch }) {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);       // mobile nav
  const [userMenuOpen, setUserMenuOpen] = useState(false); // account dropdown
  const userMenuRef = useRef(null);

  const closeMenu = () => setMenuOpen(false);
  const closeUserMenu = () => setUserMenuOpen(false);

  const initials = getInitials(user?.name);

  // Close the dropdown when the page changes
  useEffect(() => {
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Close the dropdown on outside click or Escape
  useEffect(() => {
    if (!userMenuOpen) return;

    function handleClick(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    function handleKey(event) {
      if (event.key === "Escape") setUserMenuOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [userMenuOpen]);

  async function handleLogout() {
    closeUserMenu();
    try {
      await logout();
      navigate("/");
    } catch (err) {
      alert(err.message); 
    }
  }

 

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

          <Link
            to="/cart"
            className="icon-btn"
            aria-label={
              cartCount === null
                ? "Basket, item count unavailable"
                : `Basket, ${cartCount} items`
            }
          >
            <BasketIcon />
            {cartCount > 0 && <span className="icon-btn__badge">{cartCount}</span>}
          </Link>

          {loading ? (
            // Reserve the space so the header doesn't jump while /me is loading
            <span className="user-menu__placeholder" aria-hidden="true" />
          ) : user ? (
            <div className="user-menu" ref={userMenuRef}>
              <button
                type="button"
                className="user-menu__avatar"
                aria-label={`Account menu for ${user.name}`}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                onClick={() => setUserMenuOpen((o) => !o)}
              >
                {initials}
              </button>

              {userMenuOpen && (
                <div className="user-menu__dropdown" role="menu">
                  <div className="user-menu__header">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>

                  <Link to="/account" role="menuitem" className="user-menu__item" onClick={closeUserMenu}>
                    Account
                  </Link>
                  <Link to="/settings" role="menuitem" className="user-menu__item" onClick={closeUserMenu}>
                    Settings
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    className="user-menu__item user-menu__item--logout"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn-login" onClick={() => navigate("/login")}>
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}