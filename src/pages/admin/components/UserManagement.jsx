import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Download,
  Shield,
  Mail,
  Phone,
  Calendar,
  ChevronDown,
  Plus,
  Save,
  X,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const API_URL = "https://apipaskibra.my.id/api";

const UserManagementTab = () => {
  const context = useOutletContext();
  const setStats =
    context?.setStats ||
    (() => {
      console.warn("setStats function not available from context");
    });

  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    password: "",
    password_confirmation: "",
    user_role_id: 3,
    status: "active",
  });

  // Filter states
  const [filters, setFilters] = useState({
    role: "all",
    status: "all",
    sortBy: "newest",
  });

  // Get auth token
  const getAuthToken = () => {
    const token = localStorage.getItem("access_token");
    return token || "LOGIN_OK";
  };

  // Fetch user roles dari API
  const fetchUserRoles = async () => {
    try {
      setLoadingRoles(true);
      const token = getAuthToken();

      const response = await fetch(`${API_URL}/user-roles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil data roles");
      }

      let rolesData = [];

      if (data.data && Array.isArray(data.data)) {
        rolesData = data.data;
      } else if (Array.isArray(data)) {
        rolesData = data;
      } else if (data.roles && Array.isArray(data.roles)) {
        rolesData = data.roles;
      }

      const formattedRoles = rolesData.map((role) => ({
        id: role.id,
        name: role.role || role.name,
        display_name:
          role.display_name ||
          (role.role === "admin"
            ? "Admin"
            : role.role === "judge"
              ? "Juri"
              : role.role === "user"
                ? "User"
                : role.role || "Unknown"),
      }));

      setUserRoles(formattedRoles);
      localStorage.setItem("cached_user_roles", JSON.stringify(formattedRoles));
    } catch (err) {
      console.error("Error fetching user roles:", err);
      const cached = localStorage.getItem("cached_user_roles");
      if (cached) {
        setUserRoles(JSON.parse(cached));
      } else {
        setUserRoles([
          { id: 1, name: "admin", display_name: "Admin" },
          { id: 2, name: "judge", display_name: "Juri" },
          { id: 3, name: "user", display_name: "User" },
        ]);
      }
    } finally {
      setLoadingRoles(false);
    }
  };

  // Fetch users dari API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      const response = await fetch(`${API_URL}/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil data users");
      }

      let usersData = [];

      if (data.data && Array.isArray(data.data)) {
        usersData = data.data;
      } else if (Array.isArray(data)) {
        usersData = data;
      } else if (data.users && Array.isArray(data.users)) {
        usersData = data.users;
      }

      const formattedUsers = usersData.map((user) => {
        const userRoleName = user.role || "user";
        const userRole = userRoles.find(
          (r) =>
            r.name === userRoleName ||
            (userRoleName === "juri" && r.name === "judge"),
        );

        return {
          id: user.id || user.user_id,
          name: user.name || user.username || user.full_name || "User",
          email: user.email,
          whatsapp: user.whatsapp || user.phone || user.telepon || "-",
          role_name: userRole ? userRole.name : userRoleName,
          role_display_name: userRole
            ? userRole.display_name
            : userRoleName === "admin"
              ? "Admin"
              : userRoleName === "juri"
                ? "Juri"
                : userRoleName === "judge"
                  ? "Juri"
                  : userRoleName === "user"
                    ? "User"
                    : userRoleName,
          role_object: userRole,
          user_role_id: userRole ? userRole.id : 3,
          joinDate: user.created_at
            ? new Date(user.created_at).toLocaleDateString("id-ID")
            : user.createdAt
              ? new Date(user.createdAt).toLocaleDateString("id-ID")
              : "Tanggal tidak tersedia",
          coinBalance: user.coin_balance || user.coins || user.balance || 0,
          status: user.status || "active",
          lastActivity:
            user.last_login || user.last_activity || user.updated_at
              ? new Date(user.last_login || user.updated_at).toLocaleString(
                  "id-ID",
                )
              : "Belum ada aktivitas",
        };
      });

      setUsers(formattedUsers);

      if (setStats && typeof setStats === "function") {
        setStats((prevStats) => ({
          ...prevStats,
          totalUsers: formattedUsers.length,
          activeUsers: formattedUsers.filter((u) => u.status === "active")
            .length,
        }));
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Create new user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const token = getAuthToken();

      const requestData = {
        name: formData.name,
        email: formData.email,
        whatsapp: formData.whatsapp,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        user_role_id: formData.user_role_id,
        status: formData.status,
      };

      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(", ");
          throw new Error(errorMessages);
        }
        throw new Error(data.message || "Gagal membuat user baru");
      }

      alert("User berhasil dibuat!");

      setFormData({
        name: "",
        email: "",
        whatsapp: "",
        password: "",
        password_confirmation: "",
        user_role_id: 3,
        status: "active",
      });

      setShowAddForm(false);
      await Promise.all([fetchUserRoles(), fetchUsers()]);
    } catch (err) {
      console.error("Error creating user:", err);
      alert(`Gagal membuat user: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Update user
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const token = getAuthToken();

      const requestData = {
        name: formData.name,
        email: formData.email,
        whatsapp: formData.whatsapp,
        user_role_id: formData.user_role_id,
        status: formData.status,
      };

      if (formData.password) {
        requestData.password = formData.password;
        requestData.password_confirmation = formData.password_confirmation;
      }

      const endpointsToTry = [
        `${API_URL}/user/${selectedUser.id}`,
        `${API_URL}/user/update/${selectedUser.id}`,
      ];

      let response = null;
      let lastError = null;

      for (const endpoint of endpointsToTry) {
        for (const method of ["PUT", "PATCH", "POST"]) {
          try {
            const config = {
              method: method,
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify(requestData),
            };

            if (method === "POST") {
              requestData._method = "PUT";
            }

            response = await fetch(endpoint, config);

            if (response.ok) {
              break;
            }
          } catch (err) {
            lastError = err;
          }
        }
        if (response && response.ok) break;
      }

      if (!response || !response.ok) {
        try {
          response = await fetch(`${API_URL}/user?id=${selectedUser.id}`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(requestData),
          });
        } catch (err) {
          lastError = err;
        }
      }

      if (!response || !response.ok) {
        throw new Error(
          `Tidak dapat menemukan endpoint update. Status: ${response?.status || "no response"}`,
        );
      }

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(", ");
          throw new Error(errorMessages);
        }
        throw new Error(data.message || "Gagal mengupdate user");
      }

      alert("User berhasil diupdate!");

      setFormData({
        name: "",
        email: "",
        whatsapp: "",
        password: "",
        password_confirmation: "",
        user_role_id: 3,
        status: "active",
      });

      setShowEditForm(false);
      setSelectedUser(null);
      await Promise.all([fetchUserRoles(), fetchUsers()]);
    } catch (err) {
      console.error("Error updating user:", err);
      alert(
        `Gagal mengupdate user: ${err.message}\n\nCoba cek endpoint update di backend.`,
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      return;
    }

    try {
      setActionLoading(true);
      const token = getAuthToken();

      const response = await fetch(`${API_URL}/user/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus user");
      }

      alert("User berhasil dihapus!");
      await Promise.all([fetchUserRoles(), fetchUsers()]);
    } catch (err) {
      console.error("Error deleting user:", err);
      alert(`Gagal menghapus user: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Update user status
  const handleUpdateStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    try {
      setActionLoading(true);
      const token = getAuthToken();

      const response = await fetch(`${API_URL}/users/${userId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengupdate status");
      }

      alert(`Status user berhasil diubah menjadi ${newStatus}`);
      await fetchUsers();
    } catch (err) {
      console.error("Error updating status:", err);
      alert(`Gagal mengupdate status: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle edit button click
  const handleEditClick = (user) => {
    setSelectedUser(user);
    let roleId = user.user_role_id;

    if (!roleId && userRoles.length > 0) {
      const userRoleName = user.role_name;
      const role = userRoles.find(
        (r) =>
          r.role === userRoleName ||
          (userRoleName === "juri" && r.role === "judge"),
      );
      roleId = role ? role.id : 1;
    }

    setFormData({
      name: user.name,
      email: user.email,
      whatsapp: user.whatsapp,
      password: "",
      password_confirmation: "",
      user_role_id: roleId || 1,
      status: user.status,
    });
    setShowEditForm(true);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "user_role_id" ? parseInt(value) : value,
    }));
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.whatsapp && user.whatsapp.includes(searchTerm));

    const matchesRole =
      filters.role === "all" || user.role_name === filters.role;
    const matchesStatus =
      filters.status === "all" || user.status === filters.status;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (filters.sortBy === "newest") {
      return new Date(b.joinDate) - new Date(a.joinDate);
    } else if (filters.sortBy === "oldest") {
      return new Date(a.joinDate) - new Date(b.joinDate);
    } else if (filters.sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  // Export data
  const handleExportData = () => {
    const dataStr = JSON.stringify(sortedUsers, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `users-export-${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  // Get unique roles for filter dropdown
  const getUniqueRolesForFilter = () => {
    if (userRoles.length > 0) {
      return userRoles;
    }

    const uniqueRoleNames = [...new Set(users.map((user) => user.role_name))];
    return uniqueRoleNames.map((roleName) => ({
      name: roleName,
      display_name:
        roleName === "admin"
          ? "Admin"
          : roleName === "judge"
            ? "Juri"
            : roleName === "juri"
              ? "Juri"
              : roleName === "user"
                ? "User"
                : roleName,
    }));
  };

  // Get color based on role
  const getRoleColor = (roleName) => {
    if (!roleName)
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        icon: "text-gray-500",
      };

    switch (roleName.toLowerCase()) {
      case "admin":
        return { bg: "bg-red-100", text: "text-red-800", icon: "text-red-500" };
      case "judge":
      case "juri":
        return {
          bg: "bg-purple-100",
          text: "text-purple-800",
          icon: "text-purple-500",
        };
      case "user":
        return {
          bg: "bg-blue-100",
          text: "text-blue-800",
          icon: "text-blue-500",
        };
      default:
        return {
          bg: "bg-gray-100",
          text: "text-gray-800",
          icon: "text-gray-500",
        };
    }
  };

  // Initialize on component mount
  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      if (!isMounted) return;

      await fetchUserRoles();
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (isMounted) {
        await fetchUsers();
      }
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Refresh all data
  const refreshAllData = async () => {
    await Promise.all([fetchUserRoles(), fetchUsers()]);
  };

  // Fungsi handleSubmit untuk form (tambahkan di sini)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (showAddForm) {
      handleCreateUser(e);
    } else if (showEditForm) {
      handleUpdateUser(e);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mr-3" />
        <p className="text-gray-600">Memuat data users...</p>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Error Load Data
        </h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={refreshAllData}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 mx-auto"
        >
          <RefreshCw size={16} />
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">
            User Management
          </h2>
          <p className="text-gray-400">
            Kelola pengguna sistem ({users.length} total users,{" "}
            {users.filter((u) => u.status === "active").length} aktif)
          </p>
        </div>
      </div>

      {/* Add User Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Tambah User Baru</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                  placeholder="081234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role *
                </label>
                {loadingRoles ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                    <span className="text-sm text-gray-400">
                      Memuat roles...
                    </span>
                  </div>
                ) : (
                  <select
                    name="user_role_id"
                    value={formData.user_role_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  >
                    <option value="">Pilih Role</option>
                    {userRoles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.display_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                  placeholder="Minimal 6 karakter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Konfirmasi Password *
                </label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                  placeholder="Ulangi password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Simpan User
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Edit User Form */}
      {showEditForm && selectedUser && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Edit User</h3>
            <button
              onClick={() => {
                setShowEditForm(false);
                setSelectedUser(null);
              }}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role *
                </label>
                {loadingRoles ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                    <span className="text-sm text-gray-400">
                      Memuat roles...
                    </span>
                  </div>
                ) : (
                  <select
                    name="user_role_id"
                    value={formData.user_role_id}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  >
                    <option value="">Pilih Role</option>
                    {userRoles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.display_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password (Kosongkan jika tidak ingin mengubah)
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                  placeholder="Biarkan kosong untuk tidak mengubah"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
                  placeholder="Biarkan kosong untuk tidak mengubah"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false);
                  setSelectedUser(null);
                }}
                className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Update User
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Control Bar */}
      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-5">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Cari user berdasarkan nama, email, atau whatsapp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-400"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={filters.role}
                onChange={(e) =>
                  setFilters({ ...filters, role: e.target.value })
                }
                className="pl-3 pr-8 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white appearance-none cursor-pointer min-w-[150px]"
              >
                <option value="all">Semua Role</option>
                {getUniqueRolesForFilter().map((role) => (
                  <option key={role.name} value={role.name}>
                    {role.display_name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="pl-3 pr-8 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white appearance-none cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
              <ChevronDown
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
            </div>

            {/* Sort Filter */}
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value })
                }
                className="pl-3 pr-8 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white appearance-none cursor-pointer"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="name">Nama A-Z</option>
              </select>
              <ChevronDown
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
            </div>

            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <UserPlus size={18} />
              Tambah User
            </button>

            <button
              onClick={refreshAllData}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>

            <button
              onClick={handleExportData}
              className="px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
              title="Export Data"
            >
              <Download size={18} />
            </button>
          </div>
        </div>

        {/* Active Filters Info */}
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.role !== "all" && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Role:{" "}
              {getUniqueRolesForFilter().find((r) => r.name === filters.role)
                ?.display_name || filters.role}
              <button
                onClick={() => setFilters({ ...filters, role: "all" })}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                ✕
              </button>
            </span>
          )}
          {filters.status !== "all" && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Status: {filters.status === "active" ? "Aktif" : "Nonaktif"}
              <button
                onClick={() => setFilters({ ...filters, status: "all" })}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                ✕
              </button>
            </span>
          )}
          {(filters.role !== "all" || filters.status !== "all") && (
            <button
              onClick={() =>
                setFilters({ role: "all", status: "all", sortBy: "newest" })
              }
              className="text-sm text-gray-400 hover:text-white"
            >
              Reset semua filter
            </button>
          )}
        </div>
      </div>

      {/* User Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 overflow-hidden"
      >
        {sortedUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <UserPlus size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">
              Tidak ada data user
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm
                ? "Tidak ditemukan user dengan kata kunci tersebut"
                : filters.role !== "all" || filters.status !== "all"
                  ? "Tidak ada user dengan filter yang dipilih"
                  : "Belum ada user yang terdaftar"}
            </p>
            {filters.role !== "all" || filters.status !== "all" ? (
              <button
                onClick={() =>
                  setFilters({ role: "all", status: "all", sortBy: "newest" })
                }
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
              >
                Reset Filter
              </button>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto"
              >
                <Plus size={18} />
                Tambah User Pertama
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Kontak
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Bergabung
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {sortedUsers.map((user) => {
                    const roleColor = getRoleColor(user.role_name);

                    return (
                      <tr key={user.id} className="hover:bg-gray-750">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                              <span className="text-blue-300 font-semibold">
                                {user.name?.charAt(0)?.toUpperCase() || "U"}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-white">
                                {user.name || "No Name"}
                              </p>
                              <p className="text-sm text-gray-400">
                                ID: {user.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail size={14} className="text-gray-400" />
                              <span className="text-sm text-gray-300">
                                {user.email || "-"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone size={14} className="text-gray-400" />
                              <span className="text-sm text-gray-300">
                                {user.whatsapp || "-"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Shield size={16} className={roleColor.icon} />
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${roleColor.bg} ${roleColor.text}`}
                            >
                              {user.role_display_name?.toUpperCase() || "USER"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-300">
                              {user.joinDate || "-"}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {user.lastActivity || "Belum ada aktivitas"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditClick(user)}
                              className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={actionLoading}
                              className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                            <button
                              className="p-2 text-gray-400 hover:bg-gray-700 rounded-lg"
                              title="View Details"
                              onClick={() => {
                                // console.log("View user details:", user);
                              }}
                            >
                              <Eye size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Menampilkan {sortedUsers.length} dari {users.length} users
                {filters.role !== "all" && ` (Filter: ${filters.role})`}
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-600 text-gray-300 rounded hover:bg-gray-700">
                  Previous
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-600 text-gray-300 rounded hover:bg-gray-700">
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default UserManagementTab;
