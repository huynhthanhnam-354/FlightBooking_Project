import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("fb_user");
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch (e) {
        localStorage.removeItem("fb_user");
      }
    }
    setLoading(false);
  }, []);

  const loginSuccess = (authData) => {
    setUser(authData);
    localStorage.setItem("fb_user", JSON.stringify(authData));
  };

  const logout = () => {
    authApi.logout().catch(err => console.warn("Failed to call logout API:", err));
    setUser(null);
    localStorage.removeItem("fb_user");
  };

  const updateAccessToken = (newToken) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, accessToken: newToken };
      localStorage.setItem("fb_user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginSuccess, logout, updateAccessToken }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
