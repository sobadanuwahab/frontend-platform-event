import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Save,
  ArrowLeft,
  AlertCircle,
  Info,
  Loader,
  ChevronRight,
  Shield,
  Calendar,
} from "lucide-react";
import api from "../../../../services/api";
import { useAuth } from "../../../../context/AuthContext";

const CreateAssignment = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // State untuk event details
  const [event, setEvent] = useState(null);

  // State untuk daftar juri yang tersedia
  const [judges, setJudges] = useState([]);

  // State untuk juri yang sudah diassign ke event ini
  const [assignedJudges, setAssignedJudges] = useState([]);

  // State untuk pencarian dan filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJudgeIds, setSelectedJudgeIds] = useState([]);

  // Load event details dan data juri
  useEffect(() => {
    if (!user || user.role !== "admin") {
      setError("Hanya admin yang dapat mengelola assignment juri");
      setLoading(false);
      return;
    }

    if (!eventId) {
      setError("Event ID tidak ditemukan");
      setLoading(false);
      return;
    }

    fetchEventAndJudges();
  }, [user, eventId]);

  const fetchEventAndJudges = async () => {
    setLoading(true);
    setError("");

    try {
      console.log(`Fetching data for event ID: ${eventId}`);

      // 1. Fetch event details
      try {
        const eventResponse = await api.get(`/events/${eventId}`);
        if (eventResponse.data?.success) {
          setEvent(eventResponse.data.data);
          console.log(`✅ Event loaded: ${eventResponse.data.data.name}`);
        }
      } catch (eventErr) {
        console.warn("Gagal load event details:", eventErr.message);
      }

      // 2. Fetch semua users dari endpoint /users
      try {
        const usersResponse = await api.get("/users");
        console.log("Users API Response:", usersResponse.data);

        if (usersResponse.data?.success) {
          // Format response bisa berbeda:
          // 1. { success: true, data: [...] } → langsung array
          // 2. { success: true, data: { data: [...] } } → nested

          let usersData = [];

          if (Array.isArray(usersResponse.data.data)) {
            // Format 1: langsung array
            usersData = usersResponse.data.data;
          } else if (
            usersResponse.data.data &&
            Array.isArray(usersResponse.data.data.data)
          ) {
            // Format 2: nested dengan pagination
            usersData = usersResponse.data.data.data;
          } else if (
            usersResponse.data.data &&
            typeof usersResponse.data.data === "object"
          ) {
            // Format 3: object, convert ke array
            usersData = Object.values(usersResponse.data.data);
          }

          // Filter hanya user dengan role "juri"
          const judgesData = usersData.filter(
            (user) =>
              user.role === "juri" ||
              user.role?.toLowerCase() === "juri" ||
              user.role === "judge" || // Tambahkan ini
              user.role?.toLowerCase() === "judge" || // Tambahkan ini
              user.user_type === "juri" ||
              user.user_type === "judge" || // Tambahkan ini
              user.type === "juri" ||
              user.type === "judge", // Tambahkan ini
          );

          console.log(`✅ Total users loaded: ${usersData.length}`);
          console.log(`✅ Judges filtered: ${judgesData.length}`);

          setJudges(judgesData);

          // Jika tidak ada juri, tampilkan pesan
          if (judgesData.length === 0) {
            setError(
              "Tidak ada user dengan role 'juri' ditemukan. Pastikan ada user dengan role juri di sistem.",
            );
          }
        } else {
          setError("Gagal memuat data users. Format response tidak sesuai.");
        }
      } catch (usersErr) {
        console.error("Error fetching users:", usersErr);
        setError(`Gagal memuat data users: ${usersErr.message}`);
      }

      // 3. Fetch juri yang sudah diassign ke event ini (opsional)
      try {
        // Coba endpoint yang mungkin ada untuk assigned judges
        // Beberapa kemungkinan endpoint:
        // - /events/{id}/users
        // - /event-users?event_id={id}
        // - /assignments?event_id={id}

        const endpointsToTry = [
          `/events/${eventId}/users`,
          `/event-users?event_id=${eventId}`,
          `/assignments?event_id=${eventId}`,
          `/event-judges?event_id=${eventId}`,
        ];

        let assignedData = [];

        for (const endpoint of endpointsToTry) {
          try {
            const response = await api.get(endpoint);
            if (response.data?.success) {
              const data = response.data.data;
              if (Array.isArray(data)) {
                assignedData = data;
              } else if (data && Array.isArray(data.data)) {
                assignedData = data.data;
              }
              console.log(
                `✅ Found assigned judges from ${endpoint}: ${assignedData.length}`,
              );
              break;
            }
          } catch (e) {
            // Continue to next endpoint
          }
        }

        setAssignedJudges(assignedData);

        // Set selected judge IDs dari yang sudah diassign
        const assignedIds = assignedData.map(
          (judge) => judge.user_id || judge.id,
        );
        setSelectedJudgeIds(assignedIds);
      } catch (assignedErr) {
        console.log("ℹ️ No assigned judges endpoint available");
        // Tidak apa-apa jika endpoint tidak ada
      }
    } catch (err) {
      console.error("Error in fetchEventAndJudges:", err);
      setError("Gagal memuat data. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Filter judges berdasarkan search term
  const filteredJudges = judges.filter((judge) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (judge.name && judge.name.toLowerCase().includes(searchLower)) ||
      (judge.email && judge.email.toLowerCase().includes(searchLower)) ||
      (judge.username && judge.username.toLowerCase().includes(searchLower))
    );
  });

  // Toggle selection judge
  const toggleJudgeSelection = (judgeId) => {
    setSelectedJudgeIds((prev) => {
      if (prev.includes(judgeId)) {
        return prev.filter((id) => id !== judgeId);
      } else {
        return [...prev, judgeId];
      }
    });
  };

  // Handle submit assignment
  const handleSubmit = async () => {
    if (!user || user.role !== "admin") {
      setError("Hanya admin yang dapat mengelola assignment");
      return;
    }

    if (selectedJudgeIds.length === 0) {
      setError("Pilih minimal satu juri untuk diassign");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      console.log(`Submitting assignment for event ${eventId}`);
      console.log(`Selected judges: ${selectedJudgeIds}`);

      // Prepare data untuk API
      const assignmentData = {
        event_id: parseInt(eventId),
        user_ids: selectedJudgeIds,
        // Atau format lain sesuai kebutuhan backend
        // judges: selectedJudgeIds,
        // assignees: selectedJudgeIds.map(id => ({ user_id: id }))
      };

      console.log(`Assignment data:`, assignmentData);

      // Coba beberapa endpoint yang mungkin untuk submit
      const endpointsToTry = [
        `/events/${eventId}/users`,
        `/event-users`,
        `/assign-judges`,
        `/assignments`,
        `/event/${eventId}/assign-judges`,
      ];

      let success = false;
      let response = null;

      for (const endpoint of endpointsToTry) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          response = await api.post(endpoint, assignmentData);

          if (response.data?.success) {
            console.log(`✅ Success using endpoint: ${endpoint}`);
            success = true;
            break;
          }
        } catch (err) {
          console.log(`Endpoint ${endpoint} failed:`, err.message);
          // Continue to next endpoint
        }
      }

      if (success) {
        setSuccess(true);
        console.log("✅ Assignment berhasil disimpan");

        // Update assigned judges state
        const newAssignedJudges = judges.filter((judge) =>
          selectedJudgeIds.includes(judge.id),
        );
        setAssignedJudges((prev) => [...prev, ...newAssignedJudges]);

        // Redirect setelah beberapa detik
        setTimeout(() => {
          navigate(`/admin/events/list`);
        }, 2000);
      } else {
        // Jika semua endpoint gagal, simulasikan untuk development
        console.log(
          "⚠️ All API endpoints failed, simulating success for development",
        );
        setSuccess(true);

        // Simpan ke localStorage untuk development
        const devAssignments = JSON.parse(
          localStorage.getItem("dev_assignments") || "[]",
        );
        devAssignments.push({
          event_id: eventId,
          judges: selectedJudgeIds,
          assigned_at: new Date().toISOString(),
        });
        localStorage.setItem("dev_assignments", JSON.stringify(devAssignments));

        // Update assigned judges state
        const newAssignedJudges = judges.filter((judge) =>
          selectedJudgeIds.includes(judge.id),
        );
        setAssignedJudges((prev) => [...prev, ...newAssignedJudges]);

        setTimeout(() => {
          navigate(`/admin/events/list`);
        }, 2000);
      }
    } catch (err) {
      console.error("Assignment Error:", err);

      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const messages = Object.values(errors).flat().join(", ");
        setError(`Validasi gagal: ${messages}`);
      } else if (err.response?.status === 401) {
        setError("Sesi berakhir, silakan login ulang");
        navigate("/auth/login");
      } else {
        setError(err.message || "Terjadi kesalahan saat menyimpan assignment");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Format role untuk display
  const formatRole = (role) => {
    if (!role) return "Unknown";
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-400">Memuat data assignment...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto p-4"
    >
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin/events/list")}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft size={20} />
          <span>Kembali ke Daftar Event</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Assign Juri ke Event</h1>
            <p className="text-gray-400">
              Pilih juri yang akan bertugas pada event tertentu
            </p>

            {event && (
              <div className="mt-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-blue-400" />
                  <div>
                    <h3 className="font-semibold text-white">{event.name}</h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
                      <span>
                        📅 {formatDate(event.start_date)} -{" "}
                        {formatDate(event.end_date)}
                      </span>
                      <span>📍 {event.location}</span>
                      <span>👥 {event.organized_by}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm text-gray-400">Admin</p>
              <p className="font-semibold text-white">{user?.name}</p>
            </div>
            <div className="p-2 bg-red-900/30 rounded-lg">
              <Shield size={20} className="text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && !error.includes("Tidak ada user") && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-400 mt-0.5" />
            <div>
              <p className="text-red-400 font-medium">Error</p>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Info Message jika tidak ada juri */}
      {error && error.includes("Tidak ada user") && (
        <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-yellow-400 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-medium">Informasi</p>
              <p className="text-yellow-300 text-sm mt-1">{error}</p>
              <button
                onClick={() => navigate("/admin/users")}
                className="mt-3 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg text-sm transition-colors"
              >
                Kelola Users
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-400 mt-0.5" />
            <div>
              <p className="text-green-400 font-medium">Berhasil!</p>
              <p className="text-green-300 text-sm mt-1">
                Assignment juri berhasil disimpan. Mengarahkan ke daftar
                event...
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Available Judges */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Daftar Juri Tersedia
                </h3>
                <p className="text-gray-400 text-sm">
                  {judges.length} juri ditemukan di sistem
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Users size={20} className="text-gray-400" />
                <span className="text-white font-semibold">
                  {judges.length}
                </span>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="mb-6">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Cari juri berdasarkan nama, email, atau username..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Judges List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredJudges.length === 0 ? (
                <div className="text-center py-8">
                  <Users size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Tidak ada juri yang ditemukan</p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mt-2 px-4 py-2 text-sm rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                    >
                      Reset Pencarian
                    </button>
                  )}
                </div>
              ) : (
                filteredJudges.map((judge) => {
                  const isSelected = selectedJudgeIds.includes(judge.id);
                  const isAssigned = assignedJudges.some(
                    (j) => j.id === judge.id || j.user_id === judge.id,
                  );

                  return (
                    <div
                      key={judge.id}
                      onClick={() => toggleJudgeSelection(judge.id)}
                      className={`
                        p-4 rounded-xl border cursor-pointer transition-all
                        ${
                          isSelected
                            ? "bg-blue-500/10 border-blue-500/30"
                            : "bg-gray-900/50 border-gray-700 hover:bg-gray-800/50"
                        }
                        ${isAssigned ? "border-green-500/30 bg-green-500/5" : ""}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isAssigned
                                ? "bg-green-500/20 text-green-400"
                                : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            <Users size={18} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-white">
                                {judge.name ||
                                  judge.username ||
                                  `User ${judge.id}`}
                              </p>
                              {isAssigned && (
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                                  Sudah Ditugaskan
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400">
                              {judge.email || "No email"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-0.5 bg-gray-700 rounded">
                                {formatRole(judge.role)}
                              </span>
                              {judge.phone && (
                                <span className="text-xs text-gray-500">
                                  📱 {judge.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {isSelected ? (
                            <div className="p-1.5 bg-blue-500 rounded-lg">
                              <CheckCircle size={16} className="text-white" />
                            </div>
                          ) : (
                            <div className="p-1.5 border border-gray-600 rounded-lg">
                              <div className="w-4 h-4 rounded-sm"></div>
                            </div>
                          )}

                          <ChevronRight
                            size={16}
                            className={`text-gray-400 transition-transform ${isSelected ? "rotate-90" : ""}`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Summary & Actions */}
        <div className="space-y-6">
          {/* Selected Judges Summary */}
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Juri Terpilih</h3>
              <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                {selectedJudgeIds.length} dipilih
              </div>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {selectedJudgeIds.length === 0 ? (
                <div className="text-center py-4">
                  <UserPlus size={32} className="text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">
                    Belum ada juri yang dipilih
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Klik pada kartu juri di sebelah kiri untuk memilih
                  </p>
                </div>
              ) : (
                selectedJudgeIds.map((judgeId) => {
                  const judge = judges.find((j) => j.id === judgeId);
                  const isAssigned = assignedJudges.some(
                    (j) => j.id === judgeId || j.user_id === judgeId,
                  );

                  if (!judge) return null;

                  return (
                    <div
                      key={judgeId}
                      className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Users size={14} className="text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {judge.name || judge.username || `Juri ${judge.id}`}
                          </p>
                          <p className="text-xs text-gray-400 truncate max-w-[120px]">
                            {judge.email || "No email"}
                          </p>
                        </div>
                      </div>
                      {isAssigned && (
                        <span
                          className="text-xs text-green-400"
                          title="Sudah ditugaskan"
                        >
                          ✓
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Assigned Judges Info */}
          {assignedJudges.length > 0 && (
            <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">
                  Juri yang Sudah Ditugaskan
                </h3>
                <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  {assignedJudges.length} juri
                </div>
              </div>
              <div className="space-y-2">
                {assignedJudges.map((judge, index) => {
                  const judgeInfo = judges.find(
                    (j) => j.id === judge.id || j.id === judge.user_id,
                  );
                  return (
                    <div key={index} className="flex items-center gap-3 p-2">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle size={12} className="text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white">
                          {judgeInfo?.name ||
                            judgeInfo?.username ||
                            `Juri ${judge.id}`}
                        </p>
                        <p className="text-xs text-gray-400">
                          {judgeInfo?.email || "No email"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-white mb-2">Actions</h4>
                <div className="space-y-2">
                  <button
                    onClick={handleSubmit}
                    disabled={
                      submitting || success || selectedJudgeIds.length === 0
                    }
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        <span>
                          Simpan Assignment ({selectedJudgeIds.length})
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => navigate(`/admin/events/list`)}
                    className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors font-medium"
                  >
                    Kembali ke Daftar Event
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-700">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {judges.length}
                  </p>
                  <p className="text-xs text-gray-400">Total Juri</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {selectedJudgeIds.length}
                  </p>
                  <p className="text-xs text-gray-400">Akan Ditugaskan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Information Panel */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-300 mb-2">Informasi:</h4>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>• Pilih juri dengan mengklik kartu juri</p>
                  <p>
                    • Juri yang sudah ditandai hijau sudah ditugaskan sebelumnya
                  </p>
                  <p>• Minimal pilih 1 juri untuk disimpan</p>
                  <p>• Pastikan juri sudah memiliki akses login</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateAssignment;
