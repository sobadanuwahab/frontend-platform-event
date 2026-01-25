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
  Calendar,
  Award,
  Image as ImageIcon,
  ArrowLeft,
  Loader,
  Key,
  CalendarOff,
} from "lucide-react";
import axios from "axios";

const CreateParticipant = () => {
  const API_URL = "https://apipaskibra.my.id/api";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsReady, setEventsReady] = useState(false); // Flag untuk cek apakah events API siap
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [apiToken, setApiToken] = useState("");

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);

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

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setApiToken(token);
      // Hanya fetch categories dulu, events di-hold
      fetchCategories(token);
      // Coba fetch events setelah delay, tapi handle error dengan baik
      setTimeout(() => {
        fetchEvents(token);
      }, 1000);
    } else {
      setError("Token tidak ditemukan. Silakan login kembali.");
      setLoading(false);
      setLoadingEvents(false);
      setLoadingCategories(false);
    }
  }, []);

  // Fungsi untuk check token validity
  const checkToken = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Token tidak ditemukan. Silakan login kembali.");
      return null;
    }

    // Basic token validation
    if (token.length < 10) {
      setError("Token tidak valid. Silakan login kembali.");
      return null;
    }

    return token;
  };

  const fetchEvents = async (token) => {
    setLoadingEvents(true);
    try {
      //   console.log("📡 Fetching events from:", `${API_URL}/events`);

      const response = await axios.get(`${API_URL}/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        timeout: 5000, // Timeout lebih pendek untuk events
      });

      //   console.log("✅ Events API Response:", response.data);

      let eventsData = [];
      if (response.data.success) {
        if (response.data.data && Array.isArray(response.data.data)) {
          eventsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          eventsData = response.data;
        }
        // console.log(`📋 Found ${eventsData.length} events`);
        setEventsReady(true);
      } else {
        // console.log("⚠️ Events API returned success: false");
        // Jangan throw error, tapi set flag dan gunakan fallback
        setEventsReady(false);
      }

      setEvents(eventsData);
    } catch (error) {
      //   console.log("ℹ️ Events API not ready or unavailable");
      //   console.log("Event fetch error:", {
      //     message: error.message,
      //     status: error.response?.status,
      //     code: error.code,
      //   });

      // Tidak set error, hanya log saja dan gunakan fallback
      // Tetap set eventsReady ke false
      setEventsReady(false);

      // Gunakan fallback events untuk development/production
      const fallbackEvents = [
        { id: 1, name: "Event Paskibra SMAN 1 Cilegon" },
        { id: 2, name: "Event Paskibra Jawa Barat" },
        { id: 3, name: "Event Paskibra Nasional" },
      ];

      setEvents(fallbackEvents);
      //   console.log("🔄 Using fallback events");
    } finally {
      setLoadingEvents(false);
      if (!loadingCategories) {
        setLoading(false);
      }
    }
  };

  const fetchCategories = async (token) => {
    setLoadingCategories(true);
    try {
      //   console.log(
      //     "📡 Fetching categories from:",
      //     `${API_URL}/participant-categories`,
      //   );
      //   console.log(
      //     "🔑 Using token:",
      //     token ? `${token.substring(0, 20)}...` : "No token",
      //   );

      const response = await axios.get(`${API_URL}/participant-categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        timeout: 10000,
      });

      //   console.log("✅ Categories API Response:", response.data);

      // Debug log untuk melihat struktur response
      //   console.log("📊 Response structure:", {
      //     success: response.data.success,
      //     message: response.data.message,
      //     data: response.data.data ? "Exists" : "Not exists",
      //     dataType: typeof response.data.data,
      //     isArray: Array.isArray(response.data.data),
      //   });

      let categoriesData = [];
      if (response.data.success) {
        if (response.data.data && Array.isArray(response.data.data)) {
          categoriesData = response.data.data;
          //   console.log(`📋 Found ${categoriesData.length} categories`);
        } else if (
          response.data.data &&
          typeof response.data.data === "object"
        ) {
          // Jika data adalah object, convert ke array
          categoriesData = Object.values(response.data.data);
          //   console.log(
          //     `📋 Converted ${categoriesData.length} categories from object`,
          //   );
        } else if (Array.isArray(response.data)) {
          categoriesData = response.data;
        } else {
          // Coba akses langsung dari response.data jika struktur berbeda
          //   console.log("🔍 Checking alternative response structures...");
          if (
            response.data.categories &&
            Array.isArray(response.data.categories)
          ) {
            categoriesData = response.data.categories;
          } else if (
            response.data.result &&
            Array.isArray(response.data.result)
          ) {
            categoriesData = response.data.result;
          }
        }
      } else {
        throw new Error(response.data.message || "Failed to fetch categories");
      }

      //   console.log("🎯 Processed Categories:", categoriesData);
      setCategories(categoriesData);
    } catch (error) {
      //   console.error("❌ Error fetching categories:", error);
      //   console.error("Error details:", {
      //     message: error.message,
      //     response: error.response?.data,
      //     status: error.response?.status,
      //     url: error.config?.url,
      //     headers: error.config?.headers,
      //   });

      // Fallback for development/production
      //   console.log("🔄 Loading fallback categories");
      const fallbackCategories = [
        { id: 1, name: "SMP", description: "Sekolah Menengah Pertama" },
        { id: 2, name: "SMA", description: "Sekolah Menengah Atas" },
        { id: 3, name: "SMK", description: "Sekolah Menengah Kejuruan" },
        { id: 4, name: "Umum", description: "Peserta Umum" },
      ];

      setCategories(fallbackCategories);
      setError("Kategori berhasil dimuat (menggunakan data sementara)");
    } finally {
      setLoadingCategories(false);
      if (!loadingEvents) {
        setLoading(false);
      }
    }
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
      setError(""); // Clear error jika ada

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

    // Check token sebelum submit
    const token = checkToken();
    if (!token) {
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Validation
      const errors = [];

      if (!formData.school_name.trim()) {
        errors.push("Nama sekolah wajib diisi");
      }
      if (!formData.event_id) {
        errors.push("Event wajib dipilih");
      }
      if (!formData.participant_category_id) {
        errors.push("Kategori peserta wajib dipilih");
      }

      if (errors.length > 0) {
        throw new Error(errors.join(", "));
      }

      // Validasi nomor WhatsApp
      if (
        formData.coach_whatsapp &&
        !/^[0-9+\-\s()]+$/.test(formData.coach_whatsapp)
      ) {
        throw new Error(
          "Nomor WhatsApp hanya boleh berisi angka dan simbol +-()",
        );
      }

      // Prepare form data for multipart upload
      const submitData = new FormData();
      submitData.append("school_name", formData.school_name.trim());
      submitData.append("school_address", formData.school_address.trim());
      submitData.append("coach", formData.coach.trim());

      if (formData.coach_whatsapp) {
        submitData.append("coach_whatsapp", formData.coach_whatsapp.trim());
      }

      submitData.append("event_id", formData.event_id);
      submitData.append(
        "participant_category_id",
        formData.participant_category_id,
      );

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      // Debug: Log data yang akan dikirim
      //   console.log("📤 Submitting form data:");
      for (let [key, value] of submitData.entries()) {
        // console.log(`  ${key}:`, key === "image" ? "FILE" : value);
      }

      // Submit to API
      //   console.log(
      //     "🔐 Using token for submission:",
      //     token.substring(0, 20) + "...",
      //   );

      const response = await axios.post(`${API_URL}/participants`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        timeout: 30000, // 30 detik timeout
      });

      //   console.log("✅ API Response:", response.data);

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/organizer/participants");
        }, 2000);
      } else {
        throw new Error(response.data.message || "Gagal menambahkan peserta");
      }
    } catch (error) {
      console.error("❌ Error submitting form:", error);

      // Handle specific error cases
      if (error.response?.status === 401) {
        setError("Sesi Anda telah berakhir. Silakan login kembali.");
        localStorage.removeItem("access_token");
        setTimeout(() => {
          navigate("/login");
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
        setError("Terjadi kesalahan saat mengirim data. Silakan coba lagi.");
      }

      // Log error details untuk debugging
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
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

  const handleRetryEvents = () => {
    const token = checkToken();
    if (token) {
      setError("");
      fetchEvents(token);
    }
  };

  if (loading && (!error || apiToken)) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/organizer/participants")}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft size={20} />
          <span>Kembali ke Daftar Peserta</span>
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tambah Peserta Baru</h1>
            <p className="text-gray-400">
              Daftarkan sekolah baru untuk mengikuti event Paskibra Championship
            </p>
          </div>

          {/* Token info */}
          {apiToken && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Key size={14} />
              <span>Token: {apiToken.substring(0, 10)}...</span>
            </div>
          )}
        </div>
      </div>

      {/* Jika tidak ada token */}
      {!apiToken && (
        <div className="mb-6 p-6 rounded-xl bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle size={24} className="text-red-400" />
            <h3 className="text-lg font-bold text-red-400">Akses Ditolak</h3>
          </div>
          <p className="text-gray-300 mb-4">
            Anda tidak memiliki akses. Silakan login terlebih dahulu.
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium">
            Login Sekarang
          </button>
        </div>
      )}

      {/* Status Events API */}
      {apiToken && !eventsReady && (
        <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <CalendarOff size={20} className="text-yellow-400 mt-0.5" />
              <div>
                <p className="text-yellow-400 font-medium">
                  Events API Sedang Dipersiapkan
                </p>
                <p className="text-yellow-300 text-sm mt-1">
                  Menggunakan data events sementara. Anda tetap dapat
                  menambahkan peserta.
                  {loadingEvents && " (Memuat events...)"}
                </p>
              </div>
            </div>
            <button
              onClick={handleRetryEvents}
              disabled={loadingEvents}
              className="px-4 py-2 text-sm rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {loadingEvents ? (
                <>
                  <Loader className="animate-spin h-3 w-3" />
                  <span>Memuat...</span>
                </>
              ) : (
                "Coba Lagi"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Error fetching data (selain events) */}
      {apiToken && error && !success && !error.includes("Events API") && (
        <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-start space-x-3">
            <AlertCircle size={20} className="text-yellow-400 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-medium">Perhatian</p>
              <p className="text-yellow-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Konten form hanya ditampilkan jika ada token */}
      {apiToken && (
        <>
          {/* Form */}
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
            {error &&
              !success &&
              error.includes("Gagal menambahkan peserta") && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <div className="flex items-start space-x-3">
                    <AlertCircle
                      size={20}
                      className="text-red-400 flex-shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="text-red-400 font-medium">
                        Gagal menambahkan peserta
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
                      Peserta berhasil ditambahkan. Mengarahkan ke halaman
                      peserta...
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* School Information */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-gray-300 border-b border-gray-700 pb-2">
                  Informasi Sekolah
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nama Sekolah *
                    </label>
                    <div className="relative">
                      <School
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        size={20}
                      />
                      <input
                        type="text"
                        name="school_name"
                        value={formData.school_name}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contoh: SMAN 3 Cilegon"
                        maxLength={100}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Maksimal 100 karakter
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Alamat Sekolah
                    </label>
                    <div className="relative">
                      <MapPin
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        size={20}
                      />
                      <input
                        type="text"
                        name="school_address"
                        value={formData.school_address}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contoh: Cilegon Mancak, Banten"
                        maxLength={200}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Maksimal 200 karakter
                    </p>
                  </div>
                </div>
              </div>

              {/* Event & Category Selection */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-gray-300 border-b border-gray-700 pb-2">
                  Event & Kategori
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Event *
                    </label>
                    <div className="relative">
                      <Calendar
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        size={20}
                      />
                      <select
                        name="event_id"
                        value={formData.event_id}
                        onChange={handleChange}
                        required
                        disabled={events.length === 0}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none disabled:opacity-50 disabled:cursor-not-allowed">
                        <option value="">
                          {events.length === 0
                            ? "Memuat event..."
                            : "Pilih Event"}
                        </option>
                        {events.map((event) => (
                          <option key={event.id} value={event.id}>
                            {event.name}
                            {!eventsReady && " (Sementara)"}
                          </option>
                        ))}
                      </select>
                      {events.length === 0 && !loadingEvents && (
                        <div className="flex items-center mt-2 text-sm text-yellow-500">
                          <AlertCircle className="h-3 w-3 mr-2" />
                          <span>Tidak ada event tersedia</span>
                        </div>
                      )}
                      {!eventsReady && events.length > 0 && (
                        <div className="flex items-center mt-2 text-sm text-blue-500">
                          <CalendarOff className="h-3 w-3 mr-2" />
                          <span>Menggunakan data events sementara</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Kategori Peserta *
                    </label>
                    <div className="relative">
                      <Award
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        size={20}
                      />
                      <select
                        name="participant_category_id"
                        value={formData.participant_category_id}
                        onChange={handleChange}
                        required
                        disabled={loadingCategories || categories.length === 0}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none disabled:opacity-50 disabled:cursor-not-allowed">
                        <option value="">
                          {loadingCategories
                            ? "Memuat kategori..."
                            : categories.length === 0
                              ? "Tidak ada kategori"
                              : "Pilih Kategori"}
                        </option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                            {category.description
                              ? ` - ${category.description}`
                              : ""}
                          </option>
                        ))}
                      </select>
                      {loadingCategories && (
                        <div className="flex items-center mt-2 text-sm text-blue-500">
                          <Loader className="animate-spin h-3 w-3 mr-2" />
                          <span>Memuat kategori peserta...</span>
                        </div>
                      )}
                      {!loadingCategories && categories.length === 0 && (
                        <div className="flex items-center mt-2 text-sm text-yellow-500">
                          <AlertCircle className="h-3 w-3 mr-2" />
                          <span>Tidak ada kategori tersedia</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Coach Information */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-gray-300 border-b border-gray-700 pb-2">
                  Informasi Coach
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nama Coach
                    </label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        size={20}
                      />
                      <input
                        type="text"
                        name="coach"
                        value={formData.coach}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contoh: Udin Coach"
                        maxLength={50}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Maksimal 50 karakter
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nomor WhatsApp Coach
                    </label>
                    <div className="relative">
                      <Phone
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        size={20}
                      />
                      <input
                        type="tel"
                        name="coach_whatsapp"
                        value={formData.coach_whatsapp}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contoh: 081278523645"
                        pattern="[0-9+\-\s()]*"
                        maxLength={20}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Contoh: 081234567890 atau +6281234567890
                    </p>
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-gray-300 border-b border-gray-700 pb-2">
                  Foto Sekolah (Opsional)
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
                    id="image-upload"
                  />

                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Upload Area */}
                    <label
                      htmlFor="image-upload"
                      className="flex-1 cursor-pointer group">
                      <div className="border-2 border-dashed border-gray-700 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors h-full">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="p-4 rounded-xl bg-gray-900 group-hover:bg-gray-800 transition-colors">
                            <Upload
                              size={32}
                              className="text-gray-400 group-hover:text-blue-400"
                            />
                          </div>
                          <div>
                            <p className="text-gray-300 font-medium">
                              Klik untuk upload foto
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
                              className="absolute top-2 right-2 p-2 rounded-lg bg-red-500/80 hover:bg-red-600 text-white">
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
                  onClick={() => navigate("/organizer/participants")}
                  className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors font-medium">
                  Batal
                </button>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
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
                      setError("");
                    }}
                    className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors font-medium">
                    Reset Form
                  </button>

                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      success ||
                      categories.length === 0 ||
                      events.length === 0 ||
                      !apiToken
                    }
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
                    {submitting ? (
                      <>
                        <Loader className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        <span>Simpan Peserta</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Debug Info (Hanya di development) */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
          <h4 className="font-bold mb-2 text-sm text-gray-400">Debug Info</h4>
          <div className="text-xs text-gray-500 space-y-1">
            <p>
              API Token:{" "}
              {apiToken ? `${apiToken.substring(0, 20)}...` : "No token"}
            </p>
            <p>Events Ready: {eventsReady ? "Yes" : "No (using fallback)"}</p>
            <p>Events Count: {events.length}</p>
            <p>Events: {JSON.stringify(events.slice(0, 2))}...</p>
            <p>Categories Count: {categories.length}</p>
            <p>Categories: {JSON.stringify(categories.slice(0, 2))}...</p>
            <p>Loading Categories: {loadingCategories ? "true" : "false"}</p>
            <p>Loading Events: {loadingEvents ? "true" : "false"}</p>
            <p>Submitting: {submitting ? "true" : "false"}</p>
            <p>Success: {success ? "true" : "false"}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CreateParticipant;
