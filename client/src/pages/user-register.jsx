import { useState } from "react";
import { Link } from "react-router";
import Logo from "../assets/images/logo-header.png";
import RegisterImage from "../assets/images/login_image.png";
import "../assets/styles/Login.css";    
import "../assets/styles/register.css"; 

const MIN_PASSWORD_LENGTH = 8;

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
 * onRegister({ name, email, password }): async callback that calls Express and navigates on success.
 * onGoogleSignup / onAppleSignup: real provider callbacks.
 * guestTo / loginTo / termsTo: routes used by the links on the page.
 */
export default function Register({
  guestTo = "/",
  loginTo = "/login",
  termsTo = "/terms",
  onRegister,
  onGoogleSignup,
  onAppleSignup,
}) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [accepted, setAccepted] = useState(false);
  const [show, setShow] = useState({ password: false, confirm: false });
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState(null);

  const setField = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }));
  const toggleShow = (key) => setShow((s) => ({ ...s, [key]: !s[key] }));

  function showUnavailable(feature) {
    setNotice({ type: "info", text: `${feature} is currently unavailable. Please continue as a guest.` });
  }

  function validate() {
    if (!form.name.trim()) return "Enter your name.";
    if (form.password.length < MIN_PASSWORD_LENGTH)
      return `Use a password with at least ${MIN_PASSWORD_LENGTH} characters.`;
    if (form.password !== form.confirm) return "The two passwords don’t match.";
    if (!accepted) return "Accept the Terms and Conditions to create your account.";
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice(null);

    const problem = validate();
    if (problem) {
      setNotice({ type: "error", text: problem });
      return;
    }
    if (!onRegister) {
      showUnavailable("Account creation");
      return;
    }

    setPending(true);
    try {
      await onRegister({ name: form.name.trim(), email: form.email.trim(), password: form.password });
    } catch (err) {
      setNotice({ type: "error", text: err?.message || "We couldn’t create your account. Please try again." });
    } finally {
      setPending(false);
    }
  }

  async function handleProvider(name, callback) {
    setNotice(null);
    if (!callback) {
      showUnavailable(`${name} sign up`);
      return;
    }
    setPending(true);
    try {
      await callback();
    } catch {
      setNotice({ type: "error", text: `${name} sign up didn’t complete. Please try again.` });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="login-page">
      <a className="login-skip-link" href="#register-form">Skip to sign up</a>

      <header className="login-header login-header--bordered">
        <Link className="login-brand" to={guestTo} aria-label="Bhardwaj Grocery Store home">
          <img className="login-brand__logo" src={Logo} alt="Bhardwaj Grocery Store" />
        </Link>
        <Link className="login-guest-link" to={guestTo}>Continue as a guest</Link>
      </header>

      <main className="login-main">
        <section className="login-panel" aria-labelledby="register-title">
          <div className="login-card login-card--compact">
            <h1 id="register-title">Sign Up</h1>
            <p className="login-subtitle">Sign up today and bring the store closer to home</p>

            <div className="login-social-row" aria-label="Other sign-up options">
              <button className="login-social-button" type="button" disabled={pending} onClick={() => handleProvider("Google", onGoogleSignup)}>
                <GoogleIcon />
                <span>Sign up with Google</span>
              </button>
              <span className="login-social-or">or</span>
              <button className="login-social-button login-social-button--apple" type="button" disabled={pending} onClick={() => handleProvider("Apple", onAppleSignup)}>
                <AppleIcon />
                <span>Sign up with Apple</span>
              </button>
            </div>

            <div className="login-divider"><span>or Sign up with Email</span></div>

            <form id="register-form" onSubmit={handleSubmit} aria-busy={pending} noValidate>
              <div className="login-field">
                <label htmlFor="register-name">Name</label>
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={setField("name")}
                  required
                  disabled={pending}
                />
              </div>

              <div className="login-field">
                <label htmlFor="register-email">Email</label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={setField("email")}
                  required
                  disabled={pending}
                />
              </div>

              <div className="login-field">
                <label htmlFor="register-password">Password</label>
                <div className="login-password-wrap">
                  <input
                    id="register-password"
                    name="password"
                    type={show.password ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={setField("password")}
                    required
                    disabled={pending}
                  />
                  <button
                    className="login-password-toggle"
                    type="button"
                    aria-label={show.password ? "Hide password" : "Show password"}
                    aria-pressed={show.password}
                    onClick={() => toggleShow("password")}
                    disabled={pending}
                  >
                    <EyeIcon visible={show.password} />
                  </button>
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="register-confirm">Confirm Password</label>
                <div className="login-password-wrap">
                  <input
                    id="register-confirm"
                    name="confirmPassword"
                    type={show.confirm ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.confirm}
                    onChange={setField("confirm")}
                    required
                    disabled={pending}
                  />
                  <button
                    className="login-password-toggle"
                    type="button"
                    aria-label={show.confirm ? "Hide confirmed password" : "Show confirmed password"}
                    aria-pressed={show.confirm}
                    onClick={() => toggleShow("confirm")}
                    disabled={pending}
                  >
                    <EyeIcon visible={show.confirm} />
                  </button>
                </div>
              </div>

              <label className="login-remember register-terms" htmlFor="register-terms">
                <input
                  id="register-terms"
                  name="terms"
                  type="checkbox"
                  checked={accepted}
                  onChange={(event) => setAccepted(event.target.checked)}
                  disabled={pending}
                />
                <span>
                  I accept <Link to={termsTo} target="_blank" rel="noreferrer">Terms and Conditions</Link>
                </span>
              </label>

              <button className="login-submit" type="submit" disabled={pending}>
                {pending ? "Creating account…" : "Sign Up"}
              </button>

              {notice && (
                <p className={`login-notice login-notice--${notice.type}`} role={notice.type === "error" ? "alert" : "status"}>
                  {notice.text}
                </p>
              )}
            </form>

            <p className="login-register">
              Already a member? <Link className="login-text-link" to={loginTo}>Log in</Link>
            </p>
          </div>
        </section>

        <div className="login-visual" aria-hidden="true">
          <img src={RegisterImage} alt="" />
        </div>
      </main>

      <footer className="login-footer">©2026 Bhardwaj Grocery Store. All rights reserved.</footer>
    </div>
  );
}
