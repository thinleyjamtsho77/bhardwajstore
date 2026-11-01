
import { NavLink } from "react-router";

export default function AccountSidebar() {
  const menuItems = [
    { label: "Profile", path: "/profile" },
    { label: "Address", path: "/address" },
    { label: "Wish list", path: "/wishlist" },
    { label: "Orders", path: "/order-history" },
  ];

  return (
    <aside className="account-sidebar">

      <h2>My Account</h2>

      <nav className="account-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "account-menu-item active"
                : "account-menu-item"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="account-sidebar-bottom">
        <NavLink to="/settings" className="account-bottom-item">
          ⚙ Setting
        </NavLink>

        <button
          type="button"
          className="account-bottom-item"
        >
          ⇥ Log Out
        </button>
      </div>

    </aside>
  );
}
