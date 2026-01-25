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
  ArrowLeft,
  Loader,
  Image as ImageIcon,
  CalendarDays,
  PlusCircle,
} from "lucide-react";
import api from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";

const CreateParticipant = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [userCreatedEvents, setUserCreatedEvents] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

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

  /* ================= FETCH CATEGORIES FROM API ================= */
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      console.log("Fetching categories from /api/participant-categories...");
      const response = await api.get("/participant-categories");
      console.log("Categories API response:", response.data);

      if (response.data.success && response.data.data) {
        setCategories(response.data.data);
        console.log("Categories loaded:", response.data.data);
      } else {
        throw new Error("Format data kategori tidak valid");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);

      // Fallback data untuk development
      setCategories([
        { id: 1, name: "SMP" },
        { id: 2, name: "SMA" },
        { id: 3, name: "SMK" },
        { id: 4, name: "Universitas" },
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };

  /* ================= LOAD USER'S CREATED EVENTS FROM STORAGE ================= */
  const loadUserCreatedEvents = () => {
    setLoadingEvents(true);
    try {
      console.log("Loading user's created events from storage...");

      // Coba ambil dari localStorage
      const storedEvents = localStorage.getItem("user_created_events");

      if (storedEvents) {
        const parsedEvents = JSON.parse(storedEvents);

        // Filter event berdasarkan user_id jika ada
        const userEvents = parsedEvents.filter(
          (event) => user?.id && event.user_id == user.id,
        );

        console.log("User's created events from storage:", userEvents);

        if (userEvents.length > 0) {
          setUserCreatedEvents(userEvents);
          setEvents(userEvents);
        } else {
          // Jika tidak ada event user, tampilkan semua stored events
          setEvents(parsedEvents);
          setUserCreatedEvents(parsedEvents);
        }
      } else {
        console.log("No events found in storage");
        // Gunakan data fallback
        useFallbackEvents();
      }
    } catch (err) {
      console.error("Error loading events from storage:", err);
      useFallbackEvents();
    } finally {
      setLoadingEvents(false);
    }
  };

  /* ================= FALLBACK EVENTS ================= */
  const useFallbackEvents = () => {
    // Cek apakah ada event yang baru dibuat (dari localStorage)
    const lastCreatedEventId = localStorage.getItem("last_created_event_id");
    const lastCreatedEventData = localStorage.getItem(
      "last_created_event_data",
    );

    let fallbackEvents = [];

    // Jika ada data event yang baru dibuat
    if (lastCreatedEventData) {
      try {
        const eventData = JSON.parse(lastCreatedEventData);
        fallbackEvents = [eventData];
        console.log("Using last created event data:", eventData);
      } catch (e) {
        console.error("Error parsing last created event data:", e);
      }
    }

    // Jika tidak ada event, gunakan data statis
    if (fallbackEvents.length === 0) {
      fallbackEvents = [
        {
          id: 1,
          name: "Paskibra Championship 2024",
          organized_by: "Dinas Pendidikan Kota Cilegon",
          location: "Gedung Serba Guna, Cilegon",
          start_date: "2024-12-01",
          end_date: "2024-12-03",
          status: "upcoming",
          user_id: user?.id || 1,
        },
        {
          id: 2,
          name: "Lomba Paskibra Jawa Barat 2024",
          organized_by: "Pemprov Jawa Barat",
          location: "Bandung",
          start_date: "2024-11-15",
          end_date: "2024-11-17",
          status: "upcoming",
          user_id: user?.id || 1,
        },
      ];
    }

    setEvents(fallbackEvents);
    setUserCreatedEvents(fallbackEvents);
    console.log("Using fallback events:", fallbackEvents);
  };

  /* ================= MANUALLY ADD EVENT (jika tidak ada) ================= */
  const handleAddEventManually = () => {
    const eventName = prompt("Masukkan nama event:");
    if (!eventName) return;

    const eventDate = prompt("Masukkan tanggal event (format: YYYY-MM-DD):");
    if (!eventDate) return;

    const newEvent = {
      id: Date.now(), // Generate unique ID
      name: eventName,
      start_date: eventDate,
      end_date: eventDate,
      organized_by: user?.name || "User",
      location: "Belum ditentukan",
      user_id: user?.id || 0,
      manually_added: true,
    };

    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    setUserCreatedEvents(updatedEvents);

    // Simpan ke localStorage
    localStorage.setItem("user_created_events", JSON.stringify(updatedEvents));

    // Auto-select event yang baru ditambahkan
    setFormData((prev) => ({
      ...prev,
      event_id: newEvent.id,
    }));

    alert(`Event "${eventName}" berhasil ditambahkan!`);
  };

  /* ================= FORMAT DATE FOR DISPLAY ================= */
  const formatEventDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Tanggal belum ditentukan";
    }
  };

  /* ================= INITIAL FETCH ================= */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch categories dan load events secara parallel
        await Promise.all([fetchCategories(), loadUserCreatedEvents()]);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Gagal memuat data. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  /* ================= AUTO SELECT LAST CREATED EVENT ================= */
  useEffect(() => {
    // Coba ambil event_id dari localStorage (jika baru saja membuat event)
    const lastEventId = localStorage.getItem("last_created_event_id");
    if (lastEventId && events.length > 0) {
      // Cek apakah event_id tersebut ada di daftar events
      const eventExists = events.some((event) => event.id == lastEventId);
      if (eventExists) {
        setFormData((prev) => ({
          ...prev,
          event_id: lastEventId,
        }));
        console.log("Auto-selected last created event:", lastEventId);

        // Hapus dari localStorage setelah digunakan
        localStorage.removeItem("last_created_event_id");
      }
    }
  }, [events]);

  /* ================= FORM HANDLERS ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 5MB");
      return;
    }

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG, PNG, JPEG)");
      return;
    }

    setFormData((prev) => ({ ...prev, image: file }));
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview("");
  };

  const formatWhatsAppNumber = (value) => {
    const numbers = value.replace(/\D/g, "");

    if (numbers.startsWith("0")) {
      return numbers;
    } else if (numbers.startsWith("62")) {
      return "0" + numbers.slice(2);
    } else if (numbers.startsWith("+62")) {
      return "0" + numbers.slice(3);
    }

    return numbers;
  };

  const handleWhatsAppChange = (e) => {
    const value = e.target.value;
    const formatted = formatWhatsAppNumber(value);
    setFormData((prev) => ({ ...prev, coach_whatsapp: formatted }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    // Validasi required fields
    const requiredFields = [
      { field: "participant_category_id", name: "Kategori Peserta" },
      { field: "school_name", name: "Nama Sekolah" },
      { field: "school_address", name: "Alamat Sekolah" },
      { field: "coach", name: "Nama Pelatih" },
      { field: "coach_whatsapp", name: "Nomor WhatsApp Pelatih" },
    ];

    for (const { field, name } of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        setError(`${name} wajib diisi`);
        setSubmitting(false);
        return;
      }
    }

    try {
      const payload = new FormData();

      // Append semua field ke FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          payload.append(key, value);
        }
      });

      // Log data yang akan dikirim
      console.log("Submitting participant data...");
      console.log("Form data:", {
        ...formData,
        image: formData.image ? formData.image.name : "No image",
        event_name:
          events.find((e) => e.id == formData.event_id)?.name ||
          "No event selected",
      });

      const response = await api.post("/create-participant", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("API Response:", response.data);

      if (response.data.success) {
        const participantId = response.data.data?.id || Date.now();
        console.log("🎉 Participant created! ID:", participantId);

        // ========== SIMPAN PESERTA KE LOCALSTORAGE DAN EVENT ==========
        const newParticipant = {
          id: participantId,
          event_id: formData.event_id ? parseInt(formData.event_id) : null,
          participant_category_id: parseInt(formData.participant_category_id),
          school_name: formData.school_name,
          school_address: formData.school_address,
          coach: formData.coach,
          coach_whatsapp: formData.coach_whatsapp,
          image: imagePreview, // Simpan base64 preview
          created_at: new Date().toISOString(),
          from_api: true,
          api_response: response.data,
        };

        // ========== SIMPAN PESERTA KE EVENT (JIKA ADA EVENT_ID) ==========
        if (formData.event_id) {
          try {
            // 1. Simpan peserta ke array peserta event
            const eventParticipantsKey = `event_participants_${formData.event_id}`;
            let eventParticipants = [];

            try {
              const storedParticipants =
                localStorage.getItem(eventParticipantsKey);
              if (storedParticipants) {
                eventParticipants = JSON.parse(storedParticipants);
              }
            } catch (err) {
              console.error("Error parsing event participants:", err);
              eventParticipants = [];
            }

            // Tambahkan peserta baru
            eventParticipants.push(newParticipant);
            localStorage.setItem(
              eventParticipantsKey,
              JSON.stringify(eventParticipants),
            );
            console.log(`✅ Participant saved to event ${formData.event_id}:`, {
              event_id: formData.event_id,
              participant_id: participantId,
              total_participants_in_event: eventParticipants.length,
            });

            // 2. Update mapping event-peserta
            const eventParticipantsMap = JSON.parse(
              localStorage.getItem("event_participants_map") || "{}",
            );
            if (!eventParticipantsMap[formData.event_id]) {
              eventParticipantsMap[formData.event_id] = [];
            }
            eventParticipantsMap[formData.event_id].push(participantId);
            localStorage.setItem(
              "event_participants_map",
              JSON.stringify(eventParticipantsMap),
            );

            // 3. Update statistik peserta
            const participantStats = JSON.parse(
              localStorage.getItem("participant_stats") || "{}",
            );
            if (!participantStats[formData.event_id]) {
              participantStats[formData.event_id] = {
                event_name:
                  events.find((e) => e.id == formData.event_id)?.name ||
                  "Unknown Event",
                total_participants: 0,
                last_updated: new Date().toISOString(),
              };
            }
            participantStats[formData.event_id].total_participants =
              eventParticipants.length;
            participantStats[formData.event_id].last_updated =
              new Date().toISOString();
            localStorage.setItem(
              "participant_stats",
              JSON.stringify(participantStats),
            );

            // 4. Update data event di user_created_events
            const storedEvents = localStorage.getItem("user_created_events");
            if (storedEvents) {
              let allEvents = JSON.parse(storedEvents);
              const eventIndex = allEvents.findIndex(
                (e) => e.id == formData.event_id,
              );

              if (eventIndex !== -1) {
                // Update event dengan data peserta baru
                const updatedEvent = {
                  ...allEvents[eventIndex],
                  participants_count: eventParticipants.length,
                  participant_ids: [
                    ...(allEvents[eventIndex].participant_ids || []),
                    participantId,
                  ],
                  total_participants: eventParticipants.length,
                  updated_at: new Date().toISOString(),
                };

                allEvents[eventIndex] = updatedEvent;
                localStorage.setItem(
                  "user_created_events",
                  JSON.stringify(allEvents),
                );

                console.log(
                  `📊 Updated event ${formData.event_id} participant count to: ${eventParticipants.length}`,
                );
              }
            }
          } catch (storageError) {
            console.error(
              "❌ Error saving participant to event storage:",
              storageError,
            );
          }
        }

        // ========== SIMPAN PESERTA KE DAFTAR GLOBAL ==========
        try {
          const allParticipantsKey = "all_participants";
          let allParticipants = [];

          try {
            const storedAllParticipants =
              localStorage.getItem(allParticipantsKey);
            if (storedAllParticipants) {
              allParticipants = JSON.parse(storedAllParticipants);
            }
          } catch (err) {
            console.error("Error parsing all participants:", err);
            allParticipants = [];
          }

          allParticipants.push(newParticipant);
          localStorage.setItem(
            allParticipantsKey,
            JSON.stringify(allParticipants),
          );

          console.log("✅ Participant saved to global list:", {
            total_global_participants: allParticipants.length,
            participant_id: participantId,
          });
        } catch (globalError) {
          console.error("❌ Error saving to global participants:", globalError);
        }

        setSuccess(true);

        // Reset form setelah berhasil
        setTimeout(() => {
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
        }, 1500);

        // Redirect setelah 2 detik
        setTimeout(() => {
          navigate("/organizer/participants");
        }, 2000);
      } else {
        throw new Error(response.data.message || "Gagal menambahkan peserta");
      }
    } catch (err) {
      console.error("❌ Error submitting participant:", err);

      let errorMessage = "Terjadi kesalahan saat menyimpan data";

      if (err.response) {
        const serverError = err.response.data;
        if (serverError.message) {
          errorMessage = serverError.message;
        }
        if (serverError.errors) {
          const validationErrors = Object.values(serverError.errors).flat();
          errorMessage = validationErrors.join(", ");
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      // ========== FALLBACK: SIMPAN KE LOCALSTORAGE MESKI API GAGAL ==========
      try {
        if (formData.event_id || formData.school_name) {
          const fallbackParticipantId = Date.now();
          const fallbackParticipant = {
            id: fallbackParticipantId,
            event_id: formData.event_id ? parseInt(formData.event_id) : null,
            participant_category_id:
              parseInt(formData.participant_category_id) || 0,
            school_name: formData.school_name,
            school_address: formData.school_address,
            coach: formData.coach,
            coach_whatsapp: formData.coach_whatsapp,
            image: imagePreview,
            created_at: new Date().toISOString(),
            from_api: false,
            api_error: err.message,
          };

          // Simpan ke event jika ada event_id
          if (formData.event_id) {
            const eventParticipantsKey = `event_participants_${formData.event_id}`;
            let eventParticipants = [];

            try {
              const storedParticipants =
                localStorage.getItem(eventParticipantsKey);
              if (storedParticipants) {
                eventParticipants = JSON.parse(storedParticipants);
              }
            } catch (parseError) {
              eventParticipants = [];
            }

            eventParticipants.push(fallbackParticipant);
            localStorage.setItem(
              eventParticipantsKey,
              JSON.stringify(eventParticipants),
            );

            // Update event data
            const storedEvents = localStorage.getItem("user_created_events");
            if (storedEvents) {
              let allEvents = JSON.parse(storedEvents);
              const eventIndex = allEvents.findIndex(
                (e) => e.id == formData.event_id,
              );

              if (eventIndex !== -1) {
                allEvents[eventIndex].participants_count =
                  eventParticipants.length;
                allEvents[eventIndex].total_participants =
                  eventParticipants.length;
                allEvents[eventIndex].updated_at = new Date().toISOString();
                localStorage.setItem(
                  "user_created_events",
                  JSON.stringify(allEvents),
                );
              }
            }

            console.log("🔄 Saved fallback participant to event:", {
              event_id: formData.event_id,
              participant_id: fallbackParticipantId,
              total_participants: eventParticipants.length,
            });
          }

          // Simpan ke daftar global
          const allParticipantsKey = "all_participants";
          let allParticipants = [];

          try {
            const storedAllParticipants =
              localStorage.getItem(allParticipantsKey);
            if (storedAllParticipants) {
              allParticipants = JSON.parse(storedAllParticipants);
            }
          } catch (globalError) {
            allParticipants = [];
          }

          allParticipants.push(fallbackParticipant);
          localStorage.setItem(
            allParticipantsKey,
            JSON.stringify(allParticipants),
          );

          errorMessage +=
            "\n\n✅ Data telah disimpan secara lokal. " +
            "Peserta tetap dapat dilihat di daftar peserta.";
        }
      } catch (fallbackError) {
        console.error("❌ Error saving fallback participant:", fallbackError);
        errorMessage += "\n\n⚠️ Juga gagal menyimpan ke penyimpanan lokal.";
      }

      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= RENDER LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="mb-4"
        >
          <Loader className="text-blue-500" size={48} />
        </motion.div>
        <p className="text-gray-400">Memuat data...</p>
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
          <button
            onClick={() => navigate("/organizer/participants")}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            Kembali ke Daftar Peserta
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Tambah Peserta Baru
          </h1>
        </div>
        <p className="text-gray-400">
          Isi semua informasi peserta di bawah ini
        </p>

        {/* User Info */}
        {user && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-400">
              <span className="font-medium">User Login:</span> {user.name}
              <span className="mx-2">•</span>
              <span className="font-medium">ID:</span> {user.id}
            </p>
            {events.length > 0 && (
              <p className="text-xs text-blue-300 mt-1">
                Menampilkan {events.length} event yang tersedia
              </p>
            )}
          </div>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-400 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-red-400 font-medium">Terjadi Kesalahan</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
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
                  Pilih Event
                  <span className="text-xs text-gray-500">(Opsional)</span>
                </div>
              </label>

              {loadingEvents ? (
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl">
                  <Loader className="animate-spin text-gray-400" size={16} />
                  <span className="text-gray-400">Memuat daftar event...</span>
                </div>
              ) : events.length === 0 ? (
                <div className="space-y-3">
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                    <p className="text-yellow-400 text-sm">
                      Tidak ada event tersedia.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => navigate("/organizer/events/create")}
                      className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <PlusCircle size={18} />
                      Buat Event Baru
                    </button>
                    <button
                      type="button"
                      onClick={handleAddEventManually}
                      className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition-colors text-sm"
                    >
                      + Tambah Event Manual (Sementara)
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <select
                      name="event_id"
                      value={formData.event_id}
                      onChange={handleChange}
                      disabled={submitting}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
                    >
                      <option value="">-- Pilih Event --</option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.name}
                          {event.start_date &&
                            ` (${formatEventDate(event.start_date)})`}
                          {event.manually_added && " [Manual]"}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Info event yang dipilih */}
                  {formData.event_id && (
                    <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-xs text-blue-400">
                        <span className="font-medium">Event dipilih:</span>{" "}
                        {events.find((e) => e.id == formData.event_id)?.name}
                      </p>
                      {events.find((e) => e.id == formData.event_id)
                        ?.organized_by && (
                        <p className="text-xs text-blue-300 mt-1">
                          <span className="font-medium">Penyelenggara:</span>{" "}
                          {
                            events.find((e) => e.id == formData.event_id)
                              ?.organized_by
                          }
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => navigate("/organizer/events/create")}
                      className="text-xs px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors"
                    >
                      + Buat Event Baru
                    </button>
                    <button
                      type="button"
                      onClick={handleAddEventManually}
                      className="text-xs px-3 py-1.5 bg-gray-700/50 hover:bg-gray-700 text-gray-400 rounded-lg transition-colors"
                    >
                      + Tambah Manual
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Pilih event jika peserta mengikuti event tertentu
                  </p>
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

        {/* Debug Info (Hanya untuk development) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 p-4 bg-gray-900/50 border border-gray-700 rounded-xl">
            <h4 className="font-bold mb-2 text-sm text-gray-400">Debug Info</h4>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
              <div>
                <p>
                  <strong>User ID:</strong> {user?.id || "No user"}
                </p>
                <p>
                  <strong>Total Events:</strong> {events.length}
                </p>
                <p>
                  <strong>Event Selected:</strong> {formData.event_id || "None"}
                </p>
                <p>
                  <strong>Events Source:</strong>{" "}
                  {events.some((e) => e.manually_added)
                    ? "Manual/Storage"
                    : "Storage/Static"}
                </p>
              </div>
              <div>
                <p>
                  <strong>Categories:</strong> {categories.length}
                </p>
                <p>
                  <strong>Category Selected:</strong>{" "}
                  {formData.participant_category_id || "None"}
                </p>
                <p>
                  <strong>Has Image:</strong> {formData.image ? "Yes" : "No"}
                </p>
                <p>
                  <strong>Last Event ID in Storage:</strong>{" "}
                  {localStorage.getItem("last_created_event_id") || "None"}
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
            disabled={submitting || loadingCategories || loadingEvents}
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
