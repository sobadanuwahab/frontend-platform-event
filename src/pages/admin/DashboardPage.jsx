import { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import {
  BarChart3,
  Users,
  CreditCard,
  Vote,
  Ticket as TicketIcon,
  Shield,
  RefreshCw,
  Bell,
  ChevronRight,
  User,
  LogOut,
  Home,
  Package,
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
    if (path.includes("/admin/participants")) {
      setActiveTab("participants");
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

  const [stats, setStats] = useState({
    totalUsers: 10,
    totalCoinsSold: 1500,
    totalTicketSold: 500,
    totalVotes: 56800,
    revenue: 25450000,
    activeUsers: 10,
    pendingTransactions: 5,
    completedTransaction: 25,
    completedTransactions: 250,
    totalParticipants: 5,
    activeParticipants: 4,
    pendingParticipants: 1,
  });

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
      id: "participants",
      label: "Event",
      icon: Users,
      path: "/admin/participants",
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

  const adminStats = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
      change: "+12%",
    },
    {
      label: "Revenue",
      value: formatCurrency(stats.revenue),
      icon: CreditCard,
      color: "bg-gradient-to-r from-green-500 to-emerald-500",
      change: "+24%",
    },
    {
      label: "Total Votes",
      value: stats.totalVotes.toLocaleString(),
      icon: Vote,
      color: "bg-gradient-to-r from-purple-500 to-violet-500",
      change: "+18%",
    },
    {
      label: "Tickets Sold",
      value: stats.totalTicketSold,
      icon: TicketIcon,
      color: "bg-gradient-to-r from-orange-500 to-amber-500",
      change: "+8%",
    },
    {
      label: "Active Users",
      value: stats.activeUsers,
      icon: User,
      color: "bg-gradient-to-r from-teal-500 to-cyan-500",
      change: "+5%",
    },
    {
      label: "Pending Transactions",
      value: stats.pendingTransactions,
      icon: Bell,
      color: "bg-gradient-to-r from-red-500 to-pink-500",
      change: "-3%",
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
              {/* Notifications */}
              <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

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

              {/* Quick Stats */}
              <div className="mt-8">
                <h2 className="text-lg font-bold mb-4">Statistik Singkat</h2>
                <div className="grid grid-cols-2 gap-3">
                  {adminStats.slice(0, 4).map((stat, index) => (
                    <div
                      key={index}
                      className="bg-gray-800/30 rounded-lg p-3 border border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <stat.icon size={16} className="text-gray-400" />
                        <span className="text-xs text-green-400 font-medium">
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-gray-400">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4">
            {/* Stats Grid */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {adminStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-gray-800/30 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.color}`}>
                      <stat.icon size={20} className="text-white" />
                    </div>
                    <span className="text-sm font-medium text-green-400">
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
                  <p className="text-gray-400">{stat.label}</p>
                </motion.div>
              ))}
            </div> */}

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
