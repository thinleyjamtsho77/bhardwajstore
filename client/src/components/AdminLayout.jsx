import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import AdminNavbar from "./AdminNavbar.jsx";
import AdminSidebar from "./adminSidebar.jsx";
import "../assets/styles/admin/admin-layout.css";


export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer only
  const { pathname } = useLocation();

  // Close the mobile drawer when the page changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close the drawer with Escape
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (event) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  return (
    <div className="admin-layout">
      <a className="admin-layout__skip" href="#admin-main">Skip to content</a>

      <AdminNavbar
        menuOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen((open) => !open)}
      />

      <div className="admin-layout__body">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {sidebarOpen && (
          <div
            className="admin-layout__backdrop"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <main id="admin-main" className="admin-layout__main" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
