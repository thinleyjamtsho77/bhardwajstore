import { Outlet, useNavigate } from "react-router";
import { useState } from "react";
import Header from "./navbar";
import Footer from "./footer";

// Every page rendered inside <Outlet /> automatically gets the shared header and footer.
export default function MainLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);


  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header
        cartCount={null}
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
