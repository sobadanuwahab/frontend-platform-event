import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
const API_URL = "https://apipaskibra.my.id/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);

          if (parsedUser && parsedUser.role) {
            setUser(parsedUser);
          } else {
            console.warn("AuthProvider - Invalid user data, clearing...");
            localStorage.removeItem("user");
            localStorage.removeItem("access_token");
          }
        }
      } catch (error) {
        console.error("AuthProvider - Error loading user:", error);
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log("AuthContext - Login attempt with:", { email });

      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const responseData = await res.json();
      console.log("AuthContext - Login response:", responseData);

      if (!res.ok) {
        throw new Error(responseData.message || "Login gagal");
      }

      let userData;

      // Process user data...
      if (responseData.data && responseData.data.user) {
        const apiUser = responseData.data.user;
        console.log("AuthContext - API User data:", apiUser);

        const roleMapping = {
          1: "admin",
          2: "juri",
          3: "user",
          4: "organizer",
          admin: "admin",
          juri: "juri",
          judge: "juri",
          user: "user",
          organizer: "organizer",
        };

        let role;
        if (apiUser.role) {
          role = roleMapping[apiUser.role] || "user";
        } else if (apiUser.user_role_id) {
          role = roleMapping[apiUser.user_role_id] || "user";
        } else {
          role = "user";
        }

        userData = {
          id: apiUser.id,
          name: apiUser.name || apiUser.username || "User",
          email: apiUser.email || email,
          role: role,
          originalRole: apiUser.role,
          whatsapp: apiUser.whatsapp || null,
        };
      }
      // CASE 2: Data langsung di responseData.data
      else if (responseData.data) {
        const apiData = responseData.data;
        console.log("AuthContext - API Data:", apiData);

        const roleMapping = {
          1: "admin",
          2: "juri",
          3: "user",
          4: "organizer",
          admin: "admin",
          juri: "juri",
          judge: "juri",
          user: "user",
          organizer: "organizer",
        };

        let role;

        if (apiData.role) {
          role = roleMapping[apiData.role] || "user";
          console.log(
            `AuthContext - Role from apiData.role: "${apiData.role}" -> "${role}"`,
          );
        } else if (apiData.user_role_id) {
          role = roleMapping[apiData.user_role_id] || "user";
          console.log(
            `AuthContext - Role from user_role_id: ${apiData.user_role_id} -> "${role}"`,
          );
        } else {
          role = "user";
        }

        userData = {
          id: apiData.id,
          name: apiData.name || "User",
          email: apiData.email || email,
          role: role,
          originalRole: apiData.role,
          whatsapp: apiData.whatsapp || null,
        };
      }
      // CASE 3: Data dengan structure yang berbeda (langsung di root)
      else if (responseData.role) {
        console.log("AuthContext - Data in root:", responseData);

        const roleMapping = {
          admin: "admin",
          juri: "juri",
          judge: "juri",
          user: "user",
          organizer: "organizer",
        };

        userData = {
          id: responseData.id,
          name: responseData.name || "User",
          email: responseData.email || email,
          role: roleMapping[responseData.role] || "user",
          originalRole: responseData.role,
          whatsapp: responseData.whatsapp || null,
        };
      }
      // CASE 4: Fallback
      else {
        console.warn(
          "AuthContext - Unexpected response structure:",
          responseData,
        );
        userData = {
          id: "temp_" + Date.now(),
          name: "User",
          email: email,
          role: "user",
        };
      }

      // Simpan ke localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem(
        "access_token",
        responseData.data?.token || responseData.token || "LOGIN_OK",
      );

      // **UPDATE STATE SYNCHRONOUSLY**
      setUser(userData);
      console.log("AuthContext - User state updated synchronously");

      const redirectPath = getRedirectPathByRole(userData.role);
      console.log(`AuthContext - Immediate redirect to: ${redirectPath}`);

      return {
        success: true,
        user: userData,
        redirectPath: redirectPath,
      };
    } catch (error) {
      console.error("AuthContext - Login error:", error);
      throw error;
    }
  };

  // Helper function untuk menentukan redirect path berdasarkan role
  const getRedirectPathByRole = (role) => {
    switch (role) {
      case "organizer":
        return "/organizer";
      case "admin":
        return "/admin/dashboard";
      case "juri":
        return "/judging";
      case "user":
        return "/";
      default:
        return "/";
    }
  };

  const logout = () => {
    console.log("AuthContext - Logging out");
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        getRedirectPathByRole,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
