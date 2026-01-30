import React from "react";
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  Users,
  FileText,
} from "lucide-react";

const ReportsPage = () => {
  const reports = [
    {
      id: 1,
      name: "Laporan Bulanan Januari",
      type: "Keuangan",
      date: "2024-01-31",
      status: "Selesai",
    },
    {
      id: 2,
      name: "Analisis Peserta",
      type: "Statistik",
      date: "2024-01-28",
      status: "Selesai",
    },
    {
      id: 3,
      name: "Laporan Kegiatan",
      type: "Aktivitas",
      date: "2024-01-25",
      status: "Selesai",
    },
    {
      id: 4,
      name: "Laporan Bulanan Februari",
      type: "Keuangan",
      date: "2024-02-28",
      status: "Draft",
    },
  ];

  const stats = [
    { label: "Total Laporan", value: "12", icon: FileText, color: "blue" },
    { label: "Laporan Selesai", value: "9", icon: BarChart3, color: "green" },
    { label: "Dalam Proses", value: "2", icon: TrendingUp, color: "yellow" },
    { label: "Draft", value: "1", icon: Calendar, color: "purple" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Laporan</h1>
          <p className="text-gray-400">Kelola dan buat laporan aktivitas</p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-medium transition-all">
          <BarChart3 size={18} />
          Buat Laporan Baru
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: "bg-blue-900/30 text-blue-400",
            green: "bg-green-900/30 text-green-400",
            yellow: "bg-yellow-900/30 text-yellow-400",
            purple: "bg-purple-900/30 text-purple-400",
          };

          return (
            <div
              key={index}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${colorClasses[stat.color]}`}>
                  <Icon size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reports Table */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="font-semibold text-white">Daftar Laporan</h3>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400">Jan 2024</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="py-3 px-4 text-left text-gray-400 font-medium">
                  Nama Laporan
                </th>
                <th className="py-3 px-4 text-left text-gray-400 font-medium">
                  Jenis
                </th>
                <th className="py-3 px-4 text-left text-gray-400 font-medium">
                  Tanggal
                </th>
                <th className="py-3 px-4 text-left text-gray-400 font-medium">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-gray-400 font-medium">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr
                  key={report.id}
                  className="border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-900/30 rounded-lg">
                        <FileText size={16} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{report.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                      {report.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-300">{report.date}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        report.status === "Selesai"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded-lg transition-colors">
                        <Download size={18} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors">
                        Lihat
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
        <h3 className="font-semibold text-white mb-4">Aktivitas Laporan</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-900/30 rounded-lg">
                <BarChart3 size={16} className="text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium">Laporan dibuat</p>
                <p className="text-sm text-gray-400">Laporan Bulanan Januari</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">2 hari lalu</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-900/30 rounded-lg">
                <Download size={16} className="text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">Laporan didownload</p>
                <p className="text-sm text-gray-400">Analisis Peserta</p>
              </div>
            </div>
            <span className="text-sm text-gray-500">1 minggu lalu</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
