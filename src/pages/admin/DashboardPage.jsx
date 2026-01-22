import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Coins,
  Ticket as TicketIcon,
  TrendingUp,
  BarChart3,
  Shield,
  DollarSign,
  Activity,
  Calendar,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Search,
  ChevronDown,
  CheckCircle,
  XCircle,
  RefreshCw,
  UserPlus,
  UserMinus,
  CreditCard,
  Vote,
  Package,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState("today");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data statistik
  const [stats, setStats] = useState({
    totalUsers: 1245,
    totalCoinsSold: 56890,
    totalTicketsSold: 245,
    totalVotes: 56890,
    revenue: 25678000,
    activeUsers: 842,
    pendingTransactions: 12,
    completedTransactions: 233,
  });

  // Data users
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Ahmad Rizki",
      email: "ahmad@example.com",
      role: "user",
      joinDate: "2024-10-01",
      coinBalance: 45,
      status: "active",
      lastActivity: "2 jam lalu",
    },
    {
      id: 2,
      name: "Siti Nurhaliza",
      email: "siti@example.com",
      role: "user",
      joinDate: "2024-10-02",
      coinBalance: 120,
      status: "active",
      lastActivity: "1 jam lalu",
    },
    {
      id: 3,
      name: "Budi Santoso",
      email: "budi@example.com",
      role: "admin",
      joinDate: "2024-09-15",
      coinBalance: 500,
      status: "active",
      lastActivity: "5 menit lalu",
    },
    {
      id: 4,
      name: "Dewi Lestari",
      email: "dewi@example.com",
      role: "user",
      joinDate: "2024-10-03",
      coinBalance: 0,
      status: "inactive",
      lastActivity: "3 hari lalu",
    },
    {
      id: 5,
      name: "Joko Widodo",
      email: "joko@example.com",
      role: "juri",
      joinDate: "2024-09-20",
      coinBalance: 0,
      status: "active",
      lastActivity: "12 jam lalu",
    },
  ]);

  // Data transaksi coin
  const [transactions, setTransactions] = useState([
    {
      id: "TRX-001",
      userId: 1,
      userName: "Ahmad Rizki",
      package: "Paket Premium",
      coins: 100,
      amount: 80000,
      paymentMethod: "Bank Transfer",
      status: "completed",
      date: "2024-10-25 10:30:00",
    },
    {
      id: "TRX-002",
      userId: 2,
      userName: "Siti Nurhaliza",
      package: "Paket Standard",
      coins: 50,
      amount: 45000,
      paymentMethod: "E-Wallet",
      status: "completed",
      date: "2024-10-25 09:15:00",
    },
    {
      id: "TRX-003",
      userId: 3,
      userName: "Budi Santoso",
      package: "Paket Basic",
      coins: 10,
      amount: 10000,
      paymentMethod: "QRIS",
      status: "pending",
      date: "2024-10-25 08:45:00",
    },
    {
      id: "TRX-004",
      userId: 4,
      userName: "Dewi Lestari",
      package: "Paket Premium",
      coins: 100,
      amount: 80000,
      paymentMethod: "Bank Transfer",
      status: "failed",
      date: "2024-10-24 14:20:00",
    },
    {
      id: "TRX-005",
      userId: 5,
      userName: "Joko Widodo",
      package: "Paket Standard",
      coins: 50,
      amount: 45000,
      paymentMethod: "Virtual Account",
      status: "completed",
      date: "2024-10-24 11:10:00",
    },
  ]);

  // Data voting
  const [votingData, setVotingData] = useState([
    {
      id: 1,
      teamName: "SMAN 1 Kota Serang",
      totalVotes: 1245,
      voters: 890,
      coinSpent: 1245,
      rank: 1,
      progress: 75,
    },
    {
      id: 2,
      teamName: "SMK Teknik 2 Cilegon",
      totalVotes: 892,
      voters: 645,
      coinSpent: 892,
      rank: 2,
      progress: 65,
    },
    {
      id: 3,
      teamName: "SMAN 3 Tangerang",
      totalVotes: 756,
      voters: 532,
      coinSpent: 756,
      rank: 3,
      progress: 58,
    },
  ]);

  // Cek role admin saat component mount
  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = () => {
    // Simulasi cek role dari localStorage/auth context
    const userRole = localStorage.getItem("userRole") || "user";

    if (userRole !== "admin") {
      alert("Akses ditolak! Hanya admin yang dapat mengakses dashboard.");
      navigate("/");
      return;
    }

    setIsAdmin(true);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleEditUser = (userId) => {
    console.log("Edit user:", userId);
    // Implement edit user logic
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      console.log("Delete user:", userId);
      // Implement delete user logic
    }
  };

  const handleUpdateTransactionStatus = (transactionId, status) => {
    console.log("Update transaction:", transactionId, "to", status);
    // Implement update transaction logic
  };

  const handleExportData = () => {
    console.log("Export data");
    // Implement export logic
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.status.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola data voting, tiket, dan user management
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              <Download size={18} />
              Export Data
            </button>
            <div className="relative">
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg bg-white appearance-none">
                <option value="today">Hari Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="year">Tahun Ini</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 border-b border-gray-200">
          {[
            {
              id: "overview",
              label: "Overview",
              icon: <BarChart3 size={18} />,
            },
            {
              id: "users",
              label: "User Management",
              icon: <Users size={18} />,
            },
            {
              id: "transactions",
              label: "Transaksi",
              icon: <CreditCard size={18} />,
            },
            { id: "voting", label: "Data Voting", icon: <Vote size={18} /> },
            {
              id: "tickets",
              label: "Data Tiket",
              icon: <TicketIcon size={18} />,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium flex items-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="text-blue-600" size={24} />
                </div>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.totalUsers.toLocaleString()}
              </h3>
              <p className="text-gray-600">Total Users</p>
              <p className="text-sm text-green-600 mt-2">
                +12% dari bulan lalu
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Coins className="text-green-600" size={24} />
                </div>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.totalCoinsSold.toLocaleString()}
              </h3>
              <p className="text-gray-600">Coin Terjual</p>
              <p className="text-sm text-green-600 mt-2">
                +24% dari bulan lalu
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <DollarSign className="text-purple-600" size={24} />
                </div>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {formatCurrency(stats.revenue)}
              </h3>
              <p className="text-gray-600">Total Revenue</p>
              <p className="text-sm text-green-600 mt-2">
                +18% dari bulan lalu
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Vote className="text-orange-600" size={24} />
                </div>
                <TrendingUp className="text-green-500" size={20} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.totalVotes.toLocaleString()}
              </h3>
              <p className="text-gray-600">Total Votes</p>
              <p className="text-sm text-green-600 mt-2">
                +32% dari bulan lalu
              </p>
            </div>
          </div>

          {/* Charts & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Transaksi Terbaru
                </h3>
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  Lihat Semua
                </button>
              </div>
              <div className="space-y-4">
                {transactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.userName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.package} • {transaction.coins} coin
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          transaction.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : transaction.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}>
                        {transaction.status === "completed"
                          ? "Sukses"
                          : transaction.status === "pending"
                            ? "Pending"
                            : "Gagal"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Distribusi User
              </h3>
              <div className="space-y-4">
                {[
                  { role: "User", count: 1200, color: "bg-blue-500" },
                  { role: "Admin", count: 5, color: "bg-green-500" },
                  { role: "Juri", count: 40, color: "bg-purple-500" },
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">{item.role}</span>
                      <span className="font-medium text-gray-900">
                        {item.count} users
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full`}
                        style={{
                          width: `${(item.count / stats.totalUsers) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* User Management Tab */}
      {activeTab === "users" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Search Bar */}
          <div className="p-5 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari user berdasarkan nama, email, atau role..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <UserPlus size={18} />
                Tambah User
              </button>
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coin Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400">
                          Bergabung: {user.joinDate}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : user.role === "juri"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Coins size={16} className="text-yellow-600" />
                        <span className="font-medium">{user.coinBalance}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {user.status === "active" ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <XCircle size={16} className="text-red-500" />
                        )}
                        <span
                          className={`font-medium ${
                            user.status === "active"
                              ? "text-green-700"
                              : "text-red-700"
                          }`}>
                          {user.status === "active" ? "Aktif" : "Nonaktif"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.lastActivity}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditUser(user.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Edit">
                          <Edit size={18} />
                        </button>
                        {user.role !== "admin" && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete">
                            <Trash2 size={18} />
                          </button>
                        )}
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="View Details">
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
              Menampilkan 1-{filteredUsers.length} dari {users.length} users
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Filter Bar */}
          <div className="p-5 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select className="px-4 py-2 border border-gray-300 rounded-lg">
                  <option value="">Semua Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                  <Filter size={18} />
                  Filter
                </button>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Transaksi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paket
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm">
                      {transaction.id}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{transaction.userName}</p>
                        <p className="text-sm text-gray-500">
                          ID: {transaction.userId}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-gray-400" />
                        <span>{transaction.package}</span>
                        <span className="text-sm text-gray-500">
                          ({transaction.coins} coin)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            transaction.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : transaction.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}>
                          {transaction.status === "completed"
                            ? "Sukses"
                            : transaction.status === "pending"
                              ? "Pending"
                              : "Gagal"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {transaction.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleUpdateTransactionStatus(
                                  transaction.id,
                                  "completed",
                                )
                              }
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateTransactionStatus(
                                  transaction.id,
                                  "failed",
                                )
                              }
                              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                              Reject
                            </button>
                          </>
                        )}
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Voting Data Tab */}
      {activeTab === "voting" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6">
          {/* Voting Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Vote className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {stats.totalVotes.toLocaleString()}
                  </h3>
                  <p className="text-gray-600">Total Votes</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {stats.activeUsers.toLocaleString()}
                  </h3>
                  <p className="text-gray-600">Voter Aktif</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Coins className="text-purple-600" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {stats.totalCoinsSold.toLocaleString()}
                  </h3>
                  <p className="text-gray-600">Coin Terpakai</p>
                </div>
              </div>
            </div>
          </div>

          {/* Voting Leaderboard */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Ranking Voting
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-800">
                Download Report
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Tim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Votes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jumlah Voter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Coin Terpakai
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {votingData.map((team) => (
                    <tr key={team.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            team.rank === 1
                              ? "bg-yellow-100 text-yellow-800"
                              : team.rank === 2
                                ? "bg-gray-100 text-gray-800"
                                : team.rank === 3
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-100 text-blue-800"
                          }`}>
                          <span className="font-bold">{team.rank}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">{team.teamName}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        {team.totalVotes.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {team.voters.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Coins size={16} className="text-yellow-600" />
                          <span>{team.coinSpent.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{team.progress}%</span>
                            <span>100%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                              style={{ width: `${team.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tickets Data Tab */}
      {activeTab === "tickets" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6">
          {/* Ticket Sales Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TicketIcon className="text-blue-600" size={24} />
                </div>
                <span className="text-sm font-medium text-green-600">
                  +{Math.floor((stats.totalTicketsSold / 300) * 100)}%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.totalTicketsSold}
              </h3>
              <p className="text-gray-600">Total Penjualan Tiket</p>
              <p className="text-sm text-gray-500 mt-2">Target: 300 tiket</p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="text-green-600" size={24} />
                </div>
                <span className="text-sm font-medium text-green-600">
                  +{Math.floor((stats.revenue / 30000000) * 100)}%
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {formatCurrency(stats.revenue)}
              </h3>
              <p className="text-gray-600">Total Pendapatan</p>
              <p className="text-sm text-gray-500 mt-2">
                Target: Rp 30.000.000
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Activity className="text-purple-600" size={24} />
                </div>
                <span className="text-sm font-medium text-green-600">
                  +{stats.completedTransactions} transaksi
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {stats.completedTransactions}
              </h3>
              <p className="text-gray-600">Transaksi Sukses</p>
              <p className="text-sm text-gray-500 mt-2">
                {stats.pendingTransactions} pending
              </p>
            </div>
          </div>

          {/* Package Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Performa Paket Coin
            </h3>
            <div className="space-y-6">
              {[
                {
                  name: "Paket Premium",
                  price: 80000,
                  coins: 100,
                  sold: 120,
                  revenue: 9600000,
                  percentage: 60,
                },
                {
                  name: "Paket Standard",
                  price: 45000,
                  coins: 50,
                  sold: 85,
                  revenue: 3825000,
                  percentage: 40,
                },
                {
                  name: "Paket Basic",
                  price: 10000,
                  coins: 10,
                  sold: 40,
                  revenue: 400000,
                  percentage: 15,
                },
              ].map((pkg, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">{pkg.name}</h4>
                      <p className="text-sm text-gray-500">
                        {pkg.coins} coin • {formatCurrency(pkg.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(pkg.revenue)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {pkg.sold} terjual
                      </p>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        index === 0
                          ? "bg-gradient-to-r from-purple-500 to-purple-600"
                          : index === 1
                            ? "bg-gradient-to-r from-blue-500 to-blue-600"
                            : "bg-gradient-to-r from-green-500 to-green-600"
                      }`}
                      style={{ width: `${pkg.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Security Warning */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="text-yellow-600 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-gray-900">Keamanan Dashboard</h4>
            <p className="text-sm text-gray-600 mt-1">
              Dashboard ini hanya dapat diakses oleh admin. Pastikan untuk
              logout setelah menggunakan dashboard dan jangan membagikan akses
              Anda kepada siapapun.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
