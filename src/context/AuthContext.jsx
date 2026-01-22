import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk update user state dan localStorage secara sinkron
  const updateUser = (userData) => {
    if (userData) {
      // Pastikan role ada
      if (!userData.role) {
        userData.role = "user";
      }

      // Simpan ke localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("userRole", userData.role);

      // Update state
      setUser(userData);
    } else {
      // Clear semua
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
      setUser(null);
    }
  };

  useEffect(() => {
    const checkUser = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (storedUser && token) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log(
              "AuthContext - User found in localStorage:",
              parsedUser,
            );
            setUser(parsedUser);
          } catch (e) {
            console.error("Error parsing user JSON:", e);
            // Clear invalid data
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("userRole");
          }
        } else {
          console.log("AuthContext - No valid user found in localStorage");
        }
      } catch (error) {
        console.error("Error loading user from storage:", error);
      } finally {
        setLoading(false);
        console.log("AuthContext - Loading complete");
      }
    };

    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      console.log("AuthContext - Attempting login for:", { email, password });

      const response = await fetch("http://localhost:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("AuthContext - Response status:", response.status);

      if (response.status === 422) {
        const errorData = await response.json();
        console.error("AuthContext - Validation error:", errorData);

        let errorMessage = "Email atau password salah";
        if (errorData.errors) {
          if (errorData.errors.email) errorMessage = errorData.errors.email[0];
          else if (errorData.errors.password)
            errorMessage = errorData.errors.password[0];
        }

        return { success: false, message: errorMessage };
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AuthContext - Server error:", errorText);
        return { success: false, message: `Login gagal (${response.status})` };
      }

      const data = await response.json();
      console.log("AuthContext - Login response:", data);

      // Cek format response
      if (!data.token) {
        console.error("AuthContext - No token in response:", data);
        return {
          success: false,
          message: "Token tidak ditemukan dalam response",
        };
      }

      // Format user data
      const userData = {
        id: data.user?.id || data.id || Date.now(),
        name: data.user?.name || data.name || "User",
        email: data.user?.email || data.email || email,
        role: data.user?.role || data.role || "user",
      };

      // Simpan token
      localStorage.setItem("token", data.token);

      // Update user state
      updateUser(userData);

      console.log("AuthContext - Login successful, user:", userData);

      return {
        success: true,
        user: userData,
        token: data.token,
      };
    } catch (error) {
      console.error("AuthContext - Network error:", error);
      return {
        success: false,
        message: "Tidak dapat terhubung ke server. Periksa koneksi internet.",
      };
    }
  };

  const logout = () => {
    console.log("AuthContext - Logging out");
    updateUser(null); // Gunakan fungsi updateUser untuk konsistensi
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  console.log("AuthContext - Current user state:", user);
  console.log("AuthContext - Loading state:", loading);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
