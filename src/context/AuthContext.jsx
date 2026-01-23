import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
const API_URL = "https://apipaskibra.my.id/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider - Initializing...");
    const initAuth = () => {
      try {
        const storedUser = localStorage.getItem("user");
        console.log("AuthProvider - Stored user:", storedUser);

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log("AuthProvider - Parsed user:", parsedUser);

          // Validasi user data
          if (parsedUser && parsedUser.role) {
            setUser(parsedUser);
            console.log("AuthProvider - User loaded successfully");
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
        console.log("AuthProvider - Initialization complete");
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

      // CASE 1: Data ada di responseData.data.user
      if (responseData.data && responseData.data.user) {
        const apiUser = responseData.data.user;

        // Mapping user_role_id ke role - dengan default "user" bukan "admin"
        const roleMapping = {
          1: "admin",
          2: "juri",
          3: "user",
          admin: "admin",
          juri: "juri",
          user: "user",
        };

        // 🔥 PERBAIKAN: Default ke "user" bukan "admin"
        const userRoleId = apiUser.user_role_id;

        userData = {
          id: apiUser.id,
          name: apiUser.name || apiUser.username || "User",
          email: apiUser.email || email,
          role: roleMapping[userRoleId] || "user", // Default ke "user"
        };

        console.log(
          `AuthContext - user_role_id: ${userRoleId}, mapped to: ${userData.role}`,
        );
      }
      // CASE 2: Data langsung di responseData.data
      else if (responseData.data) {
        const apiData = responseData.data;
        const roleMapping = {
          1: "admin",
          2: "juri",
          3: "user",
          admin: "admin",
          juri: "juri",
          user: "user",
        };

        userData = {
          id: apiData.id,
          name: apiData.name || "User",
          email: apiData.email || email,
          role: roleMapping[apiData.user_role_id] || "user", // Default ke "user"
        };
      }
      // CASE 3: Fallback
      else {
        console.warn("Unexpected response structure, using fallback");
        userData = {
          id: "temp_" + Date.now(),
          name: "User",
          email: email,
          role: "user", // Default ke "user"
        };
      }

      console.log("AuthContext - Final user data:", userData);

      // Simpan ke localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem(
        "access_token",
        responseData.data?.token || responseData.token || "LOGIN_OK",
      );

      // Update state
      setUser(userData);
      console.log("AuthContext - User state updated successfully");

      return userData;
    } catch (error) {
      console.error("AuthContext - Login error:", error);
      throw error;
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
