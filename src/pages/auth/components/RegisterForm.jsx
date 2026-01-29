// components/RegisterForm.jsx - REVISI ERROR HANDLING
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  Mail,
  User,
  Phone,
  CheckCircle,
  RefreshCw,
  Shield,
  Clock,
} from "lucide-react";
import {
  registerAndSendOTP,
  resendEmailOTP,
  verifyEmailOTP,
  finalizeRegistration,
} from "../../../services/EmailService";

const RegisterForm = ({ onSubmit, isLoading, onSuccess }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState({}); // Ubah dari string ke object
  const [successMessage, setSuccessMessage] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [emailLocked, setEmailLocked] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(null);
  const [registeredEmail, setRegisteredEmail] = useState("");

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

  // Timer untuk OTP expiry
  useEffect(() => {
    if (!otpExpiry) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeLeft = Math.max(0, otpExpiry - now);

      if (timeLeft <= 0) {
        clearInterval(interval);
        setOtpExpiry(null);
        setErrors({
          verification: ["Kode OTP telah kadaluarsa. Kirim ulang kode."],
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [otpExpiry]);

  // Fungsi handleChange
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error untuk field yang sedang diubah
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  // Fungsi khusus untuk WhatsApp
  const handleWhatsAppChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData({ ...formData, whatsapp: value });
    if (errors.whatsapp || errors.whatsapp_alt) {
      const newErrors = { ...errors };
      delete newErrors.whatsapp;
      delete newErrors.whatsapp_alt;
      setErrors(newErrors);
    }
  };

  // Format error untuk ditampilkan
  const formatErrors = () => {
    if (Object.keys(errors).length === 0) return null;

    const errorMessages = [];

    // Loop melalui semua error
    Object.entries(errors).forEach(([field, messages]) => {
      if (Array.isArray(messages)) {
        messages.forEach((message) => {
          errorMessages.push(`${field}: ${message}`);
        });
      } else if (typeof messages === "string") {
        errorMessages.push(`${field}: ${messages}`);
      }
    });

    return errorMessages.join(". ");
  };

  // **HANDLE REGISTRATION DENGAN ERROR DARI BACKEND**
  const handleSendVerification = async () => {
    // Clear semua error sebelumnya
    setErrors({});

    if (emailLocked) {
      setErrors({
        general: ["Email ini sementara dikunci. Coba lagi nanti."],
      });
      return;
    }

    setIsSendingEmail(true);
    setErrors({});
    setSuccessMessage(null);

    try {
      // LANGSUNG REGISTER ke endpoint /register
      const result = await registerAndSendOTP(formData);

      if (result.success) {
        setEmailSent(true);
        setRegisteredEmail(formData.email);
        setSuccessMessage("✅ Registrasi berhasil! Cek email untuk kode OTP.");

        // Set timer OTP (15 menit)
        const expiryTime = Date.now() + 15 * 60 * 1000;
        setOtpExpiry(expiryTime);
        startResendTimer();

        // console.log("✅ Registration successful:", result.data);
      } else {
        // Tampilkan error dari backend jika ada
        if (result.errors) {
          setErrors(result.errors);
        } else if (result.message) {
          setErrors({ general: [result.message] });
        }
        throw new Error(result.message || "Gagal registrasi");
      }
    } catch (err) {
      console.error("❌ Error sending verification:", err);

      if (verificationAttempts >= 3) {
        setEmailLocked(true);
        setTimeout(() => setEmailLocked(false), 300000);
        setErrors({
          general: [
            "Terlalu banyak percobaan. Email dikunci sementara selama 5 menit.",
          ],
        });
      }
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || !registeredEmail) return;

    setIsSendingEmail(true);
    setErrors({});

    try {
      const result = await resendEmailOTP(registeredEmail, "registration");

      if (result.success) {
        setSuccessMessage(result.message);

        // Reset expiry time
        const expiryTime = Date.now() + 15 * 60 * 1000;
        setOtpExpiry(expiryTime);
        startResendTimer(120);

        // console.log("✅ OTP resent successful:", result.data);
      } else {
        // Tampilkan error dari backend
        if (result.errors) {
          setErrors(result.errors);
        } else if (result.message) {
          setErrors({ general: [result.message] });
        }
        throw new Error(result.message || "Gagal mengirim ulang kode.");
      }
    } catch (err) {
      console.error("❌ Error resending OTP:", err);
      setErrors({ general: [err.message || "Gagal mengirim ulang kode."] });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setErrors({ verification: ["Masukkan kode verifikasi 6 digit"] });
      return;
    }

    if (verificationAttempts >= 5) {
      setErrors({
        verification: ["Terlalu banyak percobaan. Coba lagi nanti."],
      });
      return;
    }

    if (otpExpiry && Date.now() > otpExpiry) {
      setErrors({
        verification: ["Kode OTP telah kadaluarsa. Silakan kirim ulang kode."],
      });
      return;
    }

    setIsVerifying(true);
    setErrors({});

    try {
      // 1. Verifikasi OTP dengan server
      const verificationResult = await verifyEmailOTP(
        registeredEmail,
        verificationCode,
      );

      if (verificationResult.success) {
        setSuccessMessage("✅ Email berhasil diverifikasi!");
        setVerificationAttempts(0);

        // Clear timer
        setOtpExpiry(null);

        // 2. Finalisasi registrasi
        try {
          const finalizeResult = await finalizeRegistration(formData);

          if (finalizeResult.success) {
            setSuccessMessage("🎉 Registrasi selesai! Silakan login.");

            // Panggil onSuccess jika ada
            if (onSuccess) {
              await onSuccess(finalizeResult.data);
            }

            // Redirect ke halaman login setelah 3 detik
            setTimeout(() => {
              navigate("/auth/login", {
                state: {
                  registeredEmail: formData.email,
                  message:
                    "Registrasi berhasil! Silakan login dengan email dan password Anda.",
                },
              });
            }, 3000);
          } else {
            // Tampilkan error finalisasi
            if (finalizeResult.errors) {
              setErrors(finalizeResult.errors);
            } else {
              throw new Error(finalizeResult.message);
            }
          }
        } catch (finalizeError) {
          throw new Error(`Finalisasi gagal: ${finalizeError.message}`);
        }
      } else {
        // Tampilkan error verifikasi dari backend
        if (verificationResult.errors) {
          setErrors(verificationResult.errors);
        } else {
          throw new Error(verificationResult.message);
        }
      }
    } catch (err) {
      console.error("❌ Verification error:", err);
      setErrors({ verification: [err.message] });
      setVerificationAttempts((prev) => prev + 1);

      if (verificationAttempts + 1 >= 5) {
        setErrors({
          verification: [
            "Terlalu banyak percobaan salah. Kirim ulang kode verifikasi.",
          ],
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleSendVerification();
  };

  // Format waktu untuk display
  const formatTimeLeft = () => {
    if (!otpExpiry) return null;
    const timeLeft = Math.max(0, otpExpiry - Date.now());
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Helper untuk menampilkan field-specific error
  const getFieldError = (fieldName) => {
    if (!errors[fieldName]) return null;

    if (Array.isArray(errors[fieldName])) {
      return errors[fieldName].join(", ");
    }

    return errors[fieldName];
  };

  // Check jika ada error umum
  const hasGeneralError = errors.general || errors.message;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-gradient-to-r from-teal-50 to-teal-100 border border-teal-200 rounded-xl">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-teal-600" />
            <p className="text-teal-700 font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message - Tampilkan error umum atau formatted error */}
      {(hasGeneralError || Object.keys(errors).length > 0) && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl">
          <div className="flex items-start gap-2">
            <div className="text-red-600 mt-0.5">⚠️</div>
            <div className="flex-1">
              <p className="text-red-700 font-medium">Perhatian</p>

              {/* Tampilkan error umum */}
              {hasGeneralError && (
                <p className="text-red-600 text-sm mt-1">
                  {Array.isArray(errors.general || errors.message)
                    ? (errors.general || errors.message).join(", ")
                    : errors.general || errors.message}
                </p>
              )}

              {/* Tampilkan formatted errors jika tidak ada error umum */}
              {!hasGeneralError && formatErrors() && (
                <p className="text-red-600 text-sm mt-1">{formatErrors()}</p>
              )}

              {emailLocked && (
                <p className="text-red-500 text-xs mt-2">
                  🔒 Email dikunci sementara karena terlalu banyak percobaan.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Verification Section */}
      {emailSent && !isVerifying && (
        <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-orange-600" />
              <p className="text-orange-700 font-medium">
                Verifikasi Email Diperlukan
              </p>
            </div>

            {/* OTP Timer */}
            {otpExpiry && (
              <div className="flex items-center gap-1 text-sm text-orange-600">
                <Clock size={14} />
                <span className="font-mono">{formatTimeLeft()}</span>
              </div>
            )}
          </div>

          <p className="text-orange-600 text-sm mb-4">
            Kami telah mengirim kode OTP 6 digit ke{" "}
            <strong>{registeredEmail}</strong>. Silakan periksa inbox email
            Anda.
            <br />
            <span className="text-xs text-orange-500">
              Data Anda sudah tersimpan. Verifikasi email untuk melanjutkan.
            </span>
          </p>

          {/* Verification Code Input dengan error khusus */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Masukkan Kode OTP dari Email
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="123456"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  if (value.length <= 6) {
                    setVerificationCode(value);
                  }
                  // Clear verification error saat user mulai ketik
                  if (errors.verification) {
                    const newErrors = { ...errors };
                    delete newErrors.verification;
                    setErrors(newErrors);
                  }
                }}
                className={`w-full px-4 py-3 text-gray-600 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-center text-lg tracking-widest font-semibold ${
                  errors.verification ? "border-red-300" : "border-gray-300"
                }`}
                autoFocus
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {verificationCode.length}/6
              </div>
            </div>

            {/* Tampilkan error verification spesifik */}
            {errors.verification && (
              <p className="text-red-500 text-sm mt-1">
                {Array.isArray(errors.verification)
                  ? errors.verification.join(", ")
                  : errors.verification}
              </p>
            )}

            <div className="mt-3 flex justify-between items-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isSendingEmail || !canResend || emailLocked}
                className="text-sm text-orange-600 hover:text-orange-700 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {isSendingEmail ? (
                  <>
                    <div className="w-3 h-3 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                    Mengirim...
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} />
                    Kirim ulang kode
                  </>
                )}
                {!canResend && resendTimer > 0 && ` (${resendTimer}s)`}
              </button>

              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-500">
                  Percobaan: {verificationAttempts}/5
                </div>
                {otpExpiry && (
                  <div className="text-xs text-orange-600">
                    Berlaku: {formatTimeLeft()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setEmailSent(false);
                setVerificationCode("");
                setSuccessMessage(null);
                setErrors({});
                setOtpExpiry(null);
                setRegisteredEmail("");
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Ganti Email
            </button>

            <button
              type="button"
              onClick={handleVerifyEmail}
              disabled={
                isVerifying || verificationCode.length !== 6 || emailLocked
              }
              className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {isVerifying ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Memverifikasi...
                </div>
              ) : (
                "Verifikasi & Lanjutkan"
              )}
            </button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-gray-500 mt-4 text-center">
            Tidak menerima email? Periksa folder spam atau klik "Kirim ulang
            kode".
          </p>
        </div>
      )}

      {/* Registration Form - tampil jika belum registrasi */}
      {!emailSent && (
        <>
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Lengkap *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <User size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                placeholder="Masukkan nama lengkap"
                required
                value={formData.name}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 transition-all duration-200 ${
                  getFieldError("name") ? "border-red-300" : "border-gray-300"
                }`}
                disabled={isLoading}
              />
            </div>
            {getFieldError("name") && (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("name")}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                placeholder="nama@gmail.com"
                required
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 transition-all duration-200 ${
                  getFieldError("email") ? "border-red-300" : "border-gray-300"
                }`}
                disabled={isLoading}
              />
            </div>
            {getFieldError("email") ? (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("email")}
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-2">
                Email akan dikirim kode verifikasi OTP
              </p>
            )}
          </div>

          {/* WhatsApp Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor WhatsApp *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Phone size={18} className="text-gray-400" />
              </div>
              <input
                type="tel"
                name="whatsapp"
                placeholder="081234567890"
                required
                value={formData.whatsapp}
                onChange={handleWhatsAppChange}
                className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 transition-all duration-200 ${
                  getFieldError("whatsapp") || getFieldError("whatsapp_alt")
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
                disabled={isLoading}
              />
            </div>
            {getFieldError("whatsapp") ? (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("whatsapp")}
              </p>
            ) : getFieldError("whatsapp_alt") ? (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("whatsapp_alt")}
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-2">
                Untuk notifikasi dan keperluan support
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type="password"
                name="password"
                placeholder="Minimal 6 karakter"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 transition-all duration-200 ${
                  getFieldError("password")
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
                disabled={isLoading}
              />
            </div>
            {getFieldError("password") ? (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("password")}
              </p>
            ) : (
              <div className="flex items-center gap-2 mt-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    formData.password.length >= 6
                      ? "bg-teal-500"
                      : "bg-gray-300"
                  }`}
                ></div>
                <span className="text-xs text-gray-500">
                  Minimal 6 karakter
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konfirmasi Password *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type="password"
                name="password_confirmation"
                placeholder="Ketik ulang password"
                required
                minLength={6}
                value={formData.password_confirmation}
                onChange={handleChange}
                className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 placeholder-gray-500 transition-all duration-200 ${
                  getFieldError("password_confirmation")
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
                disabled={isLoading}
              />
            </div>
            {getFieldError("password_confirmation") ? (
              <p className="text-red-500 text-sm mt-1">
                {getFieldError("password_confirmation")}
              </p>
            ) : (
              <div className="flex items-center gap-2 mt-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    formData.password === formData.password_confirmation &&
                    formData.password_confirmation.length >= 6
                      ? "bg-teal-500"
                      : "bg-gray-300"
                  }`}
                ></div>
                <span className="text-xs text-gray-500">
                  Password harus sama
                </span>
              </div>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              required
              className="mt-1 mr-3 w-5 h-5 bg-white border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
              disabled={isLoading}
            />
            <label
              htmlFor="terms"
              className="text-sm text-gray-600 leading-tight"
            >
              Saya menyetujui{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 transition-colors font-medium"
              >
                Syarat & Ketentuan
              </a>{" "}
              dan{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 transition-colors font-medium"
              >
                Kebijakan Privasi
              </a>
            </label>
          </div>

          {/* Submit Button - Sekarang untuk REGISTER, bukan hanya minta OTP */}
          <button
            type="submit"
            disabled={isLoading || isSendingEmail}
            className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-orange-700 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
          >
            {isLoading || isSendingEmail ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {isSendingEmail ? "Mendaftarkan..." : "Memproses..."}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Shield size={18} />
                <span>Daftar & Verifikasi Email</span>
              </span>
            )}
          </button>

          {/* Login Link */}
          <div className="text-center pt-4">
            <p className="text-gray-600">
              Sudah punya akun?{" "}
              <button
                type="button"
                onClick={() => navigate("/auth/login")}
                className="text-orange-600 font-medium hover:text-orange-700 transition-colors"
              >
                Login di sini
              </button>
            </p>
          </div>
        </>
      )}
    </form>
  );
};

export default RegisterForm;
