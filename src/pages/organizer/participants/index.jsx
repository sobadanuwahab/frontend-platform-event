import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Filter,
  School,
  Phone,
  Calendar,
  Award,
  User,
  ChevronLeft,
  ChevronRight,
  Loader,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import api from "../../../services/api";

const ITEMS_PER_PAGE = 10;

const ParticipantsList = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [deleteLoading, setDeleteLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [filterApplied, setFilterApplied] = useState(false);

  /* ================= FETCH ================= */
  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get("/participant-categories");
      setCategories(res.data?.data || []);
    } catch {
      setCategories([]);
    }
  }, []);

  const fetchParticipants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/participant-lists/1");
      let data = res.data?.data || [];

      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        data = data.filter(
          (p) =>
            p.school_name?.toLowerCase().includes(q) ||
            p.coach?.toLowerCase().includes(q) ||
            p.school_address?.toLowerCase().includes(q) ||
            p.coach_whatsapp?.includes(q),
        );
      }

      if (selectedCategory) {
        data = data.filter(
          (p) => p.participant_category_id == selectedCategory,
        );
      }

      setTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE));

      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      setParticipants(data.slice(start, start + ITEMS_PER_PAGE));
    } catch {
      setParticipants([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, currentPage]);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchParticipants()]);
  }, [fetchCategories, fetchParticipants]);

  /* ================= ACTIONS ================= */
  const applyFilter = () => {
    setCurrentPage(1);
    setFilterApplied(true);
    fetchParticipants();
  };

  const handleFilter = applyFilter;

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setCurrentPage(1);
    setFilterApplied(false);
    fetchParticipants();
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Yakin ingin menghapus peserta "${name}"?`)) return;

    setDeleteLoading(id);
    try {
      const res = await api.delete(`/participants/${id}`);
      if (res.data?.success) {
        setSuccessMessage(`Peserta "${name}" berhasil dihapus`);
        setTimeout(() => setSuccessMessage(""), 3000);
        fetchParticipants();
      }
    } finally {
      setDeleteLoading(null);
    }
  };

  /* ================= UTILS ================= */
  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-";

  const formatPhone = (p) =>
    p ? p.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3") : "-";

  /* ================= LOADING ================= */
  if (loading && !participants.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <Loader size={48} className="text-blue-500" />
        </motion.div>
        <p className="text-gray-400 mt-3">Memuat data peserta...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Daftar Peserta
          </h1>
          <p className="text-gray-400">Kelola data peserta lomba Paskibra</p>
        </div>
        <Link
          to="/organizer/participants/create"
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl transition-all">
          <Plus size={20} />
          Tambah Peserta
        </Link>
      </div>

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-400 mt-0.5" size={20} />
            <p className="text-green-400">{successMessage}</p>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} className="text-gray-400" />
          <h2 className="text-lg font-medium text-gray-300">
            Filter & Pencarian
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cari Peserta
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Cari nama sekolah, pelatih, atau alamat..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filter Kategori
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all appearance-none">
                <option value="">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end gap-2">
            <button
              onClick={handleFilter}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
              Terapkan Filter
            </button>
            {(searchTerm || selectedCategory || filterApplied) && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-lg transition-colors">
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Participants Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-400">
          Menampilkan{" "}
          <span className="text-white font-medium">{participants.length}</span>{" "}
          peserta
          {(searchTerm || selectedCategory) && " (setelah filter)"}
        </p>
        {totalPages > 1 && (
          <p className="text-gray-400">
            Halaman{" "}
            <span className="text-white font-medium">{currentPage}</span> dari{" "}
            <span className="text-white font-medium">{totalPages}</span>
          </p>
        )}
      </div>

      {/* Participants Table */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <Loader
              className="animate-spin text-blue-500 mx-auto mb-2"
              size={24}
            />
            <p className="text-gray-400">Memuat data...</p>
          </div>
        ) : participants.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="text-gray-500 mx-auto mb-3" size={48} />
            <h3 className="text-lg font-medium text-gray-300 mb-2">
              {searchTerm || selectedCategory
                ? "Tidak ada peserta yang sesuai"
                : "Belum ada peserta"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedCategory
                ? "Tidak ada peserta yang sesuai dengan filter Anda"
                : "Belum ada peserta yang terdaftar. Tambahkan peserta pertama Anda!"}
            </p>
            {searchTerm || selectedCategory ? (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors">
                Reset Filter
              </button>
            ) : (
              <Link
                to="/organizer/participants/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Plus size={16} />
                Tambah Peserta Pertama
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-900 border-b border-gray-800">
                    <th className="text-left p-4 text-gray-400 font-medium">
                      Sekolah
                    </th>
                    <th className="text-left p-4 text-gray-400 font-medium">
                      Kategori
                    </th>
                    <th className="text-left p-4 text-gray-400 font-medium">
                      Pelatih
                    </th>
                    <th className="text-left p-4 text-gray-400 font-medium">
                      WhatsApp
                    </th>
                    <th className="text-left p-4 text-gray-400 font-medium">
                      Tanggal
                    </th>
                    <th className="text-left p-4 text-gray-400 font-medium">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((participant) => (
                    <tr
                      key={participant.id}
                      className="border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
                      {/* School */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {participant.image ? (
                            <img
                              src={participant.image}
                              alt={participant.school_name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center">
                              <School size={18} className="text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white">
                              {participant.school_name}
                            </p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {participant.school_address}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">
                          <Award size={12} />
                          {participant.participant_category?.name || "-"}
                        </span>
                      </td>

                      {/* Coach */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-500" />
                          <span className="text-gray-300">
                            {participant.coach}
                          </span>
                        </div>
                      </td>

                      {/* WhatsApp */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-gray-500" />
                          <span className="text-gray-300">
                            {formatPhone(participant.coach_whatsapp)}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-500" />
                          <span className="text-gray-300">
                            {formatDate(participant.created_at)}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              navigate(
                                `/organizer/participants/${participant.id}`,
                              )
                            }
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Lihat Detail">
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() =>
                              navigate(
                                `/organizer/participants/edit/${participant.id}`,
                              )
                            }
                            className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-colors"
                            title="Edit">
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() =>
                              handleDelete(
                                participant.id,
                                participant.school_name,
                              )
                            }
                            disabled={deleteLoading === participant.id}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Hapus">
                            {deleteLoading === participant.id ? (
                              <Loader size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="p-4 border-b border-gray-800 hover:bg-gray-900/50">
                  <div className="flex items-start gap-3 mb-3">
                    {participant.image ? (
                      <img
                        src={participant.image}
                        alt={participant.school_name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center">
                        <School size={20} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium text-white mb-1">
                        {participant.school_name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {participant.school_address}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs">
                          <Award size={10} />
                          {participant.participant_category?.name || "-"}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800 text-gray-300 rounded-full text-xs">
                          <User size={10} />
                          {participant.coach}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-500" />
                      <span className="text-sm text-gray-300">
                        {formatPhone(participant.coach_whatsapp)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-500" />
                      <span className="text-sm text-gray-300">
                        {formatDate(participant.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() =>
                        navigate(`/organizer/participants/${participant.id}`)
                      }
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Lihat Detail">
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() =>
                        navigate(
                          `/organizer/participants/edit/${participant.id}`,
                        )
                      }
                      className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-colors"
                      title="Edit">
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(participant.id, participant.school_name)
                      }
                      disabled={deleteLoading === participant.id}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                      title="Hapus">
                      {deleteLoading === participant.id ? (
                        <Loader size={18} className="animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-800">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronLeft size={18} />
                  Sebelumnya
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}>
                        {page}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="text-gray-400">...</span>}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Selanjutnya
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ParticipantsList;
