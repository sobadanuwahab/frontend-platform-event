import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  MoreVertical,
  School,
  Phone,
  MapPin,
  Calendar,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";

const ParticipantsList = () => {
  const API_URL = "https://apipaskibra.my.id/api";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchParticipants();
    fetchFilters();
  }, [currentPage, selectedEvent, selectedCategory]);

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Gunakan endpoint yang benar
      const response = await axios.get(`${API_URL}/participant-lists/1`, {
        headers,
        timeout: 5000,
      });

      console.log("Participants API response:", response.data);

      let participants = [];
      if (response.data.success) {
        participants = response.data.data || [];
      }

      // Apply filters
      let filteredParticipants = participants;

      if (searchTerm) {
        filteredParticipants = filteredParticipants.filter(
          (p) =>
            p.school_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.coach?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.school_address?.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

      if (selectedEvent) {
        filteredParticipants = filteredParticipants.filter(
          (p) => p.event_id == selectedEvent || p.event?.id == selectedEvent,
        );
      }

      if (selectedCategory) {
        filteredParticipants = filteredParticipants.filter(
          (p) =>
            p.participant_category_id == selectedCategory ||
            p.participant_category?.id == selectedCategory,
        );
      }

      // Pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedParticipants = filteredParticipants.slice(
        startIndex,
        endIndex,
      );

      setParticipants(paginatedParticipants);
      setTotalPages(Math.ceil(filteredParticipants.length / itemsPerPage));
    } catch (error) {
      console.error("Error fetching participants:", error);
      // Fallback data
      setParticipants([
        {
          id: 1,
          school_name: "SMAN 3 Cilegon",
          school_address: "Cilegon Mancak, Banten",
          coach: "Udin Coach",
          coach_whatsapp: "081278523645",
          event: { id: 1, name: "Event Paskibra SMAN 1 Cilegon" },
          participant_category: { id: 3, name: "SMA" },
          status: "active",
          created_at: "2024-01-15T10:30:00Z",
        },
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [eventsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_URL}/events`),
        axios.get(`${API_URL}/participant-categories`),
      ]);

      setEvents(eventsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus peserta ini?")) {
      try {
        const token = localStorage.getItem("access_token");
        await axios.delete(`${API_URL}/participants/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchParticipants(); // Refresh list
      } catch (error) {
        console.error("Error deleting participant:", error);
        alert("Gagal menghapus peserta");
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchParticipants();
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Daftar Peserta</h1>
            <p className="text-gray-400">
              Kelola semua peserta yang terdaftar dalam event Anda
            </p>
          </div>

          <Link
            to="/organizer/participants/create"
            className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all font-medium whitespace-nowrap">
            <Plus size={20} />
            <span>Tambah Peserta Baru</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                size={20}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama sekolah, coach, atau alamat..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Filter by Event
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    size={20}
                  />
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none">
                    <option value="">Semua Event</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Filter by Category
                </label>
                <div className="relative">
                  <Award
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    size={20}
                  />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none">
                    <option value="">Semua Kategori</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all font-medium">
                  Terapkan Filter
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : participants.length === 0 ? (
          <div className="p-12 text-center">
            <School size={48} className="mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl font-bold mb-2">Tidak ada peserta</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || selectedEvent || selectedCategory
                ? "Tidak ditemukan peserta dengan filter yang dipilih"
                : "Belum ada peserta yang terdaftar"}
            </p>
            <Link
              to="/organizer/participants/create"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all font-medium">
              <Plus size={20} />
              <span>Tambah Peserta Pertama</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                      Sekolah
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                      Event
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                      Kategori
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                      Coach
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                      Tanggal
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {participants.map((participant) => (
                    <tr
                      key={participant.id}
                      className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 flex items-center justify-center flex-shrink-0">
                            <School size={20} className="text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {participant.school_name}
                            </p>
                            <p className="text-sm text-gray-400 flex items-center gap-1">
                              <MapPin size={12} />
                              {participant.school_address}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm">
                          {participant.event?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm">
                          {participant.participant_category?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm">{participant.coach}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Phone size={12} />
                            {participant.coach_whatsapp}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-400">
                          {formatDate(participant.created_at)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            participant.status === "active"
                              ? "bg-green-500/20 text-green-400"
                              : participant.status === "pending"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                          }`}>
                          {participant.status === "active"
                            ? "Aktif"
                            : participant.status === "pending"
                              ? "Pending"
                              : "Tidak Aktif"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              navigate(
                                `/organizer/participants/edit/${participant.id}`,
                              )
                            }
                            className="p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                            title="Edit">
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() =>
                              navigate(
                                `/organizer/participants/${participant.id}`,
                              )
                            }
                            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
                            title="Detail">
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(participant.id)}
                            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                            title="Hapus">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Menampilkan {participants.length} peserta
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center space-x-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-10 h-10 rounded-lg transition-colors ${
                                currentPage === pageNum
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                              }`}>
                              {pageNum}
                            </button>
                          );
                        },
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Export Button */}
      <div className="mt-6 flex justify-end">
        <button className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors font-medium">
          <Download size={20} />
          <span>Export Data (Excel)</span>
        </button>
      </div>
    </div>
  );
};

export default ParticipantsList;
