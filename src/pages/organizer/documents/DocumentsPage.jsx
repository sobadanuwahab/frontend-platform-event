import React from "react";
import {
  FileText,
  Upload,
  Download,
  Search,
  Filter,
  Folder,
} from "lucide-react";

const DocumentsPage = () => {
  const documents = [
    {
      id: 1,
      name: "SK Panitia",
      type: "PDF",
      size: "2.4 MB",
      date: "2024-01-15",
    },
    {
      id: 2,
      name: "Daftar Peserta",
      type: "Excel",
      size: "1.8 MB",
      date: "2024-01-14",
    },
    {
      id: 3,
      name: "Laporan Keuangan",
      type: "PDF",
      size: "3.2 MB",
      date: "2024-01-13",
    },
    {
      id: 4,
      name: "Foto Dokumentasi",
      type: "ZIP",
      size: "45 MB",
      date: "2024-01-12",
    },
    {
      id: 5,
      name: "Surat Izin Acara",
      type: "PDF",
      size: "1.5 MB",
      date: "2024-01-11",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dokumen</h1>
          <p className="text-gray-400">Kelola dokumen dan file penting</p>
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-medium transition-all">
          <Upload size={18} />
          Upload Dokumen
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Cari dokumen..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Filter size={20} className="text-gray-400 mt-2" />
            <select className="px-3 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white">
              <option>Semua Jenis</option>
              <option>PDF</option>
              <option>Excel</option>
              <option>Gambar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:bg-gray-800/70 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-blue-900/30 rounded-lg">
                <FileText size={20} className="text-blue-400" />
              </div>
              <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg">
                <Download size={16} />
              </button>
            </div>

            <h3 className="font-semibold text-white mb-2">{doc.name}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Jenis:</span>
                <span className="text-white">{doc.type}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Ukuran:</span>
                <span className="text-white">{doc.size}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Tanggal:</span>
                <span className="text-white">{doc.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Storage Info */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white">Penyimpanan</h3>
            <p className="text-sm text-gray-400">
              53.9 MB digunakan dari 100 MB
            </p>
          </div>
          <Folder size={24} className="text-purple-400" />
        </div>

        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
            style={{ width: "53.9%" }}
          ></div>
        </div>

        <div className="flex justify-between mt-2 text-sm text-gray-400">
          <span>53.9 MB</span>
          <span>100 MB</span>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
