import { Routes, Route, Navigate } from "react-router";
import MainLayout from "./components/main-layout";
import "./assets/styles/admin/admin-management.css";
import RequireAuth from "./components/RequireAuth";
import Page from "./components/PlaceholderPage";

// Customer pages
import Home from "./pages/HomePage";
import Cart from "./pages/cartPage";
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegistration";
import CategoriesPage from "./pages/categories_new";
import UserProfilePreview from "./pages/UserProfile";
import SearchResults from "./pages/search";
import AllProducts from "./pages/AllProducts";
import WishlistPage from "./pages/WishlistPage";
import OrderHistory from "./pages/OrderHistory";
import Checkout from "./pages/Checkout";
import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";


// Admin pages
import AdminLayout from "./components/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCategoriesPage from "./pages/admin/AdminCategories";
import AdminCategoriesPreview from "./pages/admin/AdminCategoriesPreview";
import StaffManagement from "./pages/admin/StaffManagement";
import CustomerManagement from "./pages/admin/CustomerManagement";
import InventoryManagement from "./pages/admin/InventoryManagement";
import ProductManagement from "./pages/admin/ProductManagement";

//Preventive measure for features that are not completed yet
import AdminComingSoon from "./components/AdminComingSoon";
import ComingSoon from "./components/ComingSoon";

export default function App() {
  return (
    <Routes>
      {/* Customer facing pages that uses main-layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/:slug" element={<CategoriesPage />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/cart" element={<Cart />} />
        
        <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><UserProfilePreview /></RequireAuth>} />
        <Route path="/account" element={<Navigate to="/profile" replace />} />
        <Route path="/settings" element={<RequireAuth><Page title="Settings" /></RequireAuth>} />
        <Route path="/wishlist" element={<RequireAuth><WishlistPage /></RequireAuth>} />
        <Route path="/order-history" element={<RequireAuth><OrderHistory /></RequireAuth>} />
        <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
        <Route path="/products" element={<RequireAuth><ProductListing /></RequireAuth>} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/order-confirmation/:orderNumber" element={<RequireAuth><Page title="Order Confirmation" /></RequireAuth>} />

        <Route path="/deals" element={<ComingSoon title="Deals" />} />
        <Route path="/faqs" element={<ComingSoon title="FAQs" />} />
        <Route path="/about" element={<ComingSoon title="About Us" />} />
        <Route path="/click-and-collect" element={<ComingSoon title="How Click & Collect Works" />} />
        <Route path="/refund-policy" element={<ComingSoon title="Order Cancellation and Refund Policy" />} />
        <Route path="/terms" element={<ComingSoon title="Terms & Conditions" />} />
        <Route path="/privacy" element={<ComingSoon title="Privacy Policy" />} />
        

        <Route path="*" element={<Page title="Page not found" />} />
      </Route>

      {/* Admin site: admin navbar and sidebar, staff and admin only */}
      <Route
        path="/admin"
        element={
          <RequireAuth roles={["staff", "admin"]}>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="categories-preview" element={<AdminCategoriesPreview />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="orders" element={<AdminComingSoon title="Order Mangement" />} />
        <Route path="customers" element={<CustomerManagement />} />
        <Route path="staffs" element={<StaffManagement />} />
        <Route path="inventory" element={<InventoryManagement />} />
        <Route path="payments" element={<AdminComingSoon title="Payment Management" />} />
        <Route path="settings" element={<AdminComingSoon title="Settings" />} />
        <Route path="/admin/products" element={<ProductManagement />} />
        <Route path="*" element={<Page title="Page not found" />} />
      </Route>

      {/* Pages that don't use common layout*/}
      <Route path="/login" element={<UserLogin registerTo="/register" />} />
      <Route path="/register" element={<UserRegister />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/all-products" element={<AllProducts />} /> {/* temporary test page */}
    </Routes>
  );
}
