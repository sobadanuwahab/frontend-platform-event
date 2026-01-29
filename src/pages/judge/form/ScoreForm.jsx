import { useState, useEffect } from "react";
import {
  Save,
  RefreshCw,
  FileText,
  ChevronDown,
  ChevronRight,
  Zap,
  Info,
  AlertCircle,
} from "lucide-react";

// Data PBB dengan nilai yang sudah ditentukan berdasarkan kualitas
const PBB_SCORING_DATA = [
  {
    category: "GERAKAN TAMBAHAN",
    items: [
      {
        id: "bersaf_kumpul",
        label: "Bersaf Kumpul",
        max: 35,
        values: {
          "Kurang (6)": 6,
          "Kurang (7)": 7,
          "Cukup (11)": 11,
          "Cukup (14)": 14,
          "Baik (18)": 18,
          "Baik (21)": 21,
          "Baik Sekali (25)": 25,
          "Baik Sekali (28)": 28,
          "Baik Sekali (32)": 32,
          "Baik Sekali (35)": 35,
        },
      },
    ],
  },
  {
    category: "GERAKAN DI TEMPAT DAN BERPINDAH TEMPAT",
    items: [
      {
        id: "sikap_sempurna",
        label: "Sikap Sempurna",
        max: 11,
        values: {
          "Kurang (2)": 2,
          "Kurang (3)": 3,
          "Cukup (4)": 4,
          "Cukup (5)": 5,
          "Baik (6)": 6,
          "Baik (7)": 7,
          "Baik Sekali (8)": 8,
          "Baik Sekali (9)": 9,
          "Baik Sekali (10)": 10,
          "Baik Sekali (11)": 11,
        },
      },
      {
        id: "hormat",
        label: "Hormat",
        max: 20,
        values: {
          "Kurang (3)": 3,
          "Kurang (4)": 4,
          "Cukup (6)": 6,
          "Cukup (8)": 8,
          "Baik (10)": 10,
          "Baik (12)": 12,
          "Baik Sekali (14)": 14,
          "Baik Sekali (16)": 16,
          "Baik Sekali (18)": 18,
          "Baik Sekali (20)": 20,
        },
      },
      {
        id: "istirahat",
        label: "Istirahat (Parade)",
        max: 11,
        values: {
          "Kurang (2)": 2,
          "Kurang (3)": 3,
          "Cukup (4)": 4,
          "Cukup (5)": 5,
          "Baik (6)": 6,
          "Baik (7)": 7,
          "Baik Sekali (8)": 8,
          "Baik Sekali (9)": 9,
          "Baik Sekali (10)": 10,
          "Baik Sekali (11)": 11,
        },
      },
      {
        id: "berhitung",
        label: "Berhitung",
        max: 11,
        values: {
          "Kurang (2)": 2,
          "Kurang (3)": 3,
          "Cukup (4)": 4,
          "Cukup (5)": 5,
          "Baik (6)": 6,
          "Baik (7)": 7,
          "Baik Sekali (8)": 8,
          "Baik Sekali (9)": 9,
          "Baik Sekali (10)": 10,
          "Baik Sekali (11)": 11,
        },
      },
      {
        id: "setengah_lengan",
        label: "Setengah Lengan Lencang Kanan",
        max: 20,
        values: {
          "Kurang (3)": 3,
          "Kurang (4)": 4,
          "Cukup (6)": 6,
          "Cukup (8)": 8,
          "Baik (10)": 10,
          "Baik (12)": 12,
          "Baik Sekali (14)": 14,
          "Baik Sekali (16)": 16,
          "Baik Sekali (18)": 18,
          "Baik Sekali (20)": 20,
        },
      },
      {
        id: "hadap_kanan",
        label: "Hadap Kanan",
        max: 19,
        values: {
          "Kurang (3)": 3,
          "Kurang (4)": 4,
          "Cukup (6)": 6,
          "Cukup (8)": 8,
          "Baik (10)": 10,
          "Baik (12)": 12,
          "Baik Sekali (14)": 14,
          "Baik Sekali (16)": 16,
          "Baik Sekali (18)": 18,
          "Baik Sekali (19)": 19,
        },
      },
      {
        id: "lencang_depan",
        label: "Lencang Depan",
        max: 11,
        values: {
          "Kurang (2)": 2,
          "Kurang (3)": 3,
          "Cukup (4)": 4,
          "Cukup (5)": 5,
          "Baik (6)": 6,
          "Baik (7)": 7,
          "Baik Sekali (8)": 8,
          "Baik Sekali (9)": 9,
          "Baik Sekali (10)": 10,
          "Baik Sekali (11)": 11,
        },
      },
      {
        id: "hadap_serong_kiri",
        label: "Hadap Serong Kiri",
        max: 19,
        values: {
          "Kurang (3)": 3,
          "Kurang (4)": 4,
          "Cukup (6)": 6,
          "Cukup (8)": 8,
          "Baik (10)": 10,
          "Baik (12)": 12,
          "Baik Sekali (14)": 14,
          "Baik Sekali (16)": 16,
          "Baik Sekali (18)": 18,
          "Baik Sekali (19)": 19,
        },
      },
      {
        id: "periksa_kerapihan",
        label: "Periksa Kerapihan (Parade)",
        max: 30,
        values: {
          "Kurang (5)": 5,
          "Kurang (6)": 6,
          "Cukup (9)": 9,
          "Cukup (12)": 12,
          "Baik (15)": 15,
          "Baik (18)": 18,
          "Baik Sekali (21)": 21,
          "Baik Sekali (24)": 24,
          "Baik Sekali (27)": 27,
          "Baik Sekali (30)": 30,
        },
      },
      {
        id: "hadap_serong_kanan",
        label: "Hadap Serong Kanan",
        max: 19,
        values: {
          "Kurang (3)": 3,
          "Kurang (4)": 4,
          "Cukup (6)": 6,
          "Cukup (8)": 8,
          "Baik (10)": 10,
          "Baik (12)": 12,
          "Baik Sekali (14)": 14,
          "Baik Sekali (16)": 16,
          "Baik Sekali (18)": 18,
          "Baik Sekali (19)": 19,
        },
      },
      {
        id: "hadap_kiri_jalan",
        label: "Hadap Kiri Jalan Di Tempat",
        max: 21,
        values: {
          "Kurang (4)": 4,
          "Kurang (5)": 5,
          "Cukup (7)": 7,
          "Cukup (9)": 9,
          "Baik (11)": 11,
          "Baik (13)": 13,
          "Baik Sekali (15)": 15,
          "Baik Sekali (17)": 17,
          "Baik Sekali (19)": 19,
          "Baik Sekali (21)": 21,
        },
      },
    ],
  },
  {
    category: "GERAKAN BERPINDAH TEMPAT",
    items: [
      {
        id: "tiga_langkah_belakang",
        label: "3 Langkah Ke Belakang",
        max: 24,
        values: {
          "Kurang (4)": 4,
          "Kurang (5)": 5,
          "Cukup (8)": 8,
          "Cukup (10)": 10,
          "Baik (12)": 12,
          "Baik (15)": 15,
          "Baik Sekali (17)": 17,
          "Baik Sekali (20)": 20,
          "Baik Sekali (22)": 22,
          "Baik Sekali (24)": 24,
        },
      },
      {
        id: "tiga_langkah_kiri",
        label: "3 Langkah Ke Kiri",
        max: 24,
        values: {
          "Kurang (4)": 4,
          "Kurang (5)": 5,
          "Cukup (8)": 8,
          "Cukup (10)": 10,
          "Baik (12)": 12,
          "Baik (15)": 15,
          "Baik Sekali (17)": 17,
          "Baik Sekali (20)": 20,
          "Baik Sekali (22)": 22,
          "Baik Sekali (24)": 24,
        },
      },
      {
        id: "empat_langkah_depan",
        label: "4 Langkah Ke Depan",
        max: 24,
        values: {
          "Kurang (4)": 4,
          "Kurang (5)": 5,
          "Cukup (8)": 8,
          "Cukup (10)": 10,
          "Baik (12)": 12,
          "Baik (15)": 15,
          "Baik Sekali (17)": 17,
          "Baik Sekali (20)": 20,
          "Baik Sekali (22)": 22,
          "Baik Sekali (24)": 24,
        },
      },
    ],
  },
  {
    category: "GERAKAN BERJALAN KE BERHENTI",
    items: [
      {
        id: "langkah_tegap",
        label: "Langkah Tegap",
        max: 23,
        values: {
          "Kurang (4)": 4,
          "Kurang (5)": 5,
          "Cukup (7)": 7,
          "Cukup (10)": 10,
          "Baik (12)": 12,
          "Baik (14)": 14,
          "Baik Sekali (17)": 17,
          "Baik Sekali (19)": 19,
          "Baik Sekali (21)": 21,
          "Baik Sekali (23)": 23,
        },
      },
      {
        id: "langkah_perlahan",
        label: "Langkah Perlahan",
        max: 23,
        values: {
          "Kurang (4)": 4,
          "Kurang (5)": 5,
          "Cukup (7)": 7,
          "Cukup (10)": 10,
          "Baik (12)": 12,
          "Baik (14)": 14,
          "Baik Sekali (17)": 17,
          "Baik Sekali (19)": 19,
          "Baik Sekali (21)": 21,
          "Baik Sekali (23)": 23,
        },
      },
      {
        id: "langkah_berlari",
        label: "Langkah Berlari",
        max: 23,
        values: {
          "Kurang (4)": 4,
          "Kurang (5)": 5,
          "Cukup (7)": 7,
          "Cukup (10)": 10,
          "Baik (12)": 12,
          "Baik (14)": 14,
          "Baik Sekali (17)": 17,
          "Baik Sekali (19)": 19,
          "Baik Sekali (21)": 21,
          "Baik Sekali (23)": 23,
        },
      },
    ],
  },
  {
    category: "GERAKAN BERJALAN KE BERJALAN",
    items: [
      {
        id: "biasa_ke_tegap",
        label: "Langkah Biasa ke Langkah Tegap",
        max: 23,
        values: {
          "Kurang (4)": 4,
          "Kurang (5)": 5,
          "Cukup (7)": 7,
          "Cukup (10)": 10,
          "Baik (12)": 12,
          "Baik (14)": 14,
          "Baik Sekali (17)": 17,
          "Baik Sekali (19)": 19,
          "Baik Sekali (21)": 21,
          "Baik Sekali (23)": 23,
        },
      },
      {
        id: "ganti_langkah",
        label: "Ganti Langkah",
        max: 22,
        values: {
          "Kurang (4)": 4,
          "Kurang (5)": 5,
          "Cukup (7)": 7,
          "Cukup (9)": 9,
          "Baik (11)": 11,
          "Baik (14)": 14,
          "Baik Sekali (16)": 16,
          "Baik Sekali (18)": 18,
          "Baik Sekali (20)": 20,
          "Baik Sekali (22)": 22,
        },
      },
      {
        id: "dua_kali_belok_kanan",
        label: "2 Kali Belok Kanan",
        max: 30,
        values: {
          "Kurang (5)": 5,
          "Kurang (6)": 6,
          "Cukup (9)": 9,
          "Cukup (12)": 12,
          "Baik (15)": 15,
          "Baik (18)": 18,
          "Baik Sekali (21)": 21,
          "Baik Sekali (24)": 24,
          "Baik Sekali (27)": 27,
          "Baik Sekali (30)": 30,
        },
      },
      {
        id: "hormat_kiri_kanan",
        label: "Hormat Kiri/Kanan",
        max: 25,
        values: {
          "Kurang (4)": 4,
          "Kurang (5)": 5,
          "Cukup (8)": 8,
          "Cukup (10)": 10,
          "Baik (13)": 13,
          "Baik (15)": 15,
          "Baik Sekali (18)": 18,
          "Baik Sekali (20)": 20,
          "Baik Sekali (23)": 23,
          "Baik Sekali (25)": 25,
        },
      },
      {
        id: "tiap_banjar_belok_kanan",
        label: "Tiap-tiap Banjar 2 Kali Belok Kanan",
        max: 30,
        values: {
          "Kurang (5)": 5,
          "Kurang (6)": 6,
          "Cukup (9)": 9,
          "Cukup (12)": 12,
          "Baik (15)": 15,
          "Baik (18)": 18,
          "Baik Sekali (21)": 21,
          "Baik Sekali (24)": 24,
          "Baik Sekali (27)": 27,
          "Baik Sekali (30)": 30,
        },
      },
      {
        id: "dua_kali_belok_kiri",
        label: "2 Kali Belok Kiri",
        max: 30,
        values: {
          "Kurang (5)": 5,
          "Kurang (6)": 6,
          "Cukup (9)": 9,
          "Cukup (12)": 12,
          "Baik (15)": 15,
          "Baik (18)": 18,
          "Baik Sekali (21)": 21,
          "Baik Sekali (24)": 24,
          "Baik Sekali (27)": 27,
          "Baik Sekali (30)": 30,
        },
      },
      {
        id: "melintang_kiri",
        label: "Melintang Kiri",
        max: 35,
        values: {
          "Kurang (6)": 6,
          "Kurang (7)": 7,
          "Cukup (11)": 11,
          "Cukup (14)": 14,
          "Baik (18)": 18,
          "Baik (21)": 21,
          "Baik Sekali (25)": 25,
          "Baik Sekali (28)": 28,
          "Baik Sekali (32)": 32,
          "Baik Sekali (35)": 35,
        },
      },
      {
        id: "haluan_kiri",
        label: "Haluan Kiri",
        max: 32,
        values: {
          "Kurang (5)": 5,
          "Kurang (7)": 7,
          "Cukup (10)": 10,
          "Cukup (13)": 13,
          "Baik (16)": 16,
          "Baik (20)": 20,
          "Baik Sekali (23)": 23,
          "Baik Sekali (26)": 26,
          "Baik Sekali (29)": 29,
          "Baik Sekali (32)": 32,
        },
      },
      {
        id: "hadap_kanan_maju",
        label: "Hadap Kanan Maju",
        max: 20,
        values: {
          "Kurang (3)": 3,
          "Kurang (4)": 4,
          "Cukup (6)": 6,
          "Cukup (8)": 8,
          "Baik (10)": 10,
          "Baik (12)": 12,
          "Baik Sekali (14)": 14,
          "Baik Sekali (16)": 16,
          "Baik Sekali (18)": 18,
          "Baik Sekali (20)": 20,
        },
      },
      {
        id: "tiap_banjar_belok_kiri",
        label: "Tiap-tiap Banjar 2 Kali Belok Kiri",
        max: 30,
        values: {
          "Kurang (5)": 5,
          "Kurang (6)": 6,
          "Cukup (9)": 9,
          "Cukup (12)": 12,
          "Baik (15)": 15,
          "Baik (18)": 18,
          "Baik Sekali (21)": 21,
          "Baik Sekali (24)": 24,
          "Baik Sekali (27)": 27,
          "Baik Sekali (30)": 30,
        },
      },
      {
        id: "hadap_kiri_henti",
        label: "Hadap Kiri Henti",
        max: 20,
        values: {
          "Kurang (3)": 3,
          "Kurang (4)": 4,
          "Cukup (6)": 6,
          "Cukup (8)": 8,
          "Baik (10)": 10,
          "Baik (12)": 12,
          "Baik Sekali (14)": 14,
          "Baik Sekali (16)": 16,
          "Baik Sekali (18)": 18,
          "Baik Sekali (20)": 20,
        },
      },
    ],
  },
  {
    category: "GERAKAN TAMBAHAN",
    items: [
      {
        id: "bubar_jalan",
        label: "Bubar Jalan",
        max: 35,
        values: {
          "Kurang (6)": 6,
          "Kurang (7)": 7,
          "Cukup (11)": 11,
          "Cukup (14)": 14,
          "Baik (18)": 18,
          "Baik (21)": 21,
          "Baik Sekali (25)": 25,
          "Baik Sekali (28)": 28,
          "Baik Sekali (32)": 32,
          "Baik Sekali (35)": 35,
        },
      },
    ],
  },
];

