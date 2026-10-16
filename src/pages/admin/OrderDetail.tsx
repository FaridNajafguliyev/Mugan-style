import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { formatPrice, formatDate } from "../../lib/format";
import { ApiError } from "../../lib/api";
import {
  ORDER_STATUS_LABELS,
  VALID_TRANSITIONS,
  DELIVERY_STATUSES,
  DELIVERY_STATUS_LABELS,
  type AdminOrder,
  type OrderHistoryEntry,
  type OrderStatus,
  type DeliveryStatus,
} from "../../lib/types";

const OrderDetail: React.FC = () => {
  const { id } = useParams();
  const { authFetch } = useAdminAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [history, setHistory] = useState<OrderHistoryEntry[]>([]);
  const [nextStatus, setNextStatus] = useState<OrderStatus | "">("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [company, setCompany] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>("PENDING");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [deliveryError, setDeliveryError] = useState<string | null>(null);
  const [deliverySubmitting, setDeliverySubmitting] = useState(false);

  const load = () => {
    if (!id) return;
    authFetch<{ order: AdminOrder }>(`/orders/${id}`).then((data) => {
      setOrder(data.order);
      if (data.order.delivery) {
        setCompany(data.order.delivery.company ?? "");
        setTrackingNumber(data.order.delivery.trackingNumber ?? "");
        setDeliveryStatus(data.order.delivery.status);
        setDeliveryNotes(data.order.delivery.notes ?? "");
      }
    });
    authFetch<{ history: OrderHistoryEntry[] }>(`/orders/${id}/history`).then((data) =>
      setHistory(data.history),
    );
  };

  useEffect(load, [id, authFetch]);

  if (!order) return <p>Загрузка…</p>;

  const allowedNext = VALID_TRANSITIONS[order.status] ?? [];

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextStatus) return;
    setError(null);
    setSubmitting(true);
    try {
      await authFetch(`/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus, note: note || undefined }),
      });
      setNextStatus("");
      setNote("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось изменить статус");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm(`Удалить заказ ${order?.orderNumber}? Это действие нельзя отменить.`)) return;
    setDeleteError(null);
    setDeleting(true);
    try {
      await authFetch(`/orders/${id}`, { method: "DELETE" });
      navigate("/admin/orders");
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "Не удалось удалить заказ");
      setDeleting(false);
    }
  };

  const handleDeliverySave = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeliveryError(null);
    setDeliverySubmitting(true);
    try {
      await authFetch(`/delivery/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          company: company || undefined,
          trackingNumber: trackingNumber || undefined,
          status: deliveryStatus,
          notes: deliveryNotes || undefined,
        }),
      });
      load();
    } catch (err) {
      setDeliveryError(err instanceof ApiError ? err.message : "Не удалось сохранить доставку");
    } finally {
      setDeliverySubmitting(false);
    }
  };

  return (
    <div className="ms-admin-page ms-admin-detail">
      <Link to="/admin/orders" className="ms-admin-detail__back">
        ← Все заказы
      </Link>
      <h1 className="ms-admin-page__title">
        Заказ {order.orderNumber}{" "}
        <span className={`ms-admin-badge ms-admin-badge--${order.status.toLowerCase()}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </h1>

      <div className="ms-admin-detail__grid">
        <div>
          <div className="ms-admin-detail__card">
            <h3>Товары</h3>
            <div className="ms-admin-detail__items">
              {order.items.map((item, i) => (
                <div key={i} className="ms-admin-detail__item">
                  <span>
                    {item.titleSnapshot} · р. {item.size} × {item.qty}
                  </span>
                  <span>{formatPrice(item.priceKopecksSnapshot * item.qty, false)}</span>
                </div>
              ))}
            </div>
            <div className="ms-admin-detail__row">
              <span>Подытог</span>
              <span>{formatPrice(order.subtotalKopecks, false)}</span>
            </div>
            <div className="ms-admin-detail__row">
              <span>Доставка</span>
              <span>{formatPrice(order.deliveryFeeKopecks, false)}</span>
            </div>
            <div className="ms-admin-detail__row">
              <span>Итого</span>
              <span>
                <strong>{formatPrice(order.totalKopecks, false)}</strong>
              </span>
            </div>
          </div>

          <div className="ms-admin-detail__card">
            <h3>Клиент и доставка</h3>
            <div className="ms-admin-detail__row">
              <span>Имя</span>
              <span>{order.contactName}</span>
            </div>
            <div className="ms-admin-detail__row">
              <span>Телефон</span>
              <span>{order.contactPhone}</span>
            </div>
            <div className="ms-admin-detail__row">
              <span>Адрес</span>
              <span>
                {order.deliveryAddress.city}, {order.deliveryAddress.street} {order.deliveryAddress.house}
                {order.deliveryAddress.apartment ? `, кв. ${order.deliveryAddress.apartment}` : ""}
              </span>
            </div>
            {order.deliveryAddress.comment && (
              <div className="ms-admin-detail__row">
                <span>Комментарий</span>
                <span>{order.deliveryAddress.comment}</span>
              </div>
            )}
            <div className="ms-admin-detail__row">
              <span>Создан</span>
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>

          <div className="ms-admin-detail__card">
            <h3>Изменить статус</h3>
            {allowedNext.length === 0 ? (
              <p>Статус финальный — изменения недоступны.</p>
            ) : (
              <form className="ms-admin-detail__status-form" onSubmit={handleStatusChange}>
                <select
                  value={nextStatus}
                  onChange={(e) => setNextStatus(e.target.value as OrderStatus)}
                  required
                >
                  <option value="">Выберите статус…</option>
                  {allowedNext.map((s) => (
                    <option key={s} value={s}>
                      {ORDER_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                <textarea
                  placeholder="Комментарий (необязательно)"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <button type="submit" className="btn btn--gold" disabled={submitting}>
                  Сохранить
                </button>
              </form>
            )}
            {error && <p className="ms-admin-login__error">{error}</p>}
          </div>

          {(order.status === "CANCELLED" || order.status === "RETURNED") && (
            <div className="ms-admin-detail__card">
              <h3>Удаление</h3>
              <p>Заказ отменён/возвращён — его можно безвозвратно удалить (например, тестовый заказ).</p>
              <button className="btn" onClick={handleDelete} disabled={deleting}>
                Удалить заказ
              </button>
              {deleteError && <p className="ms-admin-login__error">{deleteError}</p>}
            </div>
          )}

          <div className="ms-admin-detail__card">
            <h3>Доставка</h3>
            <form className="ms-admin-detail__status-form" onSubmit={handleDeliverySave}>
              <input
                type="text"
                placeholder="Служба доставки (СДЭК, Boxberry…)"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                style={{ minWidth: 220 }}
              />
              <input
                type="text"
                placeholder="Трек-номер"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                style={{ minWidth: 180 }}
              />
              <select value={deliveryStatus} onChange={(e) => setDeliveryStatus(e.target.value as DeliveryStatus)}>
                {DELIVERY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {DELIVERY_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Заметки по доставке"
                rows={2}
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
              />
              <button type="submit" className="btn btn--gold" disabled={deliverySubmitting}>
                Сохранить
              </button>
            </form>
            {deliveryError && <p className="ms-admin-login__error">{deliveryError}</p>}
          </div>
        </div>

        <div className="ms-admin-detail__card">
          <h3>История статусов</h3>
          <div className="ms-admin-detail__timeline">
            {history.map((h) => (
              <div key={h._id} className="ms-admin-detail__timeline-item">
                <div>
                  <strong>
                    {h.fromStatus ? `${ORDER_STATUS_LABELS[h.fromStatus]} → ` : ""}
                    {ORDER_STATUS_LABELS[h.toStatus]}
                  </strong>
                  <span>
                    {formatDate(h.createdAt)} · {h.changedByLabel}
                  </span>
                  {h.note && <span>{h.note}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
