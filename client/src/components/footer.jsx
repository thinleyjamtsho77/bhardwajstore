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

const VisaIcon = () => (
  <Svg size={50}>
    <svg
      viewBox="0 -140 780 780"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Visa"
    >
      <path
        d="M53.487,14h673.524c21.257,0,38.488,16.816,38.488,37.559v394.38 c0,20.744-17.231,37.561-38.488,37.561H53.487C32.231,483.5,15,466.684,15,445.939V51.559C15,30.816,32.231,14,53.487,14z"
        fill="none"
        stroke="#fff"
        strokeWidth="30"
      />
      <path
        d="m296.86 342.7l32.099-183.82h51.344l-32.123 183.82h-51.32zm236.8-179.86c-10.172-3.724-26.108-7.721-46.014-7.721-50.731 0-86.466 24.931-86.77 60.662-0.287 26.414 25.511 41.149 44.984 49.941 19.985 9.01 26.703 14.755 26.608 22.801-0.127 12.322-15.96 17.952-30.715 17.952-20.549 0-31.467-2.786-48.327-9.65l-6.616-2.921-7.207 41.149c11.993 5.132 34.168 9.578 57.191 9.808 53.967 0 89.002-24.646 89.401-62.801 0.193-20.912-13.484-36.826-43.105-49.945-17.945-8.502-28.936-14.178-28.818-22.788 0-7.64 9.301-15.812 29.399-15.812 16.791-0.254 28.951 3.319 38.427 7.043l4.601 2.122 6.96-39.843m132.12-3.963h-39.671c-12.29 0-21.487 3.274-26.886 15.245l-76.245 168.46h53.91s8.815-22.653 10.81-27.625c5.892 0 58.264 0.079 65.752 0.079 1.535 6.436 6.245 27.546 6.245 27.546h47.641l-41.556-183.71zm-62.943 118.7c4.246-10.591 20.455-51.385 20.455-51.385-0.303 0.491 4.215-10.643 6.81-17.543l3.468 15.849s9.831 43.878 11.886 53.079h-42.619zm-349.55-118.7l-50.264 125.35-5.356-25.476c-9.357-29.366-38.511-61.182-71.103-77.11l45.959 160.76 54.32-0.061 80.827-183.47h-54.383"
        fill="#fff"
      />
      <path
        d="m156.11 158.88h-82.787l-0.655 3.825c64.406 15.216 107.02 51.984 124.72 96.166l-18.002-84.473c-3.108-11.638-12.121-15.111-23.272-15.518"
        fill="#fff"
      />
    </svg>
  </Svg>
)

const MasterIcon = () => (
  <Svg size={50}>
    <svg
      viewBox="0 -9 58 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Mastercard"
    >
      <rect
        x="0.5"
        y="0.5"
        width="57"
        height="39"
        rx="3.5"
        fill="white"
        stroke="#F3F3F3"
      />
      <path
        d="M34.3102 28.9765H23.9591V10.5122H34.3102V28.9765Z"
        fill="#FF5F00"
      />
      <path
        d="M24.6223 19.7429C24.6223 15.9973 26.3891 12.6608 29.1406 10.5107C27.1285 8.93843 24.5892 7.99998 21.8294 7.99998C15.2961 7.99998 10 13.2574 10 19.7429C10 26.2283 15.2961 31.4857 21.8294 31.4857C24.5892 31.4857 27.1285 30.5473 29.1406 28.975C26.3891 26.8249 24.6223 23.4884 24.6223 19.7429"
        fill="#EB001B"
      />
      <path
        d="M48.2706 19.7429C48.2706 26.2283 42.9745 31.4857 36.4412 31.4857C33.6814 31.4857 31.1421 30.5473 29.1293 28.975C31.8815 26.8249 33.6483 23.4884 33.6483 19.7429C33.6483 15.9973 31.8815 12.6608 29.1293 10.5107C31.1421 8.93843 33.6814 7.99998 36.4412 7.99998C42.9745 7.99998 48.2706 13.2574 48.2706 19.7429"
        fill="#F79E1B"
      />
    </svg>
  </Svg>
)
const PhonePeIcon = () => (
  <Svg size={40}>
    <svg
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="PhonePe"
    >
      <g
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="24" cy="24" r="21.5" />
        <line x1="19.8055" y1="8.5" x2="28.8973" y2="18.8312" />
        <line x1="13.2366" y1="18.8312" x2="34.7634" y2="18.8312" />
        <path d="M29.2874,39.5c-.4439-9.0064-.39-20.6688-.39-20.6688" />
        <path d="M18.97,18.8312c0,3.1275-.1189,7.93-.1189,9.0192a4.2326,4.2326,0,0,0,4.9636,4.2977,30.2014,30.2014,0,0,0,5.1918-1.1168" />
      </g>
    </svg>
  </Svg>
)

