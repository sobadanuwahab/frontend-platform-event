import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  Award,
  School,
  MapPin,
  Phone,
  Clock,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  PlusCircle,
  FileText,
} from "lucide-react";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const API_URL = "https://apipaskibra.my.id/api";
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentParticipants, setRecentParticipants] = useState([]);
  const [apiStatus, setApiStatus] = useState("idle");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setApiStatus("loading");

    try {
      // Fetch participants
      const participantsRes = await axios.get(
        `${API_URL}/participant-lists/1`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );

      const participants = participantsRes.data.data || [];

      // Calculate stats
      const totalParticipants = participants.length;
      const activeParticipants = participants.filter(
        (p) =>
          p.status === "active" || p.status === "1" || p.status === "approved",
      ).length;
      const pendingParticipants = participants.filter(
        (p) =>
          p.status === "pending" || p.status === "0" || p.status === "waiting",
      ).length;

      // Get recent participants (last 5)
      const recent = participants.slice(0, 5);

      setStats({
        total: totalParticipants,
        active: activeParticipants,
        pending: pendingParticipants,
        events: participants.length > 0 ? 1 : 0,
      });

      setRecentParticipants(recent);
      setApiStatus("success");
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setApiStatus("error");

      // Fallback data untuk development
      if (process.env.NODE_ENV === "development") {
        setStats({
          total: 24,
          active: 16,
          pending: 8,
          events: 3,
        });

        setRecentParticipants([
          {
            id: 1,
            school_name: "SMAN 3 Cilegon",
            school_address: "Cilegon Mancak, Banten",
            coach: "Udin Coach",
            coach_whatsapp: "081278523645",
            status: "active",
            created_at: new Date().toISOString(),
            event: { name: "Event Paskibra SMAN 1 Cilegon" },
            participant_category: { name: "SMA" },
          },
          {
            id: 2,
            school_name: "SMAN 1 Jakarta",
            school_address: "Jakarta Pusat",
            coach: "Budi Santoso",
            coach_whatsapp: "081234567890",
            status: "pending",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            event: { name: "Event Paskibra Jawa Barat" },
            participant_category: { name: "SMA" },
          },
          {
            id: 3,
            school_name: "SMAN 5 Bandung",
            school_address: "Bandung, Jawa Barat",
            coach: "Ahmad Wijaya",
            coach_whatsapp: "081345678901",
            status: "active",
            created_at: new Date(Date.now() - 172800000).toISOString(),
            event: { name: "Event Paskibra Nasional" },
            participant_category: { name: "SMA" },
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const statItems = [
    {
      label: "Total Peserta",
      value: stats?.total || "0",
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20",
      change: "+12% dari bulan lalu",
      description: "Total sekolah yang terdaftar",
    },
    {
      label: "Peserta Aktif",
      value: stats?.active || "0",
      icon: Award,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-gradient-to-br from-green-500/20 to-emerald-500/20",
      change: "+8% dari bulan lalu",
      description: "Peserta yang sudah diverifikasi",
    },
    {
      label: "Menunggu Verifikasi",
      value: stats?.pending || "0",
      icon: AlertCircle,
      color: "from-yellow-500 to-amber-500",
      bgColor: "bg-gradient-to-br from-yellow-500/20 to-amber-500/20",
      change: "+3 dari kemarin",
      description: "Peserta dalam proses verifikasi",
    },
    {
      label: "Event Aktif",
      value: stats?.events || "0",
      icon: Calendar,
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-gradient-to-br from-purple-500/20 to-violet-500/20",
      change: "1 Event berjalan",
      description: "Event yang sedang berlangsung",
    },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "Tanggal tidak tersedia";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Tanggal tidak valid";
    }
  };

  const getStatusColor = (status) => {
    if (!status)
      return {
        bg: "bg-gray-500/20",
        text: "text-gray-400",
        label: "Tidak Diketahui",
      };

    const statusStr = String(status).toLowerCase().trim();

    if (
      statusStr.includes("active") ||
      statusStr === "1" ||
      statusStr === "approved"
    ) {
      return { bg: "bg-green-500/20", text: "text-green-400", label: "Aktif" };
    }
    if (
      statusStr.includes("pending") ||
      statusStr === "0" ||
      statusStr === "waiting"
    ) {
      return {
        bg: "bg-yellow-500/20",
        text: "text-yellow-400",
        label: "Menunggu",
      };
    }
    if (statusStr.includes("reject") || statusStr.includes("denied")) {
      return { bg: "bg-red-500/20", text: "text-red-400", label: "Ditolak" };
    }
    return {
      bg: "bg-gray-500/20",
      text: "text-gray-400",
      label: "Tidak Diketahui",
    };
  };

  const handleAddParticipant = () => {
    navigate("/organizer/participants/create");
  };

  const handleViewAllParticipants = () => {
    navigate("/organizer/participants");
  };

  const handleCreateEvent = () => {
    navigate("/organizer/events/create");
  };

  const handleGenerateReport = () => {
    navigate("/organizer/reports");
  };

  return (
    <div className="space-y-6">
      {/* API Status Indicator */}
      {apiStatus === "loading" && (
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-blue-400">Memuat data dashboard...</p>
          </div>
        </div>
      )}

      {apiStatus === "error" && (
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-yellow-400" />
            <div>
              <p className="text-yellow-400 font-medium">Data offline</p>
              <p className="text-yellow-300 text-sm">
                Menggunakan data contoh karena API tidak tersedia
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Selamat Datang, Organizer!
          </h1>
          <p className="text-gray-400">
            Kelola peserta dan event Paskibra Championship dengan mudah
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6 hover:border-blue-500/30 transition-colors group">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <span className="text-sm text-green-400 font-medium bg-green-500/10 px-3 py-1 rounded-full">
                {stat.change}
              </span>
            </div>
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-gray-300 font-medium mb-1">{stat.label}</p>
            <p className="text-gray-500 text-sm">{stat.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Participants */}
        <div className="lg:col-span-2 bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                  <Users size={20} />
                  Peserta Terbaru
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {apiStatus === "success"
                    ? `${recentParticipants.length} dari ${stats?.total || 0} peserta`
                    : "Data contoh - 3 dari 24 peserta"}
                </p>
              </div>
              <button
                onClick={handleViewAllParticipants}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium hover:underline">
                Lihat Semua →
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-700">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="text-gray-400 mt-2">Memuat data peserta...</p>
              </div>
            ) : recentParticipants.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Belum ada peserta yang terdaftar</p>
                <p className="text-sm text-gray-500 mb-4">
                  Mulai dengan menambahkan peserta pertama
                </p>
                <button
                  onClick={handleAddParticipant}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium">
                  Tambah Peserta Pertama
                </button>
              </div>
            ) : (
              recentParticipants.map((participant) => {
                const statusColor = getStatusColor(participant.status);
                return (
                  <div
                    key={participant.id}
                    className="p-6 hover:bg-gray-800/30 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 flex items-center justify-center flex-shrink-0">
                          <School size={24} className="text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <h3 className="font-semibold text-lg text-white truncate">
                              {participant.school_name ||
                                "Nama Sekolah Tidak Tersedia"}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                              {statusColor.label}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-400 mb-3">
                            <div className="flex items-center gap-2">
                              <MapPin size={14} />
                              <span className="truncate">
                                {participant.school_address ||
                                  "Alamat tidak tersedia"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone size={14} />
                              {participant.coach_whatsapp ||
                                participant.whatsapp ||
                                "No. tidak tersedia"}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={14} />
                              {formatDate(participant.created_at)}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {participant.event && (
                              <span className="text-xs px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                                {participant.event.name || "Event"}
                              </span>
                            )}
                            {participant.participant_category && (
                              <span className="text-xs px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
                                {participant.participant_category.name ||
                                  "Kategori"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-400 mb-1">Coach</p>
                          <p className="font-medium text-white">
                            {participant.coach || "Tidak diketahui"}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text} mb-1`}>
                            {statusColor.label}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            {statusColor.label === "Aktif" ? (
                              <>
                                <CheckCircle size={12} />
                                Terverifikasi
                              </>
                            ) : statusColor.label === "Menunggu" ? (
                              <>
                                <Clock size={12} />
                                Perlu verifikasi
                              </>
                            ) : (
                              <>
                                <AlertCircle size={12} />
                                {statusColor.label}
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          {/* Add Participant */}
          <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-2xl border border-blue-500/30 p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-lg text-white">
              <PlusCircle size={20} className="text-cyan-400" />
              Tambah Peserta Baru
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Daftarkan sekolah baru untuk mengikuti event Paskibra
            </p>
            <button
              onClick={handleAddParticipant}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium">
              Tambah Peserta
            </button>
          </div>

          {/* Create Event */}
          <div className="bg-gradient-to-br from-purple-900/30 to-violet-900/30 rounded-2xl border border-purple-500/30 p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-lg text-white">
              <Calendar size={20} className="text-violet-400" />
              Buat Event Baru
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Buat event baru untuk mengumpulkan peserta dari berbagai sekolah
            </p>
            <button
              onClick={handleCreateEvent}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 transition-all font-medium">
              Buat Event
            </button>
          </div>

          {/* Generate Report */}
          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-2xl border border-green-500/30 p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-lg text-white">
              <FileText size={20} className="text-emerald-400" />
              Generate Laporan
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Buat laporan peserta dan statistik event dalam format PDF
            </p>
            <button
              onClick={handleGenerateReport}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all font-medium">
              Buat Laporan
            </button>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors disabled:opacity-50 flex items-center gap-2">
          <TrendingUp size={16} className={loading ? "animate-spin" : ""} />
          <span>{loading ? "Memuat..." : "Refresh Data"}</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
