"use client";

/**
 * Bearer-token auth for the VeraDoc frontend.
 *
 * Replaces NextAuth: tokens live in localStorage (via `tokenStore`), the user
 * profile + credit balance are hydrated from `GET /api/auth/me`. The api client
 * handles 401 -> refresh transparently; if refresh fails it emits
 * `veradoc:unauthorized`, which we catch here to drop the session.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { api, tokenStore, type Me } from "@/lib/api";

type AuthContextValue = {
  user: Me | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<Me>;
  register: (input: {
    name: string;
    organisation: string;
    email: string;
    password: string;
  }) => Promise<{ devOtp?: string }>;
  logout: () => void;
  /** Re-fetch the profile — call after a credit purchase or a verification. */
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<Me | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate session on mount if a token is present.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!tokenStore.getAccess()) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await api.me();
        if (!cancelled) setUser(me);
      } catch {
        tokenStore.clear();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Drop the session when a token refresh ultimately fails.
  useEffect(() => {
    const onUnauthorized = () => {
      tokenStore.clear();
      setUser(null);
      router.push("/auth/login");
    };
    window.addEventListener("veradoc:unauthorized", onUnauthorized);
    return () =>
      window.removeEventListener("veradoc:unauthorized", onUnauthorized);
  }, [router]);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await api.login({ email, password });
    tokenStore.set(tokens);
    const me = await api.me();
    setUser(me);
    return me;
  }, []);

  const register = useCallback(
    async (input: {
      name: string;
      organisation: string;
      email: string;
      password: string;
    }) => {
      const reg = await api.register(input);
      const tokens = await api.login({
        email: input.email,
        password: input.password,
      });
      tokenStore.set(tokens);
      const me = await api.me();
      setUser(me);
      return { devOtp: reg.devOtp };
    },
    []
  );

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    router.push("/auth/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    if (!tokenStore.getAccess()) return;
    try {
      const me = await api.me();
      setUser(me);
    } catch {
      /* ignore — a stale balance is harmless */
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
