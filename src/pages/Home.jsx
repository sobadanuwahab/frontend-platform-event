import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

// Import icon dari lucide-react
import {
  Trophy,
  Shield,
  Users,
  Flag,
  Award,
  Star,
  Heart,
  Medal,
  Crown,
  Clock,
  Zap,
  BarChart3,
  MapPin,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Flame,
  Calendar,
  Gem,
  Rocket,
  TrendingUp,
  Sparkles,
  Circle,
  RefreshCw,
  Lock,
  Target,
} from "lucide-react";

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const statsRef = useRef(null);
  const [isStatsVisible, setIsStatsVisible] = useState(false);

  // State untuk animasi statistik
  const [animatedStats, setAnimatedStats] = useState({
    totalVotes: 0,
    registeredTeams: 0,
    judges: 0,
    daysLeft: 0,
  });

  // State untuk slider
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Particle animation effect
  const [particles, setParticles] = useState([]);

  // Gambar untuk slider hero
  const heroSlides = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1920&q=80",
      gradient: "from-red-900/90 to-purple-900/90",
      title: "Lomba Paskibra Nasional 2026",
      subtitle:
        "Wujudkan mimpi menjadi juara di ajang bergengsi Paskibra terbesar se-Indonesia",
      badge: "EVENT PREMIUM",
      badgeColor: "bg-gradient-to-r from-yellow-500 to-orange-600",
      icon: <Trophy className="text-yellow-400" size={28} />,
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1920&q=80",
      gradient: "from-blue-900/90 to-cyan-900/90",
      title: "Tunjukkan Kreasi Terbaik Daerah",
      subtitle:
        "Raih kesempatan membawa pulang piala bergengsi dan penghargaan nasional",
      badge: "REGISTRASI DIBUKA",
      badgeColor: "bg-gradient-to-r from-emerald-500 to-green-600",
      icon: <Award className="text-emerald-400" size={28} />,
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1598894597312-4d0d2bead49b?auto=format&fit=crop&w=1920&q=80",
      gradient: "from-purple-900/90 to-pink-900/90",
      title: "Sistem Voting Modern & Real-time",
      subtitle:
        "Pantau perolehan suara secara live dengan teknologi blockchain terkini",
      badge: "TECH INNOVATION",
      badgeColor: "bg-gradient-to-r from-purple-500 to-pink-600",
      icon: <Zap className="text-purple-400" size={28} />,
    },
  ];

  // Initialize particles
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      speedX: (Math.random() - 0.5) * 0.15,
      speedY: (Math.random() - 0.5) * 0.15,
      color: "rgba(251, 113, 133, 0.1)",
    }));
    setParticles(newParticles);
  }, []);

  // Particle animation
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: (p.x + p.speedX) % 100,
          y: (p.y + p.speedY) % 100,
        })),
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Intersection Observer untuk animasi stats
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsStatsVisible(true);
        }
      },
      { threshold: 0.5 },
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);

  // Animasi angka statistik
  useEffect(() => {
    if (!isStatsVisible) return;

    const targetStats = {
      totalVotes: 2548,
      registeredTeams: 24,
      judges: 15,
      daysLeft: 3,
    };

    const duration = 2000;
    const steps = 100;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      setAnimatedStats({
        totalVotes: Math.floor((targetStats.totalVotes / steps) * currentStep),
        registeredTeams: Math.floor(
          (targetStats.registeredTeams / steps) * currentStep,
        ),
        judges: Math.floor((targetStats.judges / steps) * currentStep),
        daysLeft: Math.floor((targetStats.daysLeft / steps) * currentStep),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedStats(targetStats);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isStatsVisible]);

  // Auto slide effect
  useEffect(() => {
    if (isHovering) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isHovering]);

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
      icon: <Heart className="text-pink-500" size={28} />,
      value: animatedStats.totalVotes.toLocaleString(),
      label: "Total Votes",
      color: "text-red-400",
      bg: "bg-gradient-to-br from-gray-900 to-gray-800",
      border: "border-gray-700",
      increment: "+12",
      description: "Vote aktif",
      gradient: "from-pink-600 to-rose-600",
    },
    {
      icon: <Medal className="text-yellow-500" size={28} />,
      value: animatedStats.registeredTeams,
      label: "Tim Terdaftar",
      color: "text-blue-400",
      bg: "bg-gradient-to-br from-gray-900 to-gray-800",
      border: "border-gray-700",
      increment: "+2",
      description: "Dari 32 provinsi",
      gradient: "from-blue-600 to-cyan-600",
    },
    {
      icon: <Crown className="text-purple-500" size={28} />,
      value: animatedStats.judges,
      label: "Juri Professional",
      color: "text-emerald-400",
      bg: "bg-gradient-to-br from-gray-900 to-gray-800",
      border: "border-gray-700",
      increment: "+1",
      description: "Bersertifikasi nasional",
      gradient: "from-emerald-600 to-green-600",
    },
    {
      icon: <Clock className="text-orange-500" size={28} />,
      value: `${animatedStats.daysLeft} Hari`,
      label: "Waktu Tersisa",
      color: "text-orange-400",
      bg: "bg-gradient-to-br from-gray-900 to-gray-800",
      border: "border-gray-700",
      increment: "",
      description: "Menuju final",
      gradient: "from-orange-600 to-amber-600",
    },
  ];

  // Data untuk fitur
  const features = [
    {
      title: "Voting Real-time",
      description:
        "Pantau perolehan suara secara live dengan teknologi blockchain",
      icon: <Zap className="text-white" size={24} />,
      gradient: "bg-gradient-to-br from-red-600 via-pink-600 to-red-700",
      hoverGradient: "bg-gradient-to-br from-red-700 via-pink-700 to-red-800",
      link: "/voting",
      color: "text-red-400",
      delay: 0.1,
      bg: "bg-gradient-to-br from-gray-900 to-gray-800",
    },
    {
      title: "Pendaftaran Online",
      description: "Daftar tim dengan sistem digital yang cepat dan aman",
      icon: <Flag className="text-white" size={24} />,
      gradient: "bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700",
      hoverGradient: "bg-gradient-to-br from-blue-700 via-cyan-700 to-blue-800",
      link: "/ticket",
      color: "text-blue-400",
      delay: 0.2,
      bg: "bg-gradient-to-br from-gray-900 to-gray-800",
    },
    {
      title: "Penilaian Digital",
      description: "Sistem penjurian AI-powered dengan analisis mendalam",
      icon: <Shield className="text-white" size={24} />,
      gradient:
        "bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700",
      hoverGradient:
        "bg-gradient-to-br from-emerald-700 via-green-700 to-emerald-800",
      link: "/judging",
      color: "text-emerald-400",
      delay: 0.3,
      bg: "bg-gradient-to-br from-gray-900 to-gray-800",
    },
    {
      title: "Analytics Dashboard",
      description: "Data lengkap dengan visualisasi statistik interaktif",
      icon: <BarChart3 className="text-white" size={24} />,
      gradient:
        "bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700",
      hoverGradient:
        "bg-gradient-to-br from-purple-700 via-violet-700 to-purple-800",
      link: "/results",
      color: "text-purple-400",
      delay: 0.4,
      bg: "bg-gradient-to-br from-gray-900 to-gray-800",
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
      color: "from-yellow-500 via-amber-600 to-orange-600",
      badgeColor: "bg-gradient-to-r from-yellow-600 to-amber-700",
      progress: 85,
      trend: "up",
      icon: <Trophy className="text-yellow-400" size={20} />,
    },
    {
      id: 2,
      name: "Paskibra DKI Jakarta",
      votes: 1320,
      rank: 2,
      city: "Jakarta Pusat, DKI",
      color: "from-gray-500 via-gray-600 to-gray-700",
      badgeColor: "bg-gradient-to-r from-gray-600 to-gray-800",
      progress: 78,
      trend: "up",
      icon: <Trophy className="text-gray-400" size={20} />,
    },
    {
      id: 3,
      name: "Paskibra Jawa Timur",
      votes: 1245,
      rank: 3,
      city: "Surabaya, Jawa Timur",
      color: "from-amber-500 via-orange-600 to-red-600",
      badgeColor: "bg-gradient-to-r from-amber-600 to-orange-700",
      progress: 72,
      trend: "stable",
      icon: <Trophy className="text-amber-400" size={20} />,
    },
    {
      id: 4,
      name: "Paskibra Jawa Tengah",
      votes: 1120,
      rank: 4,
      city: "Semarang, Jawa Tengah",
      color: "from-red-500 via-red-600 to-pink-600",
      badgeColor: "bg-gradient-to-r from-red-600 to-pink-700",
      progress: 68,
      trend: "up",
      icon: <Trophy className="text-red-400" size={20} />,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <div className="w-24 h-24 border-4 border-transparent border-t-red-600 rounded-full mx-auto" />
            <Trophy
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500"
              size={40}
            />
          </motion.div>
          <p className="mt-6 text-gray-300 font-medium text-lg">
            Memuat data event...
          </p>
          <p className="text-gray-500 mt-2">
            Siapkan diri untuk pengalaman yang luar biasa!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="pb-8">
      {/* Particle Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-50">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
            }}
            animate={{
              x: [0, particle.speedX * 100],
              y: [0, particle.speedY * 100],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section
        className="relative overflow-hidden px-4 md:px-8 pt-4 md:pt-6"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r blur-3xl opacity-50 rounded-2xl" />

        {/* Slider Container */}
        <div className="relative h-[65vh] md:h-[70vh] lg:h-[75vh] rounded-2xl overflow-hidden shadow-2xl">
          <AnimatePresence mode="wait">
            {heroSlides.map(
              (slide, index) =>
                index === currentSlide && (
                  <motion.div
                    key={slide.id}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  >
                    {/* Background Image dengan Overlay Gradient */}
                    <div className="absolute inset-0">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="absolute inset-0 w-full h-full object-cover opacity-40"
                      />
                      <div
                        className={`absolute inset-0 bg-gradient-to-t ${slide.gradient} via-black/80 to-transparent`}
                      />
                    </div>

                    {/* Content dengan Animasi */}
                    <motion.div
                      className="relative h-full flex items-center"
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    >
                      <div className="container mx-auto px-4 md:px-8 lg:px-12">
                        <div className="max-w-2xl">
                          {/* Live Badge dengan Animasi */}
                          <motion.div
                            className={`inline-flex items-center gap-3 ${slide.badgeColor} text-white rounded-full px-5 py-2 mb-6 backdrop-blur-md border border-white/10`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                          >
                            <Circle
                              className="w-2 h-2 text-white animate-pulse"
                              fill="currentColor"
                            />
                            <span className="text-sm font-bold tracking-wider">
                              {slide.badge}
                            </span>
                            {slide.icon}
                          </motion.div>

                          {/* Title dengan Gradient Text */}
                          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-yellow-200 to-yellow-400">
                              {slide.title}
                            </span>
                          </h1>

                          {/* Subtitle */}
                          <p className="text-lg md:text-xl mb-8 text-gray-300 leading-relaxed max-w-xl">
                            {slide.subtitle}
                          </p>

                          {/* CTA Buttons dengan Hover Effects */}
                          <motion.div
                            className="flex flex-col sm:flex-row gap-3"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                          >
                            {user ? (
                              <>
                                {user.role === "user" && (
                                  <Link
                                    to="/voting"
                                    className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl border border-red-500/30"
                                  >
                                    <Zap
                                      size={18}
                                      className="group-hover:animate-pulse"
                                    />
                                    <span>Mulai Voting Sekarang</span>
                                  </Link>
                                )}
                                <Link
                                  to="/results"
                                  className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-bold rounded-lg border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 transform hover:-translate-y-0.5"
                                >
                                  <Trophy size={18} />
                                  <span>Lihat Hasil Live</span>
                                </Link>
                              </>
                            ) : (
                              <>
                                <Link
                                  to="/auth/login"
                                  className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-lg hover:from-red-700 hover:to-orange-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl border border-orange-500/30"
                                >
                                  <Heart
                                    size={18}
                                    className="group-hover:rotate-12 transition-transform"
                                  />
                                  <span>Masuk untuk Voting</span>
                                </Link>
                                <Link
                                  to="/auth/register"
                                  className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:-translate-y-0.5 border border-purple-500/30"
                                >
                                  <span>Daftar Sekarang</span>
                                  <ChevronRight
                                    size={18}
                                    className="group-hover:translate-x-1 transition-transform"
                                  />
                                </Link>
                              </>
                            )}
                          </motion.div>

                          {/* Quick Stats dengan Lucide Icons */}
                          <motion.div
                            className="mt-8 flex flex-wrap gap-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                          >
                            <div className="flex items-center gap-2">
                              <Circle
                                className="w-2 h-2 text-green-500 animate-pulse"
                                fill="currentColor"
                              />
                              <RefreshCw className="w-3 h-3 text-blue-400" />
                              <span className="text-gray-300 text-xs md:text-sm">
                                Live Update
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Lock className="w-3 h-3 text-blue-400" />
                              <span className="text-gray-300 text-xs md:text-sm">
                                100% Secure
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-3 h-3 text-emerald-400" />
                              <span className="text-gray-300 text-xs md:text-sm">
                                24 Tim Aktif
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Target className="w-3 h-3 text-red-400" />
                              <span className="text-gray-300 text-xs md:text-sm">
                                Voting Aktif
                              </span>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ),
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/70 transition-all duration-300 hover:scale-110 border border-white/10"
            aria-label="Slide sebelumnya"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-md text-white p-2 rounded-full hover:bg-black/70 transition-all duration-300 hover:scale-110 border border-white/10"
            aria-label="Slide berikutnya"
          >
            <ChevronRight size={20} />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-white w-8 h-1.5 rounded-full"
                    : "bg-white/30 w-1.5 h-1.5 rounded-full hover:bg-white/60 hover:w-5"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-3 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="text-white/70" size={20} />
          </motion.div>
        </div>
      </section>

      {/* Container untuk konten lainnya */}
      <div className="container mx-auto px-4 md:px-8 mt-8 md:mt-12 space-y-8 md:space-y-12">
        {/* Stats Section */}
        <section ref={statsRef} className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isStatsVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`${stat.bg} p-6 rounded-xl border-2 ${stat.border} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden`}
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />

                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                      className="p-2.5 rounded-lg bg-black/50 backdrop-blur-sm"
                    >
                      {stat.icon}
                    </motion.div>
                    {stat.increment && (
                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded-full border border-emerald-800/30">
                        <TrendingUp size={10} />
                        {stat.increment}
                      </div>
                    )}
                  </div>
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 mb-1"
                  >
                    {stat.value}
                  </motion.div>
                  <div className={`text-base font-semibold ${stat.color} mb-1`}>
                    {stat.label}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {stat.description}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 md:mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-3 py-1.5 rounded-full mb-3 border border-red-500/30">
              <Sparkles size={14} />
              <span className="text-xs font-bold tracking-wider">
                FITUR PREMIUM
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-pink-400 to-purple-400">
                Sistem Terpadu & Modern
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Semua yang Anda butuhkan dalam satu platform canggih untuk
              pengalaman kompetisi yang tak terlupakan
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: feature.delay }}
                whileHover={{ scale: 1.03 }}
              >
                <Link
                  to={feature.link}
                  className={`group block ${feature.bg} p-5 rounded-xl border-2 border-gray-800 hover:border-transparent transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden`}
                >
                  {/* Hover Gradient */}
                  <div
                    className={`absolute inset-0 ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  />

                  <div className="relative">
                    <div
                      className={`${feature.gradient} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:${feature.hoverGradient} transition-all duration-300 transform group-hover:rotate-6`}
                    >
                      {feature.icon}
                    </div>
                    <h3
                      className={`text-lg font-bold mb-2 ${feature.color} group-hover:scale-105 transition-transform`}
                    >
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3">
                      {feature.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 group-hover:text-gray-300">
                        Jelajahi →
                      </span>
                      <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-red-900/50 group-hover:to-pink-900/50 transition-all">
                        <ChevronRight
                          size={14}
                          className="text-gray-400 group-hover:text-red-400"
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Top Teams Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-6 md:p-8 border border-gray-800">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-8 left-8 w-24 h-24 bg-gradient-to-r from-red-600 to-pink-600 rounded-full blur-2xl"></div>
            <div className="absolute bottom-8 right-8 w-32 h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-2xl"></div>
          </div>

          <div className="relative mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-1.5 rounded-full mb-2 border border-orange-500/30">
                  <Flame size={14} />
                  <span className="text-xs font-bold tracking-wider">
                    TRENDING NOW
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
                  Tim Terpopuler
                </h2>
                <p className="text-gray-400 text-sm">
                  Tim dengan voting terbanyak minggu ini
                </p>
              </div>
              <Link
                to="/results"
                className="group inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-medium rounded-lg hover:from-gray-900 hover:to-black transition-all duration-300 transform hover:-translate-y-0.5 border border-gray-700"
              >
                <span className="text-sm">Lihat Semua Peringkat</span>
                <ChevronRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>

          <div className="relative grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {topTeams.map((team) => (
              <motion.div
                key={team.id}
                whileHover={{ y: -3 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden border-2 border-gray-800 hover:border-transparent group relative"
              >
                <div className="p-5 md:p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`${team.badgeColor} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg border border-white/10`}
                    >
                      {team.rank}
                    </div>
                    {team.trend === "up" && (
                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded-full border border-emerald-800/30">
                        <TrendingUp size={10} />
                        Naik
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-lg text-white mb-2">
                    {team.name}
                  </h3>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs md:text-sm mb-2">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Heart size={12} className="text-pink-500" />
                        Total Votes
                      </span>
                      <span className="font-bold text-white">
                        {team.votes.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${team.color} rounded-full shadow-lg`}
                        style={{ width: `${team.progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 text-right mt-1">
                      {team.progress}%
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                    <MapPin size={12} />
                    {team.city}
                  </div>

                  {user ? (
                    <Link
                      to="/voting"
                      className="w-full py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-lg hover:from-red-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 group border border-red-500/30 text-sm"
                    >
                      <Heart size={16} className="group-hover:animate-bounce" />
                      Vote Sekarang
                    </Link>
                  ) : (
                    <Link
                      to="/auth/login"
                      className="w-full py-2.5 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold rounded-lg hover:from-gray-900 hover:to-black transition-all duration-300 flex items-center justify-center gap-2 group border border-gray-700 text-sm"
                    >
                      <Heart size={16} />
                      Login untuk Vote
                    </Link>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-6 md:p-8 text-white overflow-hidden border border-gray-800">
          <div className="relative max-w-3xl mx-auto text-center">
            <motion.div
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/10"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Star className="text-yellow-400" size={16} />
              <span className="font-bold text-xs tracking-wider">
                KESEMPATAN TERBATAS
              </span>
              <Gem className="text-yellow-400 ml-1" size={14} />
            </motion.div>

            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-yellow-200 to-yellow-400">
                Siap Menjadi Juara?
              </span>
            </h2>

            <p className="text-gray-300 mb-8 max-w-xl mx-auto">
              Bergabung dengan{" "}
              <span className="font-bold text-yellow-300">
                ratusan tim Paskibra terbaik
              </span>{" "}
              dari seluruh Indonesia. Raih kesempatan untuk{" "}
              <span className="font-bold text-yellow-300">
                menjadi juara nasional 2026
              </span>{" "}
              dan bawa pulang piala bergengsi!
            </p>

            <motion.div
              className="flex flex-col sm:flex-row gap-3 justify-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link
                to="/ticket"
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-xl border border-yellow-500/30"
              >
                <span>Daftar Tim Anda Sekarang</span>
                <Rocket
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                to="/voting"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-bold rounded-lg border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <Trophy
                  size={18}
                  className="group-hover:rotate-12 transition-transform"
                />
                <span>Mulai Voting Live</span>
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              {[
                {
                  icon: <Calendar className="text-red-400 mx-auto" size={20} />,
                  label: "Pendaftaran ditutup",
                  value: "30 Sept 2026",
                },
                {
                  icon: <Users className="text-blue-400 mx-auto" size={20} />,
                  label: "Kuota tersedia",
                  value: "8/32 Tim",
                },
                {
                  icon: <Gem className="text-yellow-400 mx-auto" size={20} />,
                  label: "Total Hadiah",
                  value: "Rp 250M",
                },
                {
                  icon: <Trophy className="text-amber-400 mx-auto" size={20} />,
                  label: "Juara Utama",
                  value: "Trofi Emas",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="mb-1">{item.icon}</div>
                  <div className="text-xs text-gray-400 mb-1">{item.label}</div>
                  <div className="font-bold text-sm md:text-base text-white">
                    {item.value}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
