import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./components/AuthLayout";
import RegisterForm from "./components/RegisterForm";
import Toast from "../../components/Toast";

const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (formData) => {
    setIsLoading(true);

    try {
      console.log("Processing registration...", formData);

      // Simpan data user ke localStorage
      const registeredUserData = {
        name: formData.name,
        email: formData.email,
        whatsapp: formData.whatsapp,
        role: "user",
        loggedIn: true,
        joinDate: new Date().toLocaleDateString("id-ID"),
        points: 100,
        isEmailVerified: true, // Setelah verifikasi email berhasil
      };

      // Simpan user data ke localStorage
      localStorage.setItem("user", JSON.stringify(registeredUserData));

      // Simpan token dummy untuk authentication
      localStorage.setItem("authToken", "dummy-auth-token-" + Date.now());

      // Set coin balance default
      localStorage.setItem("coinBalance", "0");

      // Tampilkan notifikasi sukses
      setToast({
        message: "Registrasi berhasil! Selamat bergabung di VOTIX.",
        type: "success",
      });

      // Tunggu 2 detik untuk user baca notifikasi
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect ke home
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);
      setToast({
        message: "Registrasi gagal. Silakan coba lagi.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = async (formData) => {
    await handleRegister(formData);
  };

  return (
    <>
      <AuthLayout
        title="Buat Akun Baru"
        subtitle="Daftar untuk mulai memberikan voting dan mendukung tim favorit Anda"
        type="register">
        <RegisterForm
          onSubmit={handleSuccess}
          isLoading={isLoading}
          onSuccess={handleSuccess}
        />
      </AuthLayout>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default RegisterPage;
