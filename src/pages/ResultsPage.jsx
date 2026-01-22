// pages/ResultsPage.jsx
import {
  Trophy,
  Medal,
  BarChart3,
  TrendingUp,
  Download,
  Share2,
} from "lucide-react";
import { useState } from "react";

const ResultsPage = () => {
  const [activeCategory, setActiveCategory] = useState("senior");

  const results = {
    senior: [
      {
        rank: 1,
        name: "SMAN 1 Kota",
        score: 98.5,
        votes: 1245,
        city: "Jakarta",
      },
      {
        rank: 2,
        name: "SMK Teknik 2",
        score: 96.2,
        votes: 892,
        city: "Bandung",
      },
      {
        rank: 3,
        name: "SMA Unggulan",
        score: 94.8,
        votes: 745,
        city: "Surabaya",
      },
    ],
    junior: [
      { rank: 1, name: "SMP 5", score: 95.7, votes: 654, city: "Jakarta" },
      {
        rank: 2,
        name: "MTs Negeri 1",
        score: 93.4,
        votes: 521,
        city: "Yogyakarta",
      },
      { rank: 3, name: "SMP Global", score: 91.2, votes: 432, city: "Bali" },
    ],
  };

  const categories = [
    { id: "senior", name: "Senior (SMA/SMK)", count: 15 },
    { id: "junior", name: "Junior (SMP/MTs)", count: 9 },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600 mb-6">
          <Trophy size={40} className="text-white" />
        </div>
        <h1 className="text-4xl font-display font-bold text-neutral-900 mb-4">
          Hasil Akhir Lomba
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
          Pengumuman pemenang Lomba Paskibra Nasional 2024
        </p>
        <div className="inline-flex items-center space-x-2 mt-4 px-4 py-2 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-primary-700">
            Hasil Final • Sudah Ditutup
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-10">
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-neutral-900 mb-2">24</div>
          <div className="text-sm text-neutral-500">Total Tim</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-neutral-900 mb-2">2,548</div>
          <div className="text-sm text-neutral-500">Total Votes</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-neutral-900 mb-2">15</div>
          <div className="text-sm text-neutral-500">Juri Aktif</div>
        </div>
        <div className="stat-card text-center">
          <div className="text-3xl font-bold text-neutral-900 mb-2">98.5</div>
          <div className="text-sm text-neutral-500">Skor Tertinggi</div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-2 mb-8 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`
              flex items-center space-x-3 px-6 py-3 rounded-xl whitespace-nowrap transition-all
              ${
                activeCategory === category.id
                  ? "bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg"
                  : "bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200"
              }
            `}>
            <Medal
              className={
                activeCategory === category.id
                  ? "text-yellow-300"
                  : "text-neutral-400"
              }
            />
            <span className="font-medium">{category.name}</span>
            <span
              className={`
              px-2 py-1 rounded-full text-xs font-bold
              ${
                activeCategory === category.id
                  ? "bg-white/20 text-white"
                  : "bg-neutral-100 text-neutral-600"
              }
            `}>
              {category.count} tim
            </span>
          </button>
        ))}
      </div>

      {/* Results Table */}
      <div className="card-elevated overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-neutral-900">
            Peringkat {activeCategory === "senior" ? "Senior" : "Junior"}
          </h2>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 border border-neutral-200 rounded-lg hover:bg-neutral-50">
              <Share2 size={18} />
              <span className="text-sm font-medium">Share</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              <Download size={18} />
              <span className="text-sm font-medium">Export</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50">
                <th className="py-4 px-6 text-left font-semibold text-neutral-600">
                  Peringkat
                </th>
                <th className="py-4 px-6 text-left font-semibold text-neutral-600">
                  Nama Tim
                </th>
                <th className="py-4 px-6 text-left font-semibold text-neutral-600">
                  Kota
                </th>
                <th className="py-4 px-6 text-left font-semibold text-neutral-600">
                  Skor Akhir
                </th>
                <th className="py-4 px-6 text-left font-semibold text-neutral-600">
                  Votes
                </th>
                <th className="py-4 px-6 text-left font-semibold text-neutral-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {results[activeCategory].map((team) => (
                <tr
                  key={team.rank}
                  className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div
                        className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold
                        ${
                          team.rank === 1
                            ? "bg-gradient-to-br from-yellow-500 to-yellow-600 text-white"
                            : team.rank === 2
                              ? "bg-gradient-to-br from-neutral-400 to-neutral-500 text-white"
                              : team.rank === 3
                                ? "bg-gradient-to-br from-amber-700 to-amber-800 text-white"
                                : "bg-neutral-100 text-neutral-600"
                        }
                      `}>
                        {team.rank}
                      </div>
                      {team.rank <= 3 && (
                        <Medal
                          className={`
                          ml-2
                          ${
                            team.rank === 1
                              ? "text-yellow-500"
                              : team.rank === 2
                                ? "text-neutral-400"
                                : "text-amber-700"
                          }
                        `}
                        />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-bold text-neutral-900">
                        {team.name}
                      </div>
                      <div className="text-sm text-neutral-500">
                        {team.category || "Paskibra"}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm">
                      {team.city}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-2xl font-bold text-primary-600">
                      {team.score}
                    </div>
                    <div className="text-xs text-neutral-500">/100</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium">
                      {team.votes.toLocaleString()}
                    </div>
                    <div className="flex items-center text-xs text-success-600">
                      <TrendingUp size={12} />
                      <span>+12%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`
                      px-3 py-1 rounded-full text-xs font-bold
                      ${
                        team.rank <= 3
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
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
      <div className="grid lg:grid-cols-2 gap-8 mt-10">
        <div className="card p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center">
            <BarChart3 className="mr-2" />
            Distribusi Skor
          </h3>
          <div className="space-y-4">
            {[85, 90, 95, 98.5].map((score, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span>Skor {score}</span>
                  <span className="font-medium">{24 - idx * 6} tim</span>
                </div>
                <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full"
                    style={{ width: `${100 - idx * 25}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold mb-6">Analisis Prestasi</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-primary-50 to-transparent rounded-xl">
              <div className="text-sm text-primary-600 font-medium mb-1">
                Tim dengan Votes Tertinggi
              </div>
              <div className="text-xl font-bold">SMAN 1 Kota - 1,245 votes</div>
            </div>
            <div className="p-4 bg-gradient-to-r from-secondary-50 to-transparent rounded-xl">
              <div className="text-sm text-secondary-600 font-medium mb-1">
                Peningkatan Tercepat
              </div>
              <div className="text-xl font-bold">
                SMK Teknik 2 - +45% dalam 24 jam
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-success-50 to-transparent rounded-xl">
              <div className="text-sm text-success-600 font-medium mb-1">
                Konsistensi Tertinggi
              </div>
              <div className="text-xl font-bold">
                SMA Unggulan - Skor stabil 94+
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
