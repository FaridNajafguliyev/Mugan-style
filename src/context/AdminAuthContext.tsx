import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { apiFetch, ApiError } from "../lib/api";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "seller";
}

interface LoginResponse {
  accessToken: string;
  user: AdminUser;
}

interface AdminAuthContextValue {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authFetch: <T>(path: string, options?: RequestInit) => Promise<T>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const accessTokenRef = useRef<string | null>(null);

  const restoreSession = useCallback(() => {
    return apiFetch<LoginResponse>("/auth/refresh", { method: "POST" })
      .then((data) => {
        accessTokenRef.current = data.accessToken;
        setUser(data.user);
        return data.accessToken;
      })
      .catch(() => {
        accessTokenRef.current = null;
        setUser(null);
        return null;
      });
  }, []);

  useEffect(() => {
    restoreSession().finally(() => setLoading(false));
  }, [restoreSession]);

  const login = async (email: string, password: string) => {
    const data = await apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    accessTokenRef.current = data.accessToken;
    setUser(data.user);
  };

  const logout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      accessTokenRef.current = null;
      setUser(null);
    }
  };

  // Authenticated request helper — retries once with a freshly refreshed
  // access token on 401 (the 15-minute token silently expiring mid-session
  // shouldn't kick the admin back to the login screen for every request).
  const authFetch = useCallback(
    async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
      try {
        return await apiFetch<T>(path, { ...options, token: accessTokenRef.current });
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          const refreshed = await restoreSession();
          if (refreshed) {
            return apiFetch<T>(path, { ...options, token: refreshed });
          }
        }
        throw err;
      }
    },
    [restoreSession],
  );

  return (
    <AdminAuthContext.Provider value={{ user, loading, login, logout, authFetch }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}

export const AdminAuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return <>{children}</>;
};
