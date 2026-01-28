import { useState, useEffect } from "react";
import TicketForm from "../../components/Ticket/TicketForm";
import {
  Calendar,
  CreditCard,
  Clock,
  Tag,
  AlertCircle,
  CheckCircle2,
  Coins,
  TrendingUp,
  Gift,
  Loader,
} from "lucide-react";

const TicketPage = () => {
  const [packageType, setPackageType] = useState("basic");
  const [saleType, setSaleType] = useState("presale");
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

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

    // Simulasi loading data
    setTimeout(() => {
      setIsLoading(false);
    }, 200);

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
      badgeColor: "bg-orange-500",
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
      badgeColor: "bg-teal-500",
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
      badgeColor: "bg-orange-600",
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

  // Handle package selection with smooth transition
  const handlePackageSelect = (packageId) => {
    setPackageType(packageId);
  };

  // Handle sale type change
  const handleSaleTypeChange = (type) => {
    setSaleType(type);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat halaman pembelian...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Pembelian Coin Voting
              </h1>
              <p className="text-gray-600 text-lg">
                Beli coin untuk voting tim favorit Anda di Lomba Paskibra 2024
              </p>
            </div>

            {/* Sale Type Toggle */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 transition-all duration-300">
              <div className="flex items-center gap-2 mb-3">
                <Tag size={18} className="text-teal-600" />
                <span className="font-semibold text-gray-900">
                  Jenis Penjualan
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSaleTypeChange("presale")}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-[0.98] ${
                    saleType === "presale"
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}>
                  Presale
                </button>
                <button
                  onClick={() => handleSaleTypeChange("onthespot")}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-[0.98] ${
                    saleType === "onthespot"
                      ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}>
                  On the Spot
                </button>
              </div>
            </div>
          </div>

          {/* Sale Info Banner */}
          {saleType === "presale" ? (
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 mb-8 transition-all duration-300">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="text-orange-600" size={20} />
                    <h3 className="font-bold text-lg text-gray-900">
                      Presale Berakhir Dalam:
                    </h3>
                  </div>
                  <div className="flex items-center gap-4">
                    {[
                      { value: timeRemaining.days, label: "Hari" },
                      { value: timeRemaining.hours, label: "Jam" },
                      { value: timeRemaining.minutes, label: "Menit" },
                    ].map((item, index) => (
                      <div key={index} className="text-center">
                        <div className="bg-white rounded-lg shadow-sm px-4 py-3 min-w-[80px] transition-all duration-300 hover:shadow-md">
                          <div className="text-2xl font-bold text-orange-700">
                            {item.value.toString().padStart(2, "0")}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {item.label}
                          </div>
                        </div>
                        {index < 2 && (
                          <div className="text-xl text-gray-400">:</div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-orange-700 mt-4 font-medium">
                    Hemat hingga{" "}
                    <span className="font-bold">
                      {formatCurrency(calculateSavings("premium"))}
                    </span>{" "}
                    dengan beli coin sekarang!
                  </p>
                </div>
                <div className="bg-white rounded-xl p-5 border border-orange-300 shadow-sm transition-all duration-300 hover:shadow-md">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Coins size={20} className="text-orange-600" />
                      <div className="text-2xl font-bold text-orange-700">
                        35%
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">Lebih Hemat</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200 rounded-xl p-6 mb-8 transition-all duration-300">
              <div className="flex items-start gap-4">
                <AlertCircle
                  className="text-teal-600 mt-0.5 flex-shrink-0"
                  size={20}
                />
                <div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">
                    Penjualan On the Spot
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Coin hanya tersedia di lokasi acara dengan harga normal.
                    <span className="font-semibold text-teal-700">
                      {" "}
                      Pastikan datang lebih awal!
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        Kuota terbatas
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        Pembayaran tunai
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Event Info & Package Selection */}
          <div className="lg:col-span-2 space-y-8">
            {/* Coin Info */}
            <div className="bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200 rounded-xl p-6 transition-all duration-300 hover:shadow-md">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Coins className="text-teal-600" size={28} />
                Apa Itu Coin Voting?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-teal-200 shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="text-teal-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        1 Coin = 1 Vote
                      </p>
                      <p className="text-gray-600 text-sm">Nilai tukar tetap</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-teal-200 shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Gift className="text-orange-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Bonus Coin</p>
                      <p className="text-gray-600 text-sm">
                        Dapatkan ekstra coin
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border border-teal-200 shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                      <Calendar className="text-teal-600" size={20} />
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 sm:mb-0 flex items-center gap-2">
                  <Coins size={24} className="text-orange-600" />
                  Pilih Paket Coin
                </h2>
                <div className="bg-gray-100 rounded-lg px-3 py-2 transition-colors duration-200">
                  <span className="text-sm text-gray-700">
                    Mode:{" "}
                    <span className="font-bold text-orange-600">
                      {saleType === "presale" ? "PRESALE" : "ON THE SPOT"}
                    </span>
                  </span>
                </div>
              </div>

              {/* Package Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {coinPackages.map((option) => {
                  const totalCoins = option.coins + option.bonus;
                  const isSelected = packageType === option.id;

                  return (
                    <div
                      key={option.id}
                      onClick={() => handlePackageSelect(option.id)}
                      className={`
                        relative border-2 rounded-xl p-5 cursor-pointer transition-all duration-300
                        hover:shadow-lg hover:translate-y-[-2px] active:scale-[0.98]
                        ${
                          isSelected
                            ? "border-orange-500 bg-gradient-to-br from-orange-50 to-white shadow-lg"
                            : "border-gray-200 hover:border-orange-300"
                        }
                      `}>
                      {/* Badge */}
                      {option.badge && (
                        <div
                          className={`absolute -top-3 left-1/2 transform -translate-x-1/2 ${option.badgeColor} text-white px-3 py-1 rounded-full text-xs font-bold transition-all duration-300`}>
                          {option.badge}
                        </div>
                      )}

                      {/* Coin Display */}
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-md transition-all duration-300">
                          <Coins size={28} className="text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-3xl font-bold text-gray-900">
                            {totalCoins}
                          </div>
                          <div className="text-sm text-gray-500">
                            Total Coin
                          </div>
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
                              <span className="text-sm text-gray-500 line-through transition-all duration-300">
                                {formatCurrency(option.onthespotPrice)}
                              </span>
                            )}
                          </div>

                          {saleType === "presale" && (
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-xs font-semibold text-teal-600 transition-all duration-300">
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
                              className="text-teal-500 mt-0.5 mr-2 flex-shrink-0 transition-all duration-300"
                            />
                            <span className="text-gray-700 transition-colors duration-300">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* Select Button */}
                      <button
                        className={`
                          w-full py-3 rounded-lg font-semibold transition-all duration-300
                          ${
                            isSelected
                              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }
                        `}>
                        {isSelected ? "✓ Terpilih" : "Pilih Paket"}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Registration Form */}
              <TicketForm
                selectedPackage={selectedPackage}
                saleType={saleType}
              />
            </div>
          </div>

          {/* Right Column - Payment Summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24 transition-all duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard size={24} />
                Ringkasan Pembelian
              </h2>

              {/* Coin Summary */}
              <div className="mb-6 bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl p-4 border border-teal-200 transition-all duration-300 hover:shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-700 font-medium">Total Coin:</span>
                  <div className="flex items-center gap-2">
                    <Coins size={20} className="text-orange-600" />
                    <span className="text-2xl font-bold text-gray-900">
                      {calculateTotalCoins(packageType)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white rounded-lg p-3 text-center shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="font-medium text-gray-900">
                      {selectedPackage?.coins || 0}
                    </div>
                    <div className="text-xs text-gray-500">Coin Utama</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="font-medium text-teal-600">
                      +{selectedPackage?.bonus || 0}
                    </div>
                    <div className="text-xs text-gray-500">Bonus</div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 transition-all duration-300 hover:shadow-sm">
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

                <div className="bg-gray-50 rounded-xl p-4 transition-all duration-300 hover:shadow-sm">
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
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 transition-all duration-300 hover:shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-orange-700 font-medium">
                        Potongan Presale
                      </span>
                      <span className="font-bold text-lg text-orange-700">
                        -{formatCurrency(calculateSavings(packageType))}
                      </span>
                    </div>
                    <div className="text-sm text-orange-600">
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

                <div className="border-t pt-4 transition-all duration-300">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Total Pembayaran
                    </span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-teal-700 transition-all duration-300">
                        {formatCurrency(total)}
                      </div>
                      {saleType === "presale" && (
                        <div className="text-sm text-gray-500 line-through mt-1 transition-all duration-300">
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
              <div className="mb-6 bg-gradient-to-r from-teal-50 to-teal-100 rounded-xl p-4 border border-teal-200 transition-all duration-300 hover:shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins size={18} className="text-teal-600" />
                    <span className="text-gray-700 font-medium">
                      Saldo Coin Anda:
                    </span>
                  </div>
                  <span className="text-xl font-bold text-teal-700">
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
                  {["BCA", "Mandiri", "BNI", "BRI", "OVO", "DANA"].map(
                    (bank) => (
                      <div
                        key={bank}
                        className="bg-gray-100 rounded-lg p-3 text-center hover:bg-gray-200 transition-all duration-300 hover:shadow-sm">
                        <div className="text-xs font-semibold text-gray-700">
                          {bank}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Warning/Info */}
              <div
                className={`
                rounded-xl p-4 mb-6 transition-all duration-300
                ${
                  saleType === "presale"
                    ? "bg-orange-50 border border-orange-200"
                    : "bg-teal-50 border border-teal-200"
                }
              `}>
                <div className="flex gap-3">
                  <AlertCircle
                    className={`
                    mt-0.5 flex-shrink-0 transition-all duration-300
                    ${saleType === "presale" ? "text-orange-600" : "text-teal-600"}
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
              <div className="mt-6 text-center transition-all duration-300">
                <p className="text-xs text-gray-500">
                  {saleType === "presale"
                    ? "Pembayaran akan diverifikasi dalam 1x24 jam"
                    : "Kuota on the spot sangat terbatas. First come, first served."}
                </p>
              </div>
            </div>

            {/* Additional Info Box */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 transition-all duration-300 hover:shadow-md">
              <h3 className="font-bold text-gray-900 mb-3">
                Kenapa Beli Coin Sekarang?
              </h3>
              <ul className="space-y-3">
                {[
                  { color: "orange", text: "Harga lebih murah dengan presale" },
                  { color: "orange", text: "Support tim favorit lebih awal" },
                  { color: "teal", text: "Bonus coin ekstra" },
                  { color: "teal", text: "Vote kapan saja, di mana saja" },
                ].map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-700">
                    <div
                      className={`w-2 h-2 bg-${item.color}-500 rounded-full mt-1.5 transition-all duration-300`}></div>
                    <span className="transition-colors duration-300">
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPage;
