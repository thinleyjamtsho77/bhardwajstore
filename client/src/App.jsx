import { Routes, Route } from "react-router";
import MainLayout from "./components/main-layout";
import Page from "./components/PlaceholderPage";
import Home from "./pages/HomePage";
import Cart from "./pages/cartPage";
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegistration";
import AdminCategoriesPage from "./pages/admin/AdminCategories";
import AdminCategoriesPreview from "./pages/admin/AdminCategoriesPreview";
import CategoriesPage from "./pages/categories_new";
import CategoryProductsPage from "./pages/CategoryProductsPage";
import UserProfilePreview from "./pages/UserProfile";
import SearchResults from "./pages/search";

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />

        <Route
          path="/admin/categories"
          element={<AdminCategoriesPage />}
        />
        <Route
          path="/admin-categories-preview"
          element={<AdminCategoriesPreview />}
        />

        <Route path="/categories" element={<CategoriesPage />} />
        <Route
          path="/categories/:categoryId"
          element={<CategoryProductsPage />}
        />

        <Route path="/cart" element={<Cart />} />
        <Route
          path="/profile-preview"
          element={<UserProfilePreview />}
        />
        <Route path="/search" element={<SearchResults />} />

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
        <Route
          path="/terms"
          element={<Page title="Terms & Conditions" />}
        />
        <Route
          path="/privacy"
          element={<Page title="Privacy Policy" />}
        />
      </Route>

      <Route
        path="/login"
        element={<UserLogin registerTo="/register" />}
      />
      <Route path="/register" element={<UserRegister />} />
    </Routes>
  );
}