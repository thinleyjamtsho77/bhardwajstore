import { Link } from "react-router";
import Categories from "./categories";

export default function AdminCategoriesPage() {
  return (
    <>
      <div style={{ padding: 24 }}>
        <Link to="/admin-categories-preview">
          Manage Categories (demo)
        </Link>
      </div>

      <Categories />
    </>
  );
}