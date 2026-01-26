import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  PlusCircle,
} from "lucide-react";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

const CreateParticipant = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);

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

  /* ================= FETCH CATEGORIES FROM API ================= */
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await api.get("/participant-categories");

      let categoriesData = [];
      if (response.data.success && response.data.data) {
        if (Array.isArray(response.data.data)) {
          categoriesData = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        categoriesData = response.data;
      }

      if (categoriesData.length > 0) {
        setCategories(categoriesData);
      } else {
        setCategories([
          { id: 1, name: "SMP" },
          { id: 2, name: "SMA" },
          { id: 3, name: "SMK" },
          { id: 4, name: "Universitas" },
        ]);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
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

  /* ================= FETCH EVENTS FROM API ================= */
  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      if (!user?.id) {
        setEvents([]);
        return;
      }

      let allEvents = [];

      // 1. Ambil dari API
      try {
        const response = await api.get(
          `/list-event-by-user?user_id=${user.id}`,
        );

        if (response.data.success && response.data.data) {
          let apiEvents = [];

          if (Array.isArray(response.data.data)) {
            apiEvents = response.data.data;
          } else if (response.data.data.id) {
            apiEvents = [response.data.data];
          }

          // Format events dari API
          const formattedApiEvents = apiEvents.map((event) => {
            let displayName = "";

            if (event.name) {
              displayName = event.name;
            } else if (event.event_name) {
              displayName = event.event_name;
            } else if (event.organized_by && event.location) {
              displayName = `${event.organized_by} - ${event.location}`;
            } else {
              displayName = `Event ID: ${event.id}`;
            }

            return {
              id: event.id || event.event_id,
              name: displayName,
              organized_by: event.organized_by || "Unknown",
              location: event.location || "Unknown",
              start_date:
                event.start_date || event.start_time || event.date_start,
              end_date: event.end_date || event.end_time || event.date_end,
              from_api: true,
            };
          });

          allEvents = [...allEvents, ...formattedApiEvents];
          // console.log(`✅ Loaded ${formattedApiEvents.length} events from API`);
        }
      } catch (apiError) {
        console.error("Error fetching events from API:", apiError);
      }

      // 2. Ambil dari localStorage (untuk event yang baru dibuat)
      try {
        const storedEvents = localStorage.getItem("user_created_events");
        if (storedEvents) {
          const localStorageEvents = JSON.parse(storedEvents);

          // Filter hanya events milik user ini
          const userLocalEvents = localStorageEvents.filter(
            (event) => event.user_id == user.id,
          );

          const formattedLocalEvents = userLocalEvents.map((event) => ({
            id: event.id,
            name: event.name || `Event ID: ${event.id}`,
            organized_by: event.organized_by || user?.name || "User",
            location: event.location || "Unknown",
            start_date: event.start_date,
            end_date: event.end_date,
            from_localStorage: true,
          }));

          allEvents = [...allEvents, ...formattedLocalEvents];
          // console.log(
          //   `✅ Loaded ${formattedLocalEvents.length} events from localStorage`,
          // );
        }
      } catch (localStorageError) {
        console.error(
          "Error reading events from localStorage:",
          localStorageError,
        );
      }

      // 3. Hapus duplikat berdasarkan ID
      const uniqueEvents = [];
      const seenIds = new Set();

      allEvents.forEach((event) => {
        if (!seenIds.has(event.id)) {
          seenIds.add(event.id);
          uniqueEvents.push(event);
        }
      });

      // console.log(`📊 Total unique events: ${uniqueEvents.length}`);
      setEvents(uniqueEvents);
    } catch (err) {
      console.error("Error fetching events:", err);
      setEvents([]);
    } finally {
      setLoadingEvents(false);
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
      return "Tanggal belum ditentukan";
    }
  };

  /* ================= INITIAL FETCH ================= */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        await Promise.all([fetchCategories(), fetchEvents()]);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Gagal memuat beberapa data. Silakan coba refresh halaman.");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  /* ================= FORM HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

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
  };

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

      // Tambahkan user_id jika ada
      if (user?.id) {
        payload.append("user_id", user.id.toString());
      }

      const response = await api.post("/create-participant", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        // console.log("🎉 Participant created via API!");
        setSuccess(true);

        // Reset form setelah berhasil
        setTimeout(() => {
          setFormData({
            school_name: "",
            school_address: "",
            coach: "",
            coach_whatsapp: "",
            image: null,
            event_id: "",
            participant_category_id: "",
          });
          setImagePreview("");
        }, 1500);

        // Redirect setelah 2 detik
        setTimeout(() => {
          navigate("/organizer/participants");
        }, 2000);
      } else {
        throw new Error(response.data.message || "Gagal menambahkan peserta");
      }
    } catch (err) {
      console.error("❌ Error submitting participant:", err);

      let errorMessage = "Terjadi kesalahan saat menyimpan data";

      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
        } else if (err.response.status === 422) {
          // Validation errors from Laravel
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
        <p className="text-gray-400">Memuat data...</p>
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
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Tambah Peserta Baru
          </h1>
        </div>
        <p className="text-gray-400">
          Isi semua informasi peserta di bawah ini
        </p>

        {/* User Info */}
        {/* {user && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-400">
              <span className="font-medium">User Login:</span> {user.name}
              <span className="mx-2">•</span>
              <span className="font-medium">ID:</span> {user.id}
            </p>
            <p className="text-xs text-blue-300 mt-1">
              {loadingEvents
                ? "Memuat event..."
                : events.length > 0
                  ? `Menampilkan ${events.length} event yang tersedia`
                  : "Belum ada event. Silakan buat event terlebih dahulu."}
            </p>
          </div>
        )} */}
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
                Peserta berhasil ditambahkan. Mengarahkan ke daftar peserta...
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
            </div>

            {/* Event Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  Pilih Event
                  <span className="text-xs text-gray-500">(Opsional)</span>
                </div>
              </label>

              {loadingEvents ? (
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl">
                  <Loader className="animate-spin text-gray-400" size={16} />
                  <span className="text-gray-400">Memuat daftar event...</span>
                </div>
              ) : events.length === 0 ? (
                <div className="space-y-3">
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <p className="text-yellow-400 text-sm">
                      Belum ada event tersedia. Buat event terlebih dahulu.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/organizer/events/create")}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <PlusCircle size={18} />
                    Buat Event Baru
                  </button>
                </div>
              ) : (
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
                        {event.name}
                        {event.start_date &&
                          ` (${formatEventDate(event.start_date)})`}
                      </option>
                    ))}
                  </select>
                </div>
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

              {imagePreview ? (
                <div className="relative">
                  <div className="border-2 border-dashed border-gray-700 rounded-xl p-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-contain rounded-lg"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    disabled={submitting}
                    className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors disabled:opacity-50"
                  >
                    <X size={16} />
                  </button>
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
                Simpan Peserta
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateParticipant;
