import React, { useState } from "react";
import Reveal from "../components/Reveal/Reveal";
import OrderTimeline from "../components/OrderTimeline/OrderTimeline";
import { apiFetch, ApiError } from "../lib/api";
import { formatPrice, formatDate } from "../lib/format";
import type { OrderStatus } from "../lib/types";
import "./TrackOrder.scss";

interface TrackedOrder {
  orderNumber: string;
  status: OrderStatus;
  totalKopecks: number;
  items: { title: string; size: string; qty: number; image?: string }[];
  createdAt: string;
}

const TrackOrder: React.FC = () => {
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setOrder(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      const data = await apiFetch<{ order: TrackedOrder }>("/orders/track", {
        method: "POST",
        body: JSON.stringify({
          orderNumber: String(form.get("orderNumber") ?? "").trim(),
          phone: String(form.get("phone") ?? "").trim(),
        }),
      });
      setOrder(data.order);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Не удалось найти заказ. Попробуйте ещё раз.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ms-track-page">
      <section className="ms-track-hero">
        <div className="container">
          <Reveal>
            <span className="eyebrow eyebrow--dark">Статус заказа</span>
          </Reveal>
          <Reveal delay={80}>
            <h1>
              Отследить <em>заказ</em>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p>Введите номер заказа и телефон, указанный при оформлении.</p>
          </Reveal>
        </div>
      </section>

      <section className="container ms-track-layout">
        <Reveal as="div" className="ms-track-form-wrap">
          <form className="ms-track-form" onSubmit={handleSubmit}>
            <label>
              Номер заказа
              <input type="text" name="orderNumber" required placeholder="ORD-2026-000123" />
            </label>
            <label>
              Телефон
              <input type="tel" name="phone" required placeholder="+7 ___ ___ __ __" />
            </label>
            {error && <p className="ms-track-form__error">{error}</p>}
            <button type="submit" className="btn btn--gold" disabled={submitting}>
              {submitting ? "Ищем…" : "Найти заказ"}
            </button>
          </form>
        </Reveal>

        {order && (
          <Reveal as="div" delay={100} className="ms-track-result">
            <h3>
              Заказ {order.orderNumber} · {formatPrice(order.totalKopecks, false)}
            </h3>
            <p className="ms-track-result__date">Оформлен {formatDate(order.createdAt)}</p>
            <div className="ms-track-result__items">
              {order.items.map((item, i) => (
                <span key={i}>
                  {item.title} · р. {item.size} × {item.qty}
                </span>
              ))}
            </div>
            <OrderTimeline status={order.status} />
          </Reveal>
        )}
      </section>
    </div>
  );
};

export default TrackOrder;
