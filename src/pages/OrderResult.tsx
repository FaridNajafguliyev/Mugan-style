import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Reveal from "../components/Reveal/Reveal";
import { apiFetch } from "../lib/api";
import { formatPrice } from "../lib/format";
import "./OrderResult.scss";

interface OrderStatusResponse {
  orderNumber: string;
  status: string;
  totalKopecks: number;
}

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 90_000;

const OrderResult: React.FC = () => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState<OrderStatusResponse | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const startRef = useRef(Date.now());

  useEffect(() => {
    if (!orderNumber) return;
    let cancelled = false;

    const poll = async () => {
      try {
        const data = await apiFetch<OrderStatusResponse>(`/orders/by-number/${orderNumber}`);
        if (cancelled) return;
        setOrder(data);
        if (data.status === "PENDING_PAYMENT" && Date.now() - startRef.current < POLL_TIMEOUT_MS) {
          setTimeout(poll, POLL_INTERVAL_MS);
        } else if (data.status === "PENDING_PAYMENT") {
          setTimedOut(true);
        }
      } catch {
        if (!cancelled) setTimedOut(true);
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [orderNumber]);

  const isPaid = order && order.status !== "PENDING_PAYMENT" && order.status !== "CANCELLED";
  const isCancelled = order?.status === "CANCELLED";

  return (
    <div className="ms-order-result-page">
      <section className="ms-order-result-hero">
        <div className="container">
          <Reveal>
            <span className="eyebrow eyebrow--dark">Оплата заказа</span>
          </Reveal>
          <Reveal delay={80}>
            <h1>
              Заказ <em>{orderNumber}</em>
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="container ms-order-result-body">
        {isPaid && (
          <div className="ms-order-result-card ms-order-result-card--success">
            <h3>Оплата прошла успешно</h3>
            <p>
              Спасибо за заказ! Мы получили оплату на сумму{" "}
              {order && formatPrice(order.totalKopecks, false)} и уже готовим его к отправке.
            </p>
            <Link to="/catalog" className="btn btn--gold">
              Вернуться в каталог
            </Link>
          </div>
        )}

        {isCancelled && (
          <div className="ms-order-result-card ms-order-result-card--failed">
            <h3>Оплата не прошла</h3>
            <p>Заказ отменён — оплата не была подтверждена. Вы можете оформить заказ ещё раз.</p>
            <Link to="/catalog" className="btn btn--gold">
              Вернуться в каталог
            </Link>
          </div>
        )}

        {!isPaid && !isCancelled && !timedOut && (
          <div className="ms-order-result-card">
            <h3>Проверяем оплату…</h3>
            <p>Это займёт несколько секунд. Не закрывайте страницу.</p>
          </div>
        )}

        {!isPaid && !isCancelled && timedOut && (
          <div className="ms-order-result-card">
            <h3>Не удалось подтвердить оплату</h3>
            <p>
              Свяжитесь с нами, указав номер заказа {orderNumber} — мы проверим статус оплаты
              вручную.
            </p>
            <a href="tel:+79265939880" className="btn btn--gold">
              +7 926 593 98 80
            </a>
          </div>
        )}
      </section>
    </div>
  );
};

export default OrderResult;
