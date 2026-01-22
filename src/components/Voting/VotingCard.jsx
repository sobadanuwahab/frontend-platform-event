import {
  Users,
  Trophy,
  Star,
  TrendingUp,
  Eye,
  Medal,
  Vote,
  Heart,
  Flag,
  Award,
  TrendingDown,
  Coins,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const VotingCard = ({ team, onVote }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [coinBalance, setCoinBalance] = useState(0);

  // Ambil saldo coin dari localStorage saat komponen mount
  useEffect(() => {
    const balance = parseInt(localStorage.getItem("coinBalance") || "0");
    setCoinBalance(balance);
  }, []);

  const handleVote = () => {
    const currentBalance = parseInt(localStorage.getItem("coinBalance") || "0");

    if (currentBalance >= 1) {
      // Kurangi 1 coin
      localStorage.setItem("coinBalance", (currentBalance - 1).toString());
      setCoinBalance(currentBalance - 1);

      // Panggil fungsi voting
      onVote(team.id);
      setHasVoted(true);

      setTimeout(() => setHasVoted(false), 2000);
    } else {
      alert("Coin Anda tidak cukup! Silakan beli coin terlebih dahulu.");
      // PERBAIKAN: Gunakan navigate() dari React Router
      navigate("/ticket");
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-br from-yellow-400 to-yellow-500";
      case 2:
        return "bg-gradient-to-br from-gray-300 to-gray-400";
      case 3:
        return "bg-gradient-to-br from-amber-600 to-amber-700";
      default:
        return "bg-gradient-to-br from-red-500 to-red-600";
    }
  };

  const getRankBorder = (rank) => {
    switch (rank) {
      case 1:
        return "border-yellow-400";
      case 2:
        return "border-gray-400";
      case 3:
        return "border-amber-600";
      default:
        return "border-red-300";
    }
  };

  const getBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 text-yellow-800";
      case 2:
        return "bg-gray-100 text-gray-800";
      case 3:
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <div
      className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200 hover:border-red-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      {/* Red Accent Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-red-600"></div>

      {/* Coin Balance Badge */}
      <div className="absolute top-4 right-4 z-20">
        <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1.5 rounded-full shadow-md">
          <Coins size={16} />
          <span className="font-bold text-sm">{coinBalance}</span>
        </div>
      </div>

      {/* Like Button */}
      <button
        onClick={() => setIsLiked(!isLiked)}
        className="absolute top-16 right-4 z-20 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110">
        <Heart
          size={20}
          className={isLiked ? "fill-red-500 text-red-500" : "text-gray-400"}
        />
      </button>

      {/* Rank Badge */}
      <div className="absolute top-4 left-4 z-10">
        <div
          className={`relative w-14 h-14 rounded-xl ${getRankColor(team.rank)} flex items-center justify-center shadow-lg border-2 ${getRankBorder(team.rank)}`}>
          <Medal size={24} className="text-white" />
          <span
            className={`absolute -top-2 -right-2 ${getBadgeColor(team.rank)} text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow`}>
            {team.rank}
          </span>
        </div>
      </div>

      {/* Team Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={team.image}
          alt={team.name}
          className={`
            w-full h-full object-cover transition-all duration-700
            ${isHovered ? "scale-110" : "scale-100"}
          `}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' text-anchor='middle' fill='%236b7280' dy='.3em'%3E${encodeURIComponent(team.name)}%3C/text%3E%3C/svg%3E";
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

        {/* View Count */}
        <div className="absolute bottom-4 right-4 flex items-center space-x-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <Eye size={16} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-800">
            {team.views?.toLocaleString() || "2.4K"}
          </span>
        </div>

        {/* City Badge */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <span className="text-sm font-medium text-gray-800 flex items-center gap-1">
            <Flag size={14} />
            {team.city}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="relative p-6 bg-white">
        {/* Team Info */}
        <div className="mb-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                {team.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                  {team.category}
                </span>
                {team.isPro && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center gap-1">
                    <Award size={12} />
                    PRO
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-red-600">
                {team.votes.toLocaleString()}
              </div>
              <div
                className={`flex items-center justify-end space-x-1 text-xs ${team.dailyGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
                {team.dailyGrowth >= 0 ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                <span>
                  {team.dailyGrowth >= 0 ? "+" : ""}
                  {team.dailyGrowth || "45"} hari ini
                </span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 line-clamp-2 text-sm leading-relaxed">
            {team.description}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors duration-300 border border-gray-100">
            <div className="flex items-center justify-center space-x-1.5 text-gray-600 mb-2">
              <Users size={16} />
              <span className="text-xs font-medium">Anggota</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {team.members || 32}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors duration-300 border border-gray-100">
            <div className="flex items-center justify-center space-x-1.5 text-gray-600 mb-2">
              <Trophy size={16} />
              <span className="text-xs font-medium">Prestasi</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {team.achievements || 5}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl hover:bg-red-50 transition-colors duration-300 border border-gray-100">
            <div className="flex items-center justify-center space-x-1.5 text-gray-600 mb-2">
              <Star size={16} />
              <span className="text-xs font-medium">Rating</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {team.rating || "4.8"}
              <span className="text-xs text-gray-500 ml-1">/5</span>
            </div>
          </div>
        </div>

        {/* Voting Button dengan info coin */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Coins size={16} className="text-yellow-600" />
              <span>1 Vote = 1 Coin</span>
            </div>
            <div className="text-sm font-medium text-gray-700">
              Sisa coin:{" "}
              <span className="font-bold text-yellow-600">{coinBalance}</span>
            </div>
          </div>

          <button
            onClick={handleVote}
            disabled={hasVoted || coinBalance < 1}
            className={`
              w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 relative overflow-hidden
              ${
                hasVoted
                  ? "bg-gradient-to-r from-green-500 to-green-600"
                  : coinBalance < 1
                    ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              }
              shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0
              disabled:opacity-80 disabled:cursor-not-allowed
            `}>
            {/* Shimmer Effect */}
            {coinBalance >= 1 && !hasVoted && (
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-full transition-transform duration-1000"></div>
            )}

            <span className="relative flex items-center justify-center space-x-3 text-white">
              {hasVoted ? (
                <>
                  <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  <span className="font-bold">TERIMA KASIH!</span>
                </>
              ) : coinBalance < 1 ? (
                <>
                  <Coins size={22} />
                  <span className="font-bold">BELI COIN DULU</span>
                </>
              ) : (
                <>
                  <Vote size={22} className="animate-pulse" />
                  <span className="font-bold">VOTE SEKARANG</span>
                </>
              )}
            </span>
          </button>

          {/* PERBAIKAN: Tambahkan tombol untuk langsung ke halaman pembelian coin */}
          {coinBalance < 1 && (
            <button
              onClick={() => navigate("/ticket")}
              className="w-full mt-3 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-md">
              Beli Coin Sekarang
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                Progress Voting
              </span>
              <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                {team.progress || 65}%
              </span>
            </div>
            <span className="text-sm font-bold text-red-600">
              {Math.round(
                ((team.progress || 65) * (team.votes || 1000)) / 100,
              ).toLocaleString()}{" "}
              suara
            </span>
          </div>
          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all duration-1000 relative"
              style={{ width: `${team.progress || 65}%` }}>
              {/* Progress Bar Animation */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>0</span>
            <span>
              Target:{" "}
              {(
                team.votes || (1000 * 100) / (team.progress || 65)
              ).toLocaleString()}{" "}
              suara
            </span>
            <span>100%</span>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-red-100 border-2 border-white flex items-center justify-center">
                    <span className="text-xs font-bold text-red-600">+</span>
                  </div>
                ))}
              </div>
              <span className="text-gray-600 ml-2">
                <span className="font-bold text-red-600">42</span> orang sudah
                vote
              </span>
            </div>
            <div className="text-red-600 font-medium">
              🔥 Trending #{team.rank}
            </div>
          </div>
        </div>
      </div>

      {/* Hover Effect Border */}
      {isHovered && (
        <div className="absolute inset-0 border-2 border-red-400 rounded-2xl pointer-events-none animate-pulse"></div>
      )}
    </div>
  );
};

export default VotingCard;
