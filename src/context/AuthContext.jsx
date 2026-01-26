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

            // **CLEANUP: Hapus backup lama jika ada**
            cleanupOldBackups(parsedUser.id);
          } else {
            console.warn(
              "AuthProvider - Invalid user data, clearing auth only...",
            );
            // Hapus hanya auth data
            localStorage.removeItem("user");
            localStorage.removeItem("access_token");
          }
        }
      } catch (error) {
        console.error("AuthProvider - Error loading user:", error);
        // Hapus hanya auth data, jangan semua
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Fungsi cleanup
  const cleanupOldBackups = (currentUserId) => {
    // Hapus backup dari user lain yang sudah lama
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("events_backup_")) {
        const backupUserId = key.replace("events_backup_", "");

        // Jika bukan user saat ini, hapus backup lama
        if (backupUserId != currentUserId) {
          try {
            const backupData = JSON.parse(localStorage.getItem(key));
            const backupTime = new Date(backupData.timestamp || 0).getTime();

            if (backupTime < oneDayAgo) {
              localStorage.removeItem(key);
              localStorage.removeItem(`participants_backup_${backupUserId}`);
              console.log(`🧹 Cleaned up old backup for user ${backupUserId}`);
            }
          } catch (e) {
            localStorage.removeItem(key);
          }
        }
      }
    });
  };

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

      if (userData.id) {
        setTimeout(() => {
          restoreUserEvents(userData.id);
        }, 1000); // Delay sedikit untuk memastikan state sudah terupdate
      }

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

  // Fungsi untuk restore data event
  const restoreUserEvents = (userId) => {
    try {
      console.log(`🔄 Restoring events for user ${userId} after login...`);

      // Cek apakah ada backup
      const backupKey = `events_backup_${userId}`;
      const backupData = localStorage.getItem(backupKey);

      if (backupData) {
        const backup = JSON.parse(backupData);
        console.log(
          `📦 Found backup with ${backup.events?.length || 0} events`,
        );

        // Ambil data event yang ada sekarang
        const currentEvents = JSON.parse(
          localStorage.getItem("user_created_events") || "[]",
        );

        // Gabungkan: backup + current (hapus duplikat)
        const allEvents = [...backup.events, ...currentEvents];
        const uniqueEvents = Array.from(
          new Map(allEvents.map((event) => [event.id, event])).values(),
        );

        localStorage.setItem(
          "user_created_events",
          JSON.stringify(uniqueEvents),
        );
        console.log(
          `✅ Restored ${backup.events.length} events, total now: ${uniqueEvents.length}`,
        );

        // Restore participants
        const participantsBackupKey = `participants_backup_${userId}`;
        const participantsBackup = localStorage.getItem(participantsBackupKey);

        if (participantsBackup) {
          const participantsData = JSON.parse(participantsBackup);
          Object.keys(participantsData).forEach((key) => {
            localStorage.setItem(key, participantsData[key]);
          });
          console.log(
            `✅ Restored ${Object.keys(participantsData).length} participant sets`,
          );
        }

        // Hapus backup (optional)
        localStorage.removeItem(backupKey);
        localStorage.removeItem(participantsBackupKey);
      }
    } catch (error) {
      console.error("❌ Error restoring user events:", error);
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
    console.log("AuthContext - Smart logout (preserving user's data)");

    const currentUserId = user?.id;

    if (currentUserId) {
      // 1. Backup data event untuk user ini
      backupUserEvents(currentUserId);
    }

    // 2. Hapus hanya data autentikasi
    const authKeys = ["user", "access_token", "token", "last_login"];
    authKeys.forEach((key) => localStorage.removeItem(key));

    // 3. Reset user state
    setUser(null);

    console.log("✅ Logout completed");
  };

  // Fungsi untuk backup data event user
  const backupUserEvents = (userId) => {
    try {
      console.log(`📦 Backing up events for user ${userId} before logout...`);

      // Ambil semua data event
      const allEvents = JSON.parse(
        localStorage.getItem("user_created_events") || "[]",
      );

      // Pisahkan: event dari user ini vs dari user lain
      const currentUserEvents = allEvents.filter(
        (event) => event.user_id == userId,
      );
      const otherUserEvents = allEvents.filter(
        (event) => event.user_id != userId,
      );

      console.log(
        `📊 Events: ${currentUserEvents.length} for user ${userId}, ${otherUserEvents.length} from others`,
      );

      // Backup untuk user ini (untuk recovery jika perlu)
      const userEventsBackup = {
        user_id: userId,
        timestamp: new Date().toISOString(),
        events: currentUserEvents,
      };

      // Simpan backup terpisah
      localStorage.setItem(
        `events_backup_${userId}`,
        JSON.stringify(userEventsBackup),
      );

      // Simpan data dari user lain saja
      localStorage.setItem(
        "user_created_events",
        JSON.stringify(otherUserEvents),
      );

      // Backup peserta event
      const userParticipants = {};
      currentUserEvents.forEach((event) => {
        const participants = localStorage.getItem(
          `event_participants_${event.id}`,
        );
        if (participants) {
          userParticipants[`event_participants_${event.id}`] = participants;
        }
      });

      if (Object.keys(userParticipants).length > 0) {
        localStorage.setItem(
          `participants_backup_${userId}`,
          JSON.stringify(userParticipants),
        );
      }

      console.log(
        `✅ Backup completed for user ${userId}: ${currentUserEvents.length} events`,
      );
    } catch (error) {
      console.error("❌ Error backing up user events:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        getRedirectPathByRole,
      }}
    >
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
