import React, { useState } from "react";
import Reveal from "../components/Reveal/Reveal";
import { apiFetch } from "../lib/api";
import "./Contact.scss";

const Contact: React.FC = () => {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      await apiFetch("/customers/leads", {
        method: "POST",
        body: JSON.stringify({
          name: String(form.get("name") ?? ""),
          phone: String(form.get("phone") ?? ""),
          model: String(form.get("model") ?? "") || undefined,
          message: String(form.get("message") ?? "") || undefined,
        }),
      });
      setSent(true);
    } catch {
      setError("Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ms-contact-page">
      <section className="ms-contact-hero">
        <div className="container">
          <Reveal>
            <span className="eyebrow eyebrow--dark">Контакты</span>
          </Reveal>
          <Reveal delay={80}>
            <h1>
              Запишитесь <em>в шоурум</em>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p>
              Поможем подобрать модель, размер и цвет — лично или по видеосвязи.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container ms-contact-layout">
        <Reveal as="div" className="ms-contact-info">
          <div>
            <span className="eyebrow">Адрес</span>
            <p>Москва, м. Люблино</p>
            <p className="ms-contact-info__muted">
              Шоурум работает по предварительной записи
            </p>
          </div>
          <div>
            <span className="eyebrow">Телефон</span>
            <a href="tel:+79265939880">МОБ: +7 926 593 98 80</a>
            <a href="tel:+79645939880">МОБ: +7 964 593 98 80</a>
            <a href="mailto:rafael-1969@mail.ru">ПОЧТА: rafael-1969@mail.ru</a>
          </div>
          <div>
            <span className="eyebrow">Соцсети</span>
            <div className="ms-contact-info__socials">
              <a href="#">Instagram</a>
              <a href="#">WhatsApp</a>
              <a href="#">Telegram</a>
            </div>
          </div>
          <div>
            <span className="eyebrow">Часы работы</span>
            <p>Пн–Сб: 10:00 — 20:00</p>
            <p>Вс: по записи</p>
          </div>
        </Reveal>

        <Reveal as="div" delay={120} className="ms-contact-form-wrap">
          {sent ? (
            <div className="ms-contact-success">
              <h3>Заявка отправлена</h3>
              <p>
                Мы свяжемся с вами в течение рабочего дня, чтобы согласовать
                время визита.
              </p>
            </div>
          ) : (
            <form className="ms-contact-form" onSubmit={handleSubmit}>
              <label>
                Имя
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Ваше имя"
                />
              </label>
              <label>
                Телефон
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+7 ___ ___ __ __"
                />
              </label>
              <label>
                Интересующая модель
                <input
                  type="text"
                  name="model"
                  placeholder="Например, Yantar"
                />
              </label>
              <label>
                Комментарий
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Расскажите о ваших пожеланиях"
                />
              </label>
              {error && <p className="ms-contact-form__error">{error}</p>}
              <button type="submit" className="btn btn--gold" disabled={submitting}>
                {submitting ? "Отправляем…" : "Отправить заявку"}
              </button>
              <p className="ms-contact-form__note">
                Нажимая кнопку, вы соглашаетесь с обработкой персональных
                данных.
              </p>
            </form>
          )}
        </Reveal>
      </section>

      <section className="ms-contact-map">
        <div className="ms-contact-map__placeholder">
          <span>Москва, м. Люблино</span>
        </div>
      </section>
    </div>
  );
};

export default Contact;
