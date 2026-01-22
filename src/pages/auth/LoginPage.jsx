import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "./components/AuthLayout";
import LoginForm from "./components/LoginForm";

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { login, user, loading: authLoading } = useAuth();

  // Effect untuk redirect jika sudah login
  useEffect(() => {
    if (user && !authLoading) {
      console.log("LoginPage - User already logged in, redirecting...", user);

      // Delay kecil untuk UX yang lebih baik
      const timer = setTimeout(() => {
        redirectBasedOnRole(user.role);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [user, authLoading, navigate]);

  // Fungsi untuk redirect berdasarkan role
  const redirectBasedOnRole = (role) => {
    console.log("LoginPage - Redirecting based on role:", role);

    switch (role) {
      case "admin":
        navigate("/admin/dashboard", { replace: true });
        break;
      case "juri":
        navigate("/judging", { replace: true });
        break;
      case "user":
      default:
        navigate("/", { replace: true });
        break;
    }
  };

  const handleLogin = async (formData) => {
    setIsLoading(true);
    setErrorMessage("");
    setShowSuccess(false);

    try {
      console.log("LoginPage - Attempting login with:", formData);
      const result = await login(formData.email, formData.password);
      console.log("LoginPage - Login result:", result);

      if (result.success) {
        console.log("LoginPage - Login successful");
        setShowSuccess(true);

        // Redirect otomatis akan dilakukan oleh useEffect di atas
        // Biarkan useEffect yang handle redirect
      } else {
        setErrorMessage(result.message || "Login gagal. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("LoginPage - Login error:", error);
      setErrorMessage("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Jika sudah login, tampilkan loading redirect
  if (user && !authLoading) {
    return (
      <AuthLayout
        title="Mengalihkan..."
        subtitle="Anda sudah login, sedang mengarahkan ke halaman yang sesuai"
        type="login">
        <div className="text-center py-12">
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center animate-pulse">
              <svg
                className="w-16 h-16 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Login Ditemukan!
          </h3>
          <p className="text-gray-600 mb-8">
            Mengarahkan Anda ke halaman {user.role}...
          </p>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full animate-progress"></div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Selamat Datang Kembali"
      subtitle="Masuk ke akun Anda untuk melanjutkan voting dan melihat hasil terkini"
      type="login">
      {showSuccess ? (
        <div className="text-center py-12 animate-fade-in">
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center animate-pulse">
              <svg
                className="w-16 h-16 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Login Berhasil!
          </h3>
          <p className="text-gray-600 mb-8">
            Mengarahkan Anda ke halaman yang sesuai...
          </p>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full animate-progress"></div>
          </div>
        </div>
      ) : (
        <>
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-600 text-sm">{errorMessage}</p>
              </div>
            </div>
          )}

          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />

          {/* Demo untuk testing */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Demo Credentials (Testing)
            </h4>
            <div className="space-y-2">
              {[
                {
                  role: "Admin",
                  email: "admin@example.com",
                  password: "password123",
                },
                {
                  role: "Juri",
                  email: "juri@example.com",
                  password: "password123",
                },
                {
                  role: "User",
                  email: "user@example.com",
                  password: "password123",
                },
              ].map((cred, index) => (
                <div
                  key={index}
                  className="p-3 bg-white rounded-lg border border-yellow-300 hover:border-red-300 transition-colors cursor-pointer"
                  onClick={() => handleLogin(cred)}>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-md mb-1">
                        {cred.role}
                      </span>
                      <p className="text-sm text-gray-600">
                        Email: {cred.email}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </AuthLayout>
  );
};

export default LoginPage;
