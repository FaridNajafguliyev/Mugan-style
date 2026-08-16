import React, { useEffect, useState } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { formatPrice } from "../../lib/format";
import { ORDER_STATUS_LABELS, type OrderStatus } from "../../lib/types";

interface StatsResponse {
  counts: Record<OrderStatus, number>;
  totalRevenueKopecks: number;
}

const DASHBOARD_STATUSES: OrderStatus[] = [
  "NEW",
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_DISPATCH",
  "DISPATCHED_FROM_WAREHOUSE",
  "HANDED_TO_DELIVERY",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
];

const Dashboard: React.FC = () => {
  const { authFetch } = useAdminAuth();
  const [stats, setStats] = useState<StatsResponse | null>(null);

  useEffect(() => {
    authFetch<StatsResponse>("/dashboard/stats").then(setStats);
  }, [authFetch]);

  return (
    <div className="ms-admin-page">
      <h1 className="ms-admin-page__title">Дашборд</h1>

      {stats && (
        <div className="ms-admin-stats">
          <div className="ms-admin-stat-card ms-admin-stat-card--revenue">
            <span>Выручка (оплаченные заказы)</span>
            <strong>{formatPrice(stats.totalRevenueKopecks, false)}</strong>
          </div>
          {DASHBOARD_STATUSES.map((status) => (
            <div key={status} className="ms-admin-stat-card">
              <span>{ORDER_STATUS_LABELS[status]}</span>
              <strong>{stats.counts[status] ?? 0}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
