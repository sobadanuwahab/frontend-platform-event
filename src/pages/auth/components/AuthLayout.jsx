// src/pages/auth/components/AuthLayout.jsx
import { Shield, Trophy, Users, Zap, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../../../components/Layout/Header";

const AuthLayout = ({ children, title, subtitle, type = "login" }) => {
  const features = [
    {
      icon: <Zap size={18} className="text-orange-500" />,
      title: "Voting Real-Time",
      desc: "Pantau perolehan suara langsung",
      color: "text-orange-600",
      bg: "bg-orange-50 border-orange-200",
    },
    {
      icon: <Shield size={18} className="text-teal-500" />,
      title: "Keamanan Terjamin",
      desc: "Sistem voting terenkripsi",
      color: "text-teal-600",
      bg: "bg-teal-50 border-teal-200",
    },
    {
      icon: <Users size={18} className="text-orange-500" />,
      title: "Komunitas Aktif",
      desc: "50.000+ anggota komunitas",
      color: "text-orange-600",
      bg: "bg-orange-50 border-orange-200",
    },
    {
      icon: <Trophy size={18} className="text-teal-500" />,
      title: "Prestasi Nasional",
      desc: "Buktikan kemampuan tim Anda",
      color: "text-teal-600",
      bg: "bg-teal-50 border-teal-200",
    },
  ];

  // Komponen Star untuk rating (gunakan nama berbeda)
  const StarIcon = ({ size = 16, fill = "none", className = "" }) => (
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
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
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 md:p-8">
              <div className="mb-8">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
                    type === "login"
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                      : "bg-gradient-to-r from-teal-500 to-teal-600 text-white"
                  }`}>
                  <Sparkles size={14} />
                  <span className="text-xs font-bold tracking-wider">
                    {type === "login" ? "MASUK AKUN" : "BUAT AKUN BARU"}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  {title}
                </h1>
                <p className="text-gray-600">{subtitle}</p>
              </div>

              {children}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-gray-500 text-sm text-center">
                  Dengan melanjutkan, Anda menyetujui{" "}
                  <Link
                    to="/terms"
                    className="text-orange-600 hover:text-orange-700 font-medium transition-colors">
                    Syarat & Ketentuan
                  </Link>{" "}
                  dan{" "}
                  <Link
                    to="/privacy"
                    className="text-teal-600 hover:text-teal-700 font-medium transition-colors">
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
                className="bg-gradient-to-br from-orange-50 to-teal-50 rounded-2xl p-6 border border-orange-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
                    <Trophy size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Bergabunglah dengan Juara!
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Lomba Paskibra 2026
                    </p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Jadilah bagian dari sejarah Lomba Paskibra 2026. Setiap vote
                  Anda membantu menentukan pemenang dan membawa nama daerah Anda
                  ke tingkat nasional.
                </p>

                <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <span>Live Voting</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-teal-500" />
                    <span>100% Secure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-orange-500" />
                    <span>24 Tim Aktif</span>
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
                    whileHover={{ y: -2 }}
                    className={`${feature.bg} rounded-xl p-4 border transition-all duration-200 hover:shadow-md`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`p-2 rounded-lg ${feature.color} bg-opacity-10`}>
                        {feature.icon}
                      </div>
                      <h3 className={`font-bold text-sm ${feature.color}`}>
                        {feature.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-xs">{feature.desc}</p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-lg bg-orange-50">
                    <Zap size={16} className="text-orange-500" />
                  </div>
                  <h3 className="font-bold text-gray-900">Statistik Live</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      value: "2.5K+",
                      label: "Vote Hari Ini",
                      color: "text-orange-600",
                      bg: "bg-orange-100",
                    },
                    {
                      value: "24",
                      label: "Tim Aktif",
                      color: "text-teal-600",
                      bg: "bg-teal-100",
                    },
                    {
                      value: "32",
                      label: "Provinsi",
                      color: "text-orange-600",
                      bg: "bg-orange-100",
                    },
                    {
                      value: "98%",
                      label: "Kepuasan",
                      color: "text-teal-600",
                      bg: "bg-teal-100",
                    },
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className={`text-xl font-bold ${stat.color} mb-1`}>
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-600">{stat.label}</div>
                      <div className={`mt-2 h-1 rounded-full ${stat.bg}`}>
                        <div
                          className={`h-full rounded-full ${
                            stat.color === "text-orange-600"
                              ? "bg-gradient-to-r from-orange-400 to-orange-500"
                              : "bg-gradient-to-r from-teal-400 to-teal-500"
                          }`}
                          style={{ width: "85%" }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Testimonial */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-br from-orange-50 to-teal-50 rounded-2xl p-5 border border-orange-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                    <Trophy size={18} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          size={14}
                          className="text-orange-400"
                          fill="currentColor"
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 text-sm italic leading-relaxed">
                      "Platform voting terbaik yang pernah saya gunakan. Sistem
                      real-time dan UI yang modern."
                    </p>
                    <div className="mt-3">
                      <div className="font-bold text-gray-900 text-sm">
                        Bambang Surya
                      </div>
                      <div className="text-xs text-gray-600">
                        Ketua Tim Paskibra Jawa Barat
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
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="flex items-center gap-1">
              <Shield size={12} className="text-teal-500" />
              <span>Sistem Keamanan Terenkripsi</span>
            </span>
            <div className="w-px h-4 bg-gray-300"></div>
            <span className="flex items-center gap-1">
              <Zap size={12} className="text-orange-500" />
              <span>Real-time Voting</span>
            </span>
            <div className="w-px h-4 bg-gray-300"></div>
            <span className="flex items-center gap-1">
              <Trophy size={12} className="text-teal-500" />
              <span>Platform Resmi 2026</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
