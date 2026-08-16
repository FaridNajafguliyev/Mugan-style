import React, { useEffect, useState } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { ApiError } from "../../lib/api";
import type { InventoryRow } from "../../lib/types";

const Inventory: React.FC = () => {
  const { authFetch } = useAdminAuth();
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    authFetch<{ inventory: InventoryRow[] }>("/inventory")
      .then((data) => setRows(data.inventory))
      .finally(() => setLoading(false));
  };

  useEffect(load, [authFetch]);

  const handleSave = async (id: string) => {
    const value = Number(editing[id]);
    if (Number.isNaN(value) || value < 0) return;
    setError(null);
    try {
      await authFetch(`/inventory/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ stock: value }),
      });
      setEditing((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось обновить остаток");
    }
  };

  return (
    <div className="ms-admin-page">
      <h1 className="ms-admin-page__title">Склад</h1>
      {error && <p className="ms-admin-login__error">{error}</p>}

      {loading ? (
        <p>Загрузка…</p>
      ) : (
        <table className="ms-admin-table">
          <thead>
            <tr>
              <th>Товар</th>
              <th>SKU</th>
              <th>Остаток</th>
              <th>Резерв</th>
              <th>Доступно</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isEditing = row.id in editing;
              return (
                <tr key={row.id} style={{ cursor: "default" }}>
                  <td>{row.title}</td>
                  <td>{row.sku}</td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        min={0}
                        value={editing[row.id]}
                        onChange={(e) => setEditing((prev) => ({ ...prev, [row.id]: e.target.value }))}
                        style={{ width: 70 }}
                      />
                    ) : (
                      row.stock
                    )}
                  </td>
                  <td>{row.reserved}</td>
                  <td>{row.available}</td>
                  <td>
                    {isEditing ? (
                      <>
                        <button className="btn" onClick={() => handleSave(row.id)}>
                          Сохранить
                        </button>{" "}
                        <button
                          className="btn"
                          onClick={() =>
                            setEditing((prev) => {
                              const next = { ...prev };
                              delete next[row.id];
                              return next;
                            })
                          }
                        >
                          Отмена
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn"
                        onClick={() => setEditing((prev) => ({ ...prev, [row.id]: String(row.stock) }))}
                      >
                        Изменить
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Inventory;
