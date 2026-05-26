import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("fb_user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  function login({ identifier }) {
    const normalized = identifier?.toLowerCase() || ''
    const role = normalized.includes('admin') ? 'admin' : 'user'
    const u = { name: identifier, role };
    setUser(u);
    localStorage.setItem("fb_user", JSON.stringify(u));
    return u;
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("fb_user");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
