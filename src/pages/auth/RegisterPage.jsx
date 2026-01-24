// src/pages/auth/RegisterPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./components/AuthLayout";
import RegisterForm from "./components/RegisterForm";
import {
  CheckCircle,
  Trophy,
  Users,
  Award,
  Sparkles,
  Rocket,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (formData) => {
    setIsLoading(true);
    try {
      // Simulasi API call dengan progress steps
      setStep(1);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setStep(2);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setStep(3);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Simpan data user
      const registeredUserData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: "Anggota Premium",
        avatar: formData.name.charAt(0).toUpperCase(),
        loggedIn: true,
        joinDate: new Date().toLocaleDateString("id-ID"),
        points: 100, // Bonus points for registration
      };

      localStorage.setItem("user", JSON.stringify(registeredUserData));
      setUserData(registeredUserData);

      // Tampilkan animasi success
      setShowSuccess(true);

      // Tunggu untuk animasi
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect ke halaman utama
      navigate("/");

      // Refresh halaman
      setTimeout(() => window.location.reload(), 100);
    } catch (error) {
      console.error("Register error:", error);
      alert("Pendaftaran gagal. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Bergabung dengan Komunitas"
      subtitle="Daftar sekarang untuk mulai memberikan voting dan mendukung tim favorit Anda"
      type="register">
      {showSuccess ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8">
          <div className="relative mb-6">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-32 h-32 mx-auto bg-gradient-to-br from-red-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
              <CheckCircle className="w-16 h-16 text-white" />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-pink-600/20 rounded-full blur-xl"></div>
          </div>

          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 mb-3">
            Selamat Bergabung!
          </h3>
          <p className="text-gray-400 mb-6">
            Akun Anda telah berhasil dibuat. Selamat datang di komunitas Lomba
            Paskibra 2026.
          </p>

          {userData && (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl border border-gray-800 mb-8">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center">
                  <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-400">
                    {userData.points}
                  </div>
                  <div className="text-sm text-gray-400">Poin Bonus</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center">
                  <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-pink-400">
                    Premium
                  </div>
                  <div className="text-sm text-gray-400">Status Member</div>
                </motion.div>
              </div>
              <p className="text-sm text-gray-400 text-center">
                🎉 Selamat! Anda mendapatkan{" "}
                <span className="font-bold text-yellow-400">
                  100 poin bonus
                </span>{" "}
                dan status{" "}
                <span className="font-bold text-red-400">Anggota Premium</span>.
              </p>
            </div>
          )}

          <div className="space-y-4 mb-8">
            <h4 className="font-bold text-white text-lg">Apa selanjutnya?</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: "🏆",
                  text: "Berikan voting pertama",
                  color: "from-yellow-600/20 to-orange-600/20",
                },
                {
                  icon: "👥",
                  text: "Bergabung dengan komunitas",
                  color: "from-blue-600/20 to-cyan-600/20",
                },
                {
                  icon: "🔔",
                  text: "Dapatkan notifikasi",
                  color: "from-emerald-600/20 to-green-600/20",
                },
                {
                  icon: "📈",
                  text: "Pantau perkembangan",
                  color: "from-purple-600/20 to-pink-600/20",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`bg-gradient-to-br ${item.color} p-3 rounded-xl border border-gray-800`}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-gray-300 text-sm">{item.text}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2 }}
              className="h-full bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 rounded-full"
            />
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Mengarahkan ke halaman utama...
          </p>
        </motion.div>
      ) : (
        <>
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div
                className={`flex items-center gap-2 ${step >= 1 ? "text-red-400" : "text-gray-500"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg" : "bg-gray-800 text-gray-400"}`}>
                  1
                </div>
                <span className="text-sm font-medium hidden sm:inline">
                  Data Diri
                </span>
              </div>
              <div
                className={`flex-1 h-1 ${step >= 2 ? "bg-gradient-to-r from-red-600 to-pink-600" : "bg-gray-800"}`}></div>
              <div
                className={`flex items-center gap-2 ${step >= 2 ? "text-red-400" : "text-gray-500"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg" : "bg-gray-800 text-gray-400"}`}>
                  2
                </div>
                <span className="text-sm font-medium hidden sm:inline">
                  Verifikasi
                </span>
              </div>
              <div
                className={`flex-1 h-1 ${step >= 3 ? "bg-gradient-to-r from-red-600 to-pink-600" : "bg-gray-800"}`}></div>
              <div
                className={`flex items-center gap-2 ${step >= 3 ? "text-red-400" : "text-gray-500"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg" : "bg-gray-800 text-gray-400"}`}>
                  3
                </div>
                <span className="text-sm font-medium hidden sm:inline">
                  Selesai
                </span>
              </div>
            </div>
            <div className="text-center text-sm text-gray-400">
              {step === 1 && "Mengisi data diri..."}
              {step === 2 && "Memverifikasi data..."}
              {step === 3 && "Membuat akun..."}
            </div>
          </div>

          <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />

          {/* Registration Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-800">
            <h4 className="font-bold text-white mb-4 flex items-center gap-2">
              <Award className="text-yellow-400" size={20} />
              Keuntungan Mendaftar
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-600/20 to-orange-600/20 flex items-center justify-center">
                  <Trophy size={16} className="text-yellow-400" />
                </div>
                <div>
                  <div className="font-medium text-white text-sm">
                    Voting Power
                  </div>
                  <div className="text-xs text-gray-400">Vote setiap hari</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600/20 to-cyan-600/20 flex items-center justify-center">
                  <Users size={16} className="text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-white text-sm">
                    Komunitas
                  </div>
                  <div className="text-xs text-gray-400">
                    Akses grup eksklusif
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-400">
              <Sparkles size={16} className="inline mr-2 text-yellow-400" />
              <span className="font-bold text-yellow-400">
                Bonus 100 poin
              </span>{" "}
              untuk pendaftaran hari ini!
            </div>
          </motion.div>
        </>
      )}
    </AuthLayout>
  );
};

export default RegisterPage;
