// src/pages/auth/RegisterPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./components/AuthLayout";
import RegisterForm from "./components/RegisterForm";
import Toast from "../../components/Toast";

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleRegisterSuccess = async (userData) => {
    setIsLoading(false);
    setToast({
      message: "Registrasi berhasil! Anda akan diarahkan ke halaman login.",
      type: "success",
    });
  };

  return (
    <>
      <AuthLayout
        title="Buat Akun Baru"
        subtitle="Daftar dan verifikasi email untuk mulai voting"
        type="register">
        <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="text-orange-600">🔐</div>
            <div>
              <p className="text-orange-700 font-medium">
                Verifikasi Email Diperlukan
              </p>
              <p className="text-orange-600 text-sm mt-1">
                Kami akan mengirim kode OTP 6 digit ke email Anda untuk
                memastikan keamanan akun.
              </p>
            </div>
          </div>
        </div>

        <RegisterForm isLoading={isLoading} onSuccess={handleRegisterSuccess} />
      </AuthLayout>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default RegisterPage;
