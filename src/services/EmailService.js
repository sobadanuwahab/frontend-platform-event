import api from "./api";

/**
 * REGISTER user dan kirim OTP email
 */
export const registerAndSendOTP = async (userData) => {
  try {
    console.log("👤 Register user dan kirim OTP:", userData.email);

    const response = await api.post("/register", {
      name: userData.name,
      whatsapp: userData.whatsapp,
      email: userData.email,
      password: userData.password,
      password_confirmation: userData.password_confirmation,
    });

    console.log("✅ Registration Response:", response.data);

    return {
      success: true,
      message:
        response.data.message ||
        "Registrasi berhasil. Cek email untuk kode OTP.",
      data: response.data.data || response.data,
    };
  } catch (error) {
    console.error("❌ Registration error:", error);

    const errorData = error.response?.data || {};

    // FORMAT ERROR UNTUK FRONTEND
    let formattedErrors = {};

    // Jika ada errors object dari Laravel/backend
    if (errorData.errors && typeof errorData.errors === "object") {
      // Konversi errors dari Laravel format ke frontend format
      Object.entries(errorData.errors).forEach(([field, messages]) => {
        // Field mapping untuk whatsapp_alt
        const fieldName = field === "whatsapp_alt" ? "whatsapp" : field;

        if (Array.isArray(messages)) {
          formattedErrors[fieldName] = messages.map((msg) => {
            // Translate error messages jika perlu
            if (msg.includes("has already been taken")) {
              if (field === "email") return "Email ini sudah terdaftar";
              if (field === "whatsapp" || field === "whatsapp_alt")
                return "Nomor WhatsApp ini sudah terdaftar";
            }
            if (msg.includes("The email must be a valid email address"))
              return "Format email tidak valid";
            if (msg.includes("The password must be at least"))
              return "Password minimal 6 karakter";
            if (msg.includes("The password confirmation does not match"))
              return "Konfirmasi password tidak cocok";
            return msg;
          });
        } else if (typeof messages === "string") {
          formattedErrors[fieldName] = [messages];
        }
      });
    }

    // Jika ada message general
    const errorMessage =
      errorData.message ||
      errorData.error ||
      error.message ||
      "Registrasi gagal. Periksa data Anda.";

    // Jika tidak ada field-specific errors, gunakan general error
    if (Object.keys(formattedErrors).length === 0) {
      formattedErrors = { general: [errorMessage] };
    }

    console.log("📋 Formatted errors for frontend:", formattedErrors);

    return {
      success: false,
      message: errorMessage,
      errors: formattedErrors,
    };
  }
};

/**
 * Verifikasi OTP yang diinput user
 * ENDPOINT: /email-verify-otp (untuk verify)
 */
export const verifyEmailOTP = async (email, otp) => {
  try {
    console.log("🔐 Verifikasi OTP dengan /email-verify-otp:", { email, otp });

    const response = await api.post("/email-verify-otp", {
      email,
      otp,
      action: "verify",
    });

    console.log("✅ Verification Response:", response.data);

    // Simpan status verifikasi
    saveVerificationStatus(email);

    return {
      success: true,
      message: response.data.message || "Email berhasil diverifikasi",
      data: response.data,
    };
  } catch (error) {
    console.error("❌ Error verifying OTP:", error);

    // Coba method lain jika POST gagal
    try {
      console.log("🔄 Coba method PUT untuk verify");
      const putResponse = await api.put("/email-verify-otp", {
        email,
        otp,
      });

      console.log("✅ PUT Verification Response:", putResponse.data);

      saveVerificationStatus(email);

      return {
        success: true,
        message: putResponse.data.message || "Email berhasil diverifikasi",
        data: putResponse.data,
      };
    } catch (putError) {
      console.error("❌ PUT juga gagal:", putError);

      const errorData = error.response?.data || putError.response?.data || {};

      // Format error untuk verifikasi
      let formattedErrors = {};
      let errorMessage = "Verifikasi gagal. Periksa kode Anda.";

      if (errorData.errors && typeof errorData.errors === "object") {
        Object.entries(errorData.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            formattedErrors[field] = messages;
          }
        });
      }

      if (errorData.message) {
        errorMessage = errorData.message;
      }

      // Jika ada OTP specific error
      if (errorData.errors?.otp) {
        formattedErrors.verification = errorData.errors.otp;
      }

      return {
        success: false,
        message: errorMessage,
        errors: formattedErrors,
      };
    }
  }
};

/**
 * Kirim ulang OTP
 */
