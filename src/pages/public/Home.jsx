import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";

import {
  Trophy,
  Users,
  Award,
  Star,
  Heart,
  Medal,
  Clock,
  Zap,
  BarChart3,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Flame,
  Calendar,
  Rocket,
} from "lucide-react";

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // State untuk slider
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Set mounted state
  const [isMounted, setIsMounted] = useState(false);

  // Gambar untuk slider hero
  const heroSlides = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1920&q=80",
      gradient: "from-black/80 via-black/60 to-black/80",
      title: "Lomba Paskibra Nasional 2026",
      subtitle:
        "Wujudkan mimpi menjadi juara di ajang bergengsi Paskibra terbesar se-Indonesia",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1920&q=80",
      gradient: "from-black/80 via-black/60 to-black/80",
      title: "Tunjukkan Kreasi Terbaik Daerah",
      subtitle:
        "Raih kesempatan membawa pulang piala bergengsi dan penghargaan nasional",
    },
  ];

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Auto slide effect
  useEffect(() => {
    if (isHovering || !isMounted) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [isHovering, isMounted]);

  // Navigasi slide manual
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
    );
  };

  // Go to specific slide
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

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

  // Data untuk statistik
  const stats = [
    {
      icon: <Heart className="text-orange-500" size={24} />,
      value: "2,548",
      label: "Total Votes",
      description: "Vote aktif",
    },
    {
      icon: <Medal className="text-teal-500" size={24} />,
      value: "24",
      label: "Tim Terdaftar",
      description: "Dari 32 provinsi",
    },
    {
      icon: <Users className="text-orange-400" size={24} />,
      value: "15",
      label: "Juri Professional",
      description: "Bersertifikasi nasional",
    },
    {
      icon: <Clock className="text-teal-400" size={24} />,
      value: "3 Hari",
      label: "Waktu Tersisa",
      description: "Menuju final",
    },
  ];

  // Data untuk fitur
  const features = [
    {
      title: "Voting Real-time",
      description:
        "Pantau perolehan suara secara live dengan teknologi terkini",
      icon: <Zap className="text-white" size={22} />,
      gradient: "bg-gradient-to-br from-orange-600 to-orange-700",
      link: "/voting",
    },
    {
      title: "Pendaftaran Online",
      description: "Daftar tim dengan sistem digital yang cepat dan aman",
      icon: <Trophy className="text-white" size={22} />,
      gradient: "bg-gradient-to-br from-teal-600 to-teal-700",
      link: "/ticket",
    },
    {
      title: "Penilaian Digital",
      description: "Sistem penjurian dengan analisis mendalam",
      icon: <Award className="text-white" size={22} />,
      gradient: "bg-gradient-to-br from-orange-600 to-orange-700",
      link: "/judging",
    },
    {
      title: "Analytics Dashboard",
      description: "Data lengkap dengan visualisasi statistik interaktif",
      icon: <BarChart3 className="text-white" size={22} />,
      gradient: "bg-gradient-to-br from-teal-600 to-teal-700",
      link: "/results",
    },
  ];

  // Data untuk tim terpopuler
  const topTeams = [
    {
      id: 1,
      name: "Paskibra Jawa Barat",
      votes: 1542,
      rank: 1,
      city: "Bandung, Jawa Barat",
      progress: 85,
    },
    {
      id: 2,
      name: "Paskibra DKI Jakarta",
      votes: 1320,
      rank: 2,
      city: "Jakarta Pusat, DKI",
      progress: 78,
    },
    {
      id: 3,
      name: "Paskibra Jawa Timur",
      votes: 1245,
      rank: 3,
      city: "Surabaya, Jawa Timur",
      progress: 72,
    },
    {
      id: 4,
      name: "Paskibra Jawa Tengah",
      votes: 1120,
      rank: 4,
      city: "Semarang, Jawa Tengah",
      progress: 68,
    },
  ];

  // Variants untuk animasi sederhana
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
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-transparent border-t-orange-600 rounded-full mx-auto animate-spin" />
          <p className="mt-6 text-gray-300 font-medium text-lg">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="pb-8">
      {/* Hero Section */}
      <section
        className="relative overflow-hidden px-4 md:px-8 pt-4 md:pt-6"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}>
        {/* Slider Container */}
        <div className="relative h-[60vh] md:h-[65vh] rounded-xl overflow-hidden">
          <motion.div
            key={currentSlide}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}>
            {/* Background Image dengan Overlay */}
            <div className="absolute inset-0">
              <img
                src={heroSlides[currentSlide].image}
                alt={heroSlides[currentSlide].title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t ${heroSlides[currentSlide].gradient}`}
              />
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="container mx-auto px-4 md:px-8">
                <div className="max-w-2xl">
                  {/* Title */}
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white leading-tight">
                    {heroSlides[currentSlide].title}
                  </h1>

                  {/* Subtitle */}
                  <p className="text-lg md:text-xl mb-8 text-gray-300 leading-relaxed max-w-xl">
                    {heroSlides[currentSlide].subtitle}
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {user ? (
                      <>
                        {user.role === "user" && (
                          <Link
                            to="/voting"
                            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 inline-flex items-center justify-center gap-2">
                            <Zap size={18} />
                            <span>Mulai Voting</span>
                          </Link>
                        )}
                        <Link
                          to="/results"
                          className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-bold rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 inline-flex items-center justify-center gap-2">
                          <Trophy size={18} />
                          <span>Lihat Hasil</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/auth/login"
                          className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 inline-flex items-center justify-center gap-2">
                          <span>Masuk untuk Voting</span>
                        </Link>
                        <Link
                          to="/auth/register"
                          className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all duration-200 inline-flex items-center justify-center gap-2">
                          <span>Daftar Sekarang</span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-all duration-200 border border-white/10"
            aria-label="Slide sebelumnya">
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-all duration-200 border border-white/10"
            aria-label="Slide berikutnya">
            <ChevronRight size={20} />
          </button>

          {/* Slide Indicators dihapus sepenuhnya */}
        </div>
      </section>

      {/* Container untuk konten lainnya */}
      <div className="container mx-auto px-4 md:px-8 mt-8 space-y-8 md:space-y-12">
        {/* Stats Section */}
        <section>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-all duration-200 group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-lg bg-black/50">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-base font-semibold text-gray-300 mb-1">
                  {stat.label}
                </div>
                <div className="text-gray-500 text-sm">{stat.description}</div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Features Section */}
        <section>
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-teal-600 text-white px-4 py-2 rounded-full mb-4 border border-orange-500/30">
              <Flame size={16} />
              <span className="text-sm font-bold">FITUR UTAMA</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">
              Sistem Terpadu & Modern
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Semua yang Anda butuhkan dalam satu platform untuk pengalaman
              kompetisi yang optimal
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -2 }}>
                <Link
                  to={feature.link}
                  className="group block bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-gray-700 transition-all duration-200">
                  <div
                    className={`${feature.gradient} w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-200`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">
                    {feature.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500 group-hover:text-gray-300">
                      Jelajahi →
                    </span>
                    <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-gray-700 transition-all">
                      <ChevronRight
                        size={14}
                        className="text-gray-400 group-hover:text-white"
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Top Teams Section */}
        <section className="bg-gray-900 rounded-2xl p-6 md:p-8 border border-gray-800">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="relative mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-4 py-2 rounded-full mb-2 border border-orange-500/30">
                  <Star size={16} />
                  <span className="text-sm font-bold">TIM TERPOPULER</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
                  Peringkat Teratas
                </h2>
                <p className="text-gray-400 text-sm">
                  Tim dengan voting terbanyak minggu ini
                </p>
              </div>
              <Link
                to="/results"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition-all duration-200 border border-gray-700">
                <span className="text-sm">Lihat Semua</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {topTeams.map((team, index) => (
              <motion.div
                key={team.id}
                variants={fadeInUp}
                whileHover={{ y: -2 }}
                className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-200">
                <div className="absolute top-3 right-3">
                  <div className="bg-gradient-to-r from-orange-600 to-orange-700 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold border border-orange-500/30">
                    {team.rank}
                  </div>
                </div>

                <div className="p-5 md:p-6">
                  <div className="mb-4">
                    <h3 className="font-bold text-lg text-white mb-2">
                      {team.name}
                    </h3>
                    <div className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                      <MapPin size={12} />
                      {team.city}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Total Votes</span>
                      <span className="font-bold text-white">
                        {team.votes.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${team.progress}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-orange-500 to-teal-500 rounded-full"
                      />
                    </div>
                    <div className="text-xs text-gray-500 text-right mt-1">
                      {team.progress}%
                    </div>
                  </div>

                  {user ? (
                    <Link
                      to="/voting"
                      className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 flex items-center justify-center gap-2 text-sm">
                      <Heart size={16} />
                      Vote Sekarang
                    </Link>
                  ) : (
                    <Link
                      to="/auth/login"
                      className="w-full py-2.5 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm">
                      <Heart size={16} />
                      Login untuk Vote
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
          className="bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 md:p-8 text-white overflow-hidden border border-gray-800">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-teal-600 text-white px-4 py-2 rounded-full mb-6 border border-orange-500/30">
              <Trophy className="text-white" size={16} />
              <span className="font-bold text-sm">KESEMPATAN TERBATAS</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
              Siap Menjadi Juara?
            </h2>

            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
              Bergabung dengan ratusan tim Paskibra terbaik dari seluruh
              Indonesia. Raih kesempatan untuk menjadi juara nasional 2026 dan
              bawa pulang piala bergengsi!
            </p>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <motion.div variants={fadeInUp}>
                <Link
                  to="/ticket"
                  className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 inline-flex items-center justify-center gap-2">
                  <Rocket size={18} />
                  <span>Daftar Tim Anda</span>
                </Link>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Link
                  to="/voting"
                  className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all duration-200 inline-flex items-center justify-center gap-2">
                  <Trophy size={18} />
                  <span>Mulai Voting</span>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              {[
                {
                  icon: (
                    <Calendar className="text-orange-400 mx-auto" size={20} />
                  ),
                  label: "Pendaftaran",
                  value: "30 Sept 2026",
                },
                {
                  icon: <Users className="text-teal-400 mx-auto" size={20} />,
                  label: "Kuota",
                  value: "8/32 Tim",
                },
                {
                  icon: <Award className="text-orange-400 mx-auto" size={20} />,
                  label: "Total Hadiah",
                  value: "Rp 250M",
                },
                {
                  icon: <Trophy className="text-teal-400 mx-auto" size={20} />,
                  label: "Juara Utama",
                  value: "Trofi Emas",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  custom={index}
                  className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="mb-1">{item.icon}</div>
                  <div className="text-xs text-gray-400 mb-1">{item.label}</div>
                  <div className="font-bold text-sm text-white">
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