// Data VARIASI dan KREATIFITAS berdasarkan upload - STRUKTUR SAMA PERSIS
const VARIASI_SCORING_DATA = [
  {
    category: "VARIASI",
    subCategories: [
      {
        subCategory: "KREATIFITAS",
        items: [
          {
            id: "opening_variasi",
            label: "Opening Variasi",
            max: 8,
            values: {
              "0.1 (Kurang)": 1,
              "0.2 (Kurang)": 2,
              "0.35 (Kurang)": 3,
              "0.50 (Cukup)": 4,
              "0.6 (Cukup)": 5,
              "0.8 (Baik)": 7,
              "1.0 (Baik Sekali)": 8,
            },
          },
          {
            id: "pembukaan_materi_dan_isi_Pesan",
            label: "Pembukaan Materi dan Isi Pesan",
            max: 8,
            values: {
              "0.1 (Kurang)": 1,
              "0.2 (Kurang)": 2,
              "0.35 (Kurang)": 3,
              "0.50 (Cukup)": 4,
              "0.6 (Cukup)": 5,
              "0.8 (Baik)": 7,
              "1.0 (Baik Sekali)": 8,
            },
          },
          {
            id: "kolaborasi_gerakan_dan_display",
            label: "Kolaborasi Gerakan & Display/Tampilan (Alat Pendukung)",
            max: 8,
            values: {
              "0.1 (Kurang)": 1,
              "0.2 (Kurang)": 2,
              "0.35 (Kurang)": 3,
              "0.50 (Cukup)": 4,
              "0.6 (Cukup)": 5,
              "0.8 (Baik)": 7,
              "1.0 (Baik Sekali)": 8,
            },
          },
        ],
      },
      {
        subCategory: "DINAMIKA & STRUKTUR GERAKAN",
        items: [
          {
            id: "kesesuaian_gerakan_dengan_isi_pesan",
            label: "Kesesuaian Gerakan Dengan Isi Pesan",
            max: 7,
            values: {
              "0.1 (Kurang)": 1,
              "0.2 (Kurang)": 2,
              "0.35 (Kurang)": 3,
              "0.50 (Cukup)": 4,
              "0.6 (Cukup)": 5,
              "0.8 (Baik)": 6,
              "1.0 (Baik Sekali)": 7,
            },
          },
          {
            id: "etika_kesopanan_dan_keamanan_gerakan",
            label: "Etika Kesopanan dan Keamanan Gerakan",
            max: 7,
            values: {
              "0.1 (Kurang)": 1,
              "0.2 (Kurang)": 2,
              "0.35 (Kurang)": 3,
              "0.50 (Cukup)": 4,
              "0.6 (Cukup)": 5,
              "0.8 (Baik)": 6,
              "1.0 (Baik Sekali)": 7,
            },
          },
          {
            id: "tingkat_kesulitan_dan_detail_gerakan",
            label: "Tingkat Kesulitan & Detail Gerakan",
            max: 8,
            values: {
              "0.1 (Kurang)": 1,
              "0.2 (Kurang)": 2,
              "0.35 (Kurang)": 3,
              "0.50 (Cukup)": 4,
              "0.6 (Cukup)": 5,
              "0.8 (Baik)": 7,
              "1.0 (Baik Sekali)": 8,
            },
          },
          {
            id: "kerapihan_shaf_banjar_dan_kekompakan_gerakan",
            label: "Kerapihan Shaf Banjar dan Kekompakan Gerakan",
            max: 8,
            values: {
              "0.1 (Kurang)": 1,
              "0.2 (Kurang)": 2,
              "0.35 (Kurang)": 3,
              "0.50 (Cukup)": 4,
              "0.6 (Cukup)": 5,
              "0.8 (Baik)": 7,
              "1.0 (Baik Sekali)": 8,
            },
          },
          {
            id: "Kesesuaian_format_barisan_dan_penguasaan_lapangan",
            label: "Kesesuaian Format Barisan dan Penguasaan Lapangan",
            max: 8,
            values: {
              "0.1 (Kurang)": 1,
              "0.2 (Kurang)": 2,
              "0.35 (Kurang)": 3,
              "0.50 (Cukup)": 4,
              "0.6 (Cukup)": 5,
              "0.8 (Baik)": 7,
              "1.0 (Baik Sekali)": 8,
            },
          },
        ],
      },
      {
        subCategory: "PASUKAN",
        items: [
          {
            id: "penjiwaan_artikulasi_intonasi",
            label: "Penjiwaan Artikulasi & Intonasi",
            max: 8,
            values: {
              "0.1 (Kurang)": 1,
              "0.2 (Kurang)": 2,
              "0.35 (Kurang)": 3,
              "0.50 (Cukup)": 4,
              "0.6 (Cukup)": 5,
              "0.8 (Baik)": 7,
              "1.0 (Baik Sekali)": 8,
            },
          },
          {
            id: "penguasaan_materi_dan_semangat_kestabilan_penampilan",
            label: "Penguasaan Materi & Semangat Kestabilan Penampilan",
            max: 8,
            values: {
              "0.1 (Kurang)": 1,
              "0.2 (Kurang)": 2,
              "0.35 (Kurang)": 3,
              "0.50 (Cukup)": 4,
              "0.6 (Cukup)": 5,
              "0.8 (Baik)": 7,
              "1.0 (Baik Sekali)": 8,
            },
          },
        ],
      },
      {
        subCategory: "KOMANDAN",
        items: [
          {
            id: "penjiwaan_artikulasi_intonasi",
            label: "Penjiwaan Artikulasi & Intonasi",
            max: 8,
            values: {
              "0.1 (Kurang)": 1,
              "0.2 (Kurang)": 2,
              "0.35 (Kurang)": 3,
              "0.50 (Cukup)": 4,
              "0.6 (Cukup)": 5,
              "0.8 (Baik)": 7,
              "1.0 (Baik Sekali)": 8,
            },
          },
          {
            id: "semangat_dan_kestabilan_penampilan",
            label: "Semangat dan Kestabilan Penampilan",
            max: 8,
            values: {
              "0.1 (Kurang)": 1,
              "0.2 (Kurang)": 2,
              "0.35 (Kurang)": 3,
              "0.50 (Cukup)": 4,
              "0.6 (Cukup)": 5,
              "0.8 (Baik)": 7,
              "1.0 (Baik Sekali)": 8,
            },
          },
          {
            id: "penguasaan_lapangan_materi_dan_aba",
            label: "Penguasaan Lapangan Materi & Aba-aba",
            max: 9,
            values: {
              "0.1 (Kurang)": 1,
              "0.2 (Kurang)": 2,
              "0.35 (Kurang)": 3,
              "0.50 (Cukup)": 4,
              "0.6 (Cukup)": 5,
              "0.8 (Baik)": 8,
              "1.0 (Baik Sekali)": 9,
            },
          },
        ],
      },
    ],
  },
  {
    category: "FORMASI ",
    subCategories: [
      {
        subCategory: "KREATIFITAS",
        items: [
          {
            id: "pengembangan_isi_pesan",
            label: "Pengembangan Isi Pesan",
            max: 9,
            values: {
              "0.1 (Kurang)": 1,
              "0.2 (Kurang)": 2,
              "0.35 (Kurang)": 4,
              "0.50 (Cukup)": 5,
              "0.6 (Cukup)": 6,
              "0.8 (Baik)": 8,
              "1.0 (Baik Sekali)": 9,
            },
          },
          {
            id: "pembukaan_materi_total",
            label: "TOTAL",
            max: 8,
            values: {
              "0.1 (Kurang)": 1,
              "0.2 (Kurang)": 2,
              "0.35 (Kurang)": 3,
              "0.50 (Cukup)": 4,
              "0.6 (Cukup)": 5,
              "0.8 (Baik)": 6,
              "1.0 (Baik Sekali)": 8,
            },
          },
        ],
      },
    ],
  },
];

