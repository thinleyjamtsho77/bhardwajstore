import { Outlet, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import Header from "./navbar";
import Footer from "./footer";

// Every page rendered inside <Outlet /> automatically gets the shared header and footer.
export default function MainLayout() {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Express endpoints (see server/server.js)
    fetch("/api/cart/count")
      .then((r) => r.json())
      .then((d) => setCartCount(d.count))
      .catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header
        cartCount={cartCount}
        user={user}
        onSearch={() => navigate("/search")}
        onLogin={() => navigate("/login")}
        onLogout={() => setUser(null)}
      />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
