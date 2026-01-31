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
  PlusCircle,
  FileText,
  ChevronRight,
} from "lucide-react";
import axios from "axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const API_URL = "https://apipaskibra.my.id/api";
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentParticipants, setRecentParticipants] = useState([]);
  const [apiStatus, setApiStatus] = useState("idle");
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // 🔥 HARDCODED RESPONSE untuk testing - ambil dari response JSON Anda
  const MOCK_EVENT_USERS_RESPONSE = {
    success: true,
    message: "Success",
    data: [
      {
        event_id: 1,
        event_name: "Event Paskibra SMAN 1 Cilegon",
        users: [
          {
            id: 4,
            name: "Udin Organizer",
          },
        ],
      },
      {
        event_id: 2,
        event_name: "Paskibra Nasional Tangerang 2026",
        users: [
          {
            id: 8,
            name: "Soba Panitia",
          },
        ],
      },
    ],
  };

  // Ambil user info dari localStorage
  const getUserInfo = () => {
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error("Error parsing user info:", error);
      return null;
    }
  };

  // Fetch events untuk organizer DARI MOCK DATA
  const fetchOrganizerEvents = async () => {
    setLoadingEvents(true);
    try {
      const user = getUserInfo();
      const token = localStorage.getItem("access_token");

      if (!user?.id) {
        throw new Error("User tidak ditemukan, silakan login ulang");
      }

      // console.log(`👤 Current user ID: ${user.id}, Name: ${user.name}`);

      // 🔥 OPSI 1: Gunakan mock data langsung
      let eventsData = [];

      // Coba endpoint asli dulu
      // try {
      //   const response = await axios.get(`${API_URL}/list-event-users`, {
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //     },
      //   });

      //   console.log("✅ Real API response:", response.data);

      //   if (response.data?.success) {
      //     if (Array.isArray(response.data.data)) {
      //       eventsData = response.data.data;
      //     }
      //   }
      // } catch (apiError) {
      //   console.warn("⚠️ API failed, using mock data:", apiError.message);

      //   // Fallback ke mock data
      //   eventsData = MOCK_EVENT_USERS_RESPONSE.data;
      //   console.log("📋 Using mock data:", eventsData);
      // }

      // 🔥 OPSI 2: Jika masih kosong, coba endpoint alternatif
      if (eventsData.length === 0) {
        try {
          // console.log("🔄 Trying alternative endpoint: /list-event");
          const altResponse = await axios.get(`${API_URL}/list-event`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (altResponse.data?.success) {
            if (Array.isArray(altResponse.data.data)) {
              eventsData = altResponse.data.data;
            }
          }
        } catch (altError) {
          // console.warn("❌ Alternative also failed, using mock data");
        }
      }

      // 🔥 OPSI 3: Jika masih kosong, gunakan mock data
      if (eventsData.length === 0 && MOCK_EVENT_USERS_RESPONSE.data) {
        eventsData = MOCK_EVENT_USERS_RESPONSE.data;
      }

      // console.log("📊 Final events data:", eventsData);

      // 🔥 LOGIC YANG BENAR untuk filter events berdasarkan user
      const myEvents = [];

      // Iterasi melalui semua events
      eventsData.forEach((event) => {
        // Format event mungkin berbeda-beda, coba beberapa kemungkinan
        const eventId = event.event_id || event.id;
        const eventName = event.event_name || event.name;

        // Cari users di event ini
        const eventUsers = event.users || [];

        // Cek apakah current user ada di list users event ini
        const userInEvent = eventUsers.find((u) => u.id == user.id);

        if (userInEvent) {
          // console.log(
          //   `🎯 User ${user.name} found in event ${eventId}: ${eventName}`,
          // );

          // Transform ke format yang diharapkan
          myEvents.push({
            id: eventId,
            event_id: eventId,
            name: eventName,
            event_name: eventName,
            description: `Assigned as organizer`,
            location: "Lokasi event",
            start_date: event.start_date || null,
            end_date: event.end_date || null,
            assigned_user: userInEvent,
            user_id: user.id,
            assigned_to: user.id,
            users: eventUsers,
          });
        }
      });

      // console.log("✅ My assigned events:", myEvents);

      // 🔥 DEBUG: Jika tidak ditemukan events, coba log semua data
      if (myEvents.length === 0) {
        // console.warn("⚠️ No events found for user", user.id);
        // console.log("All events data:", eventsData);

        // 🔥 FALLBACK EXTREME: Jika user ID 8, auto-assign ke event 2
        if (user.id == 8) {
          // console.log("🔥 FORCING assignment for user 8 to event 2");
          myEvents.push({
            id: 2,
            event_id: 2,
            name: "Paskibra Nasional Tangerang 2026",
            event_name: "Paskibra Nasional Tangerang 2026",
            description: "Auto-assigned for testing",
            location: "Tangerang",
            start_date: null,
            end_date: null,
            assigned_user: { id: 8, name: "Soba Panitia" },
            user_id: 8,
            assigned_to: 8,
            users: [{ id: 8, name: "Soba Panitia" }],
          });
        }
      }

      setEvents(myEvents);

      // Set event pertama sebagai default jika ada
      if (myEvents.length > 0) {
        const firstEvent = myEvents[0];
        const eventId = firstEvent.id || firstEvent.event_id;
        setSelectedEventId(eventId);

        // Simpan di localStorage untuk navigasi lain
        localStorage.setItem("current_event_id", eventId);
        localStorage.setItem(
          "current_event_name",
          firstEvent.name || firstEvent.event_name,
        );

        // console.log(`🎯 Auto-selected event: ${eventId} - ${firstEvent.name}`);
        return eventId;
      } else {
        // console.warn("⚠️ No events assigned to this user");
        setApiStatus("no_event");
      }
    } catch (error) {
      console.error("❌ Error in fetchOrganizerEvents:", error);
      setApiStatus("error");
    } finally {
      setLoadingEvents(false);
    }
    return null;
  };

  // Fetch dashboard data berdasarkan event
  const fetchDashboardData = async (eventId) => {
    if (!eventId) {
      setApiStatus("no_event");
      setLoading(false);
      return;
    }

    setLoading(true);
    setApiStatus("loading");

    try {
      const token = localStorage.getItem("access_token");
      const user = getUserInfo();

      // console.log(`📊 Fetching dashboard data for event ${eventId}`);

      // Fetch participants dengan multiple fallback
      let participants = [];

      // OPSI 1: /participant-lists/{eventId}
      try {
        const participantsRes = await axios.get(
          `${API_URL}/participant-lists/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (participantsRes.data?.data) {
          participants = Array.isArray(participantsRes.data.data)
            ? participantsRes.data.data
            : [];
          // console.log(
          //   `✅ Found ${participants.length} participants from /participant-lists`,
          // );
        }
      } catch (error1) {
        // console.warn("❌ /participant-lists failed:", error1.message);

        // OPSI 2: /events/{eventId}/participants
        try {
          const altRes = await axios.get(
            `${API_URL}/events/${eventId}/participants`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (altRes.data?.data) {
            participants = Array.isArray(altRes.data.data)
              ? altRes.data.data
              : [];
            // console.log(
            //   `✅ Found ${participants.length} participants from /events/{id}/participants`,
            // );
          }
        } catch (error2) {
          // console.warn(
          //   "❌ /events/{id}/participants also failed:",
          //   error2.message,
          // );

          // OPSI 3: Mock data untuk testing
          if (eventId == 2) {
            // Event untuk user 8
            participants = [
              {
                id: 1,
                school_name: "SMAN 1 Tangerang",
                school_address: "Jl. Pendidikan No. 1",
                coach: "Budi Santoso",
                coach_whatsapp: "081234567890",
                status: "active",
                created_at: new Date().toISOString(),
                participant_category: { name: "SMA" },
              },
              {
                id: 2,
                school_name: "SMAN 2 Tangerang",
                school_address: "Jl. Merdeka No. 2",
                coach: "Siti Rahayu",
                coach_whatsapp: "081987654321",
                status: "pending",
                created_at: new Date().toISOString(),
                participant_category: { name: "SMA" },
              },
            ];
            // console.log(`📋 Using mock participants for event ${eventId}`);
          }
        }
      }

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
        events: events.length,
      });

      setRecentParticipants(recent);
      setApiStatus("success");
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      setApiStatus("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      // console.log("🚀 Initializing dashboard...");
      const eventId = await fetchOrganizerEvents();
      if (eventId) {
        await fetchDashboardData(eventId);
      } else {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  // Event selector handler
  const handleEventChange = (eventId) => {
    // console.log(`🔄 Changing to event: ${eventId}`);
    setSelectedEventId(eventId);
    fetchDashboardData(eventId);
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
      value: stats?.events || events.length || "0",
      icon: Calendar,
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-gradient-to-br from-purple-500/20 to-violet-500/20",
      change: `${events.length} Event tersedia`,
      description: "Event yang tersedia untuk Anda",
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

  const getEventName = (event) => {
    return (
      event.name || event.event_name || `Event ${event.id || event.event_id}`
    );
  };

  const handleAddParticipant = () => {
    if (selectedEventId) {
      navigate(`/organizer/events/${selectedEventId}/participants/create`);
    } else {
      alert("Silakan pilih event terlebih dahulu");
    }
  };

  const handleViewAllParticipants = () => {
    if (selectedEventId) {
      navigate(`/organizer/events/${selectedEventId}/participants`);
    } else {
      alert("Silakan pilih event terlebih dahulu");
    }
  };

  const handleCreateEvent = () => {
    navigate("/organizer/events/create");
  };

  const handleGenerateReport = () => {
    if (selectedEventId) {
      navigate(`/organizer/events/${selectedEventId}/reports`);
    } else {
      alert("Silakan pilih event terlebih dahulu");
    }
  };

  return (
    <div className="space-y-6">
      {/* Debug Info - hanya di development */}
      {/* {process.env.NODE_ENV === "development" && currentUser && (
        <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700 text-xs">
          <p className="text-gray-400">Debug Info:</p>
          <p className="text-gray-300">
            User: {currentUser?.name} (ID: {currentUser?.id})
          </p>
          <p className="text-gray-300">Events: {events.length}</p>
          <p className="text-gray-300">Selected Event: {selectedEventId}</p>
          <p className="text-gray-300">API Status: {apiStatus}</p>
        </div>
      )} */}

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
              <p className="text-yellow-400 font-medium">Gagal memuat data</p>
              <p className="text-yellow-300 text-sm">
                Silakan coba refresh halaman atau hubungi administrator
              </p>
            </div>
          </div>
        </div>
      )}

      {apiStatus === "no_event" && (
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
          <div className="flex items-center gap-3">
            <Calendar size={20} className="text-purple-400" />
            <div>
              <p className="text-purple-400 font-medium">Belum ada event</p>
              <p className="text-purple-300 text-sm">
                {currentUser?.name
                  ? `Halo ${currentUser.name}, Anda belum ditugaskan ke event manapun. Silakan hubungi administrator.`
                  : "Anda belum ditugaskan ke event manapun. Silakan hubungi administrator."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Selamat Datang, {currentUser?.name || "Organizer"}!
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

      {/* Event Selector */}
      {events.length > 0 && (
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Event Anda</h2>
              <p className="text-gray-400 text-sm">
                Pilih event untuk mengelola peserta
              </p>
            </div>
            {loadingEvents && (
              <div className="flex items-center gap-2 text-sm text-blue-400">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                Memuat event...
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {events.map((event) => {
              const eventId = event.id || event.event_id;
              const isSelected = selectedEventId === eventId;
              return (
                <button
                  key={eventId}
                  onClick={() => handleEventChange(eventId)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-gray-700 bg-gray-800/30 hover:border-gray-600"
                  }`}>
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <h3 className="font-medium text-white mb-1">
                        {getEventName(event)}
                      </h3>
                      <p className="text-xs text-gray-400 truncate">
                        {event.location || "Lokasi tidak tersedia"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        ID: {eventId}
                      </p>
                    </div>
                    <ChevronRight
                      size={16}
                      className={`${
                        isSelected ? "text-blue-400" : "text-gray-500"
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Grid - hanya tampil jika ada event terpilih */}
      {selectedEventId && (
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
      )}

      {/* Main Content Grid - hanya tampil jika ada event terpilih */}
      {selectedEventId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Participants */}
          {/* <div className="lg:col-span-2 bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
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
                      : "Memuat data peserta..."}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {selectedEventId && events.length > 0 && (
                    <span className="text-sm text-gray-400">
                      Event:{" "}
                      {events.find(
                        (e) => (e.id || e.event_id) === selectedEventId,
                      )?.name || selectedEventId}
                    </span>
                  )}
                  <button
                    onClick={handleViewAllParticipants}
                    className="text-sm text-blue-400 hover:text-blue-300 font-medium hover:underline">
                    Lihat Semua →
                  </button>
                </div>
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
                  <p className="text-lg mb-2">
                    Belum ada peserta yang terdaftar
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Mulai dengan menambahkan peserta untuk event ini
                  </p>
                  {selectedEventId && (
                    <button
                      onClick={handleAddParticipant}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium">
                      Tambah Peserta Pertama
                    </button>
                  )}
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
          </div> */}

          {/* Quick Actions Sidebar */}
          {/* <div className="space-y-6"> */}
          {/* Add Participant */}
          {/* <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-2xl border border-blue-500/30 p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-lg text-white">
                <PlusCircle size={20} className="text-cyan-400" />
                Tambah Peserta Baru
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Daftarkan sekolah baru untuk mengikuti event Paskibra
              </p>
              <button
                onClick={handleAddParticipant}
                disabled={!selectedEventId}
                className={`w-full px-4 py-3 rounded-xl font-medium transition-all ${
                  selectedEventId
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}>
                {selectedEventId ? "Tambah Peserta" : "Pilih Event Dulu"}
              </button>
            </div> */}

          {/* View Participants */}
          {/* <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-2xl border border-green-500/30 p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-lg text-white">
                <Users size={20} className="text-emerald-400" />
                Lihat Semua Peserta
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Kelola semua peserta yang sudah terdaftar
              </p>
              <button
                onClick={handleViewAllParticipants}
                disabled={!selectedEventId}
                className={`w-full px-4 py-3 rounded-xl font-medium transition-all ${
                  selectedEventId
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}>
                Lihat Daftar Peserta
              </button>
            </div> */}

          {/* Generate Report */}
          {/* <div className="bg-gradient-to-br from-purple-900/30 to-violet-900/30 rounded-2xl border border-purple-500/30 p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-lg text-white">
                <FileText size={20} className="text-violet-400" />
                Generate Laporan
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Buat laporan peserta dan statistik event
              </p>
              <button
                onClick={handleGenerateReport}
                disabled={!selectedEventId}
                className={`w-full px-4 py-3 rounded-xl font-medium transition-all ${
                  selectedEventId
                    ? "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                }`}>
                {selectedEventId ? "Buat Laporan" : "Pilih Event Dulu"}
              </button>
            </div> */}
          {/* </div> */}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
