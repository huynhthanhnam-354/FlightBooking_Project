import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "../types/flight";

interface AuthData extends User {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

interface AuthContextType {
  user: AuthData | null;
  loading: boolean;
  loginSuccess: (authData: AuthData) => void;
  logout: () => void;
  updateAccessToken: (newToken: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthData | null>(null);
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

  const loginSuccess = (authData: AuthData) => {
    setUser(authData);
    localStorage.setItem("fb_user", JSON.stringify(authData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("fb_user");
  };

  const updateAccessToken = (newToken: string) => {
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
