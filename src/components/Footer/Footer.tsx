import React from "react";
import { NavLink } from "react-router-dom";
import "./Footer.scss";

const Footer: React.FC = () => {
  return (
    <footer className="ms-footer">
      <div className="container ms-footer__top">
        <div className="ms-footer__brand">
          <span className="ms-footer__brand-text">
            Mugan <em>Style</em>
          </span>
          <p>
            Дублёнки из натуральной кожи и овчины.
            Пошив и подбор размера в шоуруме в Москве.
          </p>
        </div>

        <div className="ms-footer__col">
          <h4 className="eyebrow eyebrow--dark">Навигация</h4>
          <NavLink to="/catalog">Каталог</NavLink>
          <NavLink to="/about">О бренде</NavLink>
          <NavLink to="/contact">Контакты</NavLink>
          <NavLink to="/track-order">Отследить заказ</NavLink>
        </div>

        <div className="ms-footer__col">
          <h4 className="eyebrow eyebrow--dark">Контакты</h4>
          <a href="tel:+79265939880">МОБ: +7 926 593 98 80</a>
          <a href="tel:+79645939880">МОБ: +7 964 593 98 80</a>
          <a href="mailto:rafael-1969@mail.ru">ПОЧТА: rafael-1969@mail.ru</a>

          <div className="ms-footer__socials">
            <a href="#" aria-label="Instagram">Instagram</a>
            <a href="#" aria-label="WhatsApp">WhatsApp</a>
            <a href="#" aria-label="Telegram">Telegram</a>
          </div>
        </div>
      </div>

      <div className="container ms-footer__bottom">
        <span>© {new Date().getFullYear()} Mugan Style. Все права защищены.</span>
        <NavLink to="/requisites">Реквизиты</NavLink>
        <NavLink to="/oferta">Оферта</NavLink>
        <NavLink to="/privacy">Конфиденциальность</NavLink>
        <NavLink to="/returns">Возврат и обмен</NavLink>
        <span>Москва</span>
      </div>
    </footer>
  );
};

export default Footer;
