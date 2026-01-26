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
    if (id && user) {
      loadEventData();
    }
  }, [id, user]);

  /* ================= LOAD EVENT DATA ================= */
  const loadEventData = async () => {
    setLoading(true);
    setError("");

    try {
      console.log(`📥 Loading event data for ID: ${id}`);
      console.log(`👤 Current User ID: ${user?.id}`);
      console.log(`🔍 Looking for event ID: ${id} for user ${user?.id}`);

      // Coba load dari API endpoint /list-event-by-user terlebih dahulu
      try {
        console.log("🔄 Fetching events from /list-event-by-user...");
        const response = await api.get("/list-event-by-user");
        console.log("✅ List events API Response:", response.data);

        if (response.data.success) {
          let events = [];

          // Handle format response dari /list-event-by-user
          if (response.data.data && typeof response.data.data === "object") {
            // Debug: Tampilkan struktur data
            console.log("📊 Data structure from API:", response.data.data);

            // Coba berbagai kemungkinan struktur
            if (response.data.data.id) {
              // Single event object
              console.log("📦 Single event object returned from API");
              events = [response.data.data];
            } else if (Array.isArray(response.data.data)) {
              // Array langsung
              events = response.data.data;
            } else if (
              response.data.data.events &&
              Array.isArray(response.data.data.events)
            ) {
              // events array dalam object
              events = response.data.data.events;
            } else {
              // Cari properti lain yang mungkin berisi array
              for (const key in response.data.data) {
                if (Array.isArray(response.data.data[key])) {
                  events = response.data.data[key];
                  console.log(`📦 Found events array in property: ${key}`);
                  break;
                }
              }
            }
          }

          console.log(`📊 Total events processed from API: ${events.length}`);
          console.log("📦 Events structure from API:", events);

          // Debug: Tampilkan semua ID untuk verifikasi
          console.log("🔍 Available event IDs from API:");
          events.forEach((e, index) => {
            console.log(
              `  [${index}] ID: ${e.id}, Name: ${e.name || "No name"}, User ID: ${e.user_id || "No user ID"}`,
            );
          });

          // Cari event dengan ID yang sesuai
          const event = events.find((e) => {
            // Convert ID ke string untuk perbandingan yang aman
            const eventId = e.id?.toString();
            const searchId = id.toString();
            return eventId === searchId;
          });

          if (event) {
            console.log("✅ Found event in API:", event);

            // PERIKSA APAKAH EVENT MILIK USER YANG LOGIN
            const eventUserId = event.user_id?.toString();
            const currentUserId = user.id.toString();

            if (eventUserId && eventUserId !== currentUserId) {
              setError(
                "Anda tidak memiliki izin untuk mengedit event ini. Hanya pembuat event yang dapat mengedit.",
              );
              setLoading(false);
              return;
            }

            console.log("✅ Event ownership verified:", {
              eventUserId,
              currentUserId,
              match: eventUserId === currentUserId,
            });

            setEventData(event);
            populateForm(event);

            // Set image preview dari API jika ada
            if (event.image_url) {
              const fullImageUrl = formatImageUrl(event.image_url);
              console.log("🖼️ Formatted Image URL from API:", fullImageUrl);
              setImagePreview(fullImageUrl);
              setOriginalImage(fullImageUrl);
              testImageLoad(fullImageUrl);
            } else if (event.image) {
              const fullImageUrl = formatImageUrl(event.image);
              console.log("🖼️ Formatted Image from field:", fullImageUrl);
              setImagePreview(fullImageUrl);
              setOriginalImage(fullImageUrl);
              testImageLoad(fullImageUrl);
            } else {
              console.log("🖼️ No image found in API response");
            }

            setLoading(false);
            return;
          } else {
            console.log(`❌ Event ID ${id} not found in API response`);

            // Coba endpoint alternatif untuk mengambil event spesifik user
            console.log(
              "🔄 Trying to get user's events with user_id filter...",
            );
            try {
              // Coba ambil semua event kemudian filter berdasarkan user_id
              const allEventsResponse = await api.get("/list-event-by-user");
              if (allEventsResponse.data.success) {
                let allEvents = [];

                // Process all events
                if (Array.isArray(allEventsResponse.data.data)) {
                  allEvents = allEventsResponse.data.data;
                }

                // Filter events by user_id
                const userEvents = allEvents.filter(
                  (e) => e.user_id == user.id,
                );
                console.log(
                  `📊 Found ${userEvents.length} events for user ${user.id}`,
                );

                // Cari event dengan ID yang sesuai
                const userEvent = userEvents.find((e) => e.id == id);

                if (userEvent) {
                  console.log(
                    "✅ Found event in user's filtered events:",
                    userEvent,
                  );

                  setEventData(userEvent);
                  populateForm(userEvent);

                  if (userEvent.image_url) {
                    const fullImageUrl = formatImageUrl(userEvent.image_url);
                    setImagePreview(fullImageUrl);
                    setOriginalImage(fullImageUrl);
                  }

                  setLoading(false);
                  return;
                }
              }
            } catch (allEventsError) {
              console.log(
                "⚠️ Could not get all events:",
                allEventsError.message,
              );
            }
          }
        }
      } catch (apiError) {
        console.log("⚠️ API not available or error:", apiError.message);
      }

      // ========== FALLBACK KE LOCALSTORAGE ==========
      console.log("🔄 Falling back to localStorage...");
      const storedEvents = localStorage.getItem("user_created_events");
      if (storedEvents) {
        try {
          const events = JSON.parse(storedEvents);
          console.log(`📊 Total events in localStorage: ${events.length}`);

          // Debug: Tampilkan semua ID di localStorage
          console.log("🔍 Available event IDs in localStorage:");
          events.forEach((e, index) => {
            console.log(
              `  [${index}] ID: ${e.id}, Name: ${e.name || "No name"}, User ID: ${e.user_id || "No user ID"}, From API: ${e.from_api || false}`,
            );
          });

          const event = events.find((e) => e.id == id);

          if (event) {
            console.log("✅ Found event in localStorage:", event);

            // PERIKSA KEPEMILIKAN DI LOCALSTORAGE
            if (event.user_id && event.user_id != user.id) {
              setError(
                "Anda tidak memiliki izin untuk mengedit event ini. Hanya pembuat event yang dapat mengedit.",
              );
              setLoading(false);
              return;
            }

            console.log("✅ LocalStorage event ownership verified:", {
              eventUserId: event.user_id,
              currentUserId: user.id,
              match: event.user_id == user.id,
            });

            setEventData(event);
            populateForm(event);

            // Coba load image dari localStorage
            try {
              const storedImage = localStorage.getItem(`event_image_${id}`);
              if (storedImage) {
                console.log("🖼️ Image from localStorage (base64)");
                setImagePreview(storedImage);
                setOriginalImage(storedImage);
              } else if (event.image_url) {
                const fullImageUrl = formatImageUrl(event.image_url);
                console.log(
                  "🖼️ Image URL from localStorage data:",
                  fullImageUrl,
                );
                setImagePreview(fullImageUrl);
                setOriginalImage(fullImageUrl);
                testImageLoad(fullImageUrl);
              } else if (event.image) {
                const fullImageUrl = formatImageUrl(event.image);
                console.log(
                  "🖼️ Image from localStorage data field:",
                  fullImageUrl,
                );
                setImagePreview(fullImageUrl);
                setOriginalImage(fullImageUrl);
                testImageLoad(fullImageUrl);
              } else {
                console.log("🖼️ No image found in localStorage");
              }
            } catch (imageError) {
              console.error("Error loading image from storage:", imageError);
            }

            // Tampilkan warning jika event hanya ada di localStorage
            if (!event.from_api) {
              console.log(
                "⚠️ This event exists only in localStorage (not synced to API yet)",
              );
              if (!error) {
                setError(
                  "⚠️ Event ini disimpan secara lokal. Perubahan akan disimpan di browser Anda sampai tersinkronisasi dengan server.",
                );
              }
            }

            setLoading(false);
            return;
          } else {
            console.log(`❌ Event ID ${id} not found in localStorage`);
          }
        } catch (parseError) {
          console.error("Error parsing localStorage events:", parseError);
        }
      } else {
        console.log("❌ No events found in localStorage");
      }

      throw new Error(`Event dengan ID ${id} tidak ditemukan`);
    } catch (error) {
      console.error("❌ Error loading event:", error);
      setError("Gagal memuat data event. " + (error.message || ""));
    } finally {
      setLoading(false);
    }
  };

  /* ================= TEST IMAGE LOAD ================= */
  const testImageLoad = (url) => {
    console.log("🔄 Testing image load from URL:", url);

    const img = new Image();
    img.onload = function () {
      console.log("✅ Image loaded successfully:", url);
      console.log("📏 Image dimensions:", this.width, "x", this.height);
    };
    img.onerror = function () {
      console.error("❌ Failed to load image:", url);
    };
    img.src = url;
  };

  /* ================= POPULATE FORM ================= */
  const populateForm = (data) => {
    console.log("📝 Populating form with data:", data);

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

  /* ================= HANDLE IMAGE ================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Ukuran file maksimal 5MB");
        return;
      }

      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setError("Format file harus JPG, JPEG, PNG, atau GIF");
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));
      setError("");

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
  };

  /* ================= HANDLE SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Anda harus login untuk mengedit event");
      return;
    }

    // PERIKSA KEPEMILIKAN SEBELUM SUBMIT
    if (eventData && eventData.user_id != user.id) {
      setError(
        "Anda tidak memiliki izin untuk mengedit event ini. Hanya pembuat event yang dapat mengedit.",
      );
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

      // Prepare form data
      const submitData = new FormData();

      console.log("🔍 Debug sebelum submit:");
      console.log("  - Event ID:", id);
      console.log("  - User ID:", user.id);
      console.log("  - Event user_id:", eventData?.user_id);
      console.log("  - Event from_api:", eventData?.from_api);

      // Append semua field
      submitData.append("name", formData.name.trim());
      submitData.append("organized_by", formData.organized_by.trim());
      submitData.append("location", formData.location.trim());
      submitData.append("event_info", formData.event_info.trim());
      submitData.append("term_condition", formData.term_condition.trim());
      submitData.append("start_date", formData.start_date);
      submitData.append("end_date", formData.end_date);

      const userIdToUse = eventData?.user_id || user?.id;
      if (userIdToUse) {
        submitData.append("user_id", userIdToUse.toString());
        console.log("✅ Using user_id:", userIdToUse);
      }

      // ========== HANDLE EVENT SYNC ==========
      // Jika event hanya ada di localStorage (belum di API)
      if (eventData && !eventData.from_api) {
        console.log(
          "🔄 Event hanya ada di localStorage, mencoba sync ke API...",
        );

        // Coba sync dulu ke API menggunakan endpoint create
        const syncResponse = await api.post("/create-event", submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (syncResponse.data.success) {
          const newEventId = syncResponse.data.data?.id;
          console.log("✅ Event synced to API with new ID:", newEventId);

          // Update eventData dengan ID baru dari API
          const updatedEvent = {
            ...eventData,
            id: newEventId,
            from_api: true,
            api_response: syncResponse.data,
            image_url: syncResponse.data.data?.image_url || eventData.image_url,
          };

          setEventData(updatedEvent);
          setSuccess(true);

          // Update localStorage
          const storedEvents = localStorage.getItem("user_created_events");
          if (storedEvents) {
            let events = JSON.parse(storedEvents);
            const oldEventIndex = events.findIndex((e) => e.id == id);
            if (oldEventIndex !== -1) {
              // Hapus event lama
              events.splice(oldEventIndex, 1);
            }
            // Tambahkan event baru
            events.push(updatedEvent);
            localStorage.setItem("user_created_events", JSON.stringify(events));
          }

          // Update image
          if (imagePreview && !imagePreview.startsWith("http")) {
            localStorage.setItem(`event_image_${newEventId}`, imagePreview);
            localStorage.removeItem(`event_image_${id}`);
          }

          setTimeout(() => {
            navigate("/organizer/events");
          }, 2000);
          return;
        }
      }

      // Jika event sudah ada di API, gunakan endpoint edit
      submitData.append("_method", "PUT");

      if (formData.image) {
        submitData.append("image", formData.image);
        console.log("📸 Image included in payload:", formData.image.name);
      }

      console.log("📤 Submitting event update to /edit-event/" + id);

      const response = await api.post(`/edit-event/${id}`, submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ API Update Response:", response.data);

      if (response.data.success) {
        setSuccess(true);

        // Update localStorage
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
          image_url: response.data.data?.image_url || eventData?.image_url,
          image: response.data.data?.image || eventData?.image,
          user_id: user.id,
          last_updated_by: user.id,
          last_updated_at: new Date().toISOString(),
        };

        const storedEvents = localStorage.getItem("user_created_events");
        if (storedEvents) {
          let events = JSON.parse(storedEvents);
          const eventIndex = events.findIndex((e) => e.id == id);
          if (eventIndex !== -1) {
            events[eventIndex] = updatedEvent;
            localStorage.setItem("user_created_events", JSON.stringify(events));
          }
        }

        // Handle image storage
        if (
          formData.image &&
          imagePreview &&
          !imagePreview.startsWith("http")
        ) {
          localStorage.setItem(`event_image_${id}`, imagePreview);
        }

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
        errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
        setTimeout(() => {
          navigate("/auth/login");
        }, 2000);
      } else if (error.response?.status === 403) {
        errorMessage =
          "Akses ditolak: Anda tidak memiliki izin untuk mengedit event ini.";
      } else if (error.response?.status === 404) {
        errorMessage = "Event tidak ditemukan di server";
      } else if (error.response?.status === 422) {
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
      }

      // FALLBACK: UPDATE LOCALSTORAGE
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
          api_error: error.message || "API Error",
        };

        const storedEvents = localStorage.getItem("user_created_events");
        if (storedEvents) {
          let events = JSON.parse(storedEvents);
          const eventIndex = events.findIndex((e) => e.id == id);
          if (eventIndex !== -1 && events[eventIndex].user_id == user?.id) {
            events[eventIndex] = updatedEvent;
            localStorage.setItem("user_created_events", JSON.stringify(events));

            if (imagePreview && !imagePreview.startsWith("http")) {
              localStorage.setItem(`event_image_${id}`, imagePreview);
            }

            errorMessage +=
              "\n\n✅ Perubahan telah disimpan secara lokal (offline).";
          }
        }
      } catch (storageError) {
        console.error("❌ Error updating localStorage:", storageError);
        errorMessage += "\n\n⚠️ Gagal menyimpan perubahan secara lokal.";
      }

      setError(errorMessage);
    } finally {
      setSubmitting(false);
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
    // PERIKSA KEPEMILIKAN SEBELUM HAPUS
    if (eventData && eventData.user_id != user.id) {
      alert(
        "Anda tidak memiliki izin untuk menghapus event ini. Hanya pembuat event yang dapat menghapus.",
      );
      return;
    }

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
        console.log("✅ Event deleted from API");
      } catch (apiError) {
        console.log(
          "⚠️ API delete failed, continuing with localStorage...",
          apiError.message,
        );
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

  /* ================= FORMAT IMAGE URL ================= */
  const formatImageUrl = (imagePath) => {
    if (!imagePath) return null;

    console.log("🔄 Formatting image URL from:", imagePath);

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    if (imagePath.startsWith("storage/")) {
      return `https://apipaskibra.my.id/${imagePath}`;
    }

    if (imagePath.startsWith("/")) {
      return `https://apipaskibra.my.id${imagePath}`;
    }

    return `https://apipaskibra.my.id/storage/${imagePath}`;
  };

  /* ================= RENDER LOADING ================= */
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
            Event yang Anda cari tidak ditemukan atau Anda tidak memiliki akses
            untuk mengedit.
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
                    min={formData.start_date}
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
                          {imagePreview
                            ? "Klik untuk ganti gambar"
                            : "Klik untuk upload poster event"}
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, JPEG, GIF (max. 5MB)
                        </p>
                        {imagePreview && imagePreview.startsWith("http") && (
                          <p className="text-xs text-yellow-400 mt-1">
                            Gambar saat ini dari server
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
                          onError={(e) => {
                            console.error(
                              "❌ Error loading image:",
                              imagePreview,
                            );
                            e.target.src =
                              "https://via.placeholder.com/400x200?text=Image+Not+Found";
                          }}
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
                      {formData.image ? (
                        <p className="text-xs text-gray-400 mt-2 text-center">
                          {formData.image.name} (
                          {(formData.image.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      ) : imagePreview.startsWith("http") ? (
                        <div className="text-xs text-gray-400 mt-2 text-center">
                          <p>Gambar saat ini dari server</p>
                          <p className="text-xs truncate" title={imagePreview}>
                            {imagePreview.substring(0, 50)}...
                          </p>
                        </div>
                      ) : imagePreview.startsWith("data:image") ? (
                        <p className="text-xs text-gray-400 mt-2 text-center">
                          Gambar saat ini (disimpan di browser - base64)
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 mt-2 text-center">
                          Gambar tidak tersedia
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
                  if (eventData) {
                    populateForm(eventData);
                    setImagePreview(originalImage);
                  }
                  setError("");
                }}
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors font-medium disabled:opacity-50"
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
                    <strong>Pemilik Event:</strong>{" "}
                    {eventData.user_id == user?.id ? "Anda" : "User Lain"}
                  </p>
                  <p>
                    <strong>Dibuat pada:</strong>{" "}
                    {new Date(eventData.created_at).toLocaleString("id-ID")}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Status:</strong>{" "}
                    {eventData.from_api ? "Dari API" : "Lokal"}
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
                  {eventData.image_url && (
                    <p>
                      <strong>Image URL:</strong>{" "}
                      <span className="text-xs truncate block">
                        {eventData.image_url}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-6 p-4 bg-gray-900/50 border border-gray-700 rounded-xl">
          <h4 className="font-medium text-gray-300 mb-3">Debug Information:</h4>
          <div className="text-sm text-gray-400 space-y-2">
            <div>
              <strong>Event ID:</strong> {id}
            </div>
            <div>
              <strong>Event in localStorage:</strong> {eventData ? "Yes" : "No"}
            </div>
            <div>
              <strong>Event Owner ID:</strong> {eventData?.user_id || "Unknown"}
            </div>
            <div>
              <strong>Current User ID:</strong> {user?.id || "Not logged in"}
            </div>
            <div>
              <strong>Image Preview:</strong>{" "}
              {imagePreview
                ? imagePreview.substring(0, 50) + "..."
                : "No image"}
            </div>
            <div>
              <strong>Image Source:</strong>{" "}
              {imagePreview?.startsWith("http")
                ? "URL"
                : imagePreview
                  ? "Base64"
                  : "None"}
            </div>
            <div>
              <strong>Loaded from API:</strong>{" "}
              {eventData?.from_api ? "Yes" : "No"}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default EditEvent;
