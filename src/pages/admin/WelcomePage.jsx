import { motion } from "framer-motion";
import { Shield, Users, BarChart3, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const WelcomePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleGoToDashboard = () => {
    navigate("/admin/dashboard");
  };

  const features = [
    {
      icon: Users,
      title: "User Management",
      description: "Kelola semua pengguna sistem",
      color: "from-purple-600 to-violet-600",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Pantau statistik sistem secara real-time",
      color: "from-blue-600 to-cyan-600",
    },
    {
      icon: Settings,
      title: "System Settings",
      description: "Konfigurasi pengaturan sistem",
      color: "from-green-600 to-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full">
        <div className="bg-gray-800/50 backdrop-blur-md rounded-3xl border border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-pink-600 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm">
                <Shield size={48} className="text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-2">Selamat Datang, Admin!</h1>
            <p className="text-gray-200 text-lg">
              Anda telah login sebagai Administrator sistem
            </p>
          </div>

          {/* User Info */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {user?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {user?.name || "Administrator"}
                  </h2>
                  <p className="text-gray-400">Super Admin Access</p>
                  <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleLogout}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl flex items-center gap-2 transition-all">
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
                <button
                  onClick={handleGoToDashboard}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl font-bold transition-all">
                  Masuk Dashboard
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-6 text-center">
                Fitur Administrator
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 hover:border-gray-600 transition-all group hover:scale-[1.02]">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                      <feature.icon size={24} className="text-white" />
                    </div>
                    <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                    <p className="text-gray-400">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Warning */}
            <div className="bg-gradient-to-r from-red-900/30 to-pink-900/30 border border-red-800/30 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <Shield className="text-red-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-lg mb-2">Perhatian Keamanan</h4>
                  <p className="text-gray-300">
                    Sebagai Administrator, Anda memiliki akses penuh ke seluruh
                    sistem. Pastikan untuk selalu logout setelah menggunakan
                    sistem dan jaga kerahasiaan kredensial Anda.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomePage;
