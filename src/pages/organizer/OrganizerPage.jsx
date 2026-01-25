import { useState, useEffect } from "react";
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
  Bell,
  Search,
  Filter,
  ChevronRight,
  Trophy,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext"; // Import useAuth

const OrganizerPage = () => {
  const { user, logout } = useAuth(); // Ambil user dan logout dari context
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

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
      id: "participants",
      label: "Peserta",
      icon: Users,
      path: "/organizer/participants",
    },
    {
      id: "events",
      label: "Event",
      icon: Calendar,
      path: "/organizer/events",
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

  const stats = [
    { label: "Total Peserta", value: "24", icon: Users, color: "bg-blue-500" },
    { label: "Event Aktif", value: "3", icon: Calendar, color: "bg-green-500" },
    { label: "Pending", value: "8", icon: Bell, color: "bg-yellow-500" },
    { label: "Selesai", value: "16", icon: Trophy, color: "bg-purple-500" },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600">
                <Trophy size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Dashboard Organizer</h1>
                <p className="text-gray-400 text-sm">
                  Kelola event dan peserta Anda
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="text-right hidden md:block">
                    <p className="font-medium text-white text-sm">
                      {user?.name || "Organizer"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {getDisplayRole(user?.role)}
                    </p>
                  </div>
                  <div className="relative group">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-semibold shadow-md ${roleColors.bg}`}>
                      <User size={20} />
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 ${roleColors.dot}`}></div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 transition-colors group"
                  title="Logout">
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
              </div>

              {/* Quick Actions */}
              <div className="mt-8">
                <h2 className="text-lg font-bold mb-4">Aksi Cepat</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate("/organizer/participants/create")}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all font-medium">
                    <PlusCircle size={20} />
                    <span>Tambah Peserta Baru</span>
                  </button>
                  <button
                    onClick={() => navigate("/organizer/events/create")}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium">
                    <Calendar size={20} />
                    <span>Buat Event Baru</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-3/4">
            {/* Dynamic Content - Menggunakan Outlet untuk menampilkan halaman yang sesuai */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}>
              <Outlet />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerPage;
