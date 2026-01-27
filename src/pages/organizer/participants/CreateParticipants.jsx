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
  const [loadingEvents, setLoadingEvents] = useState(true);

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

  const formatEventDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!user?.id) return setLoading(false);

    const loadData = async () => {
      try {
        await Promise.all([fetchCategories(), fetchEvents()]);
      } catch {
        setError("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    const res = await api.get("/participant-categories");
    setCategories(res.data.data || []);
    setLoadingCategories(false);
  };

  const fetchEvents = async () => {
    setLoadingEvents(true);
    try {
      const res = await api.get(`/list-event-by-user?user_id=${user.id}`);

      if (!res.data?.success || !Array.isArray(res.data.data)) {
        setEvents([]);
        return;
      }

      // 🔥 SIMPAN DATA MENTAH DARI BACKEND
      setEvents(res.data.data);
    } catch (err) {
      console.error("Error fetching events:", err);
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  /* ================= HANDLER ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 5MB");
      return;
    }

    setFormData((p) => ({ ...p, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setFormData((p) => ({ ...p, image: null }));
    setImagePreview("");
  };

  const handleWhatsAppChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData((p) => ({ ...p, coach_whatsapp: value }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const required = [
      "participant_category_id",
      "event_id",
      "school_name",
      "school_address",
      "coach",
      "coach_whatsapp",
    ];

    for (const field of required) {
      if (!formData[field]) {
        setError("Semua field wajib diisi");
        setSubmitting(false);
        return;
      }
    }

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([k, v]) => v && payload.append(k, v));
      payload.append("user_id", user.id);

      await api.post("/create-participant", payload);
      setSuccess(true);

      setTimeout(() => navigate("/organizer/participants"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan data peserta");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= RENDER ================= */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <Loader className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto">
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
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
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
          className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
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
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none">
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
                  Pilih Event *
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
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
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
                    required
                    disabled={submitting}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none">
                    <option value="">-- Pilih Event --</option>
                    {events.map((event) => {
                      const eventLabel =
                        event.name ??
                        event.event_name ??
                        event.title ??
                        event.organized_by ??
                        `Event #${event.id}`;

                      return (
                        <option key={event.id} value={event.id}>
                          {eventLabel}
                          {event.start_date &&
                            ` (${formatEventDate(event.start_date)})`}
                        </option>
                      );
                    })}
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
                    className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors disabled:opacity-50">
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
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50">
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting || loadingCategories || loadingEvents}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
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
