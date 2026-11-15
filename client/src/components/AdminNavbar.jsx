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
        <div className="admin-navbar__greeting">
          Greetings, {user?.name || "Guest"}
        </div>
      </div>
    </header>
  );
}
