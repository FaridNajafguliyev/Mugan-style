import React, { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { ApiError } from "../../lib/api";
import "../../styles/admin.scss";

const Login: React.FC = () => {
  const { user, login, loading } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/admin/dashboard";
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      await login(String(form.get("email") ?? ""), String(form.get("password") ?? ""));
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось войти");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ms-admin-login">
      <div className="ms-admin-login__card">
        <h1 className="ms-admin-login__title">Mugan Style Admin</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input type="email" name="email" required autoComplete="username" />
          </label>
          <label>
            Пароль
            <input type="password" name="password" required autoComplete="current-password" />
          </label>
          {error && <p className="ms-admin-login__error">{error}</p>}
          <button type="submit" className="btn btn--gold" disabled={submitting}>
            {submitting ? "Входим…" : "Войти"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
