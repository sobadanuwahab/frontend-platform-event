import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError(null); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Validasi sederhana
    if (formData.password !== formData.password_confirmation) {
      setError("Password dan konfirmasi password tidak cocok");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      setLoading(false);
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
        // Cek jika ada error validasi dari Laravel
        if (responseData.errors) {
          const errorMessages = Object.values(responseData.errors)
            .flat()
            .join(", ");
          throw new Error(errorMessages);
        }
        throw new Error(responseData.message || "Registrasi gagal");
      }

      console.log("Register successful:", responseData);

      // Tampilkan pesan sukses
      setSuccess(true);

      // Redirect ke login setelah 2 detik
      setTimeout(() => {
        alert("Registrasi berhasil! Silakan login dengan akun Anda.");
        navigate("/auth/login");
      }, 2000);
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      setError(err.message || "Registrasi gagal. Periksa data Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Success Message */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-medium">
              Registrasi berhasil! Mengarahkan ke halaman login...
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">Registrasi Gagal</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Lengkap *
          </label>
          <input
            type="text"
            name="name"
            placeholder="Masukkan nama lengkap"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            placeholder="contoh@email.com"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* WhatsApp Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nomor WhatsApp *
          </label>
          <input
            type="tel"
            name="whatsapp"
            placeholder="081234567890"
            required
            value={formData.whatsapp}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Pastikan nomor WhatsApp aktif untuk verifikasi
          </p>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <input
            type="password"
            name="password"
            placeholder="Minimal 6 karakter"
            required
            minLength={6}
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Konfirmasi Password *
          </label>
          <input
            type="password"
            name="password_confirmation"
            placeholder="Ulangi password"
            required
            minLength={6}
            value={formData.password_confirmation}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start">
          <input type="checkbox" id="terms" required className="mt-1 mr-3" />
          <label htmlFor="terms" className="text-sm text-gray-600">
            Saya menyetujui{" "}
            <a href="/terms" className="text-blue-600 hover:underline">
              Syarat & Ketentuan
            </a>{" "}
            dan{" "}
            <a href="/privacy" className="text-blue-600 hover:underline">
              Kebijakan Privasi
            </a>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Memproses...
            </span>
          ) : (
            "Daftar Sekarang"
          )}
        </button>

        {/* Login Link */}
        <div className="text-center pt-4">
          <p className="text-gray-600">
            Sudah punya akun?{" "}
            <button
              type="button"
              onClick={() => navigate("/auth/login")}
              className="text-blue-600 font-medium hover:underline">
              Login di sini
            </button>
          </p>
        </div>
      </form>

      {/* Debug Info (optional) */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-2 font-medium">
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
    </div>
  );
};

export default RegisterForm;
