import { Link } from "react-router";
import Categories from "./categories_new";

export default function CategoriesPage() {
  return (
    <>
      <div style={{ padding: 24 }}>
        <Link to="/profile-preview">My Profile (demo)</Link>
      </div>
      <Categories />
    </>
  );
}