import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import {
  BarChart3,
  Users,
  Vote,
  Ticket as TicketIcon,
  Shield,
  RefreshCw,
  ChevronRight,
  User,
  LogOut,
  History,
  Settings,
  Menu,
  X,
} from "lucide-react";

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, logout } = useAuth();
  const mainContentRef = useRef(null);
  const [activeTab, setActiveTab] = useState("overview");
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
    if (path.includes("/admin/events")) {
      setActiveTab("events");
    } else if (path.includes("/admin/users")) {
      setActiveTab("users");
    } else if (path.includes("/admin/transactions")) {
      setActiveTab("transactions");
    } else if (path.includes("/admin/tickets")) {
      setActiveTab("tickets");
    } else if (path.includes("/admin/history")) {
      setActiveTab("history");
    } else if (path.includes("/admin/settings")) {
      setActiveTab("settings");
    } else {
      setActiveTab("overview");
    }
  }, [location.pathname]);

  const [stats, setStats] = useState({});

  // Cek role admin
  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/auth/login");
      return;
    }

    if (user.role !== "admin") {
      alert("Hanya admin yang dapat mengakses dashboard!");
      navigate("/");
    }
  }, [user, loading, navigate]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Menu items dengan routing
  const menuItems = [
    {
      id: "overview",
      label: "Overview",
      icon: BarChart3,
      path: "/admin",
      color: "from-blue-600 to-cyan-600",
    },
    {
      id: "events",
      label: "Event",
      icon: Users,
      path: "/admin/events",
      color: "from-green-600 to-emerald-600",
    },
    {
      id: "users",
      label: "User Management",
      icon: User,
      path: "/admin/users",
      color: "from-purple-600 to-violet-600",
    },
    {
      id: "transactions",
      label: "Data Voting",
      icon: Vote,
      path: "/admin/transactions",
      color: "from-orange-600 to-amber-600",
    },
    {
      id: "tickets",
      label: "Data Tiket",
      icon: TicketIcon,
      path: "/admin/tickets",
      color: "from-pink-600 to-rose-600",
    },
    {
      id: "history",
      label: "History Order",
      icon: History,
      path: "/admin/history",
      color: "from-indigo-600 to-blue-600",
    },
    {
      id: "settings",
      label: "Pengaturan",
      icon: Settings,
      path: "/admin/settings",
      color: "from-gray-600 to-gray-700",
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

  // Stats data untuk sidebar
  const adminStats = [
    {
      label: "Total User",
      value: "2,548",
      icon: Users,
      color: "blue",
      change: "+12%",
    },
    {
      label: "Total Votes",
      value: "15,842",
      icon: Vote,
      color: "green",
      change: "+8%",
    },
    {
      label: "Total Tiket",
      value: "248",
      icon: TicketIcon,
      color: "purple",
      change: "+5%",
    },
    {
      label: "Event Aktif",
      value: "3",
      icon: Users,
      color: "yellow",
      change: "0%",
    },
  ];

  // Recent activities
  const recentActivities = [
    {
      id: 1,
      name: "User Baru",
      description: "john.doe@gmail.com terdaftar",
      time: "5 menit lalu",
    },
    {
      id: 2,
      name: "Voting Update",
      description: "1,250 votes untuk Tim A",
      time: "30 menit lalu",
    },
    {
      id: 3,
      name: "Tiket Terjual",
      description: "Tiket VIP laku 5 buah",
      time: "2 jam lalu",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-400">Memuat dashboard admin...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Akses Ditolak</h2>
          <p className="text-gray-400 mb-6">
            Hanya admin yang dapat mengakses halaman ini
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all">
            Kembali ke Home
          </button>
        </div>
      </div>
    );
  }

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
                <div className="p-2 rounded-xl bg-gradient-to-r from-red-600 to-pink-600">
                  <Shield size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Admin Dashboard</h1>
                  <p className="text-gray-400 text-xs">
                    Kelola sistem voting, tiket, dan user management
                  </p>
                </div>
              </div>

              {/* Toggle Sidebar Button */}
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
                    {user?.name || "Administrator"}
                  </p>
                </div>
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 flex items-center justify-center text-white font-semibold shadow-md">
                    <User size={18} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-gray-900 bg-green-500"></div>
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
            sidebarOpen ? "w-72" : "w-0"
          }`}>
          <div
            className={`w-72 bg-gray-800/50 border-r border-gray-700 flex flex-col flex-shrink-0 transition-opacity duration-300 ${
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
                          ? "bg-gradient-to-r from-red-600/20 to-pink-600/20 text-red-400 border border-red-500/30"
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
                <h2 className="text-lg font-bold mb-4">Statistik Sistem</h2>
                <div className="space-y-3">
                  {adminStats.map((stat) => {
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
                        <div className="flex items-center justify-between">
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
                          <span
                            className={`text-xs font-medium ${
                              stat.change.startsWith("+")
                                ? "text-green-400"
                                : stat.change.startsWith("-")
                                  ? "text-red-400"
                                  : "text-gray-400"
                            }`}>
                            {stat.change}
                          </span>
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
                      className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
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
                      ? "bg-gradient-to-r from-red-600/20 to-pink-600/20 text-red-400 border border-red-500/30"
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
              <h2 className="text-lg font-bold mb-4">Statistik Sistem</h2>
              <div className="grid grid-cols-2 gap-3">
                {adminStats.map((stat) => {
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
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[stat.color]}`}>
                            <Icon size={16} />
                          </div>
                          <span
                            className={`text-xs font-medium ${
                              stat.change.startsWith("+")
                                ? "text-green-400"
                                : stat.change.startsWith("-")
                                  ? "text-red-400"
                                  : "text-gray-400"
                            }`}>
                            {stat.change}
                          </span>
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
                    className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
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
                    <Outlet context={{ stats, formatCurrency, setStats }} />

                    {/* Security Warning */}
                    <div className="p-6 bg-gradient-to-r from-red-900/20 to-pink-900/20 border border-red-800/30 rounded-2xl">
                      <div className="flex items-start gap-4">
                        <Shield className="text-red-400 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-lg mb-2">
                            Keamanan Dashboard
                          </h4>
                          <p className="text-gray-300 mb-3">
                            Dashboard admin ini memiliki akses penuh ke seluruh
                            sistem. Pastikan untuk selalu logout setelah
                            menggunakan dashboard dan jangan pernah membagikan
                            kredensial Anda kepada siapapun.
                          </p>
                          <div className="flex flex-wrap gap-3">
                            <span className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg text-sm">
                              Super Admin Access
                            </span>
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm">
                              Full System Control
                            </span>
                            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-lg text-sm">
                              Sensitive Data
                            </span>
                          </div>
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

export default DashboardPage;
