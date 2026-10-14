import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import "../styles/admin.scss";

const links = [
  { to: "/admin/dashboard", label: "Дашборд" },
  { to: "/admin/orders", label: "Заказы" },
  { to: "/admin/products", label: "Товары" },
  { to: "/admin/inventory", label: "Склад" },
  { to: "/admin/customers", label: "Клиенты" },
  { to: "/admin/delivery", label: "Доставка" },
  { to: "/admin/settings", label: "Настройки" },
];

const AdminLayout: React.FC = () => {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="ms-admin">
      <aside className={`ms-admin__sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="ms-admin__brand">
          <span className="ms-admin__brand-mark">MS</span>
          <span>Admin</span>
          <button
            className="ms-admin__sidebar-close"
            onClick={closeSidebar}
            aria-label="Закрыть меню"
          >
            ✕
          </button>
        </div>
        <nav>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={closeSidebar}
              className={({ isActive }) => `ms-admin__nav-link ${isActive ? "is-active" : ""}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {sidebarOpen && <div className="ms-admin__backdrop" onClick={closeSidebar} />}

      <div className="ms-admin__main">
        <header className="ms-admin__topbar">
          <button
            className="ms-admin__burger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Открыть меню"
          >
            <span />
            <span />
            <span />
          </button>
          <span className="ms-admin__user">
            {user?.name} <em>({user?.role === "admin" ? "администратор" : "продавец"})</em>
          </span>
          <button className="ms-admin__logout" onClick={handleLogout}>
            Выйти
          </button>
        </header>
        <main className="ms-admin__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
