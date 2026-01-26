import { useState, useEffect } from "react";
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
} from "lucide-react";

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

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
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all"
          >
            Kembali ke Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-red-600 to-pink-600">
                <Shield size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-gray-400 text-sm">
                  Kelola sistem voting, tiket, dan user management
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden md:block">
                  <p className="font-medium text-white text-sm">
                    {user?.name || "Administrator"}
                  </p>
                  <p className="text-xs text-gray-400">Super Admin</p>
                </div>
                <div className="relative group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 flex items-center justify-center text-white font-semibold shadow-md">
                    <User size={20} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 bg-green-500"></div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-colors group"
                  title="Logout"
                >
                  <LogOut
                    size={20}
                    className="text-red-400 group-hover:text-red-300"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Menu */}
          <div className="lg:w-1/4">
            <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6 sticky top-32">
              <div className="mb-8">
                <h2 className="text-lg font-bold mb-4">Menu Navigasi</h2>
                <nav className="space-y-2">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === item.id
                          ? "bg-gradient-to-r from-blue-600/20 to-cyan-600/20 text-blue-400 border border-blue-500/30"
                          : "text-gray-400 hover:text-white hover:bg-gray-700/50"
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
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4">
            {/* Dynamic Content Area */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-800/30 rounded-2xl border border-gray-700 p-6"
            >
              {/* Outlet untuk menampilkan komponen */}
              <Outlet context={{ stats, formatCurrency, setStats }} />
            </motion.div>

            {/* Security Warning */}
            <div className="mt-8 p-6 bg-gradient-to-r from-red-900/20 to-pink-900/20 border border-red-800/30 rounded-2xl">
              <div className="flex items-start gap-4">
                <Shield className="text-red-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-lg mb-2">Keamanan Dashboard</h4>
                  <p className="text-gray-300 mb-3">
                    Dashboard admin ini memiliki akses penuh ke seluruh sistem.
                    Pastikan untuk selalu logout setelah menggunakan dashboard
                    dan jangan pernah membagikan kredensial Anda kepada
                    siapapun.
                  </p>
                  <div className="flex gap-3">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
