import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Save,
  X,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Loader,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import api from "../../../../services/api";
import { useAuth } from "../../../../context/AuthContext";

const EditEvent = () => {
  const { id } = useParams(); // event_id
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [eventData, setEventData] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    organized_by: "",
    location: "",
    event_info: "",
    term_condition: "",
    start_date: "",
    end_date: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState("");
  const [originalImage, setOriginalImage] = useState("");

  const toDateInputValue = (date) => {
    if (!date) return "";
    return date.split(" ")[0]; // buang jam
  };

  /* ================= LOAD EVENT ================= */
  useEffect(() => {
    if (!id || !user) return;

    const loadEvent = async () => {
      try {
        const res = await api.get("/list-event");

        if (!Array.isArray(res.data?.data)) {
          throw new Error("Data event tidak valid");
        }

        const event = res.data.data.find((e) => Number(e.id) === Number(id));

        if (!event) {
          throw new Error("EVENT_NOT_OWNED");
        }

        setEventData(event);

        setFormData({
          name: event.name ?? "",
          organized_by: event.organized_by ?? "",
          location: event.location ?? "",
          event_info: event.event_info ?? "",
          term_condition: event.term_condition ?? "",
          start_date: toDateInputValue(event.start_date),
          end_date: toDateInputValue(event.end_date),
          image: null,
        });

        if (event.image) {
          const imgUrl = `https://apipaskibra.my.id/storage/${event.image}`;
          setImagePreview(imgUrl);
          setOriginalImage(imgUrl);
        }
      } catch (err) {
        navigate("/admin/events", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id, user]);

  /* ================= IMAGE ================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 5MB");
      return;
    }

    setFormData((p) => ({ ...p, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setFormData((p) => ({ ...p, image: null }));
    setImagePreview(originalImage);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const data = new FormData();
      data.append("event_id", id);
      data.append("user_id", user.id);
      data.append("name", formData.name);
      data.append("organized_by", formData.organized_by);
      data.append("location", formData.location);
      data.append("event_info", formData.event_info);
      data.append("term_condition", formData.term_condition);
      data.append("start_date", formData.start_date);
      data.append("end_date", formData.end_date);
      data.append("_method", "PUT");

      if (formData.image) {
        data.append("image", formData.image);
      }

      await api.post(`/edit-event/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);

      // Tampilkan notifikasi sukses sebentar sebelum redirect
      setTimeout(() => {
        // Redirect ke halaman admin events
        navigate("/admin/events", {
          replace: true,
          state: {
            showSuccessMessage: true,
            message: "Event berhasil diperbarui!",
          },
        });
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Gagal update event",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= DELETE ================= */
  const handleDeleteEvent = async () => {
    if (
      !window.confirm(
        "Hapus event ini? Data yang dihapus tidak dapat dikembalikan.",
      )
    )
      return;

    try {
      await api.delete(`/delete-event/${id}`);
      // Redirect ke admin events setelah delete
      navigate("/admin/events", {
        replace: true,
        state: {
          showSuccessMessage: true,
          message: "Event berhasil dihapus!",
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menghapus event");
    }
  };

  // Fungsi reset form
  const resetForm = () => {
    if (eventData) {
      setFormData({
        name: eventData.name ?? "",
        organized_by: eventData.organized_by ?? "",
        location: eventData.location ?? "",
        event_info: eventData.event_info ?? "",
        term_condition: eventData.term_condition ?? "",
        start_date: toDateInputValue(eventData.start_date),
        end_date: toDateInputValue(eventData.end_date),
        image: null,
      });
      setImagePreview(originalImage);
      setError("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader className="animate-spin h-10 w-10 text-blue-500" />
        <p className="text-gray-400 mt-3">Memuat data event...</p>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">
          Event Tidak Ditemukan
        </h2>
        <p className="text-gray-400 mb-6">
          Event dengan ID {id} tidak ditemukan atau Anda tidak memiliki akses.
        </p>
        <button
          onClick={() => navigate("/admin/events")}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all">
          Kembali ke Daftar Event
        </button>
      </div>
    );
  }

  /* ================= RENDER FORM ================= */
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto">
      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-400 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-green-400 font-medium">Sukses!</p>
              <p className="text-green-300 text-sm mt-1">
                Event berhasil diperbarui. Mengarahkan ke halaman events...
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-400 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-red-400 font-medium">Error</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="p-1 hover:bg-red-500/20 rounded-lg transition-colors">
              <X size={16} className="text-red-400" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin/events")}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft size={20} />
          <span>Kembali ke Daftar Event</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Edit Event</h1>
            <p className="text-gray-400">
              Edit detail event "{eventData?.name}"
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-300 border-b border-gray-700 pb-2">
              Informasi Dasar Event
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nama Event *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  placeholder="Nama event"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Diselenggarakan Oleh *
                </label>
                <input
                  type="text"
                  name="organized_by"
                  value={formData.organized_by}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  placeholder="Penyelenggara"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Lokasi *
                </label>
                <textarea
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  disabled={submitting}
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                  placeholder="Lokasi event"
                  maxLength={500}
                />
              </div>
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
                  min={formData.start_date}
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Event Information */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-300 border-b border-gray-700 pb-2">
              Informasi Event
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Deskripsi Event
                </label>
                <textarea
                  name="event_info"
                  value={formData.event_info}
                  onChange={handleChange}
                  disabled={submitting}
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                  placeholder="Deskripsi event"
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
                  onChange={handleChange}
                  disabled={submitting}
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                  placeholder="Syarat dan ketentuan"
                  maxLength={2000}
                />
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-300 border-b border-gray-700 pb-2">
              Poster Event
            </h3>
            <div className="space-y-4">
              <div className="text-sm text-gray-400 mb-2">
                <p>Format: JPG, JPEG, PNG, GIF, WebP (max. 5MB)</p>
                <p className="text-yellow-400">
                  Kosongkan jika tidak ingin mengganti gambar
                </p>
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
                  className={`flex-1 cursor-pointer ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}>
                  <div className="border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors h-full">
                    <div className="flex flex-col items-center space-y-4">
                      <ImageIcon size={32} className="text-gray-400" />
                      <div>
                        <p className="text-gray-300 font-medium">
                          {formData.image
                            ? "Ganti Gambar"
                            : imagePreview && !imagePreview.startsWith("data:")
                              ? "Ganti Gambar"
                              : "Upload Poster"}
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, JPEG, GIF, WebP
                        </p>
                        {formData.image ? (
                          <p className="text-xs text-green-400 mt-1">
                            ✓ Gambar baru dipilih
                          </p>
                        ) : imagePreview &&
                          !imagePreview.startsWith("data:") ? (
                          <p className="text-xs text-yellow-400 mt-1">
                            ✓ Gambar saat ini dari server
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </label>

                {/* Preview Area */}
                <div className="flex-1">
                  <div className="rounded-2xl border border-gray-700 p-4 h-full">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-gray-400">Preview:</p>
                      {imagePreview && !imagePreview.startsWith("data:") && (
                        <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                          Gambar Server
                        </span>
                      )}
                    </div>

                    {imagePreview ? (
                      <div className="space-y-4">
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 border border-gray-700">
                          <img
                            src={imagePreview}
                            alt="Event Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback ke placeholder jika gambar gagal load
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || "Event")}&background=1e40af&color=fff&size=400`;
                              e.target.className =
                                "w-full h-full object-contain p-8";
                            }}
                          />

                          {formData.image && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              Gambar Baru
                            </div>
                          )}

                          {formData.image && (
                            <button
                              type="button"
                              onClick={removeImage}
                              disabled={submitting}
                              className="absolute top-2 right-2 p-2 rounded-lg bg-red-500/80 hover:bg-red-600 text-white disabled:opacity-50"
                              title="Hapus gambar baru">
                              <X size={16} />
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          {formData.image ? (
                            <>
                              <p className="text-xs text-gray-400 text-center">
                                <span className="text-green-400">
                                  Gambar baru:
                                </span>{" "}
                                {formData.image.name}
                              </p>
                              <p className="text-xs text-gray-400 text-center">
                                Ukuran:{" "}
                                {(formData.image.size / 1024 / 1024).toFixed(2)}{" "}
                                MB
                              </p>
                            </>
                          ) : imagePreview &&
                            !imagePreview.startsWith("data:") ? (
                            <>
                              <p className="text-xs text-gray-400 text-center">
                                <span className="text-yellow-400">
                                  Gambar saat ini:
                                </span>{" "}
                                {eventData?.image || "Dari server"}
                              </p>
                              <div className="flex items-center justify-center gap-2">
                                <a
                                  href={imagePreview}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-400 hover:text-blue-300 underline">
                                  Lihat gambar asli
                                </a>
                              </div>
                            </>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-video rounded-xl bg-gray-900/50 border border-dashed border-gray-700 flex flex-col items-center justify-center">
                        <ImageIcon size={48} className="text-gray-600 mb-2" />
                        <p className="text-sm text-gray-500">
                          Tidak ada gambar
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={() => navigate("/admin/events")}
              disabled={submitting || success}
              className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors font-medium disabled:opacity-50">
              Batal
            </button>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={resetForm}
                disabled={submitting || success}
                className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors font-medium disabled:opacity-50">
                Reset
              </button>

              <button
                type="button"
                onClick={handleDeleteEvent}
                disabled={submitting || success}
                className="px-6 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 transition-colors font-medium flex items-center gap-2 disabled:opacity-50">
                <Trash2 size={16} />
                Hapus Event
              </button>

              <button
                type="submit"
                disabled={submitting || success}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
                {submitting ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white" />
                    <span>Mengupdate...</span>
                  </>
                ) : success ? (
                  <>
                    <CheckCircle size={20} />
                    <span>Berhasil!</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Update Event</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EditEvent;
