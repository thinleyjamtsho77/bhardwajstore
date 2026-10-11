import { useState } from "react";
import { Link } from "react-router";
import Logo from "../assets/images/logo-header.png";
import LoginImage from "../assets/images/login_image.png";
import "../assets/styles/index.css";
import "../assets/styles/Login.css";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="login-provider-icon">
      <path fill="#4285f4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.32 2.98-7.36Z" />
      <path fill="#34a853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.51c-.9.6-2.06.96-3.38.96-2.6 0-4.8-1.76-5.58-4.13H3.08v2.59A10 10 0 0 0 12 22Z" />
      <path fill="#fbbc05" d="M6.42 13.9a6 6 0 0 1 0-3.8V7.51H3.08a10 10 0 0 0 0 8.98l3.34-2.59Z" />
      <path fill="#ea4335" d="M12 5.97c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.92 5.51l3.34 2.59A5.98 5.98 0 0 1 12 5.97Z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="login-provider-icon">
      <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.76 3.08.82 1.18-.24 2.31-.94 3.57-.85 1.51.12 2.64.72 3.39 1.8-3.1 1.85-2.36 5.92.48 7.06-.57 1.49-1.31 2.98-2.52 4.15ZM12.03 7.25c-.16-2.24 1.67-4.08 3.77-4.25.29 2.59-2.35 4.52-3.77 4.25Z" />
    </svg>
  );
}

function EyeIcon({ visible }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {visible && <path d="m3 3 18 18" />}
    </svg>
  );
}

/**
 * Optional integration props:
 * onLogin({ email, password, rememberMe }): async server sign-in callback.
 * onGoogleLogin / onAppleLogin: real provider sign-in callbacks.
 * registerTo / forgotPasswordTo: existing routes, when those pages are built.
 * The page never stores a password or pretends a demo submission is a login.
 */
export default function Login({
  guestTo = "/",
  registerTo,
  forgotPasswordTo,
  onLogin,
  onGoogleLogin,
  onAppleLogin,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState(null);

  function showUnavailable(feature) {
    setNotice({
      type: "info",
      text: `${feature} is currently unavailable. Please continue as a guest.`,
    });
  }

  async function handleLogin(event) {
    event.preventDefault();
    setNotice(null);

    if (!onLogin) {
      showUnavailable("Sign in");
      return;
    }

    setPending(true);
    try {
      // Your callback should call Express and navigate after successful login.
      await onLogin({ email: email.trim(), password, rememberMe });
    } catch {
      setNotice({ type: "error", text: "We couldn’t sign you in. Check your details and try again." });
    } finally {
      setPending(false);
    }
  }

  async function handleProvider(name, callback) {
    setNotice(null);
    if (!callback) {
      showUnavailable(`${name} sign in`);
      return;
    }
    setPending(true);
    try {
      await callback();
    } catch {
      setNotice({ type: "error", text: `${name} sign in didn’t complete. Please try again.` });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="login-page">
      <a className="login-skip-link" href="#login-form">Skip to login</a>

      <header className="login-header">
        <Link className="login-brand" to={guestTo} aria-label="Bhardwaj Grocery Store home">
          <img className="login-brand__logo" src={Logo} alt="Bhardwaj Grocery Store" />
        </Link>
        <Link className="login-guest-link" to={guestTo}>Continue as a guest</Link>
      </header>

      <main className="login-main">
        <section className="login-panel" aria-labelledby="login-title">
          <div className="login-card">
            <h1 id="login-title">Login</h1>
            <p className="login-subtitle">Good to see you again—let’s start shopping</p>

            <div className="login-social-row" aria-label="Other sign-in options">
              <button className="login-social-button" type="button" disabled={pending} onClick={() => handleProvider("Google", onGoogleLogin)}>
                <GoogleIcon />
                <span>Sign in with Google</span>
              </button>
              <span className="login-social-or">or</span>
              <button className="login-social-button login-social-button--apple" type="button" disabled={pending} onClick={() => handleProvider("Apple", onAppleLogin)}>
                <AppleIcon />
                <span>Sign in with Apple</span>
              </button>
            </div>

            <div className="login-divider"><span>or Sign in with Email</span></div>

            <form id="login-form" onSubmit={handleLogin} aria-busy={pending}>
              <div className="login-field login-field--email">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="user1@gmail.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={pending}
                />
              </div>

              <div className="login-field login-field--password">
                <label htmlFor="login-password">Password</label>
                <div className="login-password-wrap">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    disabled={pending}
                  />
                  <button
                    className="login-password-toggle"
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={pending}
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>
              </div>

              <div className="login-options">
                <label className="login-remember" htmlFor="login-remember">
                  <input id="login-remember" name="rememberMe" type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} disabled={pending} />
                  <span>Remember me</span>
                </label>
                {forgotPasswordTo ? (
                  <Link className="login-text-link" to={forgotPasswordTo}>Forgot Password?</Link>
                ) : (
                  <button className="login-text-link" type="button" onClick={() => showUnavailable("Password recovery")}>Forgot Password?</button>
                )}
              </div>

              <button className="login-submit" type="submit" disabled={pending}>
                {pending ? "Signing in…" : "Login"}
              </button>

              {notice && <p className={`login-notice login-notice--${notice.type}`} role={notice.type === "error" ? "alert" : "status"}>{notice.text}</p>}
            </form>

            <p className="login-register">
              Not registered yet?{" "}
              {registerTo ? (
                <Link className="login-text-link" to={registerTo}>Create an account</Link>
              ) : (
                <button className="login-text-link" type="button" onClick={() => showUnavailable("Account creation")}>Create an account</button>
              )}
            </p>
          </div>
        </section>

        <div className="login-visual" aria-hidden="true">
          <img src={LoginImage} alt="" />
        </div>
      </main>

      <footer className="login-footer">©2026 Bhardwaj Grocery Store. All rights reserved.</footer>
    </div>
  );
}
