import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../assets/images/logo-header.png";
import LoginImage from "../../assets/images/login_image.png";
import "../../assets/styles/index.css";
import "../../assets/styles/admin/admin-login.css";

// Calls the Express API. Throws an Error with a readable message on failure.
async function adminLogin({ email, password }) {
  let res;
  try {
    res = await fetch("/api/auth/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error("Could not reach the server. Please try again.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Login failed.");
  return data;
}

export default function AdminLogin({
  storeTo = "/",
  afterLoginTo = "/admin/categories",
  contactHref = "mailto:info@bhardwaj.hotmail.com",
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice(null);

    if (!email.trim() || !password) {
      setNotice({ type: "error", text: "Enter your email and password." });
      return;
    }

    setPending(true);
    try {
      const data = await adminLogin({ email: email.trim(), password });
      setUser(data);
      navigate(location.state?.from?.pathname || afterLoginTo, { replace: true });
    } catch (err) {
      setNotice({ type: "error", text: err?.message || "We couldn’t sign you in. Please try again." });
      setPending(false);
    }
  }

  return (
    <div className="admin-login">
      <a className="admin-login__skip" href="#admin-login-form">Skip to login</a>

      <header className="admin-login__header">
        <Link to={storeTo} className="admin-login__brand" aria-label="Bhardwaj Grocery Store home">
          <img src={Logo} alt="Bhardwaj Grocery Store" />
        </Link>
        <Link to={storeTo} className="admin-login__store-link">Check Store</Link>
      </header>

      <main className="admin-login__main">
        <section className="admin-login__panel" aria-labelledby="admin-login-title">
          <h1 id="admin-login-title">Admin Login</h1>

          <form id="admin-login-form" onSubmit={handleSubmit} aria-busy={pending} noValidate>
            <div className="admin-login__field">
              <label htmlFor="admin-email">Email</label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="admin@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={100}
                required
                disabled={pending}
              />
            </div>

            <div className="admin-login__field">
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={72}
                required
                disabled={pending}
              />
            </div>

            <button className="admin-login__submit" type="submit" disabled={pending}>
              {pending ? "Signing in…" : "Login"}
            </button>

            {notice && (
              <p
                className={`admin-login__notice admin-login__notice--${notice.type}`}
                role={notice.type === "error" ? "alert" : "status"}
              >
                {notice.text}
              </p>
            )}
          </form>

          <p className="admin-login__help">
            Forgot password/email? <a href={contactHref}>Contact IT Team</a>
          </p>
        </section>

        <div className="admin-login__visual" aria-hidden="true">
          <img src={LoginImage} alt="" />
        </div>
      </main>

      <footer className="admin-login__footer">
        ©2026 Bhardwaj Grocery Store. All rights reserved.
      </footer>
    </div>
  );
}
