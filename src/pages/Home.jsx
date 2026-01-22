import { useState, useEffect } from "react";
import {
  ArrowRight,
  Play,
  Shield,
  Award,
  Users,
  Clock,
  Trophy,
  Flag,
  Star,
  Target,
  Vote,
  Calendar,
  MapPin,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // State untuk animasi
  const [animatedStats, setAnimatedStats] = useState({
    totalVotes: 0,
    registeredTeams: 0,
    judges: 0,
    daysLeft: 0,
  });

  // Animasi angka statistik
  useEffect(() => {
    const targetStats = {
      totalVotes: 2548,
      registeredTeams: 24,
      judges: 15,
      daysLeft: 3,
    };

    const duration = 2000; // 2 detik
    const steps = 60;
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

  const stats = [
    {
      icon: <Users size={24} />,
      value: animatedStats.totalVotes.toLocaleString(),
      label: "Total Votes",
      color: "text-red-600",
      bg: "bg-red-50",
      increment: "+12",
    },
    {
      icon: <Award size={24} />,
      value: animatedStats.registeredTeams,
      label: "Tim Terdaftar",
      color: "text-blue-600",
      bg: "bg-blue-50",
      increment: "+2",
    },
    {
      icon: <Shield size={24} />,
      value: animatedStats.judges,
      label: "Juri Professional",
      color: "text-green-600",
      bg: "bg-green-50",
      increment: "+1",
    },
    {
      icon: <Clock size={24} />,
      value: `${animatedStats.daysLeft} Days`,
      label: "Waktu Tersisa",
      color: "text-orange-600",
      bg: "bg-orange-50",
      increment: "",
    },
  ];

  const features = [
    {
      title: "Voting Real-time",
      description:
        "Pantau perolehan suara secara live dengan sistem voting yang transparan",
      icon: <Target className="text-white" size={24} />,
      bg: "bg-gradient-to-br from-red-500 to-red-600",
      link: "/voting",
    },
    {
      title: "Pendaftaran Online",
      description:
        "Daftar dengan mudah melalui sistem online dengan pembayaran yang aman",
      icon: <Flag className="text-white" size={24} />,
      bg: "bg-gradient-to-br from-blue-500 to-blue-600",
      link: "/ticket",
    },
    {
      title: "Penilaian Digital",
      description:
        "Sistem penjurian modern dengan kalkulasi otomatis dan laporan real-time",
      icon: <Shield className="text-white" size={24} />,
      bg: "bg-gradient-to-br from-green-500 to-green-600",
      link: "/judging",
    },
    {
      title: "Hasil Instan",
      description:
        "Hasil langsung tersedia setelah penjurian dengan analisis mendalam",
      icon: <Trophy className="text-white" size={24} />,
      bg: "bg-gradient-to-br from-purple-500 to-purple-600",
      link: "/results",
    },
  ];

  const topTeams = [
    {
      id: 1,
      name: "Paskibra Jawa Barat",
      votes: 1542,
      rank: 1,
      city: "Bandung",
      color: "from-yellow-400 to-yellow-500",
      badgeColor: "bg-yellow-500",
      image:
        "https://images.unsplash.com/photo-1598894597312-4d0d2bead49b?w=400&h=300&fit=crop",
    },
    {
      id: 2,
      name: "Paskibra DKI Jakarta",
      votes: 1320,
      rank: 2,
      city: "Jakarta",
      color: "from-gray-400 to-gray-500",
      badgeColor: "bg-gray-500",
      image:
        "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400&h=300&fit=crop",
    },
    {
      id: 3,
      name: "Paskibra Jawa Timur",
      votes: 1245,
      rank: 3,
      city: "Surabaya",
      color: "from-amber-400 to-amber-500",
      badgeColor: "bg-amber-500",
      image:
        "https://images.unsplash.com/photo-1549060279-7e168fce7090?w=400&h=300&fit=crop",
    },
    {
      id: 4,
      name: "Paskibra Jawa Tengah",
      votes: 1120,
      rank: 4,
      city: "Semarang",
      color: "from-red-400 to-red-500",
      badgeColor: "bg-red-500",
      image:
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop",
    },
  ];

  const timeline = [
    {
      phase: "Pendaftaran",
      date: "1-30 Sept 2026",
      status: "active",
      color: "bg-gradient-to-r from-red-500 to-pink-500",
      icon: <Calendar size={20} />,
    },
    {
      phase: "Seleksi",
      date: "1-15 Okt 2026",
      status: "upcoming",
      color: "bg-gradient-to-r from-blue-400 to-blue-500",
      icon: <Shield size={20} />,
    },
    {
      phase: "Babak Penyisihan",
      date: "20-25 Okt 2026",
      status: "upcoming",
      color: "bg-gradient-to-r from-green-400 to-green-500",
      icon: <Users size={20} />,
    },
    {
      phase: "Final & Pengumuman",
      date: "27 Okt 2026",
      status: "upcoming",
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      icon: <Trophy size={20} />,
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
    <div className="space-y-16 animate-fade-in">
      {/* Hero Section dengan Tulisan Langsung di Atas Gambar */}
      <section className="relative overflow-hidden rounded-3xl shadow-2xl min-h-[90vh] flex items-center justify-center">
        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1920&q=80"
          alt="Paskibra Competition - Tim Paskibra sedang berbaris"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Gradient Overlay Ringan untuk Meningkatkan Kontras Teks */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />

        {/* Content - Langsung di atas gambar tanpa container */}
        <div className="relative z-10 container mx-auto px-4 py-12 text-center">
          {/* Live Badge */}
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full px-6 py-3 mb-8 animate-pulse shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="font-bold text-sm tracking-wider drop-shadow-md">
              🏆 EVENT LIVE • REGISTRATION OPEN
            </span>
          </div>

          {/* Judul Hero dengan Shadow untuk Kontras */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-8 leading-tight drop-shadow-2xl">
            Ajang Prestasi
            <span className="block mt-4">
              <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
                Paskibra
              </span>{" "}
              <span className="text-white drop-shadow-2xl">
                Terbaik Nasional 2026
              </span>
            </span>
          </h1>

          {/* Deskripsi dengan Shadow */}
          <p className="text-2xl md:text-3xl text-white mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-medium">
            Bergabunglah dalam kompetisi paling bergengsi untuk tim Paskibra
            se-Indonesia. Tunjukkan kreasi, prestasi, dan kebanggaan daerah Anda
            di ajang nasional.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            {user ? (
              <>
                {user.role === "user" && (
                  <Link
                    to="/voting"
                    className="group inline-flex items-center justify-center gap-4 px-10 py-5 text-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 shadow-2xl">
                    <Vote size={26} />
                    <span>Mulai Voting Sekarang</span>
                    <ArrowRight className="group-hover:translate-x-3 transition-transform" />
                  </Link>
                )}
                <Link
                  to="/results"
                  className="group inline-flex items-center justify-center gap-4 px-10 py-5 text-xl bg-white/20 backdrop-blur-lg text-white font-bold rounded-xl border-2 border-white/40 hover:border-white hover:bg-white/30 transition-all duration-300 shadow-2xl">
                  <Trophy size={26} />
                  <span>Lihat Hasil Terkini</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="group inline-flex items-center justify-center gap-4 px-10 py-5 text-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 shadow-2xl">
                  <Vote size={26} />
                  <span>Masuk untuk Voting</span>
                  <ArrowRight className="group-hover:translate-x-3 transition-transform" />
                </Link>
                <Link
                  to="/auth/register"
                  className="group inline-flex items-center justify-center gap-4 px-10 py-5 text-xl bg-white/20 backdrop-blur-lg text-white font-bold rounded-xl border-2 border-white/40 hover:border-white hover:bg-white/30 transition-all duration-300 shadow-2xl">
                  <span>Daftar Akun Baru</span>
                  <ChevronRight
                    size={24}
                    className="group-hover:translate-x-2 transition-transform"
                  />
                </Link>
              </>
            )}
          </div>

          {/* Info Tambahan dengan Background Transparan */}
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-4 bg-black/30 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
              <div className="p-3 bg-white/20 rounded-xl">
                <Calendar size={24} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Tanggal Penting</p>
                <p className="text-white/90 text-sm">27 Oktober 2026</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-black/30 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
              <div className="p-3 bg-white/20 rounded-xl">
                <MapPin size={24} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Lokasi</p>
                <p className="text-white/90 text-sm">
                  Gelora Bung Karno, Jakarta
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-black/30 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
              <div className="p-3 bg-white/20 rounded-xl">
                <Users size={24} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold">Partisipan</p>
                <p className="text-white/90 text-sm">32 Tim Terbaik</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-14 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-scroll"></div>
          </div>
        </div>

        {/* Floating Trophy Badge */}
        <div className="absolute top-8 right-8 hidden lg:block">
          <div className="relative">
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white px-7 py-5 rounded-2xl shadow-2xl animate-bounce-slow">
              <div className="flex items-center gap-3">
                <Trophy size={28} className="text-white" />
                <div>
                  <p className="font-bold text-sm">PIALA BERGENGSI</p>
                  <p className="text-xs opacity-90">Hadiah Rp 500 Juta</p>
                </div>
              </div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-75"></div>
            <div
              className="absolute -bottom-2 -left-2 w-5 h-5 bg-blue-500 rounded-full animate-ping opacity-75"
              style={{ animationDelay: "0.5s" }}></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="animate-slide-up">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`${stat.bg} p-6 rounded-2xl border border-gray-200 hover:border-red-200 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-2 rounded-xl`}>
                  {stat.icon}
                </div>
                {stat.increment && (
                  <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <TrendingUp size={12} />
                    {stat.increment}
                  </div>
                )}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Sistem Terpadu & Modern
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Semua yang Anda butuhkan untuk pengalaman lomba yang optimal dan
            transparan
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="group bg-white p-6 rounded-2xl border border-gray-200 hover:border-red-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 block">
              <div
                className={`${feature.bg} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
              <div className="mt-4 flex items-center text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-sm font-medium">Akses sekarang</span>
                <ArrowRight size={16} className="ml-2" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Teams Section */}
      <section
        className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 shadow-lg animate-slide-up"
        style={{ animationDelay: "0.2s" }}>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                🔥 Tim Terpopuler
              </h2>
              <p className="text-gray-600">
                Perhatikan tim-tim dengan voting terbanyak
              </p>
            </div>
            <Link
              to="/results"
              className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2">
              Lihat semua
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topTeams.map((team) => (
            <div
              key={team.id}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-red-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              {/* Team Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={team.image}
                  alt={team.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <div
                    className={`${team.badgeColor} px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg`}>
                    #{team.rank}
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 flex items-center gap-1 text-sm text-white bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full">
                  <MapPin size={14} />
                  {team.city}
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-2">
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
                      className={`h-full bg-gradient-to-r ${team.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${(team.votes / 2000) * 100}%` }}
                    />
                  </div>
                </div>

                {user ? (
                  <Link
                    to="/voting"
                    className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2">
                    <Vote size={18} />
                    Vote Sekarang
                  </Link>
                ) : (
                  <Link
                    to="/auth/login"
                    className="w-full py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-medium rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex items-center justify-center gap-2">
                    <Vote size={18} />
                    Login untuk Vote
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline Section */}
      {/* <section className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            📅 Timeline Lomba
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Ikuti jadwal lengkap kompetisi Paskibra Nasional 2026
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {timeline.map((item, index) => (
              <div
                key={index}
                className={`text-center p-6 rounded-xl border-2 ${
                  item.status === "active"
                    ? "border-red-300 bg-red-50"
                    : "border-gray-100"
                } transition-all duration-300 hover:shadow-lg`}>
                <div
                  className={`${item.color} w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-white ${
                    item.status === "active" ? "animate-pulse" : ""
                  }`}>
                  {item.icon}
                </div>
                <div className="font-bold text-gray-900 text-lg mb-2">
                  {item.phase}
                </div>
                <div className="text-gray-600 mb-4">{item.date}</div>
                {item.status === "active" ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 font-medium rounded-full text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                    Sedang Berlangsung
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">Akan Datang</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Final CTA Section dengan Gambar */}
      <section
        className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[70vh] flex items-center justify-center animate-slide-up"
        style={{ animationDelay: "0.4s" }}>
        {/* Background Image */}
        <img
          src="https://images.unsplash.com/photo-1547891654-e66ed7ebb968?auto=format&fit=crop&w=1920&q=80"
          alt="Paskibra Final - Tim sedang berlatih"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Light Gradient Overlay untuk Kontras */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />

        {/* Content - Langsung di atas gambar */}
        <div className="relative z-10 container mx-auto px-4 py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full px-6 py-3 mb-8 border border-white/30 shadow-lg">
            <Star size={20} className="text-yellow-300" />
            <span className="font-semibold text-sm">KESEMPATAN TERBATAS</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight drop-shadow-2xl">
            Siap Menunjukkan <span className="text-yellow-300">Prestasi</span>?
          </h2>

          <p className="text-2xl text-white/95 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-lg font-medium">
            Bergabung dengan ratusan tim Paskibra terbaik dari seluruh
            Indonesia. Raih kesempatan untuk menjadi juara nasional 2026 dan
            bawa pulang piala bergengsi!
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/ticket"
              className="group inline-flex items-center justify-center gap-4 px-12 py-5 text-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-800 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 shadow-2xl">
              <span>Daftar Tim Anda</span>
              <ArrowRight className="group-hover:translate-x-3 transition-transform" />
            </Link>
            <Link
              to="/voting"
              className="group inline-flex items-center justify-center gap-4 px-12 py-5 text-xl bg-white/20 backdrop-blur-lg text-white font-bold rounded-xl border-2 border-white/40 hover:border-white hover:bg-white/30 transition-all duration-300 shadow-2xl">
              <Trophy size={26} />
              <span>Mulai Voting</span>
            </Link>
          </div>

          <div className="mt-10 text-white/90 text-sm drop-shadow">
            🏆 Pendaftaran ditutup pada 30 September 2026 • Kuota terbatas untuk
            32 tim
          </div>
        </div>
      </section>

      {/* Tambahkan styles untuk animasi */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes scroll {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(20px); opacity: 0; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
        .animate-slide-up {
          opacity: 0;
          animation: slide-up 0.6s ease-out forwards;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .animate-scroll {
          animation: scroll 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;
