import InfoPage from "../components/InfoPage";
import { STORE } from "../config/storeInfo";

// EDIT: this is a SAMPLE. Have the store owner review it before the website goes live.
// Check each point matches what the website really does.
const UPDATED = "15 November 2026";

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Privacy Policy"
      intro={`${STORE.name} respects your privacy. This page explains what information we collect and how we use it.`}
      updated={UPDATED}
    >
      <section className="ip-section">
        <h2>Information We Collect</h2>
        <ul>
          <li>Your name, email address and phone number when you create an account.</li>
          <li>Your address details, if you add them to your account.</li>
          <li>Your orders, cart, wishlist and pickup details.</li>
          <li>Messages you send us.</li>
        </ul>
        <p>Your password is stored in a protected (hashed) form, not as plain text.</p>
      </section>

      <section className="ip-section">
        <h2>How We Use It</h2>
        <ul>
          <li>To create your account and process your orders.</li>
          <li>To let you know when your order is ready to collect.</li>
          <li>To answer your questions and improve our website and service.</li>
        </ul>
      </section>

      <section className="ip-section">
        <h2>Payments</h2>
        <p>
          Online payments are handled by our payment provider. We do not store
          your full card number on our website.
        </p>
      </section>

      <section className="ip-section">
        <h2>Cookies</h2>
        <p>
          We use cookies to keep you logged in and to make the website work
          properly.
        </p>
      </section>

      <section className="ip-section">
        <h2>Sharing Your Information</h2>
        <p>
          We do not sell your personal information. We only share it with
          services that help us run the shop, such as our payment provider, or
          when the law requires it.
        </p>
      </section>

      <section className="ip-section">
        <h2>Keeping Your Information Safe</h2>
        <p>
          We take reasonable steps to protect your information. No website can be
          completely secure, so please keep your password private.
        </p>
      </section>

      <section className="ip-section">
        <h2>Your Choices</h2>
        <p>
          You can update your details in your profile. You can also ask us to
          correct or delete your information by contacting us.
        </p>
      </section>

      <section className="ip-section">
        <h2>Contact Us</h2>
        <p>
          Questions about privacy? Email{" "}
          <a href={`mailto:${STORE.email}`}>{STORE.email}</a>.
        </p>
      </section>
    </InfoPage>
  );
}