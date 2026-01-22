import { useState } from "react";
import ScoreForm from "../components/Judging/ScoreForm";
import JudgingPanel from "../components/Judging/JudgingPanel";
import { Award, BarChart3, Clock, Users } from "lucide-react";

const JudgingPage = () => {
  const [activeTab, setActiveTab] = useState("scoring");

  const teams = [
    {
      id: 1,
      name: "SMAN 1 Kota",
      category: "Senior",
      status: "sedang_dinilai",
    },
    { id: 2, name: "SMK Teknik 2", category: "Senior", status: "belum" },
    { id: 3, name: "SMP 5", category: "Junior", status: "selesai" },
  ];

  const criteria = [
    { id: 1, name: "Kekompakan", weight: 30, maxScore: 100 },
    { id: 2, name: "Kerapian", weight: 25, maxScore: 100 },
    { id: 3, name: "Kreativitas", weight: 20, maxScore: 100 },
    { id: 4, name: "Ketepatan Waktu", weight: 15, maxScore: 100 },
    { id: 5, name: "Penampilan", weight: 10, maxScore: 100 },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Panel Penjurian
        </h1>
        <p className="text-gray-600">Sistem penilaian lomba Paskibra 2024</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tim Dinilai</p>
              <p className="text-xl font-bold">12/24</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rata-rata Skor</p>
              <p className="text-xl font-bold">85.6</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Kriteria</p>
              <p className="text-xl font-bold">5</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sisa Waktu</p>
              <p className="text-xl font-bold">3:45:12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-6 py-3 font-medium ${activeTab === "scoring" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("scoring")}>
          Penilaian
        </button>
        <button
          className={`px-6 py-3 font-medium ${activeTab === "ranking" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("ranking")}>
          Ranking
        </button>
        <button
          className={`px-6 py-3 font-medium ${activeTab === "criteria" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("criteria")}>
          Kriteria
        </button>
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {activeTab === "scoring" && (
            <ScoreForm teams={teams} criteria={criteria} />
          )}
          {activeTab === "ranking" && <JudgingPanel />}
          {activeTab === "criteria" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-6">Kriteria Penilaian</h2>
              <div className="space-y-4">
                {criteria.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">{item.name}</h3>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        Bobot: {item.weight}%
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">
                      Skor maksimal: {item.maxScore} poin
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.weight}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
            <h3 className="font-bold text-lg mb-4">Tim yang Sedang Dinilai</h3>
            <div className="space-y-3">
              {teams
                .filter((team) => team.status === "sedang_dinilai")
                .map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-semibold">{team.name}</p>
                      <p className="text-sm text-gray-600">{team.category}</p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-bold text-lg mb-4">Peringatan</h3>
              <div className="space-y-2 text-sm">
                <p className="text-red-600">
                  • Waktu penilaian: 15 menit per tim
                </p>
                <p className="text-yellow-600">• Skor harus diisi lengkap</p>
                <p className="text-blue-600">• Simpan sebelum pindah tim</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgingPage;
