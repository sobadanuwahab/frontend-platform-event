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
  Users,
  MapPin,
  Info,
  FileText,
  Building,
  ArrowLeft,
  Loader,
  Key,
  Image as ImageIcon,
  Globe,
  Phone,
  Mail,
} from "lucide-react";
import axios from "axios";

const CreateEvent = () => {
  const API_URL = "https://apipaskibra.my.id/api";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [apiToken, setApiToken] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    organized_by: "",
    location: "",
    info: "",
    term_condition: "",
    image: null,
    website: "",
    contact_phone: "",
    contact_email: "",
    start_date: "",
    end_date: "",
    status: "active", // Tambahkan field status default
  });

  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setApiToken(token);
    } else {
      setError("Token tidak ditemukan. Silakan login kembali.");
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

      // Required fields
      submitData.append("name", formData.name.trim());
      submitData.append("organized_by", formData.organized_by.trim());
      submitData.append("location", formData.location.trim());
      submitData.append("start_date", formData.start_date);
      submitData.append("end_date", formData.end_date);
      submitData.append("status", formData.status); // Tambahkan status

      // Optional fields - hanya append jika ada nilai
      if (formData.info && formData.info.trim()) {
        submitData.append("info", formData.info.trim());
      }

      if (formData.term_condition && formData.term_condition.trim()) {
        submitData.append("term_condition", formData.term_condition.trim());
      }

      if (formData.website && formData.website.trim()) {
        submitData.append("website", formData.website.trim());
      }

      if (formData.contact_phone && formData.contact_phone.trim()) {
        submitData.append("contact_phone", formData.contact_phone.trim());
      }

      if (formData.contact_email && formData.contact_email.trim()) {
        submitData.append("contact_email", formData.contact_email.trim());
      }

      if (formData.image) {
        submitData.append("image", formData.image);
      }

      // Debug: Log semua data yang akan dikirim
      console.log("📤 Submitting event data to:", `${API_URL}/create-event`);
      console.log("📋 Form Data (before FormData):", formData);
      console.log("📦 FormData entries:");
      for (let [key, value] of submitData.entries()) {
        if (key === "image") {
          console.log(`  ${key}:`, {
            name: value.name,
            type: value.type,
            size: `${(value.size / 1024 / 1024).toFixed(2)} MB`,
          });
        } else {
          console.log(`  ${key}:`, value);
        }
      }

      // Submit to API dengan endpoint yang benar
      console.log(
        "🔐 Using token for submission:",
        token.substring(0, 20) + "...",
      );

      // Coba POST ke endpoint yang benar
      const response = await axios.post(`${API_URL}/create-event`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        timeout: 30000, // 30 detik timeout
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            console.log(`📤 Upload progress: ${percentCompleted}%`);
          }
        },
      });

      console.log("✅ API Response:", response.data);
      console.log("📊 Response status:", response.status);
      console.log("🔗 Response headers:", response.headers);

      if (response.data.success) {
        console.log("🎉 Event created successfully!");
        setSuccess(true);
        setTimeout(() => {
          navigate("/organizer/events");
        }, 2000);
      } else {
        console.log("⚠️ API returned success: false");
        throw new Error(response.data.message || "Gagal membuat event");
      }
    } catch (error) {
      console.error("❌ Error creating event:", error);

      // Debug detailed error info
      if (error.response) {
        console.error("📋 Error Response Status:", error.response.status);
        console.error("📋 Error Response Data:", error.response.data);
        console.error("📋 Error Response Headers:", error.response.headers);
        console.error("📋 Request Config:", {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data,
        });
      } else if (error.request) {
        console.error("📋 No response received:", error.request);
      } else {
        console.error("📋 Request setup error:", error.message);
      }
      console.error("📋 Full error object:", error);

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
      } else if (error.response?.status === 404) {
        setError(
          "Endpoint /api/create-event tidak ditemukan. Periksa URL API.",
        );
      } else if (error.response?.status === 405) {
        setError("Method POST tidak diizinkan untuk endpoint ini.");
      } else if (error.response?.status === 500) {
        setError("Server error. Silakan coba lagi nanti.");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.message) {
        setError(error.message);
      } else if (error.code === "ECONNABORTED") {
        setError("Koneksi timeout. Silakan coba lagi.");
      } else if (error.code === "NETWORK_ERROR") {
        setError("Tidak dapat terhubung ke server. Periksa koneksi internet.");
      } else {
        setError("Terjadi kesalahan saat membuat event. Silakan coba lagi.");
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

  // Test API endpoint function
  const testApiEndpoint = async () => {
    const token = checkToken();
    if (!token) return;

    try {
      console.log("🧪 Testing API endpoint...");
      const testResponse = await axios.get(`${API_URL}/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        timeout: 5000,
      });
      console.log("✅ Test response:", testResponse.data);
      alert(
        "API endpoint test: SUCCESS\nEvents count: " +
          (testResponse.data.data?.length || testResponse.data.length || "N/A"),
      );
    } catch (testError) {
      console.error("❌ API test failed:", testError);
      alert("API test FAILED: " + testError.message);
    }
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
      className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/organizer/events")}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6">
          <ArrowLeft size={20} />
          <span>Kembali ke Daftar Event</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Buat Event Baru</h1>
            <p className="text-gray-400">
              Buat event Paskibra Championship baru untuk diikuti peserta
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Token info */}
            {apiToken && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Key size={14} />
                <span>Token: {apiToken.substring(0, 10)}...</span>
              </div>
            )}

            {/* Test API Button */}
            <button
              onClick={testApiEndpoint}
              className="px-4 py-2 text-sm rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-400 transition-colors">
              Test API
            </button>
          </div>
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

      {/* Konten form hanya ditampilkan jika ada token */}
      {apiToken && (
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
                    <button
                      onClick={() => setError("")}
                      className="mt-2 text-xs text-gray-400 hover:text-gray-300">
                      Clear error
                    </button>
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

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-gray-300 border-b border-gray-700 pb-2">
                  Kontak & Website
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Website
                    </label>
                    <div className="relative">
                      <Globe
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        size={20}
                      />
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com"
                        maxLength={200}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Telepon Kontak
                    </label>
                    <div className="relative">
                      <Phone
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        size={20}
                      />
                      <input
                        type="tel"
                        name="contact_phone"
                        value={formData.contact_phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="081234567890"
                        maxLength={20}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Kontak
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        size={20}
                      />
                      <input
                        type="email"
                        name="contact_email"
                        value={formData.contact_email}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="contact@example.com"
                        maxLength={100}
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
                      Deskripsi Event
                    </label>
                    <div className="relative">
                      <Info
                        className="absolute left-3 top-4 transform text-gray-500"
                        size={20}
                      />
                      <textarea
                        name="info"
                        value={formData.info}
                        onChange={handleTextAreaChange}
                        rows="4"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Deskripsi lengkap tentang event, tujuan, kegiatan yang akan dilakukan, dll."
                        maxLength={2000}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.info.length}/2000 karakter
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Syarat & Ketentuan
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
                      className="flex-1 cursor-pointer group">
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
                  onClick={() => navigate("/organizer/events")}
                  className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors font-medium">
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
                        info: "",
                        term_condition: "",
                        image: null,
                        website: "",
                        contact_phone: "",
                        contact_email: "",
                        start_date: "",
                        end_date: "",
                        status: "active",
                      });
                      setImagePreview("");
                      setError("");
                    }}
                    className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors font-medium">
                    Reset Form
                  </button>

                  <button
                    type="submit"
                    disabled={submitting || success || !apiToken}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
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
        </>
      )}

      {/* Debug Info (Hanya di development) */}
      <div className="mt-8 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
        <h4 className="font-bold mb-2 text-sm text-gray-400">Debug Info</h4>
        <div className="text-xs text-gray-500 space-y-1">
          <p>
            API Token:{" "}
            {apiToken ? `${apiToken.substring(0, 20)}...` : "No token"}
          </p>
          <p>Endpoint: {API_URL}/create-event</p>
          <p>Method: POST (multipart/form-data)</p>
          <p>Submitting: {submitting ? "true" : "false"}</p>
          <p>Success: {success ? "true" : "false"}</p>
          <p>Error: {error || "none"}</p>
          <div className="mt-2">
            <p className="font-medium">Form Data Preview:</p>
            <pre className="text-xs bg-gray-900 p-2 rounded mt-1 overflow-auto max-h-32">
              {JSON.stringify(
                {
                  ...formData,
                  image: formData.image ? `FILE: ${formData.image.name}` : null,
                },
                null,
                2,
              )}
            </pre>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateEvent;
