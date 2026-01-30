import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  Crown,
  Search,
  CheckCircle,
  XCircle,
  Save,
  AlertCircle,
  Info,
  Loader,
  ChevronRight,
  Calendar,
  Filter,
  Shield,
  Award,
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

  // State untuk daftar semua users yang tersedia, dipisahkan berdasarkan role
  const [allJudges, setAllJudges] = useState([]); // Hanya users dengan role judge
  const [allOrganizers, setAllOrganizers] = useState([]); // Hanya users dengan role organizer

  // State untuk users yang sudah diassign ke event ini, dipisahkan berdasarkan role
  const [assignedJudges, setAssignedJudges] = useState([]);
  const [assignedOrganizers, setAssignedOrganizers] = useState([]);

  // State untuk pencarian dan filter
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // "all", "judge", "organizer"
  const [selectedJudgeIds, setSelectedJudgeIds] = useState([]);
  const [selectedOrganizerIds, setSelectedOrganizerIds] = useState([]);

  // Load event details dan data semua users
  useEffect(() => {
    if (!user || user.role !== "admin") {
      setError("Hanya admin yang dapat mengelola assignment users");
      setLoading(false);
      return;
    }

    if (!eventId) {
      setError("Event ID tidak ditemukan");
      setLoading(false);
      return;
    }

    fetchEventAndUsers();
  }, [user, eventId]);

  const fetchEventAndUsers = async () => {
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

      // 2. Fetch semua users dari endpoint
      try {
        const usersResponse = await api.get("/users-judge-organizer");
        console.log("Users API Response:", usersResponse.data);

        if (usersResponse.data?.success) {
          let usersData = [];

          if (Array.isArray(usersResponse.data.data)) {
            usersData = usersResponse.data.data;
          } else if (
            usersResponse.data.data &&
            Array.isArray(usersResponse.data.data.data)
          ) {
            usersData = usersResponse.data.data.data;
          } else if (
            usersResponse.data.data &&
            typeof usersResponse.data.data === "object"
          ) {
            usersData = Object.values(usersResponse.data.data);
          }

          // Pisahkan users berdasarkan role
          const judges = usersData.filter(
            (user) =>
              user.role?.toLowerCase() === "judge" ||
              user.role?.toLowerCase() === "juri",
          );

          const organizers = usersData.filter(
            (user) => user.role?.toLowerCase() === "organizer",
          );

          console.log(`✅ Judges loaded: ${judges.length}`);
          console.log(`✅ Organizers loaded: ${organizers.length}`);

          setAllJudges(judges);
          setAllOrganizers(organizers);

          if (judges.length === 0 && organizers.length === 0) {
            setError("Tidak ada judge atau organizer ditemukan di sistem.");
          }
        } else {
          setError("Gagal memuat data users. Format response tidak sesuai.");
        }
      } catch (usersErr) {
        console.error("Error fetching users:", usersErr);
        setError(`Gagal memuat data users: ${usersErr.message}`);
      }

      // 3. Load assigned users dari localStorage untuk development
      loadAssignedUsersFromLocalStorage();
    } catch (err) {
      console.error("Error in fetchEventAndUsers:", err);
      setError("Gagal memuat data. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Load assigned users dari localStorage
  const loadAssignedUsersFromLocalStorage = () => {
    try {
      const devAssignments = JSON.parse(
        localStorage.getItem("dev_assignments") || "[]",
      );

      const eventAssignment = devAssignments.find(
        (assignment) => assignment.event_id == eventId,
      );

      if (eventAssignment) {
        const allUsers = JSON.parse(localStorage.getItem("dev_users") || "[]");

        // Load assigned judges
        const judgeIds = eventAssignment.judges || [];
        const assignedJudgesData = judgeIds.map((judgeId) => {
          const judge = allUsers.find(
            (u) => u.id == judgeId || u.user_id == judgeId,
          );
          return (
            judge || { id: judgeId, name: `Juri ${judgeId}`, role: "judge" }
          );
        });
        setAssignedJudges(assignedJudgesData);
        setSelectedJudgeIds(judgeIds);

        // Load assigned organizers
        const organizerIds = eventAssignment.organizers || [];
        const assignedOrganizersData = organizerIds.map((organizerId) => {
          const organizer = allUsers.find(
            (u) => u.id == organizerId || u.user_id == organizerId,
          );
          return (
            organizer || {
              id: organizerId,
              name: `Organizer ${organizerId}`,
              role: "organizer",
            }
          );
        });
        setAssignedOrganizers(assignedOrganizersData);
        setSelectedOrganizerIds(organizerIds);

        console.log(
          `✅ Loaded ${assignedJudgesData.length} judges and ${assignedOrganizersData.length} organizers from localStorage`,
        );
      }
    } catch (err) {
      console.error("Error loading from localStorage:", err);
    }
  };

  // Simpan assignment ke localStorage
  const saveAssignmentToLocalStorage = () => {
    try {
      const devAssignments = JSON.parse(
        localStorage.getItem("dev_assignments") || "[]",
      );

      // Cari assignment existing
      const existingIndex = devAssignments.findIndex(
        (assignment) => assignment.event_id == eventId,
      );

      const assignmentData = {
        event_id: eventId,
        judges: selectedJudgeIds,
        organizers: selectedOrganizerIds,
        updated_at: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        devAssignments[existingIndex] = assignmentData;
      } else {
        devAssignments.push(assignmentData);
      }

      localStorage.setItem("dev_assignments", JSON.stringify(devAssignments));
      console.log(`💾 Saved assignment for event ${eventId} to localStorage`);
    } catch (err) {
      console.error("Error saving to localStorage:", err);
    }
  };

  // Filter users berdasarkan search term dan role
  const filteredUsers = () => {
    let users = [];

    // Gabungkan semua users berdasarkan filter role
    if (roleFilter === "all" || roleFilter === "judge") {
      users = [
        ...users,
        ...allJudges.map((j) => ({ ...j, userType: "judge" })),
      ];
    }
    if (roleFilter === "all" || roleFilter === "organizer") {
      users = [
        ...users,
        ...allOrganizers.map((o) => ({ ...o, userType: "organizer" })),
      ];
    }

    // Filter berdasarkan search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      users = users.filter((user) => {
        return (
          (user.name && user.name.toLowerCase().includes(term)) ||
          (user.email && user.email.toLowerCase().includes(term)) ||
          (user.username && user.username.toLowerCase().includes(term))
        );
      });
    }

    return users;
  };

  // Toggle selection untuk judge
  const toggleJudgeSelection = (judgeId) => {
    setSelectedJudgeIds((prev) => {
      if (prev.includes(judgeId)) {
        return prev.filter((id) => id !== judgeId);
      } else {
        return [...prev, judgeId];
      }
    });
  };

  // Toggle selection untuk organizer
  const toggleOrganizerSelection = (organizerId) => {
    setSelectedOrganizerIds((prev) => {
      if (prev.includes(organizerId)) {
        return prev.filter((id) => id !== organizerId);
      } else {
        return [...prev, organizerId];
      }
    });
  };

  // Handle submit assignment
  const handleSubmit = async () => {
    if (!user || user.role !== "admin") {
      setError("Hanya admin yang dapat mengelola assignment");
      return;
    }

    if (selectedJudgeIds.length === 0 && selectedOrganizerIds.length === 0) {
      setError("Pilih minimal satu juri atau organizer untuk diassign");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      console.log(`Submitting assignment for event ${eventId}`);
      console.log(`Selected judges: ${selectedJudgeIds.length}`);
      console.log(`Selected organizers: ${selectedOrganizerIds.length}`);

      // Simpan ke localStorage untuk development
      saveAssignmentToLocalStorage();

      // Kirim ke API jika diperlukan
      const totalSelected =
        selectedJudgeIds.length + selectedOrganizerIds.length;

      // Simulasikan API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess(true);

      // Update state assigned users
      const allUsers = JSON.parse(localStorage.getItem("dev_users") || "[]");

      // Update assigned judges
      const assignedJudgesData = selectedJudgeIds.map((judgeId) => {
        const judge = allUsers.find((u) => u.id == judgeId);
        return judge || { id: judgeId, name: `Juri ${judgeId}`, role: "judge" };
      });
      setAssignedJudges(assignedJudgesData);

      // Update assigned organizers
      const assignedOrganizersData = selectedOrganizerIds.map((organizerId) => {
        const organizer = allUsers.find((u) => u.id == organizerId);
        return (
          organizer || {
            id: organizerId,
            name: `Organizer ${organizerId}`,
            role: "organizer",
          }
        );
      });
      setAssignedOrganizers(assignedOrganizersData);

      setError(
        `✅ Berhasil assign ${totalSelected} user (${selectedJudgeIds.length} juri, ${selectedOrganizerIds.length} organizer)`,
      );

      // Redirect setelah beberapa detik
      setTimeout(() => {
        navigate(`/admin/events/list`);
      }, 3000);
    } catch (err) {
      console.error("Assignment Error:", err);
      setError(err.message || "Terjadi kesalahan saat menyimpan assignment");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle unassign judge
  const handleUnassignJudge = (judgeId) => {
    if (
      !window.confirm("Apakah Anda yakin ingin menghapus assignment juri ini?")
    ) {
      return;
    }

    const newSelectedIds = selectedJudgeIds.filter((id) => id !== judgeId);
    setSelectedJudgeIds(newSelectedIds);

    const newAssigned = assignedJudges.filter((j) => j.id !== judgeId);
    setAssignedJudges(newAssigned);

    saveAssignmentToLocalStorage();
    setError(`✅ Juri berhasil dihapus dari assignment`);
    setTimeout(() => setError(""), 3000);
  };

  // Handle unassign organizer
  const handleUnassignOrganizer = (organizerId) => {
    if (
      !window.confirm(
        "Apakah Anda yakin ingin menghapus assignment organizer ini?",
      )
    ) {
      return;
    }

    const newSelectedIds = selectedOrganizerIds.filter(
      (id) => id !== organizerId,
    );
    setSelectedOrganizerIds(newSelectedIds);

    const newAssigned = assignedOrganizers.filter((o) => o.id !== organizerId);
    setAssignedOrganizers(newAssigned);

    saveAssignmentToLocalStorage();
    setError(`✅ Organizer berhasil dihapus dari assignment`);
    setTimeout(() => setError(""), 3000);
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

  // Get role color
  const getRoleColor = (role) => {
    const lowerRole = role?.toLowerCase() || "";

    switch (lowerRole) {
      case "admin":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "judge":
      case "juri":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "organizer":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-white">
              Assign Users ke Event
            </h1>
            <p className="text-gray-400">
              Pilih juri dan organizer yang akan ditugaskan pada event ini
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
                      <span className="flex items-center gap-1">
                        <UserCheck size={14} className="text-blue-400" />
                        {assignedJudges.length} Juri Ditugaskan
                      </span>
                      <span className="flex items-center gap-1">
                        <Crown size={14} className="text-purple-400" />
                        {assignedOrganizers.length} Organizer Ditugaskan
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && !error.includes("✅") && !error.includes("ℹ️") && (
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

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-400 mt-0.5" />
            <div>
              <p className="text-green-400 font-medium">Berhasil!</p>
              <p className="text-green-300 text-sm mt-1">
                Assignment berhasil disimpan. Mengarahkan ke daftar event...
              </p>
            </div>
          </div>
        </div>
      )}

      {(error.includes("✅") || error.includes("ℹ️")) && (
        <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-blue-400 mt-0.5" />
            <div>
              <p className="text-blue-400 font-medium">Informasi</p>
              <p className="text-blue-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Available Users */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Daftar Users ({filteredUsers().length})
                </h3>
                <p className="text-gray-400 text-sm">
                  {allJudges.length} juri dan {allOrganizers.length} organizer
                  tersedia
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <UserCheck size={20} className="text-blue-400" />
                  <span className="text-white font-semibold">
                    {allJudges.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown size={20} className="text-purple-400" />
                  <span className="text-white font-semibold">
                    {allOrganizers.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Cari user berdasarkan nama atau email..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Semua Role</option>
                <option value="judge">Hanya Juri</option>
                <option value="organizer">Hanya Organizer</option>
              </select>
            </div>

            {/* Users List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredUsers().length === 0 ? (
                <div className="text-center py-8">
                  <Users size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Tidak ada user yang ditemukan</p>
                  {(searchTerm || roleFilter !== "all") && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setRoleFilter("all");
                      }}
                      className="mt-2 px-4 py-2 text-sm rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>
              ) : (
                filteredUsers().map((userItem) => {
                  const isJudge = userItem.userType === "judge";
                  const isSelected = isJudge
                    ? selectedJudgeIds.includes(userItem.id)
                    : selectedOrganizerIds.includes(userItem.id);
                  const isAssigned = isJudge
                    ? assignedJudges.some((j) => j.id === userItem.id)
                    : assignedOrganizers.some((o) => o.id === userItem.id);

                  return (
                    <div
                      key={userItem.id}
                      onClick={() =>
                        isJudge
                          ? toggleJudgeSelection(userItem.id)
                          : toggleOrganizerSelection(userItem.id)
                      }
                      className={`
                        p-4 rounded-xl border cursor-pointer transition-all
                        ${
                          isSelected
                            ? isJudge
                              ? "bg-blue-500/10 border-blue-500/30"
                              : "bg-purple-500/10 border-purple-500/30"
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
                                : isJudge
                                  ? "bg-blue-500/20 text-blue-400"
                                  : "bg-purple-500/20 text-purple-400"
                            }`}
                          >
                            {isJudge ? (
                              <UserCheck size={18} />
                            ) : (
                              <Crown size={18} />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-white">
                                {userItem.name || `User ${userItem.id}`}
                              </p>
                              <span
                                className={`px-2 py-0.5 text-xs rounded-full ${getRoleColor(userItem.role)}`}
                              >
                                {isJudge ? "Juri" : "Organizer"}
                              </span>
                              {isAssigned && (
                                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                                  Sudah Ditugaskan
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-400">
                              {userItem.email || "No email"}
                            </p>
                            {userItem.phone && (
                              <p className="text-xs text-gray-500 mt-1">
                                📱 {userItem.phone}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {isSelected ? (
                            <div
                              className={`p-1.5 rounded-lg ${
                                isJudge ? "bg-blue-500" : "bg-purple-500"
                              }`}
                            >
                              <CheckCircle size={16} className="text-white" />
                            </div>
                          ) : (
                            <div className="p-1.5 border border-gray-600 rounded-lg">
                              <div className="w-4 h-4 rounded-sm"></div>
                            </div>
                          )}
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
          {/* Assigned Judges Section */}
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <UserCheck size={20} className="text-blue-400" />
                <h3 className="font-semibold text-white">
                  Juri yang Ditugaskan
                </h3>
              </div>
              <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                {assignedJudges.length} juri
              </div>
            </div>
            <div className="space-y-2">
              {assignedJudges.length === 0 ? (
                <div className="text-center py-4">
                  <Award size={24} className="text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">
                    Belum ada juri yang ditugaskan
                  </p>
                </div>
              ) : (
                assignedJudges.map((judge, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 hover:bg-gray-800/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <UserCheck size={12} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white">
                          {judge.name || `Juri ${judge.id}`}
                        </p>
                        <p className="text-xs text-gray-400">
                          {judge.email || "No email"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnassignJudge(judge.id)}
                      className="p-1 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10"
                      title="Hapus assignment"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Assigned Organizers Section */}
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown size={20} className="text-purple-400" />
                <h3 className="font-semibold text-white">
                  Organizer yang Ditugaskan
                </h3>
              </div>
              <div className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                {assignedOrganizers.length} organizer
              </div>
            </div>
            <div className="space-y-2">
              {assignedOrganizers.length === 0 ? (
                <div className="text-center py-4">
                  <Shield size={24} className="text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">
                    Belum ada organizer yang ditugaskan
                  </p>
                </div>
              ) : (
                assignedOrganizers.map((organizer, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 hover:bg-gray-800/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Crown size={12} className="text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-white">
                          {organizer.name || `Organizer ${organizer.id}`}
                        </p>
                        <p className="text-xs text-gray-400">
                          {organizer.email || "No email"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnassignOrganizer(organizer.id)}
                      className="p-1 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10"
                      title="Hapus assignment"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-white mb-2">Actions</h4>
                <div className="space-y-2">
                  <button
                    onClick={handleSubmit}
                    disabled={
                      submitting ||
                      success ||
                      (selectedJudgeIds.length === 0 &&
                        selectedOrganizerIds.length === 0)
                    }
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white" />
                        <span>Menyimpan assignment...</span>
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        <span>Simpan Assignment</span>
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
                <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-blue-400">
                    {selectedJudgeIds.length}
                  </p>
                  <p className="text-xs text-gray-400">Juri Dipilih</p>
                </div>
                <div className="text-center p-3 bg-purple-500/10 rounded-lg">
                  <p className="text-2xl font-bold text-purple-400">
                    {selectedOrganizerIds.length}
                  </p>
                  <p className="text-xs text-gray-400">Organizer Dipilih</p>
                </div>
              </div>

              {/* Total Summary */}
              <div className="pt-4 border-t border-gray-700">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white mb-1">
                    {selectedJudgeIds.length + selectedOrganizerIds.length}
                  </p>
                  <p className="text-sm text-gray-400">
                    Total User Akan Diassign
                  </p>
                  <div className="flex justify-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-xs text-gray-400">
                        {selectedJudgeIds.length} Juri
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-xs text-gray-400">
                        {selectedOrganizerIds.length} Organizer
                      </span>
                    </div>
                  </div>
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