const ApplePayIcon = () => (
  <Svg size={50}>
    <svg
      viewBox="0 -9 58 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Apple Pay"
    >
      <rect
        x="0.5"
        y="0.5"
        width="57"
        height="39"
        rx="3.5"
        fill="white"
        stroke="#F3F3F3"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.5771 14.9265C17.1553 15.4313 16.4803 15.8294 15.8053 15.7725C15.7209 15.09 16.0513 14.3649 16.4381 13.9171C16.8599 13.3981 17.5982 13.0284 18.1959 13C18.2662 13.7109 17.992 14.4076 17.5771 14.9265ZM18.1888 15.9076C17.5942 15.873 17.0516 16.0884 16.6133 16.2624C16.3313 16.3744 16.0924 16.4692 15.9107 16.4692C15.7068 16.4692 15.4581 16.3693 15.1789 16.2571C14.813 16.1102 14.3947 15.9422 13.956 15.9502C12.9506 15.9645 12.0154 16.5403 11.5021 17.4573C10.4474 19.2915 11.2279 22.0071 12.2474 23.5C12.7467 24.2393 13.3443 25.0498 14.1318 25.0213C14.4783 25.0081 14.7275 24.9012 14.9854 24.7905C15.2823 24.6631 15.5908 24.5308 16.0724 24.5308C16.5374 24.5308 16.8324 24.6597 17.1155 24.7834C17.3847 24.9011 17.6433 25.014 18.0271 25.0071C18.8428 24.9929 19.356 24.2678 19.8553 23.5284C20.394 22.7349 20.6307 21.9605 20.6667 21.843L20.6709 21.8294C20.67 21.8285 20.6634 21.8254 20.6516 21.82C20.4715 21.7366 19.095 21.0995 19.0818 19.391C19.0686 17.957 20.1736 17.2304 20.3476 17.116C20.3582 17.109 20.3653 17.1043 20.3685 17.1019C19.6654 16.0498 18.5685 15.936 18.1888 15.9076ZM23.8349 24.9289V13.846H27.9482C30.0717 13.846 31.5553 15.3246 31.5553 17.4858C31.5553 19.6469 30.0435 21.1398 27.892 21.1398H25.5365V24.9289H23.8349ZM25.5365 15.2962H27.4982C28.9748 15.2962 29.8185 16.0924 29.8185 17.4929C29.8185 18.8934 28.9748 19.6967 27.4912 19.6967H25.5365V15.2962ZM37.1732 23.5995C36.7232 24.4668 35.7318 25.0142 34.6631 25.0142C33.081 25.0142 31.9771 24.0616 31.9771 22.6256C31.9771 21.2038 33.0459 20.3863 35.0217 20.2654L37.1451 20.1374V19.5261C37.1451 18.6232 36.5615 18.1327 35.5209 18.1327C34.6631 18.1327 34.0373 18.5806 33.9107 19.263H32.3779C32.4271 17.827 33.7631 16.782 35.5701 16.782C37.5177 16.782 38.7834 17.8128 38.7834 19.4123V24.9289H37.2084V23.5995H37.1732ZM35.1201 23.6991C34.2131 23.6991 33.6365 23.2583 33.6365 22.5829C33.6365 21.8863 34.192 21.481 35.2537 21.4171L37.1451 21.2962V21.9218C37.1451 22.9597 36.2732 23.6991 35.1201 23.6991ZM44.0076 25.3626C43.3256 27.3033 42.5451 27.9431 40.8857 27.9431C40.7592 27.9431 40.3373 27.9289 40.2388 27.9005V26.5711C40.3443 26.5853 40.6045 26.5995 40.7381 26.5995C41.4904 26.5995 41.9123 26.2796 42.1724 25.4479L42.3271 24.9573L39.4443 16.8886H41.2232L43.2271 23.436H43.2623L45.2662 16.8886H46.9959L44.0076 25.3626Z"
        fill="#000"
      />
    </svg>
  </Svg>
)

