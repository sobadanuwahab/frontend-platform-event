const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://apipaskibra.my.id/api";

export const sendVerificationEmail = async (email, name) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/auth/send-verification-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          email,
          name,
          type: "registration",
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Gagal mengirim email verifikasi");
    }

    return {
      success: true,
      message: data.message || "Email verifikasi terkirim",
      verificationId: data.verification_id, // ID untuk verify nanti
    };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return {
      success: false,
      message: error.message || "Gagal mengirim email verifikasi",
    };
  }
};

export const verifyEmailCode = async (email, code, verificationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        code,
        verification_id: verificationId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Verifikasi gagal");
    }

    return {
      success: true,
      message: data.message || "Email berhasil diverifikasi",
      token: data.token, // JWT token jika perlu
    };
  } catch (error) {
    console.error("Email verification failed:", error);
    return {
      success: false,
      message: error.message || "Verifikasi gagal",
    };
  }
};
