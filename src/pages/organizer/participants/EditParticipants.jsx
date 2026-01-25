import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Save,
  X,
  Upload,
  AlertCircle,
  CheckCircle,
  School,
  MapPin,
  User,
  Phone,
  Calendar,
  Award,
  ArrowLeft,
  Loader,
  Image as ImageIcon,
  CalendarDays,
  Trash2,
  Eye,
  Users,
  Building,
  Info, // TAMBAHKAN INI
} from "lucide-react";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

const EditParticipant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [participantData, setParticipantData] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    school_name: "",
    school_address: "",
    coach: "",
    coach_whatsapp: "",
    image: null,
    event_id: "",
    participant_category_id: "",
  });

  const [imagePreview, setImagePreview] = useState("");
  const [originalImage, setOriginalImage] = useState("");

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (id) {
      loadAllData();
    }
  }, [id]);

  const loadAllData = async () => {
    setLoading(true);
    setError("");

    try {
      // Load categories, events, dan participant data secara parallel
      await Promise.all([
        fetchCategories(),
        fetchEvents(),
        loadParticipantData(),
      ]);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Gagal memuat data. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOAD PARTICIPANT DATA ================= */
  const loadParticipantData = async () => {
    try {
      console.log(`📥 Loading participant data for ID: ${id}`);

      // Coba load dari API terlebih dahulu - gunakan endpoint GET /participants/{id}
      try {
        const response = await api.get(`/participants/${id}`);
        console.log("✅ Participant API Response:", response.data);

        if (response.data.success) {
          const data = response.data.data || response.data;
          setParticipantData(data);
          populateForm(data);
          return;
        }
      } catch (apiError) {
        console.log("⚠️ API not available, trying localStorage...");
      }

      // Jika API gagal, coba dari localStorage
      const allParticipants = localStorage.getItem("all_participants");
      if (allParticipants) {
        const participants = JSON.parse(allParticipants);
        const participant = participants.find((p) => p.id == id);

        if (participant) {
          console.log("✅ Found participant in localStorage:", participant);
          setParticipantData(participant);
          populateForm(participant);

          // Load image dari localStorage jika ada
          if (participant.image) {
            setImagePreview(participant.image);
            setOriginalImage(participant.image);
          }
        } else {
          throw new Error("Peserta tidak ditemukan");
        }
      } else {
        throw new Error("Peserta tidak ditemukan");
      }
    } catch (error) {
      console.error("❌ Error loading participant:", error);
      throw error;
    }
  };

  /* ================= FETCH CATEGORIES ================= */
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      console.log("Fetching categories from /api/participant-categories...");
      const response = await api.get("/participant-categories");
      console.log("Categories API response:", response.data);

      if (response.data.success && response.data.data) {
        setCategories(response.data.data);
      } else {
        throw new Error("Format data kategori tidak valid");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      // Fallback data
      setCategories([
        { id: 1, name: "SMP" },
        { id: 2, name: "SMA" },
        { id: 3, name: "SMK" },
        { id: 4, name: "Universitas" },
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };

  /* ================= FETCH EVENTS ================= */
  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      console.log("Fetching events...");

      // Coba dari localStorage terlebih dahulu
      const storedEvents = localStorage.getItem("user_created_events");
      if (storedEvents) {
        const eventsData = JSON.parse(storedEvents);

        // Filter untuk user yang login
        if (user?.id) {
          const userEvents = eventsData.filter(
            (event) =>
              event.user_id == user.id ||
              event.user_id === user.id ||
              !event.user_id,
          );
          setEvents(userEvents.length > 0 ? userEvents : eventsData);
        } else {
          setEvents(eventsData);
        }
      } else {
        // Fallback events
        setEvents([
          {
            id: 1,
            name: "Paskibra Championship 2024",
            organized_by: "Dinas Pendidikan Kota Cilegon",
            start_date: "2024-12-01",
            end_date: "2024-12-03",
          },
          {
            id: 2,
            name: "Lomba Paskibra Jawa Barat 2024",
            organized_by: "Pemprov Jawa Barat",
            start_date: "2024-11-15",
            end_date: "2024-11-17",
          },
        ]);
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  /* ================= POPULATE FORM ================= */
  const populateForm = (data) => {
    setFormData({
      school_name: data.school_name || "",
      school_address: data.school_address || "",
      coach: data.coach || "",
      coach_whatsapp: data.coach_whatsapp || "",
      image: null,
      event_id: data.event_id ? data.event_id.toString() : "",
      participant_category_id: data.participant_category_id
        ? data.participant_category_id.toString()
        : "",
    });
  };

  /* ================= HANDLE IMAGE ================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 5MB");
      return;
    }

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG, PNG, JPEG)");
      return;
    }

    setFormData((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview("");
    setOriginalImage("");
  };

  /* ================= FORMAT WHATSAPP NUMBER ================= */
  const formatWhatsAppNumber = (value) => {
    const numbers = value.replace(/\D/g, "");

    if (numbers.startsWith("0")) {
      return numbers;
    } else if (numbers.startsWith("62")) {
      return "0" + numbers.slice(2);
    } else if (numbers.startsWith("+62")) {
      return "0" + numbers.slice(3);
    }

    return numbers;
  };

  const handleWhatsAppChange = (e) => {
    const value = e.target.value;
    const formatted = formatWhatsAppNumber(value);
    setFormData((prev) => ({ ...prev, coach_whatsapp: formatted }));
  };

  /* ================= HANDLE CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  /* ================= HANDLE SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Validasi required fields
    const requiredFields = [
      { field: "participant_category_id", name: "Kategori Peserta" },
      { field: "school_name", name: "Nama Sekolah" },
      { field: "school_address", name: "Alamat Sekolah" },
      { field: "coach", name: "Nama Pelatih" },
      { field: "coach_whatsapp", name: "Nomor WhatsApp Pelatih" },
    ];

    for (const { field, name } of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        setError(`${name} wajib diisi`);
        setSubmitting(false);
        return;
      }
    }

    try {
      const payload = new FormData();

      // Append semua field ke FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          payload.append(key, value);
        }
      });

      // Tambahkan _method untuk Laravel PUT method
      payload.append("_method", "PUT");

      console.log(
        "📤 Submitting participant update to /edit-participant/${id}...",
      );
      console.log("📋 Update data:", {
        ...formData,
        image: formData.image ? formData.image.name : "No new image",
        event_name:
          events.find((e) => e.id == formData.event_id)?.name ||
          "No event selected",
      });

      // Submit to API dengan POST ke /edit-participant/{id} dengan _method=PUT
      const response = await api.post(`/edit-participant/${id}`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ API Update Response:", response.data);

      if (response.data.success) {
        setSuccess(true);

        // ========== UPDATE LOCALSTORAGE ==========
        const updatedParticipant = {
          ...participantData,
          school_name: formData.school_name,
          school_address: formData.school_address,
          coach: formData.coach,
          coach_whatsapp: formData.coach_whatsapp,
          event_id: formData.event_id ? parseInt(formData.event_id) : null,
          participant_category_id: parseInt(formData.participant_category_id),
          image: imagePreview || originalImage,
          updated_at: new Date().toISOString(),
          from_api: true,
          api_response: response.data,
        };

        // Update di all_participants
        const allParticipantsKey = "all_participants";
        let allParticipants = [];

        try {
          const storedAllParticipants =
            localStorage.getItem(allParticipantsKey);
          if (storedAllParticipants) {
            allParticipants = JSON.parse(storedAllParticipants);
          }
        } catch (err) {
          allParticipants = [];
        }

        const participantIndex = allParticipants.findIndex((p) => p.id == id);
        if (participantIndex !== -1) {
          allParticipants[participantIndex] = updatedParticipant;
          localStorage.setItem(
            allParticipantsKey,
            JSON.stringify(allParticipants),
          );
          console.log("🔄 Updated participant in global list");
        }

        // Jika ada event_id, update di event_participants
        if (formData.event_id) {
          try {
            const eventParticipantsKey = `event_participants_${formData.event_id}`;
            let eventParticipants = [];

            try {
              const storedParticipants =
                localStorage.getItem(eventParticipantsKey);
              if (storedParticipants) {
                eventParticipants = JSON.parse(storedParticipants);
              }
            } catch (err) {
              eventParticipants = [];
            }

            const eventParticipantIndex = eventParticipants.findIndex(
              (p) => p.id == id,
            );
            if (eventParticipantIndex !== -1) {
              eventParticipants[eventParticipantIndex] = updatedParticipant;
              localStorage.setItem(
                eventParticipantsKey,
                JSON.stringify(eventParticipants),
              );
              console.log(
                `✅ Updated participant in event ${formData.event_id}`,
              );
            }
          } catch (eventError) {
            console.error("Error updating in event participants:", eventError);
          }
        }

        // Redirect setelah 2 detik
        setTimeout(() => {
          navigate("/organizer/participants");
        }, 2000);
      } else {
        throw new Error(response.data.message || "Gagal mengupdate peserta");
      }
    } catch (err) {
      console.error("❌ Error updating participant:", err);

      let errorMessage = "Terjadi kesalahan saat mengupdate data";

      if (err.response?.status === 401) {
        setError("Sesi Anda telah berakhir. Silakan login kembali.");
        setTimeout(() => {
          navigate("/auth/login");
        }, 2000);
      } else if (err.response?.status === 404) {
        setError("Peserta tidak ditemukan di server");
      } else if (err.response?.status === 422) {
        // Validation errors from Laravel
        const validationErrors = err.response.data.errors;
        const errorMessages = [];

        for (const field in validationErrors) {
          errorMessages.push(`${field}: ${validationErrors[field].join(", ")}`);
        }

        setError(`Validasi gagal: ${errorMessages.join("; ")}`);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      }

      // ========== FALLBACK: UPDATE LOCALSTORAGE MESKI API GAGAL ==========
      try {
        const updatedParticipant = {
          ...participantData,
          school_name: formData.school_name,
          school_address: formData.school_address,
          coach: formData.coach,
          coach_whatsapp: formData.coach_whatsapp,
          event_id: formData.event_id ? parseInt(formData.event_id) : null,
          participant_category_id: parseInt(formData.participant_category_id),
          image: imagePreview || originalImage,
          updated_at: new Date().toISOString(),
          from_api: false,
          api_error: err.message,
        };

        // Update global list
        const allParticipantsKey = "all_participants";
        let allParticipants = [];

        try {
          const storedAllParticipants =
            localStorage.getItem(allParticipantsKey);
          if (storedAllParticipants) {
            allParticipants = JSON.parse(storedAllParticipants);
          }
        } catch (parseError) {
          allParticipants = [];
        }

        const participantIndex = allParticipants.findIndex((p) => p.id == id);
        if (participantIndex !== -1) {
          allParticipants[participantIndex] = updatedParticipant;
          localStorage.setItem(
            allParticipantsKey,
            JSON.stringify(allParticipants),
          );

          // Update di event jika ada
          if (formData.event_id) {
            const eventParticipantsKey = `event_participants_${formData.event_id}`;
            let eventParticipants = [];

            try {
              const storedParticipants =
                localStorage.getItem(eventParticipantsKey);
              if (storedParticipants) {
                eventParticipants = JSON.parse(storedParticipants);
              }
            } catch (eventError) {
              eventParticipants = [];
            }

            const eventParticipantIndex = eventParticipants.findIndex(
              (p) => p.id == id,
            );
            if (eventParticipantIndex !== -1) {
              eventParticipants[eventParticipantIndex] = updatedParticipant;
              localStorage.setItem(
                eventParticipantsKey,
                JSON.stringify(eventParticipants),
              );
            }
          }

          console.log(
            "🔄 Updated participant in localStorage (fallback):",
            updatedParticipant,
          );

          errorMessage += "\n\n✅ Perubahan telah disimpan secara lokal.";
        }
      } catch (storageError) {
        console.error("❌ Error updating localStorage:", storageError);
      }

      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= DELETE PARTICIPANT ================= */
  const handleDeleteParticipant = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus peserta ini?")) {
      return;
    }

    try {
      // Coba hapus dari API
      try {
        await api.delete(`/delete-participant/${id}`);
      } catch (apiError) {
        console.log("⚠️ API delete failed, continuing with localStorage...");
      }

      // Hapus dari localStorage
      const allParticipantsKey = "all_participants";
      let allParticipants = [];

      try {
        const storedAllParticipants = localStorage.getItem(allParticipantsKey);
        if (storedAllParticipants) {
          allParticipants = JSON.parse(storedAllParticipants);
        }
      } catch (err) {
        allParticipants = [];
      }

      // Hapus peserta
      const participantToDelete = allParticipants.find((p) => p.id == id);
      const updatedParticipants = allParticipants.filter((p) => p.id != id);
      localStorage.setItem(
        allParticipantsKey,
        JSON.stringify(updatedParticipants),
      );

      // Hapus dari event jika ada
      if (participantToDelete?.event_id) {
        const eventParticipantsKey = `event_participants_${participantToDelete.event_id}`;
        let eventParticipants = [];

        try {
          const storedParticipants = localStorage.getItem(eventParticipantsKey);
          if (storedParticipants) {
            eventParticipants = JSON.parse(storedParticipants);
          }
        } catch (err) {
          eventParticipants = [];
        }

        const updatedEventParticipants = eventParticipants.filter(
          (p) => p.id != id,
        );
        localStorage.setItem(
          eventParticipantsKey,
          JSON.stringify(updatedEventParticipants),
        );

        // Update jumlah peserta di event
        const storedEvents = localStorage.getItem("user_created_events");
        if (storedEvents) {
          let events = JSON.parse(storedEvents);
          const eventIndex = events.findIndex(
            (e) => e.id == participantToDelete.event_id,
          );

          if (eventIndex !== -1) {
            events[eventIndex].participants_count =
              updatedEventParticipants.length;
            events[eventIndex].total_participants =
              updatedEventParticipants.length;
            localStorage.setItem("user_created_events", JSON.stringify(events));
          }
        }
      }

      alert("Peserta berhasil dihapus");
      navigate("/organizer/participants");
    } catch (error) {
      console.error("Error deleting participant:", error);
      alert("Gagal menghapus peserta: " + (error.message || ""));
    }
  };

  /* ================= FORMAT DATE ================= */
  const formatEventDate = (dateString) => {
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

  /* ================= RENDER LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="mb-4"
        >
          <Loader className="text-blue-500" size={48} />
        </motion.div>
        <p className="text-gray-400">Memuat data peserta...</p>
      </div>
    );
  }

  if (!participantData && !loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate("/organizer/participants")}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            Kembali ke Daftar Peserta
          </button>
        </div>
        <div className="text-center p-8 bg-gray-800/50 rounded-2xl border border-gray-700">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Peserta Tidak Ditemukan
          </h2>
          <p className="text-gray-400 mb-6">
            Peserta yang Anda cari tidak ditemukan atau telah dihapus.
          </p>
          <button
            onClick={() => navigate("/organizer/participants")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium"
          >
            Kembali ke Daftar Peserta
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate("/organizer/participants")}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            Kembali ke Daftar Peserta
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Edit Peserta
          </h1>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-gray-400">
              Edit informasi peserta{" "}
              <span className="font-medium text-white">
                {participantData?.school_name}
              </span>
            </p>
            {user && (
              <div className="mt-2 text-sm text-gray-500">
                User Login: <span className="text-blue-400">{user.name}</span>
                <span className="mx-2">•</span>
                ID: <span className="text-blue-400">{user.id}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/organizer/participants/${id}`)}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors font-medium flex items-center gap-2"
            >
              <Eye size={16} />
              Lihat Detail
            </button>
            <button
              onClick={handleDeleteParticipant}
              className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 transition-colors font-medium flex items-center gap-2"
            >
              <Trash2 size={16} />
              Hapus Peserta
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-400 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-red-400 font-medium">Terjadi Kesalahan</p>
              <p className="text-red-300 text-sm mt-1 whitespace-pre-line">
                {error}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Success Alert */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-400 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-green-400 font-medium">Berhasil!</p>
              <p className="text-green-300 text-sm mt-1">
                Peserta berhasil diupdate. Mengarahkan ke daftar peserta...
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Award size={16} />
                  Kategori Peserta *
                </div>
              </label>
              <div className="relative">
                <select
                  name="participant_category_id"
                  value={formData.participant_category_id}
                  onChange={handleChange}
                  required
                  disabled={loadingCategories || submitting}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                >
                  <option value="">-- Pilih Kategori --</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name || `Kategori #${category.id}`}
                    </option>
                  ))}
                </select>
                {loadingCategories && (
                  <div className="absolute right-3 top-3">
                    <Loader className="animate-spin text-gray-400" size={16} />
                  </div>
                )}
              </div>
              {categories.length === 0 && !loadingCategories && (
                <p className="text-yellow-500 text-sm mt-2">
                  Tidak ada kategori tersedia.
                </p>
              )}
            </div>

            {/* Event Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  Pilih Event
                </div>
              </label>

              {loadingEvents ? (
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl">
                  <Loader className="animate-spin text-gray-400" size={16} />
                  <span className="text-gray-400">Memuat daftar event...</span>
                </div>
              ) : events.length === 0 ? (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <p className="text-yellow-400 text-sm">
                    Tidak ada event tersedia.{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/organizer/events/create")}
                      className="underline hover:text-yellow-300"
                    >
                      Buat event baru
                    </button>
                  </p>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <select
                      name="event_id"
                      value={formData.event_id}
                      onChange={handleChange}
                      disabled={submitting}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                    >
                      <option value="">-- Pilih Event --</option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.name} ({formatEventDate(event.start_date)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Info event yang dipilih */}
                  {formData.event_id && (
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-xs text-blue-400">
                        <span className="font-medium">Event dipilih:</span>{" "}
                        {events.find((e) => e.id == formData.event_id)?.name}
                      </p>
                      {events.find((e) => e.id == formData.event_id)
                        ?.organized_by && (
                        <p className="text-xs text-blue-300 mt-1">
                          <span className="font-medium">Penyelenggara:</span>{" "}
                          {
                            events.find((e) => e.id == formData.event_id)
                              ?.organized_by
                          }
                        </p>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    Pilih event jika peserta mengikuti event tertentu
                  </p>
                </>
              )}
            </div>

            {/* School Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <School size={16} />
                  Nama Sekolah *
                </div>
              </label>
              <input
                type="text"
                name="school_name"
                value={formData.school_name}
                onChange={handleChange}
                required
                disabled={submitting}
                placeholder="Contoh: SMAN 1 Jakarta"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-50"
              />
            </div>

            {/* Coach Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  Nama Pelatih *
                </div>
              </label>
              <input
                type="text"
                name="coach"
                value={formData.coach}
                onChange={handleChange}
                required
                disabled={submitting}
                placeholder="Nama lengkap pelatih"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* School Address */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  Alamat Sekolah *
                </div>
              </label>
              <textarea
                name="school_address"
                value={formData.school_address}
                onChange={handleChange}
                required
                disabled={submitting}
                rows="4"
                placeholder="Alamat lengkap sekolah"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all resize-none disabled:opacity-50"
              />
            </div>

            {/* Coach WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  Nomor WhatsApp Pelatih *
                </div>
              </label>
              <input
                type="tel"
                name="coach_whatsapp"
                value={formData.coach_whatsapp}
                onChange={handleWhatsAppChange}
                required
                disabled={submitting}
                placeholder="Contoh: 081234567890"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-50"
              />
              <p className="text-xs text-gray-500 mt-2">
                Format: 08xx-xxxx-xxxx atau +62-xxx-xxx-xxx
              </p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <ImageIcon size={16} />
                  Logo/Foto Sekolah
                  <span className="text-xs text-gray-500">(Opsional)</span>
                </div>
              </label>

              {imagePreview || originalImage ? (
                <div className="relative">
                  <div className="border-2 border-dashed border-gray-700 rounded-xl p-4">
                    <img
                      src={imagePreview || originalImage}
                      alt="Preview"
                      className="w-full h-48 object-contain rounded-lg"
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={submitting}
                        id="participant-image-upload"
                      />
                      <div className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl text-center transition-colors cursor-pointer">
                        Ganti Gambar
                      </div>
                    </label>
                    <button
                      type="button"
                      onClick={removeImage}
                      disabled={submitting}
                      className="flex-1 px-3 py-2 bg-red-500/80 hover:bg-red-500 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                    >
                      Hapus Gambar
                    </button>
                  </div>
                  {formData.image && (
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      Gambar baru: {formData.image.name} (
                      {(formData.image.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-blue-500/50 transition-colors">
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={submitting}
                    />
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="p-3 bg-gray-800 rounded-full">
                        <Upload className="text-gray-400" size={24} />
                      </div>
                      <div>
                        <p className="text-gray-300 font-medium">
                          Klik untuk upload gambar
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          PNG, JPG, JPEG (Maks. 5MB)
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Participant Info */}
        {participantData && (
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-300 mb-2">
                  Informasi Peserta:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-400">
                  <div>
                    <p>
                      <strong>ID Peserta:</strong> {participantData.id}
                    </p>
                    <p>
                      <strong>Dibuat pada:</strong>{" "}
                      {new Date(
                        participantData.created_at || Date.now(),
                      ).toLocaleString("id-ID")}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {participantData.from_api ? "Dari API" : "Lokal"}
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Event ID:</strong>{" "}
                      {participantData.event_id || "Tidak ada"}
                    </p>
                    <p>
                      <strong>User ID:</strong>{" "}
                      {participantData.user_id || user?.id}
                    </p>
                    {participantData.updated_at && (
                      <p>
                        <strong>Terakhir diupdate:</strong>{" "}
                        {new Date(participantData.updated_at).toLocaleString(
                          "id-ID",
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-800">
          <button
            type="button"
            onClick={() => navigate("/organizer/participants")}
            disabled={submitting}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            Batal
          </button>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => {
                if (participantData) {
                  populateForm(participantData);
                  setImagePreview(originalImage);
                }
                setError("");
              }}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
            >
              Reset Perubahan
            </button>

            <button
              type="submit"
              disabled={submitting || loadingCategories || loadingEvents}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  Mengupdate...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Update Peserta
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default EditParticipant;
