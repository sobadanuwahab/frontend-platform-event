import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // console.log("ProtectedRoute - Checking access:", {
  //   user,
  //   loading,
  //   allowedRoles,
  //   path: location.pathname,
  // });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memeriksa otentikasi...</p>
        </div>
      </div>
    );
  }

  // Jika belum login, redirect ke login page
  if (!user) {
    // console.log("ProtectedRoute - No user, redirecting to login");
    return (
      <Navigate to="/auth/login" state={{ from: location.pathname }} replace />
    );
  }

  // Jika ada role requirement
  if (allowedRoles.length > 0) {
    // Admin bisa akses semua
    if (user.role === "admin") {
      // console.log("ProtectedRoute - Admin access granted");
      return children;
    }

    // Cek apakah user.role ada di allowedRoles
    const hasAccess = allowedRoles.includes(user.role);

    if (!hasAccess) {
      // console.log(
      //   `ProtectedRoute - Access denied for role: ${user.role}, allowed: ${allowedRoles.join(", ")}`,
      // );

      // Show alert
      setTimeout(() => {
        alert(
          `Akses ditolak! Role ${user.role} tidak diizinkan mengakses halaman ini.`,
        );
      }, 100);

      // Redirect berdasarkan role
      if (user.role === "juri") {
        return <Navigate to="/judging" replace />;
      } else if (user.role === "user") {
        return <Navigate to="/" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }
  }

  // console.log("ProtectedRoute - Access granted");
  return children;
};

export default ProtectedRoute;
