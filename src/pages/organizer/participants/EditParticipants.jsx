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
  Award,
  ArrowLeft,
  Loader,
  Image as ImageIcon,
  CalendarDays,
  Trash2,
  Eye,
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

  /* ================= FORMAT IMAGE URL ================= */
  const formatImageUrl = (imagePath) => {
    if (!imagePath) return null;

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    const baseUrl = "https://apipaskibra.my.id";

    if (imagePath.includes("participants/")) {
      return `${baseUrl}/storage/${imagePath}`;
    }

    if (imagePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return `${baseUrl}/storage/participants/${imagePath}`;
    }

    return `${baseUrl}/storage/${imagePath}`;
  };

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (id) {
      loadAllData();
    }
  }, [id]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const loadAllData = async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([
        fetchCategories(),
        fetchEvents(),
        loadParticipantFromAPI(),
      ]);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Gagal memuat data. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOAD PARTICIPANT FROM API ================= */
  const loadParticipantFromAPI = async () => {
    try {
      console.log(`📥 Loading participant data from API for ID: ${id}`);

      const response = await api.get(`/edit-participant/${id}`);

      if (response.data.success || response.data.id) {
        const data = response.data.data || response.data;
        setParticipantData(data);
        populateForm(data);

        if (data.image) {
          const imageUrl = formatImageUrl(data.image);
          if (imageUrl) {
            setImagePreview(imageUrl);
            setOriginalImage(imageUrl);
            console.log("✅ Set image from API:", imageUrl);
          }
        }
      } else {
        throw new Error("Data peserta tidak ditemukan di API");
      }
    } catch (apiError) {
      console.error("Error loading from API:", apiError);
      setError("Gagal memuat data peserta dari server.");
      throw apiError;
    }
  };

  /* ================= FETCH CATEGORIES ================= */
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await api.get("/participant-categories");

      let categoriesData = [];

      if (response.data.success && response.data.data) {
        if (Array.isArray(response.data.data)) {
          categoriesData = response.data.data;
        } else if (response.data.data.id) {
          categoriesData = [response.data.data];
        }
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data;
      }

      if (categoriesData.length > 0) {
        setCategories(categoriesData);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  /* ================= FETCH EVENTS ================= */
  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      if (!user?.id) {
        setEvents([]);
        return;
      }

      const response = await api.get(`/list-event-by-user?user_id=${user.id}`);

      let apiEvents = [];

      if (response.data.success && response.data.data) {
        if (Array.isArray(response.data.data)) {
          apiEvents = response.data.data;
        } else if (response.data.data.id) {
          apiEvents = [response.data.data];
        }
      } else if (Array.isArray(response.data)) {
        apiEvents = response.data;
      }

      if (apiEvents.length > 0) {
        const formattedEvents = apiEvents.map((event) => ({
          id: event.id || event.event_id,
          name: event.name || event.event_name || "Event",
          organized_by: event.organized_by || "Unknown",
          start_date: event.start_date || event.start_time,
          end_date: event.end_date || event.end_time,
        }));
        setEvents(formattedEvents);
      } else {
        setEvents([]);
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

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 5MB");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/bmp",
      "image/tiff",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        `Format file tidak didukung. Gunakan: JPG, JPEG, PNG, GIF, WebP, SVG, BMP, TIFF`,
      );
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, image: file }));
    setImagePreview(blobUrl);
    setError("");
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(originalImage || "");
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
          if (key === "image" && value instanceof File) {
            payload.append(key, value);
          } else {
            payload.append(key, value.toString());
          }
        }
      });

      payload.append("_method", "PUT");

      if (user?.id) {
        payload.append("user_id", user.id.toString());
      }

      console.log("🔄 Updating participant via API...");
      const response = await api.post(`/edit-participant/${id}`, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        console.log(
          "✅ Successfully updated participant via API:",
          response.data,
        );
        setSuccess(true);
        setParticipantData(response.data.data || response.data);

        setTimeout(() => {
          navigate("/organizer/participants");
        }, 1500);
      } else {
        throw new Error(response.data.message || "Gagal mengupdate peserta");
      }
    } catch (err) {
      console.error("❌ Error updating participant:", err);

      let errorMessage = "Terjadi kesalahan saat menyimpan data";

      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
        } else if (err.response.status === 404) {
          errorMessage = "Endpoint tidak ditemukan.";
        } else if (err.response.status === 422) {
          const validationErrors = err.response.data.errors;
          const errorMessages = [];

          for (const field in validationErrors) {
            errorMessages.push(
              `${field}: ${validationErrors[field].join(", ")}`,
            );
          }
          errorMessage = `Validasi gagal:\n${errorMessages.join("\n")}`;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
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
      await api.delete(`/delete-participant/${id}`);
      console.log("✅ Participant deleted from API");

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
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
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
                Data peserta berhasil disimpan.
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
                  Pilih Event (Opsional)
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
                    Tidak ada event tersedia.
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
                      <option value="">-- Pilih Event (Opsional) --</option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.name}{" "}
                          {event.start_date &&
                            `(${formatEventDate(event.start_date)})`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.event_id && (
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-xs text-blue-400">
                        <span className="font-medium">Event dipilih:</span>{" "}
                        {events.find((e) => e.id == formData.event_id)?.name}
                      </p>
                    </div>
                  )}
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
                Format: 08xx-xxxx-xxxx
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

              {/* Image Preview Area */}
              <div className="mb-4">
                {imagePreview ? (
                  <div className="relative border-2 border-gray-700 rounded-xl p-4 bg-gray-900/50">
                    <div className="flex flex-col items-center">
                      <div className="relative w-full max-w-xs h-48 mb-4">
                        <img
                          src={imagePreview}
                          alt={`Logo ${formData.school_name}`}
                          className="w-full h-full object-contain rounded-lg"
                          onError={(e) => {
                            console.error(
                              "❌ Image failed to load:",
                              e.target.src,
                            );
                            e.target.onerror = null;
                            const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.school_name)}&background=1e40af&color=fff&size=160&bold=true&format=svg`;
                            e.target.src = avatarUrl;
                          }}
                        />
                        {imagePreview?.startsWith("blob:") && (
                          <div className="absolute top-2 right-2 bg-yellow-500/80 text-white text-xs px-2 py-1 rounded">
                            Baru
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 w-full max-w-xs">
                        <label className="flex-1">
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,.tiff"
                            onChange={handleImageChange}
                            className="hidden"
                            disabled={submitting}
                            id="image-upload"
                          />
                          <div className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl text-center transition-colors cursor-pointer flex items-center justify-center gap-2">
                            <Upload size={14} />
                            Ganti
                          </div>
                        </label>
                        <button
                          type="button"
                          onClick={removeImage}
                          disabled={submitting}
                          className="flex-1 px-3 py-2 bg-red-500/80 hover:bg-red-500 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <X size={14} />
                          Hapus
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      {formData.image ? (
                        <>
                          <span className="text-green-400">Gambar baru: </span>
                          {formData.image.name}
                        </>
                      ) : originalImage ? (
                        <>
                          <span className="text-blue-400">
                            Gambar dari server
                          </span>
                        </>
                      ) : (
                        "Tidak ada gambar"
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-blue-500/50 transition-colors bg-gray-900/30">
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,.tiff"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={submitting}
                        id="image-upload"
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
                            JPG, PNG, GIF, WebP, SVG (Maks. 5MB)
                          </p>
                        </div>
                        {!originalImage && (
                          <div className="mt-4">
                            <p className="text-xs text-yellow-400">
                              ⚠️ Peserta ini belum memiliki gambar
                            </p>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

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
                  setFormData((prev) => ({ ...prev, image: null }));
                }
                setError("");
              }}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors"
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={submitting || loadingCategories || loadingEvents}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  Menyimpan...
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
