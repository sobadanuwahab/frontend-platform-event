import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Award,
  BarChart3,
  Clock,
  Trophy,
  User,
  LogOut,
  FileCheck,
  ListOrdered,
  ClipboardCheck,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const JudgingPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mainContentRef = useRef(null);
  const [activeTab, setActiveTab] = useState("scoring");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto close sidebar on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Update active tab berdasarkan URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/judging/ranking")) {
      setActiveTab("ranking");
    } else if (path.includes("/judging/criteria")) {
      setActiveTab("criteria");
    } else {
      setActiveTab("scoring");
    }
  }, [location.pathname]);

  const menuItems = [
    {
      id: "scoring",
      label: "Penilaian",
      icon: FileCheck,
      path: "/judging",
    },
    {
      id: "ranking",
      label: "Ranking",
      icon: ListOrdered,
      path: "/judging/ranking",
    },
    {
      id: "criteria",
      label: "Kriteria",
      icon: ClipboardCheck,
      path: "/judging/criteria",
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getDisplayRole = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "Admin";
      case "juri":
        return "Juri";
      case "organizer":
        return "Organizer";
      default:
        return "Juri";
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return {
          bg: "bg-gradient-to-r from-red-600 to-pink-600",
          dot: "bg-red-500",
        };
      case "juri":
        return {
          bg: "bg-gradient-to-r from-purple-600 to-violet-600",
          dot: "bg-purple-500",
        };
      case "organizer":
        return {
          bg: "bg-gradient-to-r from-blue-600 to-indigo-600",
          dot: "bg-blue-500",
        };
      default:
        return {
          bg: "bg-gradient-to-r from-purple-600 to-violet-600",
          dot: "bg-purple-500",
        };
    }
  };

  const roleColors = getRoleColor(user?.role);

  // Stats data
  const stats = [
    {
      label: "Tim Dinilai",
      value: "12/24",
      icon: Users,
      color: "blue",
    },
    {
      label: "Rata-rata Skor",
      value: "85.6",
      icon: Award,
      color: "green",
    },
    {
      label: "Kriteria",
      value: "5",
      icon: BarChart3,
      color: "purple",
    },
    {
      label: "Sisa Waktu",
      value: "3:45:12",
      icon: Clock,
      color: "yellow",
    },
  ];

  const teams = [
    {
      id: 1,
      name: "SMAN 1 Kota",
      category: "Senior",
      status: "sedang_dinilai",
    },
    { id: 2, name: "SMK Teknik 2", category: "Senior", status: "belum" },
    { id: 3, name: "SMP 5", category: "Junior", status: "selesai" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 flex-shrink-0">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Left Section */}
            <div className="flex items-center gap-3">
              {/* Logo and Title */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600">
                  <Trophy size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Panel Penjurian</h1>
                  <p className="text-gray-400 text-xs">
                    Sistem penilaian lomba Paskibra 2024
                  </p>
                </div>
              </div>

              {/* Toggle Sidebar Button - Hamburger untuk semua ukuran */}
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 active:bg-gray-700/50 transition-all"
                title={sidebarOpen ? "Tutup Sidebar" : "Buka Sidebar"}>
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <p className="font-medium text-white text-sm">
                    {user?.name || "Juri"}
                  </p>
                </div>
                <div className="relative">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-semibold shadow-md ${roleColors.bg}`}>
                    <User size={18} />
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-gray-900 ${roleColors.dot}`}></div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/20 active:bg-red-500/30 transition-all"
                  title="Logout">
                  <LogOut size={18} />
                  <span className="text-sm font-medium hidden sm:inline">
                    Logout
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Flex container untuk sidebar dan konten */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar for Desktop */}
        <div
          className={`hidden lg:flex transition-all duration-300 flex-shrink-0 ${
            sidebarOpen ? "w-64" : "w-0"
          }`}>
          <div
            className={`w-64 bg-gray-800/50 border-r border-gray-700 flex flex-col flex-shrink-0 transition-opacity duration-300 ${
              sidebarOpen ? "opacity-100" : "opacity-0"
            }`}>
            <div className="p-5 flex-1 overflow-y-auto">
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-4">Menu Navigasi</h2>
                <nav className="space-y-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === item.id
                          ? "bg-gradient-to-r from-purple-600/20 to-violet-600/20 text-purple-400 border border-purple-500/30"
                          : "text-gray-400 hover:text-white hover:bg-gray-700/50 active:bg-gray-600/50"
                      }`}>
                      <item.icon size={18} />
                      <span className="font-medium">{item.label}</span>
                      <ChevronRight
                        size={16}
                        className={`ml-auto transition-transform ${
                          activeTab === item.id ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                  ))}
                </nav>
              </div>

              {/* Stats Overview */}
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-4">Statistik</h2>
                <div className="space-y-3">
                  {stats.map((stat) => {
                    const Icon = stat.icon;
                    const colorClasses = {
                      blue: "from-blue-900/30 to-blue-700/30 border-blue-700/30 text-blue-400",
                      green:
                        "from-green-900/30 to-green-700/30 border-green-700/30 text-green-400",
                      purple:
                        "from-purple-900/30 to-purple-700/30 border-purple-700/30 text-purple-400",
                      yellow:
                        "from-yellow-900/30 to-yellow-700/30 border-yellow-700/30 text-yellow-400",
                    };

                    return (
                      <div
                        key={stat.label}
                        className="bg-gray-800/50 border border-gray-700 p-3 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[stat.color]}`}>
                            <Icon size={16} />
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">
                              {stat.label}
                            </p>
                            <p className="text-base font-bold text-white">
                              {stat.value}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Current Teams */}
              <div className="pt-4 border-t border-gray-700">
                <h2 className="text-lg font-bold mb-4">Tim Sedang Dinilai</h2>
                <div className="space-y-3">
                  {teams
                    .filter((team) => team.status === "sedang_dinilai")
                    .map((team) => (
                      <div
                        key={team.id}
                        className="flex items-center justify-between p-3 bg-purple-900/20 rounded-lg border border-purple-700/30">
                        <div>
                          <p className="font-semibold text-sm text-white">
                            {team.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {team.category}
                          </p>
                        </div>
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 lg:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}>
          <div className="bg-gray-800/95 backdrop-blur-md border-r border-gray-700 h-full p-5 overflow-y-auto">
            {/* Close Button for Mobile */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Menu Navigasi</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 active:bg-gray-700/50 transition-all"
                title="Tutup Sidebar">
                <X size={20} />
              </button>
            </div>

            <nav className="space-y-2 mb-6">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleNavigation(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === item.id
                      ? "bg-gradient-to-r from-purple-600/20 to-violet-600/20 text-purple-400 border border-purple-500/30"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50 active:bg-gray-600/50"
                  }`}>
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                  <ChevronRight
                    size={16}
                    className={`ml-auto transition-transform ${
                      activeTab === item.id ? "rotate-90" : ""
                    }`}
                  />
                </button>
              ))}
            </nav>

            {/* Stats for Mobile */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-4">Statistik</h2>
              <div className="grid grid-cols-2 gap-3">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  const colorClasses = {
                    blue: "from-blue-900/30 to-blue-700/30 border-blue-700/30 text-blue-400",
                    green:
                      "from-green-900/30 to-green-700/30 border-green-700/30 text-green-400",
                    purple:
                      "from-purple-900/30 to-purple-700/30 border-purple-700/30 text-purple-400",
                    yellow:
                      "from-yellow-900/30 to-yellow-700/30 border-yellow-700/30 text-yellow-400",
                  };

                  return (
                    <div
                      key={stat.label}
                      className="bg-gray-800/50 border border-gray-700 p-3 rounded-xl">
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={`p-2 rounded-lg mb-2 bg-gradient-to-r ${colorClasses[stat.color]}`}>
                          <Icon size={18} />
                        </div>
                        <p className="text-xs text-gray-400 mb-1">
                          {stat.label}
                        </p>
                        <p className="text-base font-bold text-white">
                          {stat.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current Teams for Mobile */}
            <div className="pt-4 border-t border-gray-700">
              <h2 className="text-lg font-bold mb-4">Tim Sedang Dinilai</h2>
              <div className="space-y-3">
                {teams
                  .filter((team) => team.status === "sedang_dinilai")
                  .map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-3 bg-purple-900/20 rounded-lg border border-purple-700/30">
                      <div>
                        <p className="font-semibold text-white">{team.name}</p>
                        <p className="text-sm text-gray-400">{team.category}</p>
                      </div>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area dengan scroll sendiri */}
        <div
          ref={mainContentRef}
          className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-6">
              <div className="flex gap-6">
                <div
                  className={`flex-1 transition-all duration-300 ${
                    sidebarOpen && !isMobile ? "lg:ml-0" : ""
                  }`}>
                  <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6">
                    {/* Dynamic Content dari Outlet */}
                    <Outlet />

                    {/* Warnings Section */}
                    <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-5">
                      <h3 className="font-bold text-lg text-white mb-4">
                        Peringatan & Panduan
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-red-900/20 rounded-xl border border-red-700/30">
                          <p className="text-red-400 font-medium mb-2">
                            Waktu Penilaian
                          </p>
                          <p className="text-sm text-gray-300">
                            15 menit per tim
                          </p>
                        </div>
                        <div className="p-4 bg-yellow-900/20 rounded-xl border border-yellow-700/30">
                          <p className="text-yellow-400 font-medium mb-2">
                            Kelengkapan Skor
                          </p>
                          <p className="text-sm text-gray-300">
                            Semua kriteria harus diisi
                          </p>
                        </div>
                        <div className="p-4 bg-blue-900/20 rounded-xl border border-blue-700/30">
                          <p className="text-blue-400 font-medium mb-2">
                            Penyimpanan Data
                          </p>
                          <p className="text-sm text-gray-300">
                            Simpan sebelum pindah tim
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgingPage;
