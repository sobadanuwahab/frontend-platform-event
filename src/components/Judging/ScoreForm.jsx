import { useState, useMemo, useEffect, useRef } from "react";
import {
  Award,
  Target,
  AlertTriangle,
  CheckCircle,
  Save,
  Star,
  Percent,
  TrendingUp,
  Medal,
  Users,
  Flag,
  Volume2,
  Info,
  Palette,
  Smile,
  RefreshCw,
  Calculator,
  FileText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Data dari PDF yang telah distrukturisasi
const FORMS = {
  PBB: {
    id: "pbb",
    title: "A. FORM PENILAIAN PERATURAN BARIS BERBARIS (PBB)",
    icon: <Target size={20} />,
    color: "bg-blue-500",
    total: 700,
    categories: [
      {
        name: "GERAKAN TAMBAHAN",
        items: [
          { key: "bersaf_kumpul", label: "Bersaf Kumpul", max: 35, bobot: 1 },
        ],
      },
      {
        name: "GERAKAN DI TEMPAT DAN BERPINDAH TEMPAT",
        items: [
          { key: "sikap_sempurna", label: "Sikap Sempurna", max: 11, bobot: 1 },
          { key: "hormat", label: "Hormat", max: 20, bobot: 2 },
          { key: "istirahat", label: "Istirahat (Parade)", max: 11, bobot: 1 },
          { key: "berhitung", label: "Berhitung", max: 11, bobot: 1 },
          {
            key: "setengah_lengan",
            label: "Setengah Lengan Lencang Kanan",
            max: 20,
            bobot: 2,
          },
          { key: "hadap_kanan", label: "Hadap Kanan", max: 19, bobot: 1 },
          { key: "lencang_depan", label: "Lencang Depan", max: 11, bobot: 1 },
          {
            key: "hadap_serong_kiri",
            label: "Hadap Serong Kiri",
            max: 19,
            bobot: 1,
          },
          {
            key: "periksa_kerapihan",
            label: "Periksa Kerapihan (Parade)",
            max: 30,
            bobot: 3,
          },
          {
            key: "hadap_serong_kanan",
            label: "Hadap Serong Kanan",
            max: 19,
            bobot: 1,
          },
          {
            key: "hadap_kiri_jalan",
            label: "Hadap Kiri Jalan Di Tempat",
            max: 21,
            bobot: 2,
          },
        ],
      },
      {
        name: "GERAKAN BERPINDAH TEMPAT",
        items: [
          {
            key: "tiga_langkah_belakang",
            label: "3 Langkah Ke Belakang",
            max: 24,
            bobot: 2,
          },
          {
            key: "tiga_langkah_kiri",
            label: "3 Langkah Ke Kiri",
            max: 24,
            bobot: 2,
          },
          {
            key: "empat_langkah_depan",
            label: "4 Langkah Ke Depan",
            max: 24,
            bobot: 2,
          },
        ],
      },
      {
        name: "GERAKAN BERJALAN KE BERHENTI",
        items: [
          { key: "langkah_tegap", label: "Langkah Tegap", max: 23, bobot: 2 },
          {
            key: "langkah_perlahan",
            label: "Langkah Perlahan",
            max: 23,
            bobot: 2,
          },
          {
            key: "langkah_berlari",
            label: "Langkah Berlari",
            max: 23,
            bobot: 2,
          },
        ],
      },
      {
        name: "GERAKAN BERJALAN KE BERJALAN",
        items: [
          {
            key: "biasa_ke_tegap",
            label: "Langkah Biasa ke Langkah Tegap",
            max: 23,
            bobot: 2,
          },
          { key: "ganti_langkah", label: "Ganti Langkah", max: 22, bobot: 2 },
          {
            key: "dua_kali_belok_kanan",
            label: "2 Kali Belok Kanan",
            max: 30,
            bobot: 3,
          },
          {
            key: "hormat_kiri_kanan",
            label: "Hormat Kiri/Kanan",
            max: 25,
            bobot: 2,
          },
          {
            key: "tiap_banjar_belok_kanan",
            label: "Tiap-tiap Banjar 2 Kali Belok Kanan",
            max: 30,
            bobot: 3,
          },
          {
            key: "dua_kali_belok_kiri",
            label: "2 Kali Belok Kiri",
            max: 30,
            bobot: 3,
          },
          { key: "melintang_kiri", label: "Melintang Kiri", max: 35, bobot: 3 },
          { key: "haluan_kiri", label: "Haluan Kiri", max: 32, bobot: 3 },
          {
            key: "hadap_kanan_maju",
            label: "Hadap Kanan Maju",
            max: 20,
            bobot: 2,
          },
          {
            key: "tiap_banjar_belok_kiri",
            label: "Tiap-tiap Banjar 2 Kali Belok Kiri",
            max: 30,
            bobot: 3,
          },
          {
            key: "hadap_kiri_henti",
            label: "Hadap Kiri Henti",
            max: 20,
            bobot: 2,
          },
        ],
      },
      {
        name: "GERAKAN TAMBAHAN",
        items: [
          { key: "bubar_jalan", label: "Bubar Jalan", max: 35, bobot: 3 },
        ],
      },
    ],
  },

  DANTON: {
    id: "danton",
    title: "B. FORM PENILAIAN KOMANDAN PELETON (DANTON)",
    icon: <Users size={20} />,
    color: "bg-purple-500",
    total: 100,
    categories: [
      {
        name: "PENILAIAN UTAMA",
        items: [
          { key: "danton_sikap", label: "Sikap", max: 15, bobot: 1 },
          { key: "danton_volume", label: "Volume Suara", max: 20, bobot: 2 },
          {
            key: "danton_artikulasi",
            label: "Artikulasi Suara",
            max: 20,
            bobot: 2,
          },
          {
            key: "danton_penguasaan_materi",
            label: "Penguasaan Materi",
            max: 20,
            bobot: 2,
          },
          {
            key: "danton_penguasaan_lapangan",
            label: "Penguasaan Lapangan dan Pasukan",
            max: 25,
            bobot: 2,
          },
        ],
      },
    ],
  },

  VARIASI: {
    id: "variasi",
    title: "C. FORM PENILAIAN VARIASI DAN FORMASI",
    icon: <Flag size={20} />,
    color: "bg-green-500",
    total: 225,
    categories: [
      {
        name: "VARIASI - KREATIFITAS",
        items: [
          {
            key: "opening_variasi",
            label: "Opening Variasi",
            max: 8,
            bobot: 1,
          },
          {
            key: "pembukaan_materi",
            label: "Pembukaan Materi dan Isi Pesan",
            max: 8,
            bobot: 1,
          },
          {
            key: "kolaborasi_gerakan",
            label: "Kolaborasi Gerakan & Display/Tampilan",
            max: 8,
            bobot: 1,
          },
        ],
      },
      {
        name: "VARIASI - DINAMIKA & STRUKTUR GERAKAN",
        items: [
          {
            key: "kesesuaian_gerakan",
            label: "Kesesuaian Gerakan dengan Isi Pesan",
            max: 7,
            bobot: 1,
          },
          {
            key: "etika_gerakan",
            label: "Etika, Kesopanan, dan Keamanan Gerakan",
            max: 7,
            bobot: 1,
          },
          {
            key: "tingkat_kesulitan",
            label: "Tingkat Kesulitan & Detail Gerakan",
            max: 8,
            bobot: 1,
          },
          {
            key: "kerapihan_shaf",
            label: "Kerapihan Shaf, Banjar, dan Kelompokan Gerakan",
            max: 8,
            bobot: 1,
          },
          {
            key: "kesesuaian_format",
            label: "Kesesuaian Format Barisan & Penguasaan Lapangan",
            max: 8,
            bobot: 1,
          },
        ],
      },
      {
        name: "VARIASI - PASUKAN",
        items: [
          {
            key: "penjiwaan_pasukan",
            label: "Penjiwaan, Artikulasi & Intonasi",
            max: 8,
            bobot: 1,
          },
          {
            key: "penguasaan_semangat",
            label: "Penguasaan Materi & Semangat Kestabilan Penampilan",
            max: 8,
            bobot: 1,
          },
        ],
      },
      {
        name: "VARIASI - KOMANDAN",
        items: [
          {
            key: "penjiwaan_komandan",
            label: "Penjiwaan, Artikulasi & Intonasi",
            max: 8,
            bobot: 1,
          },
          {
            key: "semangat_komandan",
            label: "Semangat dan Kestabilan Penampilan",
            max: 8,
            bobot: 1,
          },
          {
            key: "penguasaan_komandan",
            label: "Penguasaan Lapangan, Materi & Aba-Aba",
            max: 9,
            bobot: 1,
          },
        ],
      },
      {
        name: "FORMASI - KREATIFITAS",
        items: [
          {
            key: "pengembangan_pesan",
            label: "Pengembangan Isi Pesan",
            max: 9,
            bobot: 1,
          },
          {
            key: "kolaborasi_formasi",
            label: "Kolaborasi Gerakan & Display/Tampilan",
            max: 8,
            bobot: 1,
          },
        ],
      },
      {
        name: "FORMASI - DINAMIKA & STRUKTUR GERAKAN",
        items: [
          {
            key: "kesesuaian_formasi",
            label: "Kesesuaian Gerakan dengan Isi Pesan",
            max: 7,
            bobot: 1,
          },
          {
            key: "etika_formasi",
            label: "Etika, Kesopanan, dan Keamanan Gerakan",
            max: 7,
            bobot: 1,
          },
          {
            key: "detail_kerapihan",
            label: "Detail, Kerapihan & Kelompokan Gerakan",
            max: 11,
            bobot: 1,
          },
        ],
      },
      {
        name: "FORMASI - PROSES BUKA TUTUP & BENTUK AKHIR FORMASI",
        items: [
          {
            key: "kelurusan_barisan",
            label:
              "Kelurusan Barisan, Shaf, Banjar, Simetris pada Bentuk Akhir",
            max: 10,
            bobot: 1,
          },
          {
            key: "penggunaan_lapangan",
            label: "Tingkat Kesulitan & Penguasaan Penggunaan Lapangan",
            max: 10,
            bobot: 1,
          },
        ],
      },
      {
        name: "FORMASI - PASUKAN",
        items: [
          {
            key: "semangat_pasukan",
            label: "Semangat, Penjiwaan, Artikulasi & Intonasi",
            max: 8,
            bobot: 1,
          },
          {
            key: "kestabilan_pasukan",
            label: "Penguasaan Materi & Semangat Kestabilan Penampilan",
            max: 8,
            bobot: 1,
          },
        ],
      },
      {
        name: "FORMASI - KOMANDAN",
        items: [
          {
            key: "semangat_komandan_formasi",
            label: "Semangat, Penjiwaan, Artikulasi & Intonasi",
            max: 8,
            bobot: 1,
          },
          {
            key: "sikap_olah_gerak",
            label: "Sikap & Olah Gerak",
            max: 9,
            bobot: 1,
          },
          {
            key: "penguasaan_aba_aba",
            label: "Penguasaan Lapangan, Materi & Aba-Aba",
            max: 9,
            bobot: 1,
          },
        ],
      },
      {
        name: "ALL PERFORMANCE VAFOR",
        items: [
          {
            key: "semangat_kestabilan",
            label: "Semangat & Kestabilan",
            max: 9,
            bobot: 1,
          },
          {
            key: "ending_celebration",
            label: "Ending Celebration",
            max: 9,
            bobot: 1,
          },
        ],
      },
    ],
  },

  KOSTUM: {
    id: "kostum",
    title: "D. FORM PENILAIAN KOSTUM TERBAIK",
    icon: <Palette size={20} />,
    color: "bg-amber-500",
    total: 75,
    categories: [
      {
        name: "TUTUP KEPALA",
        items: [
          {
            key: "kesesuaian_gender",
            label: "Kesesuaian Gender/Konsep",
            max: 5,
            bobot: 1,
          },
          {
            key: "keselarasan_penutup",
            label: "Keselarasan Penutup Kepala dengan Kostum",
            max: 4,
            bobot: 1,
          },
          {
            key: "kesesuaian_atribut",
            label: "Kesesuaian Atribut dengan Design Penutup Kepala",
            max: 4,
            bobot: 1,
          },
          {
            key: "kerapihan_penutup",
            label: "Kerapihan & Kebersihan Penggunaan Penutup Kepala",
            max: 4,
            bobot: 1,
          },
        ],
      },
      {
        name: "BAJU/CELANA/ROK",
        items: [
          {
            key: "kesesuaian_bahan",
            label: "Kesesuaian Bahan dengan Model Baju dan Celana",
            max: 5,
            bobot: 1,
          },
          {
            key: "cuttingan_body",
            label: "Cuttingan & Body Fitting / Ukuran Baju",
            max: 5,
            bobot: 1,
          },
          {
            key: "design_kostum",
            label: "Design Kostum dengan Konsep Performance",
            max: 5,
            bobot: 1,
          },
          {
            key: "paduan_warna",
            label: "Keselarasan / Paduan Warna",
            max: 4,
            bobot: 1,
          },
          {
            key: "kharisma_kostum",
            label: "Kharisma Pembawaan Kostum",
            max: 4,
            bobot: 1,
          },
          {
            key: "kesopanan_kerapihan",
            label: "Kesopanan, Kerapihan & Kebersihan",
            max: 4,
            bobot: 1,
          },
        ],
      },
      {
        name: "SEPATU / ALASAN KAKI",
        items: [
          {
            key: "kesesuaian_sepatu",
            label: "Kesesuaian Sepatu dengan Design Seragam",
            max: 4,
            bobot: 1,
          },
          { key: "ukuran_sepatu", label: "Ukuran Sepatu", max: 4, bobot: 1 },
          {
            key: "kerapihan_sepatu",
            label: "Kerapihan & Kebersihan Penggunaan",
            max: 4,
            bobot: 1,
          },
        ],
      },
      {
        name: "KREATIFITAS KOSTUM & ATRIBUT",
        items: [
          {
            key: "kesesuaian_atribut_design",
            label: "Kesesuaian Atribut dengan Design Kostum",
            max: 5,
            bobot: 1,
          },
          {
            key: "kerapihan_atribut",
            label: "Kerapihan & Kebersihan",
            max: 5,
            bobot: 1,
          },
        ],
      },
      {
        name: "TOTAL DESIGN",
        items: [{ key: "total_look", label: "Total Look", max: 9, bobot: 1 }],
      },
    ],
  },

  MAKEUP: {
    id: "makeup",
    title: "E. FORM PENILAIAN MAKE UP TERBAIK",
    icon: <Smile size={20} />,
    color: "bg-pink-500",
    total: 150,
    categories: [
      {
        name: "TEKNIK MAKEUP",
        items: [
          {
            key: "kesesuaian_makeup",
            label: "Kesesuaian Makeup",
            max: 26,
            bobot: 2,
          },
          {
            key: "kerapihan_makeup",
            label: "Kerapihan Makeup",
            max: 25,
            bobot: 2,
          },
          { key: "complexion", label: "Complexion", max: 20, bobot: 2 },
          {
            key: "shading_contour",
            label: "Shading, Contour & Highlight",
            max: 22,
            bobot: 2,
          },
          {
            key: "rias_mata",
            label: "Riasan Mata & Bentuk Alis",
            max: 19,
            bobot: 1,
          },
          { key: "blush_on", label: "Aplikasi Blush on", max: 19, bobot: 1 },
          {
            key: "warna_bibir",
            label: "Aplikasi Warna Bibir",
            max: 19,
            bobot: 1,
          },
        ],
      },
    ],
  },
};

const ScoreForm = () => {
  const [scores, setScores] = useState({});
  const [activeForm, setActiveForm] = useState("pbb");
  const [showSuccess, setShowSuccess] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [judgeName, setJudgeName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef(null);

  // Initialize from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("lkbb_full_scores");
    if (savedData) {
      const data = JSON.parse(savedData);
      setScores(data.scores || {});
      setTeamName(data.teamName || "");
      setJudgeName(data.judgeName || "");
      setTeamCode(data.teamCode || "");
    }
  }, []);

  // Debounced save function
  const debouncedSave = (newScores) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      setIsSaving(true);

      const saveData = {
        scores: newScores,
        teamName,
        judgeName,
        teamCode,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem("lkbb_full_scores", JSON.stringify(saveData));

      setIsSaving(false);
    }, 300);
  };

  const handleScoreChange = (key, value) => {
    if (value === "" || value === null || value === undefined) {
      const newScores = { ...scores };
      delete newScores[key];
      setScores(newScores);
      debouncedSave(newScores);
      return;
    }

    const numValue = Number(value);
    if (isNaN(numValue)) return;

    // Temukan maksimum untuk item ini
    let max = 0;
    Object.values(FORMS).forEach((form) => {
      form.categories.forEach((category) => {
        category.items.forEach((item) => {
          if (item.key === key) {
            max = item.max;
          }
        });
      });
    });

    // Validasi nilai
    const validatedValue = Math.min(Math.max(numValue, 0), max);

    const newScores = { ...scores, [key]: validatedValue };
    setScores(newScores);
    debouncedSave(newScores);
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return "text-green-600 bg-green-50 border-green-200";
    if (percentage >= 80) return "text-blue-600 bg-blue-50 border-blue-200";
    if (percentage >= 70)
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (percentage >= 60)
      return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getFormScore = (formId) => {
    const form = FORMS[formId.toUpperCase()];
    if (!form) return { score: 0, max: 0, percentage: 0 };

    let totalScore = 0;
    let totalMax = 0;

    form.categories.forEach((category) => {
      category.items.forEach((item) => {
        totalScore += scores[item.key] || 0;
        totalMax += item.max;
      });
    });

    const percentage =
      totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
    return { score: totalScore, max: totalMax, percentage };
  };

  const getAllScores = () => {
    const result = {};
    Object.keys(FORMS).forEach((formKey) => {
      result[formKey] = getFormScore(formKey);
    });
    return result;
  };

  const getOverallScore = () => {
    const allScores = getAllScores();
    let totalScore = 0;
    let totalMax = 0;

    Object.values(allScores).forEach((formScore) => {
      totalScore += formScore.score;
      totalMax += formScore.max;
    });

    const percentage =
      totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
    return { score: totalScore, max: totalMax, percentage };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!teamName || !judgeName || !teamCode) {
      alert("Harap isi data tim dan juri terlebih dahulu!");
      return;
    }

    const allScores = getAllScores();
    const overall = getOverallScore();

    const payload = {
      teamName,
      teamCode,
      judgeName,
      scores,
      formScores: allScores,
      overallScore: overall,
      timestamp: new Date().toISOString(),
    };

    console.log("DATA NILAI LENGKAP:", payload);

    // Save to localStorage
    localStorage.setItem(
      "lkbb_final_submission_" + Date.now(),
      JSON.stringify(payload),
    );

    // Show success
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Reset semua nilai ke 0? Data akan dihapus dari localStorage.",
      )
    ) {
      setScores({});
      localStorage.removeItem("lkbb_full_scores");
    }
  };

  const ScoreInput = ({ item, formId }) => {
    const currentScore = scores[item.key] || "";
    const max = item.max;
    const percentage = Math.round(((scores[item.key] || 0) / max) * 100);

    const handleChange = (e) => {
      handleScoreChange(item.key, e.target.value);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.target.blur();
      }
    };

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition-all">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-sm">
              {item.label}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">Bobot: {item.bobot}</span>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span className="text-xs text-gray-500">Maks: {max}</span>
            </div>
          </div>
          <div className="text-right ml-4">
            <div
              className={`text-lg font-bold ${
                formId === "kostum"
                  ? "text-amber-600"
                  : formId === "makeup"
                    ? "text-pink-600"
                    : formId === "danton"
                      ? "text-purple-600"
                      : formId === "variasi"
                        ? "text-green-600"
                        : "text-blue-600"
              }`}>
              {scores[item.key] || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">dari {max}</div>
          </div>
        </div>

        {/* Input dengan tombol plus/minus */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max={max}
            value={currentScore}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
            placeholder="Masukkan nilai..."
          />
          <div
            className={`px-3 py-2 rounded-lg border ${getScoreColor(percentage)} text-sm font-medium min-w-[60px] text-center transition-colors`}>
            {percentage}%
          </div>
        </div>

        {/* Tombol quick input */}
        <div className="flex gap-1 mt-2">
          {[0, 5, 10, 15, 20].map((quickValue) => (
            <button
              key={quickValue}
              type="button"
              onClick={() => handleScoreChange(item.key, quickValue)}
              className={`flex-1 py-1 text-xs rounded ${
                scores[item.key] === quickValue
                  ? "bg-blue-100 text-blue-600 border border-blue-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {quickValue}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const FormSection = ({ form }) => {
    const formScore = getFormScore(form.id);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden ${
          activeForm !== form.id ? "opacity-50" : ""
        }`}>
        <div className={`${form.color} p-4 md:p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">{form.icon}</div>
              <div>
                <h2 className="text-xl font-bold text-white">{form.title}</h2>
                <p className="text-white/90 text-sm">
                  Total maksimal: {form.total} poin
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                {formScore.score}
              </div>
              <div className="text-white/80 text-sm">
                dari {formScore.max} ({formScore.percentage}%)
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-white/90 mb-1">
              <span>Progress penilaian</span>
              <span>{formScore.percentage}%</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${formScore.percentage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {form.categories.map((category, catIndex) => (
            <div key={catIndex} className="mb-6 last:mb-0">
              <h3 className="font-bold text-gray-900 mb-3 text-lg border-b pb-2">
                {category.name}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.items.map((item) => (
                  <ScoreInput key={item.key} item={item} formId={form.id} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  const overallScore = getOverallScore();
  const allFormScores = getAllScores();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={48} className="text-green-600" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Nilai Tersimpan!
                </h3>
                <p className="text-gray-600 mb-6">
                  Penilaian lengkap untuk tim{" "}
                  <span className="font-semibold">{teamName}</span> telah
                  berhasil disimpan.
                </p>
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-blue-600">
                      {overallScore.score}
                    </div>
                    <div className="text-sm text-gray-500">
                      Total Poin Keseluruhan
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(allFormScores).map(([key, score]) => (
                      <div key={key} className="bg-white p-2 rounded">
                        <div className="font-medium">{key}</div>
                        <div className="text-blue-600">
                          {score.score}/{score.max}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors w-full">
                  Oke, Mengerti
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-red-600 to-red-700 rounded-xl text-white">
                <Award size={28} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  SISTEM PENILAIAN LKBB LENGKAP
                </h1>
                <p className="text-gray-600">
                  Form penilaian digital berdasarkan standar LKBB XI
                </p>
              </div>
            </div>
            {isSaving && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <RefreshCw size={16} className="animate-spin" />
                <span>Menyimpan...</span>
              </div>
            )}
          </div>

          {/* Team Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} />
              Informasi Tim & Juri
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kode Tim *
                </label>
                <input
                  type="text"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Contoh: PBB-001"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Tim *
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Nama lengkap tim"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Juri *
                </label>
                <input
                  type="text"
                  value={judgeName}
                  onChange={(e) => setJudgeName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Nama lengkap juri"
                  required
                />
              </div>
            </div>
          </div>

          {/* Form Score Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {Object.values(FORMS).map((form) => {
              const score = getFormScore(form.id);
              return (
                <div
                  key={form.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-2 ${form.color} rounded-lg text-white`}>
                      {form.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {form.id}
                      </div>
                      <div className="text-xs text-gray-500">
                        {form.total} poin
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-2">
                    <div className="text-xl font-bold text-gray-900">
                      {score.score}
                    </div>
                    <div className="text-xs text-gray-500">
                      {score.percentage}%
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveForm(form.id)}
                    className={`w-full mt-3 py-1.5 text-xs rounded-lg transition-colors ${
                      activeForm === form.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}>
                    {activeForm === form.id ? "✓ Aktif" : "Lihat"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Overall Score Card */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl shadow-lg p-5 mb-6 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                  <Calculator size={20} />
                  Total Keseluruhan
                </h3>
                <p className="text-gray-300 text-sm">
                  Akumulasi semua form penilaian
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-1">
                  {overallScore.score}
                </div>
                <div className="text-gray-300">
                  dari {overallScore.max} poin
                </div>
              </div>
              <div className="text-center">
                <div
                  className={`text-3xl md:text-4xl font-bold mb-1 ${getScoreColor(overallScore.percentage)}`}>
                  {overallScore.percentage}%
                </div>
                <div className="text-gray-300">Persentase Akhir</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-300 mb-1">
                <span>Progress Keseluruhan</span>
                <span>{overallScore.percentage}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    overallScore.percentage >= 90
                      ? "bg-gradient-to-r from-green-500 to-emerald-600"
                      : overallScore.percentage >= 80
                        ? "bg-gradient-to-r from-blue-500 to-blue-600"
                        : overallScore.percentage >= 70
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                          : overallScore.percentage >= 60
                            ? "bg-gradient-to-r from-orange-500 to-orange-600"
                            : "bg-gradient-to-r from-red-500 to-red-600"
                  }`}
                  style={{ width: `${overallScore.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Form Navigation */}
          <div className="sticky top-4 z-10 bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {Object.values(FORMS).map((form) => (
                <button
                  key={form.id}
                  type="button"
                  onClick={() => setActiveForm(form.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeForm === form.id
                      ? `${form.color} text-white`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}>
                  <span className="font-medium">
                    {form.title.split(". ")[0]}
                  </span>
                  <div
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      activeForm === form.id ? "bg-white/20" : "bg-white"
                    }`}>
                    {form.categories.reduce(
                      (total, cat) => total + cat.items.length,
                      0,
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Form */}
          {Object.values(FORMS).map(
            (form) =>
              activeForm === form.id && (
                <FormSection key={form.id} form={form} />
              ),
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Info size={16} />
                <span>
                  Ketik langsung nilai angka (misal: 25 lalu tekan Enter)
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
                <RefreshCw size={18} />
                Reset Semua
              </button>

              <button
                type="submit"
                disabled={!teamName || !judgeName || !teamCode}
                className={`flex items-center justify-center gap-2 px-8 py-3 font-bold text-white rounded-xl transition-all ${
                  !teamName || !judgeName || !teamCode
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl"
                }`}>
                <Save size={20} />
                SIMPAN SEMUA PENILAIAN
              </button>
            </div>
          </div>
        </form>

        {/* Scoring Guidelines */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Pedoman Penilaian
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">
                PBB (700 poin)
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Fokus pada presisi gerakan</li>
                <li>• Keseragaman barisan</li>
                <li>• Ketepatan aba-aba</li>
              </ul>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2">
                Danton (100 poin)
              </h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Volume dan artikulasi suara</li>
                <li>• Penguasaan materi dan lapangan</li>
                <li>• Sikap dan kewibawaan</li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">
                Variasi & Formasi (225 poin)
              </h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Kreativitas dan orisinalitas</li>
                <li>• Kesesuaian dengan tema</li>
                <li>• Kerapihan dan simetri</li>
              </ul>
            </div>
            <div className="bg-pink-50 rounded-xl p-4 border border-pink-200">
              <h4 className="font-semibold text-pink-900 mb-2">
                Kostum & Makeup (225 poin)
              </h4>
              <ul className="text-sm text-pink-800 space-y-1">
                <li>• Kesesuaian dengan konsep</li>
                <li>• Kerapihan dan kebersihan</li>
                <li>• Keharmonisan penampilan</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ScoreForm;
