// src/pages/auth/components/AuthLayout.jsx
import {
  Trophy,
  Shield,
  Users,
  Flag,
  Award,
  Star,
  Heart,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const AuthLayout = ({ children, title, subtitle, type = "login" }) => {
  const features = [
    {
      icon: <Target size={24} className="text-red-600" />,
      title: "Voting Real-Time",
      desc: "Pantau perolehan suara secara langsung dan transparan",
      color: "bg-red-50",
    },
    {
      icon: <Shield size={24} className="text-red-600" />,
      title: "Keamanan Terjamin",
      desc: "Sistem voting terenkripsi dengan teknologi blockchain",
      color: "bg-red-50",
    },
    {
      icon: <Users size={24} className="text-red-600" />,
      title: "Komunitas Aktif",
      desc: "Bergabung dengan 50.000+ anggota komunitas Paskibra",
      color: "bg-red-50",
    },
    {
      icon: <Flag size={24} className="text-red-600" />,
      title: "Prestasi Nasional",
      desc: "Buktikan kemampuan tim Anda di tingkat nasional",
      color: "bg-red-50",
    },
  ];

  const stats = [
    { value: "2.5K+", label: "Vote Hari Ini", icon: "🔥" },
    { value: "24", label: "Tim Aktif", icon: "🏆" },
    { value: "15", label: "Provinsi", icon: "📍" },
    { value: "98%", label: "Kepuasan", icon: "⭐" },
  ];

  useEffect(() => {
    // Add floating animation style
    const style = document.createElement("style");
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-15px) rotate(5deg); }
      }
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.3); }
        50% { box-shadow: 0 0 30px rgba(239, 68, 68, 0.5); }
      }
      .animate-float-1 { animation: float 8s ease-in-out infinite; }
      .animate-float-2 { animation: float 10s ease-in-out infinite reverse; }
      .animate-float-3 { animation: float 12s ease-in-out infinite; }
      .animate-glow { animation: glow 3s ease-in-out infinite; }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50/30 to-white">
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-6 h-6 bg-red-400/10 rounded-full animate-float-${(i % 3) + 1}`}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 animate-glow">
                  <Trophy size={28} className="text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                  Lomba Paskibra 2026
                </h1>
                <p className="text-xs text-gray-600">
                  Kreasi • Prestasi • Kebanggaan Nasional
                </p>
              </div>
            </Link>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 hidden sm:inline">
                {type === "login" ? "Belum punya akun?" : "Sudah punya akun?"}
              </span>
              <Link
                to={type === "login" ? "/auth/register" : "/auth/login"}
                className="px-4 py-2.5 rounded-lg font-medium bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-lg hover:shadow-red-200 hover:scale-105 transition-all duration-300">
                {type === "login" ? "Daftar Sekarang" : "Masuk"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="relative container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* Left Column - Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 lg:p-10 border border-gray-200 hover:border-red-200 transition-all duration-300">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-8 bg-red-600 rounded-full"></div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {title}
                </h1>
              </div>
              <p className="text-gray-600">{subtitle}</p>
            </div>

            {children}

            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  Dengan melanjutkan, Anda menyetujui{" "}
                  <Link
                    to="/terms"
                    className="text-red-600 font-medium hover:text-red-700 hover:underline transition-colors">
                    Syarat & Ketentuan
                  </Link>{" "}
                  dan{" "}
                  <Link
                    to="/privacy"
                    className="text-red-600 font-medium hover:text-red-700 hover:underline transition-colors">
                    Kebijakan Privasi
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Features */}
          <div className="flex flex-col justify-center">
            <div className="space-y-8">
              {/* Hero Card */}
              <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
                <div className="absolute top-4 right-4 opacity-20">
                  <Trophy size={48} />
                </div>
                <div className="relative">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-4">
                    <Heart size={16} className="fill-white" />
                    <span className="text-sm font-medium">
                      #1 Platform Voting
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-4">
                    Bergabunglah dengan Juara!
                  </h2>
                  <p className="text-red-100">
                    Jadilah bagian dari sejarah Lomba Paskibra 2026. Setiap vote
                    Anda membantu menentukan pemenang yang akan membanggakan
                    bangsa Indonesia.
                  </p>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`${feature.color} p-4 rounded-xl border border-gray-100 hover:border-red-200 hover:shadow-md transition-all duration-300`}>
                    <div className="mb-3">{feature.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-xs">{feature.desc}</p>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Star size={20} className="text-red-600" />
                  Statistik Real-Time
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
                        <span>{stat.icon}</span>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonial */}
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Award size={20} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm italic">
                      "Platform voting terbaik yang pernah saya gunakan.
                      Transparan, aman, dan sangat mudah digunakan!"
                    </p>
                    <div className="mt-3">
                      <div className="font-medium text-gray-900">
                        Bambang S.
                      </div>
                      <div className="text-xs text-gray-500">
                        Ketua Tim Paskibra Jawa Barat
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="container mx-auto px-4 pb-8">
        <div className="text-center text-sm text-gray-500">
          <p>
            🔒 Dilindungi oleh sistem keamanan tingkat tinggi • ⚡ Real-time
            voting system • 🏆 Platform resmi Lomba Paskibra Nasional 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
