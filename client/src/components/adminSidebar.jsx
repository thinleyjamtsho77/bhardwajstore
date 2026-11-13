import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import "../assets/styles/admin/admin-sidebar.css";

const ICONS = {
  dashboard: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
    </>
  ),
  product: (
    <>
      <path d="M5 9h14l-1.5 11h-11z" />
      <path d="M8 9V7a4 4 0 0 1 8 0v2" />
    </>
  ),
  categories: <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />,
  orders: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4h6v3H9zM9 12h6M9 16h4" />
    </>
  ),
  customers: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5a3.5 3.5 0 0 1 0 7M18 14c2 .7 3 2.6 3 6" />
    </>
  ),
  inventory: (
    <>
      <path d="M3 7l9-4 9 4v10l-9 4-9-4z" />
      <path d="M3 7l9 4 9-4M12 11v10" />
    </>
  ),
  payment: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18M7 15h3" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
    </>
  ),
  logout: <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9" />,
};

function Icon({ name }) {
  return (
    <svg className="admin-sidebar__icon" viewBox="0 0 24 24" width="20" height="20" fill="none"
         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
         aria-hidden="true" focusable="false">
      {ICONS[name]}
    </svg>
  );
}

const NAV_ITEMS = [
  { label: "Dashboard", to: "/admin", icon: "dashboard", end: true },
  { label: "Product", to: "/admin/products", icon: "product" },
  { label: "Categories", to: "/admin/categories", icon: "categories" },
  { label: "Orders", to: "/admin/orders", icon: "orders" },
  { label: "Customers", to: "/admin/customers", icon: "customers" },
  { label: "Staffs", to: "/admin/staffs", icon: "customers" },
  { label: "Inventory", to: "/admin/inventory", icon: "inventory" },
  { label: "Payment", to: "/admin/payments", icon: "payment" },
];


export default function AdminSidebar({ open = false, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function handleLogout() {
    setError("");
    try {
      await logout();
      navigate("/admin/login");
    } catch (err) {
      setError(err.message || "Could not log out. Please try again.");
    }
  }

  const linkClass = ({ isActive }) =>
    `admin-sidebar__link ${isActive ? "admin-sidebar__link--active" : ""}`;

  return (
    <aside
      id="admin-sidebar"
      className={`admin-sidebar ${open ? "admin-sidebar--open" : ""}`}
      aria-label="Admin sidebar"
    >
      <nav aria-label="Admin">
        <ul className="admin-sidebar__list">
          {NAV_ITEMS.map(({ label, to, icon, end }) => (
            <li key={to}>
              <NavLink to={to} end={end} className={linkClass} onClick={onClose}>
                <Icon name={icon} />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="admin-sidebar__footer">
        <NavLink to="/admin/settings" className="admin-sidebar__small" onClick={onClose}>
          <Icon name="settings" />
          Setting
        </NavLink>
        <button type="button" className="admin-sidebar__small" onClick={handleLogout}>
          <Icon name="logout" />
          Log Out
        </button>
        {error && <p className="admin-sidebar__error" role="alert">{error}</p>}
      </div>
    </aside>
  );
}
