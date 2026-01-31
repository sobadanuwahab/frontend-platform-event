import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  CheckCircle,
  XCircle,
  Save,
  AlertCircle,
  Info,
  Loader,
  ChevronRight,
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

  // State untuk daftar semua users yang tersedia
  const [allUsers, setAllUsers] = useState([]);

  // State untuk users yang sudah diassign ke event ini
  const [assignedUsers, setAssignedUsers] = useState([]);

  // State untuk pencarian dan filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);

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
      // try {
      //   const eventResponse = await api.get(`/events/${eventId}`);
      //   if (eventResponse.data?.success) {
      //     setEvent(eventResponse.data.data);
      //     console.log(`✅ Event loaded: ${eventResponse.data.data.name}`);
      //   }
      // } catch (eventErr) {
      //   console.warn("Gagal load event details:", eventErr.message);
      // }

      // 2. Fetch semua users dari endpoint /users (TANPA FILTER ROLE)
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

          // Debug: Log semua users dengan role mereka
          console.log(
            "All users loaded:",
            usersData.map((u) => ({
              id: u.id,
              name: u.name,
              role: u.role,
              email: u.email,
            })),
          );

          // TANPA FILTER - ambil semua users
          setAllUsers(usersData);

          console.log(`✅ Total users loaded: ${usersData.length}`);

          // Jika tidak ada users sama sekali
          if (usersData.length === 0) {
            setError("Tidak ada user ditemukan di sistem.");
          }
        } else {
          setError("Gagal memuat data users. Format response tidak sesuai.");
        }
      } catch (usersErr) {
        console.error("Error fetching users:", usersErr);
        setError(`Gagal memuat data users: ${usersErr.message}`);
      }

      // 3. Fetch users yang sudah diassign ke event ini
      // try {
      //   const endpoint = `/events/${eventId}/users`;
      //   console.log(`Fetching assigned users from: ${endpoint}`);

      //   const response = await api.get(endpoint);

      //   if (response.data?.success) {
      //     let assignedData = response.data.data;

      //     if (
      //       !Array.isArray(assignedData) &&
      //       assignedData &&
      //       Array.isArray(assignedData.data)
      //     ) {
      //       assignedData = assignedData.data;
      //     }

      //     if (!Array.isArray(assignedData)) {
      //       assignedData = [];
      //     }

      //     console.log(`✅ Found assigned users: ${assignedData.length}`);
      //     console.log("Assigned users details:", assignedData);

      //     setAssignedUsers(assignedData);

      //     // Set selected user IDs dari yang sudah diassign
      //     const assignedIds = assignedData
      //       .map((user) => user.user_id || user.id)
      //       .filter((id) => id); // Filter null/undefined

      //     console.log("Assigned user IDs:", assignedIds);
      //     setSelectedUserIds(assignedIds);
      //   }
      // } catch (assignedErr) {
      //   console.log(
      //     "ℹ️ No assigned users found or endpoint not available:",
      //     assignedErr.message,
      //   );
      //   // Tidak apa-apa jika endpoint tidak ada atau belum ada assigned users
      // }
    } catch (err) {
      console.error("Error in fetchEventAndUsers:", err);
      setError("Gagal memuat data. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Filter users berdasarkan search term
  const filteredUsers = allUsers.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.username && user.username.toLowerCase().includes(searchLower)) ||
      (user.role && user.role.toLowerCase().includes(searchLower))
    );
  });

  // Toggle selection user
  const toggleUserSelection = (userId) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  // Handle submit assignment - MENGIRIM SATU PER SATU
  const handleSubmit = async () => {
    if (!user || user.role !== "admin") {
      setError("Hanya admin yang dapat mengelola assignment");
      return;
    }

    if (selectedUserIds.length === 0) {
      setError("Pilih minimal satu user untuk diassign");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      console.log(`Submitting assignment for event ${eventId}`);
      console.log(`Selected users IDs: ${selectedUserIds}`);

      // Verifikasi bahwa yang dipilih benar-benar users
      const selectedUsers = allUsers.filter((j) =>
        selectedUserIds.includes(j.id),
      );
      console.log("Selected users details:", selectedUsers);

      // Kirim assignment satu per satu karena API hanya menerima single user_id
      const results = [];
      const endpoint = `/events/${eventId}/users`;

      for (const userId of selectedUserIds) {
        // Skip jika user sudah diassign
        const alreadyAssigned = assignedUsers.some(
          (j) => j.id === userId || j.user_id === userId,
        );

        if (alreadyAssigned) {
          console.log(`⏭️ User ${userId} already assigned, skipping`);
          results.push({
            userId,
            success: true,
            message: "Already assigned",
            skipped: true,
          });
          continue;
        }

        try {
          const assignmentData = {
            user_id: userId, // Hanya single user_id seperti format API
          };

          console.log(
            `📤 Assigning user ${userId} to event ${eventId}`,
            assignmentData,
          );

          const response = await api.post(endpoint, assignmentData);

          if (response.data?.success) {
            console.log(`✅ Success assigning user ${userId}`);
            results.push({
              userId,
              success: true,
              data: response.data,
              message: response.data?.message || "Success",
            });
          } else {
            console.log(`⚠️ Failed assigning user ${userId}:`, response.data);
            results.push({
              userId,
              success: false,
              error: response.data?.message || "Unknown error",
            });
          }
        } catch (err) {
          console.error(
            `❌ Error assigning user ${userId}:`,
            err.response?.data || err.message,
          );
          results.push({
            userId,
            success: false,
            error: err.response?.data?.message || err.message,
          });
        }
      }

      // Analisis hasil
      const successfulAssignments = results.filter(
        (r) => r.success && !r.skipped,
      );
      const skippedAssignments = results.filter((r) => r.skipped);
      const failedAssignments = results.filter((r) => !r.success);

      if (successfulAssignments.length > 0 || skippedAssignments.length > 0) {
        setSuccess(true);

        // Refresh data untuk mendapatkan updated assigned users
        await fetchEventAndUsers();

        // Tampilkan pesan sukses
        let successMessage = "";

        if (successfulAssignments.length > 0 && skippedAssignments.length > 0) {
          successMessage = `✅ ${successfulAssignments.length} user berhasil diassign, ${skippedAssignments.length} sudah ditugaskan sebelumnya.`;
        } else if (successfulAssignments.length > 0) {
          successMessage = `✅ ${successfulAssignments.length} user berhasil diassign.`;
        } else {
          successMessage = `ℹ️ Semua user yang dipilih sudah ditugaskan sebelumnya.`;
        }

        // Tambahkan pesan error jika ada yang gagal
        if (failedAssignments.length > 0) {
          const failedNames = failedAssignments
            .map((f) => {
              const user = selectedUsers.find((j) => j.id === f.userId);
              return `${user?.name || `User ${f.userId}`} (${user?.role})`;
            })
            .join(", ");

          setError(`${successMessage} Gagal assign: ${failedNames}`);
        } else {
          setError(""); // Clear error
        }

        console.log(successMessage);

        // Redirect setelah beberapa detik
        setTimeout(() => {
          navigate(`/admin/events/list`);
        }, 3000);
      } else {
        // Semua gagal
        const errorMessages = failedAssignments
          .map((f) => {
            const user = selectedUsers.find((j) => j.id === f.userId);
            return `${user?.name || `User ${f.userId}`}: ${f.error}`;
          })
          .join("; ");

        setError(`Gagal mengassign user: ${errorMessages}`);
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
      } else if (err.response?.status === 403) {
        setError("Anda tidak memiliki izin untuk melakukan assignment");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || "Terjadi kesalahan saat menyimpan assignment");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle unassign user
  const handleUnassign = async (userId) => {
    if (
      !window.confirm(`Apakah Anda yakin ingin menghapus assignment user ini?`)
    ) {
      return;
    }

    try {
      const endpoint = `/events/${eventId}/users/${userId}`;
      console.log(`Unassigning user ${userId} from event ${eventId}`);

      const response = await api.delete(endpoint);

      if (response.data?.success) {
        console.log(`✅ Success unassigning user ${userId}`);

        // Update state
        setAssignedUsers((prev) =>
          prev.filter((j) => j.id !== userId && j.user_id !== userId),
        );

        setSelectedUserIds((prev) => prev.filter((id) => id !== userId));

        // Refresh data
        fetchEventAndUsers();

        // Show success message
        setError(`✅ User berhasil dihapus dari assignment`);
        setTimeout(() => setError(""), 3000);
      } else {
        setError("Gagal menghapus assignment");
      }
    } catch (err) {
      console.error("Unassign Error:", err);
      setError(err.response?.data?.message || "Gagal menghapus assignment");
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

    const roleMap = {
      judge: "Juri",
      juri: "Juri",
      admin: "Admin",
      organizer: "Organizer",
      user: "User",
    };

    const lowerRole = role.toLowerCase();
    return (
      roleMap[lowerRole] ||
      role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
    );
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
      case "user":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
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
      className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Assign Users ke Event</h1>
            <p className="text-gray-400">
              Pilih users yang akan ditugaskan pada event tertentu (semua role)
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
                        <Users size={14} />
                        {assignedUsers.length} Users Ditugaskan
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && !error.includes("Tidak ada user") && !error.includes("✅") && (
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

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-400 mt-0.5" />
            <div>
              <p className="text-green-400 font-medium">Berhasil!</p>
              <p className="text-green-300 text-sm mt-1">
                Assignment users berhasil disimpan. Mengarahkan ke daftar
                event...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success/Info Message */}
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

      {/* Info Message jika tidak ada users */}
      {error && error.includes("Tidak ada user") && (
        <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-yellow-400 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-medium">Informasi</p>
              <p className="text-yellow-300 text-sm mt-1">{error}</p>
              <button
                onClick={() => navigate("/admin/users")}
                className="mt-3 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg text-sm transition-colors">
                Kelola Users
              </button>
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
                  Daftar Users ({allUsers.length})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Users size={20} className="text-gray-400" />
                <span className="text-white font-semibold">
                  {allUsers.length}
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
                  placeholder="Cari user berdasarkan nama, email, username, atau role..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Users List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8">
                  <Users size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Tidak ada user yang ditemukan</p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="mt-2 px-4 py-2 text-sm rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors">
                      Reset Pencarian
                    </button>
                  )}
                </div>
              ) : (
                filteredUsers.map((userItem) => {
                  const isSelected = selectedUserIds.includes(userItem.id);
                  const isAssigned = assignedUsers.some(
                    (j) => j.id === userItem.id || j.user_id === userItem.id,
                  );

                  return (
                    <div
                      key={userItem.id}
                      onClick={() => toggleUserSelection(userItem.id)}
                      className={`
                        p-4 rounded-xl border cursor-pointer transition-all
                        ${
                          isSelected
                            ? "bg-blue-500/10 border-blue-500/30"
                            : "bg-gray-900/50 border-gray-700 hover:bg-gray-800/50"
                        }
                        ${isAssigned ? "border-green-500/30 bg-green-500/5" : ""}
                      `}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isAssigned
                                ? "bg-green-500/20 text-green-400"
                                : getRoleColor(userItem.role).split(" ")[0]
                            }`}>
                            <Users
                              size={18}
                              className={
                                isAssigned
                                  ? "text-green-400"
                                  : getRoleColor(userItem.role)
                                      .split(" ")[1]
                                      .replace("text-", "")
                              }
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-white">
                                {userItem.name ||
                                  userItem.username ||
                                  `User ${userItem.id}`}
                              </p>
                              <span
                                className={`px-2 py-0.5 text-xs rounded-full ${getRoleColor(userItem.role)}`}>
                                {formatRole(userItem.role)}
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
                            <div className="flex items-center gap-2 mt-1">
                              {userItem.whatsapp && (
                                <span className="text-xs text-gray-500">
                                  📱 {userItem.whatsapp}
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
          {/* Assigned Users Info */}
          {assignedUsers.length > 0 && (
            <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">
                  Users yang Sudah Ditugaskan
                </h3>
                <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                  {assignedUsers.length} users
                </div>
              </div>
              <div className="space-y-2">
                {assignedUsers.map((assignedUser, index) => {
                  const userInfo = allUsers.find(
                    (j) =>
                      j.id === assignedUser.id || j.id === assignedUser.user_id,
                  );
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 hover:bg-gray-800/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                          <CheckCircle size={12} className="text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-white">
                            {userInfo?.name ||
                              `User ${assignedUser.id || assignedUser.user_id}`}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-400">
                              {userInfo?.email || "No email"}
                            </p>
                            {userInfo && (
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded ${getRoleColor(userInfo.role)}`}>
                                {formatRole(userInfo.role)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleUnassign(
                            assignedUser.id || assignedUser.user_id,
                          )
                        }
                        className="p-1 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10"
                        title="Hapus assignment">
                        <XCircle size={16} />
                      </button>
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
                      submitting || success || selectedUserIds.length === 0
                    }
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {submitting ? (
                      <>
                        <Loader className="animate-spin h-5 w-5 border-t-2 border-b-2 border-white" />
                        <span>
                          Mengassign {selectedUserIds.length} users...
                        </span>
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        <span>Assign {selectedUserIds.length} Users</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => navigate(`/admin/events/list`)}
                    className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors font-medium">
                    Kembali ke Daftar Event
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-700">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {allUsers.length}
                  </p>
                  <p className="text-xs text-gray-400">Total Users</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {selectedUserIds.length}
                  </p>
                  <p className="text-xs text-gray-400">Akan Ditugaskan</p>
                </div>
              </div>

              {/* Role Distribution */}
              <div className="pt-4 border-t border-gray-700">
                <h5 className="text-sm font-medium text-gray-300 mb-2">
                  Distribusi Users:
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center p-2 bg-blue-500/10 rounded">
                    <p className="text-lg font-bold text-blue-400">
                      {
                        allUsers.filter(
                          (u) =>
                            u.role?.toLowerCase() === "judge" ||
                            u.role?.toLowerCase() === "juri",
                        ).length
                      }
                    </p>
                    <p className="text-xs text-gray-400">Juri</p>
                  </div>
                  <div className="text-center p-2 bg-purple-500/10 rounded">
                    <p className="text-lg font-bold text-purple-400">
                      {
                        allUsers.filter(
                          (u) => u.role?.toLowerCase() === "organizer",
                        ).length
                      }
                    </p>
                    <p className="text-xs text-gray-400">Organizer</p>
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
