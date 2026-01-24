// src/pages/auth/components/RegisterForm.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Lock, Mail, User, Phone } from "lucide-react";

const RegisterForm = ({ onSubmit, isLoading }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validasi sederhana
    if (formData.password !== formData.password_confirmation) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    try {
      console.log("Register attempt with:", {
        email: formData.email,
        name: formData.name,
        whatsapp: formData.whatsapp,
      });

      const res = await fetch("https://apipaskibra.my.id/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          whatsapp: formData.whatsapp,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
        }),
      });

      const responseData = await res.json();
      console.log("Register response:", responseData);

      if (!res.ok) {
        if (responseData.errors) {
          const errorMessages = Object.values(responseData.errors)
            .flat()
            .join(", ");
          throw new Error(errorMessages);
        }
        throw new Error(responseData.message || "Registrasi gagal");
      }

      console.log("Register successful:", responseData);
      setSuccess(true);

      // Kirim data ke parent untuk animasi success
      onSubmit(formData);
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      setError(err.message || "Registrasi gagal. Periksa data Anda.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 border border-green-700/30 rounded-xl">
          <p className="text-green-400 font-medium">
            ✅ Registrasi berhasil! Mengarahkan ke halaman utama...
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-gradient-to-r from-red-900/20 to-pink-900/20 border border-red-700/30 rounded-xl">
          <p className="text-red-400 font-medium">Registrasi Gagal</p>
          <p className="text-red-300 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Name Field */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Nama Lengkap *
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <User size={18} className="text-gray-500" />
          </div>
          <input
            type="text"
            name="name"
            placeholder="Masukkan nama lengkap"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-300 placeholder-gray-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Email Field */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email *
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Mail size={18} className="text-gray-500" />
          </div>
          <input
            type="email"
            name="email"
            placeholder="contoh@email.com"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-300 placeholder-gray-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* WhatsApp Field */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Nomor WhatsApp *
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Phone size={18} className="text-gray-500" />
          </div>
          <input
            type="tel"
            name="whatsapp"
            placeholder="081234567890"
            required
            value={formData.whatsapp}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-300 placeholder-gray-500 transition-all duration-200"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Pastikan nomor WhatsApp aktif untuk verifikasi
        </p>
      </div>

      {/* Password Field */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Password *
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Lock size={18} className="text-gray-500" />
          </div>
          <input
            type="password"
            name="password"
            placeholder="Minimal 6 karakter"
            required
            minLength={6}
            value={formData.password}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-300 placeholder-gray-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Confirm Password Field */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Konfirmasi Password *
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Lock size={18} className="text-gray-500" />
          </div>
          <input
            type="password"
            name="password_confirmation"
            placeholder="Ulangi password"
            required
            minLength={6}
            value={formData.password_confirmation}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-300 placeholder-gray-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-start">
        <input
          type="checkbox"
          id="terms"
          required
          className="mt-1 mr-3 w-5 h-5 bg-gray-800 border-gray-700 rounded focus:ring-red-500 focus:ring-2"
        />
        <label htmlFor="terms" className="text-sm text-gray-400">
          Saya menyetujui{" "}
          <a
            href="/terms"
            className="text-red-400 hover:text-red-300 transition-colors">
            Syarat & Ketentuan
          </a>{" "}
          dan{" "}
          <a
            href="/privacy"
            className="text-red-400 hover:text-red-300 transition-colors">
            Kebijakan Privasi
          </a>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-medium rounded-xl hover:from-red-700 hover:to-pink-700 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group">
        {isLoading ? (
          <span className="flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Memproses...
          </span>
        ) : (
          <span className="flex items-center justify-center space-x-2">
            <Zap
              size={18}
              className="group-hover:rotate-12 transition-transform"
            />
            <span>Daftar Sekarang</span>
          </span>
        )}
      </button>

      {/* Login Link */}
      <div className="text-center pt-4">
        <p className="text-gray-400">
          Sudah punya akun?{" "}
          <button
            type="button"
            onClick={() => navigate("/auth/login")}
            className="text-red-400 font-medium hover:text-red-300 transition-colors">
            Login di sini
          </button>
        </p>
      </div>

      {/* Debug Info (optional) */}
      <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
        <p className="text-sm text-gray-400 mb-2 font-medium">
          💡 Informasi Debug API:
        </p>
        <p className="text-xs text-gray-500">
          Endpoint: POST https://apipaskibra.my.id/api/register
        </p>
        <p className="text-xs text-gray-500">
          Expected fields: name, whatsapp, email, password,
          password_confirmation
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;
