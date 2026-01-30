import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Info,
  Loader,
  Image as ImageIcon,
  ArrowLeft,
} from "lucide-react";
import api from "../../../../services/api";
import { useAuth } from "../../../../context/AuthContext";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState([]);

  // Format tanggal default (hari ini dan besok)
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    name: "",
    organized_by: "",
    location: "",
    event_info: "",
    term_condition: "",
    start_date: today, // Default hari ini
    end_date: tomorrow, // Default besok
    image: null,
    user_id: user?.id || "",
  });

  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (user?.id) {
      setFormData((prev) => ({
        ...prev,
        user_id: user.id,
      }));
    }
  }, [user]);

  /* ================= ADD DEBUG LOG ================= */
  const addDebugLog = (message) => {
    console.log(`[DEBUG] ${message}`);
    setDebugInfo((prev) => [
      ...prev,
      `${new Date().toISOString().split("T")[1].split(".")[0]} - ${message}`,
    ]);
  };

  /* ================= HANDLE IMAGE CHANGE ================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Ukuran file maksimal 5MB");
        addDebugLog(
          `Image validation failed: File too large (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
        );
        return;
      }

      // Validasi tipe file
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        setError("Format file harus JPG, JPEG, PNG, GIF, atau WebP");
        addDebugLog(`Image validation failed: Invalid type (${file.type})`);
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));
      setError("");
      addDebugLog(
        `Image selected: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`,
      );

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  /* ================= HANDLE SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Anda harus login sebagai admin untuk membuat event");
      return;
    }

    if (user.role !== "admin") {
      setError("Hanya admin yang dapat membuat event");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      // ================= VALIDATION =================
      if (!formData.name.trim()) throw new Error("Nama event wajib diisi");
      if (!formData.organized_by.trim())
        throw new Error("Penyelenggara wajib diisi");
      if (!formData.location.trim()) throw new Error("Lokasi wajib diisi");
      if (!formData.start_date || !formData.end_date)
        throw new Error("Tanggal event wajib diisi");

      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        throw new Error("Tanggal selesai tidak boleh sebelum tanggal mulai");
      }

      // ================= FORM DATA =================
      const submitData = new FormData();
      submitData.append("name", formData.name.trim());
      submitData.append("organized_by", formData.organized_by.trim());
      submitData.append("location", formData.location.trim());
      submitData.append("event_info", formData.event_info || "");
      submitData.append("term_condition", formData.term_condition || "");
      submitData.append("start_date", formData.start_date);
      submitData.append("end_date", formData.end_date);
      submitData.append("user_id", user.id);

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      // ================= API CALL =================
      const response = await api.post("/create-event", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Gagal membuat event");
      }

      // ================= TANGKAP EVENT_ID =================
      const newEventId = response.data?.data?.id;

      addDebugLog(`✅ Event created successfully with ID: ${newEventId}`);
      setSuccess(true);

      // Redirect setelah sukses ke admin events list
      setTimeout(() => {
        navigate("/admin/events/list");
      }, 1500);
    } catch (err) {
      console.error("Create Event Error:", err);

      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const messages = Object.values(errors).flat().join(", ");
        setError(`Validasi gagal: ${messages}`);
        addDebugLog(`Validation error: ${messages}`);
      } else if (err.response?.status === 401) {
        setError("Sesi berakhir, silakan login ulang");
        navigate("/auth/login");
      } else {
        setError(err.message || "Terjadi kesalahan");
        addDebugLog(`Error: ${err.message}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= HANDLE INPUT CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleTextAreaChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  /* ================= REMOVE IMAGE PREVIEW ================= */
  const removeImage = () => {
    setImagePreview("");
    setFormData((prev) => ({
      ...prev,
      image: null,
    }));
    addDebugLog("Image removed");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin/events/list")} // ✅ UBAH KE ADMIN
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft size={20} />
          <span>Kembali ke Daftar Event</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Buat Event Baru (Admin)</h1>
            <p className="text-gray-400">
              Buat event Paskibra Championship baru sebagai admin
            </p>
            {user && (
              <div className="mt-2 text-sm text-gray-500">
                Admin: <span className="text-blue-400">{user.name}</span> (ID:{" "}
                {user.id})
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Jika user bukan admin */}
      {user && user.role !== "admin" && (
        <div className="mb-6 p-6 rounded-xl bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle size={24} className="text-red-400" />
            <h3 className="text-lg font-bold text-red-400">Akses Ditolak</h3>
          </div>
          <p className="text-gray-300 mb-4">
            Hanya admin yang dapat membuat event. Role Anda: {user.role}
          </p>
          <button
            onClick={() => navigate("/admin")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium"
          >
            Kembali ke Dashboard Admin
          </button>
        </div>
      )}

      {/* Konten form hanya ditampilkan jika user adalah admin */}
      {user && user.role === "admin" && (
        <>
          {/* Debug Info Panel */}
          {debugInfo.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-gray-900/50 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-300">Debug Log</h3>
                <span className="text-xs text-gray-500">
                  {debugInfo.length} entries
                </span>
              </div>
              <div className="text-xs font-mono text-gray-400 max-h-32 overflow-y-auto">
                {debugInfo.slice(-10).map((log, index) => (
                  <div
                    key={index}
                    className="py-1 border-b border-gray-800/50 last:border-b-0"
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Info dari Validasi */}
          {error && error.includes("Validasi") && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-red-400 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium">Validasi Gagal</p>
                  <p className="text-red-300 text-sm mt-1 whitespace-pre-line">
                    {error}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Pastikan semua field required diisi dengan benar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
            {success && (
              <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                <div className="flex items-start space-x-3">
                  <CheckCircle
                    size={20}
                    className="text-green-400 flex-shrink-0 mt-0.5"
                  />
                  <div>
                    <p className="text-green-400 font-medium">Berhasil!</p>
                    <p className="text-green-300 text-sm mt-1">
                      Event berhasil dibuat sebagai admin. Mengarahkan ke daftar
                      event...
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-gray-300 border-b border-gray-700 pb-2">
                  Informasi Dasar Event
                </h3>

                {/* Nama Event */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nama Event *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                      className="w-full pl-4 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      placeholder="Contoh: Paskibra Championship 2024"
                      maxLength={200}
                    />
                  </div>
                </div>

                {/* Penyelenggara */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Diselenggarakan Oleh *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="organized_by"
                      value={formData.organized_by}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                      className="w-full pl-4 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      placeholder="Contoh: Dinas Pendidikan Kota Cilegon"
                      maxLength={200}
                    />
                  </div>
                </div>

                {/* Lokasi */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Lokasi *
                  </label>
                  <textarea
                    name="location"
                    value={formData.location}
                    onChange={handleTextAreaChange}
                    required
                    disabled={submitting}
                    rows="3"
                    className="w-full pl-4 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                    placeholder="Contoh: Gedung Serba Guna, Jl. Merdeka No. 123, Cilegon, Banten"
                    maxLength={500}
                  />
                </div>
              </div>

              {/* Date Information */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-gray-300 border-b border-gray-700 pb-2">
                  Waktu Pelaksanaan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tanggal Mulai *
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                      min={today}
                      className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tanggal Selesai *
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                      min={formData.start_date || today}
                      className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Event Information */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-gray-300 border-b border-gray-700 pb-2">
                  Informasi Tambahan (Opsional)
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Deskripsi Event
                    </label>
                    <textarea
                      name="event_info"
                      value={formData.event_info}
                      onChange={handleTextAreaChange}
                      disabled={submitting}
                      rows="4"
                      className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                      placeholder="Deskripsi lengkap tentang event, tujuan, kegiatan yang akan dilakukan, dll."
                      maxLength={2000}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Syarat & Ketentuan
                    </label>
                    <textarea
                      name="term_condition"
                      value={formData.term_condition}
                      onChange={handleTextAreaChange}
                      disabled={submitting}
                      rows="4"
                      className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                      placeholder="Syarat dan ketentuan peserta, persyaratan pendaftaran, aturan lomba, dll."
                      maxLength={2000}
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-gray-300 border-b border-gray-700 pb-2">
                  Poster Event (Opsional)
                </h3>
                <div className="space-y-4">
                  <div className="text-sm text-gray-400 mb-2">
                    <p>Format: JPG, JPEG, PNG, GIF, WebP (max. 5MB)</p>
                  </div>

                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                    id="event-image-upload"
                    disabled={submitting}
                  />

                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Upload Area */}
                    <label
                      htmlFor="event-image-upload"
                      className={`flex-1 cursor-pointer ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors h-full">
                        <div className="flex flex-col items-center space-y-4">
                          <ImageIcon size={32} className="text-gray-400" />
                          <div>
                            <p className="text-gray-300 font-medium">
                              Klik untuk upload poster
                            </p>
                            <p className="text-sm text-gray-500">
                              PNG, JPG, JPEG, GIF, WebP
                            </p>
                            {formData.image && (
                              <p className="text-xs text-green-400 mt-1">
                                ✓ {formData.image.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>

                    {/* Preview */}
                    {imagePreview && (
                      <div className="flex-1">
                        <div className="rounded-2xl border border-gray-700 p-4 h-full">
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={removeImage}
                              disabled={submitting}
                              className="absolute top-2 right-2 p-2 rounded-lg bg-red-500/80 hover:bg-red-600 text-white disabled:opacity-50"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => navigate("/admin/events/list")} // ✅ UBAH KE ADMIN
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors font-medium disabled:opacity-50"
                >
                  Batal
                </button>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        name: "",
                        organized_by: "",
                        location: "",
                        event_info: "",
                        term_condition: "",
                        start_date: today,
                        end_date: tomorrow,
                        image: null,
                        user_id: user.id,
                      });
                      setImagePreview("");
                      setError("");
                      addDebugLog("Form reset manually");
                    }}
                    disabled={submitting}
                    className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors font-medium disabled:opacity-50"
                  >
                    Reset Form
                  </button>

                  <button
                    type="submit"
                    disabled={submitting || success}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <Loader className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white" />
                        <span>Membuat Event...</span>
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        <span>Buat Event</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Information Panel */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-300 mb-2">
                  Tips Membuat Event (Admin):
                </h4>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>• Isi semua field bertanda * (wajib)</p>
                  <p>• Tanggal selesai harus setelah tanggal mulai</p>
                  <p>• Gambar opsional, maksimal 5MB</p>
                  <p>• Event akan langsung muncul di daftar semua event</p>
                  <p>
                    • Sebagai admin, Anda dapat mengelola semua event di sistem
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default CreateEvent;
