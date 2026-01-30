import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  Calendar,
  Info,
} from "lucide-react";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

const CreateParticipant = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { eventId: eventIdFromParams } = useParams(); // Ambil event_id dari URL params jika ada

  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [assignedEvents, setAssignedEvents] = useState([]); // Event yang sudah di-assign ke user
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    school_name: "",
    school_address: "",
    coach: "",
    coach_whatsapp: "",
    image: null,
    event_id: eventIdFromParams || "", // Gunakan dari params jika ada
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

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    if (!user?.id) {
      setError("Anda harus login terlebih dahulu");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        await Promise.all([
          fetchCategories(),
          fetchAssignedEvents(), // Ambil event yang sudah di-assign
          eventIdFromParams
            ? fetchEventById(eventIdFromParams)
            : Promise.resolve(), // Jika ada event_id dari params
        ]);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id, eventIdFromParams]);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await api.get("/participant-categories");
      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Gagal memuat kategori peserta");
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchAssignedEvents = async () => {
    setLoadingEvents(true);
    try {
      // Endpoint untuk mendapatkan event yang di-assign ke user
      let assignedEventsData = [];

      // Coba beberapa endpoint yang mungkin
      const endpointsToTry = [
        `/users/${user.id}/events`, // Jika ada endpoint khusus user events
        `/my-events`, // Jika ada endpoint my-events
        `/events?user_id=${user.id}`, // Query dengan user_id
      ];

      for (const endpoint of endpointsToTry) {
        try {
          const response = await api.get(endpoint);
          if (response.data?.success) {
            let data = response.data.data;

            // Handle different response formats
            if (Array.isArray(data)) {
              assignedEventsData = data;
            } else if (data && Array.isArray(data.data)) {
              assignedEventsData = data.data;
            }

            if (assignedEventsData.length > 0) {
              console.log(
                `✅ Found assigned events from ${endpoint}:`,
                assignedEventsData,
              );
              break;
            }
          }
        } catch (err) {
          // Continue to next endpoint
          console.log(`Endpoint ${endpoint} failed:`, err.message);
        }
      }

      // Jika tidak ada endpoint yang berhasil, gunakan semua event untuk admin/judge
      if (assignedEventsData.length === 0) {
        const res = await api.get("/list-event");
        if (res.data?.success) {
          assignedEventsData = Array.isArray(res.data.data)
            ? res.data.data
            : [];
        }
      }

      setAssignedEvents(assignedEventsData);

      // Auto-select event jika hanya ada 1 event
      if (assignedEventsData.length === 1 && !eventIdFromParams) {
        const event = assignedEventsData[0];
        setSelectedEvent(event);
        setFormData((prev) => ({ ...prev, event_id: event.id }));
      }

      // Jika ada event_id dari params, cari event tersebut
      if (eventIdFromParams) {
        const foundEvent = assignedEventsData.find(
          (e) => e.id == eventIdFromParams,
        );
        if (foundEvent) {
          setSelectedEvent(foundEvent);
          setFormData((prev) => ({ ...prev, event_id: foundEvent.id }));
        }
      }
    } catch (err) {
      console.error("Error fetching assigned events:", err);
      setAssignedEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchEventById = async (id) => {
    try {
      const response = await api.get(`/events/${id}`);
      if (response.data?.success) {
        const event = response.data.data;
        setSelectedEvent(event);
        setFormData((prev) => ({ ...prev, event_id: event.id }));
      }
    } catch (err) {
      console.error("Error fetching event by ID:", err);
      setError("Event tidak ditemukan");
    }
  };

  /* ================= HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");

    // Jika mengubah event_id, update selectedEvent
    if (name === "event_id") {
      const selected = assignedEvents.find((e) => e.id == value);
      setSelectedEvent(selected || null);
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

    setFormData((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview("");
  };

  const handleWhatsAppChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, coach_whatsapp: value }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Validasi required fields
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

    // Pastikan event_id ada
    const eventId = formData.event_id;
    if (!eventId) {
      setError("Event ID tidak ditemukan");
      setSubmitting(false);
      return;
    }

    try {
      const payload = new FormData();

      // Hanya tambahkan field yang diperlukan untuk endpoint /events/{event_id}/create-participants
      // Field yang akan dikirim ke endpoint:
      payload.append("school_name", formData.school_name);
      payload.append("school_address", formData.school_address);
      payload.append("coach", formData.coach);
      payload.append("coach_whatsapp", formData.coach_whatsapp);
      payload.append(
        "participant_category_id",
        formData.participant_category_id,
      );

      // Tambahkan image jika ada
      if (formData.image) {
        payload.append("image", formData.image);
      }

      // Tambahkan user_id jika diperlukan oleh backend
      payload.append("user_id", user.id);

      console.log(`Submitting participant to event ${eventId}`);
      console.log("Payload:", {
        school_name: formData.school_name,
        school_address: formData.school_address,
        coach: formData.coach,
        coach_whatsapp: formData.coach_whatsapp,
        participant_category_id: formData.participant_category_id,
        user_id: user.id,
        has_image: !!formData.image,
      });

      // Gunakan endpoint /events/{event_id}/create-participants
      const endpoint = `/events/${eventId}/create-participants`;
      console.log(`Endpoint: ${endpoint}`);

      const response = await api.post(endpoint, payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response:", response.data);

      if (response.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          // Redirect ke halaman participants untuk event tersebut
          navigate(`/organizer/participants?event_id=${eventId}`);
        }, 1500);
      } else {
        throw new Error(response.data?.message || "Gagal menyimpan peserta");
      }
    } catch (err) {
      console.error("Submit error:", err);

      // Tampilkan error detail
      if (err.response?.data) {
        console.error("Error response:", err.response.data);

        // Handle validation errors
        if (err.response.status === 422) {
          const errors = err.response.data.errors;
          const errorMessages = [];

          for (const field in errors) {
            if (errors[field]) {
              errorMessages.push(`${field}: ${errors[field].join(", ")}`);
            }
          }

          setError(`Validasi gagal: ${errorMessages.join("; ")}`);
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError(err.response.data?.error || "Gagal menyimpan data peserta");
        }
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Gagal menyimpan data peserta");
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= RENDER ================= */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center">
        <Loader className="animate-spin text-blue-500 mb-4" size={48} />
        <p className="text-gray-400">Memuat data...</p>
      </div>
    );
  }

  // Jika user belum login
  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-white mb-2">Anda Belum Login</h2>
        <p className="text-gray-400 mb-6">
          Silakan login terlebih dahulu untuk menambahkan peserta
        </p>
        <button
          onClick={() => navigate("/auth/login")}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl"
        >
          Login Sekarang
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Tambah Peserta Baru
            {selectedEvent && (
              <span className="text-blue-400 text-lg ml-2">
                untuk Event:{" "}
                {selectedEvent.name ||
                  selectedEvent.event_name ||
                  `Event #${selectedEvent.id}`}
              </span>
            )}
          </h1>
        </div>
        <p className="text-gray-400">
          Isi semua informasi peserta di bawah ini
        </p>
      </div>

      {/* Error Alert */}
      {error && !error.includes("Event tidak ditemukan") && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
        >
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
          className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
        >
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
        {/* Event Information Card - Tampilkan jika event sudah dipilih */}
        {selectedEvent && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="text-blue-400" size={24} />
              <h3 className="text-lg font-semibold text-white">
                Informasi Event
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Nama Event</p>
                <p className="text-white font-medium">
                  {selectedEvent.name || selectedEvent.event_name || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Tanggal</p>
                <p className="text-white font-medium">
                  {selectedEvent.start_date
                    ? formatEventDate(selectedEvent.start_date)
                    : "N/A"}
                  {selectedEvent.end_date &&
                    ` - ${formatEventDate(selectedEvent.end_date)}`}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Lokasi</p>
                <p className="text-white font-medium">
                  {selectedEvent.location || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400">Penyelenggara</p>
                <p className="text-white font-medium">
                  {selectedEvent.organized_by || "N/A"}
                </p>
              </div>
            </div>

            {/* Debug Info - Tampilkan di development mode */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-blue-300 text-sm font-medium">
                      Debug Info:
                    </p>
                    <p className="text-blue-200 text-xs">
                      Event ID: {selectedEvent.id}
                      <br />
                      Endpoint: POST /events/{selectedEvent.id}
                      /create-participants
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

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
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                >
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

            {/* Event Selection - Hanya tampilkan jika ada multiple events atau tidak ada event_id dari params */}
            {/* {(assignedEvents.length > 1 || !eventIdFromParams) && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={16} />
                    Pilih Event *
                    {eventIdFromParams && (
                      <span className="text-xs text-blue-400">
                        (Opsional - bisa diubah)
                      </span>
                    )}
                  </div>
                </label>

                {loadingEvents ? (
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl">
                    <Loader className="animate-spin text-gray-400" size={16} />
                    <span className="text-gray-400">
                      Memuat daftar event...
                    </span>
                  </div>
                ) : assignedEvents.length === 0 ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                      <p className="text-yellow-400 text-sm">
                        Anda belum di-assign ke event apapun. Hubungi admin
                        untuk diassign ke event.
                      </p>
                    </div>
                    {user.role === "organizer" && (
                      <button
                        type="button"
                        onClick={() => navigate("/organizer/events/create")}
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <PlusCircle size={18} />
                        Buat Event Baru
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      name="event_id"
                      value={formData.event_id}
                      onChange={handleChange}
                      required
                      disabled={submitting}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                    >
                      <option value="">-- Pilih Event --</option>
                      {assignedEvents.map((event) => {
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
            )} */}

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
                    className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors disabled:opacity-50"
                  >
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

        {/* Information for judges/organizers */}
        {!eventIdFromParams && assignedEvents.length > 0 && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-blue-400 mt-0.5" />
              <div>
                <p className="text-blue-300 text-sm">
                  <span className="font-medium">Info:</span> Anda dapat
                  menambahkan peserta untuk event yang sudah di-assign ke Anda.
                  {assignedEvents.length === 1
                    ? " Hanya ada 1 event yang tersedia."
                    : ` Tersedia ${assignedEvents.length} event.`}
                </p>
                <p className="text-blue-200 text-xs mt-1">
                  Data akan dikirim ke endpoint:{" "}
                  <code className="bg-gray-800 px-1 rounded">
                    /events/{formData.event_id || "?"}/create-participants
                  </code>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-800">
          <button
            type="button"
            onClick={() => navigate("/organizer/participants")}
            disabled={submitting}
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={submitting || loadingCategories || !formData.event_id}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
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
