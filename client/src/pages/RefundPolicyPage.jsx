import InfoPage from "../components/InfoPage";
import { Link } from "react-router";
import { STORE } from "../config/storeInfo";

// EDIT: the times and rules below are SAMPLES. Agree the real rules with the store owner.
const UPDATED = "15 November 2026";

export default function RefundPolicyPage() {
  return (
    <InfoPage
      title="Order Cancellation and Refund Policy"
      intro="We want you to be happy with your order. This page explains how cancellations and refunds work."
      updated={UPDATED}
    >
      <section className="ip-section">
        <h2>Cancelling an Order</h2>
        <div className="ip-table-wrap">
          <table className="ip-table">
            <thead>
              <tr><th>Order status</th><th>Can I cancel?</th></tr>
            </thead>
            <tbody>
              <tr><td>Pending or Confirmed</td><td>Yes. Free cancellation with a full refund.</td></tr>
              <tr><td>Preparing</td><td>Contact us as soon as possible. We will cancel if we have not finished packing your order.</td></tr>
              <tr><td>Ready for pickup</td><td>Contact us. We will try to help, but it may not always be possible.</td></tr>
              <tr><td>Collected</td><td>The order cannot be cancelled. See the section on problems with items below.</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          To cancel, call <a href={`tel:${STORE.phoneLink}`}>{STORE.phone}</a> or
          email <a href={`mailto:${STORE.email}`}>{STORE.email}</a> with your order
          number.
        </p>
      </section>

      <section className="ip-section">
        <h2>Refunds</h2>
        <ul>
          <li>Refunds go back to the way you paid, usually within 5 to 7 business days.</li>
          <li>If you paid cash when collecting, refunds are given in cash at the store.</li>
          <li>Your bank may take extra time to show the refund in your account.</li>
        </ul>
      </section>

      <section className="ip-section">
        <h2>Problems With Your Items</h2>
        <p>
          If an item is damaged, wrong or not of the quality you expect, tell us
          within 24 hours of collecting your order. Please bring the item and your
          order number. We will offer a replacement or a refund.
        </p>
      </section>

      <section className="ip-section">
        <h2>Orders Not Collected</h2>
        <p>
          If you do not collect your order within one day of your chosen time
          slot, we may cancel it and refund you. Please contact us if you need
          more time.
        </p>
      </section>

      <section className="ip-section">
        <h2>Bulk and Wholesale Orders</h2>
        <p>
          Large orders may have different cancellation terms because we prepare
          stock specially. Please speak to us when you place a bulk order.
        </p>
      </section>

      <section className="ip-section">
        <h2>Questions?</h2>
        <p>
          Check our <Link to="/faqs">FAQs</Link> or contact the store on{" "}
          <a href={`tel:${STORE.phoneLink}`}>{STORE.phone}</a>.
        </p>
      </section>
    </InfoPage>
  );
}
