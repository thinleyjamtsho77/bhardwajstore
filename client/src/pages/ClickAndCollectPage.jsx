import { Link } from "react-router";
import InfoPage from "../components/InfoPage";
import { STORE } from "../config/storeInfo";

const STEPS = [
  { title: "Choose your products", text: "Browse the categories or use search, then add what you need to your cart." },
  { title: "Go to checkout", text: "Log in or create a free account, check your cart and continue to checkout." },
  { title: "Pick a collection time", text: "Choose a date and time slot that suits you. Each slot has a limited number of spaces, so a full slot cannot be chosen." },
  { title: "Pay for your order", text: "Pay using one of the payment methods shown at checkout." },
  { title: "Keep your order number and pickup token", text: "After you order, you receive an order number and a pickup token. You will need the token when you collect." },
  { title: "We prepare your order", text: "Your order moves from Confirmed to Preparing to Ready for pickup. We pack it fresh for you." },
  { title: "Collect at the store", text: "Come to the store in your time slot, show your pickup token to our staff, check your items and go. It is that simple." },
];

export default function ClickAndCollectPage() {
  return (
    <InfoPage
      title="How Click & Collect Works"
      intro="Order online, skip the queue and collect your groceries when it suits you."
    >
      <section className="ip-section">
        <h2>Step by Step</h2>
        <ol className="ip-steps">
          {STEPS.map((s) => (
            <li key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="ip-section">
        <h2>Good to Know</h2>
        <ul>
          <li>We are open every day, {STORE.hours}.</li>
          <li>Please collect during your chosen time slot. Orders that are not collected may be cancelled.</li>
          <li>Cannot make your slot? Call us on <a href={`tel:${STORE.phoneLink}`}>{STORE.phone}</a> and we will help.</li>
          <li>Need to cancel? Read our <Link to="/refund-policy">cancellation and refund policy</Link>.</li>
        </ul>
        <Link to="/products" className="ip-cta">Start Shopping</Link>
      </section>
    </InfoPage>
  );
}