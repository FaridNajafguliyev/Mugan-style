import React, { useEffect, useState } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { formatPrice, formatDate } from "../../lib/format";
import type { AdminCustomerRow, ContactLead } from "../../lib/types";

const Customers: React.FC = () => {
  const { authFetch } = useAdminAuth();
  const [customers, setCustomers] = useState<AdminCustomerRow[]>([]);
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authFetch<{ customers: AdminCustomerRow[] }>("/customers"),
      authFetch<{ leads: ContactLead[] }>("/customers/leads"),
    ])
      .then(([c, l]) => {
        setCustomers(c.customers);
        setLeads(l.leads);
      })
      .finally(() => setLoading(false));
  }, [authFetch]);

  if (loading) return <p>Загрузка…</p>;

  return (
    <div className="ms-admin-page">
      <h1 className="ms-admin-page__title">Клиенты</h1>

      {customers.length === 0 ? (
        <p>Клиентов пока нет.</p>
      ) : (
        <table className="ms-admin-table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Телефон</th>
              <th>Email</th>
              <th>Заказов</th>
              <th>Сумма покупок</th>
              <th>Первый контакт</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c._id} style={{ cursor: "default" }}>
                <td>{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.email ?? "—"}</td>
                <td>{c.ordersCount}</td>
                <td>{formatPrice(c.totalSpentKopecks, false)}</td>
                <td>{formatDate(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 style={{ marginTop: 40, marginBottom: 16, fontFamily: "var(--font-display)", fontSize: 22 }}>
        Заявки с сайта
      </h2>
      {leads.length === 0 ? (
        <p>Заявок пока нет.</p>
      ) : (
        <table className="ms-admin-table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Телефон</th>
              <th>Модель</th>
              <th>Сообщение</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l._id} style={{ cursor: "default" }}>
                <td>{l.name}</td>
                <td>{l.phone}</td>
                <td>{l.model ?? "—"}</td>
                <td style={{ whiteSpace: "normal", maxWidth: 320 }}>{l.message ?? "—"}</td>
                <td>{formatDate(l.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Customers;
