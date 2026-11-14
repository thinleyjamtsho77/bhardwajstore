import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/images/logo-header.png";
import "../assets/styles/admin/admin-navbar.css";

function getInitials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function Icon({ children }) {
  return (
    <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor"
         strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
         aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

export default function AdminNavbar({ onSearch, onNotifications, onMenuClick, menuOpen = false }) {
  const { user } = useAuth();

  return (
    <header className="admin-navbar">
      <button
        type="button"
        className="admin-navbar__menu"
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
        aria-controls="admin-sidebar"
        onClick={onMenuClick}
      >
        <span /><span /><span />
      </button>

      <Link to="/admin" className="admin-navbar__brand" aria-label="Bhardwaj Grocery Store admin dashboard">
        <img src={logo} alt="" />
      </Link>

      <div className="admin-navbar__actions">
        <button type="button" className="admin-navbar__icon" aria-label="Search" onClick={onSearch}>
          <Icon>
            <circle cx="10.5" cy="10.5" r="7" />
            <path d="M16 16l5 5" />
          </Icon>
        </button>

        <button type="button" className="admin-navbar__icon" aria-label="Notifications" onClick={onNotifications}>
          <Icon>
            <path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z" />
            <path d="M10 21h4" />
          </Icon>
        </button>

        <div
          className="admin-navbar__avatar"
          role="img"
          aria-label={user ? `Signed in as ${user.name} (${user.role})` : "Not signed in"}
          title={user?.name}
        >
          {getInitials(user?.name)}
        </div>
      </div>
    </header>
  );
}
