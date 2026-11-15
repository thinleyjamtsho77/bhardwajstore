import { Link } from "react-router";
import InfoPage from "../components/InfoPage";
import { STORE } from "../config/storeInfo";

// EDIT: confirm the answers with the store owner
const FAQS = [
  {
    q: "How do I place an order?",
    a: "Browse our products, add what you need to your cart and go to checkout. You will need an account. Choose a collection time, pay, and we will get your order ready.",
  },
  {
    q: "How does Click & Collect work?",
    a: (
      <>
        You order online, choose a collection time slot and pick up your order
        from our store using your pickup token.{" "}
        <Link to="/click-and-collect">See the full steps</Link>.
      </>
    ),
  },
  { q: "What are your opening hours?", a: `We are open every day of the week, ${STORE.hours}.` },
  {
    q: "Do you deliver?",
    a: "At the moment orders are collected from our store in Amritsar. Contact us if you have a special request.",
  },
  {
    q: "Do you offer wholesale or bulk prices?",
    a: (
      <>
        Yes. The more you buy, the less you pay per kilo. See our{" "}
        <Link to="/services">Services page</Link> for bulk prices and current
        deals.
      </>
    ),
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept Visa, Mastercard, UPI, Google Pay, Apple Pay and PhonePe. Contact us if you would like to pay in another way.",
  },
  {
    q: "Can I cancel my order?",
    a: (
      <>
        Yes, in most cases. It depends on how far we have got with your order.
        Read our <Link to="/refund-policy">cancellation and refund policy</Link>.
      </>
    ),
  },
  {
    q: "How long does a refund take?",
    a: "Refunds go back to the way you paid, usually within 5 to 7 business days.",
  },
  {
    q: "Do I need an account to order?",
    a: (
      <>
        Yes. A free account lets us save your orders and pickup details.{" "}
        <Link to="/register">Create an account</Link> or{" "}
        <Link to="/login">log in</Link>.
      </>
    ),
  },
  {
    q: "How can I contact the store?",
    a: (
      <>
        Call us on <a href={`tel:${STORE.phoneLink}`}>{STORE.phone}</a> or email{" "}
        <a href={`mailto:${STORE.email}`}>{STORE.email}</a>.
      </>
    ),
  },
];

export default function FaqsPage() {
  return (
    <InfoPage
      title="Frequently Asked Questions"
      intro="Quick answers about ordering, prices, payments and collecting your groceries."
    >
      <div className="ip-faq">
        {FAQS.map((f) => (
          <details key={f.q}>
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </InfoPage>
  );
}