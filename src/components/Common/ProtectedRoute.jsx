import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, getRedirectPathByRole } = useAuth();
  const location = useLocation();

  // Jika belum login, redirect ke login page
  if (!user) {
    return (
      <Navigate to="/auth/login" state={{ from: location.pathname }} replace />
    );
  }

  // Jika ada role requirement
  if (allowedRoles.length > 0) {
    // Admin bisa akses semua
    if (user.role === "admin") {
      return children;
    }

    // Cek apakah user.role ada di allowedRoles
    const hasAccess = allowedRoles.includes(user.role);

    if (!hasAccess) {
      // Dapatkan redirect path dari AuthContext
      const redirectPath = getRedirectPathByRole(user.role);
      return <Navigate to={redirectPath} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
