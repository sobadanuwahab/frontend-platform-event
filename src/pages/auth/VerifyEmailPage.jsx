import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Mail,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  Shield,
  Clock,
  Key,
} from "lucide-react";
import { verifyEmailOTP, resendEmailOTP } from "../../services/EmailService";

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, sendVerificationEmail } = useAuth();

  const [otp, setOtp] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState(location.state?.message || "");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(null);

  const returnTo = location.state?.returnTo || "/";

  // Timer untuk resend email
  const startResendTimer = (seconds = 60) => {
    setCanResend(false);
    setResendTimer(seconds);

    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Set OTP expiry time (15 menit)
  useEffect(() => {
    if (location.state?.fromRegister) {
      const expiryTime = Date.now() + 15 * 60 * 1000;
      setOtpExpiry(expiryTime);
      startResendTimer();
    }
  }, [location.state]);

  // Timer untuk OTP expiry
  useEffect(() => {
    if (!otpExpiry) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeLeft = Math.max(0, otpExpiry - now);

      if (timeLeft <= 0) {
        clearInterval(interval);
        setOtpExpiry(null);
        setError("Kode OTP telah kadaluarsa. Kirim ulang kode.");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [otpExpiry]);

  // Format waktu untuk display
  const formatTimeLeft = () => {
    if (!otpExpiry) return null;
    const timeLeft = Math.max(0, otpExpiry - Date.now());
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Fungsi untuk mengirim ulang OTP
  const handleResendOTP = async () => {
    if (!user?.email || !canResend) return;

    setIsSending(true);
    setError("");
    setMessage("");

    try {
      const result = await resendEmailOTP(user.email, "registration");

      if (result.success) {
        setMessage("✅ Kode OTP baru telah dikirim ke email Anda!");
        setIsSuccess(true);

        // Reset expiry time (15 menit)
        const expiryTime = Date.now() + 15 * 60 * 1000;
        setOtpExpiry(expiryTime);
        startResendTimer(60);

        setOtp(""); // Clear OTP input
      } else {
        setError(result.message || "Gagal mengirim ulang kode OTP");
        setIsSuccess(false);
      }
    } catch (error) {
      setError("Terjadi kesalahan. Coba lagi nanti.");
      setIsSuccess(false);
    } finally {
      setIsSending(false);
    }
  };

  // Fungsi untuk verifikasi OTP
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError("Masukkan kode verifikasi 6 digit");
      return;
    }

    if (!user?.email) {
      setError("Email tidak ditemukan");
      return;
    }

    if (verificationAttempts >= 5) {
      setError("Terlalu banyak percobaan. Coba lagi nanti.");
      return;
    }

    if (otpExpiry && Date.now() > otpExpiry) {
      setError("Kode OTP telah kadaluarsa. Silakan kirim ulang kode.");
      return;
    }

    setIsVerifying(true);
    setError("");
    setMessage("");

    try {
      const result = await verifyEmailOTP(user.email, otp);

      if (result.success) {
        setMessage("🎉 Email berhasil diverifikasi! Mengalihkan...");
        setIsSuccess(true);
        setVerificationAttempts(0);

        // Simpan status verifikasi di localStorage
        localStorage.setItem(`email_verified_${user.email}`, "true");
        localStorage.setItem(
          `email_verified_at_${user.email}`,
          new Date().toISOString(),
        );

        // Update user data di localStorage
        const storedUserData = localStorage.getItem("user_data");
        if (storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);
            userData.email_verified_at = new Date().toISOString();
            userData.is_verified = true;
            localStorage.setItem("user_data", JSON.stringify(userData));
          } catch (e) {
            console.error("Error updating user data:", e);
          }
        }

        // Redirect setelah 2 detik
        setTimeout(() => {
          navigate(returnTo, {
            state: {
              message: "Email berhasil diverifikasi!",
              emailVerified: true,
            },
          });
        }, 2000);
      } else {
        setError(result.message || "Verifikasi gagal. Periksa kode Anda.");
        setIsSuccess(false);
        setVerificationAttempts((prev) => prev + 1);
      }
    } catch (error) {
      setError("Terjadi kesalahan saat verifikasi.");
      setIsSuccess(false);
      setVerificationAttempts((prev) => prev + 1);
    } finally {
      setIsVerifying(false);
    }
  };

  // Auto-focus input OTP
  useEffect(() => {
    const otpInput = document.getElementById("otp-input");
    if (otpInput) {
      otpInput.focus();
    }
  }, []);

  // Handle OTP input change
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) {
      setOtp(value);
    }
    if (error) setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white py-12 px-4">
      <div className="container mx-auto max-w-md">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Kembali</span>
          </button>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={28} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Verifikasi Email</h1>
            <p className="text-gray-400">
              Masukkan kode OTP yang dikirim ke email Anda
            </p>
          </div>

          {/* OTP Timer */}
          {otpExpiry && (
            <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-yellow-400" />
                  <span className="text-yellow-300 font-medium">
                    Kode OTP berlaku:
                  </span>
                </div>
                <span className="font-mono text-xl font-bold text-yellow-300">
                  {formatTimeLeft()}
                </span>
              </div>
              <p className="text-yellow-400 text-sm mt-2">
                Masukkan kode sebelum waktu habis
              </p>
            </div>
          )}

          {/* Status Messages */}
          {message && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                isSuccess
                  ? "bg-green-900/30 border border-green-700/30"
                  : "bg-yellow-900/30 border border-yellow-700/30"
              }`}
            >
              <div className="flex items-start gap-3">
                {isSuccess ? (
                  <CheckCircle
                    size={20}
                    className="text-green-400 flex-shrink-0 mt-0.5"
                  />
                ) : (
                  <div className="text-yellow-400 text-xl">📧</div>
                )}
                <p className={isSuccess ? "text-green-300" : "text-yellow-300"}>
                  {message}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg mb-6">
              <p className="text-red-300">{error}</p>
              {verificationAttempts >= 3 && (
                <p className="text-red-400 text-sm mt-1">
                  Percobaan: {verificationAttempts}/5
                </p>
              )}
            </div>
          )}

          {/* Email Info */}
          <div className="p-4 bg-gray-800/30 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300 mb-1">Email tujuan:</p>
                <p className="font-medium text-lg">
                  {user?.email || "Tidak ditemukan"}
                </p>
              </div>
              <Mail size={20} className="text-gray-400" />
            </div>
          </div>

          {/* OTP Input Section */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              <div className="flex items-center gap-2 mb-1">
                <Key size={16} />
                <span>Masukkan Kode OTP 6 Digit</span>
              </div>
              <span className="text-gray-400 text-sm">
                Cek inbox email Anda untuk kode verifikasi
              </span>
            </label>

            <div className="relative mb-4">
              <input
                id="otp-input"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="123456"
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                className="w-full px-4 py-4 bg-gray-800 border border-gray-700 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-center text-2xl tracking-widest font-semibold placeholder-gray-500 transition-all duration-200"
                autoFocus
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {otp.length}/6
              </div>
            </div>

            {/* OTP Help Text */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-400">
                Percobaan:{" "}
                <span className="font-medium">{verificationAttempts}/5</span>
              </div>
              {!canResend && resendTimer > 0 ? (
                <div className="flex items-center gap-1 text-sm text-yellow-400">
                  <Clock size={14} />
                  <span>Tunggu {resendTimer}s</span>
                </div>
              ) : (
                <button
                  onClick={handleResendOTP}
                  disabled={isSending}
                  className="text-sm text-yellow-400 hover:text-yellow-300 disabled:text-gray-500 flex items-center gap-1"
                >
                  <RefreshCw size={14} />
                  <span>Kirim ulang kode</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleVerifyOTP}
              disabled={isVerifying || otp.length !== 6}
              className="w-full py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white font-bold rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isVerifying ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <Shield size={18} />
                  <span>Verifikasi Email</span>
                </>
              )}
            </button>

            <button
              onClick={handleResendOTP}
              disabled={isSending || !canResend}
              className="w-full py-3 bg-gray-800 border border-gray-700 text-gray-300 font-medium rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  <span>Kirim Ulang Kode OTP</span>
                </>
              )}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm mb-2">
              Tidak menerima email? Periksa folder spam atau kirim ulang kode
            </p>
            <p className="text-gray-500 text-sm">
              Kode OTP berlaku selama 15 menit
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Setelah verifikasi, Anda dapat mengakses semua fitur termasuk Voting
            dan Ticket
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="text-teal-400 hover:text-teal-300 font-medium"
            >
              Kembali ke Beranda
            </button>
            <span className="text-gray-600">|</span>
            <button
              onClick={() => navigate("/auth/login")}
              className="text-orange-400 hover:text-orange-300 font-medium"
            >
              Login dengan akun lain
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
