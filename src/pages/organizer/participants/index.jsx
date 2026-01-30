import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  School,
  Phone,
  Calendar,
  Award,
  User,
  ChevronLeft,
  ChevronRight,
  Loader,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Users,
  Shield,
} from "lucide-react";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

const ITEMS_PER_PAGE = 10;

const ParticipantsList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventId } = useParams(); // eventId dari URL parameter (opsional)
  const { user } = useAuth(); // Ambil data user yang login

  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [eventInfo, setEventInfo] = useState(null);
  const [userRole, setUserRole] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [deleteLoading, setDeleteLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [filterApplied, setFilterApplied] = useState(false);
  const [apiError, setApiError] = useState("");

  /* ================= CHECK USER ROLE ================= */
  useEffect(() => {
    if (user) {
      console.log("User logged in:", user);
      setUserRole(user.role || "user");
    }
  }, [user]);

  /* ================= CHECK QUERY PARAMS ================= */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const created = params.get("created");
    const participantName = params.get("name");

    if (created === "true" && participantName) {
      setSuccessMessage(`Peserta "${participantName}" berhasil ditambahkan!`);

      // Hapus query params dari URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);

      setTimeout(() => setSuccessMessage(""), 5000);
      fetchParticipants();
    }
  }, [location.search]);

  /* ================= FETCH EVENT INFO (jika ada eventId) ================= */
  const fetchEventInfo = useCallback(async () => {
    if (!eventId) return;

    try {
      const res = await api.get(`/events/${eventId}`);
      console.log("Event info response:", res.data);

      if (res.data?.success) {
        setEventInfo(res.data.data);
      }
    } catch (error) {
      console.error(
        "Error fetching event info:",
        error.response?.status,
        error.message,
      );
    }
  }, [eventId]);

  /* ================= FETCH CATEGORIES ================= */
  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/participant-categories");
      if (res.data?.success) {
        setCategories(res.data.data || []);
      }
    } catch (error) {
      console.warn("Gagal memuat kategori:", error.message);
      setCategories([]);
    }
  }, []);

  /* ================= FETCH PARTICIPANTS FOR JUDGE ================= */
  const fetchJudgeParticipants = useCallback(async () => {
    if (!user?.id) {
      setErrorMessage("User tidak ditemukan. Silakan login ulang.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setApiError("");
    setErrorMessage("");

    try {
      console.log(`Fetching participants for judge ID: ${user.id}`);

      // COBA BERBAGAI ENDPOINT UNTUK JUDGE
      let participantsData = [];

      const endpointsToTry = [
        `/judge/${user.id}/participants`,
        `/judges/${user.id}/participants`,
        `/participants/judge/${user.id}`,
        `/participants?judge_id=${user.id}`,
        `/user/${user.id}/participants`,
      ];

      for (const endpoint of endpointsToTry) {
        try {
          const res = await api.get(endpoint);
          if (res.data?.success) {
            // Format response
            if (Array.isArray(res.data.data)) {
              participantsData = res.data.data;
            } else if (res.data.data && Array.isArray(res.data.data.data)) {
              participantsData = res.data.data.data;
            } else if (res.data.data && typeof res.data.data === "object") {
              participantsData = Object.values(res.data.data);
            }
            break;
          }
        } catch (err) {
          console.log(`Endpoint ${endpoint} failed:`, err.response?.status);
        }
      }

      // Fallback: coba endpoint umum
      if (participantsData.length === 0) {
        try {
          const res = await api.get(`/participants`);
          if (res.data?.success) {
            const allParticipants = Array.isArray(res.data.data)
              ? res.data.data
              : [];
            participantsData = allParticipants.filter(
              (p) =>
                p.user_id == user.id ||
                p.created_by == user.id ||
                p.judge_id == user.id ||
                p.assigned_to == user.id,
            );
          }
        } catch (finalErr) {
          console.error("Final attempt failed:", finalErr);
          const mockParticipants = JSON.parse(
            localStorage.getItem(`dev_judge_participants_${user.id}`) || "[]",
          );
          participantsData = mockParticipants;
          if (mockParticipants.length > 0) {
            setApiError("⚠️ Menggunakan data lokal (development mode)");
          }
        }
      }

      console.log(`✅ Judge participants loaded: ${participantsData.length}`);

      // Apply filters
      participantsData = applyFilters(participantsData);

      // Sort and paginate
      participantsData.sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
      );
      setTotalPages(Math.ceil(participantsData.length / ITEMS_PER_PAGE));
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      setParticipants(participantsData.slice(start, start + ITEMS_PER_PAGE));
    } catch (error) {
      handleFetchError(error, "judge");
    } finally {
      setLoading(false);
    }
  }, [user, searchTerm, selectedCategory, currentPage, navigate]);

  /* ================= FETCH ALL PARTICIPANTS (tanpa event_id) ================= */
  const fetchAllParticipants = useCallback(async () => {
    setLoading(true);
    setApiError("");
    setErrorMessage("");

    try {
      console.log("Fetching ALL participants (no event_id)...");

      // COBA BERBAGAI ENDPOINT UNTUK SEMUA PESERTA
      let participantsData = [];

      const endpointsToTry = [
        `/participants`, // Endpoint semua peserta
        `/participant-lists`, // Alternatif 1
        `/all-participants`, // Alternatif 2
        `/participants/all`, // Alternatif 3
      ];

      for (const endpoint of endpointsToTry) {
        try {
          const res = await api.get(endpoint);
          if (res.data?.success) {
            console.log(`✅ Success using endpoint: ${endpoint}`);

            if (Array.isArray(res.data.data)) {
              participantsData = res.data.data;
            } else if (res.data.data && Array.isArray(res.data.data.data)) {
              participantsData = res.data.data.data;
            } else if (res.data.data && typeof res.data.data === "object") {
              participantsData = Object.values(res.data.data);
            }
            break;
          }
        } catch (err) {
          console.log(`Endpoint ${endpoint} failed:`, err.response?.status);
        }
      }

      // Fallback: jika semua endpoint gagal
      if (participantsData.length === 0) {
        // Untuk development, gunakan data mock
        const mockParticipants = JSON.parse(
          localStorage.getItem("dev_all_participants") || "[]",
        );
        participantsData = mockParticipants;

        if (mockParticipants.length > 0) {
          setApiError("⚠️ Menggunakan data lokal (development mode)");
        }
      }

      console.log(`✅ All participants loaded: ${participantsData.length}`);

      // Filter berdasarkan eventId jika ada
      if (eventId) {
        participantsData = participantsData.filter(
          (p) => p.event_id == eventId,
        );
        console.log(
          `✅ Filtered by event ${eventId}: ${participantsData.length} participants`,
        );
      }

      // Apply search and category filters
      participantsData = applyFilters(participantsData);

      // Sort and paginate
      participantsData.sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
      );
      setTotalPages(Math.ceil(participantsData.length / ITEMS_PER_PAGE));
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      setParticipants(participantsData.slice(start, start + ITEMS_PER_PAGE));
    } catch (error) {
      handleFetchError(error, "all");
    } finally {
      setLoading(false);
    }
  }, [eventId, searchTerm, selectedCategory, currentPage, navigate]);

  /* ================= HELPER FUNCTIONS ================= */
  const applyFilters = (data) => {
    let filteredData = [...data];

    // Filter berdasarkan search term
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filteredData = filteredData.filter(
        (p) =>
          p.school_name?.toLowerCase().includes(q) ||
          p.coach?.toLowerCase().includes(q) ||
          p.school_address?.toLowerCase().includes(q) ||
          p.coach_whatsapp?.includes(q),
      );
    }

    // Filter berdasarkan kategori
    if (selectedCategory) {
      filteredData = filteredData.filter(
        (p) => p.participant_category_id == selectedCategory,
      );
    }

    return filteredData;
  };

  const handleFetchError = (error, type) => {
    console.error(`Error fetching ${type} participants:`, error);

    let errorMsg = "Gagal memuat data peserta. ";

    if (error.response?.status === 403) {
      errorMsg += "Akses ditolak (403 Forbidden). ";
      errorMsg += "Silakan coba endpoint lain atau hubungi administrator.";
    } else if (error.response?.status === 404) {
      errorMsg += "Endpoint tidak ditemukan. ";
      if (type === "all") {
        errorMsg +=
          "Coba endpoint: /participants, /participant-lists, atau /all-participants";
      } else {
        errorMsg += "Coba endpoint yang berbeda.";
      }
    } else if (error.response?.status === 401) {
      errorMsg += "Sesi telah berakhir. Silakan login ulang.";
      navigate("/auth/login");
    } else {
      errorMsg += error.message || "Silakan coba lagi.";
    }

    setErrorMessage(errorMsg);
    setParticipants([]);
    setTotalPages(1);
  };

  /* ================= MAIN FETCH FUNCTION ================= */
  const fetchParticipants = useCallback(() => {
    if (userRole === "judge" || userRole === "juri") {
      console.log("Using judge fetch function");
      return fetchJudgeParticipants();
    } else {
      console.log("Using all participants fetch function");
      return fetchAllParticipants();
    }
  }, [userRole, fetchJudgeParticipants, fetchAllParticipants]);

  /* ================= LOAD ALL DATA ================= */
  useEffect(() => {
    console.log("Loading data...");
    console.log("User Role:", userRole);
    console.log("User ID:", user?.id);
    console.log("Event ID:", eventId);

    if (userRole === "judge" || userRole === "juri") {
      // Judge: fetch berdasarkan user.id
      fetchCategories();
      fetchParticipants();
    } else {
      // Admin/Organizer: fetch semua peserta
      if (eventId) {
        fetchEventInfo(); // Hanya fetch event info jika ada eventId
      }
      fetchCategories();
      fetchParticipants();
    }
  }, [
    eventId,
    userRole,
    user?.id,
    fetchEventInfo,
    fetchCategories,
    fetchParticipants,
  ]);

  /* ================= ACTIONS ================= */
  const handleSearch = () => {
    setCurrentPage(1);
    setFilterApplied(true);
    fetchParticipants();
  };

  const handleFilter = () => {
    setCurrentPage(1);
    setFilterApplied(true);
    fetchParticipants();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setCurrentPage(1);
    setFilterApplied(false);
    fetchParticipants();
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Yakin ingin menghapus peserta "${name}"?`)) return;

    setDeleteLoading(id);
    setErrorMessage("");
    try {
      const res = await api.delete(`/participants/${id}`);
      if (res.data?.success) {
        setSuccessMessage(`Peserta "${name}" berhasil dihapus`);
        setTimeout(() => setSuccessMessage(""), 3000);
        fetchParticipants();
      } else {
        setErrorMessage(res.data?.message || "Gagal menghapus peserta");
      }
    } catch (error) {
      setErrorMessage("Terjadi kesalahan saat menghapus peserta");
      console.error("Delete error:", error);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handlePrevPage = () =>
    currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);

  /* ================= UTILS ================= */
  const formatDate = (d) => {
    if (!d) return "-";
    try {
      return new Date(d).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const formatPhone = (p) =>
    p ? p.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3") : "-";

  /* ================= RENDER ================= */
  if (loading && !participants.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader size={48} className="text-blue-500" />
        </motion.div>
        <p className="text-gray-400 mt-3">
          {userRole === "judge" || userRole === "juri"
            ? "Memuat data peserta yang ditugaskan..."
            : eventId
              ? `Memuat data peserta untuk event ${eventId}...`
              : "Memuat semua data peserta..."}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="mb-8">
        {/* Event Info - hanya jika ada eventId */}
        {eventInfo && eventId && (
          <div className="mb-6 p-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Calendar size={20} className="text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {eventInfo.name}
                </h2>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                  <span>📍 {eventInfo.location}</span>
                  <span>
                    📅 {formatDate(eventInfo.start_date)} -{" "}
                    {formatDate(eventInfo.end_date)}
                  </span>
                  <span>👤 {eventInfo.organized_by}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Judge Info - khusus untuk judge */}
        {(userRole === "judge" || userRole === "juri") && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-800/20 to-purple-900/20 border border-purple-700/30 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Shield size={20} className="text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Dashboard Juri</h2>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                  <span>👨‍⚖️ {user?.name || user?.username || "Juri"}</span>
                  <span>📧 {user?.email || "-"}</span>
                  <span>👥 Peserta yang ditugaskan</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Error Warning */}
        {apiError && (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm">{apiError}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {userRole === "judge" || userRole === "juri"
                ? "Peserta yang Ditugaskan"
                : eventId
                  ? "Daftar Peserta Event"
                  : "Semua Peserta"}
            </h1>
            <p className="text-gray-400">
              {userRole === "judge" || userRole === "juri"
                ? `Peserta yang perlu dinilai oleh ${user?.name || "Anda"}`
                : eventInfo
                  ? `Peserta untuk: ${eventInfo.name}`
                  : eventId
                    ? `Event ID: ${eventId}`
                    : "Semua peserta dari semua event"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Tambah Peserta - hanya untuk admin/organizer */}
            {userRole !== "judge" && userRole !== "juri" && (
              <Link
                to={
                  eventId
                    ? `/organizer/participants/create?event_id=${eventId}`
                    : `/organizer/participants/create`
                }
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all"
              >
                <Plus size={20} />
                Tambah Peserta
              </Link>
            )}

            <button
              onClick={fetchParticipants}
              className="flex items-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-medium rounded-xl transition-all"
            >
              <Loader size={20} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Success & Error Messages */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-400 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-green-400 font-medium">Sukses!</p>
              <p className="text-green-300 text-sm mt-1">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage("")}
              className="p-1 hover:bg-green-500/20 rounded-lg transition-colors"
            >
              <XCircle size={16} className="text-green-400" />
            </button>
          </div>
        </motion.div>
      )}

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-400 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-red-400 font-medium">Error</p>
              <p className="text-red-300 text-sm mt-1">{errorMessage}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={fetchParticipants}
                  className="px-3 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                >
                  Coba Lagi
                </button>
                <button
                  onClick={() => {
                    // Coba endpoint yang berbeda
                    setErrorMessage("");
                    fetchParticipants();
                  }}
                  className="px-3 py-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                >
                  Coba Endpoint Lain
                </button>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage("")}
              className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
            >
              <XCircle size={16} className="text-red-400" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats Card */}
      {participants.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Peserta</p>
                <p className="text-2xl font-bold text-white">
                  {participants.length}
                </p>
              </div>
              <div
                className={`p-2 ${userRole === "judge" || userRole === "juri" ? "bg-purple-500/20" : "bg-blue-500/20"} rounded-lg`}
              >
                <Users
                  size={20}
                  className={
                    userRole === "judge" || userRole === "juri"
                      ? "text-purple-400"
                      : "text-blue-400"
                  }
                />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Sekolah Berbeda</p>
                <p className="text-2xl font-bold text-white">
                  {[...new Set(participants.map((p) => p.school_name))].length}
                </p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <School size={20} className="text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Kategori Aktif</p>
                <p className="text-2xl font-bold text-white">
                  {
                    [
                      ...new Set(
                        participants.map((p) => p.participant_category_id),
                      ),
                    ].length
                  }
                </p>
              </div>
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Award size={20} className="text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pelatih Terdaftar</p>
                <p className="text-2xl font-bold text-white">
                  {[...new Set(participants.map((p) => p.coach))].length}
                </p>
              </div>
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <User size={20} className="text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-gray-400" />
          <h2 className="text-lg font-medium text-gray-300">
            Filter & Pencarian
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cari Peserta
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Cari nama sekolah, pelatih, atau alamat..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filter Kategori
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all appearance-none"
              >
                <option value="">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end gap-2">
            <button
              onClick={handleFilter}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Terapkan Filter
            </button>
            {(searchTerm || selectedCategory || filterApplied) && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Participants Count & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-gray-400">
            Menampilkan{" "}
            <span className="text-white font-medium">
              {participants.length}
            </span>{" "}
            peserta
            {(searchTerm || selectedCategory) && " (setelah filter)"}
            {eventId && ` dari event ${eventId}`}
          </p>
          {participants.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              Peserta terbaru:{" "}
              <span className="text-gray-300">
                {participants[0]?.school_name || "-"}
              </span>
              <span className="ml-2 text-xs text-gray-500">
                ({formatDate(participants[0]?.created_at)})
              </span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {totalPages > 1 && (
            <p className="text-gray-400 hidden md:block">
              Halaman{" "}
              <span className="text-white font-medium">{currentPage}</span> dari{" "}
              <span className="text-white font-medium">{totalPages}</span>
            </p>
          )}
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader
              className="animate-spin text-blue-500 mx-auto mb-2"
              size={24}
            />
            <p className="text-gray-400">Memuat data...</p>
          </div>
        ) : participants.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="text-gray-500 mx-auto mb-3" size={48} />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              {searchTerm || selectedCategory
                ? "Tidak ada peserta yang sesuai"
                : "Belum ada peserta"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory
                ? "Tidak ada peserta yang sesuai dengan filter Anda"
                : userRole === "judge" || userRole === "juri"
                  ? "Belum ada peserta yang ditugaskan kepada Anda."
                  : eventId
                    ? "Belum ada peserta yang terdaftar untuk event ini."
                    : "Belum ada peserta yang terdaftar di sistem."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {userRole !== "judge" && userRole !== "juri" && (
                <Link
                  to={
                    eventId
                      ? `/organizer/participants/create?event_id=${eventId}`
                      : `/organizer/participants/create`
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus size={16} />
                  Tambah Peserta Pertama
                </Link>
              )}
              {eventId && (
                <Link
                  to="/organizer/participants"
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  Lihat Semua Peserta
                </Link>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900 border-b border-gray-800">
                    <th className="text-left p-4 text-gray-400 font-medium">
                      Sekolah
                    </th>
                    <th className="text-left p-4 text-gray-400 font-medium">
                      Kategori
                    </th>
                    <th className="text-left p-4 text-gray-400 font-medium">
                      Pelatih
                    </th>
                    <th className="text-left p-4 text-gray-400 font-medium">
                      WhatsApp
                    </th>
                    <th className="text-left p-4 text-gray-400 font-medium">
                      Tanggal
                    </th>
                    <th className="text-left p-4 text-gray-400 font-medium">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((participant) => (
                    <tr
                      key={participant.id}
                      className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors"
                    >
                      {/* School */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {participant.image ? (
                            <img
                              src={participant.image}
                              alt={participant.school_name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                              <School size={18} className="text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white">
                              {participant.school_name}
                            </p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {participant.school_address}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">
                          <Award size={12} />
                          {participant.participant_category?.name || "-"}
                        </span>
                      </td>

                      {/* Coach */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-500" />
                          <span className="text-gray-300">
                            {participant.coach}
                          </span>
                        </div>
                      </td>

                      {/* WhatsApp */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-gray-500" />
                          <span className="text-gray-300">
                            {formatPhone(participant.coach_whatsapp)}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-500" />
                          <span className="text-gray-300">
                            {formatDate(participant.created_at)}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const url = `/organizer/participants/${participant.id}${
                                userRole === "judge" || userRole === "juri"
                                  ? `?judge_id=${user?.id}`
                                  : eventId
                                    ? `?event_id=${eventId}`
                                    : ""
                              }`;
                              navigate(url);
                            }}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye size={18} />
                          </button>
                          {userRole !== "judge" && userRole !== "juri" && (
                            <>
                              <button
                                onClick={() =>
                                  navigate(
                                    `/organizer/participants/edit/${participant.id}${eventId ? `?event_id=${eventId}` : ""}`,
                                  )
                                }
                                className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  handleDelete(
                                    participant.id,
                                    participant.school_name,
                                  )
                                }
                                disabled={deleteLoading === participant.id}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                                title="Hapus"
                              >
                                {deleteLoading === participant.id ? (
                                  <Loader size={18} className="animate-spin" />
                                ) : (
                                  <Trash2 size={18} />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-800">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
                >
                  <ChevronLeft size={18} /> Sebelumnya
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) page = i + 1;
                    else if (currentPage <= 3) page = i + 1;
                    else if (currentPage >= totalPages - 2)
                      page = totalPages - 4 + i;
                    else page = currentPage - 2 + i;

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="text-gray-400">...</span>}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50"
                >
                  Selanjutnya <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ParticipantsList;
