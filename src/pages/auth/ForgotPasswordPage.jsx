// src/pages/auth/ForgotPasswordPage.jsx
import { Mail, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./components/AuthLayout";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulasi API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title={isSubmitted ? "Cek Email Anda" : "Lupa Password"}
      subtitle={
        isSubmitted
          ? "Kami telah mengirim instruksi reset password ke email Anda"
          : "Masukkan email Anda untuk menerima instruksi reset password"
      }
      type="login">
      {isSubmitted ? (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={32} className="text-success-600" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            Email Terkirim!
          </h3>
          <p className="text-neutral-600 mb-8">
            Cek inbox email <strong>{email}</strong> untuk melanjutkan proses
            reset password. Jika tidak ditemukan, cek folder spam.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => navigate("/auth/login")}
              className="w-full py-4 px-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">
              Kembali ke Login
            </button>
            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full py-4 px-4 border border-neutral-300 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-all duration-300">
              Kirim Ulang Email
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Email Terdaftar
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={20} className="text-neutral-400" />
              </div>
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <p className="mt-2 text-sm text-neutral-500">
              Kami akan mengirim link reset password ke email ini.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Mengirim...
              </div>
            ) : (
              "Kirim Instruksi Reset"
            )}
          </button>

          <div className="text-center">
            <Link
              to="/auth/login"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium">
              <ArrowLeft size={16} className="mr-2" />
              Kembali ke halaman Login
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
