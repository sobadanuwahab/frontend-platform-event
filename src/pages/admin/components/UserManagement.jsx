import { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  Coins,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  Download,
  MoreVertical,
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

const UserManagementTab = ({ stats, setStats }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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
    role: "user",
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
    return token || "LOGIN_OK"; // Fallback jika token tidak ada
  };

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();

      console.log("Fetching users from API...");
      const response = await fetch(`${API_URL}/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const data = await response.json();
      console.log("API Response for users:", data);

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil data users");
      }

      // Mapping response berdasarkan struktur API
      let usersData = [];

      if (data.data && Array.isArray(data.data)) {
        usersData = data.data;
      } else if (Array.isArray(data)) {
        usersData = data;
      } else if (data.users && Array.isArray(data.users)) {
        usersData = data.users;
      }

      console.log("Mapped users data:", usersData);

      const formattedUsers = usersData.map((user) => ({
        id: user.id || user.user_id,
        name: user.name || user.username || user.full_name || "User",
        email: user.email,
        whatsapp: user.whatsapp || user.phone || user.telepon || "-",
        role:
          user.role ||
          (user.user_role_id === 1
            ? "admin"
            : user.user_role_id === 2
              ? "juri"
              : user.user_role_id === 3
                ? "user"
                : "user"),
        user_role_id: user.user_role_id || 3,
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
      }));

      setUsers(formattedUsers);

      // Update stats
      setStats((prevStats) => ({
        ...prevStats,
        totalUsers: formattedUsers.length,
        activeUsers: formattedUsers.filter((u) => u.status === "active").length,
      }));
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message);
      setUsers([]); // Set empty array on error
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

      // Map role to user_role_id
      const roleMapping = {
        admin: 1,
        juri: 2,
        user: 3,
      };

      const requestData = {
        name: formData.name,
        email: formData.email,
        whatsapp: formData.whatsapp,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        user_role_id: roleMapping[formData.role] || 3,
        status: formData.status,
      };

      console.log("Creating user with data:", requestData);

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
      console.log("Create user response:", data);

      if (!response.ok) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(", ");
          throw new Error(errorMessages);
        }
        throw new Error(data.message || "Gagal membuat user baru");
      }

      alert("User berhasil dibuat!");

      // Reset form
      setFormData({
        name: "",
        email: "",
        whatsapp: "",
        password: "",
        password_confirmation: "",
        role: "user",
        user_role_id: 3,
        status: "active",
      });

      setShowAddForm(false);

      // Refresh users list
      fetchUsers();
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

      const roleMapping = {
        admin: 1,
        juri: 2,
        user: 3,
      };

      const requestData = {
        name: formData.name,
        email: formData.email,
        whatsapp: formData.whatsapp,
        role: formData.role,
        user_role_id: roleMapping[formData.role] || 3,
        status: formData.status,
      };

      // Only include password if provided
      if (formData.password) {
        requestData.password = formData.password;
        requestData.password_confirmation = formData.password_confirmation;
      }

      console.log("Updating user with data:", requestData);

      const response = await fetch(`${API_URL}/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log("Update user response:", data);

      if (!response.ok) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(", ");
          throw new Error(errorMessages);
        }
        throw new Error(data.message || "Gagal mengupdate user");
      }

      alert("User berhasil diupdate!");

      // Reset form
      setFormData({
        name: "",
        email: "",
        whatsapp: "",
        password: "",
        password_confirmation: "",
        role: "user",
        user_role_id: 3,
        status: "active",
      });

      setShowEditForm(false);
      setSelectedUser(null);

      // Refresh users list
      fetchUsers();
    } catch (err) {
      console.error("Error updating user:", err);
      alert(`Gagal mengupdate user: ${err.message}`);
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

      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const data = await response.json();
      console.log("Delete user response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus user");
      }

      alert("User berhasil dihapus!");

      // Refresh users list
      fetchUsers();
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
      console.log("Update status response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengupdate status");
      }

      alert(`Status user berhasil diubah menjadi ${newStatus}`);

      // Refresh users list
      fetchUsers();
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
    setFormData({
      name: user.name,
      email: user.email,
      whatsapp: user.whatsapp,
      password: "",
      password_confirmation: "",
      role: user.role,
      user_role_id: user.user_role_id,
      status: user.status,
    });
    setShowEditForm(true);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Update user_role_id when role changes
      ...(name === "role" && {
        user_role_id: value === "admin" ? 1 : value === "juri" ? 2 : 3,
      }),
    }));
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.whatsapp.includes(searchTerm);

    const matchesRole = filters.role === "all" || user.role === filters.role;
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

  // Initialize on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

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
          onClick={fetchUsers}
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
      {/* Add User Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Tambah User Baru
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="081234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="user">User</option>
                  <option value="juri">Juri</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Minimal 6 karakter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password *
                </label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ulangi password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
            <button
              onClick={() => {
                setShowEditForm(false);
                setSelectedUser(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp *
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="user">User</option>
                  <option value="juri">Juri</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password (Kosongkan jika tidak ingin mengubah)
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
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
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="pl-3 pr-8 py-2.5 border border-gray-300 rounded-lg bg-white appearance-none"
              >
                <option value="all">Semua Role</option>
                <option value="admin">Admin</option>
                <option value="juri">Juri</option>
                <option value="user">User</option>
              </select>
              <ChevronDown
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
            </div>

            <div className="relative">
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="pl-3 pr-8 py-2.5 border border-gray-300 rounded-lg bg-white appearance-none"
              >
                <option value="all">Semua Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
              onClick={fetchUsers}
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
      </div>

      {/* User Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        {sortedUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <UserPlus size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak ada data user
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Tidak ditemukan user dengan kata kunci tersebut"
                : "Belum ada user yang terdaftar"}
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 mx-auto"
            >
              <Plus size={18} />
              Tambah User Pertama
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kontak
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coins
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bergabung
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              ID: {user.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-gray-400" />
                            <span className="text-sm">{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-gray-400" />
                            <span className="text-sm">{user.whatsapp}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Shield
                            size={16}
                            className={`
                            ${
                              user.role === "admin"
                                ? "text-red-500"
                                : user.role === "juri"
                                  ? "text-purple-500"
                                  : "text-blue-500"
                            }
                          `}
                          />
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === "admin"
                                ? "bg-red-100 text-red-800"
                                : user.role === "juri"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {user.role.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Coins size={16} className="text-yellow-500" />
                          <span className="font-bold">{user.coinBalance}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.status === "active" ? (
                            <CheckCircle size={16} className="text-green-500" />
                          ) : (
                            <XCircle size={16} className="text-red-500" />
                          )}
                          <button
                            onClick={() =>
                              handleUpdateStatus(user.id, user.status)
                            }
                            disabled={actionLoading}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.status === "active"
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }`}
                          >
                            {user.status === "active" ? "AKTIF" : "NONAKTIF"}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-sm">{user.joinDate}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {user.lastActivity}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={actionLoading}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            title="View Details"
                            onClick={() => {
                              console.log("View user details:", user.id);
                            }}
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Menampilkan {sortedUsers.length} dari {users.length} users
              </p>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
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
