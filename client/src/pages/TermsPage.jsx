import InfoPage from "../components/InfoPage";
import { Link } from "react-router";
import { STORE } from "../config/storeInfo";

// EDIT: this is a SAMPLE. Have the store owner review it before the website goes live.
const UPDATED = "15 November 2026";

export default function TermsPage() {
  return (
    <InfoPage
      title="Terms & Conditions"
      intro={`By using the ${STORE.name} website and placing an order, you agree to these terms.`}
      updated={UPDATED}
    >
      <section className="ip-section">
        <h2>1. Your Account</h2>
        <p>
          You need an account to place an order. Please give correct details and
          keep your password private. You are responsible for activity on your
          account.
        </p>
      </section>

      <section className="ip-section">
        <h2>2. Products and Prices</h2>
        <ul>
          <li>All prices are in Indian Rupees (₹).</li>
          <li>Prices and availability can change. The price shown when you place your order is the price you pay.</li>
          <li>Product pictures are a guide. Packaging may look slightly different.</li>
          <li>If we make a pricing or stock mistake, we may contact you to cancel or change the order.</li>
        </ul>
      </section>

      <section className="ip-section">
        <h2>3. Orders and Click &amp; Collect</h2>
        <p>
          Your order is confirmed once we accept it. You collect it from our store
          in your chosen time slot and show your pickup token. See{" "}
          <Link to="/click-and-collect">How Click &amp; Collect Works</Link>.
        </p>
      </section>

      <section className="ip-section">
        <h2>4. Payment</h2>
        <p>
          You pay using the payment methods shown at checkout. Online card
          payments are handled by our payment provider.
        </p>
      </section>

      <section className="ip-section">
        <h2>5. Cancellations and Refunds</h2>
        <p>
          Please read our{" "}
          <Link to="/refund-policy">Order Cancellation and Refund Policy</Link>.
        </p>
      </section>

      <section className="ip-section">
        <h2>6. Bulk Prices and Deals</h2>
        <p>
          Bulk and wholesale prices depend on the quantity you buy and on stock.
          Deals may change or end without notice. See our{" "}
          <Link to="/services">Services page</Link>.
        </p>
      </section>

      <section className="ip-section">
        <h2>7. Our Responsibility</h2>
        <p>
          We take care to keep the website accurate and available, but we cannot
          promise it will always be free of errors or interruptions. To the extent
          allowed by law, we are not responsible for losses caused by things
          outside our control.
        </p>
      </section>

      <section className="ip-section">
        <h2>8. Changes to These Terms</h2>
        <p>
          We may update these terms from time to time. The date at the top shows
          the latest version.
        </p>
      </section>

      <section className="ip-section">
        <h2>9. Contact</h2>
        <p>
          Questions? Email <a href={`mailto:${STORE.email}`}>{STORE.email}</a> or
          call <a href={`tel:${STORE.phoneLink}`}>{STORE.phone}</a>.
        </p>
      </section>
    </InfoPage>
  );
}