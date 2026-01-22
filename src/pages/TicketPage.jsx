import { useState, useEffect } from "react";
import TicketForm from "../components/Ticket/TicketForm";
import {
  Calendar,
  MapPin,
  Users,
  CreditCard,
  Clock,
  Tag,
  AlertCircle,
  CheckCircle2,
  Coins,
  TrendingUp,
  Gift,
} from "lucide-react";
import { motion } from "framer-motion";

const TicketPage = () => {
  const [packageType, setPackageType] = useState("basic");
  const [saleType, setSaleType] = useState("presale");
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  // Countdown untuk presale
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const presaleEndDate = new Date("2024-10-20T23:59:59");
      const now = new Date();
      const difference = presaleEndDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60),
        );

        setTimeRemaining({ days, hours, minutes });
      } else {
        setSaleType("onthespot");
      }
    };

    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 60000);

    return () => clearInterval(timer);
  }, []);

  const coinPackages = [
    {
      id: "basic",
      name: "Paket Basic",
      coins: 10,
      bonus: 2,
      presalePrice: 10000,
      onthespotPrice: 15000,
      features: [
        "10 coin utama",
        "2 coin bonus",
        "Vote untuk 12 tim",
        "Akses voting 7 hari",
        "Notifikasi hasil",
      ],
      badge: "Populer",
      badgeColor: "bg-blue-500",
    },
    {
      id: "standard",
      name: "Paket Standard",
      coins: 50,
      bonus: 15,
      presalePrice: 45000,
      onthespotPrice: 60000,
      features: [
        "50 coin utama",
        "15 coin bonus",
        "Vote untuk 65 tim",
        "Akses voting 30 hari",
        "Priority support",
        "Laporan voting",
      ],
      badge: "Rekomendasi",
      badgeColor: "bg-green-500",
    },
    {
      id: "premium",
      name: "Paket Premium",
      coins: 100,
      bonus: 40,
      presalePrice: 80000,
      onthespotPrice: 120000,
      features: [
        "100 coin utama",
        "40 coin bonus",
        "Vote unlimited",
        "Akses voting 90 hari",
        "VIP support",
        "Analytics lengkap",
        "Early access fitur",
      ],
      badge: "Eksklusif",
      badgeColor: "bg-purple-500",
    },
  ];

  const selectedPackage = coinPackages.find((p) => p.id === packageType);
  const currentPrice =
    saleType === "presale"
      ? selectedPackage?.presalePrice
      : selectedPackage?.onthespotPrice;

  const adminFee = 5000;
  const total = (currentPrice || 0) + adminFee;

  // Format currency Indonesia
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate savings
  const calculateSavings = (packageId) => {
    const pkg = coinPackages.find((p) => p.id === packageId);
    if (!pkg) return 0;
    return pkg.onthespotPrice - pkg.presalePrice;
  };

  // Calculate total coins
  const calculateTotalCoins = (packageId) => {
    const pkg = coinPackages.find((p) => p.id === packageId);
    if (!pkg) return 0;
    return pkg.coins + pkg.bonus;
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 sm:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Pembelian Coin Voting
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Beli coin untuk voting tim favorit Anda di Lomba Paskibra 2024
            </p>
          </div>

          {/* Sale Type Toggle */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Tag size={18} className="text-blue-600" />
              <span className="font-semibold text-gray-900 text-sm sm:text-base">
                Jenis Penjualan
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSaleType("presale")}
                className={`flex-1 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  saleType === "presale"
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                Presale
              </button>
              <button
                onClick={() => setSaleType("onthespot")}
                className={`flex-1 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  saleType === "onthespot"
                    ? "bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                On the Spot
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column - Event Info & Package Selection */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          {/* Sale Info Banner */}
          {saleType === "presale" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="text-blue-600" size={20} />
                    <h3 className="font-bold text-lg text-gray-900">
                      Presale Berakhir Dalam:
                    </h3>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-center">
                      <div className="bg-white rounded-xl shadow-sm px-4 py-3">
                        <div className="text-2xl sm:text-3xl font-bold text-blue-700">
                          {timeRemaining.days}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Hari</div>
                      </div>
                    </div>
                    <div className="text-2xl text-gray-400">:</div>
                    <div className="text-center">
                      <div className="bg-white rounded-xl shadow-sm px-4 py-3">
                        <div className="text-2xl sm:text-3xl font-bold text-blue-700">
                          {timeRemaining.hours}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Jam</div>
                      </div>
                    </div>
                    <div className="text-2xl text-gray-400">:</div>
                    <div className="text-center">
                      <div className="bg-white rounded-xl shadow-sm px-4 py-3">
                        <div className="text-2xl sm:text-3xl font-bold text-blue-700">
                          {timeRemaining.minutes}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Menit</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-blue-700 mt-3">
                    Hemat hingga{" "}
                    <span className="font-bold">
                      Rp {calculateSavings("premium").toLocaleString()}
                    </span>{" "}
                    dengan beli coin sekarang!
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-blue-300 shadow-sm">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Coins size={20} className="text-yellow-600" />
                      <div className="text-2xl font-bold text-green-600">
                        35%
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">Lebih Hemat</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <AlertCircle
                  className="text-orange-600 mt-0.5 flex-shrink-0"
                  size={20}
                />
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    Penjualan On the Spot
                  </h3>
                  <p className="text-gray-700">
                    Coin hanya tersedia di lokasi acara dengan harga normal.
                    <span className="font-semibold text-orange-700">
                      {" "}
                      Pastikan datang lebih awal!
                    </span>
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        Kuota terbatas
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        Pembayaran tunai
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Coin Info */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-5 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-6 flex items-center gap-3">
              <Coins className="text-yellow-600" size={28} />
              Apa Itu Coin Voting?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-yellow-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-yellow-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      1 Coin = 1 Vote
                    </p>
                    <p className="text-gray-600 text-sm">Nilai tukar tetap</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-yellow-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Gift className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Bonus Coin</p>
                    <p className="text-gray-600 text-sm">
                      Dapatkan ekstra coin
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-yellow-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Masa Aktif</p>
                    <p className="text-gray-600 text-sm">30-90 hari</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Package Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-0 flex items-center gap-2">
                <Coins size={24} className="text-yellow-600" />
                Pilih Paket Coin
              </h2>
              <div className="bg-gray-100 rounded-lg p-2">
                <span className="text-sm text-gray-700">
                  Mode:{" "}
                  <span className="font-bold text-blue-600">
                    {saleType === "presale" ? "PRESALE" : "ON THE SPOT"}
                  </span>
                </span>
              </div>
            </div>

            {/* Price Comparison */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Coins size={18} className="text-yellow-600" />
                Perbandingan Harga:
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-3 font-medium text-gray-700">
                        Jenis Paket
                      </th>
                      <th className="text-right p-3 font-medium text-gray-700">
                        Total Coin
                      </th>
                      <th className="text-right p-3 font-medium text-gray-700">
                        Harga Presale
                      </th>
                      <th className="text-right p-3 font-medium text-gray-700">
                        Harga Normal
                      </th>
                      <th className="text-right p-3 font-medium text-gray-700">
                        Hemat
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {coinPackages.map((pkg) => {
                      const totalCoins = pkg.coins + pkg.bonus;
                      return (
                        <tr
                          key={pkg.id}
                          className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="p-3 font-medium">{pkg.name}</td>
                          <td className="p-3 text-right">
                            <span className="font-bold text-yellow-600">
                              {totalCoins} coin
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <span className="text-green-600 font-bold">
                              {formatCurrency(pkg.presalePrice)}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <span className="text-gray-600">
                              {formatCurrency(pkg.onthespotPrice)}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <span className="text-red-600 font-bold">
                              {formatCurrency(
                                pkg.onthespotPrice - pkg.presalePrice,
                              )}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Package Cards */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {coinPackages.map((option) => {
                const totalCoins = option.coins + option.bonus;
                return (
                  <motion.div
                    key={option.id}
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      relative border-2 rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-300
                      ${
                        packageType === option.id
                          ? "border-yellow-500 bg-gradient-to-br from-yellow-50 to-white shadow-lg"
                          : "border-gray-200 hover:border-yellow-300 hover:shadow-md"
                      }
                    `}
                    onClick={() => setPackageType(option.id)}>
                    {/* Badge */}
                    {option.badge && (
                      <div
                        className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${option.badgeColor} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                        {option.badge}
                      </div>
                    )}

                    {/* Coin Display */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-md">
                        <Coins size={28} className="text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-3xl font-bold text-gray-900">
                          {totalCoins}
                        </div>
                        <div className="text-sm text-gray-500">Total Coin</div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 text-center">
                        {option.name}
                      </h3>

                      {/* Price Display */}
                      <div className="space-y-1 text-center">
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {formatCurrency(
                              saleType === "presale"
                                ? option.presalePrice
                                : option.onthespotPrice,
                            )}
                          </span>
                          {saleType === "presale" && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatCurrency(option.onthespotPrice)}
                            </span>
                          )}
                        </div>

                        {saleType === "presale" && (
                          <div className="flex items-center justify-center gap-1">
                            <span className="text-xs font-semibold text-green-600">
                              Hemat{" "}
                              {formatCurrency(
                                option.onthespotPrice - option.presalePrice,
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-6">
                      {option.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <CheckCircle2
                            size={16}
                            className="text-green-500 mt-0.5 mr-2 flex-shrink-0"
                          />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Select Button */}
                    <button
                      className={`
                        w-full py-2 rounded-lg text-sm font-semibold transition-all
                        ${
                          packageType === option.id
                            ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }
                      `}>
                      {packageType === option.id ? "✓ Terpilih" : "Pilih Paket"}
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Registration Form */}
            <TicketForm selectedPackage={selectedPackage} saleType={saleType} />
          </div>
        </div>

        {/* Right Column - Payment Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CreditCard size={24} />
              Ringkasan Pembelian
            </h2>

            {/* Coin Summary */}
            <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-700 font-medium">Total Coin:</span>
                <div className="flex items-center gap-2">
                  <Coins size={20} className="text-yellow-600" />
                  <span className="text-2xl font-bold text-gray-900">
                    {calculateTotalCoins(packageType)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-white rounded-lg p-2 text-center">
                  <div className="font-medium text-gray-900">
                    {selectedPackage?.coins || 0}
                  </div>
                  <div className="text-xs text-gray-500">Coin Utama</div>
                </div>
                <div className="bg-white rounded-lg p-2 text-center">
                  <div className="font-medium text-green-600">
                    +{selectedPackage?.bonus || 0}
                  </div>
                  <div className="text-xs text-gray-500">Bonus</div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">
                    Paket {selectedPackage?.name}
                  </span>
                  <span className="font-bold text-lg text-gray-900">
                    {formatCurrency(currentPrice || 0)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {saleType === "presale" ? "Harga Presale" : "Harga Normal"}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700 font-medium">
                    Biaya Administrasi
                  </span>
                  <span className="font-bold text-lg text-gray-900">
                    {formatCurrency(adminFee)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  Termasuk verifikasi & support
                </div>
              </div>

              {/* Discount/Savings if presale */}
              {saleType === "presale" && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-700 font-medium">
                      Potongan Presale
                    </span>
                    <span className="font-bold text-lg text-green-700">
                      -{formatCurrency(calculateSavings(packageType))}
                    </span>
                  </div>
                  <div className="text-sm text-green-600">
                    Hemat{" "}
                    {Math.round(
                      (calculateSavings(packageType) /
                        (selectedPackage?.onthespotPrice || 1)) *
                        100,
                    )}
                    % dari harga normal
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">
                    Total Pembayaran
                  </span>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-700">
                      {formatCurrency(total)}
                    </div>
                    {saleType === "presale" && (
                      <div className="text-sm text-gray-500 line-through mt-1">
                        Normal:{" "}
                        {formatCurrency(
                          (selectedPackage?.onthespotPrice || 0) + adminFee,
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Current Balance */}
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins size={18} className="text-blue-600" />
                  <span className="text-gray-700 font-medium">
                    Saldo Coin Anda:
                  </span>
                </div>
                <span className="text-xl font-bold text-blue-700">
                  {parseInt(localStorage.getItem("coinBalance") || "0")} coin
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Coin dapat digunakan untuk voting setelah pembelian
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Metode Pembayaran:
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {["BCA", "Mandiri", "BNI", "BRI", "OVO", "DANA"].map((bank) => (
                  <div
                    key={bank}
                    className="bg-gray-100 rounded-lg p-3 text-center">
                    <div className="text-xs font-semibold text-gray-700">
                      {bank}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Warning/Info */}
            <div
              className={`
              rounded-xl p-4 mb-6
              ${
                saleType === "presale"
                  ? "bg-blue-50 border border-blue-200"
                  : "bg-orange-50 border border-orange-200"
              }
            `}>
              <div className="flex gap-3">
                <AlertCircle
                  className={`
                  mt-0.5 flex-shrink-0
                  ${saleType === "presale" ? "text-blue-600" : "text-orange-600"}
                `}
                  size={20}
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Perhatian Penting
                  </p>
                  <p className="text-xs text-gray-700">
                    {saleType === "presale"
                      ? "Coin presale hanya berlaku hingga 20 Oktober 2024. Setelah itu, harga akan kembali normal."
                      : "Coin on the spot hanya tersedia di lokasi acara dengan kuota terbatas."}
                  </p>
                </div>
              </div>
            </div>

            {/* Extra Info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                {saleType === "presale"
                  ? "Pembayaran akan diverifikasi dalam 1x24 jam"
                  : "Kuota on the spot sangat terbatas. First come, first served."}
              </p>
            </div>
          </div>

          {/* Additional Info Box */}
          <div className="mt-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-3">
              Kenapa Beli Coin Sekarang?
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Harga lebih murah dengan presale</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Support tim favorit lebih awal</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Bonus coin ekstra</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Vote kapan saja, di mana saja</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;
