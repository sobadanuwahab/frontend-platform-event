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

  const [formData, setFormData] = useState({
    name: "",
    organized_by: "",
    location: "",
    event_info: "",
    term_condition: "",
    start_date: "",
    end_date: "",
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

  /* ================= HANDLE IMAGE CHANGE ================= */
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

  /* ================= HANDLE SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

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

      // ========== PREPARE FORM DATA ==========
      const submitData = new FormData();

      // Tambahkan semua field teks
      submitData.append("name", formData.name.trim());
      submitData.append("organized_by", formData.organized_by.trim());
      submitData.append("location", formData.location.trim());
      submitData.append("event_info", formData.event_info.trim());
      submitData.append("term_condition", formData.term_condition.trim());
      submitData.append("start_date", formData.start_date);
      submitData.append("end_date", formData.end_date);
      submitData.append("user_id", user.id.toString());

      // DEBUG: Log data sebelum dikirim
      console.log("📤 Submitting event data to /create-event endpoint...");
      console.log("📋 Form data:", {
        name: formData.name,
        organized_by: formData.organized_by,
        location: formData.location,
        event_info: formData.event_info.substring(0, 100) + "...",
        term_condition: formData.term_condition.substring(0, 100) + "...",
        start_date: formData.start_date,
        end_date: formData.end_date,
        user_id: user.id,
      });

      // ========== HANDLE IMAGE UPLOAD ==========
      if (formData.image) {
        console.log("🖼️ Image file details:", {
          name: formData.image.name,
          type: formData.image.type,
          size: formData.image.size,
        });

        // Append image dengan field name "image" (sesuai dengan backend Laravel)
        submitData.append("image", formData.image);

        console.log("✅ Image appended to FormData");
      } else {
        console.log("📸 No image selected for upload");
      }

      // DEBUG: Log FormData content
      console.log("📦 FormData entries:");
      for (let pair of submitData.entries()) {
        if (pair[0] === "image") {
          console.log(
            `  ${pair[0]}:`,
            pair[1].name,
            `(${pair[1].type}, ${pair[1].size} bytes)`,
          );
        } else {
          console.log(`  ${pair[0]}:`, pair[1]);
        }
      }

      // ========== SEND TO API ==========
      console.log("🚀 Sending POST request to: /create-event");

      const response = await api.post("/create-event", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 seconds
      });

      console.log("✅ API Response:", response.data);

      if (response.data.success) {
        const eventId = response.data.data?.id || response.data.data?.event_id;
        console.log("🎉 Event created successfully! Event ID:", eventId);

        // DEBUG: Cek data gambar dari response
        if (response.data.data?.image_url) {
          console.log("🖼️ Image uploaded successfully!");
          console.log(
            "📁 Image path in database:",
            response.data.data.image_url,
          );
          console.log(
            "🔗 Full image URL:",
            `https://apipaskibra.my.id/storage/${response.data.data.image_url}`,
          );

          // Test load image untuk memastikan bisa diakses
          const img = new Image();
          img.onload = () => console.log("✅ Image is accessible from server");
          img.onerror = () => console.warn("⚠️ Image may not be accessible");
          img.src = `https://apipaskibra.my.id/storage/${response.data.data.image_url}`;
        } else if (response.data.data?.image) {
          console.log("🖼️ Image data from API:", response.data.data.image);
        } else {
          console.log("ℹ️ No image data in response");
        }

        setSuccess(true);

        // ========== SIMPAN KE LOCALSTORAGE ==========
        if (eventId) {
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
            participants_count: 0,
            // Simpan image info dari response
            image_url: response.data.data?.image_url || null,
            image: response.data.data?.image || null,
            api_response: response.data,
            session_user_id: user.id,
            session_created: new Date().toISOString(),
          };

          // Update localStorage
          let existingEvents = [];
          try {
            const storedEvents = localStorage.getItem("user_created_events");
            if (storedEvents) {
              existingEvents = JSON.parse(storedEvents);
            }
          } catch (err) {
            console.error("Error parsing stored events:", err);
          }

          // Tambahkan atau update event
          const existingIndex = existingEvents.findIndex(
            (e) => e.id == eventId,
          );
          if (existingIndex !== -1) {
            existingEvents[existingIndex] = newEvent;
          } else {
            existingEvents.push(newEvent);
          }

          localStorage.setItem(
            "user_created_events",
            JSON.stringify(existingEvents),
          );

          // Simpan image preview ke localStorage sebagai fallback
          if (imagePreview) {
            try {
              if (imagePreview.length < 1000000) {
                localStorage.setItem(`event_image_${eventId}`, imagePreview);
                console.log(
                  "🖼️ Saved image preview to localStorage as fallback",
                );
              }
            } catch (err) {
              console.error("Error saving image to localStorage:", err);
            }
          }

          // Inisialisasi sistem peserta
          localStorage.setItem(
            `event_participants_${eventId}`,
            JSON.stringify([]),
          );

          const eventParticipantsMap = JSON.parse(
            localStorage.getItem("event_participants_map") || "{}",
          );
          eventParticipantsMap[eventId] = [];
          localStorage.setItem(
            "event_participants_map",
            JSON.stringify(eventParticipantsMap),
          );

          console.log("💾 Event saved to localStorage with ID:", eventId);
        }

        // Reset form dan redirect
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

          setTimeout(() => {
            navigate("/organizer/events");
          }, 2000);
        }, 1500);
      } else {
        throw new Error(response.data.message || "Gagal membuat event");
      }
    } catch (error) {
      console.error("❌ Error creating event:", error);
      console.error("❌ Error details:", error.response?.data);

      let errorMessage = "Terjadi kesalahan saat membuat event";

      if (error.response?.status === 401) {
        errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
        setTimeout(() => {
          navigate("/auth/login");
        }, 2000);
      } else if (error.response?.status === 413) {
        errorMessage = "File gambar terlalu besar. Maksimal 5MB.";
      } else if (error.response?.status === 422) {
        // Validation errors from Laravel
        const validationErrors = error.response.data.errors;
        const errorMessages = [];

        for (const field in validationErrors) {
          errorMessages.push(`${field}: ${validationErrors[field].join(", ")}`);
        }

        errorMessage = `Validasi gagal: ${errorMessages.join("; ")}`;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage =
          "Terjadi kesalahan saat membuat event. Silakan coba lagi.";
      }

      // ========== FALLBACK: SIMPAN KE LOCALSTORAGE ==========
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
        api_error: error.message,
      };

      try {
        let existingEvents = [];
        try {
          const storedEvents = localStorage.getItem("user_created_events");
          if (storedEvents) {
            existingEvents = JSON.parse(storedEvents);
          }
        } catch (err) {
          console.error("Error parsing stored events:", err);
        }

        existingEvents.push(fallbackEvent);
        localStorage.setItem(
          "user_created_events",
          JSON.stringify(existingEvents),
        );

        // Inisialisasi sistem peserta
        localStorage.setItem(
          `event_participants_${fallbackEventId}`,
          JSON.stringify([]),
        );

        const eventParticipantsMap = JSON.parse(
          localStorage.getItem("event_participants_map") || "{}",
        );
        eventParticipantsMap[fallbackEventId] = [];
        localStorage.setItem(
          "event_participants_map",
          JSON.stringify(eventParticipantsMap),
        );

        // Simpan image preview jika ada
        if (imagePreview && imagePreview.length < 1000000) {
          try {
            localStorage.setItem(
              `event_image_${fallbackEventId}`,
              imagePreview,
            );
            console.log(
              "🖼️ Saved image preview to localStorage for fallback event",
            );
          } catch (err) {
            console.error("Error saving fallback image:", err);
          }
        }

        console.log(
          "💾 Fallback event saved to localStorage with ID:",
          fallbackEventId,
        );

        // Tambahkan pesan info
        errorMessage += "\n\n✅ Event telah disimpan secara lokal.";
        errorMessage += "\n\nAnda dapat:";
        errorMessage += "\n• Menambahkan peserta ke event ini";
        errorMessage += "\n• Mengelola event dari halaman events";
        errorMessage += "\n• Data akan tetap tersimpan di browser Anda";
      } catch (storageError) {
        console.error("❌ Error saving to localStorage:", storageError);
        errorMessage += "\n\n⚠️ Juga gagal menyimpan ke penyimpanan lokal.";
      }

      setError(errorMessage);
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
                        disabled={submitting}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
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
                        disabled={submitting}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
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
                      disabled={submitting}
                      rows="3"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
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
                        disabled={submitting}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
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
                        disabled={submitting}
                        min={
                          formData.start_date ||
                          new Date().toISOString().split("T")[0]
                        }
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
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
                        disabled={submitting}
                        rows="4"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
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
                        disabled={submitting}
                        rows="4"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
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
                    <p className="text-yellow-400">
                      Gambar akan disimpan di server dan dapat diakses melalui
                      URL
                    </p>
                  </div>

                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={handleImageChange}
                    className="hidden"
                    id="event-image-upload"
                    disabled={submitting}
                  />

                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Upload Area */}
                    <label
                      htmlFor="event-image-upload"
                      className={`flex-1 cursor-pointer group ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
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
                            {formData.image && (
                              <p className="text-xs text-green-400 mt-1">
                                ✓ File dipilih: {formData.image.name}
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
                          <p className="text-sm text-gray-400 mb-3">Preview:</p>
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

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => navigate("/organizer/events")}
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
                        start_date: "",
                        end_date: "",
                        image: null,
                        user_id: user.id,
                      });
                      setImagePreview("");
                      setError("");
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
                  Informasi API Endpoint:
                </h4>
                <div className="text-sm text-gray-400 space-y-2">
                  <p>
                    • <strong>Endpoint:</strong>{" "}
                    <code>POST /api/create-event</code>
                  </p>
                  <p>
                    • <strong>Content-Type:</strong>{" "}
                    <code>multipart/form-data</code>
                  </p>
                  <p>
                    • <strong>Required fields:</strong> name, organized_by,
                    location, start_date, end_date, user_id
                  </p>
                  <p>
                    • <strong>Optional field:</strong> image (gambar poster
                    event)
                  </p>
                  <p>
                    • <strong>Image field name:</strong> <code>image</code>
                  </p>
                  <div className="mt-3 text-xs text-gray-500">
                    <p>
                      <strong>Current User ID:</strong> {user.id}
                    </p>
                    <p>
                      <strong>Image selected:</strong>{" "}
                      {formData.image ? "Yes" : "No"}
                    </p>
                    {formData.image && (
                      <p>
                        <strong>Image details:</strong> {formData.image.name} (
                        {(formData.image.size / 1024).toFixed(2)} KB)
                      </p>
                    )}
                  </div>
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
