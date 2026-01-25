import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Save,
  X,
  Upload,
  AlertCircle,
  CheckCircle,
  Calendar,
  Building,
  MapPin,
  Info,
  FileText,
  ArrowLeft,
  Loader,
  Image as ImageIcon,
  Trash2,
  Edit,
  Eye,
} from "lucide-react";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

const EditEvent = () => {
  const { id } = useParams();
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

  useEffect(() => {
    if (id) {
      loadEventData();
    }
  }, [id]);

  const loadEventData = async () => {
    setLoading(true);
    setError("");

    try {
      console.log(`📥 Loading event data for ID: ${id}`);

      // Coba load dari API terlebih dahulu
      try {
        const response = await api.get(`/events/${id}`);
        console.log("✅ API Response:", response.data);

        if (response.data.success) {
          const data = response.data.data || response.data;
          setEventData(data);
          populateForm(data);
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.log("⚠️ API not available, trying localStorage...");
      }

      // Jika API gagal, coba dari localStorage
      const storedEvents = localStorage.getItem("user_created_events");
      if (storedEvents) {
        const events = JSON.parse(storedEvents);
        const event = events.find((e) => e.id == id);

        if (event) {
          console.log("✅ Found event in localStorage:", event);
          setEventData(event);
          populateForm(event);

          // Coba load image dari localStorage
          try {
            const storedImage = localStorage.getItem(`event_image_${id}`);
            if (storedImage) {
              setImagePreview(storedImage);
              setOriginalImage(storedImage);
            }
          } catch (imageError) {
            console.error("Error loading image from storage:", imageError);
          }
        } else {
          throw new Error("Event tidak ditemukan");
        }
      } else {
        throw new Error("Event tidak ditemukan");
      }
    } catch (error) {
      console.error("❌ Error loading event:", error);
      setError("Gagal memuat data event. " + (error.message || ""));
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (data) => {
    setFormData({
      name: data.name || "",
      organized_by: data.organized_by || "",
      location: data.location || "",
      event_info: data.event_info || data.description || "",
      term_condition: data.term_condition || data.terms || "",
      start_date: data.start_date ? data.start_date.split("T")[0] : "",
      end_date: data.end_date ? data.end_date.split("T")[0] : "",
      image: null,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi ukuran file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Ukuran file maksimal 5MB");
        return;
      }

      // Validasi tipe file
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setError("Format file harus JPG, JPEG, PNG, atau GIF");
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));
      setError("");

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview("");
    setOriginalImage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Anda harus login untuk mengedit event");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Validation
      const errors = [];

      if (!formData.name.trim()) {
        errors.push("Nama event wajib diisi");
      }
      if (!formData.organized_by.trim()) {
        errors.push("Penyelenggara wajib diisi");
      }
      if (!formData.location.trim()) {
        errors.push("Lokasi wajib diisi");
      }
      if (!formData.start_date) {
        errors.push("Tanggal mulai wajib diisi");
      }
      if (!formData.end_date) {
        errors.push("Tanggal selesai wajib diisi");
      }

      // Validasi tanggal
      if (formData.start_date && formData.end_date) {
        const startDate = new Date(formData.start_date);
        const endDate = new Date(formData.end_date);

        if (endDate < startDate) {
          errors.push("Tanggal selesai tidak boleh sebelum tanggal mulai");
        }
      }

      if (errors.length > 0) {
        throw new Error(errors.join(", "));
      }

      // Prepare form data for multipart upload
      const submitData = new FormData();

      // Append semua field yang diperlukan
      submitData.append("name", formData.name.trim());
      submitData.append("organized_by", formData.organized_by.trim());
      submitData.append("location", formData.location.trim());
      submitData.append("event_info", formData.event_info.trim());
      submitData.append("term_condition", formData.term_condition.trim());
      submitData.append("start_date", formData.start_date);
      submitData.append("end_date", formData.end_date);
      submitData.append("user_id", user.id);
      submitData.append("_method", "PUT"); // Untuk Laravel form method spoofing

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      console.log("📤 Submitting event update...");
      console.log("📋 Update data:", {
        name: formData.name,
        organized_by: formData.organized_by,
        location: formData.location,
        event_info: formData.event_info.substring(0, 100) + "...",
        term_condition: formData.term_condition.substring(0, 100) + "...",
        start_date: formData.start_date,
        end_date: formData.end_date,
        user_id: user.id,
        has_new_image: !!formData.image,
      });

      // Submit to API dengan method PUT
      const response = await api.post(`/edit-event/${id}`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ API Update Response:", response.data);

      if (response.data.success) {
        setSuccess(true);

        // ========== UPDATE LOCALSTORAGE ==========
        const updatedEvent = {
          ...eventData,
          name: formData.name,
          organized_by: formData.organized_by,
          location: formData.location,
          event_info: formData.event_info,
          term_condition: formData.term_condition,
          start_date: formData.start_date,
          end_date: formData.end_date,
          updated_at: new Date().toISOString(),
          from_api: true,
          api_response: response.data,
        };

        // Update di localStorage
        const storedEvents = localStorage.getItem("user_created_events");
        if (storedEvents) {
          let events = JSON.parse(storedEvents);
          const eventIndex = events.findIndex((e) => e.id == id);

          if (eventIndex !== -1) {
            events[eventIndex] = updatedEvent;
            localStorage.setItem("user_created_events", JSON.stringify(events));
            console.log("🔄 Updated event in localStorage:", updatedEvent);
          }
        }

        // Simpan image jika ada
        if (imagePreview && imagePreview.length < 1000000) {
          localStorage.setItem(`event_image_${id}`, imagePreview);
          console.log("🖼️ Updated image in localStorage");
        }

        // Redirect setelah 2 detik
        setTimeout(() => {
          navigate("/organizer/events");
        }, 2000);
      } else {
        throw new Error(response.data.message || "Gagal mengupdate event");
      }
    } catch (error) {
      console.error("❌ Error updating event:", error);

      let errorMessage = "Terjadi kesalahan saat mengupdate event";

      if (error.response?.status === 401) {
        setError("Sesi Anda telah berakhir. Silakan login kembali.");
        setTimeout(() => {
          navigate("/auth/login");
        }, 2000);
      } else if (error.response?.status === 404) {
        setError("Event tidak ditemukan di server");
      } else if (error.response?.status === 422) {
        // Validation errors from Laravel
        const validationErrors = error.response.data.errors;
        const errorMessages = [];

        for (const field in validationErrors) {
          errorMessages.push(`${field}: ${validationErrors[field].join(", ")}`);
        }

        setError(`Validasi gagal: ${errorMessages.join("; ")}`);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.message) {
        setError(error.message);
      }

      // ========== FALLBACK: UPDATE LOCALSTORAGE MESKI API GAGAL ==========
      try {
        const updatedEvent = {
          ...eventData,
          name: formData.name,
          organized_by: formData.organized_by,
          location: formData.location,
          event_info: formData.event_info,
          term_condition: formData.term_condition,
          start_date: formData.start_date,
          end_date: formData.end_date,
          updated_at: new Date().toISOString(),
          from_api: false,
          api_error: error.message,
        };

        const storedEvents = localStorage.getItem("user_created_events");
        if (storedEvents) {
          let events = JSON.parse(storedEvents);
          const eventIndex = events.findIndex((e) => e.id == id);

          if (eventIndex !== -1) {
            events[eventIndex] = updatedEvent;
            localStorage.setItem("user_created_events", JSON.stringify(events));

            if (imagePreview && imagePreview.length < 1000000) {
              localStorage.setItem(`event_image_${id}`, imagePreview);
            }

            console.log(
              "🔄 Updated event in localStorage (fallback):",
              updatedEvent,
            );

            errorMessage += "\n\n✅ Perubahan telah disimpan secara lokal.";
          }
        }
      } catch (storageError) {
        console.error("❌ Error updating localStorage:", storageError);
      }

      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

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

    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const handleDeleteEvent = async () => {
    if (
      !window.confirm(
        "Apakah Anda yakin ingin menghapus event ini? Data peserta yang terkait juga akan dihapus.",
      )
    ) {
      return;
    }

    try {
      // Coba hapus dari API
      try {
        await api.delete(`/delete-event/${id}`);
      } catch (apiError) {
        console.log("⚠️ API delete failed, continuing with localStorage...");
      }

      // Hapus dari localStorage
      const storedEvents = localStorage.getItem("user_created_events");
      if (storedEvents) {
        let events = JSON.parse(storedEvents);
        events = events.filter((e) => e.id != id);
        localStorage.setItem("user_created_events", JSON.stringify(events));
      }

      // Hapus data terkait
      localStorage.removeItem(`event_participants_${id}`);
      localStorage.removeItem(`event_image_${id}`);

      // Update mapping
      const eventParticipantsMap = JSON.parse(
        localStorage.getItem("event_participants_map") || "{}",
      );
      delete eventParticipantsMap[id];
      localStorage.setItem(
        "event_participants_map",
        JSON.stringify(eventParticipantsMap),
      );

      alert("Event berhasil dihapus");
      navigate("/organizer/events");
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Gagal menghapus event: " + (error.message || ""));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Memuat data event...</p>
        </div>
      </div>
    );
  }

  if (!eventData && !loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate("/organizer/events")}
            className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6"
          >
            <ArrowLeft size={20} />
            <span>Kembali ke Daftar Event</span>
          </button>
        </div>
        <div className="text-center p-8 bg-gray-800/50 rounded-2xl border border-gray-700">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Event Tidak Ditemukan
          </h2>
          <p className="text-gray-400 mb-6">
            Event yang Anda cari tidak ditemukan atau telah dihapus.
          </p>
          <button
            onClick={() => navigate("/organizer/events")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium"
          >
            Kembali ke Daftar Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/organizer/events")}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft size={20} />
          <span>Kembali ke Daftar Event</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Edit Event</h1>
            <p className="text-gray-400">
              Edit detail event "{eventData?.name}"
            </p>
            {user && (
              <div className="mt-2 text-sm text-gray-500">
                Dibuat oleh: <span className="text-blue-400">{user.name}</span>{" "}
                (ID: {user.id})
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/organizer/events/${id}`)}
              className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors font-medium flex items-center gap-2"
            >
              <Eye size={16} />
              Lihat Detail
            </button>
            <button
              onClick={handleDeleteEvent}
              className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 transition-colors font-medium flex items-center gap-2"
            >
              <Trash2 size={16} />
              Hapus Event
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
        {error && !success && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <div className="flex items-start space-x-3">
              <AlertCircle
                size={20}
                className="text-red-400 flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="text-red-400 font-medium">
                  Gagal mengupdate event
                </p>
                <p className="text-red-300 text-sm mt-1 whitespace-pre-line">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

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
                  Event berhasil diupdate. Mengarahkan ke halaman event...
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nama Event *
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    size={20}
                  />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: Paskibra Championship 2024"
                    maxLength={200}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maksimal 200 karakter
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Diselenggarakan Oleh *
                </label>
                <div className="relative">
                  <Building
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    size={20}
                  />
                  <input
                    type="text"
                    name="organized_by"
                    value={formData.organized_by}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: Dinas Pendidikan Kota Cilegon"
                    maxLength={200}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maksimal 200 karakter
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Lokasi *
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-4 transform text-gray-500"
                  size={20}
                />
                <textarea
                  name="location"
                  value={formData.location}
                  onChange={handleTextAreaChange}
                  required
                  rows="3"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Contoh: Gedung Serba Guna, Jl. Merdeka No. 123, Cilegon, Banten"
                  maxLength={500}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formData.location.length}/500 karakter
              </p>
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
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    size={20}
                  />
                  <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tanggal Selesai *
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    size={20}
                  />
                  <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    required
                    min={formData.start_date}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
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
                  Deskripsi Event (event_info)
                </label>
                <div className="relative">
                  <Info
                    className="absolute left-3 top-4 transform text-gray-500"
                    size={20}
                  />
                  <textarea
                    name="event_info"
                    value={formData.event_info}
                    onChange={handleTextAreaChange}
                    rows="4"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Deskripsi lengkap tentang event, tujuan, kegiatan yang akan dilakukan, dll."
                    maxLength={2000}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.event_info.length}/2000 karakter
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Syarat & Ketentuan (term_condition)
                </label>
                <div className="relative">
                  <FileText
                    className="absolute left-3 top-4 transform text-gray-500"
                    size={20}
                  />
                  <textarea
                    name="term_condition"
                    value={formData.term_condition}
                    onChange={handleTextAreaChange}
                    rows="4"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Syarat dan ketentuan peserta, persyaratan pendaftaran, aturan lomba, dll."
                    maxLength={2000}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.term_condition.length}/2000 karakter
                </p>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-300 border-b border-gray-700 pb-2">
              Poster Event
            </h3>
            <div className="space-y-4">
              <div className="text-sm text-gray-400 mb-2">
                <p>Format yang didukung: JPG, JPEG, PNG, GIF</p>
                <p>Ukuran maksimal: 5MB</p>
                <p className="text-yellow-400">
                  Kosongkan jika tidak ingin mengganti gambar
                </p>
              </div>

              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif"
                onChange={handleImageChange}
                className="hidden"
                id="event-image-upload"
              />

              <div className="flex flex-col md:flex-row gap-6">
                {/* Upload Area */}
                <label
                  htmlFor="event-image-upload"
                  className="flex-1 cursor-pointer group"
                >
                  <div className="border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors h-full">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="p-4 rounded-xl bg-gray-900 group-hover:bg-gray-800 transition-colors">
                        <ImageIcon
                          size={32}
                          className="text-gray-400 group-hover:text-blue-400"
                        />
                      </div>
                      <div>
                        <p className="text-gray-300 font-medium">
                          {imagePreview || originalImage
                            ? "Klik untuk ganti gambar"
                            : "Klik untuk upload poster event"}
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, JPEG, GIF (max. 5MB)
                        </p>
                      </div>
                    </div>
                  </div>
                </label>

                {/* Preview */}
                {(imagePreview || originalImage) && (
                  <div className="flex-1">
                    <div className="rounded-2xl border border-gray-700 p-4 h-full">
                      <p className="text-sm text-gray-400 mb-3">Preview:</p>
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900">
                        <img
                          src={imagePreview || originalImage}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 p-2 rounded-lg bg-red-500/80 hover:bg-red-600 text-white"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      {formData.image && (
                        <p className="text-xs text-gray-400 mt-2 text-center">
                          {formData.image.name} (
                          {(formData.image.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                      {!formData.image && originalImage && (
                        <p className="text-xs text-gray-400 mt-2 text-center">
                          Gambar saat ini (disimpan di browser)
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hidden user_id field */}
          <input type="hidden" name="user_id" value={user?.id} />

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={() => navigate("/organizer/events")}
              className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors font-medium"
            >
              Batal
            </button>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  if (eventData) {
                    populateForm(eventData);
                    setImagePreview(originalImage);
                  }
                  setError("");
                }}
                className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors font-medium"
              >
                Reset Perubahan
              </button>

              <button
                type="submit"
                disabled={submitting || success}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white" />
                    <span>Mengupdate Event...</span>
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

      {/* Event Info */}
      {eventData && (
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-300 mb-2">
                Informasi Event:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-400">
                <div>
                  <p>
                    <strong>ID Event:</strong> {eventData.id}
                  </p>
                  <p>
                    <strong>Dibuat pada:</strong>{" "}
                    {new Date(eventData.created_at).toLocaleString("id-ID")}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {eventData.from_api ? "Dari API" : "Lokal"}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>User ID:</strong> {eventData.user_id}
                  </p>
                  <p>
                    <strong>Total Peserta:</strong>{" "}
                    {eventData.participants_count || 0}
                  </p>
                  {eventData.updated_at && (
                    <p>
                      <strong>Terakhir diupdate:</strong>{" "}
                      {new Date(eventData.updated_at).toLocaleString("id-ID")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default EditEvent;
