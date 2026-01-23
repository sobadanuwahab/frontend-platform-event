import { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Shield,
  Award,
  Users,
  Trophy,
  Flag,
  Star,
  Target,
  Vote,
  Calendar,
  MapPin,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const sliderRef = useRef(null);

  // State untuk animasi statistik
  const [animatedStats, setAnimatedStats] = useState({
    totalVotes: 0,
    registeredTeams: 0,
    judges: 0,
    daysLeft: 0,
  });

  // State untuk slider
  const [currentSlide, setCurrentSlide] = useState(0);

  // Gambar untuk slider hero
  const heroSlides = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1920&q=80",
      title: "Ajang Prestasi Paskibra Terbaik Nasional 2026",
      subtitle:
        "Bergabunglah dalam kompetisi paling bergengsi untuk tim Paskibra se-Indonesia",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1920&q=80",
      title: "Tunjukkan Kreasi & Prestasi Daerah Anda",
      subtitle:
        "Raih kesempatan menjadi juara nasional dan bawa pulang piala bergengsi",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1598894597312-4d0d2bead49b?auto=format&fit=crop&w=1920&q=80",
      title: "Sistem Voting Modern & Transparan",
      subtitle:
        "Pantau perolehan suara secara real-time dengan teknologi terkini",
    },
  ];

  // Animasi angka statistik
  useEffect(() => {
    const targetStats = {
      totalVotes: 2548,
      registeredTeams: 24,
      judges: 15,
      daysLeft: 3,
    };

    const duration = 1500;
    const steps = 50;
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
  }, []);

  // Auto slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
      icon: <Users size={22} />,
      value: animatedStats.totalVotes.toLocaleString(),
      label: "Total Votes",
      color: "text-red-600",
      bg: "bg-red-50",
      increment: "+12",
    },
    {
      icon: <Award size={22} />,
      value: animatedStats.registeredTeams,
      label: "Tim Terdaftar",
      color: "text-blue-600",
      bg: "bg-blue-50",
      increment: "+2",
    },
    {
      icon: <Shield size={22} />,
      value: animatedStats.judges,
      label: "Juri Professional",
      color: "text-green-600",
      bg: "bg-green-50",
      increment: "+1",
    },
    {
      icon: <Calendar size={22} />,
      value: `${animatedStats.daysLeft} Hari`,
      label: "Waktu Tersisa",
      color: "text-orange-600",
      bg: "bg-orange-50",
      increment: "",
    },
  ];

  // Data untuk fitur
  const features = [
    {
      title: "Voting Real-time",
      description: "Pantau perolehan suara secara live dan transparan",
      icon: <Target className="text-white" size={20} />,
      bg: "bg-gradient-to-br from-red-500 to-red-600",
      link: "/voting",
    },
    {
      title: "Pendaftaran Online",
      description: "Daftar tim dengan mudah melalui sistem online",
      icon: <Flag className="text-white" size={20} />,
      bg: "bg-gradient-to-br from-blue-500 to-blue-600",
      link: "/ticket",
    },
    {
      title: "Penilaian Digital",
      description: "Sistem penjurian modern dengan kalkulasi otomatis",
      icon: <Shield className="text-white" size={20} />,
      bg: "bg-gradient-to-br from-green-500 to-green-600",
      link: "/judging",
    },
    {
      title: "Hasil Instan",
      description: "Hasil langsung tersedia dengan analisis mendalam",
      icon: <Trophy className="text-white" size={20} />,
      bg: "bg-gradient-to-br from-purple-500 to-purple-600",
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
      city: "Bandung",
      color: "from-yellow-400 to-yellow-500",
      badgeColor: "bg-yellow-500",
    },
    {
      id: 2,
      name: "Paskibra DKI Jakarta",
      votes: 1320,
      rank: 2,
      city: "Jakarta",
      color: "from-gray-400 to-gray-500",
      badgeColor: "bg-gray-500",
    },
    {
      id: 3,
      name: "Paskibra Jawa Timur",
      votes: 1245,
      rank: 3,
      city: "Surabaya",
      color: "from-amber-400 to-amber-500",
      badgeColor: "bg-amber-500",
    },
    {
      id: 4,
      name: "Paskibra Jawa Tengah",
      votes: 1120,
      rank: 4,
      city: "Semarang",
      color: "from-red-400 to-red-500",
      badgeColor: "bg-red-500",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat halaman...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 md:space-y-16">
      {/* Hero Section dengan Slider */}
      <section className="relative overflow-hidden rounded-xl md:rounded-2xl shadow-lg">
        {/* Slider Container */}
        <div className="relative h-[60vh] md:h-[70vh] lg:h-[80vh]">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}>
              {/* Background Image */}
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />

              {/* Content */}
              <div className="relative h-full flex items-center">
                <div className="container mx-auto px-4 md:px-8">
                  <div className="max-w-2xl text-white">
                    {/* Live Badge */}
                    <div className="inline-flex items-center gap-2 bg-red-600 text-white rounded-full px-4 py-2 mb-6">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold">EVENT LIVE</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
                      {slide.title}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl mb-8 md:mb-10 text-gray-200">
                      {slide.subtitle}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      {user ? (
                        <>
                          {user.role === "user" && (
                            <Link
                              to="/voting"
                              className="inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
                              <Vote size={20} />
                              <span>Mulai Voting</span>
                            </Link>
                          )}
                          <Link
                            to="/results"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/30 hover:bg-white/30 transition-colors">
                            <Trophy size={20} />
                            <span>Lihat Hasil</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/auth/login"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
                            <Vote size={20} />
                            <span>Masuk untuk Voting</span>
                          </Link>
                          <Link
                            to="/auth/register"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/30 hover:bg-white/30 transition-colors">
                            <span>Daftar Sekarang</span>
                            <ChevronRight size={18} />
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
            aria-label="Slide sebelumnya">
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
            aria-label="Slide berikutnya">
            <ChevronRight size={24} />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "bg-white w-6"
                    : "bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="animate-bounce">
              <ChevronDown className="text-white/70" size={24} />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.bg} p-4 md:p-6 rounded-xl border border-gray-200`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} p-2 rounded-lg`}>
                  {stat.icon}
                </div>
                {stat.increment && (
                  <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <TrendingUp size={10} />
                    {stat.increment}
                  </div>
                )}
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section>
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Sistem Terpadu & Modern
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Semua yang Anda butuhkan untuk pengalaman lomba yang optimal
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="group bg-white p-5 md:p-6 rounded-xl border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all">
              <div
                className={`${feature.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Teams Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                🔥 Tim Terpopuler
              </h2>
              <p className="text-gray-600">Tim dengan voting terbanyak</p>
            </div>
            <Link
              to="/results"
              className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1 text-sm md:text-base">
              Lihat semua
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {topTeams.map((team) => (
            <div
              key={team.id}
              className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all">
              <div className="p-5 md:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`${team.badgeColor} w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                    #{team.rank}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin size={12} />
                    {team.city}
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 text-lg mb-3">
                  {team.name}
                </h3>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Total Votes</span>
                    <span className="font-bold text-gray-900">
                      {team.votes.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${team.color} rounded-full`}
                      style={{ width: `${(team.votes / 2000) * 100}%` }}
                    />
                  </div>
                </div>

                {user ? (
                  <Link
                    to="/voting"
                    className="w-full py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm">
                    <Vote size={16} />
                    Vote Sekarang
                  </Link>
                ) : (
                  <Link
                    to="/auth/login"
                    className="w-full py-2.5 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm">
                    <Vote size={16} />
                    Login untuk Vote
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 md:p-8 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Star size={16} className="text-yellow-300" />
            <span className="font-semibold text-sm">KESEMPATAN TERBATAS</span>
          </div>

          <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">
            Siap Menunjukkan Prestasi?
          </h2>

          <p className="text-white/90 mb-6 md:mb-8">
            Bergabung dengan ratusan tim Paskibra terbaik dari seluruh
            Indonesia. Raih kesempatan untuk menjadi juara nasional 2026!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/ticket"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              <span>Daftar Tim Anda</span>
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/voting"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-lg border border-white/30 hover:bg-white/30 transition-colors">
              <Trophy size={18} />
              <span>Mulai Voting</span>
            </Link>
          </div>

          <div className="mt-6 text-white/80 text-sm">
            🏆 Pendaftaran ditutup 30 September 2026 • Kuota 32 tim
          </div>
        </div>
      </section>
    </div>
  );
};

// Komponen ChevronDown untuk scroll indicator
const ChevronDown = ({ className, size = 24 }) => (
  <svg
    className={className}
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 14l-7 7m0 0l-7-7m7 7V3"
    />
  </svg>
);

export default Home;
