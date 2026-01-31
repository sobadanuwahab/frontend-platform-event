import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";

import {
  Ticket,
  Users,
  Award,
  Heart,
  Calendar,
  Clock,
  Zap,
  MapPin,
  Trophy,
  Rocket,
  CheckCircle,
  TrendingUp,
  Eye,
  Shield,
  Target,
  TrendingDown,
  Medal,
} from "lucide-react";

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // DIUBAH: Hapus state untuk slider, hanya satu gambar
  const [isMounted, setIsMounted] = useState(false);

  // DIUBAH: Hanya satu gambar untuk hero section
  const heroImage = {
    image:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1920&q=80",
    gradient: "from-green-600/40 via-emerald-500/30 to-white/90",
    title: "Wadah Kreasi Baris Berbaris Indonesia",
    subtitle: "Tiket • Voting • Penjurian dalam satu platform.",
    cta: "Beli Tiket",
    cta2: "Lihat Event",
  };

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // DIUBAH: Hapus efek slide otomatis

  // Redirect jika user admin atau juri
  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (user.role === "juri") {
        navigate("/judging", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Data untuk statistik sesuai desain
  const stats = [
    {
      icon: <Calendar className="text-green-600" size={24} />,
      value: "24",
      label: "Event Aktif",
      description: "Lomba berlangsung",
      color: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
    },
    {
      icon: <Users className="text-emerald-600" size={24} />,
      value: "120+",
      label: "Tim",
      description: "Terdaftar",
      color: "from-emerald-50 to-green-50",
      borderColor: "border-emerald-200",
    },
    {
      icon: <Heart className="text-green-500" size={24} />,
      value: "15,000+",
      label: "Vote",
      description: "Terkumpul",
      color: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
    },
    {
      icon: <Eye className="text-emerald-500" size={24} />,
      value: "300+",
      label: "Penampilan",
      description: "Ditampilkan",
      color: "from-emerald-50 to-green-50",
      borderColor: "border-emerald-200",
    },
  ];

  // Data untuk event terkini
  const currentEvents = [
    {
      status: "Voting Dibuka",
      statusColor: "bg-green-500",
      statusText: "text-green-700",
      icon: <Heart size={16} className="text-white" />,
      title: "Lomba Paskibra Nasional",
      description: "Rekstanta datangia kanajia tiampeias.",
      buttonText: "Ikut Voting",
      buttonColor: "from-green-600 to-emerald-600",
      borderColor: "border-green-200",
    },
    {
      status: "Akan Datang",
      statusColor: "bg-yellow-500",
      statusText: "text-yellow-700",
      icon: <Calendar size={16} className="text-white" />,
      title: "Kompetisi Baris Kreasi",
      description: "Mulai 5 Mei 2024",
      buttonText: "Detail Event",
      buttonColor: "from-gray-600 to-gray-700",
      borderColor: "border-yellow-200",
    },
    {
      status: "Selesai",
      statusColor: "bg-gray-500",
      statusText: "text-gray-700",
      icon: <CheckCircle size={16} className="text-white" />,
      title: "Parade Prestasi Sekolah",
      description: "Asistensimwikai Pentlangesira Bergesta.",
      buttonText: "Detail Event",
      buttonColor: "from-gray-600 to-gray-700",
      borderColor: "border-gray-200",
    },
  ];

  // Data untuk cara kerja
  const workflowSteps = [
    {
      step: "1",
      title: "Beli Tiket",
      icon: <Ticket size={20} />,
      color: "from-green-600 to-green-700",
      bgColor: "bg-green-50",
      time: "01:12:45",
    },
    {
      step: "2",
      title: "Saksikan & Dukung",
      icon: <Eye size={20} />,
      color: "from-emerald-600 to-emerald-700",
      bgColor: "bg-emerald-50",
    },
    {
      step: "3",
      title: "Voting Dibuka",
      icon: <Heart size={20} />,
      color: "from-green-600 to-emerald-600",
      bgColor: "bg-green-50",
    },
    {
      step: "4",
      title: "Penjurian Profesional",
      icon: <Award size={20} />,
      color: "from-yellow-600 to-yellow-700",
      bgColor: "bg-yellow-50",
    },
    {
      step: "5",
      title: "Pengumuman Pemenang",
      icon: <Trophy size={20} />,
      color: "from-orange-600 to-orange-700",
      bgColor: "bg-orange-50",
    },
  ];

  // Data untuk tim terpopuler - DIUBAH: Menghapus badge angka di hero section
  const topTeams = [
    {
      id: 1,
      name: "SMAN 1 Jakarta",
      votes: 1542,
      rank: 1,
      city: "Jakarta Pusat",
      progress: 85,
      change: "+12",
      changeIcon: <TrendingUp size={14} />,
      changeColor: "text-green-600",
    },
    {
      id: 2,
      name: "SMAN 3 Bandung",
      votes: 1320,
      rank: 2,
      city: "Bandung, Jawa Barat",
      progress: 78,
      change: "+8",
      changeIcon: <TrendingUp size={14} />,
      changeColor: "text-green-600",
    },
    {
      id: 3,
      name: "SMAN 1 Surabaya",
      votes: 1245,
      rank: 3,
      city: "Surabaya, Jawa Timur",
      progress: 72,
      change: "-3",
      changeIcon: <TrendingDown size={14} />,
      changeColor: "text-red-600",
    },
    {
      id: 4,
      name: "SMAN 5 Semarang",
      votes: 1120,
      rank: 4,
      city: "Semarang, Jawa Tengah",
      progress: 68,
      change: "+5",
      changeIcon: <TrendingUp size={14} />,
      changeColor: "text-green-600",
    },
  ];

  // Variants untuk animasi
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full mx-auto animate-spin" />
          <p className="mt-6 text-gray-700 font-medium text-lg">
            Memuat Bariskreasi...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-8 bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Hero Container - DIUBAH: Pastikan tidak ada badge di sini */}
        <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Background Image dengan Overlay */}
            <div className="absolute inset-0">
              <img
                src={heroImage.image}
                alt={heroImage.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t ${heroImage.gradient}`}
              />
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="container mx-auto px-4 md:px-8">
                <div className="max-w-2xl">
                  {/* Title */}
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white leading-tight">
                    {heroImage.title}
                  </h1>

                  {/* Subtitle */}
                  <p className="text-lg md:text-xl mb-8 text-white leading-relaxed max-w-xl">
                    {heroImage.subtitle}
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      to="/ticket"
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      <Ticket size={18} />
                      <span>{heroImage.cta}</span>
                    </Link>
                    <Link
                      to="/event"
                      className="px-6 py-3 bg-white/90 backdrop-blur-sm text-gray-900 font-bold rounded-lg border border-green-300 hover:bg-green-50 transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-sm hover:shadow"
                    >
                      <Calendar size={18} />
                      <span>{heroImage.cta2}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* DIUBAH: Hapus navigation buttons dan slide indicators */}
        </div>
      </section>

      {/* Container untuk konten lainnya */}
      <div className="container mx-auto px-4 md:px-8 mt-8 md:mt-12 space-y-8 md:space-y-12">
        {/* Stats Section */}
        <section>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className={`bg-gradient-to-br ${stat.color} p-6 rounded-xl border ${stat.borderColor} hover:border-green-300 transition-all duration-200 group shadow-sm hover:shadow`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-lg bg-white shadow-sm">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-base font-semibold text-gray-800 mb-1">
                  {stat.label}
                </div>
                <div className="text-gray-600 text-sm">{stat.description}</div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Current Events Section */}
        <section>
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-center mb-8 md:mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-full mb-4 shadow-md">
              <Calendar size={16} />
              <span className="text-sm font-bold">EVENT TERKINI</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">
              Kompetisi yang Sedang Berlangsung
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ikuti perkembangan kompetisi baris berbaris terbaru dan
              berpartisipasi dalam menentukan pemenang
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-3 gap-6"
          >
            {currentEvents.map((event, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                    <span className={`text-sm font-bold ${event.statusText}`}>
                      {event.status}
                    </span>
                  </div>
                  <div
                    className={`w-8 h-8 rounded-full ${event.statusColor} flex items-center justify-center shadow-sm`}
                  >
                    {event.icon}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {event.title}
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  {event.description}
                </p>

                <Link
                  to={event.status === "Voting Dibuka" ? "/voting" : "/event"}
                  className={`w-full py-3 bg-gradient-to-r ${event.buttonColor} text-white font-bold rounded-lg hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg`}
                >
                  {event.status === "Voting Dibuka" ? (
                    <Heart size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                  <span>{event.buttonText}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Workflow Section */}
        <section className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 md:p-8 border border-green-200 shadow-sm">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="relative mb-6 md:mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-full mb-2 shadow-md">
                  <Zap size={16} />
                  <span className="text-sm font-bold">
                    CARA KERJA BARISKREASI
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                  Proses yang Mudah dan Transparan
                </h2>
                <p className="text-gray-600 text-sm">
                  Ikuti langkah-langkah berikut untuk berpartisipasi
                </p>
              </div>

              {/* Timer */}
              <div className="bg-white px-4 py-3 rounded-lg border border-green-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-green-600" />
                  <span className="text-sm text-gray-600">Sisa Waktu:</span>
                  <span className="text-xl font-bold text-green-700 font-mono">
                    01:12:45
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-5 gap-4 md:gap-6"
          >
            {workflowSteps.map((step, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -2 }}
                className="relative"
              >
                {/* Connecting Line */}
                {index < workflowSteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-green-200 to-emerald-200 -translate-x-1/2"></div>
                )}

                <div
                  className={`${step.bgColor} rounded-xl p-5 border border-green-200 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow`}
                >
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-r ${step.color} flex items-center justify-center mb-4 shadow-md`}
                  >
                    {step.icon}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-6 h-6 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-xs font-bold text-white shadow`}
                    >
                      {step.step}
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {step.title}
                    </h3>
                  </div>

                  {step.time && (
                    <div className="mt-3 p-2 bg-white rounded-lg border border-green-100 shadow-sm">
                      <div className="text-xs text-green-600">Sisa Waktu</div>
                      <div className="text-lg font-bold text-green-700 font-mono">
                        {step.time}
                      </div>
                    </div>
                  )}

                  {index === 2 && (
                    <div className="mt-4">
                      <Link
                        to="/voting"
                        className="w-full py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg"
                      >
                        <Heart size={14} />
                        Vote Sekarang
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Additional Info */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="mt-8 p-4 bg-white rounded-xl border border-green-200 shadow-sm"
          >
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <Shield className="text-green-600 mt-1" size={20} />
                <div>
                  <div className="text-gray-900 font-bold text-sm">
                    Sistem Aman
                  </div>
                  <div className="text-gray-600 text-xs">
                    Voting terenkripsi dan transparan
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="text-emerald-600 mt-1" size={20} />
                <div>
                  <div className="text-gray-900 font-bold text-sm">
                    Terverifikasi
                  </div>
                  <div className="text-gray-600 text-xs">
                    Semua tim melalui proses seleksi
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="text-yellow-600 mt-1" size={20} />
                <div>
                  <div className="text-gray-900 font-bold text-sm">
                    Real-time
                  </div>
                  <div className="text-gray-600 text-xs">
                    Update hasil secara langsung
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Top Teams Section */}
        <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 md:p-8 border border-green-200 shadow-sm">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="relative mb-6 md:mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-full mb-2 shadow-md">
                  <Trophy size={16} />
                  <span className="text-sm font-bold">TIM TERATAS</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                  Peringkat Voting Teratas
                </h2>
                <p className="text-gray-600 text-sm">
                  Dukung tim favorit Anda untuk menjadi juara
                </p>
              </div>
              <Link
                to="/results"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 font-medium rounded-lg hover:bg-green-50 transition-all duration-200 border border-green-200 shadow-sm hover:shadow"
              >
                <span className="text-sm">Lihat Semua Peringkat</span>
                <span className="ml-1">→</span>
              </Link>
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
          >
            {topTeams.map((team, index) => (
              <motion.div
                key={team.id}
                variants={fadeInUp}
                whileHover={{ y: -2 }}
                className="bg-white rounded-xl overflow-hidden border border-green-200 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-lg"
              >
                {/* DIUBAH: Hapus badge angka di pojok kanan atas */}
                <div className="p-5 md:p-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shadow-md text-sm">
                          {team.rank}
                        </div>
                        <h3 className="font-bold text-xl text-gray-900">
                          {team.name}
                        </h3>
                      </div>
                      <div
                        className={`flex items-center gap-1 text-xs ${team.changeColor}`}
                      >
                        {team.changeIcon}
                        {team.change}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-4 flex items-center gap-1 ml-11">
                      <MapPin size={14} />
                      {team.city}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Total Votes</span>
                      <span className="font-bold text-gray-900">
                        {team.votes.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${team.progress}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                      />
                    </div>
                    <div className="text-xs text-green-600 text-right mt-1">
                      {team.progress}% dari target
                    </div>
                  </div>

                  {user ? (
                    <Link
                      to="/voting"
                      className="w-full py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg"
                    >
                      <Heart size={16} />
                      Dukung Sekarang
                    </Link>
                  ) : (
                    <Link
                      to="/auth/login"
                      className="w-full py-2.5 bg-white text-gray-700 font-bold rounded-lg hover:bg-green-50 transition-all duration-200 flex items-center justify-center gap-2 text-sm border border-green-200 shadow-sm hover:shadow"
                    >
                      <Heart size={16} />
                      Masuk untuk Vote
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Final CTA Section */}
        <motion.section
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-gradient-to-br from-green-50 via-white to-emerald-50 rounded-2xl p-8 md:p-10 text-gray-900 overflow-hidden border border-green-200 relative shadow-lg"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-yellow-400 to-orange-400 rounded-full translate-y-32 -translate-x-32"></div>
          </div>

          <div className="relative max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-full mb-6 shadow-md">
              <Rocket className="text-white" size={16} />
              <span className="font-bold text-sm">GABUNG SEKARANG</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">
              Jadilah Bagian dari Komunitas Bariskreasi
            </h2>

            <p className="text-gray-600 mb-8 max-w-xl mx-auto">
              Bergabung dengan ratusan tim dan penikmat baris berbaris dari
              seluruh Indonesia. Dukung kreativitas, saksikan penampilan
              spektakuler, dan tentukan pemenangnya!
            </p>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row gap-3 justify-center mb-8"
            >
              <motion.div variants={fadeInUp}>
                <Link
                  to={user ? "/ticket" : "/auth/register"}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Ticket size={18} />
                  <span>{user ? "Beli Tiket Event" : "Daftar Sekarang"}</span>
                </Link>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Link
                  to="/voting"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Heart size={18} />
                  <span>Mulai Voting</span>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center"
            >
              {[
                {
                  icon: (
                    <Calendar className="text-green-600 mx-auto" size={20} />
                  ),
                  label: "Event Aktif",
                  value: "24+",
                },
                {
                  icon: (
                    <Users className="text-emerald-600 mx-auto" size={20} />
                  ),
                  label: "Komunitas",
                  value: "5,000+",
                },
                {
                  icon: <Medal className="text-yellow-600 mx-auto" size={20} />,
                  label: "Penjurian",
                  value: "Profesional",
                },
                {
                  icon: (
                    <Target className="text-orange-600 mx-auto" size={20} />
                  ),
                  label: "Keamanan",
                  value: "Terverifikasi",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  custom={index}
                  className="bg-white rounded-lg p-3 border border-green-200 shadow-sm hover:shadow transition-all duration-200"
                >
                  <div className="mb-1">{item.icon}</div>
                  <div className="text-xs text-gray-600 mb-1">{item.label}</div>
                  <div className="font-bold text-sm text-gray-900">
                    {item.value}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Home;
