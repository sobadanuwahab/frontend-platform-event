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
  Database,
  Bug,
  User,
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
  const [debugInfo, setDebugInfo] = useState([]);

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
    if (id && user) {
      let isMounted = true;

      const loadData = async () => {
        if (isMounted) {
          await loadEventData();
        }
      };

      loadData();

      return () => {
        isMounted = false;
      };
    }
  }, [id, user]);

  /* ================= ADD DEBUG LOG ================= */
  const addDebugLog = (message) => {
    // console.log(`[DEBUG EditEvent] ${message}`);
    setDebugInfo((prev) => [
      ...prev,
      `${new Date().toISOString().split("T")[1].split(".")[0]} - ${message}`,
    ]);
  };

  /* ================= LOAD EVENT DATA ================= */
  const loadEventData = async () => {
    setLoading(true);
    setError("");
    setDebugInfo([]);

    addDebugLog(`=== START LOADING EVENT ID: ${id} ===`);
    addDebugLog(`User ID: ${user?.id}, Name: ${user?.name}`);

    try {
      // console.log(`📥 Loading event data for ID: ${id}`);
      addDebugLog(`Trying to load event with ID: ${id}`);

      // ========== STRATEGY 1: Coba dari localStorage langsung ==========
      let event = null;

      addDebugLog("Loading from localStorage...");
      try {
        const storedEvents = localStorage.getItem("user_created_events");
        if (storedEvents) {
          const eventsArray = JSON.parse(storedEvents);
          const localEvent = eventsArray.find((e) => e.id == id || e.id === id);

          if (localEvent) {
            event = localEvent;
            addDebugLog(`✅ Found event in localStorage: ${event.name}`);
            // console.log("📋 localStorage event data:", localEvent);
          }
        }
      } catch (localError) {
        addDebugLog(`❌ localStorage error: ${localError.message}`);
      }

      // ========== STRATEGY 2: Coba satu-satunya endpoint yang diketahui berhasil ==========
      if (!event) {
        // Hanya coba endpoint yang benar-benar ada
        const endpoint = `/get-event/${id}`; // Ganti dengan endpoint yang valid jika ada
        try {
          addDebugLog(`Trying API endpoint: GET ${endpoint}`);
          const response = await api.get(endpoint);

          if (response.data) {
            const extracted = extractEventFromResponse(response.data);
            if (extracted) {
              event = extracted;
              addDebugLog(`✅ Found event at ${endpoint}`);
              // console.log("📋 API Response data:", extracted);
            }
          }
        } catch (err) {
          addDebugLog(
            `❌ API endpoint ${endpoint} failed: ${err.response?.status || err.message}`,
          );
          // Tidak perlu coba endpoint lain karena semuanya 404
        }
      }

      if (!event) {
        // Jika tidak ditemukan, buat event dummy dengan data minimal
        event = {
          id: id,
          name: "Event Tidak Ditemukan",
          organized_by: "",
          location: "",
          event_info: "",
          term_condition: "",
          start_date: "",
          end_date: "",
          user_id: user?.id || null,
          created_at: new Date().toISOString(),
        };
        addDebugLog("⚠️ Event not found, created dummy event");
      }

      // Verifikasi kepemilikan
      if (event.user_id && event.user_id != user?.id) {
        const errorMsg = `Access denied: Event belongs to user ${event.user_id}, current user is ${user?.id}`;
        addDebugLog(`❌ ${errorMsg}`);
        setError("Anda tidak memiliki izin untuk mengedit event ini.");
        setLoading(false);
        return;
      }

      setEventData(event);
      populateForm(event);
      addDebugLog(`✅ Event loaded: ${event.name} (ID: ${event.id})`);

      // ========== HANDLE IMAGE ==========
      addDebugLog("🔍 Searching for image in event data...");

      // Cari path gambar di event
      const imagePath = findImagePathInEvent(event);

      if (imagePath) {
        addDebugLog(`✅ Found image path: ${imagePath}`);

        // Format URL sesuai dengan informasi Anda
        const fullImageUrl = formatImageUrl(imagePath);
        addDebugLog(`✅ Formatted image URL: ${fullImageUrl}`);

        setImagePreview(fullImageUrl);
        setOriginalImage(fullImageUrl);
      } else {
        addDebugLog("❌ No image path found in event data");
        // Set placeholder jika tidak ada gambar
        setImagePreview(
          `https://ui-avatars.com/api/?name=${encodeURIComponent(event.name || "Event")}&background=1e40af&color=fff&size=400`,
        );
      }
    } catch (error) {
      console.error("❌ Error loading event:", error);
      addDebugLog(`❌ Load error: ${error.message}`);

      let errorMessage = "Gagal memuat data event";
      if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
      addDebugLog("=== END LOADING ===");
    }
  };

  /* ================= FIND IMAGE PATH IN EVENT ================= */
  const findImagePathInEvent = (event) => {
    if (!event) return null;

    // console.log("🔍 Searching for image path in event...");

    // Debug: log semua field event
    // console.log("📊 All event fields and values:", event);

    // Priority 1: Cek langsung field 'image'
    if (event.image) {
      // console.log(`✅ Found in direct field "image":`, event.image);
      return event.image;
    }

    // Priority 2: Cek field lain yang mungkin mengandung image
    const possibleFields = [
      "image",
      "image_url",
      "image_path",
      "banner",
      "poster",
      "photo",
      "picture",
      "thumbnail",
      "cover",
      "banner_image",
      "imageUrl",
      "imagePath",
    ];

    for (const field of possibleFields) {
      if (event[field] && typeof event[field] === "string") {
        // console.log(`✅ Found in field "${field}":`, event[field]);
        return event[field];
      }
    }

    // Priority 3: Cari field yang mengandung 'events/' pattern
    const allFields = Object.keys(event);
    for (const field of allFields) {
      const value = event[field];

      if (typeof value === "string") {
        // Cari pattern: events/nama-file.jpg
        if (
          value.includes("events/") &&
          value.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        ) {
          // console.log(`✅ Found events/ path in field "${field}":`, value);
          return value;
        }
      }
    }

    // console.log("❌ No image path found in event data");
    return null;
  };

  /* ================= FORMAT IMAGE URL ================= */
  const formatImageUrl = (imagePath) => {
    if (!imagePath || typeof imagePath !== "string") {
      addDebugLog(`❌ Invalid image path: ${imagePath}`);
      return null;
    }

    const baseUrl = "https://apipaskibra.my.id";
    const cleanPath = imagePath.trim();

    // console.log(`🖼️ Original image path: ${cleanPath}`);

    // 1. Jika sudah URL lengkap, return langsung
    if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
      return cleanPath;
    }

    // 2. Format khusus untuk path 'events/xxx.jpg' dari backend
    if (cleanPath.startsWith("events/")) {
      const url = `${baseUrl}/storage/${cleanPath}`;
      // console.log(`🖼️ Formatted URL (events/): ${url}`);
      return url;
    }

    // 3. Jika path dimulai dengan '/storage/'
    if (cleanPath.startsWith("/storage/")) {
      const url = `${baseUrl}${cleanPath}`;
      // console.log(`🖼️ Formatted URL (/storage/): ${url}`);
      return url;
    }

    // 4. Default: tambahkan /storage/ di depan
    const url = `${baseUrl}/storage/${cleanPath}`;
    // console.log(`🖼️ Formatted URL (default): ${url}`);
    return url;
  };

  /* ================= TEST IMAGE LOADING ================= */
  const testImageLoad = (url) => {
    addDebugLog(`Testing image URL: ${url}`);

    const img = new Image();
    img.onload = () => {
      addDebugLog(`✅ Image loaded successfully: ${url}`);
      // console.log(`✅ Image dimensions: ${img.width}x${img.height}`);
    };
    img.onerror = () => {
      addDebugLog(`❌ Failed to load image: ${url}`);
      console.error(`❌ Image failed to load: ${url}`);

      // Coba alternatif URL jika gagal
      if (url.includes("/storage/")) {
        // Coba tanpa /storage/ jika double
        const altUrl = url.replace("/storage/storage/", "/storage/");
        if (altUrl !== url) {
          addDebugLog(`Trying alternative URL: ${altUrl}`);
          testImageLoad(altUrl);
        }
      }
    };
    img.src = url;
  };

  /* ================= EXTRACT EVENT FROM RESPONSE ================= */
  const extractEventFromResponse = (data) => {
    if (!data) {
      addDebugLog("❌ No data in response");
      return null;
    }

    // console.log("📦 Raw response data:", data);

    // Format 1: { success: true, data: { ... } }
    if (data.success && data.data) {
      addDebugLog("✅ Format 1: success.data");
      return data.data;
    }

    // Format 2: { data: { ... } }
    if (data.data && typeof data.data === "object") {
      addDebugLog("✅ Format 2: data");
      return data.data;
    }

    // Format 3: Langsung event object
    if (data.id || data.event_id) {
      addDebugLog("✅ Format 3: direct event object");
      return data;
    }

    // Format 4: Array dengan satu event
    if (Array.isArray(data) && data.length > 0) {
      addDebugLog("✅ Format 4: array with events");
      return data[0];
    }

    addDebugLog("❌ Unknown response format");
    return null;
  };

  /* ================= POPULATE FORM ================= */
  const populateForm = (data) => {
    // console.log("📝 Populating form with data:", data);
    // console.log("🔍 Image in data:", data.image);

    const formattedData = {
      name: data.name || data.event_name || "",
      organized_by: data.organized_by || data.organizer || "",
      location: data.location || data.event_location || data.venue || "",
      event_info: data.event_info || data.description || data.info || "",
      term_condition: data.term_condition || data.terms || "",
      start_date: data.start_date ? data.start_date.split("T")[0] : "",
      end_date: data.end_date ? data.end_date.split("T")[0] : "",
      image: null,
    };

    // console.log("📝 Formatted form data:", formattedData);
    setFormData(formattedData);
    addDebugLog("Form populated with event data");

    // Tambahkan debug untuk image
    if (data.image) {
      // console.log(`🖼️ Image path from data: ${data.image}`);
      addDebugLog(`Image path from data: ${data.image}`);
    }
  };

  /* ================= HANDLE IMAGE CHANGE ================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi
      if (file.size > 5 * 1024 * 1024) {
        setError("Ukuran file maksimal 5MB");
        addDebugLog(
          `Image validation failed: File too large (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
        );
        return;
      }

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
        `New image selected: ${file.name} (${(file.size / 1024).toFixed(2)}KB)`,
      );

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(originalImage || "");
    addDebugLog("Image removed, restored to original");
  };

  /* ================= HANDLE SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Anda harus login untuk mengedit event");
      return;
    }

    // Periksa kepemilikan
    if (eventData && eventData.user_id && eventData.user_id != user.id) {
      setError("Anda tidak memiliki izin untuk mengedit event ini.");
      return;
    }

    setSubmitting(true);
    setError("");
    setDebugInfo([]);
    addDebugLog("=== START UPDATING EVENT ===");

    try {
      // Validation (sama seperti sebelumnya)
      const errors = [];
      addDebugLog("Validating form data...");

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
        addDebugLog(`Validation failed: ${errors.join(", ")}`);
        throw new Error(errors.join(", "));
      }

      // ========== PREPARE FORM DATA ==========
      addDebugLog("Preparing form data for update...");
      const submitData = new FormData();

      // Field utama
      submitData.append("name", formData.name.trim());
      submitData.append("organized_by", formData.organized_by.trim());
      submitData.append("location", formData.location.trim());
      submitData.append("event_info", formData.event_info.trim() || "");
      submitData.append("term_condition", formData.term_condition.trim() || "");
      submitData.append("start_date", formData.start_date);
      submitData.append("end_date", formData.end_date);
      submitData.append("user_id", user.id.toString());

      // Tambahkan gambar baru jika ada
      if (formData.image) {
        addDebugLog(`Adding new image: ${formData.image.name}`);
        submitData.append("image", formData.image);
      } else {
        addDebugLog("No new image selected, keeping original");
      }

      // Untuk update dengan Laravel, tambahkan _method=PUT
      submitData.append("_method", "PUT");

      // Debug log form data
      addDebugLog("FormData contents:");
      for (let pair of submitData.entries()) {
        const value =
          typeof pair[1] === "object" ? pair[1].name || "File" : pair[1];
        addDebugLog(`  ${pair[0]}: ${value}`);
      }

      // ========== SEND TO API ==========
      // HANYA gunakan endpoint yang berhasil berdasarkan log
      const endpoint = `/edit-event/${id}`; // Ini endpoint yang berhasil

      try {
        addDebugLog(`Trying to update via: POST ${endpoint}`);

        const response = await api.post(endpoint, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
        });

        addDebugLog(`✅ Update successful! Status: ${response.status}`);

        // console.log("✅ Update response:", response.data);
        addDebugLog(`API Response: ${JSON.stringify(response.data)}`);

        if (
          response.data.success ||
          response.data.message?.includes("success") ||
          response.data.id
        ) {
          const eventId = response.data.data?.id || response.data.id || id;
          addDebugLog(`✅ Event updated successfully! Event ID: ${eventId}`);

          // Update localStorage
          try {
            const storedEvents = localStorage.getItem("user_created_events");
            if (storedEvents) {
              const eventsArray = JSON.parse(storedEvents);
              const eventIndex = eventsArray.findIndex(
                (e) => e.id == id || e.id === id,
              );

              if (eventIndex !== -1) {
                const updatedEvent = {
                  ...eventsArray[eventIndex],
                  name: formData.name,
                  organized_by: formData.organized_by,
                  location: formData.location,
                  event_info: formData.event_info,
                  term_condition: formData.term_condition,
                  start_date: formData.start_date,
                  end_date: formData.end_date,
                  updated_at: new Date().toISOString(),
                };

                // Tambahkan image jika ada di response
                if (response.data.data?.image) {
                  updatedEvent.image = response.data.data.image;
                  // console.log(
                  //   `✅ Added image to localStorage: ${response.data.data.image}`,
                  // );
                }

                eventsArray[eventIndex] = updatedEvent;

                localStorage.setItem(
                  "user_created_events",
                  JSON.stringify(eventsArray),
                );

                addDebugLog("✅ localStorage updated with image");
              }
            }
          } catch (storageError) {
            addDebugLog(
              `⚠️ Failed to update localStorage: ${storageError.message}`,
            );
          }

          setSuccess(true);

          // Redirect setelah 2 detik
          setTimeout(() => {
            navigate("/organizer/events");
          }, 2000);
        } else {
          const errorMsg = response.data.message || "Gagal mengupdate event";
          addDebugLog(`❌ API returned error: ${errorMsg}`);
          throw new Error(errorMsg);
        }
      } catch (err) {
        console.error("❌ Update error:", err);
        addDebugLog(
          `❌ Endpoint ${endpoint} failed: ${err.response?.status || err.message}`,
        );

        if (err.response?.status === 422) {
          // Log validation errors
          if (err.response.data?.errors) {
            const validationErrors = err.response.data.errors;
            for (const field in validationErrors) {
              addDebugLog(
                `Validation error for ${field}: ${validationErrors[field].join(", ")}`,
              );
            }
          }
        }

        throw err;
      }
    } catch (error) {
      console.error("❌ Error updating event:", error);
      addDebugLog(`❌ Update error: ${error.message}`);

      let errorMessage = "Terjadi kesalahan saat mengupdate event";
      let validationDetails = "";

      if (error.response?.data) {
        // console.log("Full error response:", error.response.data);
        addDebugLog(
          `Error response data: ${JSON.stringify(error.response.data)}`,
        );

        if (error.response.data.errors) {
          const errors = error.response.data.errors;
          validationDetails = Object.keys(errors)
            .map((key) => `• ${key}: ${errors[key].join(", ")}`)
            .join("\n");

          errorMessage = `Validasi gagal:\n${validationDetails}`;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }

      setError(errorMessage);
    } finally {
      setSubmitting(false);
      addDebugLog("=== END UPDATING ===");
    }
  };

  /* ================= HANDLE CHANGE ================= */
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

  /* ================= DELETE EVENT ================= */
  const handleDeleteEvent = async () => {
    if (!user) {
      alert("Anda harus login untuk menghapus event");
      return;
    }

    if (eventData && eventData.user_id && eventData.user_id != user.id) {
      alert("Anda tidak memiliki izin untuk menghapus event ini.");
      return;
    }

    if (
      !window.confirm(
        "Apakah Anda yakin ingin menghapus event ini? Tindakan ini tidak dapat dibatalkan.",
      )
    ) {
      return;
    }

    try {
      addDebugLog(`Attempting to delete event ID: ${id}`);

      // Hanya coba endpoint yang diketahui berhasil
      const endpoint = `/delete-event/${id}`; // Ganti dengan endpoint yang valid jika ada

      try {
        addDebugLog(`Trying DELETE: ${endpoint}`);
        await api.delete(endpoint);
        addDebugLog(`✅ Delete successful via ${endpoint}`);
      } catch (err) {
        addDebugLog(
          `❌ Delete failed via ${endpoint}: ${err.response?.status || err.message}`,
        );
        // Tampilkan pesan error saja, tidak perlu throw error
      }

      // Hapus dari localStorage (selalu lakukan ini)
      try {
        const storedEvents = localStorage.getItem("user_created_events");
        if (storedEvents) {
          const eventsArray = JSON.parse(storedEvents);
          const filteredEvents = eventsArray.filter(
            (e) => e.id != id && e.id !== id,
          );
          localStorage.setItem(
            "user_created_events",
            JSON.stringify(filteredEvents),
          );
          addDebugLog("✅ Removed from localStorage");
        }
      } catch (storageError) {
        addDebugLog(
          `⚠️ Failed to remove from localStorage: ${storageError.message}`,
        );
      }

      alert("Event berhasil dihapus dari daftar lokal");
      navigate("/organizer/events");
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Event dihapus dari daftar lokal");
      navigate("/organizer/events");
    }
  };

  /* ================= VIEW DEBUG INFO ================= */
  const viewDebugInfo = () => {
    if (debugInfo.length > 0) {
      const infoText = debugInfo.join("\n");
      alert(`Debug Information:\n\n${infoText}`);
    } else {
      alert("No debug information available. Try loading or submitting first.");
    }
  };

  /* ================= RENDER LOADING ================= */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Memuat data event...</p>
          {user && (
            <p className="text-sm text-gray-500 mt-2">
              Loading for User ID: {user.id}
            </p>
          )}
        </div>
      </div>
    );
  }

  /* ================= RENDER NOT FOUND ================= */
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
            Event dengan ID {id} tidak ditemukan atau Anda tidak memiliki akses.
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

  /* ================= RENDER FORM ================= */
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
                <div className="flex items-center gap-2">
                  <span>
                    Editor: <span className="text-blue-400">{user.name}</span>
                  </span>
                  <span className="text-gray-600">•</span>
                  <span>
                    ID: <span className="text-blue-400">{user.id}</span>
                  </span>
                  <span className="text-gray-600">•</span>
                  <span>
                    Event ID: <span className="text-blue-400">{id}</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={viewDebugInfo}
              className="px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-400 transition-colors flex items-center gap-2 text-sm"
            >
              <Bug size={16} />
              Debug Info
            </button>
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
              Hapus
            </button>
          </div>
        </div>
      </div>

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

      {/* Form */}
      <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
        {/* Error Alert */}
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

        {/* Success Alert */}
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

        {/* User Information */}
        <div className="mb-8 p-4 rounded-xl bg-gray-900/50 border border-gray-700">
          <h3 className="text-lg font-bold mb-3 text-gray-300 flex items-center gap-2">
            <User size={20} />
            Informasi Editor
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Nama Editor</p>
              <p className="text-gray-300 font-medium">{user?.name || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">User ID</p>
              <p className="text-blue-400 font-mono font-medium">
                {user?.id || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Event ID</p>
              <p className="text-yellow-400 font-mono font-medium">{id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">Event Name</p>
              <p className="text-gray-300 font-medium">
                {eventData?.name || "-"}
              </p>
            </div>
          </div>

          {/* Image Debug Info */}
          {eventData && (
            <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
              <p className="text-xs text-blue-300 mb-1">
                <strong>Image Info:</strong>
              </p>
              <p className="text-xs text-gray-400">
                {imagePreview && imagePreview.startsWith("http")
                  ? `Image URL: ${imagePreview.substring(0, 60)}...`
                  : "No image found in event data"}
              </p>
              {eventData.image && (
                <p className="text-xs text-gray-400 mt-1">
                  Image path in data: {eventData.image}
                </p>
              )}
            </div>
          )}
        </div>

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
                  onChange={handleTextAreaChange}
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
                  onChange={handleTextAreaChange}
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
                  onChange={handleTextAreaChange}
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
                  className={`flex-1 cursor-pointer ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
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
                            onLoad={() =>
                              addDebugLog(
                                `✅ Image preview loaded: ${imagePreview}`,
                              )
                            }
                            onError={(e) => {
                              console.error(
                                "❌ Error loading preview:",
                                imagePreview,
                              );
                              addDebugLog(
                                `❌ Failed to load image: ${imagePreview}`,
                              );

                              // Fallback ke placeholder jika gambar gagal load
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || "Event")}&background=1e40af&color=fff&size=400`;
                              e.target.className =
                                "w-full h-full object-contain p-8";
                            }}
                          />

                          {/* Image change indicator */}
                          {formData.image && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                              Gambar Baru
                            </div>
                          )}

                          {/* Remove button */}
                          {formData.image && (
                            <button
                              type="button"
                              onClick={removeImage}
                              disabled={submitting}
                              className="absolute top-2 right-2 p-2 rounded-lg bg-red-500/80 hover:bg-red-600 text-white disabled:opacity-50"
                              title="Hapus gambar baru"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>

                        {/* Image Info */}
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
                                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                                >
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

              {/* Event Data Debug Info */}
              {eventData && (
                <div className="mt-4 p-3 bg-gray-900/30 rounded-lg">
                  <p className="text-xs text-gray-400 mb-2">
                    <strong>Event Data Debug:</strong>
                  </p>
                  <div className="text-xs font-mono text-gray-500 space-y-1">
                    <p>Event ID: {eventData.id}</p>
                    <p>Name: {eventData.name}</p>
                    <p>Has image field: {eventData.image ? "Yes" : "No"}</p>
                    {eventData.image && <p>Image path: {eventData.image}</p>}
                  </div>
                </div>
              )}
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
                  if (eventData) {
                    populateForm(eventData);
                    setImagePreview(originalImage);
                  }
                  setError("");
                  addDebugLog("Form reset to original values");
                }}
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors font-medium disabled:opacity-50"
              >
                Reset
              </button>

              <button
                type="submit"
                disabled={submitting || success}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <Loader className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white" />
                    <span>Mengupdate...</span>
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

      {/* Information Panel */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-300 mb-2">
              Informasi Edit Event:
            </h4>
            <div className="text-sm text-gray-400 space-y-1">
              <p>• Event ID: {id}</p>
              <p>• User ID: {user?.id || "-"}</p>
              <p>• Event Name: {eventData?.name || "-"}</p>
              <p>• Has Image: {imagePreview ? "Yes" : "No"}</p>
              <p>• Image Path: {eventData?.image || "Not found in data"}</p>
              <p>
                • Status:{" "}
                {submitting ? "Updating..." : success ? "Success!" : "Ready"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EditEvent;
