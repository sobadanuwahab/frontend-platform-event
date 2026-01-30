import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Users,
  MapPin,
  AlertCircle,
  Loader,
  RefreshCw,
  Globe,
  Clock,
  Database,
  Bug,
} from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import api from "../../../../services/api";

const Events = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [debugInfo, setDebugInfo] = useState("");

  /* ================= LOAD EVENTS FROM API ================= */
  useEffect(() => {
    if (user) {
      loadEvents();
    } else {
      setEvents([]);
      setFilteredEvents([]);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    filterEvents();
  }, [searchTerm, statusFilter, events]);

  /* ================= GET STATUS COLOR ================= */
  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return {
          bg: "bg-blue-500/20",
          text: "text-blue-400",
          label: "Akan Datang",
          icon: <Clock size={12} className="text-blue-400" />,
        };
      case "ongoing":
        return {
          bg: "bg-green-500/20",
          text: "text-green-400",
          label: "Berlangsung",
          icon: <Globe size={12} className="text-green-400" />,
        };
      case "completed":
        return {
          bg: "bg-gray-500/20",
          text: "text-gray-400",
          label: "Selesai",
          icon: <Calendar size={12} className="text-gray-400" />,
        };
      default:
        return {
          bg: "bg-gray-500/20",
          text: "text-gray-400",
          label: "Tidak Diketahui",
          icon: <AlertCircle size={12} className="text-gray-400" />,
        };
    }
  };

  /* ================= FILTER EVENTS ================= */
  const filterEvents = () => {
    let filtered = [...events];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(term) ||
          (event.organized_by &&
            event.organized_by.toLowerCase().includes(term)) ||
          (event.location && event.location.toLowerCase().includes(term)),
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((event) => event.status === statusFilter);
    }

    setFilteredEvents(filtered);
  };

  /* ================= FORMAT DATE ================= */
  const formatDate = (dateString) => {
    try {
      if (!dateString) return "Tanggal tidak tersedia";
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

  const loadEvents = async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      // Mengambil semua event untuk admin (tidak hanya event milik user)
      const response = await api.get("/list-all-event");

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Gagal memuat event");
      }

      /**
       * NORMALIZE RESPONSE
       * Backend bisa return:
       * - data: { ... }        -> single event
       * - data: [ ... ]        -> list
       * - data: { data: [ ] } -> pagination
       */
      let rawEvents = response.data.data;

      if (!rawEvents) {
        rawEvents = [];
      } else if (Array.isArray(rawEvents)) {
        // already array
        rawEvents = rawEvents;
      } else if (Array.isArray(rawEvents.data)) {
        // pagination
        rawEvents = rawEvents.data;
      } else if (typeof rawEvents === "object") {
        // SINGLE EVENT → convert to array
        rawEvents = [rawEvents];
      } else {
        rawEvents = [];
      }

      // ================= FORMAT EVENTS =================
      const formattedEvents = rawEvents.map((event) => ({
        id: event.id,
        name: event.name,
        organized_by: event.organized_by,
        location: event.location,
        event_info: event.event_info || "",
        term_condition: event.term_condition || "",
        start_date: event.start_date,
        end_date: event.end_date,
        image_url: formatImageUrl(event.image),
        user_id: event.user_id,
        created_at: event.created_at,
        participants_count: event.participants_count || 0,
        status: getEventStatus(event),
      }));

      setEvents(formattedEvents);
      setFilteredEvents(formattedEvents);

      if (formattedEvents.length === 0) {
        setError(
          "Belum ada event yang dibuat. Silakan buat event pertama Anda.",
        );
      }
    } catch (err) {
      console.error("Load events failed:", err);

      if (err.response?.status === 401) {
        setError("Sesi berakhir. Silakan login kembali.");
        navigate("/auth/login");
      } else {
        setError(err.message || "Gagal memuat event");
      }

      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getEventStatus = (event) => {
    if (!event.start_date) return "unknown";

    const today = new Date();
    const start = new Date(event.start_date);
    const end = event.end_date ? new Date(event.end_date) : null;

    if (today < start) return "upcoming";
    if (end && today > end) return "completed";
    return "ongoing";
  };

  /* ================= DELETE EVENT ================= */
  const handleDelete = async (eventId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus event ini?")) return;

    try {
      await api.delete(`/delete-event/${eventId}`);
      loadEvents();
    } catch (err) {
      alert("Gagal menghapus event");
    }
  };

  const formatImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith("http")) return image;
    return `https://apipaskibra.my.id/storage/${image}`;
  };

  /* ================= RENDER EVENT IMAGE ================= */
  const renderEventImage = (event) => {
    if (!event.image_url) {
      return (
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 flex items-center justify-center">
          <Calendar size={20} className="text-blue-400" />
        </div>
      );
    }

    return (
      <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-700 relative">
        <img
          src={event.image_url}
          alt={event.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(event.name)}&background=1e40af&color=fff&size=64`;
          }}
        />
      </div>
    );
  };

  /* ================= RENDER LOADING ================= */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Memuat daftar event...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manajemen Event (Admin)</h1>
            <p className="text-gray-400">
              Kelola semua event Paskibra Championship di sistem
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={loadEvents}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => navigate("/admin/events/create")} // ✅ UBAH KE ADMIN
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium flex items-center gap-2"
            >
              <Plus size={20} />
              <span>Buat Event Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-yellow-400 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-medium">Informasi</p>
                <p className="text-yellow-300 text-sm mt-1">{error}</p>
              </div>
            </div>
            {error.includes("Belum ada event") && (
              <button
                onClick={() => navigate("/admin/events/create")} // ✅ UBAH KE ADMIN
                className="px-4 py-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 transition-colors text-sm"
              >
                Buat Event
              </button>
            )}
          </div>
        </div>
      )}

      {/* User Not Logged In */}
      {!user && (
        <div className="mb-6 p-6 rounded-xl bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle size={24} className="text-red-400" />
            <div>
              <h3 className="font-bold text-red-400">Anda Belum Login</h3>
              <p className="text-gray-300">
                Login diperlukan untuk mengakses dan mengelola event.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/auth/login")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium"
          >
            Login Sekarang
          </button>
        </div>
      )}

      {/* Stats - hanya jika user login dan ada event */}
      {user && events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Calendar size={24} className="text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{events.length}</p>
            <p className="text-gray-300 font-medium mb-1">Total Event</p>
            <p className="text-gray-500 text-sm">Semua event di sistem</p>
          </div>

          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                <Globe size={24} className="text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">
              {events.filter((e) => e.status === "ongoing").length}
            </p>
            <p className="text-gray-300 font-medium mb-1">Event Berlangsung</p>
            <p className="text-gray-500 text-sm">Sedang berjalan</p>
          </div>

          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500">
                <Users size={24} className="text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">
              {events.reduce(
                (total, event) => total + (event.participants_count || 0),
                0,
              )}
            </p>
            <p className="text-gray-300 font-medium mb-1">Total Peserta</p>
            <p className="text-gray-500 text-sm">Di semua event</p>
          </div>

          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <Clock size={24} className="text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">
              {events.filter((e) => e.status === "upcoming").length}
            </p>
            <p className="text-gray-300 font-medium mb-1">Event Akan Datang</p>
            <p className="text-gray-500 text-sm">Akan dilaksanakan</p>
          </div>
        </div>
      )}

      {/* Filters & Search - hanya jika ada event */}
      {user && events.length > 0 && (
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                size={20}
              />
              <input
                type="text"
                placeholder="Cari event berdasarkan nama, penyelenggara, atau lokasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="upcoming">Akan Datang</option>
                <option value="ongoing">Berlangsung</option>
                <option value="completed">Selesai</option>
              </select>
              <button
                onClick={() => filterEvents()}
                className="px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
              >
                <Filter size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Events List */}
      {user && (
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Calendar size={20} />
                  Daftar Semua Event
                </h2>
                <p className="text-gray-400 text-sm">
                  Menampilkan {filteredEvents.length} dari {events.length} event
                  di sistem
                </p>
              </div>
              {filteredEvents.length === 0 && events.length > 0 && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="px-4 py-2 text-sm rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-gray-700">
            {filteredEvents.length === 0 ? (
              <div className="p-8 text-center">
                {searchTerm || statusFilter !== "all" ? (
                  <>
                    <Calendar
                      size={48}
                      className="mx-auto mb-4 text-gray-500"
                    />
                    <p className="text-gray-400 mb-4">
                      Tidak ada event yang sesuai dengan filter
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium"
                    >
                      Reset Filter
                    </button>
                  </>
                ) : (
                  <>
                    <Calendar
                      size={48}
                      className="mx-auto mb-4 text-gray-500"
                    />
                    <p className="text-gray-400 mb-4">
                      Belum ada event yang dibuat
                    </p>
                    <button
                      onClick={() => navigate("/admin/events/create")} // ✅ UBAH KE ADMIN
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium"
                    >
                      Buat Event Pertama
                    </button>
                  </>
                )}
              </div>
            ) : (
              filteredEvents.map((event) => {
                const statusColor =
                  event.status_color || getStatusColor(event.status);

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 hover:bg-gray-800/30 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Gambar Event */}
                        {renderEventImage(event)}

                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                            <h3 className="font-medium text-lg">
                              {event.name}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text} self-start flex items-center gap-1`}
                            >
                              {statusColor.icon}
                              {statusColor.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-3">
                            <span className="flex items-center gap-1">
                              <MapPin size={14} />
                              {event.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {formatDate(event.start_date)} -{" "}
                              {formatDate(event.end_date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={14} />
                              {event.participants_count || 0} Peserta
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm mb-1">
                            Diselenggarakan oleh:{" "}
                            <span className="font-medium">
                              {event.organized_by}
                            </span>
                          </p>
                          {event.event_info && (
                            <p className="text-gray-400 text-sm line-clamp-2">
                              {event.event_info.substring(0, 150)}
                              {event.event_info.length > 150 ? "..." : ""}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/admin/events/${event.id}`)}
                          className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors flex items-center gap-2"
                        >
                          <Eye size={16} />
                          <span className="hidden sm:inline">Detail</span>
                        </button>
                        <button
                          onClick={
                            () => navigate(`/admin/events/edit/${event.id}`) // ✅ UBAH KE ADMIN
                          }
                          className="px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 transition-colors flex items-center gap-2"
                        >
                          <Edit size={16} />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <div className="relative group">
                          <button className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors">
                            <MoreVertical size={20} />
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <button
                              onClick={() =>
                                navigate(
                                  `/admin/participants?event_id=${event.id}`,
                                )
                              }
                              className="w-full text-left px-4 py-3 hover:bg-gray-800 text-sm text-gray-300 flex items-center gap-2"
                            >
                              <Users size={14} />
                              Lihat Peserta
                            </button>
                            <button
                              onClick={() => handleDelete(event.id)}
                              className="w-full text-left px-4 py-3 hover:bg-red-500/20 text-sm text-red-400 flex items-center gap-2"
                            >
                              <Trash2 size={14} />
                              Hapus Event
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
