import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";
import "./Header.scss";

const links = [
  { to: "/", label: "Главная" },
  { to: "/catalog", label: "Каталог" },
  { to: "/about", label: "О бренде" },
  { to: "/contact", label: "Контакты" },
];

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { count, open: openCart } = useCart();
  const { ids: favoriteIds } = useFavorites();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`ms-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="ms-header__bar container">
        <NavLink to="/" className="ms-header__brand" onClick={close}>
          <span className="ms-header__brand-mark">MS</span>
          <span className="ms-header__brand-text">
            Mugan <em>Style</em>
          </span>
        </NavLink>

        <nav className="ms-header__nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) => `ms-header__link ${isActive ? "is-active" : ""}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <button className="ms-header__cta" onClick={() => navigate("/contact")}>
          Заказать консультацию
        </button>

        <NavLink to="/favorites" className="ms-header__cart" aria-label="Избранное">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 20.3s-7.2-4.4-9.6-8.9C.8 7.9 2.1 4.6 5.3 3.7c2-.5 4 .3 5.2 2l1.5 2.1 1.5-2.1c1.2-1.7 3.2-2.5 5.2-2 3.2.9 4.5 4.2 3 7.7-2.4 4.5-9.7 8.9-9.7 8.9z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          {favoriteIds.length > 0 && <span className="ms-header__cart-badge">{favoriteIds.length}</span>}
        </NavLink>

        <button className="ms-header__cart" onClick={openCart} aria-label="Открыть корзину">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6 6h15l-1.5 9h-12L6 3H3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="9.5" cy="20" r="1.3" fill="currentColor" />
            <circle cx="18" cy="20" r="1.3" fill="currentColor" />
          </svg>
          {count > 0 && <span className="ms-header__cart-badge">{count}</span>}
        </button>

        <button
          className={`ms-header__burger ${open ? "is-open" : ""}`}
          aria-label="Открыть меню"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>

      <div className={`ms-header__drawer ${open ? "is-open" : ""}`}>
        <nav>
          {links.map((l, i) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              onClick={close}
              className="ms-header__drawer-link"
              style={{ transitionDelay: `${open ? 80 + i * 60 : 0}ms` }}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button className="btn btn--gold" onClick={() => { navigate("/contact"); close(); }}>
          Заказать консультацию
        </button>
        <div className="ms-header__drawer-foot">
          <span>+7 926 593 98 80</span>
        </div>
      </div>
      {open && <div className="ms-header__backdrop" onClick={close} />}
    </header>
  );
};

export default Header;
