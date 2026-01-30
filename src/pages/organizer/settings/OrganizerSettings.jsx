import React, { useState } from "react";
import {
  Settings,
  User,
  Bell,
  Shield,
  Globe,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

const OrganizerSettings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: true,
    darkMode: true,
    twoFactorAuth: false,
  });

  const [profile, setProfile] = useState({
    name: "Organizer Name",
    email: "organizer@example.com",
    phone: "+62 812-3456-7890",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleSettingChange = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    alert("Pengaturan berhasil disimpan!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Pengaturan</h1>
          <p className="text-gray-400">Kelola pengaturan akun dan sistem</p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-medium transition-all"
        >
          <Save size={18} />
          Simpan Perubahan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-900/30 rounded-lg">
                <User size={20} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Profil Organizer</h3>
                <p className="text-sm text-gray-400">
                  Informasi akun organizer
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Nama</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Telepon
                </label>
                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Password Card */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-900/30 rounded-lg">
                <Shield size={20} className="text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Keamanan</h3>
                <p className="text-sm text-gray-400">
                  Ubah password dan keamanan
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Password Lama
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Password Baru
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Konfirmasi Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Sidebar */}
        <div className="space-y-6">
          {/* Notification Settings */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-yellow-900/30 rounded-lg">
                <Bell size={20} className="text-yellow-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Notifikasi</h3>
                <p className="text-sm text-gray-400">
                  Pengaturan pemberitahuan
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Notifikasi Sistem</span>
                <button
                  onClick={() => handleSettingChange("notifications")}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.notifications ? "bg-green-600" : "bg-gray-700"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full transform transition-transform ${
                      settings.notifications ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300">Update via Email</span>
                <button
                  onClick={() => handleSettingChange("emailUpdates")}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.emailUpdates ? "bg-green-600" : "bg-gray-700"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full transform transition-transform ${
                      settings.emailUpdates ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-900/30 rounded-lg">
                <Globe size={20} className="text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Sistem</h3>
                <p className="text-sm text-gray-400">Pengaturan tampilan</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Mode Gelap</span>
                <button
                  onClick={() => handleSettingChange("darkMode")}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.darkMode ? "bg-blue-600" : "bg-gray-700"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full transform transition-transform ${
                      settings.darkMode ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-300">Two-Factor Auth</span>
                <button
                  onClick={() => handleSettingChange("twoFactorAuth")}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.twoFactorAuth ? "bg-purple-600" : "bg-gray-700"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full transform transition-transform ${
                      settings.twoFactorAuth ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-700/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings size={20} className="text-blue-400" />
              <h3 className="font-semibold text-white">Tips</h3>
            </div>
            <p className="text-sm text-gray-300">
              Simpan pengaturan secara berkala untuk memastikan konfigurasi Anda
              tetap aman dan sesuai dengan kebutuhan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerSettings;
