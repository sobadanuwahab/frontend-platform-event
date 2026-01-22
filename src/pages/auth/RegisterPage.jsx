import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./components/AuthLayout";
import RegisterForm from "./components/RegisterForm";
import { CheckCircle, Trophy, Users, Award } from "lucide-react";

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // Animation effects
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes confetti {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      @keyframes slide-up {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .animate-confetti { animation: confetti 2s ease-out forwards; }
      .animate-bounce { animation: bounce 1s ease-in-out infinite; }
      .animate-slide-up { animation: slide-up 0.5s ease-out; }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

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

      // Tambahkan efek confetti
      createConfetti();

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

  const createConfetti = () => {
    const colors = ["#ef4444", "#dc2626", "#f87171", "#fca5a5", "#fee2e2"];
    const confettiContainer = document.getElementById("confetti-container");

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement("div");
      confetti.className = "absolute w-3 h-3 rounded-full animate-confetti";
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.top = `-20px`;
      confetti.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = `${Math.random() * 1}s`;
      confettiContainer.appendChild(confetti);

      // Remove after animation
      setTimeout(() => confetti.remove(), 2000);
    }
  };

  return (
    <AuthLayout
      title="Bergabung dengan Komunitas"
      subtitle="Daftar sekarang untuk mulai memberikan voting dan mendukung tim favorit Anda"
      type="register">
      <div
        id="confetti-container"
        className="fixed inset-0 pointer-events-none z-50"></div>

      {showSuccess ? (
        <div className="text-center py-12 animate-slide-up">
          <div className="relative mb-8">
            <div className="w-40 h-40 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle className="w-20 h-20 text-white" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Selamat Bergabung!
          </h3>
          <p className="text-gray-600 mb-6">
            Akun Anda telah berhasil dibuat. Selamat datang di komunitas Lomba
            Paskibra 2026.
          </p>

          {userData && (
            <div className="bg-gradient-to-r from-red-50 to-white p-6 rounded-2xl border border-red-100 mb-8">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {userData.points}
                  </div>
                  <div className="text-sm text-gray-600">Poin Bonus</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">Premium</div>
                  <div className="text-sm text-gray-600">Status Member</div>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                🎉 Selamat! Anda mendapatkan{" "}
                <span className="font-bold text-red-600">100 poin bonus</span>{" "}
                dan status{" "}
                <span className="font-bold text-red-600">Anggota Premium</span>.
              </div>
            </div>
          )}

          <div className="space-y-4 mb-8">
            <h4 className="font-bold text-gray-900">Apa selanjutnya?</h4>
            <div className="space-y-2">
              {[
                {
                  icon: "🏆",
                  text: "Berikan voting pertama untuk tim favorit Anda",
                },
                { icon: "👥", text: "Bergabung dengan komunitas diskusi" },
                { icon: "🔔", text: "Dapatkan notifikasi hasil terkini" },
                { icon: "📈", text: "Pantau perkembangan peringkat tim" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-gray-600">
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-500 via-red-600 to-red-500 rounded-full animate-progress"></div>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Mengarahkan ke halaman utama...
          </p>
        </div>
      ) : (
        <>
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div
                className={`flex items-center gap-2 ${step >= 1 ? "text-red-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-red-600 text-white" : "bg-gray-100"}`}>
                  1
                </div>
                <span className="text-sm font-medium hidden sm:inline">
                  Data Diri
                </span>
              </div>
              <div
                className={`flex-1 h-1 ${step >= 2 ? "bg-red-600" : "bg-gray-200"}`}></div>
              <div
                className={`flex items-center gap-2 ${step >= 2 ? "text-red-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-red-600 text-white" : "bg-gray-100"}`}>
                  2
                </div>
                <span className="text-sm font-medium hidden sm:inline">
                  Verifikasi
                </span>
              </div>
              <div
                className={`flex-1 h-1 ${step >= 3 ? "bg-red-600" : "bg-gray-200"}`}></div>
              <div
                className={`flex items-center gap-2 ${step >= 3 ? "text-red-600" : "text-gray-400"}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-red-600 text-white" : "bg-gray-100"}`}>
                  3
                </div>
                <span className="text-sm font-medium hidden sm:inline">
                  Selesai
                </span>
              </div>
            </div>
            <div className="text-center text-sm text-gray-600">
              {step === 1 && "Mengisi data diri..."}
              {step === 2 && "Memverifikasi data..."}
              {step === 3 && "Membuat akun..."}
            </div>
          </div>

          <RegisterForm onSubmit={handleRegister} isLoading={isLoading} />

          {/* Registration Benefits */}
          <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-white rounded-2xl border border-red-100">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="text-red-600" size={20} />
              Keuntungan Mendaftar
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Trophy size={16} className="text-red-600 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    Voting Power
                  </div>
                  <div className="text-xs text-gray-600">Vote setiap hari</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Users size={16} className="text-red-600 mt-1 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    Komunitas
                  </div>
                  <div className="text-xs text-gray-600">
                    Akses grup eksklusif
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              🎁 <span className="font-bold text-red-600">Bonus 100 poin</span>{" "}
              untuk pendaftaran hari ini!
            </div>
          </div>
        </>
      )}
    </AuthLayout>
  );
};

export default RegisterPage;
