// src/pages/auth/components/AuthLayout.jsx
import { Trophy, Shield, Users, Flag, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const AuthLayout = ({ children, title, subtitle, type = "login" }) => {
  const features = [
    {
      icon: <Shield size={20} className="text-red-600" />,
      title: "Voting Real-Time",
      desc: "Pantau perolehan suara secara langsung",
    },
    {
      icon: <Shield size={20} className="text-red-600" />,
      title: "Keamanan Terjamin",
      desc: "Sistem voting terenkripsi",
    },
    {
      icon: <Users size={20} className="text-red-600" />,
      title: "Komunitas Aktif",
      desc: "50.000+ anggota komunitas",
    },
    {
      icon: <Flag size={20} className="text-red-600" />,
      title: "Prestasi Nasional",
      desc: "Buktikan kemampuan tim Anda",
    },
  ];

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      .animate-float { animation: float 6s ease-in-out infinite; }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-red-50/30">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Trophy size={22} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                  Lomba Paskibra 2026
                </h1>
                <p className="text-xs text-gray-600">
                  Kreasi • Prestasi • Kebanggaan
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              {/* Tombol Kembali ke Home */}
              <Link
                to="/"
                className="px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Kembali ke Home
              </Link>

              <Link
                to={type === "login" ? "/auth/register" : "/auth/login"}
                className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors">
                {type === "login" ? "Daftar" : "Masuk"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {title}
                </h1>
                <p className="text-gray-600">{subtitle}</p>
              </div>

              {children}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-gray-600 text-sm text-center">
                  Dengan melanjutkan, Anda menyetujui{" "}
                  <Link to="/terms" className="text-red-600 hover:underline">
                    Syarat & Ketentuan
                  </Link>{" "}
                  dan{" "}
                  <Link to="/privacy" className="text-red-600 hover:underline">
                    Kebijakan Privasi
                  </Link>
                </p>
              </div>
            </div>

            {/* Right Column - Features */}
            <div className="space-y-6">
              {/* Hero Card */}
              <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 text-white relative overflow-hidden">
                <div className="relative">
                  <h2 className="text-xl font-bold mb-3">
                    Bergabunglah dengan Juara!
                  </h2>
                  <p className="text-red-100 text-sm">
                    Jadilah bagian dari sejarah Lomba Paskibra 2026. Setiap vote
                    Anda membantu menentukan pemenang.
                  </p>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <div className="mb-2">{feature.icon}</div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-xs">{feature.desc}</p>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">
                  Statistik
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "2.5K+", label: "Vote Hari Ini", icon: "🔥" },
                    { value: "24", label: "Tim Aktif", icon: "🏆" },
                    { value: "15", label: "Provinsi", icon: "📍" },
                    { value: "98%", label: "Kepuasan", icon: "⭐" },
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-lg font-bold text-gray-900">
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-600">
                        {stat.icon} {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonial */}
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Award size={16} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm italic">
                      "Platform voting terbaik yang pernah saya gunakan."
                    </p>
                    <div className="mt-2">
                      <div className="font-medium text-gray-900 text-sm">
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
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-gray-500">
          <p>
            🔒 Sistem Keamanan Tinggi • ⚡ Real-time voting • 🏆 Platform Resmi
            2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