const GPayIcon = () => (
  <Svg size={50}>
    <svg
      viewBox="0 -9 58 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Google Pay"
    >
      <rect
        x="0.5"
        y="0.5"
        width="57"
        height="39"
        rx="3.5"
        fill="white"
        stroke="#F3F3F3"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M27.9174 24.1182V19.6071V19.6062H30.3578C31.3639 19.6068 32.2095 19.2907 32.8945 18.6578C33.5868 18.0571 33.9738 17.1935 33.9541 16.2934C33.9678 15.3982 33.5815 14.541 32.8945 13.9422C32.2155 13.3059 31.3023 12.9587 30.3578 12.9778H26.4404V24.1182H27.9174ZM27.9174 18.2382V14.3494V14.3485H30.3945C30.9466 14.3334 31.4788 14.5487 31.856 14.9396C32.2355 15.2971 32.4496 15.7881 32.4496 16.3009C32.4496 16.8137 32.2355 17.3048 31.856 17.6622C31.4741 18.0449 30.9436 18.254 30.3945 18.2382H27.9174Z"
        fill="#5F6368"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M39.9431 17.0951C39.3113 16.5297 38.4496 16.2471 37.3578 16.2471C35.9554 16.2471 34.8963 16.7448 34.1807 17.7404L35.4817 18.5342C35.9624 17.8598 36.6153 17.5226 37.4404 17.5226C37.9664 17.5167 38.4755 17.703 38.8661 18.0444C39.2555 18.3564 39.4795 18.8215 39.4762 19.3111V19.6382C38.9086 19.3271 38.1863 19.1715 37.3092 19.1715C36.2817 19.1727 35.4603 19.4062 34.845 19.872C34.2297 20.3377 33.922 20.965 33.922 21.7537C33.9086 22.4719 34.2302 23.1577 34.7973 23.6204C35.3807 24.1182 36.1058 24.3671 36.9725 24.3671C37.9878 24.3671 38.8012 23.9315 39.4129 23.0604H39.4771V24.1182H40.8899V19.4204C40.8905 18.4355 40.5749 17.6604 39.9431 17.0951ZM35.9367 22.7182C35.6273 22.5021 35.4448 22.1544 35.4468 21.7848C35.4468 21.3697 35.6477 21.024 36.0523 20.7395C36.4529 20.4592 36.9532 20.3191 37.5532 20.3191C38.3771 20.3191 39.0193 20.4968 39.4798 20.8524C39.4798 21.4533 39.2352 21.9768 38.7459 22.4231C38.3052 22.8501 37.7077 23.0905 37.0844 23.0915C36.6689 23.099 36.2634 22.9672 35.9367 22.7182Z"
        fill="#5F6368"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M49 16.496L44.0679 27.4782H42.5431L44.3734 23.6355L41.1303 16.496H42.7358L45.0798 21.9715H45.1119L47.3917 16.496H49Z"
        fill="#5F6368"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.9486 18.6347C21.9492 18.1986 21.9111 17.7632 21.8349 17.3334H15.6055V19.7983H19.1734C19.0259 20.5938 18.5493 21.2964 17.8541 21.7432V23.3432H19.9835C21.2303 22.2294 21.9486 20.5823 21.9486 18.6347Z"
        fill="#4285F4"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.6055 24.8889C17.3881 24.8889 18.889 24.3217 19.9835 23.344L17.8541 21.744C17.2615 22.1333 16.4982 22.3555 15.6055 22.3555C13.8826 22.3555 12.4202 21.2302 11.8973 19.7137H9.70367V21.3626C10.8249 23.5244 13.1085 24.8887 15.6055 24.8889Z"
        fill="#34A853"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.8973 19.7138C11.6208 18.9192 11.6208 18.0586 11.8973 17.264V15.6151H9.70367C8.76585 17.4232 8.76585 19.5546 9.70367 21.3627L11.8973 19.7138Z"
        fill="#FBBC04"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.6055 14.6223C16.5475 14.6073 17.4577 14.9522 18.1395 15.5823V15.5823L20.0248 13.7556C18.8293 12.6677 17.2455 12.0704 15.6055 12.0889C13.1085 12.089 10.8249 13.4534 9.70367 15.6151L11.8973 17.264C12.4202 15.7476 13.8826 14.6223 15.6055 14.6223Z"
        fill="#EA4335"
      />
    </svg>
  </Svg>
)

const PAYMENTS = [
  { Icon: VisaIcon, alt: "Visa" },
  { Icon: MasterIcon, alt: "Mastercard" },
  { Icon: PhonePeIcon, alt: "PhonePe" },
  { src: "/images/payments/upi.svg", alt: "UPI" },
  { Icon: ApplePayIcon, alt: "Apple Pay" },
  { Icon: GPayIcon, alt: "Google Pay" },
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
  <svg
    width={26}
    height={26}
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="WhatsApp"
  >
    <path
      fill="none"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M24,2.5A21.52,21.52,0,0,0,5.15,34.36L2.5,45.5l11.14-2.65A21.5,21.5,0,1,0,24,2.5ZM13.25,12.27h5.86a1,1,0,0,1,1,1,10.4,10.4,0,0,0,.66,3.91,1.93,1.93,0,0,1-.66,2.44l-2.05,2a18.6,18.6,0,0,0,3.52,4.79A18.6,18.6,0,0,0,26.35,30l2-2.05c1-1,1.46-1,2.44-.66a10.4,10.4,0,0,0,3.91.66,1.05,1.05,0,0,1,1,1v5.86a1.05,1.05,0,0,1-1,1,23.68,23.68,0,0,1-15.64-6.84,23.6,23.6,0,0,1-6.84-15.64A1.07,1.07,0,0,1,13.25,12.27Z"
    />
  </svg>
)
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
            {PAYMENTS.map(({ Icon, src, alt }) => (
              <span className="pay-grid__cell" key={alt}>
                {Icon ? <Icon /> : <img src={src} alt={alt} />}
              </span>
            ))}
          </div>
        </section>
      </div>
    </footer>
  );
}
