import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Lock, Mail, User, Phone, CheckCircle } from "lucide-react";

const RegisterForm = ({ onSubmit, isLoading, onSuccess }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [error, setError] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError(null);
  };

  const handleSendVerification = async () => {
    // Validasi email
    if (!formData.email.includes("@")) {
      setError("Email tidak valid");
      return;
    }

    try {
      // Simulasi kirim kode verifikasi ke email
      console.log("Mengirim kode verifikasi ke:", formData.email);

      // Untuk demo, generate random 6 digit code
      const demoCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log("Kode verifikasi (demo):", demoCode);

      // Simpan ke localStorage untuk verifikasi
      localStorage.setItem("verification_code", demoCode);
      localStorage.setItem("verification_email", formData.email);

      setEmailSent(true);
    } catch (error) {
      console.error("Error sending verification:", error);
      setError("Gagal mengirim kode verifikasi");
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationCode) {
      setError("Masukkan kode verifikasi");
      return;
    }

    setIsVerifying(true);

    try {
      // Ambil kode dari localStorage
      const savedCode = localStorage.getItem("verification_code");
      const savedEmail = localStorage.getItem("verification_email");

      if (verificationCode === savedCode && formData.email === savedEmail) {
        console.log("Email verified successfully!");
        await handleSubmitRegistration();
      } else {
        setError("Kode verifikasi salah");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError("Verifikasi gagal");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmitRegistration = async () => {
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

      // Clear verification data
      localStorage.removeItem("verification_code");
      localStorage.removeItem("verification_email");

      // Call success callback
      onSuccess(formData);
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      setError(err.message || "Registrasi gagal. Periksa data Anda.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validasi sederhana
    if (formData.password !== formData.password_confirmation) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    // Mulai proses verifikasi email
    await handleSendVerification();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl">
          <p className="text-red-700 font-medium">Registrasi Gagal</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Success Verification Message */}
      {emailSent && !isVerifying && (
        <div className="p-4 bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={20} className="text-teal-600" />
            <p className="text-teal-700 font-medium">
              Kode verifikasi telah dikirim!
            </p>
          </div>
          <p className="text-teal-600 text-sm">
            Kami telah mengirim kode verifikasi 6 digit ke{" "}
            <strong>{formData.email}</strong>. Silakan periksa email Anda
            (termasuk folder spam).
          </p>

          {/* Verification Code Input */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kode Verifikasi
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Masukkan 6 digit kode"
                maxLength={6}
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(e.target.value.replace(/\D/g, ""))
                }
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <button
                type="button"
                onClick={handleVerifyEmail}
                disabled={isVerifying || verificationCode.length !== 6}
                className="px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                {isVerifying ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Verifikasi"
                )}
              </button>
            </div>
            <div className="mt-2 flex justify-between">
              <button
                type="button"
                onClick={handleSendVerification}
                className="text-sm text-teal-600 hover:text-teal-700">
                Kirim ulang kode
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmailSent(false);
                  setVerificationCode("");
                }}
                className="text-sm text-gray-600 hover:text-gray-700">
                Ganti email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Fields - hanya tampil jika belum emailSent atau sedang verifikasi */}
      {!emailSent && (
        <>
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Lengkap *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <User size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                placeholder="Masukkan nama lengkap"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 transition-all duration-200"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                placeholder="contoh@email.com"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 transition-all duration-200"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* WhatsApp Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor WhatsApp *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Phone size={18} className="text-gray-400" />
              </div>
              <input
                type="tel"
                name="whatsapp"
                placeholder="081234567890"
                required
                value={formData.whatsapp}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 transition-all duration-200"
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Pastikan nomor WhatsApp aktif untuk verifikasi
            </p>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type="password"
                name="password"
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 transition-all duration-200"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konfirmasi Password *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type="password"
                name="password_confirmation"
                placeholder="Ulangi password"
                required
                minLength={6}
                value={formData.password_confirmation}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 transition-all duration-200"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              required
              className="mt-1 mr-3 w-5 h-5 bg-white border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
              disabled={isLoading}
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              Saya menyetujui{" "}
              <a
                href="/terms"
                className="text-orange-600 hover:text-orange-700 transition-colors">
                Syarat & Ketentuan
              </a>{" "}
              dan{" "}
              <a
                href="/privacy"
                className="text-orange-600 hover:text-orange-700 transition-colors">
                Kebijakan Privasi
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-orange-700 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]">
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Memproses...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Zap size={18} />
                <span>Daftar Sekarang</span>
              </span>
            )}
          </button>

          {/* Login Link */}
          <div className="text-center pt-4">
            <p className="text-gray-600">
              Sudah punya akun?{" "}
              <button
                type="button"
                onClick={() => navigate("/auth/login")}
                className="text-orange-600 font-medium hover:text-orange-700 transition-colors">
                Login di sini
              </button>
            </p>
          </div>
        </>
      )}
    </form>
  );
};

export default RegisterForm;
