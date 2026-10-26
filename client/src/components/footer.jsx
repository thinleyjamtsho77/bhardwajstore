import { Link } from "react-router";
import logo from "../assets/images/footer-logo.png";
import visa from "../assets/images/footer-logo.png";
import mastercard from "../assets/images/footer-logo.png";
import phonepe from "../assets/images/footer-logo.png";
import upi from "../assets/images/footer-logo.png";
import applepay from "../assets/images/footer-logo.png";
import gpay from "../assets/images/footer-logo.png";
import "../assets/styles/footer.css";

const QUICK_LINKS = [
  { label: "Categories", to: "/categories" },
  { label: "Deals", to: "/deals" },
  { label: "FAQs", to: "/faqs" },
  { label: "About Us", to: "/about" },
];

const SERVICE_LINKS = [
  { label: "How Click & Collect Works", to: "/click-and-collect" },
  { label: "Order Cancellation and Refund Policy", to: "/refund-policy" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "Privacy Policy", to: "/privacy" },
];

// Update these with your real details / profile URLs
const STORE = {
  address: "Amritsar, Punjab, India",
  phone: "+91 xxxx-nnnnnn",
  email: "info@bhardwaj.hotmail.com",
  hours: "Mon - Sun 10:00 AM - 9:00 PM",
};
const SOCIAL = {
  facebook: "https://facebook.com/",
  instagram: "https://instagram.com/",
  whatsapp: "https://wa.me/",
  tiktok: "https://tiktok.com/",
};

const PAYMENTS = [
  { src: visa, alt: "Visa" },
  { src: mastercard, alt: "Mastercard" },
  { src: phonepe, alt: "PhonePe" },
  { src: upi, alt: "UPI" },
  { src: applepay, alt: "Apple Pay" },
  { src: gpay, alt: "Google Pay" },
];


const Svg = ({ children, size = 18, viewBox = "0 0 24 24", ...rest }) => (
  <svg viewBox={viewBox} width={size} height={size} fill="currentColor" aria-hidden="true" {...rest}>
    {children}
  </svg>
);

const PinIcon = () => (
  <Svg><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" /></Svg>
);
const PhoneIcon = () => (
  <Svg><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></Svg>
);
const MailIcon = () => (
  <Svg><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></Svg>
);
const ClockIcon = () => (
  <Svg><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z" /></Svg>
);

const FacebookIcon = () => (
  <Svg size={26}><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" /></Svg>
);
const InstagramIcon = () => (
  <Svg size={26}>
    <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2.2" />
    <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="2.2" />
    <circle cx="17.2" cy="6.8" r="1.3" />
  </Svg>
);
const WhatsAppIcon = () => (
  <Svg size={26}>
    <circle cx="12" cy="12" r="11" />
    <path fill="#1f5a27" transform="translate(6.2 6.2) scale(0.48)" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
  </Svg>
);
const TikTokIcon = () => (
  <Svg size={26}>
    <circle cx="12" cy="12" r="11" />
    <path fill="#1f5a27" transform="translate(7.2 6.2) scale(0.4)" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </Svg>
);


export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__grid">
        {/* About */}
        <section className="fcol fcol--about">
          <img src={logo} alt="Bhardwaj Grocery Store" className="fcol__logo" />
          <p className="fcol__blurb">
            Bhardwaj Grocery Store is your trusted wholesale store spices, cereals, pulses and more
          </p>
          <div className="social">
            <a href={SOCIAL.facebook} aria-label="Facebook" target="_blank" rel="noreferrer"><FacebookIcon /></a>
            <a href={SOCIAL.instagram} aria-label="Instagram" target="_blank" rel="noreferrer"><InstagramIcon /></a>
            <a href={SOCIAL.whatsapp} aria-label="WhatsApp" target="_blank" rel="noreferrer"><WhatsAppIcon /></a>
            <a href={SOCIAL.tiktok} aria-label="TikTok" target="_blank" rel="noreferrer"><TikTokIcon /></a>
          </div>
        </section>

        <nav className="fcol fcol--links" aria-label="Quick links">
          <h2 className="fcol__title">Quick Links</h2>
          <ul className="flist">
            {QUICK_LINKS.map((l) => (
              <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
            ))}
          </ul>
        </nav>

  
        <nav className="fcol fcol--links" aria-label="Customer service">
          <h2 className="fcol__title">Customer Service</h2>
          <ul className="flist">
            {SERVICE_LINKS.map((l) => (
              <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
            ))}
          </ul>
        </nav>

        {/* Store info */}
        <section className="fcol fcol--info">
          <h2 className="fcol__title fcol__title--center">Store Information</h2>
          <ul className="flist flist--icons">
            <li><PinIcon /><span>{STORE.address}</span></li>
            <li><PhoneIcon /><a href={`tel:${STORE.phone.replace(/[^+\d]/g, "")}`}>{STORE.phone}</a></li>
            <li><MailIcon /><a href={`mailto:${STORE.email}`}>{STORE.email}</a></li>
            <li><ClockIcon /><span>{STORE.hours}</span></li>
          </ul>
        </section>

        {/* Payments */}
        <section className="fcol fcol--pay">
          <h2 className="fcol__title fcol__title--center">We Accept</h2>
          <div className="pay-grid">
            {PAYMENTS.map((p) => (
              <span className="pay-grid__cell" key={p.alt}>
                <img src={p.src} alt={p.alt} />
              </span>
            ))}
          </div>
        </section>
      </div>
    </footer>
  );
}
