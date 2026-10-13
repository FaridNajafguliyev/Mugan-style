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
  ensureSessionChecked: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

const isAdminPath = () => window.location.pathname.startsWith("/admin");

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  // Only the admin panel ever needs a session — starting this true on public
  // pages would mean every visitor's browser fires a doomed /auth/refresh
  // on load. Admin routes still get a correct `loading` via ensureSessionChecked.
  const [loading, setLoading] = useState(isAdminPath);
  const accessTokenRef = useRef<string | null>(null);
  const checkPromiseRef = useRef<Promise<void> | null>(null);

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

  // Idempotent — the actual network call only ever fires once per page load,
  // no matter how many callers (the provider's own mount effect, the guard,
  // a client-side navigation into /admin without a full reload) ask for it.
  const ensureSessionChecked = useCallback((): Promise<void> => {
    if (!checkPromiseRef.current) {
      checkPromiseRef.current = restoreSession()
        .then(() => undefined)
        .finally(() => setLoading(false));
    }
    return checkPromiseRef.current;
  }, [restoreSession]);

  useEffect(() => {
    if (isAdminPath()) ensureSessionChecked();
  }, [ensureSessionChecked]);

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
    <AdminAuthContext.Provider value={{ user, loading, login, logout, authFetch, ensureSessionChecked }}>
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
  const { user, ensureSessionChecked } = useAdminAuth();
  const location = useLocation();
  // Own "checking" state rather than trusting the provider's `loading` —
  // that flag may already be settled (false) from an earlier public-page
  // mount if this guard is reached via client-side navigation rather than
  // a fresh load, which would otherwise redirect to login before the
  // (still-pending) session check for this route has actually run.
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    ensureSessionChecked().then(() => {
      if (!cancelled) setChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, [ensureSessionChecked]);

  if (checking) return null;
  if (!user) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return <>{children}</>;
};
