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
  Database,
  RefreshCw,
  ExternalLink,
  Save,
  Download,
  Upload,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const Events = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dataSource, setDataSource] = useState("localStorage");

  useEffect(() => {
    loadEventsFromStorage();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [searchTerm, statusFilter, events]);

  const loadEventsFromStorage = () => {
    setLoading(true);
    try {
      console.log("📂 Loading events from localStorage...");

      // Ambil data dari localStorage
      const storedEvents = localStorage.getItem("user_created_events");
      let eventsData = [];

      if (storedEvents) {
        eventsData = JSON.parse(storedEvents);
        console.log(`📋 Found ${eventsData.length} events in localStorage`);

        // Filter events berdasarkan user yang login (jika ada user info)
        if (user?.id) {
          const userEvents = eventsData.filter(
            (event) =>
              event.user_id == user.id ||
              event.user_id === user.id ||
              !event.user_id, // Jika tidak ada user_id, tetap tampilkan
          );

          if (userEvents.length > 0) {
            eventsData = userEvents;
            console.log(`👤 Filtered to ${userEvents.length} user events`);
          }
        }

        // Tambahkan participants_count (default 0) dan status
        const eventsWithDetails = eventsData.map((event) => {
          // Coba ambil jumlah peserta dari localStorage
          let participantsCount = 0;
          try {
            const participantsData = localStorage.getItem(
              `event_participants_${event.id}`,
            );
            if (participantsData) {
              const participants = JSON.parse(participantsData);
              participantsCount = Array.isArray(participants)
                ? participants.length
                : 0;
            }
          } catch (err) {
            console.error("Error loading participants count:", err);
          }

          return {
            ...event,
            participants_count: participantsCount,
            status: getEventStatus(event),
            from_storage: true,
            created_at: event.created_at || new Date().toISOString(),
          };
        });

        // Urutkan berdasarkan tanggal pembuatan (terbaru pertama)
        eventsData = eventsWithDetails.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });

        setEvents(eventsData);
        setFilteredEvents(eventsData);
        setDataSource("localStorage");

        if (eventsData.length === 0) {
          setError("Belum ada event yang dibuat. Buat event pertama Anda!");
        } else {
          setError("");
          console.log("✅ Events loaded from localStorage:", eventsData);
        }
      } else {
        // Jika tidak ada data di localStorage, gunakan data statis
        console.log("No events in localStorage, using static data");
        useStaticEvents();
        setDataSource("static");
        setError("Menggunakan data contoh. Buat event baru untuk mulai!");
      }
    } catch (error) {
      console.error("❌ Error loading events from localStorage:", error);
      setError("Gagal memuat daftar event dari penyimpanan lokal.");
      useStaticEvents();
      setDataSource("static");
    } finally {
      setLoading(false);
    }
  };

  const useStaticEvents = () => {
    // Data statis untuk event
    const staticEvents = [
      {
        id: 1,
        name: "Paskibra Championship 2024",
        organized_by: "Dinas Pendidikan Kota Cilegon",
        location: "Gedung Serba Guna, Cilegon",
        start_date: "2024-12-01",
        end_date: "2024-12-03",
        participants_count: 24,
        status: "ongoing",
        from_storage: false,
        created_at: "2024-10-01T00:00:00Z",
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
        from_storage: false,
        created_at: "2024-09-15T00:00:00Z",
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
        from_storage: false,
        created_at: "2024-08-01T00:00:00Z",
      },
    ];

    const eventsWithStatus = staticEvents.map((event) => ({
      ...event,
      status: getEventStatus(event),
    }));

    setEvents(eventsWithStatus);
    setFilteredEvents(eventsWithStatus);
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

  const formatDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Tanggal tidak valid";
    }
  };

  const handleDelete = (eventId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus event ini?")) return;

    try {
      // Hapus dari state
      const updatedEvents = events.filter((event) => event.id !== eventId);
      setEvents(updatedEvents);

      // Update localStorage
      const storedEvents = localStorage.getItem("user_created_events");
      if (storedEvents) {
        const parsedEvents = JSON.parse(storedEvents);
        const filteredEvents = parsedEvents.filter(
          (event) => event.id !== eventId,
        );
        localStorage.setItem(
          "user_created_events",
          JSON.stringify(filteredEvents),
        );

        // Hapus data peserta terkait
        localStorage.removeItem(`event_participants_${eventId}`);
        localStorage.removeItem(`event_image_${eventId}`);
      }

      alert("Event berhasil dihapus dari penyimpanan lokal.");
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Gagal menghapus event. Silakan coba lagi.");
    }
  };

  const handleExportData = () => {
    try {
      const dataToExport = {
        exported_at: new Date().toISOString(),
        total_events: events.length,
        events: events.map((event) => ({
          id: event.id,
          name: event.name,
          organized_by: event.organized_by,
          location: event.location,
          start_date: event.start_date,
          end_date: event.end_date,
          participants_count: event.participants_count,
          status: event.status,
          created_at: event.created_at,
          from_storage: event.from_storage,
        })),
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `events_backup_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert(`✅ ${events.length} event berhasil diekspor ke file JSON.`);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Gagal mengekspor data.");
    }
  };

  const handleImportData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target.result);

          if (!importedData.events || !Array.isArray(importedData.events)) {
            throw new Error("Format file tidak valid");
          }

          // Gabungkan dengan data yang ada
          const existingEvents = JSON.parse(
            localStorage.getItem("user_created_events") || "[]",
          );
          const newEvents = [...existingEvents, ...importedData.events];

          // Hapus duplikat berdasarkan ID
          const uniqueEvents = Array.from(
            new Map(newEvents.map((event) => [event.id, event])).values(),
          );

          localStorage.setItem(
            "user_created_events",
            JSON.stringify(uniqueEvents),
          );
          alert(
            `✅ ${importedData.events.length} event berhasil diimpor. Total sekarang: ${uniqueEvents.length}`,
          );

          // Refresh data
          loadEventsFromStorage();
        } catch (error) {
          console.error("Error importing data:", error);
          alert("Gagal mengimpor data. Pastikan file format JSON yang valid.");
        }
      };
      reader.readAsText(file);
    };

    input.click();
  };

  const handleClearAllData = () => {
    if (
      !window.confirm(
        "PERINGATAN: Ini akan menghapus SEMUA data event dari penyimpanan lokal. Lanjutkan?",
      )
    )
      return;

    try {
      localStorage.removeItem("user_created_events");

      // Hapus semua data event terkait
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("event_")) {
          localStorage.removeItem(key);
        }
      });

      alert("Semua data event telah dihapus.");
      loadEventsFromStorage();
    } catch (error) {
      console.error("Error clearing data:", error);
      alert("Gagal menghapus data.");
    }
  };

  const handleRetry = () => {
    setError("");
    loadEventsFromStorage();
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
            {user && (
              <div className="mt-2 text-sm text-gray-500">
                Login sebagai:{" "}
                <span className="text-blue-400">{user.name}</span>
                {user.id && <span className="ml-2">(ID: {user.id})</span>}
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/organizer/events/create")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Buat Event Baru</span>
          </button>
        </div>
      </div>

      {/* Data Source Info & Tools */}
      <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Database className="text-blue-400" size={20} />
            <div>
              <p className="text-blue-400 font-medium">
                Sumber Data:{" "}
                {dataSource === "localStorage"
                  ? "Penyimpanan Lokal"
                  : "Data Statis"}
              </p>
              <p className="text-blue-300 text-sm mt-1">
                {events.length} event ditemukan •
                {events.filter((e) => e.from_storage).length} dari penyimpanan •
                {events.filter((e) => !e.from_storage).length} data contoh
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportData}
              className="px-4 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 transition-colors flex items-center gap-2 text-sm"
            >
              <Download size={16} />
              Ekspor
            </button>
            <button
              onClick={handleImportData}
              className="px-4 py-2 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-400 transition-colors flex items-center gap-2 text-sm"
            >
              <Upload size={16} />
              Impor
            </button>
            <button
              onClick={handleRetry}
              className="px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 transition-colors flex items-center gap-2 text-sm"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            {dataSource === "localStorage" && events.length > 0 && (
              <button
                onClick={handleClearAllData}
                className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 transition-colors flex items-center gap-2 text-sm"
              >
                <Trash2 size={16} />
                Hapus Semua
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error/Info Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <AlertCircle size={20} className="text-yellow-400 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-medium">Informasi</p>
                <p className="text-yellow-300 text-sm mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={handleRetry}
              className="px-4 py-2 text-sm rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 transition-colors"
            >
              Refresh Data
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
            <div className="flex items-center gap-2">
              {dataSource === "localStorage" ? (
                <Database size={14} className="text-green-400" />
              ) : (
                <AlertCircle size={14} className="text-yellow-400" />
              )}
              <span className="text-sm text-green-400 font-medium">
                +{events.filter((e) => e.from_storage).length} Baru
              </span>
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{events.length}</p>
          <p className="text-gray-300 font-medium mb-1">Total Event</p>
          <p className="text-gray-500 text-sm">
            {dataSource === "localStorage"
              ? "Dari penyimpanan lokal"
              : "Data statis"}
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
              <Calendar size={24} className="text-white" />
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
            <span className="text-sm text-green-400 font-medium">
              {events.reduce(
                (total, event) => total + (event.participants_count || 0),
                0,
              )}{" "}
              Peserta
            </span>
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
              className="px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="upcoming">Akan Datang</option>
              <option value="ongoing">Berlangsung</option>
              <option value="completed">Selesai</option>
            </select>
            <button
              className="px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors"
              onClick={() => filterEvents()}
            >
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
              <div className="flex items-center gap-2">
                <p className="text-gray-400 text-sm">
                  Menampilkan {filteredEvents.length} dari {events.length} event
                </p>
                {dataSource === "localStorage" && (
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                    Penyimpanan Lokal
                  </span>
                )}
              </div>
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
                    className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium"
                  >
                    Reset Filter
                  </button>
                </>
              ) : (
                <>
                  <p>Belum ada event yang dibuat</p>
                  <button
                    onClick={() => navigate("/organizer/events/create")}
                    className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium"
                  >
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
                  className="p-6 hover:bg-gray-800/30 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 flex items-center justify-center flex-shrink-0">
                        <Calendar size={24} className="text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                          <h3 className="font-medium text-lg">{event.name}</h3>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text} self-start`}
                            >
                              {statusColor.label}
                            </span>
                            {event.from_storage && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                                Lokal
                              </span>
                            )}
                          </div>
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
                          {event.created_at && (
                            <span className="flex items-center gap-1 text-xs">
                              Dibuat: {formatDateTime(event.created_at)}
                            </span>
                          )}
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
                        className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors flex items-center gap-2"
                      >
                        <Eye size={16} />
                        <span className="hidden sm:inline">Detail</span>
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/organizer/events/edit/${event.id}`)
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
                                `/organizer/events/${event.id}/participants`,
                              )
                            }
                            className="w-full text-left px-4 py-3 hover:bg-gray-800 text-sm text-gray-300 flex items-center gap-2"
                          >
                            <Users size={14} />
                            Lihat Peserta
                          </button>
                          {event.from_storage && (
                            <button
                              onClick={() => {
                                // Copy event data ke clipboard
                                const eventData = JSON.stringify(
                                  event,
                                  null,
                                  2,
                                );
                                navigator.clipboard.writeText(eventData);
                                alert("Data event disalin ke clipboard!");
                              }}
                              className="w-full text-left px-4 py-3 hover:bg-blue-500/20 text-sm text-blue-400 flex items-center gap-2"
                            >
                              <Save size={14} />
                              Salin Data
                            </button>
                          )}
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

      {/* Debug Info (Hanya untuk development) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
          <h4 className="font-bold mb-2 text-sm text-gray-400">Debug Info</h4>
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              <strong>Data Source:</strong> {dataSource}
            </p>
            <p>
              <strong>Total Events:</strong> {events.length}
            </p>
            <p>
              <strong>From Storage:</strong>{" "}
              {events.filter((e) => e.from_storage).length}
            </p>
            <p>
              <strong>From Static:</strong>{" "}
              {events.filter((e) => !e.from_storage).length}
            </p>
            <p>
              <strong>Search Term:</strong> "{searchTerm}"
            </p>
            <p>
              <strong>Status Filter:</strong> {statusFilter}
            </p>
            <p>
              <strong>User ID:</strong> {user?.id || "No user"}
            </p>
            <p>
              <strong>LocalStorage Size:</strong>{" "}
              {(
                JSON.stringify(
                  localStorage.getItem("user_created_events") || "",
                ).length / 1024
              ).toFixed(2)}{" "}
              KB
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
