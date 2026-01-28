import { useState } from "react";
import {
  Trophy,
  Medal,
  BarChart3,
  TrendingUp,
  Download,
  Share2,
  Award,
  Users,
  Target,
  Star,
} from "lucide-react";

const ResultsPage = () => {
  const [activeCategory, setActiveCategory] = useState("senior");

  const results = {
    senior: [
      {
        rank: 1,
        name: "SMAN 1 Kota Serang",
        score: 98.5,
        votes: 1245,
        city: "Serang",
        category: "SMA Negeri",
      },
      {
        rank: 2,
        name: "SMK Teknik 2 Cilegon",
        score: 96.2,
        votes: 892,
        city: "Cilegon",
        category: "SMK Teknik",
      },
      {
        rank: 3,
        name: "SMAN 3 Tangerang",
        score: 94.8,
        votes: 745,
        city: "Tangerang",
        category: "SMA Negeri",
      },
      {
        rank: 4,
        name: "SMAN 4 Cilegon",
        score: 92.3,
        votes: 621,
        city: "Cilegon",
        category: "SMA Negeri",
      },
      {
        rank: 5,
        name: "SMK 1 Pandeglang",
        score: 90.7,
        votes: 543,
        city: "Pandeglang",
        category: "SMK",
      },
    ],
    junior: [
      {
        rank: 1,
        name: "SMP Negeri 1 Serang",
        score: 95.7,
        votes: 654,
        city: "Serang",
        category: "SMP Negeri",
      },
      {
        rank: 2,
        name: "SMP Islam Terpadu",
        score: 93.4,
        votes: 521,
        city: "Cilegon",
        category: "SMP Swasta",
      },
      {
        rank: 3,
        name: "MTs Negeri 1",
        score: 91.2,
        votes: 432,
        city: "Tangerang",
        category: "MTs",
      },
      {
        rank: 4,
        name: "SMP Global School",
        score: 89.8,
        votes: 398,
        city: "Pandeglang",
        category: "SMP Swasta",
      },
      {
        rank: 5,
        name: "SMP Kristen 2",
        score: 87.5,
        votes: 345,
        city: "Serang",
        category: "SMP Swasta",
      },
    ],
  };

  const categories = [
    {
      id: "senior",
      name: "Senior (SMA/SMK)",
      count: 15,
      icon: <Trophy size={18} />,
    },
    {
      id: "junior",
      name: "Junior (SMP/MTs)",
      count: 9,
      icon: <Award size={18} />,
    },
  ];

  const stats = [
    { label: "Total Tim", value: "24", icon: <Users size={20} /> },
    { label: "Total Votes", value: "2,548", icon: <Target size={20} /> },
    { label: "Juri Aktif", value: "15", icon: <Star size={20} /> },
    { label: "Skor Tertinggi", value: "98.5", icon: <TrendingUp size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 mb-4 sm:mb-6">
            <Trophy size={32} className="text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Hasil Akhir Lomba
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-4">
            Pengumuman pemenang Lomba Paskibra Banten 2024
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-200 rounded-full">
            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
            <span className="text-sm font-medium text-teal-700">
              Hasil Final • Sudah Ditutup
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <div className="text-gray-600">{stat.icon}</div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`
                flex items-center gap-3 px-5 py-3 rounded-xl whitespace-nowrap transition-all duration-200
                ${
                  activeCategory === category.id
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }
              `}>
              {category.icon}
              <span className="font-medium">{category.name}</span>
              <span
                className={`
                px-2 py-1 rounded-full text-xs font-bold
                ${
                  activeCategory === category.id
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-600"
                }
              `}>
                {category.count} tim
              </span>
            </button>
          ))}
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900">
              Peringkat {activeCategory === "senior" ? "Senior" : "Junior"}
            </h2>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 size={18} />
                <span className="text-sm font-medium">Share</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all shadow-sm">
                <Download size={18} />
                <span className="text-sm font-medium">Export</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-4 px-4 sm:px-6 text-left font-semibold text-gray-600 text-sm">
                    Peringkat
                  </th>
                  <th className="py-4 px-4 sm:px-6 text-left font-semibold text-gray-600 text-sm">
                    Nama Tim
                  </th>
                  <th className="py-4 px-4 sm:px-6 text-left font-semibold text-gray-600 text-sm">
                    Kota
                  </th>
                  <th className="py-4 px-4 sm:px-6 text-left font-semibold text-gray-600 text-sm">
                    Skor Akhir
                  </th>
                  <th className="py-4 px-4 sm:px-6 text-left font-semibold text-gray-600 text-sm">
                    Votes
                  </th>
                  <th className="py-4 px-4 sm:px-6 text-left font-semibold text-gray-600 text-sm">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {results[activeCategory].map((team) => (
                  <tr
                    key={team.rank}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-2">
                        <div
                          className={`
                          w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white
                          ${
                            team.rank === 1
                              ? "bg-gradient-to-r from-orange-500 to-orange-600"
                              : team.rank === 2
                                ? "bg-gradient-to-r from-teal-500 to-teal-600"
                                : team.rank === 3
                                  ? "bg-gradient-to-r from-amber-500 to-amber-600"
                                  : "bg-gray-200 text-gray-700"
                          }
                        `}>
                          {team.rank}
                        </div>
                        {team.rank <= 3 && (
                          <Medal
                            className={`
                            ${
                              team.rank === 1
                                ? "text-orange-500"
                                : team.rank === 2
                                  ? "text-teal-500"
                                  : "text-amber-500"
                            }
                          `}
                            size={20}
                          />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div>
                        <div className="font-bold text-gray-900">
                          {team.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {team.category}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {team.city}
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="text-2xl font-bold text-orange-600">
                        {team.score}
                      </div>
                      <div className="text-xs text-gray-500">/100</div>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-medium text-gray-900">
                        {team.votes.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-teal-600">
                        <TrendingUp size={12} />
                        <span>+12%</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <span
                        className={`
                        px-3 py-1 rounded-full text-xs font-bold
                        ${
                          team.rank <= 3
                            ? "bg-orange-100 text-orange-800"
                            : "bg-teal-100 text-teal-800"
                        }
                      `}>
                        {team.rank <= 3 ? "JUARA" : "FINALIS"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts & Analysis */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Distribusi Skor */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 size={20} className="text-teal-600" />
              Distribusi Skor
            </h3>
            <div className="space-y-4">
              {[
                { score: 98.5, teams: 3, percent: 20 },
                { score: 95, teams: 5, percent: 35 },
                { score: 90, teams: 8, percent: 55 },
                { score: 85, teams: 11, percent: 75 },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">Skor {item.score}+</span>
                    <span className="font-medium text-gray-900">
                      {item.teams} tim
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analisis Prestasi */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">
              Analisis Prestasi
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-50/50 border border-orange-100 rounded-xl">
                <div className="text-sm text-orange-700 font-medium mb-1">
                  Tim dengan Votes Tertinggi
                </div>
                <div className="text-lg font-bold text-gray-900">
                  SMAN 1 Kota Serang - 1,245 votes
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-teal-50 to-teal-50/50 border border-teal-100 rounded-xl">
                <div className="text-sm text-teal-700 font-medium mb-1">
                  Peningkatan Tercepat
                </div>
                <div className="text-lg font-bold text-gray-900">
                  SMK Teknik 2 - +45% dalam 24 jam
                </div>
              </div>
              <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-50/50 border border-amber-100 rounded-xl">
                <div className="text-sm text-amber-700 font-medium mb-1">
                  Konsistensi Tertinggi
                </div>
                <div className="text-lg font-bold text-gray-900">
                  SMAN 3 Tangerang - Skor stabil 94+
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-10 text-center text-gray-500 text-sm">
          <p className="mb-2">
            Hasil ini merupakan penilaian akhir dari dewan juri dan voting
            publik.
          </p>
          <p>Semua keputusan bersifat final dan tidak dapat diganggu gugat.</p>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
