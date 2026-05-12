import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthResponse } from '../services/authApi';
import { fetchMe, type MeResponse } from '../services/userAccountApi';
import {
  clearAuthToken,
  clearUserProfile,
  getAuthToken,
  getUserProfile,
  saveAuthToken,
  saveUserProfile,
} from '../storage/authStorage';

export type AuthUser = {
  email: string;
  fullName: string;
  role: string;
  phone?: string | null;
  shareAnalytics: boolean;
  marketingOptIn: boolean;
};

function userFromAuthResponse(res: AuthResponse): AuthUser {
  return {
    email: res.email,
    fullName: res.fullName,
    role: res.role,
    phone: res.phone ?? undefined,
    shareAnalytics: res.shareAnalytics ?? true,
    marketingOptIn: res.marketingOptIn ?? false,
  };
}

function userFromMe(me: MeResponse): AuthUser {
  return {
    email: me.email,
    fullName: me.fullName,
    role: me.role,
    phone: me.phone ?? undefined,
    shareAnalytics: me.shareAnalytics,
    marketingOptIn: me.marketingOptIn,
  };
}

function parseStoredUser(raw: string): AuthUser | null {
  try {
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (!parsed?.email) return null;
    return {
      email: parsed.email,
      fullName: parsed.fullName ?? '',
      role: parsed.role ?? 'USER',
      phone: parsed.phone ?? undefined,
      shareAnalytics: parsed.shareAnalytics ?? true,
      marketingOptIn: parsed.marketingOptIn ?? false,
    };
  } catch {
    return null;
  }
}

type AuthContextValue = {
  user: AuthUser | null;
  /** true sau khi đọc AsyncStorage xong (tránh flash sai user) */
  hydrated: boolean;
  signIn: (res: AuthResponse) => Promise<void>;
  signOut: () => Promise<void>;
  /** Đồng bộ từ server (GET /api/me). */
  refreshUser: () => Promise<void>;
  /** Sau PATCH profile/privacy — cập nhật state + storage. */
  applyMeProfile: (me: MeResponse) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAuthToken();
        const raw = await getUserProfile();
        if (token && raw) {
          const parsed = parseStoredUser(raw);
          if (parsed) setUser(parsed);
        }
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const persistUser = useCallback(async (u: AuthUser) => {
    await saveUserProfile(JSON.stringify(u));
    setUser(u);
  }, []);

  const applyMeProfile = useCallback(
    async (me: MeResponse) => {
      await persistUser(userFromMe(me));
    },
    [persistUser],
  );

  const refreshUser = useCallback(async () => {
    const me = await fetchMe();
    await persistUser(userFromMe(me));
  }, [persistUser]);

  const signIn = useCallback(async (res: AuthResponse) => {
    const u = userFromAuthResponse(res);
    await saveAuthToken(res.token);
    await persistUser(u);
  }, [persistUser]);

  const signOut = useCallback(async () => {
    await clearAuthToken();
    await clearUserProfile();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, hydrated, signIn, signOut, refreshUser, applyMeProfile }),
    [user, hydrated, signIn, signOut, refreshUser, applyMeProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/** Chữ hiển thị trên avatar (tên hoặc email). */
export function userInitial(u: AuthUser | null): string {
  if (!u) return '?';
  const n = u.fullName.trim();
  if (n.length) return n.charAt(0).toUpperCase();
  const e = u.email.trim();
  return e.length ? e.charAt(0).toUpperCase() : '?';
}
