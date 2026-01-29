import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  PlusCircle,
  Calendar,
  FileText,
  Settings,
  BarChart3,
  Trophy,
  User,
  LogOut,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const OrganizerPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mainContentRef = useRef(null);
  const [activeTab, setActiveTab] = useState("dashboard");
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
    if (path.includes("/organizer/participants")) {
      setActiveTab("participants");
    } else if (path.includes("/organizer/events")) {
      setActiveTab("events");
    } else if (path.includes("/organizer/documents")) {
      setActiveTab("documents");
    } else if (path.includes("/organizer/reports")) {
      setActiveTab("reports");
    } else if (path.includes("/organizer/settings")) {
      setActiveTab("settings");
    } else {
      setActiveTab("dashboard");
    }
  }, [location.pathname]);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/organizer",
    },
    {
      id: "events",
      label: "Event",
      icon: Calendar,
      path: "/organizer/events",
    },
    {
      id: "participants",
      label: "Peserta",
      icon: Users,
      path: "/organizer/participants",
    },
    {
      id: "documents",
      label: "Dokumen",
      icon: FileText,
      path: "/organizer/documents",
    },
    {
      id: "reports",
      label: "Laporan",
      icon: BarChart3,
      path: "/organizer/reports",
    },
    {
      id: "settings",
      label: "Pengaturan",
      icon: Settings,
      path: "/organizer/settings",
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
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
      case "user":
        return "User";
      default:
        return role?.charAt(0)?.toUpperCase() + role?.slice(1) || "User";
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
      case "user":
      default:
        return {
          bg: "bg-gradient-to-r from-teal-600 to-cyan-600",
          dot: "bg-orange-500",
        };
    }
  };

  const roleColors = getRoleColor(user?.role);

  // Stats data untuk sidebar
  const stats = [
    {
      label: "Total Peserta",
      value: "248",
      icon: Users,
      color: "blue",
    },
    {
      label: "Event Aktif",
      value: "3",
      icon: Calendar,
      color: "green",
    },
    {
      label: "Dokumen",
      value: "45",
      icon: FileText,
      color: "purple",
    },
    {
      label: "Laporan",
      value: "12",
      icon: BarChart3,
      color: "yellow",
    },
  ];

  // Recent activities
  const recentActivities = [
    {
      id: 1,
      name: "Pendaftaran Baru",
      description: "SMAN 1 Jakarta mendaftar",
      time: "10 menit lalu",
    },
    {
      id: 2,
      name: "Event Update",
      description: "Jadwal final diperbarui",
      time: "1 jam lalu",
    },
    {
      id: 3,
      name: "Dokumen Upload",
      description: "SK panitia diupload",
      time: "2 jam lalu",
    },
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
                <div className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600">
                  <Trophy size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Dashboard Organizer</h1>
                  <p className="text-gray-400 text-xs">
                    Kelola event dan peserta Anda
                  </p>
                </div>
              </div>

              {/* Toggle Sidebar Button */}
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 active:bg-gray-700/50 transition-all"
                title={sidebarOpen ? "Tutup Sidebar" : "Buka Sidebar"}
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="hidden md:block text-right">
                  <p className="font-medium text-white text-sm">
                    {user?.name || "Organizer"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {getDisplayRole(user?.role)}
                  </p>
                </div>
                <div className="relative">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-semibold shadow-md ${roleColors.bg}`}
                  >
                    <User size={18} />
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-gray-900 ${roleColors.dot}`}
                  ></div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/20 active:bg-red-500/30 transition-all"
                  title="Logout"
                >
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
            sidebarOpen ? "w-72" : "w-0"
          }`}
        >
          <div
            className={`w-72 bg-gray-800/50 border-r border-gray-700 flex flex-col flex-shrink-0 transition-opacity duration-300 ${
              sidebarOpen ? "opacity-100" : "opacity-0"
            }`}
          >
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
                          ? "bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-400 border border-blue-500/30"
                          : "text-gray-400 hover:text-white hover:bg-gray-700/50 active:bg-gray-600/50"
                      }`}
                    >
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

              {/* Quick Actions */}
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-4">Aksi Cepat</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate("/organizer/participants/create")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all font-medium"
                  >
                    <PlusCircle size={18} />
                    <span>Tambah Peserta</span>
                  </button>
                  <button
                    onClick={() => navigate("/organizer/events/create")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium"
                  >
                    <Calendar size={18} />
                    <span>Buat Event</span>
                  </button>
                </div>
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
                        className="bg-gray-800/50 border border-gray-700 p-3 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[stat.color]}`}
                          >
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

              {/* Recent Activities */}
              <div className="pt-4 border-t border-gray-700">
                <h2 className="text-lg font-bold mb-4">Aktivitas Terbaru</h2>
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm text-white">
                          {activity.name}
                        </p>
                        <span className="text-xs text-gray-500">
                          {activity.time}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {activity.description}
                      </p>
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
          }`}
        >
          <div className="bg-gray-800/95 backdrop-blur-md border-r border-gray-700 h-full p-5 overflow-y-auto">
            {/* Close Button for Mobile */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Menu Navigasi</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 active:bg-gray-700/50 transition-all"
                title="Tutup Sidebar"
              >
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
                      ? "bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-400 border border-blue-500/30"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50 active:bg-gray-600/50"
                  }`}
                >
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

            {/* Quick Actions for Mobile */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-4">Aksi Cepat</h2>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    navigate("/organizer/participants/create");
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all font-medium"
                >
                  <PlusCircle size={20} />
                  <span>Tambah Peserta</span>
                </button>
                <button
                  onClick={() => {
                    navigate("/organizer/events/create");
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium"
                >
                  <Calendar size={20} />
                  <span>Buat Event</span>
                </button>
              </div>
            </div>

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
                      className="bg-gray-800/50 border border-gray-700 p-3 rounded-xl"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={`p-2 rounded-lg mb-2 bg-gradient-to-r ${colorClasses[stat.color]}`}
                        >
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

            {/* Recent Activities for Mobile */}
            <div className="pt-4 border-t border-gray-700">
              <h2 className="text-lg font-bold mb-4">Aktivitas Terbaru</h2>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm text-white">
                        {activity.name}
                      </p>
                      <span className="text-xs text-gray-500">
                        {activity.time}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {activity.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area dengan scroll sendiri */}
        <div
          ref={mainContentRef}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-6">
              <div className="flex gap-6">
                <div
                  className={`flex-1 transition-all duration-300 ${
                    sidebarOpen && !isMobile ? "lg:ml-0" : ""
                  }`}
                >
                  <motion.div
                    key={location.pathname}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {/* Dynamic Content dari Outlet */}
                    <Outlet />

                    {/* Tips Section */}
                    <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-5">
                      <h3 className="font-bold text-lg text-white mb-4">
                        Tips & Panduan
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-900/20 rounded-xl border border-blue-700/30">
                          <p className="text-blue-400 font-medium mb-2">
                            Kelola Peserta
                          </p>
                          <p className="text-sm text-gray-300">
                            Pastikan data peserta lengkap dan valid
                          </p>
                        </div>
                        <div className="p-4 bg-green-900/20 rounded-xl border border-green-700/30">
                          <p className="text-green-400 font-medium mb-2">
                            Jadwal Event
                          </p>
                          <p className="text-sm text-gray-300">
                            Update jadwal secara berkala
                          </p>
                        </div>
                        <div className="p-4 bg-purple-900/20 rounded-xl border border-purple-700/30">
                          <p className="text-purple-400 font-medium mb-2">
                            Dokumentasi
                          </p>
                          <p className="text-sm text-gray-300">
                            Simpan semua dokumen penting
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

export default OrganizerPage;
