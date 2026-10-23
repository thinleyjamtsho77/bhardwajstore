import { Routes, Route } from "react-router";
import MainLayout from "./components/main-layout";
import Page from "./components/PlaceholderPage";
import Home from "./pages/home";
import UserLogin from "./pages/user-login-page";
import UserRegister from "./pages/user-register";
import AdminCategoriesPage from "./pages/AdminCategoriesPage";
import AdminCategoriesPreview from "./pages/admin/AdminCategoriesPreview";
import Page from "./components/PlaceholderPage";
import CategoriesPage from "./pages/CategoriesPage";
import UserProfilePreview from "./pages/UserProfilePreview";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/admin/categories" element={<AdminCategoriesPage />} />
        <Route
          path="/admin-categories-preview"
          element={<AdminCategoriesPreview />}
        />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/profile-preview" element={<UserProfilePreview />} />
        <Route path="/deals" element={<Page title="Deals" />} />
        <Route path="/faqs" element={<Page title="FAQs" />} />
        <Route path="/about" element={<Page title="About Us" />} />
        <Route
          path="/click-and-collect"
          element={<Page title="How Click & Collect Works" />}
        />
        <Route
          path="/refund-policy"
          element={<Page title="Order Cancellation and Refund Policy" />}
        />
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