// Helper function to get quality label based on value
const getQualityLabel = (value, max) => {
  if (value <= 3) return { label: "Kurang", color: "red" };
  if (value === 4) return { label: "Cukup", color: "yellow" };
  if (value >= 5 && value <= 6) return { label: "Baik", color: "blue" };
  return { label: "Baik Sekali", color: "green" };
};

const ScoreForm = ({ teams = [], userData = null }) => {
  const [scores, setScores] = useState({});
  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubCategories, setExpandedSubCategories] = useState({});
  const [allExpanded, setAllExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("pbb");

  // Initialize from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("pbb_scores");
    if (savedData) {
      const data = JSON.parse(savedData);
      setScores(data.scores || {});
      setTeamName(data.teamName || "");
      setTeamCode(data.teamCode || "");
    }
  }, []);

  // Save to localStorage
  const saveToStorage = (newScores, additionalData = {}) => {
    const data = {
      scores: newScores,
      teamName,
      teamCode,
      ...additionalData,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem("pbb_scores", JSON.stringify(data));
  };

  // Handle score change
  const handleScoreChange = (itemId, value) => {
    const newScores = { ...scores, [itemId]: value };
    setScores(newScores);
    saveToStorage(newScores);
  };

  // Toggle expanded category
  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Toggle expanded subcategory
  const toggleSubCategory = (category, subCategory) => {
    const key = `${category}-${subCategory}`;
    setExpandedSubCategories((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Toggle all categories for active tab
  const toggleAllCategories = () => {
    if (allExpanded) {
      setExpandedCategories({});
      setExpandedSubCategories({});
    } else {
      const allExpandedState = {};
      const allSubExpandedState = {};

      if (activeTab === "pbb") {
        PBB_SCORING_DATA.forEach((cat) => {
          allExpandedState[cat.category] = true;
        });
      } else {
        VARIASI_SCORING_DATA.forEach((cat) => {
          allExpandedState[cat.category] = true;
          cat.subCategories?.forEach((subCat) => {
            const key = `${cat.category}-${subCat.subCategory}`;
            allSubExpandedState[key] = true;
          });
        });
      }

      setExpandedCategories(allExpandedState);
      setExpandedSubCategories(allSubExpandedState);
    }
    setAllExpanded(!allExpanded);
  };

  // Quick fill category with specific quality
  const quickFillCategory = (category, quality) => {
    const dataToUse =
      activeTab === "pbb" ? PBB_SCORING_DATA : VARIASI_SCORING_DATA;
    const categoryData = dataToUse.find((cat) => cat.category === category);
    if (!categoryData) return;

    const newScores = { ...scores };

    if (activeTab === "pbb") {
      categoryData.items.forEach((item) => {
        const values = Object.values(item.values);
        let targetValue = 0;

        switch (quality) {
          case "kurang":
            targetValue = Math.min(...values);
            break;
          case "cukup":
            const sorted = values.sort((a, b) => a - b);
            targetValue = sorted[Math.floor(sorted.length / 2)];
            break;
          case "baik":
            targetValue = Math.max(...values.filter((v) => v < item.max));
            break;
          case "baikSekali":
            targetValue = item.max;
            break;
        }

        newScores[item.id] = targetValue;
      });
    } else {
      // Untuk Variasi, isi semua item dalam kategori
      categoryData.subCategories?.forEach((subCat) => {
        subCat.items.forEach((item) => {
          let targetValue = 0;
          switch (quality) {
            case "kurang":
              targetValue = 2; // nilai tengah dari range 1-3
              break;
            case "cukup":
              targetValue = 4; // nilai tunggal untuk Cukup
              break;
            case "baik":
              targetValue = 6; // nilai maksimum dari range Baik
              break;
            case "baikSekali":
              targetValue = 8; // nilai maksimum
              break;
          }
          newScores[item.id] = targetValue;
        });
      });
    }

    setScores(newScores);
    saveToStorage(newScores);
  };

  // Get total score for active tab
  const getTotalScore = () => {
    const dataToUse =
      activeTab === "pbb" ? PBB_SCORING_DATA : VARIASI_SCORING_DATA;
    let total = 0;

    if (activeTab === "pbb") {
      dataToUse.forEach((category) => {
        category.items.forEach((item) => {
          if (scores[item.id]) {
            total += scores[item.id];
          }
        });
      });
    } else {
      dataToUse.forEach((category) => {
        category.subCategories?.forEach((subCat) => {
          subCat.items.forEach((item) => {
            if (scores[item.id]) {
              total += scores[item.id];
            }
          });
        });
      });
    }
    return total;
  };

  // Get max score for active tab
  const getTotalMaxScore = () => {
    const dataToUse =
      activeTab === "pbb" ? PBB_SCORING_DATA : VARIASI_SCORING_DATA;
    let total = 0;

    if (activeTab === "pbb") {
      dataToUse.forEach((category) => {
        category.items.forEach((item) => {
          total += item.max;
        });
      });
    } else {
      dataToUse.forEach((category) => {
        category.subCategories?.forEach((subCat) => {
          subCat.items.forEach((item) => {
            total += item.max;
          });
        });
      });
    }
    return total;
  };

  // Get percentage for active tab
  const getPercentage = () => {
    const totalMax = getTotalMaxScore();
    const totalScore = getTotalScore();
    return totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
  };

  // Get score by category
  const getCategoryScore = (category) => {
    const dataToUse =
      activeTab === "pbb" ? PBB_SCORING_DATA : VARIASI_SCORING_DATA;
    const categoryData = dataToUse.find((cat) => cat.category === category);
    if (!categoryData) return 0;

    let total = 0;
    if (activeTab === "pbb") {
      categoryData.items.forEach((item) => {
        total += scores[item.id] || 0;
      });
    } else {
      categoryData.subCategories?.forEach((subCat) => {
        subCat.items.forEach((item) => {
          total += scores[item.id] || 0;
        });
      });
    }
    return total;
  };

  // Get max by category
  const getCategoryMax = (category) => {
    const dataToUse =
      activeTab === "pbb" ? PBB_SCORING_DATA : VARIASI_SCORING_DATA;
    const categoryData = dataToUse.find((cat) => cat.category === category);
    if (!categoryData) return 0;

    let total = 0;
    if (activeTab === "pbb") {
      categoryData.items.forEach((item) => {
        total += item.max;
      });
    } else {
      categoryData.subCategories?.forEach((subCat) => {
        subCat.items.forEach((item) => {
          total += item.max;
        });
      });
    }
    return total;
  };

  // Get average quality for category
  const getCategoryQuality = (category) => {
    const catScore = getCategoryScore(category);
    const catMax = getCategoryMax(category);
    return getQualityLabel(Math.round(catScore / 4), 8); // Normalisasi untuk kategori
  };

  // Render scoring form based on active tab
  const renderScoringForm = () => {
    const dataToUse =
      activeTab === "pbb" ? PBB_SCORING_DATA : VARIASI_SCORING_DATA;

    return (
      <div className="bg-white rounded-lg border border-gray-200 mb-6 shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">
            {activeTab === "pbb"
              ? "A. FORM PENILAIAN PERATURAN BARIS BERBARIS (PBB)"
              : "B. FORM PENILAIAN VARIASI & KREATIFITAS"}
          </h2>
          <div className="text-sm text-gray-600 mt-2">
            {activeTab === "pbb"
              ? "Total 30 item penilaian • 700 poin maksimum"
              : "Total 4 item penilaian • 32 poin maksimum"}
          </div>
        </div>

        {/* Categories List */}
        {dataToUse.map((category, catIndex) => {
          const catScore = getCategoryScore(category.category);
          const catMax = getCategoryMax(category.category);
          const catPercentage =
            catMax > 0 ? Math.round((catScore / catMax) * 100) : 0;
          const catQuality = getCategoryQuality(category.category);
          const isCategoryExpanded =
            expandedCategories[category.category] || false;

          return (
            <div key={catIndex} className="border-b last:border-b-0">
              {/* Category Header */}
              <div
                onClick={() => toggleCategory(category.category)}
                className="w-full p-6 text-left hover:bg-gray-50 transition-colors flex justify-between items-center cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="text-gray-500">
                    {isCategoryExpanded ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {category.category}
                    </h3>
                    <div className="text-sm text-gray-600 mt-1">
                      {activeTab === "pbb"
                        ? `${category.items.length} item penilaian`
                        : `${category.subCategories?.reduce((sum, sub) => sum + sub.items.length, 0)} item penilaian`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Quality Indicator */}
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      catQuality.color === "red"
                        ? "bg-red-100 text-red-700"
                        : catQuality.color === "yellow"
                          ? "bg-yellow-100 text-yellow-700"
                          : catQuality.color === "blue"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                    }`}
                  >
                    {catQuality.label}
                  </div>

                  {/* Score Display */}
                  <div className="text-right">
                    <div className="font-bold text-lg text-gray-900">
                      {catScore} / {catMax}
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        catPercentage >= 80
                          ? "text-green-600"
                          : catPercentage >= 70
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {catPercentage}%
                    </div>
                  </div>

                  {/* Quick Action Buttons for Category */}
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        quickFillCategory(category.category, "kurang");
                      }}
                      className="px-3 py-1 text-xs bg-red-50 text-red-700 rounded-md hover:bg-red-100 font-medium"
                      title="Set semua ke Kurang"
                    >
                      Kurang
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        quickFillCategory(category.category, "cukup");
                      }}
                      className="px-3 py-1 text-xs bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 font-medium"
                      title="Set semua ke Cukup"
                    >
                      Cukup
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        quickFillCategory(category.category, "baik");
                      }}
                      className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 font-medium"
                      title="Set semua ke Baik"
                    >
                      Baik
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        quickFillCategory(category.category, "baikSekali");
                      }}
                      className="px-3 py-1 text-xs bg-green-50 text-green-700 rounded-md hover:bg-green-100 font-medium"
                      title="Set semua ke Baik Sekali"
                    >
                      Baik Sekali
                    </button>
                  </div>
                </div>
              </div>

              {/* Category Content */}
              {isCategoryExpanded && (
                <div className="px-6 pb-6 bg-gray-50">
                  <div className="pt-4">
                    {/* Untuk PBB */}
                    {activeTab === "pbb" && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {category.items.map((item) => renderItem(item))}
                      </div>
                    )}

                    {/* Untuk Variasi & Kreatifitas */}
                    {activeTab === "variasi" &&
                      category.subCategories?.map((subCat, subIndex) => {
                        const subKey = `${category.category}-${subCat.subCategory}`;
                        const isSubExpanded =
                          expandedSubCategories[subKey] || false;

                        return (
                          <div key={subIndex} className="mb-4 last:mb-0">
                            {/* Sub Category Header */}
                            <div
                              onClick={() =>
                                toggleSubCategory(
                                  category.category,
                                  subCat.subCategory,
                                )
                              }
                              className="w-full p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors flex justify-between items-center cursor-pointer mb-2"
                            >
                              <div className="flex items-center gap-3">
                                <div className="text-gray-500">
                                  {isSubExpanded ? (
                                    <ChevronDown size={18} />
                                  ) : (
                                    <ChevronRight size={18} />
                                  )}
                                </div>
                                <div className="text-left">
                                  <h4 className="font-medium text-gray-700">
                                    {subCat.subCategory}
                                  </h4>
                                </div>
                              </div>
                              <div className="text-sm text-gray-500">
                                {subCat.items.length} item
                              </div>
                            </div>

                            {/* Sub Category Content */}
                            {isSubExpanded && (
                              <div className="mt-2">
                                <div className="grid grid-cols-1 gap-4">
                                  {subCat.items.map((item) => renderItem(item))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Helper function to render item
  const renderItem = (item) => {
    const currentValue = scores[item.id] || 0;
    const itemQuality = getQualityLabel(currentValue, item.max);
    const valueEntries = Object.entries(item.values);

    return (
      <div
        key={item.id}
        className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
      >
        {/* Item Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="font-medium text-gray-800">{item.label}</h4>
            <div className="text-xs text-gray-500 mt-1">
              Maksimum: {item.max} poin
            </div>
          </div>
          <div className="text-right">
            <div
              className={`text-center px-3 py-1 rounded-lg font-bold ${
                currentValue === 0
                  ? "bg-gray-100 text-gray-700"
                  : itemQuality.color === "red"
                    ? "bg-red-100 text-red-700"
                    : itemQuality.color === "yellow"
                      ? "bg-yellow-100 text-yellow-700"
                      : itemQuality.color === "blue"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
              }`}
            >
              <div className="text-xl">{currentValue}</div>
              <div className="text-xs">poin</div>
            </div>
          </div>
        </div>

        {/* Quality Label */}
        <div className="mb-4">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              itemQuality.color === "red"
                ? "bg-red-50 text-red-700"
                : itemQuality.color === "yellow"
                  ? "bg-yellow-50 text-yellow-700"
                  : itemQuality.color === "blue"
                    ? "bg-blue-50 text-blue-700"
                    : "bg-green-50 text-green-700"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                itemQuality.color === "red"
                  ? "bg-red-500"
                  : itemQuality.color === "yellow"
                    ? "bg-yellow-500"
                    : itemQuality.color === "blue"
                      ? "bg-blue-500"
                      : "bg-green-500"
              }`}
            ></div>
            {itemQuality.label} ({Math.round((currentValue / item.max) * 100)}%)
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <button
            type="button"
            onClick={() => {
              const kurangValues = valueEntries.filter(([label]) =>
                label.includes("Kurang"),
              );
              if (kurangValues.length > 0) {
                const middleIndex = Math.floor(kurangValues.length / 2);
                handleScoreChange(item.id, kurangValues[middleIndex][1]);
              }
            }}
            className="px-2 py-2 text-xs bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
          >
            Kurang
          </button>
          <button
            type="button"
            onClick={() => {
              const cukupValues = valueEntries.filter(([label]) =>
                label.includes("Cukup"),
              );
              if (cukupValues.length > 0) {
                const middleIndex = Math.floor(cukupValues.length / 2);
                handleScoreChange(item.id, cukupValues[middleIndex][1]);
              }
            }}
            className="px-2 py-2 text-xs bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors font-medium"
          >
            Cukup
          </button>
          <button
            type="button"
            onClick={() => {
              const baikValues = valueEntries.filter(
                ([label]) =>
                  label.includes("Baik") && !label.includes("Baik Sekali"),
              );
              if (baikValues.length > 0) {
                const middleIndex = Math.floor(baikValues.length / 2);
                handleScoreChange(item.id, baikValues[middleIndex][1]);
              }
            }}
            className="px-2 py-2 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
          >
            Baik
          </button>
          <button
            type="button"
            onClick={() => handleScoreChange(item.id, item.max)}
            className="px-2 py-2 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium"
          >
            Baik Sekali
          </button>
        </div>

        {/* Detailed Number Buttons */}
        <div className="pt-3 border-t border-gray-200">
          <div className="grid grid-cols-8 gap-2">
            {valueEntries.map(([label, value]) => {
              const valueQuality = getQualityLabel(value, item.max);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleScoreChange(item.id, value)}
                  className={`px-2 py-2 text-sm rounded-lg transition-all ${
                    currentValue === value
                      ? "ring-2 ring-offset-1 font-bold"
                      : ""
                  } ${
                    valueQuality.color === "red"
                      ? currentValue === value
                        ? "bg-red-600 text-white ring-red-300"
                        : "bg-red-50 text-red-700 hover:bg-red-100"
                      : valueQuality.color === "yellow"
                        ? currentValue === value
                          ? "bg-yellow-600 text-white ring-yellow-300"
                          : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                        : valueQuality.color === "blue"
                          ? currentValue === value
                            ? "bg-blue-600 text-white ring-blue-300"
                            : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                          : currentValue === value
                            ? "bg-green-600 text-white ring-green-300"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                  }`}
                  title={label}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Calculate total score for PBB
  const getTotalPBBScore = () => {
    let total = 0;
    PBB_SCORING_DATA.forEach((category) => {
      category.items.forEach((item) => {
        if (scores[item.id]) {
          total += scores[item.id];
        }
      });
    });
    return total;
  };

  // Calculate total score for Variasi
  const getTotalVariasiScore = () => {
    let total = 0;
    VARIASI_SCORING_DATA.forEach((category) => {
      category.subCategories?.forEach((subCat) => {
        subCat.items.forEach((item) => {
          if (scores[item.id]) {
            total += scores[item.id];
          }
        });
      });
    });
    return total;
  };

  // Get total items filled
  const getTotalItemsFilled = () => {
    return Object.keys(scores).length;
  };

  // Get total items count
  const getTotalItemsCount = () => {
    const pbbItems = PBB_SCORING_DATA.reduce(
      (sum, cat) => sum + cat.items.length,
      0,
    );
    const variasiItems = VARIASI_SCORING_DATA.reduce(
      (sum, cat) =>
        sum +
        (cat.subCategories?.reduce(
          (subSum, sub) => subSum + sub.items.length,
          0,
        ) || 0),
      0,
    );
    return pbbItems + variasiItems;
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!teamName || !teamCode) {
      alert("Harap isi data tim terlebih dahulu!");
      return;
    }

    const totalPBBScore = getTotalPBBScore();
    const totalVariasiScore = getTotalVariasiScore();
    const totalScore = totalPBBScore + totalVariasiScore;
    const totalMaxScore = 700 + 32;
    const percentage = Math.round((totalScore / totalMaxScore) * 100);

    const payload = {
      teamName,
      teamCode,
      scores,
      pbbScore: totalPBBScore,
      variasiScore: totalVariasiScore,
      totalScore: totalScore,
      percentage: percentage,
      totalMaxScore: totalMaxScore,
      timestamp: new Date().toISOString(),
    };

    // console.log("DATA NILAI LKBB:", payload);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Handle reset
  const handleReset = () => {
    if (window.confirm("Reset semua nilai?")) {
      setScores({});
      localStorage.removeItem("pbb_scores");
    }
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    return Math.round((getTotalItemsFilled() / getTotalItemsCount()) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Team Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={18} />
            Informasi Tim
          </h3>

          {teams.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pilih Tim yang Dinilai *
              </label>
              <select
                value={selectedTeam}
                onChange={(e) => {
                  setSelectedTeam(e.target.value);
                  const team = teams.find(
                    (t) => t.id === parseInt(e.target.value),
                  );
                  if (team) {
                    setTeamName(team.name);
                    setTeamCode(
                      team.code || `TM-${team.id.toString().padStart(3, "0")}`,
                    );
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              >
                <option value="">-- Pilih Tim --</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kode Tim *
              </label>
              <input
                type="text"
                value={teamCode}
                onChange={(e) => setTeamCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="TM-001"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Nama tim"
                required
              />
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("pbb")}
              className={`flex-1 px-4 py-3 text-center font-medium text-sm ${
                activeTab === "pbb"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              PERATURAN BARIS BERBARIS (PBB)
            </button>
            <button
              onClick={() => setActiveTab("variasi")}
              className={`flex-1 px-4 py-3 text-center font-medium text-sm ${
                activeTab === "variasi"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              VARIASI & KREATIFITAS
            </button>
            <button
              onClick={() => setActiveTab("variasi")}
              className={`flex-1 px-4 py-3 text-center font-medium text-sm ${
                activeTab === "variasi"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              VARIASI & KREATIFITAS
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <div className="text-sm text-gray-600">Total Nilai Saat Ini</div>
              <div className="text-3xl font-bold text-gray-900">
                {activeTab === "pbb"
                  ? getTotalPBBScore()
                  : getTotalVariasiScore()}
              </div>
              <div className="text-sm text-gray-500">
                dari {activeTab === "pbb" ? 700 : 32} poin
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-sm text-gray-600">Persentase</div>
              <div
                className={`text-3xl font-bold ${
                  getPercentage() >= 80
                    ? "text-green-600"
                    : getPercentage() >= 70
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {getPercentage()}%
              </div>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 text-sm font-medium"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Scoring Form based on active tab */}
        {renderScoringForm()}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={18} />
            Reset Semua Nilai
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!teamName || !teamCode}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium text-white rounded-md transition-colors ${
              !teamName || !teamCode
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <Save size={18} />
            Simpan Penilaian LKBB
          </button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  ✓ Nilai berhasil disimpan untuk tim {teamName}! PBB:{" "}
                  {getTotalPBBScore()} poin, Variasi: {getTotalVariasiScore()}{" "}
                  poin, Total: {getTotalPBBScore() + getTotalVariasiScore()}{" "}
                  poin (
                  {Math.round(
                    ((getTotalPBBScore() + getTotalVariasiScore()) / 732) * 100,
                  )}
                  %)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreForm;
