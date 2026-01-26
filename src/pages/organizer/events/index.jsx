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
  Globe,
  Server,
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
  const [dataSource, setDataSource] = useState("all");
  const [apiLoading, setApiLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadAllEvents();
    } else {
      setEvents([]);
      setFilteredEvents([]);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    filterEvents();
  }, [searchTerm, statusFilter, dataSource, events]);

  /* ================= LOAD ALL EVENTS ================= */
  const loadAllEvents = async () => {
    if (!user) {
      setEvents([]);
      setFilteredEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log(`👤 Loading events for user: ${user.id} (${user.name})`);

      // 1. Load dari API terlebih dahulu (data utama)
      const apiEvents = await loadEventsFromAPI();
      console.log(`📊 Loaded ${apiEvents.length} events from API`);

      // 2. Load dari localStorage (data offline/unsynced)
      const localStorageEvents = loadEventsFromStorage();
      console.log(
        `📊 Loaded ${localStorageEvents.length} events from localStorage`,
      );

      // 3. Gabungkan data dengan prioritas API
      const allEvents = mergeEvents(apiEvents, localStorageEvents);

      // 4. Sort berdasarkan tanggal terbaru
      const sortedEvents = allEvents.sort((a, b) => {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });

      setEvents(sortedEvents);
      setFilteredEvents(sortedEvents);

      // 5. Update last sync time
      localStorage.setItem(`last_sync_${user.id}`, new Date().toISOString());

      if (sortedEvents.length === 0) {
        setError("Belum ada event yang dibuat. Buat event pertama Anda!");
      } else {
        setError("");
      }
    } catch (error) {
      console.error("❌ Error loading all events:", error);
      setError("Gagal memuat daftar event.");

      // Fallback ke localStorage
      const localStorageEvents = loadEventsFromStorage();
      setEvents(localStorageEvents);
      setFilteredEvents(localStorageEvents);

      if (localStorageEvents.length === 0) {
        setError("Belum ada event yang dibuat. Buat event pertama Anda!");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ================= MERGE EVENTS ================= */
  const mergeEvents = (apiEvents, localStorageEvents) => {
    const eventMap = new Map();

    // Pertama, tambahkan semua event dari API (prioritas utama)
    apiEvents.forEach((event) => {
      if (event.id) {
        eventMap.set(event.id.toString(), {
          ...event,
          source: "api",
          from_api: true,
        });
      }
    });

    // Kemudian, tambahkan event lokal yang tidak ada di API
    localStorageEvents.forEach((localEvent) => {
      if (!localEvent.id) return;

      const eventId = localEvent.id.toString();

      // Jangan timpa data API dengan data lokal
      if (!eventMap.has(eventId)) {
        eventMap.set(eventId, {
          ...localEvent,
          source: "localStorage",
          from_api: false,
        });
      }
    });

    return Array.from(eventMap.values());
  };

  /* ================= LOAD FROM LOCALSTORAGE ================= */
  const loadEventsFromStorage = () => {
    try {
      const storedEvents = localStorage.getItem("user_created_events");
      if (!storedEvents) return [];

      const eventsData = JSON.parse(storedEvents);
      console.log(`📂 Found ${eventsData.length} events in localStorage`);

      // Filter events berdasarkan user yang login
      const userEvents = eventsData.filter(
        (event) => event.user_id == user?.id || !event.user_id,
      );

      console.log(
        `👤 Filtered to ${userEvents.length} events for user ${user?.id}`,
      );

      return userEvents.map((event) => ({
        ...event,
        participants_count: getParticipantsCount(event.id),
        status: getEventStatus(event),
        source: event.from_api ? "api" : "localStorage",
        has_image: !!event.image_url,
      }));
    } catch (error) {
      console.error("❌ Error loading from localStorage:", error);
      return [];
    }
  };

  /* ================= GET PARTICIPANTS COUNT ================= */
  const getParticipantsCount = (eventId) => {
    try {
      const participantsData = localStorage.getItem(
        `event_participants_${eventId}`,
      );
      if (participantsData) {
        const participants = JSON.parse(participantsData);
        return Array.isArray(participants) ? participants.length : 0;
      }
    } catch (err) {
      console.error("Error loading participants count:", err);
    }
    return 0;
  };

  /* ================= LOAD FROM API ================= */
  const loadEventsFromAPI = async () => {
    setApiLoading(true);
    try {
      console.log("🌐 Loading events from API...");

      if (!user?.id) {
        console.log("No user logged in, skipping API call");
        return [];
      }

      // Coba endpoint utama - HARUS SESUAI DENGAN BACKEND ANDA
      console.log(`🔄 Calling /list-event-by-user?user_id=${user.id}`);
      const response = await api.get(`/list-event-by-user?user_id=${user.id}`);

      console.log("📡 API Response Status:", response.status);
      console.log("📡 API Response Data:", response.data);

      let apiEvents = [];

      // Handle berbagai format response dari backend
      if (response.data) {
        // Format 1: { success: true, data: [...] }
        if (
          response.data.success === true &&
          Array.isArray(response.data.data)
        ) {
          apiEvents = response.data.data;
          console.log("✅ Format 1: success=true with data array");
        }
        // Format 2: { success: true, data: { events: [...] } }
        else if (
          response.data.success === true &&
          response.data.data &&
          Array.isArray(response.data.data.events)
        ) {
          apiEvents = response.data.data.events;
          console.log("✅ Format 2: success=true with data.events array");
        }
        // Format 3: Array langsung
        else if (Array.isArray(response.data)) {
          apiEvents = response.data;
          console.log("✅ Format 3: Direct array response");
        }
        // Format 4: { data: [...] } tanpa success field
        else if (response.data.data && Array.isArray(response.data.data)) {
          apiEvents = response.data.data;
          console.log("✅ Format 4: data array without success field");
        }
        // Format 5: Single event object
        else if (response.data.id || response.data.event_id) {
          apiEvents = [response.data];
          console.log("✅ Format 5: Single event object");
        }
      }

      console.log(`📊 Total events found from API: ${apiEvents.length}`);

      // Format events dari API
      const formattedEvents = apiEvents.map((event) => {
        // Debug info
        console.log("📝 Processing API event:", {
          id: event.id || event.event_id,
          name: event.name || event.event_name,
          user_id: event.user_id,
          image_url: event.image_url || event.image,
        });

        return {
          id: event.id || event.event_id || `api-${Date.now()}`,
          name:
            event.name || event.event_name || event.title || "Event tanpa nama",
          organized_by:
            event.organized_by ||
            event.organizer ||
            event.organization ||
            "Penyelenggara tidak diketahui",
          location:
            event.location ||
            event.event_location ||
            event.venue ||
            event.place ||
            "Lokasi tidak diketahui",
          start_date:
            event.start_date ||
            event.start_time ||
            event.date_start ||
            event.startDate,
          end_date:
            event.end_date || event.end_time || event.date_end || event.endDate,
          participants_count:
            event.participants_count ||
            event.total_participants ||
            event.attendees_count ||
            event.registered ||
            0,
          status: getEventStatus(event),
          source: "api",
          created_at:
            event.created_at ||
            event.created_date ||
            event.createdAt ||
            new Date().toISOString(),
          updated_at: event.updated_at || event.updated_date || event.updatedAt,
          image_url:
            event.image_url ||
            event.image ||
            event.banner_image ||
            event.poster_url ||
            null,
          has_image: !!(
            event.image_url ||
            event.image ||
            event.banner_image ||
            event.poster_url
          ),
          description:
            event.description || event.event_info || event.info || "",
          event_info: event.event_info || event.description || "",
          term_condition:
            event.term_condition || event.terms || event.conditions || "",
          user_id:
            event.user_id || event.created_by || event.creator_id || user?.id,
          from_api: true,
          api_loaded_at: new Date().toISOString(),
          // Additional fields that might exist in API
          category: event.category || event.type,
          max_participants: event.max_participants || event.capacity,
          registration_deadline: event.registration_deadline,
          is_public: event.is_public !== undefined ? event.is_public : true,
          // Untuk debugging
          _raw_api_response: event,
        };
      });

      console.log(`✅ Formatted ${formattedEvents.length} events from API`);

      // Filter berdasarkan user_id jika perlu
      const userEvents = formattedEvents.filter((e) => {
        const matchesUser = e.user_id == user.id;
        if (!matchesUser) {
          console.log(
            `⚠️ Filtered out event ${e.id} - user_id: ${e.user_id}, current user: ${user.id}`,
          );
        }
        return matchesUser;
      });

      console.log(
        `👤 Filtered to ${userEvents.length} events for user ${user.id}`,
      );

      return userEvents;
    } catch (error) {
      console.error("❌ Error loading events from API:", error);
      console.error("Error details:", error.response?.data || error.message);

      // Coba endpoint alternatif jika endpoint utama gagal
      try {
        console.log("🔄 Trying alternative endpoint: /events/user/{user_id}");
        const altResponse = await api.get(`/events/user/${user.id}`);

        if (altResponse.data) {
          let altEvents = [];

          // Parse response format
          if (Array.isArray(altResponse.data)) {
            altEvents = altResponse.data;
          } else if (
            altResponse.data.data &&
            Array.isArray(altResponse.data.data)
          ) {
            altEvents = altResponse.data.data;
          } else if (
            altResponse.data.events &&
            Array.isArray(altResponse.data.events)
          ) {
            altEvents = altResponse.data.events;
          }

          if (altEvents.length > 0) {
            console.log(
              `✅ Found ${altEvents.length} events from alternative endpoint`,
            );
            return altEvents.map((event) => ({
              ...event,
              source: "api",
              from_api: true,
              has_image: !!(event.image_url || event.image),
              image_url: event.image_url || event.image || null,
            }));
          }
        }
      } catch (altError) {
        console.log("Alternative endpoint also failed:", altError.message);
      }

      // Return empty array jika API error - TIDAK ADA MOCK DATA
      return [];
    } finally {
      setApiLoading(false);
    }
  };

  /* ================= GET EVENT STATUS ================= */
  const getEventStatus = (event) => {
    if (!event.start_date) return "unknown";

    try {
      const today = new Date();
      const startDate = new Date(event.start_date);
      const endDate = event.end_date ? new Date(event.end_date) : null;

      if (today < startDate) return "upcoming";
      if (endDate && today > endDate) return "completed";
      if (today >= startDate && (!endDate || today <= endDate))
        return "ongoing";
      return "unknown";
    } catch {
      return "unknown";
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
          (event.location && event.location.toLowerCase().includes(term)) ||
          (event.description && event.description.toLowerCase().includes(term)),
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((event) => event.status === statusFilter);
    }

    // Filter by source
    if (dataSource !== "all") {
      filtered = filtered.filter((event) => event.source === dataSource);
    }

    setFilteredEvents(filtered);
  };

  /* ================= COLOR HELPERS ================= */
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

  const getSourceColor = (source) => {
    switch (source) {
      case "api":
        return {
          bg: "bg-purple-500/20",
          text: "text-purple-400",
          label: "API",
          icon: <Globe size={12} />,
        };
      case "localStorage":
        return {
          bg: "bg-green-500/20",
          text: "text-green-400",
          label: "Lokal",
          icon: <Database size={12} />,
        };
      default:
        return {
          bg: "bg-gray-500/20",
          text: "text-gray-400",
          label: "Unknown",
          icon: null,
        };
    }
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

  const formatDateTime = (dateString) => {
    try {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  /* ================= DELETE EVENT ================= */
  const handleDelete = async (eventId, source) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus event ini?")) return;

    try {
      if (source === "localStorage") {
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

          // Hapus data terkait
          localStorage.removeItem(`event_participants_${eventId}`);
          localStorage.removeItem(`event_image_${eventId}`);
        }

        alert("Event berhasil dihapus dari penyimpanan lokal.");
      } else if (source === "api") {
        // Coba hapus dari API
        try {
          await api.delete(`/delete-event/${eventId}`);
          alert("Event berhasil dihapus dari server.");
        } catch (apiError) {
          console.error("API delete error:", apiError);
          alert("Event dihapus secara lokal. Gagal menghapus dari server.");
        }

        // Hapus dari localStorage juga
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
        }
      }

      // Refresh data
      loadAllEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Gagal menghapus event. Silakan coba lagi.");
    }
  };

  /* ================= SYNC WITH API ================= */
  const handleSyncWithAPI = async () => {
    setApiLoading(true);
    try {
      await loadAllEvents();
      alert("✅ Data berhasil disinkronisasi.");
    } catch (error) {
      console.error("Error syncing with API:", error);
      alert("Gagal menyinkronisasi data dengan API.");
    } finally {
      setApiLoading(false);
    }
  };

  /* ================= FORCE SYNC USER DATA ================= */
  const handleForceUserSync = async () => {
    if (!user?.id) {
      alert("Anda harus login untuk sinkronisasi data");
      return;
    }

    setApiLoading(true);
    try {
      // Clear cache untuk user ini
      const storedEvents = localStorage.getItem("user_created_events");
      if (storedEvents) {
        const events = JSON.parse(storedEvents);
        // Simpan hanya event dari API (yang sudah sync)
        const apiEvents = events.filter((e) => e.from_api === true);
        localStorage.setItem("user_created_events", JSON.stringify(apiEvents));
      }

      // Load ulang dari API
      await loadAllEvents();

      alert(`✅ Data user ${user.name} berhasil disinkronisasi ulang.`);
    } catch (error) {
      console.error("Error force syncing:", error);
      alert("Gagal sinkronisasi ulang data.");
    } finally {
      setApiLoading(false);
    }
  };

  /* ================= LOADING STATE ================= */
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

  /* ================= RENDER EVENT IMAGE ================= */
  const renderEventImage = (event) => {
    if (!event.has_image || !event.image_url) {
      return (
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 flex items-center justify-center relative">
          <Calendar size={20} className="text-blue-400" />
          <div
            className={`absolute -top-1 -right-1 ${getSourceColor(event.source).bg} ${getSourceColor(event.source).text} w-4 h-4 rounded-full flex items-center justify-center text-[10px]`}
          >
            {event.source === "api" ? "A" : "L"}
          </div>
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
        <div
          className={`absolute top-1 left-1 ${getSourceColor(event.source).bg} ${getSourceColor(event.source).text} px-1.5 py-0.5 rounded text-xs`}
        >
          {event.source === "api" ? "API" : "Lokal"}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Manajemen Event</h1>
            <p className="text-gray-400">
              Kelola event Paskibra Championship dari API dan penyimpanan lokal
            </p>
            {user && (
              <div className="mt-2 text-sm text-gray-500">
                Login sebagai:{" "}
                <span className="text-blue-400">{user.name}</span>
                <span className="ml-2">(ID: {user.id})</span>
                <span className="ml-2 text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                  {events.filter((e) => e.source === "api").length} dari API
                </span>
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
                Sumber Data: {user ? `Untuk User ${user.name}` : "Belum Login"}
              </p>
              <p className="text-blue-300 text-sm mt-1">
                {events.length} event ditemukan •
                {events.filter((e) => e.source === "api").length} dari API •
                {events.filter((e) => e.source === "localStorage").length} dari
                lokal
              </p>
              {user && (
                <p className="text-xs text-gray-400 mt-1">
                  User ID: {user.id} • Last sync:{" "}
                  {localStorage.getItem(`last_sync_${user.id}`)
                    ? new Date(
                        localStorage.getItem(`last_sync_${user.id}`),
                      ).toLocaleTimeString("id-ID")
                    : "Belum pernah"}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                console.log("🔍 DEBUG: Current API response check");
                api
                  .get(`/list-event-by-user?user_id=${user?.id}`)
                  .then((response) => {
                    console.log("API Response Structure:", {
                      status: response.status,
                      data: response.data,
                      dataType: typeof response.data,
                      isArray: Array.isArray(response.data),
                      hasSuccess: response.data?.success,
                      dataFieldType: typeof response.data?.data,
                      dataIsArray: Array.isArray(response.data?.data),
                    });

                    if (response.data?.data) {
                      console.log(
                        "Data field keys:",
                        Object.keys(response.data.data),
                      );
                    }

                    alert(
                      `API Response:\n\nStatus: ${response.status}\n\nData: ${JSON.stringify(response.data, null, 2).substring(0, 1000)}...`,
                    );
                  })
                  .catch((error) => {
                    console.error("API Error:", error);
                    alert(
                      `Error: ${error.message}\n\nCheck console for details.`,
                    );
                  });
              }}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 transition-colors flex items-center gap-2 text-sm"
            >
              <Server size={16} />
              Debug API
            </button>
            <button
              onClick={handleSyncWithAPI}
              disabled={apiLoading || !user}
              className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {apiLoading ? (
                <Loader className="animate-spin h-4 w-4" />
              ) : (
                <RefreshCw size={16} />
              )}
              Sync API
            </button>
            <button
              onClick={handleForceUserSync}
              disabled={apiLoading || !user}
              className="px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Force Sync
            </button>
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
                {!user && (
                  <p className="text-red-300 text-sm mt-2">
                    Anda perlu login untuk melihat dan mengelola event.
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={loadAllEvents}
              disabled={!user}
              className="px-4 py-2 text-sm rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 transition-colors disabled:opacity-50"
            >
              Refresh Data
            </button>
          </div>
        </div>
      )}

      {/* User Not Logged In */}
      {!user && (
        <div className="mb-6 p-6 rounded-xl bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-red-400" />
            <div>
              <h3 className="font-bold text-red-400">Anda Belum Login</h3>
              <p className="text-gray-300 mt-1">
                Login diperlukan untuk mengakses dan mengelola event.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/auth/login")}
            className="mt-4 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium"
          >
            Login Sekarang
          </button>
        </div>
      )}

      {/* Stats - hanya ditampilkan jika user login dan ada event */}
      {user && events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <Calendar size={24} className="text-white" />
              </div>
              <span className="text-sm text-green-400 font-medium">
                {events.filter((e) => e.source === "api").length} API
              </span>
            </div>
            <p className="text-3xl font-bold mb-1">{events.length}</p>
            <p className="text-gray-300 font-medium mb-1">Total Event</p>
            <p className="text-gray-500 text-sm">Semua sumber data</p>
          </div>

          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                <Globe size={24} className="text-white" />
              </div>
              <span className="text-sm text-green-400 font-medium">Live</span>
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

          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <Database size={24} className="text-white" />
              </div>
              <span className="text-sm text-green-400 font-medium">
                {events.filter((e) => e.source === "localStorage").length} Lokal
              </span>
            </div>
            <p className="text-3xl font-bold mb-1">
              {events.filter((e) => e.has_image).length}
            </p>
            <p className="text-gray-300 font-medium mb-1">
              Event dengan Gambar
            </p>
            <p className="text-gray-500 text-sm">Ada gambar/foto</p>
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
                placeholder="Cari event berdasarkan nama, penyelenggara, lokasi, atau deskripsi..."
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
              <select
                value={dataSource}
                onChange={(e) => setDataSource(e.target.value)}
                className="px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Sumber</option>
                <option value="api">API</option>
                <option value="localStorage">Penyimpanan Lokal</option>
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
      )}

      {/* API Loading Indicator */}
      {apiLoading && (
        <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
          <Loader className="animate-spin h-5 w-5 text-purple-400 mr-2" />
          <span className="text-purple-400">Menyinkronisasi dengan API...</span>
        </div>
      )}

      {/* Events List */}
      {user ? (
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Calendar size={20} />
                  Daftar Event ({user.name})
                </h2>
                <div className="flex items-center gap-2">
                  <p className="text-gray-400 text-sm">
                    Menampilkan {filteredEvents.length} dari {events.length}{" "}
                    event
                  </p>
                  <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                    {events.filter((e) => e.source === "api").length} API
                  </span>
                  <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                    {events.filter((e) => e.source === "localStorage").length}{" "}
                    Lokal
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-700">
            {filteredEvents.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                {searchTerm ||
                statusFilter !== "all" ||
                dataSource !== "all" ? (
                  <>
                    <p>Tidak ada event yang sesuai dengan filter</p>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                        setDataSource("all");
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
                const sourceColor = getSourceColor(event.source);

                return (
                  <motion.div
                    key={`${event.source}-${event.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 hover:bg-gray-800/30 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        {/* Gambar Event */}
                        {renderEventImage(event)}

                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                            <h3 className="font-medium text-lg">
                              {event.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text} self-start`}
                              >
                                {statusColor.label}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${sourceColor.bg} ${sourceColor.text} flex items-center gap-1`}
                              >
                                {sourceColor.icon}
                                {sourceColor.label}
                              </span>
                              {event.has_image && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                                  📷
                                </span>
                              )}
                              {event.from_api && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                                  Synced
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
                          <p className="text-gray-300 text-sm mb-1">
                            Diselenggarakan oleh:{" "}
                            <span className="font-medium">
                              {event.organized_by}
                            </span>
                          </p>
                          {event.description && (
                            <p className="text-gray-400 text-sm line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() =>
                            navigate(`/organizer/events/${event.id}`, {
                              state: { source: event.source },
                            })
                          }
                          className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors flex items-center gap-2"
                        >
                          <Eye size={16} />
                          <span className="hidden sm:inline">Detail</span>
                        </button>
                        {(event.source === "localStorage" ||
                          (event.source === "api" &&
                            event.user_id == user?.id)) && (
                          <button
                            onClick={() =>
                              navigate(`/organizer/events/edit/${event.id}`)
                            }
                            className="px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 transition-colors flex items-center gap-2"
                          >
                            <Edit size={16} />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                        )}
                        <div className="relative group">
                          <button className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors">
                            <MoreVertical size={20} />
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <button
                              onClick={() =>
                                navigate(
                                  `/organizer/events/${event.id}/participants`,
                                  { state: { source: event.source } },
                                )
                              }
                              className="w-full text-left px-4 py-3 hover:bg-gray-800 text-sm text-gray-300 flex items-center gap-2"
                            >
                              <Users size={14} />
                              Lihat Peserta
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(event.id, event.source)
                              }
                              className={`w-full text-left px-4 py-3 hover:bg-red-500/20 text-sm ${
                                event.source === "localStorage" ||
                                (event.source === "api" &&
                                  event.user_id == user?.id)
                                  ? "text-red-400"
                                  : "text-gray-500"
                              } flex items-center gap-2`}
                              disabled={
                                event.source === "api" &&
                                event.user_id != user?.id
                              }
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
      ) : null}

      {/* Debug Info - Development Only */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
          <h4 className="font-bold mb-2 text-sm text-gray-400">Debug Info</h4>
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              <strong>User ID:</strong> {user?.id || "No user"}
            </p>
            <p>
              <strong>User Name:</strong> {user?.name || "No user"}
            </p>
            <p>
              <strong>Total Events:</strong> {events.length}
            </p>
            <p>
              <strong>From API:</strong>{" "}
              {events.filter((e) => e.source === "api").length}
            </p>
            <p>
              <strong>From LocalStorage:</strong>{" "}
              {events.filter((e) => e.source === "localStorage").length}
            </p>
            <p>
              <strong>API Loading:</strong> {apiLoading ? "Yes" : "No"}
            </p>
            <p>
              <strong>Last Sync:</strong>{" "}
              {localStorage.getItem(`last_sync_${user?.id}`) || "Never"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
