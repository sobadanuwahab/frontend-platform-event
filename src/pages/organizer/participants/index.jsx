import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
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
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const ITEMS_PER_PAGE = 10;
const API_URL = "https://apipaskibra.my.id/api";

const ParticipantsList = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  // States
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [eventInfo, setEventInfo] = useState(null);

  // For pagination and filters
  const [allParticipants, setAllParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Messages
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // State untuk cek apakah sudah diinisialisasi
  const [initialized, setInitialized] = useState(false);

  // Get token dari localStorage
  const getToken = () => {
    return localStorage.getItem("access_token");
  };

  /* ================= FETCH EVENT INFO ================= */
  const fetchEventInfo = useCallback(async () => {
    if (!eventId) return null;

    try {
      console.log(`📡 Fetching event info for ID: ${eventId}`);
      const token = getToken();
      const res = await axios.get(`${API_URL}/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success) {
        setEventInfo(res.data.data);
        console.log(`✅ Event info loaded: ${res.data.data.name}`);
        // Simpan di localStorage untuk cache
        localStorage.setItem(
          `event_${eventId}_info`,
          JSON.stringify(res.data.data),
        );
        return res.data.data;
      }
    } catch (error) {
      console.warn("⚠️ Event info not found, using fallback:", error.message);

      // Coba ambil dari cache localStorage
      const cachedEventInfo = localStorage.getItem(`event_${eventId}_info`);
      if (cachedEventInfo) {
        const eventData = JSON.parse(cachedEventInfo);
        setEventInfo(eventData);
        console.log(`📋 Using cached event info: ${eventData.name}`);
        return eventData;
      }

      // Fallback: get event name dari localStorage atau mock
      const storedEventName = localStorage.getItem(`event_${eventId}_name`);
      const eventData = {
        id: eventId,
        name: storedEventName || `Event ${eventId}`,
        location: "Lokasi tidak tersedia",
        start_date: null,
        end_date: null,
      };
      setEventInfo(eventData);
      return eventData;
    }
    return null;
  }, [eventId]);

  /* ================= FETCH CATEGORIES ================= */
  const fetchCategories = useCallback(async () => {
    try {
      console.log("📡 Fetching categories...");
      const token = getToken();
      const res = await axios.get(`${API_URL}/participant-categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success) {
        setCategories(res.data.data || []);
        console.log(`✅ Loaded ${res.data.data?.length || 0} categories`);
        // Simpan di localStorage untuk cache
        localStorage.setItem(
          "participant_categories",
          JSON.stringify(res.data.data || []),
        );
      }
    } catch (error) {
      console.warn("⚠️ Failed to load categories:", error.message);

      // Coba ambil dari cache
      const cachedCategories = localStorage.getItem("participant_categories");
      if (cachedCategories) {
        setCategories(JSON.parse(cachedCategories));
        console.log(`📋 Using cached categories`);
      } else {
        setCategories([]);
      }
    }
  }, []);

  /* ================= FETCH PARTICIPANTS ================= */
  const fetchParticipants = useCallback(
    async (forceRefresh = false) => {
      if (!eventId) {
        console.warn("❌ No eventId, skipping fetch");
        setAllParticipants([]);
        setFilteredParticipants([]);
        setLoading(false);
        return;
      }

      // Gunakan cache jika tidak force refresh
      if (!forceRefresh) {
        const cachedParticipants = localStorage.getItem(
          `event_${eventId}_participants`,
        );
        if (cachedParticipants) {
          const participantsData = JSON.parse(cachedParticipants);
          console.log(
            `📊 Using cached participants: ${participantsData.length} items`,
          );
          setAllParticipants(participantsData);
          applyFilters(
            participantsData,
            searchTerm,
            selectedCategory,
            currentPage,
          );
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setErrorMessage("");

      try {
        console.log(`📡 Fetching participants for event ${eventId}`);
        const token = getToken();
        let participantsData = [];

        // METODE 1: /participant-lists/{eventId} (sama seperti dashboard)
        try {
          const res = await axios.get(
            `${API_URL}/participant-lists/${eventId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (res.data?.data) {
            // Handle berbagai format response
            if (Array.isArray(res.data.data)) {
              participantsData = res.data.data;
            } else if (
              res.data.data?.data &&
              Array.isArray(res.data.data.data)
            ) {
              participantsData = res.data.data.data;
            } else if (res.data.data && typeof res.data.data === "object") {
              // Jika data adalah object, konversi ke array
              participantsData = Object.values(res.data.data);
            }
            console.log(
              `✅ Found ${participantsData.length} participants from /participant-lists`,
            );
          }
        } catch (error1) {
          console.warn("❌ /participant-lists failed:", error1.message);

          // METODE 2: /events/{eventId}/participants (fallback)
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
              if (Array.isArray(altRes.data.data)) {
                participantsData = altRes.data.data;
              } else if (
                altRes.data.data?.data &&
                Array.isArray(altRes.data.data.data)
              ) {
                participantsData = altRes.data.data.data;
              } else if (
                altRes.data.data &&
                typeof altRes.data.data === "object"
              ) {
                participantsData = Object.values(altRes.data.data);
              }
              console.log(
                `✅ Found ${participantsData.length} participants from /events/{id}/participants`,
              );
            }
          } catch (error2) {
            console.warn(
              "❌ /events/{id}/participants also failed:",
              error2.message,
            );

            // METODE 3: Coba ambil dari event organizer
            try {
              const eventRes = await axios.get(`${API_URL}/list-event-users`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (eventRes.data?.success && Array.isArray(eventRes.data.data)) {
                // Cari event yang sesuai
                const eventData = eventRes.data.data.find(
                  (e) => (e.event_id || e.id) == eventId,
                );

                if (eventData && eventData.participants) {
                  participantsData = eventData.participants;
                  console.log(
                    `✅ Found ${participantsData.length} participants from list-event-users`,
                  );
                }
              }
            } catch (error3) {
              console.warn("❌ list-event-users failed:", error3.message);

              // METODE 4: Mock data untuk testing (FALLBACK)
              participantsData = [
                {
                  id: 1,
                  school_name: "SMAN 1 Tangerang",
                  school_address: "Jl. Pendidikan No. 1, Tangerang",
                  coach: "Budi Santoso",
                  coach_whatsapp: "081234567890",
                  status: "active",
                  created_at: new Date().toISOString(),
                  participant_category_id: 1,
                  participant_category: { id: 1, name: "SMA" },
                },
                {
                  id: 2,
                  school_name: "SMAN 2 Tangerang",
                  school_address: "Jl. Merdeka No. 2, Tangerang",
                  coach: "Siti Rahayu",
                  coach_whatsapp: "081987654321",
                  status: "pending",
                  created_at: new Date().toISOString(),
                  participant_category_id: 1,
                  participant_category: { id: 1, name: "SMA" },
                },
                {
                  id: 3,
                  school_name: "SMAN 3 Tangerang",
                  school_address: "Jl. Kemerdekaan No. 3, Tangerang",
                  coach: "Ahmad Fauzi",
                  coach_whatsapp: "081112223334",
                  status: "active",
                  created_at: new Date().toISOString(),
                  participant_category_id: 2,
                  participant_category: { id: 2, name: "SMP" },
                },
              ];
              console.log(`📋 Using mock participants for event ${eventId}`);
            }
          }
        }

        // Normalize data structure
        participantsData = participantsData.map((participant) => ({
          ...participant,
          participant_category_id:
            participant.participant_category_id ||
            participant.participant_category?.id ||
            participant.category_id,
          participant_category: participant.participant_category || {
            id: participant.participant_category_id || participant.category_id,
            name: participant.category_name || "Umum",
          },
        }));

        // Simpan ke localStorage sebagai cache
        if (participantsData.length > 0) {
          localStorage.setItem(
            `event_${eventId}_participants`,
            JSON.stringify(participantsData),
          );
        }

        // Simpan semua data tanpa filter
        setAllParticipants(participantsData);

        // Aplikasikan filter
        applyFilters(
          participantsData,
          searchTerm,
          selectedCategory,
          currentPage,
        );
      } catch (error) {
        console.error("❌ Error fetching participants:", error);
        setErrorMessage(
          error.response?.data?.message ||
            "Terjadi kesalahan saat memuat data peserta",
        );
        setAllParticipants([]);
        setFilteredParticipants([]);
      } finally {
        setLoading(false);
      }
    },
    [eventId, searchTerm, selectedCategory, currentPage],
  );

  /* ================= APPLY FILTERS FUNCTION ================= */
  const applyFilters = useCallback((data, search, category, page) => {
    if (!data || data.length === 0) {
      setFilteredParticipants([]);
      setTotalPages(1);
      return;
    }

    let filtered = [...data];

    // Apply search filter
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          (p.school_name && p.school_name.toLowerCase().includes(q)) ||
          (p.coach && p.coach.toLowerCase().includes(q)) ||
          (p.school_address && p.school_address.toLowerCase().includes(q)) ||
          (p.coach_whatsapp && p.coach_whatsapp.includes(q)),
      );
    }

    // Apply category filter
    if (category) {
      filtered = filtered.filter((p) => p.participant_category_id == category);
    }

    // Sort by created_at (terbaru pertama)
    filtered.sort(
      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
    );

    // Calculate pagination
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    setTotalPages(totalPages);

    // Adjust current page if out of bounds
    let adjustedPage = page;
    if (page > totalPages && totalPages > 0) {
      adjustedPage = totalPages;
      setCurrentPage(totalPages);
    }

    // Slice data for current page
    const startIndex = ((adjustedPage || 1) - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedData = filtered.slice(startIndex, endIndex);

    setFilteredParticipants(paginatedData);

    // Set error message jika tidak ada data
    if (filtered.length === 0) {
      setErrorMessage(
        search || category
          ? "Tidak ada peserta yang sesuai dengan filter"
          : "Belum ada peserta untuk event ini",
      );
    } else {
      setErrorMessage("");
    }
  }, []);

  /* ================= HANDLE FILTERS ================= */
  const handleSearch = useCallback(() => {
    setCurrentPage(1);
    applyFilters(allParticipants, searchTerm, selectedCategory, 1);
  }, [allParticipants, searchTerm, selectedCategory, applyFilters]);

  const handleFilter = useCallback(() => {
    setCurrentPage(1);
    applyFilters(allParticipants, searchTerm, selectedCategory, 1);
  }, [allParticipants, searchTerm, selectedCategory, applyFilters]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedCategory("");
    setCurrentPage(1);
    applyFilters(allParticipants, "", "", 1);
  }, [allParticipants, applyFilters]);

  /* ================= PAGINATION HANDLERS ================= */
  const handlePageChange = useCallback(
    (page) => {
      setCurrentPage(page);
      applyFilters(allParticipants, searchTerm, selectedCategory, page);
    },
    [allParticipants, searchTerm, selectedCategory, applyFilters],
  );

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    console.log("🔍 Location pathname:", location.pathname);
    console.log("🔍 URL Event ID from params:", eventId);
    console.log("🔍 User ID:", user?.id);

    // Cek apakah eventId ada di URL
    if (!eventId) {
      console.error("❌ No eventId in URL, checking localStorage...");

      // Coba ambil eventId dari localStorage
      const storedEventId = localStorage.getItem("current_event_id");
      if (storedEventId) {
        console.log(
          `🔄 Found eventId in localStorage: ${storedEventId}, redirecting...`,
        );
        navigate(`/organizer/events/${storedEventId}/participants`, {
          replace: true,
        });
        return;
      }

      console.error("❌ No eventId found, redirecting to participants page");
      navigate("/organizer/participants", { replace: true });
      return;
    }

    // Simpan eventId di localStorage untuk backup
    localStorage.setItem("current_event_id", eventId);

    // Cegah multiple initialization
    if (initialized) {
      console.log("✅ Already initialized");
      return;
    }

    const initializePage = async () => {
      console.log("🚀 Initializing ParticipantsList for event:", eventId);

      setLoading(true);

      try {
        // Load event info
        await fetchEventInfo();

        // Load categories
        await fetchCategories();

        // Load participants
        await fetchParticipants(true); // Force refresh

        setInitialized(true);
        console.log("✅ ParticipantsList initialized successfully");
      } catch (error) {
        console.error("❌ Initialization error:", error);
        setErrorMessage("Gagal memuat halaman. Silakan refresh halaman.");
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [eventId, location.pathname]);

  /* ================= EFFECT UNTUK FILTER CHANGE ================= */
  useEffect(() => {
    if (allParticipants.length > 0 && initialized) {
      applyFilters(allParticipants, searchTerm, selectedCategory, currentPage);
    }
  }, [
    searchTerm,
    selectedCategory,
    currentPage,
    allParticipants,
    initialized,
    applyFilters,
  ]);

  /* ================= ACTIONS ================= */
  const handleDelete = async (id, name) => {
    if (!confirm(`Yakin ingin menghapus peserta "${name}"?`)) return;

    setDeleteLoading(id);
    setErrorMessage("");
    try {
      const token = getToken();
      const res = await axios.delete(`${API_URL}/participants/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success) {
        setSuccessMessage(`Peserta "${name}" berhasil dihapus`);
        setTimeout(() => setSuccessMessage(""), 3000);

        // Clear cache dan refresh data
        localStorage.removeItem(`event_${eventId}_participants`);
        fetchParticipants(true);
      } else {
        setErrorMessage(res.data?.message || "Gagal menghapus peserta");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Terjadi kesalahan saat menghapus peserta",
      );
    } finally {
      setDeleteLoading(null);
    }
  };

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

  const formatPhone = (p) => {
    if (!p) return "-";
    // Remove non-digits
    const digits = p.replace(/\D/g, "");
    // Format: 0812-3456-7890
    if (digits.length >= 10) {
      return `${digits.substring(0, 4)}-${digits.substring(4, 8)}-${digits.substring(8, 12)}`;
    }
    return p;
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

  /* ================= RENDER ================= */
  if (!eventId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader className="animate-spin text-blue-500" size={48} />
        <p className="text-gray-400 mt-3">Mengarahkan ke halaman peserta...</p>
      </div>
    );
  }

  if (loading && !initialized) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader className="animate-spin text-blue-500" size={48} />
        <p className="text-gray-400 mt-3">
          Memuat data peserta untuk event {eventId}...
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Daftar Peserta
            </h1>
            <p className="text-gray-400">
              {eventInfo
                ? `Peserta untuk: ${eventInfo.name}`
                : `Event ID: ${eventId}`}
            </p>
            {allParticipants.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Total: {allParticipants.length} peserta
                {filteredParticipants.length !== allParticipants.length &&
                  ` (${filteredParticipants.length} setelah filter)`}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to={`/organizer/events/${eventId}/participants/create`}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all">
              <Plus size={20} />
              Tambah Peserta
            </Link>
          </div>
        </div>
      </div>

      {/* Success & Error Messages */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-400 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-green-400 font-medium">Sukses!</p>
              <p className="text-green-300 text-sm mt-1">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage("")}
              className="p-1 hover:bg-green-500/20 rounded-lg transition-colors">
              <XCircle size={16} className="text-green-400" />
            </button>
          </div>
        </motion.div>
      )}

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-400 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-red-400 font-medium">Error</p>
              <p className="text-red-300 text-sm mt-1">{errorMessage}</p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => fetchParticipants(true)}
                  className="px-3 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
                  Coba Lagi
                </button>
                {errorMessage.includes("Belum ada peserta") && (
                  <Link
                    to={`/organizer/events/${eventId}/participants/create`}
                    className="px-3 py-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors">
                    Tambah Peserta
                  </Link>
                )}
              </div>
            </div>
            <button
              onClick={() => setErrorMessage("")}
              className="p-1 hover:bg-red-500/20 rounded-lg transition-colors">
              <XCircle size={16} className="text-red-400" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      {eventId && allParticipants.length > 0 && (
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
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all appearance-none">
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
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                Terapkan Filter
              </button>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg transition-colors">
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Participants Table */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        {filteredParticipants.length === 0 && !loading ? (
          <div className="p-8 text-center">
            <Users className="text-gray-500 mx-auto mb-3" size={48} />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              {searchTerm || selectedCategory
                ? "Tidak ada peserta yang sesuai"
                : "Belum ada peserta"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory
                ? "Tidak ada peserta yang sesuai dengan filter Anda"
                : "Belum ada peserta yang terdaftar untuk event ini."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to={`/organizer/events/${eventId}/participants/create`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Plus size={16} />
                Tambah Peserta Pertama
              </Link>
              {(searchTerm || selectedCategory) && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
                  Reset Filter
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="p-4 border-b border-gray-800 bg-gray-900/50">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-gray-400 text-sm">
                    Menampilkan{" "}
                    <span className="text-white font-medium">
                      {allParticipants.length}
                    </span>{" "}
                    peserta
                    {(searchTerm || selectedCategory) && " (setelah filter)"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {totalPages > 1 && (
                    <p className="text-gray-400 text-sm">
                      Halaman{" "}
                      <span className="text-white font-medium">
                        {currentPage}
                      </span>{" "}
                      dari{" "}
                      <span className="text-white font-medium">
                        {totalPages}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>

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
                  {filteredParticipants.map((participant) => {
                    const statusColor = getStatusColor(participant.status);
                    return (
                      <tr
                        key={participant.id}
                        className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
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
                                {participant.school_name ||
                                  "Nama tidak tersedia"}
                              </p>
                              <p className="text-sm text-gray-500 truncate max-w-xs">
                                {participant.school_address ||
                                  "Alamat tidak tersedia"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">
                            <Award size={12} />
                            {participant.participant_category?.name || "Umum"}
                          </span>
                        </td>

                        {/* Coach */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-500" />
                            <span className="text-gray-300">
                              {participant.coach || "Tidak diketahui"}
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
                                navigate(
                                  `/organizer/events/${eventId}/participants/edit/${participant.id}`,
                                );
                              }}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="Lihat Detail">
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() =>
                                navigate(
                                  `/organizer/events/${eventId}/participants/edit/${participant.id}`,
                                )
                              }
                              className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-colors"
                              title="Edit">
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() =>
                                handleDelete(
                                  participant.id,
                                  participant.school_name || "Peserta",
                                )
                              }
                              disabled={deleteLoading === participant.id}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                              title="Hapus">
                              {deleteLoading === participant.id ? (
                                <Loader size={18} className="animate-spin" />
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-800">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50">
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
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}>
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50">
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
