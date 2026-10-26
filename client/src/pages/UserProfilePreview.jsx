import { Link } from "react-router";
import UserProfile from "./UserProfile";

export default function UserProfilePreview() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Bhardwaj Store — Profile Preview</h1>
      <Link to="/categories">Back to Categories</Link>
      <UserProfile />
    </div>
  );
}