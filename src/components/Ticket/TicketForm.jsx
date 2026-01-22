import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Coins,
  CreditCard,
  AlertCircle,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Gift,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

const TicketForm = ({ selectedPackage = {}, saleType = "presale" }) => {
  // Default package jika tidak ada
  const defaultPackage = {
    id: "basic",
    name: "Paket Basic",
    coins: 10,
    bonus: 2,
    price: 10000,
    originalPrice: 15000,
    totalCoins: 12,
  };

  const currentPackage = selectedPackage.id ? selectedPackage : defaultPackage;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    paymentMethod: "bank_transfer",
    notes: "",
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  const paymentMethods = [
    {
      id: "bank_transfer",
      name: "Transfer Bank",
      description: "BCA, Mandiri, BNI, BRI",
      icon: "🏦",
    },
    {
      id: "e_wallet",
      name: "E-Wallet",
      description: "OVO, DANA, GoPay",
      icon: "📱",
    },
    {
      id: "qris",
      name: "QRIS",
      description: "Scan QR Code",
      icon: "📲",
    },
    {
      id: "virtual_account",
      name: "Virtual Account",
      description: "VA Bank",
      icon: "💳",
    },
  ];

  useEffect(() => {
    if (submitSuccess) {
      setSubmitSuccess(false);
    }
  }, [currentPackage]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Nama lengkap wajib diisi";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email tidak valid";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Nomor telepon wajib diisi";
    } else if (!/^[0-9+\-\s]+$/.test(formData.phone)) {
      newErrors.phone = "Nomor telepon tidak valid";
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Metode pembayaran wajib dipilih";
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "Anda harus menyetujui syarat dan ketentuan";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate transaction ID
      const txId = `COIN${Date.now()}${Math.floor(Math.random() * 1000)}`;
      setTransactionId(txId);

      // Calculate total coins
      const totalCoins = currentPackage.coins + (currentPackage.bonus || 0);

      // Save to localStorage
      const coinPurchaseData = {
        ...formData,
        package: currentPackage,
        saleType: saleType,
        purchaseDate: new Date().toISOString(),
        transactionId: txId,
        coinsReceived: currentPackage.coins || 0,
        bonusCoins: currentPackage.bonus || 0,
        totalCoins: totalCoins,
      };

      localStorage.setItem(
        "lastCoinPurchase",
        JSON.stringify(coinPurchaseData),
      );

      // Add coins to user's balance in localStorage
      const currentBalance = parseInt(
        localStorage.getItem("coinBalance") || "0",
      );
      const newBalance = currentBalance + totalCoins;
      localStorage.setItem("coinBalance", newBalance.toString());

      setSubmitSuccess(true);
      setErrors({});

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        paymentMethod: "bank_transfer",
        notes: "",
        agreeTerms: false,
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Purchase error:", error);
      setErrors({
        submit:
          "Terjadi kesalahan saat memproses pembelian. Silakan coba lagi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const InputField = ({
    label,
    name,
    type = "text",
    icon: Icon,
    placeholder,
    ...props
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon size={18} />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className={`
            w-full px-4 py-3 rounded-lg border transition-all duration-200
            ${Icon ? "pl-10" : ""}
            ${
              errors[name]
                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
            }
            focus:outline-none focus:ring-2
            disabled:bg-gray-100 disabled:cursor-not-allowed
          `}
          placeholder={placeholder}
          disabled={isSubmitting}
          {...props}
        />
      </div>
      {errors[name] && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle size={14} />
          {errors[name]}
        </p>
      )}
    </div>
  );

  if (submitSuccess) {
    const totalCoins = currentPackage.coins + (currentPackage.bonus || 0);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 sm:p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coins size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Pembelian Berhasil!
          </h3>
          <p className="text-gray-600 mb-6">
            Coin telah ditambahkan ke akun Anda. Gunakan untuk voting favorit
            Anda!
          </p>

          <div className="bg-white rounded-xl p-6 mb-6 border border-green-200 shadow-sm">
            {/* Coin Display */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full flex items-center justify-center">
                <Coins size={24} className="text-yellow-600" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  +{totalCoins}
                </div>
                <div className="text-sm text-gray-500">Total Coin Diterima</div>
              </div>
            </div>

            {/* Detail Breakdown */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Coin Utama:</span>
                <span className="font-bold text-gray-900">
                  {currentPackage.coins || 0} coin
                </span>
              </div>
              {currentPackage.bonus > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Bonus Coin:</span>
                  <span className="font-bold text-green-600">
                    +{currentPackage.bonus || 0} coin
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center border-t pt-3">
                <span className="text-gray-600">Paket:</span>
                <span className="font-bold text-blue-600">
                  {currentPackage.name || "Paket Basic"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ID Transaksi:</span>
                <span className="font-mono text-sm font-bold text-gray-900">
                  {transactionId}
                </span>
              </div>
            </div>

            {/* Total Balance Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Saldo Coin Anda Sekarang:</span>
                <span className="text-xl font-bold text-blue-600">
                  {localStorage.getItem("coinBalance") || "0"} coin
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setSubmitSuccess(false)}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
              Beli Lagi
            </button>
            <button
              onClick={() => (window.location.href = "/voting")}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md">
              Mulai Voting
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Coins size={24} />
        Formulir Pembelian Coin
      </h2>

      {errors.submit && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 flex items-center gap-2">
            <AlertCircle size={18} />
            {errors.submit}
          </p>
        </div>
      )}

      {/* Package Info Summary */}
      <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Sparkles size={18} className="text-yellow-600" />
              Paket {currentPackage.name || "Basic"}
            </h3>
            <p className="text-gray-600 text-sm mt-1">
              Anda akan mendapatkan {currentPackage.coins || 0} coin +{" "}
              {currentPackage.bonus || 0} bonus
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              Rp {currentPackage.price?.toLocaleString() || "10.000"}
            </div>
            {saleType === "presale" && currentPackage.originalPrice && (
              <div className="text-sm text-gray-500 line-through">
                Rp {currentPackage.originalPrice.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User size={18} />
            Informasi Pembeli
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <InputField
              label="Nama Lengkap*"
              name="fullName"
              icon={User}
              placeholder="Masukkan nama lengkap"
              required
            />
            <InputField
              label="Email*"
              name="email"
              type="email"
              icon={Mail}
              placeholder="nama@email.com"
              required
            />
            <InputField
              label="Nomor Telepon/WA*"
              name="phone"
              type="tel"
              icon={Phone}
              placeholder="08xxxxxxxxxx"
              required
            />
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard size={18} />
            Metode Pembayaran
          </h3>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Pilih Metode Pembayaran*
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`
                    relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200
                    ${
                      formData.paymentMethod === method.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }
                  `}
                  onClick={() =>
                    handleChange({
                      target: { name: "paymentMethod", value: method.id },
                    })
                  }>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">
                        {method.name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {method.description}
                      </div>
                    </div>
                  </div>
                  {formData.paymentMethod === method.id && (
                    <div className="absolute top-3 right-3">
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {errors.paymentMethod && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.paymentMethod}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan (Opsional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Catatan khusus atau permintaan tambahan..."
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="agreeTerms"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={isSubmitting}
            />
            <div>
              <label htmlFor="agreeTerms" className="text-sm text-gray-700">
                Saya menyetujui{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-800 font-medium">
                  Syarat & Ketentuan
                </a>{" "}
                dan{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-800 font-medium">
                  Kebijakan Privasi
                </a>{" "}
                pembelian coin voting. *
              </label>
              {errors.agreeTerms && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.agreeTerms}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 p-3 bg-white rounded-lg border border-blue-300">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Gift size={14} />
              <span>
                <span className="font-semibold text-yellow-600">
                  Coin yang dibeli
                </span>{" "}
                akan langsung ditambahkan ke akun Anda dan dapat digunakan untuk
                voting segera setelah pembayaran dikonfirmasi.
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <TrendingUp size={14} />
              <span>
                <span className="font-semibold text-red-600">
                  1 coin = 1 vote
                </span>
                . Coin tidak dapat dikembalikan setelah dibeli.
              </span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="sticky bottom-6 bg-white rounded-xl shadow-lg p-4 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 mb-1">
                <Coins size={18} className="text-yellow-600" />
                <p className="text-sm text-gray-600">
                  Anda akan mendapatkan{" "}
                  {(currentPackage.coins || 0) + (currentPackage.bonus || 0)}{" "}
                  coin
                </p>
              </div>
              <p className="text-xs text-gray-500">
                Pembelian akan dikunci setelah konfirmasi
              </p>
            </div>
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className={`
                px-8 py-3 rounded-xl font-bold text-white transition-all
                ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 shadow-lg"
                }
                min-w-[200px]
              `}>
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Memproses...
                </span>
              ) : (
                "BELI COIN SEKARANG"
              )}
            </motion.button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default TicketForm;
