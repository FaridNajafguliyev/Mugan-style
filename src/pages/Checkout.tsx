import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import Reveal from "../components/Reveal/Reveal";
import { useCart } from "../context/CartContext";
import { apiFetch, ApiError } from "../lib/api";
import { formatPrice } from "../lib/format";
import "./Checkout.scss";

interface CreateOrderResponse {
  orderNumber: string;
  status: string;
  totalKopecks: number;
  confirmationUrl: string;
}

const Checkout: React.FC = () => {
  const { items, subtotalKopecks, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    try {
      const data = await apiFetch<CreateOrderResponse>("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.id, size: i.size, qty: i.qty })),
          contactName: String(form.get("name") ?? ""),
          contactPhone: String(form.get("phone") ?? ""),
          deliveryAddress: {
            city: String(form.get("city") ?? ""),
            street: String(form.get("street") ?? ""),
            house: String(form.get("house") ?? ""),
            apartment: String(form.get("apartment") ?? "") || undefined,
            comment: String(form.get("comment") ?? "") || undefined,
          },
        }),
      });
      clear();
      setRedirecting(true);
      window.location.href = data.confirmationUrl;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось оформить заказ. Попробуйте ещё раз.");
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !redirecting) return <Navigate to="/catalog" replace />;

  return (
    <div className="ms-checkout-page">
      <section className="ms-checkout-hero">
        <div className="container">
          <Reveal>
            <span className="eyebrow eyebrow--dark">Оформление заказа</span>
          </Reveal>
          <Reveal delay={80}>
            <h1>
              Данные <em>доставки</em>
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="container ms-checkout-layout">
        {redirecting ? (
          <div className="ms-checkout-success">
            <h3>Переходим к оплате…</h3>
            <p>Сейчас откроется страница оплаты YooKassa.</p>
          </div>
        ) : (
          <>
            <Reveal as="div" className="ms-checkout-summary">
              <h3>Ваш заказ</h3>
              <div className="ms-checkout-summary__list">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="ms-checkout-summary__item">
                    <img src={item.image} alt={item.title} />
                    <div>
                      <span className="ms-checkout-summary__title">{item.title}</span>
                      <span className="ms-checkout-summary__meta">
                        Размер {item.size} · {item.qty} × {formatPrice(item.priceKopecks, false)}
                      </span>
                    </div>
                    <span className="ms-checkout-summary__line-total">
                      {formatPrice(item.priceKopecks * item.qty, false)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="ms-checkout-summary__total">
                <span>Итого</span>
                <strong>{formatPrice(subtotalKopecks, false)}</strong>
              </div>
            </Reveal>

            <Reveal as="div" delay={100} className="ms-checkout-form-wrap">
              <form className="ms-checkout-form" onSubmit={handleSubmit}>
                <label>
                  Имя
                  <input type="text" name="name" required placeholder="Ваше имя" />
                </label>
                <label>
                  Телефон
                  <input type="tel" name="phone" required placeholder="+7 ___ ___ __ __" />
                </label>
                <div className="ms-checkout-form__row">
                  <label>
                    Город
                    <input type="text" name="city" required placeholder="Москва" />
                  </label>
                  <label>
                    Улица
                    <input type="text" name="street" required placeholder="Тверская" />
                  </label>
                </div>
                <div className="ms-checkout-form__row">
                  <label>
                    Дом
                    <input type="text" name="house" required placeholder="1" />
                  </label>
                  <label>
                    Квартира
                    <input type="text" name="apartment" placeholder="Необязательно" />
                  </label>
                </div>
                <label>
                  Комментарий к доставке
                  <textarea name="comment" rows={3} placeholder="Например, код домофона" />
                </label>

                {error && <p className="ms-checkout-form__error">{error}</p>}

                <button type="submit" className="btn btn--gold" disabled={submitting}>
                  {submitting ? "Оформляем…" : "Перейти к оплате"}
                </button>
                <p className="ms-checkout-form__note">
                  Оплата — только онлайн. Заказ подтверждается после успешной оплаты.
                </p>
              </form>
            </Reveal>
          </>
        )}
      </section>
    </div>
  );
};

export default Checkout;
