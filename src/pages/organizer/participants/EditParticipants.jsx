import { useState, useEffect, useRef } from "react";
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

  const hasFetched = useRef(false);

  const [formData, setFormData] = useState({
    school_name: "",
    school_address: "",
    coach: "",
    coach_whatsapp: "",
    image: null,
    event_id: "",
    participant_category_id: "",
  });

  const handleWhatsAppChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData((p) => ({ ...p, coach_whatsapp: value }));
  };

  const [imagePreview, setImagePreview] = useState("");
  const [originalImage, setOriginalImage] = useState("");

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
    setImagePreview(originalImage || "");
  };

  const populateForm = (data) => {
    setFormData({
      school_name: data.school_name || "",
      school_address: data.school_address || "",
      coach: data.coach || "",
      coach_whatsapp: data.coach_whatsapp || "",
      image: null,
      event_id: data.event_id?.toString() || "",
      participant_category_id: data.participant_category_id?.toString() || "",
    });
  };

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      await Promise.all([fetchCategories(), fetchEvents(), fetchParticipant()]);
    } catch {
      setError("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipant = async () => {
    const res = await api.get(`/participant-lists/${id}`);
    const data = res.data.data || res.data;

    setParticipantData(data);
    setFormData({
      school_name: data.school_name || "",
      school_address: data.school_address || "",
      coach: data.coach || "",
      coach_whatsapp: data.coach_whatsapp || "",
      image: null,
      event_id: data.event_id?.toString() || "",
      participant_category_id: data.participant_category_id?.toString() || "",
    });

    if (data.image) {
      const url = `https://apipaskibra.my.id/storage/${data.image}`;
      setImagePreview(url);
      setOriginalImage(url);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    const res = await api.get("/participant-categories");
    setCategories(res.data.data || []);
    setLoadingCategories(false);
  };

  const fetchEvents = async () => {
    if (!user?.id) {
      setEvents([]);
      return;
    }

    setLoadingEvents(true);
    try {
      const res = await api.get(`/list-event-by-user?user_id=${user.id}`);
      setEvents(Array.isArray(res.data.data) ? res.data.data : []);
    } finally {
      setLoadingEvents(false);
    }
  };

  /* ================= HANDLER ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== null && v !== "") payload.append(k, v);
      });

      payload.append("_method", "PUT");
      payload.append("user_id", user.id);

      await api.post(`/edit-participant/${id}`, payload);

      navigate("/organizer/participants");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal update peserta");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteParticipant = async () => {
    if (!confirm("Yakin ingin menghapus peserta ini?")) return;

    try {
      await api.delete(`/delete-participant/${id}`);
      navigate("/organizer/participants");
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menghapus peserta");
    }
  };

  /* ================= RENDER ================= */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
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
          <button
            onClick={() => navigate("/organizer/participants")}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors">
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
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors font-medium flex items-center gap-2">
              <Eye size={16} />
              Lihat Detail
            </button>
            <button
              onClick={handleDeleteParticipant}
              className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 transition-colors font-medium flex items-center gap-2">
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
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none">
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
                          className="flex-1 px-3 py-2 bg-red-500/80 hover:bg-red-500 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
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
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50">
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
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors">
              Reset
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
