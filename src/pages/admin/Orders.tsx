import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { formatPrice, formatDate } from "../../lib/format";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type AdminOrder, type OrderStatus } from "../../lib/types";

interface OrdersResponse {
  orders: AdminOrder[];
  total: number;
  page: number;
  limit: number;
}

const PAGE_SIZE = 20;

const Orders: React.FC = () => {
  const { authFetch } = useAdminAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => setPage(1), [statusFilter]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (statusFilter) params.set("status", statusFilter);
    authFetch<OrdersResponse>(`/orders?${params}`)
      .then((data) => {
        setOrders(data.orders);
        setTotal(data.total);
      })
      .finally(() => setLoading(false));
  }, [authFetch, statusFilter, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="ms-admin-page">
      <h1 className="ms-admin-page__title">Заказы</h1>

      <div className="ms-admin-filters">
        <button className={!statusFilter ? "is-active" : ""} onClick={() => setStatusFilter(null)}>
          Все
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            className={statusFilter === s ? "is-active" : ""}
            onClick={() => setStatusFilter(s)}
          >
            {ORDER_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Загрузка…</p>
      ) : orders.length === 0 ? (
        <p>Заказов не найдено.</p>
      ) : (
        <table className="ms-admin-table">
          <thead>
            <tr>
              <th>Номер</th>
              <th>Клиент</th>
              <th>Телефон</th>
              <th>Статус</th>
              <th>Сумма</th>
              <th>Создан</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} onClick={() => navigate(`/admin/orders/${order._id}`)}>
                <td>{order.orderNumber}</td>
                <td>{order.contactName}</td>
                <td>{order.contactPhone}</td>
                <td>
                  <span className={`ms-admin-badge ms-admin-badge--${order.status.toLowerCase()}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </td>
                <td>{formatPrice(order.totalKopecks, false)}</td>
                <td>{formatDate(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && totalPages > 1 && (
        <div className="ms-admin-filters" style={{ marginTop: 20 }}>
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            ← Назад
          </button>
          <span style={{ alignSelf: "center", fontSize: 13, color: "var(--sand-dim)" }}>
            Страница {page} из {totalPages}
          </span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Вперёд →
          </button>
        </div>
      )}
    </div>
  );
};

export default Orders;
