import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Hanya field yang diperlukan sesuai API
  const [formData, setFormData] = useState({
    name: "",
    organized_by: "",
    location: "",
    event_info: "", // Nama field sesuai backend
    term_condition: "",
    start_date: "",
    end_date: "",
    image: null, // Opsional
    user_id: user?.id || "", // Untuk referensi user pembuat
  });

  const [imagePreview, setImagePreview] = useState("");

  // Set user_id saat user data tersedia
  useEffect(() => {
    if (user?.id) {
      setFormData((prev) => ({
        ...prev,
        user_id: user.id,
      }));
    }
  }, [user]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check user authentication
    if (!user) {
      setError("Anda harus login untuk membuat event");
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

      // Hanya field yang diperlukan sesuai backend
      submitData.append("name", formData.name.trim());
      submitData.append("organized_by", formData.organized_by.trim());
      submitData.append("location", formData.location.trim());
      submitData.append("event_info", formData.event_info.trim());
      submitData.append("term_condition", formData.term_condition.trim());
      submitData.append("start_date", formData.start_date);
      submitData.append("end_date", formData.end_date);
      submitData.append("user_id", user.id); // Untuk tracking pembuat event

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      console.log("📤 Submitting event data...");
      console.log("📋 Required fields:", {
        name: formData.name,
        organized_by: formData.organized_by,
        location: formData.location,
        event_info: formData.event_info.substring(0, 100) + "...",
        term_condition: formData.term_condition.substring(0, 100) + "...",
        start_date: formData.start_date,
        end_date: formData.end_date,
        user_id: user.id,
        has_image: !!formData.image,
      });

      // Submit to API
      const response = await api.post("/create-event", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ API Response:", response.data);

      if (response.data.success) {
        const eventId = response.data.data?.id || response.data.data?.event_id;
        console.log("🎉 Event created successfully! Event ID:", eventId);
        setSuccess(true);

        // ========== SIMPAN KE LOCALSTORAGE DENGAN SISTEM PESERTA ==========
        if (eventId) {
          // Simpan event ID untuk auto-select di halaman peserta
          localStorage.setItem("last_created_event_id", eventId.toString());

          // Buat objek event untuk disimpan
          const newEvent = {
            id: eventId,
            name: formData.name,
            organized_by: formData.organized_by,
            location: formData.location,
            start_date: formData.start_date,
            end_date: formData.end_date,
            event_info: formData.event_info,
            term_condition: formData.term_condition,
            user_id: user.id,
            user_name: user.name,
            created_at: new Date().toISOString(),
            from_api: true,
            participants_count: 0, // Inisialisasi dengan 0 peserta
            api_response: response.data,
            // Field untuk tracking peserta
            participant_ids: [], // Array untuk menyimpan ID peserta
            total_participants: 0, // Jumlah total peserta
          };

          // Ambil existing events dari localStorage
          let existingEvents = [];
          try {
            const storedEvents = localStorage.getItem("user_created_events");
            if (storedEvents) {
              existingEvents = JSON.parse(storedEvents);
            }
          } catch (err) {
            console.error("Error parsing stored events:", err);
            existingEvents = [];
          }

          // Cek apakah event dengan ID yang sama sudah ada
          const existingIndex = existingEvents.findIndex(
            (e) => e.id == eventId,
          );
          if (existingIndex !== -1) {
            // Update event yang sudah ada
            existingEvents[existingIndex] = {
              ...existingEvents[existingIndex],
              ...newEvent,
              // Pertahankan data peserta yang sudah ada
              participant_ids:
                existingEvents[existingIndex].participant_ids || [],
              total_participants:
                existingEvents[existingIndex].total_participants || 0,
            };
            console.log("🔄 Updated existing event in localStorage");
          } else {
            // Tambahkan event baru
            existingEvents.push(newEvent);
            console.log("➕ Added new event to localStorage");
          }

          // Simpan kembali ke localStorage
          localStorage.setItem(
            "user_created_events",
            JSON.stringify(existingEvents),
          );

          // Simpan sebagai event data terbaru
          localStorage.setItem(
            "last_created_event_data",
            JSON.stringify(newEvent),
          );

          // ========== INISIALISASI SISTEM PESERTA ==========
          // Buat array kosong untuk peserta event ini
          localStorage.setItem(
            `event_participants_${eventId}`,
            JSON.stringify([]),
          );

          // Tambahkan ke daftar mapping event-peserta
          const eventParticipantsMap = JSON.parse(
            localStorage.getItem("event_participants_map") || "{}",
          );
          eventParticipantsMap[eventId] = [];
          localStorage.setItem(
            "event_participants_map",
            JSON.stringify(eventParticipantsMap),
          );

          console.log(
            "💾 Event saved to localStorage with participant system:",
            {
              total_events: existingEvents.length,
              event_id: eventId,
              participant_storage_key: `event_participants_${eventId}`,
            },
          );

          // ========== SIMPAN IMAGE PREVIEW ==========
          if (imagePreview) {
            try {
              // Simpan image preview ke localStorage
              if (imagePreview.length < 1000000) {
                // 1MB limit
                localStorage.setItem(`event_image_${eventId}`, imagePreview);
                console.log("🖼️ Saved image preview to localStorage");
              } else {
                console.log("⚠️ Image too large for localStorage, skipping");
              }
            } catch (err) {
              console.error("Error saving image to localStorage:", err);
            }
          }

          // ========== UPDATE STATISTIK PESERTA ==========
          // Inisialisasi statistik peserta jika belum ada
          const participantStats = JSON.parse(
            localStorage.getItem("participant_stats") || "{}",
          );
          participantStats[eventId] = {
            event_name: formData.name,
            total_participants: 0,
            last_updated: new Date().toISOString(),
          };
          localStorage.setItem(
            "participant_stats",
            JSON.stringify(participantStats),
          );
        }

        // Reset form setelah berhasil
        setTimeout(() => {
          setFormData({
            name: "",
            organized_by: "",
            location: "",
            event_info: "",
            term_condition: "",
            start_date: "",
            end_date: "",
            image: null,
            user_id: user.id,
          });
          setImagePreview("");

          // Navigasi ke halaman events setelah 2 detik
          setTimeout(() => {
            navigate("/organizer/events");
          }, 2000);
        }, 1500);
      } else {
        throw new Error(response.data.message || "Gagal membuat event");
      }
    } catch (error) {
      console.error("❌ Error creating event:", error);

      // Handle specific error cases
      if (error.response?.status === 401) {
        setError("Sesi Anda telah berakhir. Silakan login kembali.");
        setTimeout(() => {
          navigate("/auth/login");
        }, 2000);
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
      } else {
        setError("Terjadi kesalahan saat membuat event. Silakan coba lagi.");
      }

      // ========== FALLBACK: SIMPAN KE LOCALSTORAGE MESKI API GAGAL ==========
      const fallbackEventId = Date.now();
      const fallbackEvent = {
        id: fallbackEventId,
        name: formData.name,
        organized_by: formData.organized_by,
        location: formData.location,
        start_date: formData.start_date,
        end_date: formData.end_date,
        event_info: formData.event_info,
        term_condition: formData.term_condition,
        user_id: user.id,
        user_name: user.name,
        created_at: new Date().toISOString(),
        from_api: false,
        participants_count: 0,
        participant_ids: [],
        total_participants: 0,
        api_error: error.message,
      };

      try {
        // Ambil existing events dari localStorage
        let existingEvents = [];
        try {
          const storedEvents = localStorage.getItem("user_created_events");
          if (storedEvents) {
            existingEvents = JSON.parse(storedEvents);
          }
        } catch (err) {
          console.error("Error parsing stored events:", err);
          existingEvents = [];
        }

        // Tambahkan event fallback
        existingEvents.push(fallbackEvent);

        // Simpan ke localStorage
        localStorage.setItem(
          "user_created_events",
          JSON.stringify(existingEvents),
        );
        localStorage.setItem(
          "last_created_event_id",
          fallbackEventId.toString(),
        );
        localStorage.setItem(
          "last_created_event_data",
          JSON.stringify(fallbackEvent),
        );

        // Inisialisasi sistem peserta untuk fallback event
        localStorage.setItem(
          `event_participants_${fallbackEventId}`,
          JSON.stringify([]),
        );

        // Update mapping event-peserta
        const eventParticipantsMap = JSON.parse(
          localStorage.getItem("event_participants_map") || "{}",
        );
        eventParticipantsMap[fallbackEventId] = [];
        localStorage.setItem(
          "event_participants_map",
          JSON.stringify(eventParticipantsMap),
        );

        // Update statistik peserta
        const participantStats = JSON.parse(
          localStorage.getItem("participant_stats") || "{}",
        );
        participantStats[fallbackEventId] = {
          event_name: formData.name,
          total_participants: 0,
          last_updated: new Date().toISOString(),
        };
        localStorage.setItem(
          "participant_stats",
          JSON.stringify(participantStats),
        );

        console.log(
          "🔄 Saved fallback event to localStorage with participant system:",
          {
            event_id: fallbackEventId,
            event_name: formData.name,
            storage_key: `event_participants_${fallbackEventId}`,
          },
        );

        // Simpan image preview jika ada
        if (imagePreview && imagePreview.length < 1000000) {
          try {
            localStorage.setItem(
              `event_image_${fallbackEventId}`,
              imagePreview,
            );
          } catch (err) {
            console.error("Error saving fallback image:", err);
          }
        }

        // Pesan error dengan info bahwa event tetap disimpan
        const fallbackMessage =
          error.message +
          "\n\n✅ Event telah disimpan secara lokal." +
          "\n\nAnda dapat:" +
          "\n• Menambahkan peserta ke event ini" +
          "\n• Mengelola event dari halaman events" +
          "\n• Data akan tetap tersimpan di browser Anda";

        setError(fallbackMessage);
      } catch (storageError) {
        console.error("❌ Error saving to localStorage:", storageError);
        setError(
          `${error.message}\n\n⚠️ Juga gagal menyimpan ke penyimpanan lokal.`,
        );
      }
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

    // Clear error saat user mulai mengetik
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Memuat...</p>
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

        <div>
          <h1 className="text-3xl font-bold mb-2">Buat Event Baru</h1>
          <p className="text-gray-400">
            Buat event Paskibra Championship baru untuk diikuti peserta
          </p>
          {user && (
            <div className="mt-2 text-sm text-gray-500">
              Dibuat oleh: <span className="text-blue-400">{user.name}</span>{" "}
              (ID: {user.id})
            </div>
          )}
        </div>
      </div>

      {/* Jika user tidak login */}
      {!user && (
        <div className="mb-6 p-6 rounded-xl bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle size={24} className="text-red-400" />
            <h3 className="text-lg font-bold text-red-400">Akses Ditolak</h3>
          </div>
          <p className="text-gray-300 mb-4">
            Anda harus login untuk membuat event.
          </p>
          <button
            onClick={() => navigate("/auth/login")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium"
          >
            Login Sekarang
          </button>
        </div>
      )}

      {/* Konten form hanya ditampilkan jika user login */}
      {user && (
        <>
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
                      Gagal membuat event
                    </p>
                    <p className="text-red-300 text-sm mt-1">{error}</p>
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
                      Event berhasil dibuat. Mengarahkan ke halaman event...
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
                        min={new Date().toISOString().split("T")[0]}
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
                        min={
                          formData.start_date ||
                          new Date().toISOString().split("T")[0]
                        }
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
                  Poster Event (Opsional)
                </h3>
                <div className="space-y-4">
                  <div className="text-sm text-gray-400 mb-2">
                    <p>Format yang didukung: JPG, JPEG, PNG, GIF</p>
                    <p>Ukuran maksimal: 5MB</p>
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
                              Klik untuk upload poster event
                            </p>
                            <p className="text-sm text-gray-500">
                              PNG, JPG, JPEG, GIF (max. 5MB)
                            </p>
                          </div>
                        </div>
                      </div>
                    </label>

                    {/* Preview */}
                    {imagePreview && (
                      <div className="flex-1">
                        <div className="rounded-2xl border border-gray-700 p-4 h-full">
                          <p className="text-sm text-gray-400 mb-3">Preview:</p>
                          <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setImagePreview("");
                                setFormData((prev) => ({
                                  ...prev,
                                  image: null,
                                }));
                              }}
                              className="absolute top-2 right-2 p-2 rounded-lg bg-red-500/80 hover:bg-red-600 text-white"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          {formData.image && (
                            <p className="text-xs text-gray-400 mt-2 text-center">
                              {formData.image.name} (
                              {(formData.image.size / 1024 / 1024).toFixed(2)}{" "}
                              MB)
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Hidden user_id field */}
              <input type="hidden" name="user_id" value={user.id} />

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
                      setFormData({
                        name: "",
                        organized_by: "",
                        location: "",
                        event_info: "",
                        term_condition: "",
                        start_date: "",
                        end_date: "",
                        image: null,
                        user_id: user.id,
                      });
                      setImagePreview("");
                      setError("");
                    }}
                    className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors font-medium"
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

          {/* Field Information */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-300 mb-2">
                  Field yang dibutuhkan oleh backend:
                </h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>
                    • <strong>name</strong>: Nama event (required)
                  </li>
                  <li>
                    • <strong>organized_by</strong>: Penyelenggara (required)
                  </li>
                  <li>
                    • <strong>location</strong>: Lokasi (required)
                  </li>
                  <li>
                    • <strong>event_info</strong>: Deskripsi event
                  </li>
                  <li>
                    • <strong>term_condition</strong>: Syarat & ketentuan
                  </li>
                  <li>
                    • <strong>start_date</strong>: Tanggal mulai (required)
                  </li>
                  <li>
                    • <strong>end_date</strong>: Tanggal selesai (required)
                  </li>
                  <li>
                    • <strong>image</strong>: Poster event (optional)
                  </li>
                  <li>
                    • <strong>user_id</strong>: ID pembuat (auto from auth)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default CreateEvent;