export const resendEmailOTP = async (email, type = "registration") => {
  try {
    console.log("🔄 Resend OTP untuk:", email);

    const response = await api.post("/email-resend-otp", {
      email,
      type,
    });

    console.log("✅ Resend OTP Response:", response.data);

    return {
      success: true,
      message: response.data.message || "Kode OTP baru telah dikirim",
      data: response.data,
    };
  } catch (error) {
    console.error("❌ Error resending OTP:", error);

    const errorData = error.response?.data || {};
    let errorMessage = "Gagal mengirim ulang kode verifikasi.";

    if (errorData.message) {
      errorMessage = errorData.message;
    } else if (errorData.errors) {
      // Format error jika ada
      const errors = Object.entries(errorData.errors)
        .map(
          ([field, messages]) =>
            `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`,
        )
        .join("; ");
      errorMessage = errors;
    }

    return {
      success: false,
      message: errorMessage,
    };
  }
};

/**
 * Finalize registration setelah email diverifikasi
 */
export const finalizeRegistration = async (userData) => {
  try {
    console.log("✅ Finalize registration untuk:", userData.email);

    // Login user setelah verifikasi berhasil
    const response = await api.post("/login", {
      email: userData.email,
      password: userData.password,
    });

    const { data } = response;
    console.log("✅ Login Response:", data);

    // Simpan token jika ada
    if (data.token || data.access_token) {
      const token = data.token || data.access_token;
      localStorage.setItem("access_token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    // Simpan user data
    if (data.data || data.user) {
      const userDataToStore = data.data || data.user || data;
      localStorage.setItem("user_data", JSON.stringify(userDataToStore));

      // Simpan status verifikasi jika user sudah verified
      if (userDataToStore.email_verified_at) {
        saveVerificationStatus(userData.email);
      }
    }

    return {
      success: true,
      message: data.message || "Login berhasil",
      data: data.data || data,
    };
  } catch (error) {
    console.error("❌ Finalize registration error:", error);

    const errorData = error.response?.data || {};
    let errorMessage = "Gagal finalisasi registrasi.";
    let formattedErrors = {};

    if (errorData.message) {
      errorMessage = errorData.message;
    }

    if (errorData.errors && typeof errorData.errors === "object") {
      Object.entries(errorData.errors).forEach(([field, messages]) => {
        if (Array.isArray(messages)) {
          formattedErrors[field] = messages;
        }
      });
    }

    return {
      success: false,
      message: errorMessage,
      errors:
        Object.keys(formattedErrors).length > 0 ? formattedErrors : undefined,
    };
  }
};

/**
 * SIMPAN status verifikasi ke localStorage
 * @param {string} email - Email user
 * @returns {void}
 */
export const saveVerificationStatus = (email) => {
  localStorage.setItem(`email_verified_${email}`, "true");
  localStorage.setItem(`email_verified_at_${email}`, new Date().toISOString());

  // Juga update user_data jika ada
  const storedUserData = localStorage.getItem("user_data");
  if (storedUserData) {
    try {
      const userData = JSON.parse(storedUserData);
      userData.email_verified_at = new Date().toISOString();
      userData.is_verified = true;
      localStorage.setItem("user_data", JSON.stringify(userData));
    } catch (e) {
      console.error("Error updating user_data:", e);
    }
  }

  console.log("💾 Verification status saved for:", email);
};

/**
 * Cek status verifikasi email user
 */
export const checkEmailVerificationStatus = async (email) => {
  try {
    console.log("🔍 Checking verification status for:", email);

    // Cek dari localStorage
    const localStorageVerified = localStorage.getItem(
      `email_verified_${email}`,
    );

    if (localStorageVerified === "true") {
      console.log("✅ Status dari localStorage: VERIFIED");
      return {
        success: true,
        data: {
          is_verified: true,
          email: email,
          verified_at:
            localStorage.getItem(`email_verified_at_${email}`) ||
            new Date().toISOString(),
          source: "local_cache",
        },
        message: "Email sudah terverifikasi",
      };
    }

    return {
      success: true,
      data: {
        is_verified: false,
        email: email,
        verified_at: null,
        source: "no_evidence",
      },
      message: "Email belum terverifikasi",
    };
  } catch (error) {
    console.error("❌ Check verification status error:", error);

    return {
      success: false,
      message: error.message || "Gagal mengecek status verifikasi",
      data: {
        is_verified: false,
        email: email,
        verified_at: null,
        source: "error",
      },
    };
  }
};

export default {
  registerAndSendOTP,
  resendEmailOTP,
  verifyEmailOTP,
  finalizeRegistration,
  checkEmailVerificationStatus,
  saveVerificationStatus,
};
