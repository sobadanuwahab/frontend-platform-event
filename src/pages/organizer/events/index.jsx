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
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";

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
      loadEventsWithFallback();
    } else {
      setEvents([]);
      setFilteredEvents([]);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    filterEvents();
  }, [searchTerm, statusFilter, events]);

  const loadEventsWithFallback = async () => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setDebugInfo("");

    try {
      // console.log(`👤 Loading events for user ID: ${user.id} (${user.name})`);

      let allEvents = [];
      let debugMessages = [];

      // ========== STRATEGY 1: Coba endpoint utama ==========
      debugMessages.push(`🔍 Strategy 1: Trying /list-event-by-user`);

      try {
        const response = await api.get("/list-event-by-user");
        debugMessages.push(
          `✅ Response: ${response.status} - ${response.data?.message || "No message"}`,
        );

        const extractedEvents = extractEventsFromResponse(response.data);
        debugMessages.push(`📊 Extracted ${extractedEvents.length} events`);

        // Log detailed event info
        extractedEvents.forEach((event) => {
          debugMessages.push(
            `📋 Event ID: ${event.id}, Name: ${event.name || "No name"}, User ID: ${event.user_id || "No user_id"}`,
          );
        });

        if (extractedEvents.length > 0) {
          // FILTER LANGSUNG BERDASARKAN USER ID
          const userEvents = extractedEvents.filter(
            (event) => event.user_id == user.id || event.created_by == user.id,
          );

          if (userEvents.length > 0) {
            allEvents = [...userEvents];
            debugMessages.push(
              `🎯 Found ${userEvents.length} events for user ${user.id} from endpoint 1`,
            );
          }
        }
      } catch (error1) {
        debugMessages.push(`❌ Error: ${error1.message}`);
      }

      // ========== STRATEGY 2: Coba endpoint dengan user_id ==========
      if (allEvents.length === 0) {
        debugMessages.push(
          `\n🔍 Strategy 2: Trying /list-event-by-user?user_id=${user.id}`,
        );

        try {
          const response = await api.get(
            `/list-event-by-user?user_id=${user.id}`,
          );
          debugMessages.push(`✅ Response: ${response.status}`);

          const extractedEvents = extractEventsFromResponse(response.data);
          debugMessages.push(`📊 Extracted ${extractedEvents.length} events`);

          if (extractedEvents.length > 0) {
            allEvents = [...extractedEvents];
            debugMessages.push(
              `🎯 Added ${extractedEvents.length} events from endpoint 2`,
            );
          }
        } catch (error2) {
          debugMessages.push(`❌ Error: ${error2.message}`);
        }
      }

      // ========== STRATEGY 3: Coba endpoint alternative ==========
      if (allEvents.length === 0) {
        debugMessages.push(`\n🔍 Strategy 3: Trying alternative endpoints`);

        try {
          // Coba endpoint lain yang mungkin ada
          const endpointsToTry = [
            "/events",
            "/user-events",
            "/organizer-events",
            "/events/list",
          ];

          for (const endpoint of endpointsToTry) {
            try {
              const response = await api.get(endpoint);
              debugMessages.push(`🔄 Trying ${endpoint}: ${response.status}`);

              const extractedEvents = extractEventsFromResponse(response.data);
              const userEvents = extractedEvents.filter(
                (event) =>
                  event.user_id == user.id || event.created_by == user.id,
              );

              if (userEvents.length > 0) {
                allEvents = [...allEvents, ...userEvents];
                debugMessages.push(
                  `✅ Found ${userEvents.length} events from ${endpoint}`,
                );
                break; // Stop jika sudah menemukan event
              }
            } catch (err) {
              // Lanjut ke endpoint berikutnya
            }
          }
        } catch (error3) {
          debugMessages.push(`❌ Error: ${error3.message}`);
        }
      }

      // ========== STRATEGY 4: Coba simpan event dari localStorage jika ada ==========
      debugMessages.push(`\n🔍 Strategy 4: Checking localStorage for events`);

      try {
        const storedEvents = localStorage.getItem("user_created_events");
        if (storedEvents) {
          const parsedEvents = JSON.parse(storedEvents);
          const userEvents = parsedEvents.filter((e) => e.user_id == user.id);

          if (userEvents.length > 0) {
            debugMessages.push(
              `📂 Found ${userEvents.length} events in localStorage for user ${user.id}`,
            );

            // Add events that aren't already in the list
            userEvents.forEach((localEvent) => {
              const alreadyExists = allEvents.some(
                (e) => e.id == localEvent.id,
              );
              if (!alreadyExists) {
                allEvents.push({
                  ...localEvent,
                  _source: "localStorage",
                });
              }
            });

            debugMessages.push(
              `🎯 Added ${userEvents.length} events from localStorage`,
            );
          }
        }
      } catch (localStorageError) {
        debugMessages.push(
          `❌ localStorage error: ${localStorageError.message}`,
        );
      }

      // ========== FORMAT EVENTS ==========
      debugMessages.push(`\n🔍 Formatting events`);
      debugMessages.push(
        `📊 Total events before formatting: ${allEvents.length}`,
      );

      const formattedEvents = allEvents.map((event, index) => {
        // Helper functions
        const formatDateString = (dateString) => {
          if (!dateString) return null;
          if (dateString.includes("T")) return dateString.split("T")[0];
          return dateString;
        };

        const getEventStatus = (eventData) => {
          if (!eventData.start_date) return "unknown";

          try {
            const today = new Date();
            const startDate = new Date(eventData.start_date);
            const endDate = eventData.end_date
              ? new Date(eventData.end_date)
              : null;

            if (today < startDate) return "upcoming";
            if (endDate && today > endDate) return "completed";
            if (today >= startDate && (!endDate || today <= endDate))
              return "ongoing";
            return "unknown";
          } catch {
            return "unknown";
          }
        };

        const status = getEventStatus(event);
        const statusColor = getStatusColor(status);

        // Format image URL
        const getImageUrl = (url) => {
          if (!url) return null;
          if (url.startsWith("http")) return url;
          if (url.startsWith("/storage/"))
            return `https://apipaskibra.my.id${url}`;
          if (url.startsWith("storage/"))
            return `https://apipaskibra.my.id/${url}`;
          return `https://apipaskibra.my.id/storage/${url}`;
        };

        return {
          id: event.id || event.event_id || `event-${index}`,
          name:
            event.name || event.event_name || event.title || "Event tanpa nama",
          organized_by:
            event.organized_by ||
            event.organizer ||
            "Penyelenggara tidak diketahui",
          location:
            event.location ||
            event.event_location ||
            event.venue ||
            "Lokasi tidak diketahui",
          start_date: formatDateString(
            event.start_date || event.start_time || event.startDate,
          ),
          end_date: formatDateString(
            event.end_date || event.end_time || event.endDate,
          ),
          participants_count:
            event.participants_count || event.total_participants || 0,
          status: status,
          status_color: statusColor,
          created_at: event.created_at || event.created_date || event.createdAt,
          updated_at: event.updated_at || event.updated_date || event.updatedAt,
          image_url: getImageUrl(
            event.image_url || event.image || event.banner_image,
          ),
          event_info: event.event_info || event.description || event.info || "",
          term_condition: event.term_condition || event.terms || "",
          user_id: event.user_id || event.created_by || user.id,
          _source: event._source || "api",
        };
      });

      // Sort by creation date (newest first)
      const sortedEvents = formattedEvents.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB - dateA;
      });

      debugMessages.push(
        `\n✅ FINAL RESULT: ${sortedEvents.length} events to display`,
      );
      sortedEvents.forEach((event) => {
        debugMessages.push(
          `   • ID: ${event.id}, Name: "${event.name.substring(0, 30)}...", Source: ${event._source}`,
        );
      });

      // ========== UPDATE STATE ==========
      setEvents(sortedEvents);
      setFilteredEvents(sortedEvents);
      setDebugInfo(debugMessages.join("\n"));

      if (sortedEvents.length === 0) {
        setError(
          `Belum ada event yang dibuat untuk User ID: ${user.id}. Buat event pertama Anda!`,
        );
      } else {
        setError("");
      }
    } catch (error) {
      console.error("❌ Error loading events:", error);

      let errorMessage = "Gagal memuat daftar event";

      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
        } else if (error.response.status === 404) {
          errorMessage = "Endpoint tidak ditemukan.";
        } else if (error.response.data?.message) {
          errorMessage = `Error: ${error.response.data.message}`;
        }
      }

      setError(errorMessage);
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= EXTRACT EVENTS FROM RESPONSE ================= */
  const extractEventsFromResponse = (data) => {
    if (!data) return [];

    // Case 1: Direct array
    if (Array.isArray(data)) {
      return data;
    }

    // Case 2: { success: true, data: [...] }
    if (data.success && Array.isArray(data.data)) {
      return data.data;
    }

    // Case 3: { success: true, data: { ... } } single object
    if (
      data.success &&
      data.data &&
      typeof data.data === "object" &&
      data.data.id
    ) {
      return [data.data];
    }

    // Case 4: { data: [...] }
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }

    // Case 5: { data: { ... } } single object
    if (data.data && typeof data.data === "object" && data.data.id) {
      return [data.data];
    }

    // Case 6: Single event object
    if (data.id) {
      return [data];
    }

    return [];
  };

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

  /* ================= DELETE EVENT ================= */
  const handleDelete = async (eventId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus event ini?")) return;

    try {
      await api.delete(`/delete-event/${eventId}`);

      // Refresh events list
      loadEventsWithFallback();
      alert("Event berhasil dihapus.");
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Gagal menghapus event. Silakan coba lagi.");
    }
  };

  /* ================= TEST EVENT CREATION ================= */
  const testEventCreation = async () => {
    if (!user) return;

    try {
      // Coba create event test
      const testEventData = new FormData();
      testEventData.append("name", `Test Event ${Date.now()}`);
      testEventData.append("organized_by", "Test Organizer");
      testEventData.append("location", "Test Location");
      testEventData.append("start_date", "2024-12-31");
      testEventData.append("end_date", "2024-12-31");
      testEventData.append("event_info", "Test event info");
      testEventData.append("term_condition", "Test terms");
      testEventData.append("user_id", user.id.toString());

      const response = await api.post("/create-event", testEventData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // console.log("Test event creation response:", response.data);
      alert(
        `Test event created! Response: ${JSON.stringify(response.data, null, 2)}`,
      );

      // Refresh events
      loadEventsWithFallback();
    } catch (error) {
      console.error("Test event creation failed:", error);
      alert(`Test failed: ${error.message}`);
    }
  };

  /* ================= VIEW DEBUG INFO ================= */
  const viewDebugInfo = () => {
    if (debugInfo) {
      alert(`Debug Information:\n\n${debugInfo}`);
    } else {
      alert("No debug information available. Try refreshing first.");
    }
  };

  /* ================= RENDER EVENT IMAGE ================= */
  const renderEventImage = (event) => {
    if (!event.image_url) {
      return (
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 flex items-center justify-center">
          <Calendar size={20} className="text-blue-400" />
          {event._source === "localStorage" && (
            <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
              L
            </div>
          )}
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
        {/* {event._source === "localStorage" && (
          <div className="absolute top-1 left-1 bg-yellow-500 text-white text-xs px-1 rounded">
            Local
          </div>
        )} */}
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
          {user && (
            <p className="text-sm text-gray-500 mt-2">
              untuk {user.name} (ID: {user.id})
            </p>
          )}
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
              Kelola event Paskibra Championship Anda
            </p>
            {/* {user && (
              <div className="mt-2 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span>
                    Login sebagai:{" "}
                    <span className="text-blue-400">{user.name}</span>
                  </span>
                  <span className="text-gray-600">•</span>
                  <span>
                    ID: <span className="text-blue-400">{user.id}</span>
                  </span>
                  {events.length > 0 && (
                    <>
                      <span className="text-gray-600">•</span>
                      <span className="text-green-400">
                        {events.length} Event
                      </span>
                    </>
                  )}
                </div>
              </div>
            )} */}
          </div>

          <div className="flex flex-wrap gap-2">
            {/* <button
              onClick={viewDebugInfo}
              className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 transition-colors flex items-center gap-2 text-sm"
            >
              <Bug size={16} />
              Debug Info
            </button> */}
            {/* <button
              onClick={testEventCreation}
              className="px-4 py-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 transition-colors flex items-center gap-2 text-sm"
            >
              <Database size={16} />
              Test Create
            </button> */}
            <button
              onClick={loadEventsWithFallback}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => navigate("/organizer/events/create")}
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
                onClick={() => navigate("/organizer/events/create")}
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

      {/* Debug Info Panel */}
      {/* {events.length > 0 && (
        <div className="mb-4 p-4 rounded-xl bg-gray-900/50 border border-gray-700">
          <div className="text-xs font-mono text-gray-400 space-y-1">
            <p>
              <strong>User ID:</strong> {user?.id || "No user"}
            </p>
            <p>
              <strong>Total Events Found:</strong> {events.length}
            </p>
            <p>
              <strong>Event Sources:</strong>{" "}
              {events.filter((e) => e._source === "localStorage").length > 0
                ? `${events.filter((e) => e._source === "api").length} from API, ${events.filter((e) => e._source === "localStorage").length} from localStorage`
                : "All from API"}
            </p>
            <p>
              <strong>Event IDs:</strong> {events.map((e) => e.id).join(", ")}
            </p>
          </div>
        </div>
      )} */}

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
            <p className="text-gray-500 text-sm">Semua event Anda</p>
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
                  Daftar Event Anda
                </h2>
                <p className="text-gray-400 text-sm">
                  Menampilkan {filteredEvents.length} dari {events.length} event
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
                      onClick={() => navigate("/organizer/events/create")}
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
                            {/* {event._source === "localStorage" && (
                              <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded">
                                Local
                              </span>
                            )} */}
                            {/* <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                              ID: {event.id}
                            </span> */}
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
