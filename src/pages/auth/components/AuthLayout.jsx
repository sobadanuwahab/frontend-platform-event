// src/pages/auth/components/AuthLayout.jsx
import {
  Shield,
  Users,
  Flag,
  Award,
  Trophy,
  Heart,
  Zap,
  Target,
  Lock,
  Users2,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../../../components/Layout/Header";

const AuthLayout = ({ children, title, subtitle, type = "login" }) => {
  const features = [
    {
      icon: <Zap size={20} className="text-red-400" />,
      title: "Voting Real-Time",
      desc: "Pantau perolehan suara secara langsung",
      gradient: "from-red-500 to-pink-500",
    },
    {
      icon: <Lock size={20} className="text-blue-400" />,
      title: "Keamanan Terjamin",
      desc: "Sistem voting terenkripsi",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Users2 size={20} className="text-emerald-400" />,
      title: "Komunitas Aktif",
      desc: "50.000+ anggota komunitas",
      gradient: "from-emerald-500 to-green-500",
    },
    {
      icon: <Target size={20} className="text-purple-400" />,
      title: "Prestasi Nasional",
      desc: "Buktikan kemampuan tim Anda",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-900">
      {/* Menggunakan komponen Header yang sudah ada */}
      <Header />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-800 shadow-2xl p-6 md:p-8">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-3 py-1.5 rounded-full mb-4 border border-red-500/30">
                  <Sparkles size={14} />
                  <span className="text-xs font-bold tracking-wider">
                    {type === "login" ? "MASUK AKUN" : "BUAT AKUN BARU"}
                  </span>
                </div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 mb-3">
                  {title}
                </h1>
                <p className="text-gray-400">{subtitle}</p>
              </div>

              {children}

              <div className="mt-8 pt-6 border-t border-gray-800">
                <p className="text-gray-500 text-sm text-center">
                  Dengan melanjutkan, Anda menyetujui{" "}
                  <Link
                    to="/terms"
                    className="text-red-400 hover:text-red-300 transition-colors">
                    Syarat & Ketentuan
                  </Link>{" "}
                  dan{" "}
                  <Link
                    to="/privacy"
                    className="text-red-400 hover:text-red-300 transition-colors">
                    Kebijakan Privasi
                  </Link>
                </p>
              </div>
            </div>

            {/* Right Column - Features */}
            <div className="space-y-6">
              {/* Hero Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-6 text-white relative overflow-hidden border border-gray-800">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-8 left-8 w-24 h-24 bg-gradient-to-r from-red-600 to-pink-600 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-8 right-8 w-32 h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-2xl"></div>
                </div>

                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-red-600 to-pink-600">
                      <Trophy size={24} className="text-white" />
                    </div>
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-yellow-200 to-yellow-400">
                      Bergabunglah dengan Juara!
                    </h2>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Jadilah bagian dari sejarah Lomba Paskibra 2026. Setiap vote
                    Anda membantu menentukan pemenang dan membawa nama daerah
                    Anda ke tingkat nasional.
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span>Live Voting</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Shield size={12} />
                      <span>100% Secure</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Users size={12} />
                      <span>24 Tim Aktif</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Features Grid */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -4 }}
                    className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-all duration-200 group">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      {feature.icon}
                    </div>
                    <h3 className="font-bold text-white text-sm mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-xs">{feature.desc}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 border border-gray-800">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-red-600/20 to-pink-600/20">
                    <Target size={16} className="text-red-400" />
                  </div>
                  <h3 className="font-bold text-white text-sm">
                    Statistik Live
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      value: "2.5K+",
                      label: "Vote Hari Ini",
                      icon: "🔥",
                      color: "text-red-400",
                      bg: "from-red-600/10 to-red-600/5",
                    },
                    {
                      value: "24",
                      label: "Tim Aktif",
                      icon: "🏆",
                      color: "text-yellow-400",
                      bg: "from-yellow-600/10 to-yellow-600/5",
                    },
                    {
                      value: "32",
                      label: "Provinsi",
                      icon: "📍",
                      color: "text-blue-400",
                      bg: "from-blue-600/10 to-blue-600/5",
                    },
                    {
                      value: "98%",
                      label: "Kepuasan",
                      icon: "⭐",
                      color: "text-emerald-400",
                      bg: "from-emerald-600/10 to-emerald-600/5",
                    },
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-400">
                        {stat.icon} {stat.label}
                      </div>
                      <div
                        className={`mt-2 h-1 rounded-full bg-gradient-to-r ${stat.bg}`}></div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Testimonial */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 border border-gray-800">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                    <Award size={20} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm italic leading-relaxed">
                      "Platform voting terbaik yang pernah saya gunakan. Sistem
                      real-time dan UI yang modern membuat pengalaman voting
                      jadi menyenangkan."
                    </p>
                    <div className="mt-3">
                      <div className="font-bold text-white text-sm">
                        Bambang Surya
                      </div>
                      <div className="text-xs text-gray-500">
                        Ketua Tim Paskibra Jawa Barat - Juara 1 Nasional 2025
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Note */}
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-gray-500">
          <p className="flex items-center justify-center gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <Lock size={12} />
              Sistem Keamanan Blockchain
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Zap size={12} />
              Real-time Voting
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Trophy size={12} />
              Platform Resmi 2026
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

// Komponen Star untuk rating
const Star = ({ size = 16, fill = "none", className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default AuthLayout;
