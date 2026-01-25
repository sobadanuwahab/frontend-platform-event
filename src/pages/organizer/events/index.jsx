import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  Clock,
  AlertCircle,
  CheckCircle,
  Loader,
  ChevronRight,
  CalendarDays,
  ExternalLink,
} from "lucide-react";
import axios from "axios";

const Events = () => {
  const API_URL = "https://apipaskibra.my.id/api";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setApiToken(token);
      fetchEvents(token);
    } else {
      setError("Token tidak ditemukan. Silakan login kembali.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    filterEvents();
  }, [searchTerm, statusFilter, events]);

  const fetchEvents = async (token) => {
    setLoading(true);
    try {
      console.log("📡 Fetching events from:", `${API_URL}/events`);

      const response = await axios.get(`${API_URL}/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        timeout: 10000,
      });

      console.log("✅ Events API Response:", response.data);

      let eventsData = [];
      if (response.data.success) {
        if (response.data.data && Array.isArray(response.data.data)) {
          eventsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          eventsData = response.data;
        } else if (response.data && typeof response.data === "object") {
          // Jika data adalah object, konversi ke array
          eventsData = Object.values(response.data);
        }
        console.log(`📋 Found ${eventsData.length} events`);
      } else {
        throw new Error(response.data.message || "Failed to fetch events");
      }

      // Add status untuk filtering
      const eventsWithStatus = eventsData.map((event) => ({
        ...event,
        status: getEventStatus(event),
      }));

      setEvents(eventsWithStatus);
      setFilteredEvents(eventsWithStatus);
    } catch (error) {
      console.error("❌ Error fetching events:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Fallback untuk development
      if (process.env.NODE_ENV === "development") {
        const fallbackEvents = [
          {
            id: 1,
            name: "Paskibra Championship 2024",
            organized_by: "Dinas Pendidikan Kota Cilegon",
            location: "Gedung Serba Guna, Cilegon",
            start_date: "2024-12-01",
            end_date: "2024-12-03",
            participants_count: 24,
            status: "ongoing",
          },
          {
            id: 2,
            name: "Event Paskibra Jawa Barat",
            organized_by: "Pemprov Jawa Barat",
            location: "Bandung, Jawa Barat",
            start_date: "2024-11-15",
            end_date: "2024-11-17",
            participants_count: 18,
            status: "upcoming",
          },
          {
            id: 3,
            name: "Event Paskibra Nasional",
            organized_by: "Kemdikbud RI",
            location: "Jakarta",
            start_date: "2024-10-01",
            end_date: "2024-10-05",
            participants_count: 32,
            status: "completed",
          },
        ];
        setEvents(fallbackEvents);
        setFilteredEvents(fallbackEvents);
        setError("Menggunakan data contoh (Events API sedang dipersiapkan)");
      } else {
        setError("Gagal memuat daftar event. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getEventStatus = (event) => {
    if (!event.start_date || !event.end_date) return "unknown";

    const today = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);

    if (today < startDate) return "upcoming";
    if (today > endDate) return "completed";
    return "ongoing";
  };

  const filterEvents = () => {
    let filtered = [...events];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(term) ||
          event.organized_by.toLowerCase().includes(term) ||
          event.location.toLowerCase().includes(term),
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((event) => event.status === statusFilter);
    }

    setFilteredEvents(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return {
          bg: "bg-blue-500/20",
          text: "text-blue-400",
          label: "Akan Datang",
        };
      case "ongoing":
        return {
          bg: "bg-green-500/20",
          text: "text-green-400",
          label: "Berlangsung",
        };
      case "completed":
        return {
          bg: "bg-gray-500/20",
          text: "text-gray-400",
          label: "Selesai",
        };
      default:
        return {
          bg: "bg-gray-500/20",
          text: "text-gray-400",
          label: "Tidak Diketahui",
        };
    }
  };

  const formatDate = (dateString) => {
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

  const handleDelete = async (eventId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus event ini?")) return;

    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.delete(`${API_URL}/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // Remove event from state
        setEvents(events.filter((event) => event.id !== eventId));
        alert("Event berhasil dihapus");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Gagal menghapus event. Silakan coba lagi.");
    }
  };

  const handleRetry = () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setError("");
      fetchEvents(token);
    }
  };

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
            <h1 className="text-3xl font-bold mb-2">Manajemen Event</h1>
            <p className="text-gray-400">
              Kelola event Paskibra Championship yang Anda selenggarakan
            </p>
          </div>

          <button
            onClick={() => navigate("/organizer/events/create")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium flex items-center space-x-2">
            <Plus size={20} />
            <span>Buat Event Baru</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <AlertCircle size={20} className="text-yellow-400 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-medium">Perhatian</p>
                <p className="text-yellow-300 text-sm mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={handleRetry}
              className="px-4 py-2 text-sm rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 transition-colors">
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
              <Calendar size={24} className="text-white" />
            </div>
            <span className="text-sm text-green-400 font-medium">+2 Baru</span>
          </div>
          <p className="text-3xl font-bold mb-1">{events.length}</p>
          <p className="text-gray-300 font-medium mb-1">Total Event</p>
          <p className="text-gray-500 text-sm">Semua event yang dibuat</p>
        </div>

        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
              <CalendarDays size={24} className="text-white" />
            </div>
            <span className="text-sm text-green-400 font-medium">Aktif</span>
          </div>
          <p className="text-3xl font-bold mb-1">
            {events.filter((e) => e.status === "ongoing").length}
          </p>
          <p className="text-gray-300 font-medium mb-1">Event Berlangsung</p>
          <p className="text-gray-500 text-sm">Sedang berjalan</p>
        </div>

        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500">
              <Users size={24} className="text-white" />
            </div>
            <span className="text-sm text-green-400 font-medium">+12%</span>
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
      </div>

      {/* Filters & Search */}
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
              className="px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">Semua Status</option>
              <option value="upcoming">Akan Datang</option>
              <option value="ongoing">Berlangsung</option>
              <option value="completed">Selesai</option>
            </select>
            <button className="px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors">
              <Filter size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar size={20} />
                Daftar Event
              </h2>
              <p className="text-gray-400 text-sm">
                Menampilkan {filteredEvents.length} dari {events.length} event
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-700">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              {searchTerm || statusFilter !== "all" ? (
                <>
                  <p>Tidak ada event yang sesuai dengan filter</p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                    }}
                    className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium">
                    Reset Filter
                  </button>
                </>
              ) : (
                <>
                  <p>Belum ada event yang dibuat</p>
                  <button
                    onClick={() => navigate("/organizer/events/create")}
                    className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium">
                    Buat Event Pertama
                  </button>
                </>
              )}
            </div>
          ) : (
            filteredEvents.map((event) => {
              const statusColor = getStatusColor(event.status);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 hover:bg-gray-800/30 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 flex items-center justify-center flex-shrink-0">
                        <Calendar size={24} className="text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                          <h3 className="font-medium text-lg">{event.name}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text} self-start`}>
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
                        <p className="text-gray-300 text-sm">
                          Diselenggarakan oleh:{" "}
                          <span className="font-medium">
                            {event.organized_by}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() =>
                          navigate(`/organizer/events/${event.id}`)
                        }
                        className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors flex items-center gap-2">
                        <Eye size={16} />
                        <span className="hidden sm:inline">Detail</span>
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/organizer/events/edit/${event.id}`)
                        }
                        className="px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 transition-colors flex items-center gap-2">
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
                                `/organizer/events/${event.id}/participants`,
                              )
                            }
                            className="w-full text-left px-4 py-3 hover:bg-gray-800 text-sm text-gray-300 flex items-center gap-2">
                            <Users size={14} />
                            Lihat Peserta
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="w-full text-left px-4 py-3 hover:bg-red-500/20 text-sm text-red-400 flex items-center gap-2">
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

      {/* Debug Info (Hanya di development) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
          <h4 className="font-bold mb-2 text-sm text-gray-400">Debug Info</h4>
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              API Token:{" "}
              {apiToken ? `${apiToken.substring(0, 20)}...` : "No token"}
            </p>
            <p>Total Events: {events.length}</p>
            <p>Filtered Events: {filteredEvents.length}</p>
            <p>Search Term: "{searchTerm}"</p>
            <p>Status Filter: {statusFilter}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
