import { Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";

// Wraps pages that need a signed-in user.

export default function RequireAuth({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for the /me check so a refresh doesn't bounce signed-in users to the login page
  if (loading) return null;

  if (!user) {
    const loginPath = roles ? "/admin/login" : "/login";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Signed in but the wrong role (for example a customer opening an admin page)
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
