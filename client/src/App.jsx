import { Routes, Route } from "react-router";
import MainLayout from "./components/main-layout";
import Home from "./pages/home";
import UserLogin from "./pages/user-login-page";
import UserRegister from "./pages/user-register";
import Categories from "./pages/categories";

const Page = ({ title }) => <h1 style={{ padding: 48 }}>{title}</h1>;

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/deals" element={<Page title="Deals" />} />
        <Route path="/faqs" element={<Page title="FAQs" />} />
        <Route path="/about" element={<Page title="About Us" />} />
        <Route path="/click-and-collect" element={<Page title="How Click & Collect Works" />} />
        <Route path="/refund-policy" element={<Page title="Order Cancellation and Refund Policy" />} />
        <Route path="/terms" element={<Page title="Terms & Conditions" />} />
        <Route path="/privacy" element={<Page title="Privacy Policy" />} />
        <Route path="/cart" element={<Page title="Cart" />} />
        <Route path="/search" element={<Page title="Search" />} />
      </Route>
      <Route path="/login" element={<UserLogin registerTo="/register" />} />
      <Route path="/register" element={<UserRegister />} />
    </Routes>
  );
}