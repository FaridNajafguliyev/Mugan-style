import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { DELIVERY_STATUS_LABELS, ORDER_STATUS_LABELS, type Delivery as DeliveryType } from "../../lib/types";

const Delivery: React.FC = () => {
  const { authFetch } = useAdminAuth();
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<DeliveryType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch<{ deliveries: DeliveryType[] }>("/delivery")
      .then((data) => setDeliveries(data.deliveries))
      .finally(() => setLoading(false));
  }, [authFetch]);

  if (loading) return <p>Загрузка…</p>;

  return (
    <div className="ms-admin-page">
      <h1 className="ms-admin-page__title">Доставка</h1>

      {deliveries.length === 0 ? (
        <p>
          Данных о доставке пока нет — они появляются, когда администратор заполняет доставку в
          карточке заказа.
        </p>
      ) : (
        <table className="ms-admin-table">
          <thead>
            <tr>
              <th>Заказ</th>
              <th>Клиент</th>
              <th>Служба доставки</th>
              <th>Трек-номер</th>
              <th>Статус доставки</th>
              <th>Статус заказа</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((d) => {
              const order = typeof d.order === "object" ? d.order : null;
              return (
                <tr
                  key={d._id}
                  onClick={() => order && navigate(`/admin/orders/${order._id}`)}
                >
                  <td>{order?.orderNumber ?? "—"}</td>
                  <td>{order?.contactName ?? "—"}</td>
                  <td>{d.company ?? "—"}</td>
                  <td>{d.trackingNumber ?? "—"}</td>
                  <td>{DELIVERY_STATUS_LABELS[d.status]}</td>
                  <td>{order ? ORDER_STATUS_LABELS[order.status] : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Delivery;
