"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api } from "./api";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const t = localStorage.getItem("token");
      if (!t) { setUser(null); setToken(null); return; }
      setToken(t);
      const profile = await api.getProfile();
      setUser(profile);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => { refresh().finally(() => setLoading(false)); }, [refresh]);

  const login = async (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    await refresh();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
