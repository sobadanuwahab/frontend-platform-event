import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "./components/AuthLayout";
import LoginForm from "./components/LoginForm";

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const {
    login,
    user,
    loading: authLoading,
    getRedirectPathByRole,
  } = useAuth();

  // Gunakan useEffect untuk redirect, bukan di render langsung
  useEffect(() => {
    if (user && !authLoading) {
      const redirectPath = getRedirectPathByRole(user.role);
      console.log(
        "LoginPage - User already logged in, redirecting to:",
        redirectPath,
      );
      navigate(redirectPath, { replace: true });
    }
  }, [user, authLoading, navigate, getRedirectPathByRole]);

  const handleLogin = async (formData) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      console.log("LoginPage - Attempting login with:", formData);
      const result = await login(formData.email, formData.password);

      if (result.success) {
        console.log("LoginPage - Login successful, redirecting...");

        // Gunakan navigate dengan replace: true untuk immediate redirect
        const redirectPath = result.redirectPath || "/";
        navigate(redirectPath, { replace: true });

        // JANGAN set state setelah navigate karena component mungkin akan unmount
        return;
      } else {
        setErrorMessage(result.message || "Login gagal. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("LoginPage - Login error:", error);
      setErrorMessage(error.message || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // Jika masih loading auth, tampilkan loading sederhana
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memeriksa sesi...</p>
        </div>
      </div>
    );
  }

  // Jika user sudah login, komponen akan di-redirect oleh useEffect
  // Tampilkan loading kecil selama redirect
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Mengarahkan...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout
      title="Selamat Datang Kembali"
      subtitle="Masuk ke akun Anda untuk melanjutkan voting dan melihat hasil terkini"
      type="login">
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
      </>
    </AuthLayout>
  );
};

export default LoginPage;
