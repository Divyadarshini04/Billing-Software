import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { tokenManager } from "../utils/tokenManager";
import { authAPI } from "../api/apiService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize: Check for existing session
  useEffect(() => {
    const initAuth = async () => {
      const token = tokenManager.getToken();
      const storedUser = sessionStorage.getItem("user");

      console.log("DEBUG: AuthContext initAuth - Token found:", !!token, "StoredUser found:", !!storedUser);

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("DEBUG: AuthContext restoring user:", parsedUser.name, "Role:", parsedUser.role);
          setUser(parsedUser);
        } catch (e) {
          console.error("Failed to parse stored user data", e);
          // If corrupted, clear
          sessionStorage.removeItem("user");
          tokenManager.removeToken();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = (userData, token = null) => {
    console.log("DEBUG: AuthContext login called for:", userData?.name);

    // Clear the older generic 'token' key if exists
    sessionStorage.removeItem("token");

    // If a new token is provided, set it. 
    // If NO token is provided, we ASSUME it was already set by the login page (tokenManager.setToken)
    // and we DON'T clear it.
    if (token) {
      console.log("DEBUG: AuthContext setting authToken from argument");
      tokenManager.setToken(token);
    }

    setUser(userData);
    sessionStorage.setItem("user", JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    console.log("DEBUG: AuthContext logout called");
    setUser(null);
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    tokenManager.removeToken();
    try {
      authAPI.logout().catch(err => console.warn("Logout API failed", err));
    } catch (e) {
      // Ignore
    }
  };

  const switchRole = (phone, newRole) => {
    // Logic for role switching would technically require re-authentication or backend support.
    // For now, we just update the local user object if permitted.
    // Real implementation should probably hit an API.
    if (user) {
      // This is a simplified "mock-like" behavior for role switching on frontend
      // But ideally this should be an API call: /auth/switch-role
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      return updatedUser;
    }
  };

  const isAuthenticated = !!user;
  // Determine role from is_super_admin flag or role field
  const userRole = user?.is_super_admin ? "SUPERADMIN" : (user?.role?.toUpperCase() || null);

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.is_super_admin) return true;
    if (user.role === "OWNER") return true;
    return false;
  };

  const refreshProfile = useCallback(async () => {
    try {
      console.log("DEBUG: AuthContext refreshing profile...");
      const response = await authAPI.getCurrentUser();
      const freshUserData = response.data;

      setUser(prevUser => {
        // Keep existing role if not returned/changed in the update
        const updatedUser = {
          ...prevUser,
          ...freshUserData,
          role: freshUserData.role || prevUser?.role
        };
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
        console.log("DEBUG: AuthContext profile refreshed", freshUserData.first_name || freshUserData.email);
        return updatedUser;
      });

      // Note: We return freshUserData here but rely on state for components
      return freshUserData;
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  }, []); // Empty dependency array as we use functional updates

  return (
    <AuthContext.Provider value={{ user, userRole, isAuthenticated, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
