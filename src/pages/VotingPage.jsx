import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VotingCard from "../components/Voting/VotingCard";
import { Search, Filter, Coins, TrendingUp, Users, Trophy } from "lucide-react";
import { motion } from "framer-motion";

const VotingPage = () => {
  const navigate = useNavigate(); // Tambahkan ini
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState("");
  const [coinBalance, setCoinBalance] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);

  // Data tim dengan gambar default SVG jika URL external gagal
  const dummyTeams = [
    {
      id: 1,
      name: "SMAN 1 Kota Serang",
      votes: 1245,
      image:
        "https://images.unsplash.com/photo-1562774053-701939374585?w=300&h=200&fit=crop",
      description: "Juara 3 Nasional 2023, tim dengan disiplin terbaik",
      rank: 1,
      category: "SMA Negeri",
      city: "Serang",
      members: 32,
      achievements: 5,
      rating: 4.8,
      progress: 75,
      dailyGrowth: 45,
      isPro: true,
    },
    {
      id: 2,
      name: "SMK Teknik 2 Cilegon",
      votes: 892,
      image:
        "https://images.unsplash.com/photo-1515169067868-5387ec356754?w=300&h=200&fit=crop",
      description: "Inovasi Formasi Terbaik, kreatif dalam koreografi",
      rank: 2,
      category: "SMK Teknik",
      city: "Cilegon",
      members: 28,
      achievements: 3,
      rating: 4.6,
      progress: 65,
      dailyGrowth: 32,
      isPro: false,
    },
    {
      id: 3,
      name: "SMAN 3 Tangerang",
      votes: 756,
      image:
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=300&h=200&fit=crop",
      description: "Juara Daerah 2024, teknik baris berbaris sempurna",
      rank: 3,
      category: "SMA Negeri",
      city: "Tangerang",
      members: 30,
      achievements: 4,
      rating: 4.7,
      progress: 58,
      dailyGrowth: 28,
      isPro: true,
    },
    {
      id: 4,
      name: "SMK 1 Pandeglang",
      votes: 643,
      image:
        "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=300&h=200&fit=crop",
      description: "Tim termuda dengan semangat luar biasa",
      rank: 4,
      category: "SMK",
      city: "Pandeglang",
      members: 26,
      achievements: 2,
      rating: 4.5,
      progress: 52,
      dailyGrowth: 25,
      isPro: false,
    },
    {
      id: 5,
      name: "SMAN 4 Cilegon",
      votes: 589,
      image:
        "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?w=300&h=200&fit=crop",
      description: "Konsistensi performa, selalu masuk 5 besar",
      rank: 5,
      category: "SMA Negeri",
      city: "Cilegon",
      members: 31,
      achievements: 6,
      rating: 4.9,
      progress: 49,
      dailyGrowth: 21,
      isPro: true,
    },
    {
      id: 6,
      name: "SMK Pertanian Serang",
      votes: 432,
      image:
        "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=300&h=200&fit=crop",
      description: "Kreatif dalam kostum dan atribut",
      rank: 6,
      category: "SMK Pertanian",
      city: "Serang",
      members: 27,
      achievements: 3,
      rating: 4.4,
      progress: 41,
      dailyGrowth: 18,
      isPro: false,
    },
  ];

  useEffect(() => {
    // Simulasi fetch data
    setTeams(dummyTeams);

    // Hitung total votes
    const total = dummyTeams.reduce((sum, team) => sum + team.votes, 0);
    setTotalVotes(total);

    // Hitung active users (asumsi)
    setActiveUsers(Math.floor(total * 0.75));

    // Ambil saldo coin dari localStorage
    const balance = parseInt(localStorage.getItem("coinBalance") || "0");
    setCoinBalance(balance);
  }, []);

  const handleVote = (teamId) => {
    // Simulasi voting
    console.log("Voted for team:", teamId);

    // Update votes lokal
    setTeams((prevTeams) =>
      prevTeams.map((team) =>
        team.id === teamId ? { ...team, votes: team.votes + 1 } : team,
      ),
    );

    // Update total votes
    setTotalVotes((prev) => prev + 1);
  };

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(search.toLowerCase()) ||
      team.city.toLowerCase().includes(search.toLowerCase()) ||
      team.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header dengan Balance Coin */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Voting Tim Paskibra 2024
            </h1>
            <p className="text-gray-600">
              Dukung tim favorit Anda dengan coin voting!
            </p>
          </div>

          {/* Coin Balance & Buy Button */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3">
              <Coins size={24} className="text-white" />
              <div>
                <div className="text-sm font-medium">Coin Anda</div>
                <div className="text-2xl font-bold">{coinBalance}</div>
              </div>
            </div>
            <button
              onClick={() => navigate("/ticket")} // Ubah ini
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md">
              Beli Coin
            </button>
          </motion.div>
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Coins size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">
                Sistem Voting dengan Coin
              </h3>
              <p className="text-gray-700 text-sm">
                Setiap vote menggunakan 1 coin. Beli coin terlebih dahulu untuk
                mendukung tim favorit Anda.
                <span className="font-semibold text-blue-700">
                  {" "}
                  1 Coin = 1 Vote
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl shadow-lg p-5 mb-8">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Cari nama tim, kota, atau kategori..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3 w-full lg:w-auto">
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors flex-1 lg:flex-none">
              <Filter size={18} />
              Filter
            </button>
            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 font-medium transition-all shadow-md flex-1 lg:flex-none">
              <TrendingUp size={18} />
              Trending
            </button>
          </div>
        </div>
      </div>

      {/* Voting Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Coins size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Total Votes</h3>
              <p className="text-3xl font-bold">
                {totalVotes.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-blue-100 text-sm">
            +{Math.floor(totalVotes * 0.1)} hari ini
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Tim Terdaftar</h3>
              <p className="text-3xl font-bold">{teams.length}</p>
            </div>
          </div>
          <p className="text-purple-100 text-sm">Dari 5 kota berbeda</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Trophy size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Pemilih Aktif</h3>
              <p className="text-3xl font-bold">
                {activeUsers.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-green-100 text-sm">Online sekarang</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Coin Terpakai</h3>
              <p className="text-3xl font-bold">
                {totalVotes.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-yellow-100 text-sm">1 vote = 1 coin</p>
        </motion.div>
      </div>

      {/* Coin Usage Guide */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-5 mb-8">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <Coins size={20} className="text-yellow-600" />
          Cara Menggunakan Coin Voting:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-yellow-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 font-bold">1</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Beli Coin</p>
                <p className="text-gray-600 text-sm">
                  Dapatkan coin dari halaman tiket
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-yellow-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 font-bold">2</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Pilih Tim</p>
                <p className="text-gray-600 text-sm">Cari tim favorit Anda</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-yellow-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 font-bold">3</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Vote</p>
                <p className="text-gray-600 text-sm">
                  Klik vote (1 vote = 1 coin)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Search size={48} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Tim tidak ditemukan
          </h3>
          <p className="text-gray-500">Coba kata kunci pencarian lain</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}>
              <VotingCard team={team} onVote={handleVote} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>
          Voting akan berakhir pada 27 Oktober 2024. Coin yang sudah digunakan
          tidak dapat dikembalikan.
        </p>
        <p className="mt-1">
          Punya pertanyaan?{" "}
          <button
            onClick={() => navigate("/ticket")}
            className="text-blue-600 hover:text-blue-800 font-medium underline">
            Kembali ke Pembelian Coin
          </button>
        </p>
      </div>
    </div>
  );
};

export default VotingPage;
