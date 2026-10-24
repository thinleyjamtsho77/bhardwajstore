import { Link } from "react-router";
import AdminCategories from "./AdminCategories";

export default function AdminCategoriesPreview() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Bhardwaj Store — Admin Preview</h1>

      <Link to="/categories">Back to Categories</Link>

      <AdminCategories />
    </div>
  );
}