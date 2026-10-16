import React, { useEffect, useState } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { ApiError } from "../../lib/api";
import type { InventoryProductGroup } from "../../lib/types";

const Inventory: React.FC = () => {
  const { authFetch } = useAdminAuth();
  const [groups, setGroups] = useState<InventoryProductGroup[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [addingFor, setAddingFor] = useState<string | null>(null);
  const [newSize, setNewSize] = useState("");
  const [newStock, setNewStock] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    authFetch<{ inventory: InventoryProductGroup[] }>("/inventory")
      .then((data) => setGroups(data.inventory))
      .finally(() => setLoading(false));
  };

  useEffect(load, [authFetch]);

  const key = (productId: string, size: string) => `${productId}:${size}`;

  const filteredGroups = groups.filter((g) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return g.title.toLowerCase().includes(q) || g.sku.toLowerCase().includes(q);
  });

  const handleSaveSize = async (productId: string, size: string, reserved: number) => {
    const k = key(productId, size);
    const availableValue = Number(editing[k]);
    if (Number.isNaN(availableValue) || availableValue < 0) return;
    setError(null);
    setBusyKey(k);
    try {
      // The admin only ever sees/sets "available to sell" — reserved (units
      // tied up in a pending order) stays invisible bookkeeping, so the
      // actual stored stock has it added back in here.
      await authFetch(`/inventory/${productId}/sizes/${encodeURIComponent(size)}`, {
        method: "PATCH",
        body: JSON.stringify({ stock: availableValue + reserved }),
      });
      setEditing((prev) => {
        const next = { ...prev };
        delete next[k];
        return next;
      });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось обновить остаток");
    } finally {
      setBusyKey(null);
    }
  };

  const handleAddSize = async (productId: string) => {
    const size = newSize.trim();
    const stock = Number(newStock);
    if (!size || Number.isNaN(stock) || stock < 0) return;
    setError(null);
    setBusyKey(productId);
    try {
      await authFetch(`/inventory/${productId}/sizes`, {
        method: "POST",
        body: JSON.stringify({ size, stock }),
      });
      setAddingFor(null);
      setNewSize("");
      setNewStock("0");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось добавить размер");
    } finally {
      setBusyKey(null);
    }
  };

  const handleRemoveSize = async (productId: string, size: string) => {
    if (!window.confirm(`Удалить размер ${size}?`)) return;
    const k = key(productId, size);
    setError(null);
    setBusyKey(k);
    try {
      await authFetch(`/inventory/${productId}/sizes/${encodeURIComponent(size)}`, { method: "DELETE" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось удалить размер");
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="ms-admin-page">
      <h1 className="ms-admin-page__title">Склад</h1>

      <input
        type="text"
        className="ms-inventory-search"
        placeholder="Поиск по модели или артикулу…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && <p className="ms-admin-login__error">{error}</p>}

      {loading ? (
        <p>Загрузка…</p>
      ) : filteredGroups.length === 0 ? (
        <p>Ничего не найдено.</p>
      ) : (
        <div className="ms-inventory-groups">
          {filteredGroups.map((g) => (
            <div className="ms-inventory-group" key={g.productId}>
              <div className="ms-inventory-group__head">
                <h3>{g.title}</h3>
                <span>{g.sku}</span>
              </div>

              <table className="ms-admin-table">
                <thead>
                  <tr>
                    <th>Размер</th>
                    <th>Доступно</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {g.sizes.map((row) => {
                    const k = key(g.productId, row.size);
                    const isEditing = k in editing;
                    return (
                      <tr key={row.size} style={{ cursor: "default" }}>
                        <td>{row.size}</td>
                        <td>
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              value={editing[k]}
                              onChange={(e) => setEditing((prev) => ({ ...prev, [k]: e.target.value }))}
                              style={{ width: 70 }}
                            />
                          ) : (
                            row.available
                          )}
                        </td>
                        <td>
                          {isEditing ? (
                            <>
                              <button
                                className="btn"
                                onClick={() => handleSaveSize(g.productId, row.size, row.reserved)}
                                disabled={busyKey === k}
                              >
                                Сохранить
                              </button>{" "}
                              <button
                                className="btn"
                                onClick={() =>
                                  setEditing((prev) => {
                                    const next = { ...prev };
                                    delete next[k];
                                    return next;
                                  })
                                }
                              >
                                Отмена
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn"
                                onClick={() => setEditing((prev) => ({ ...prev, [k]: String(row.available) }))}
                              >
                                Изменить
                              </button>{" "}
                              <button
                                className="btn"
                                onClick={() => handleRemoveSize(g.productId, row.size)}
                                disabled={busyKey === k || row.reserved > 0}
                              >
                                Удалить
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {addingFor === g.productId ? (
                <div className="ms-inventory-group__add">
                  <input
                    type="text"
                    placeholder="Размер, напр. 46"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Доступно"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    style={{ width: 90 }}
                  />
                  <button
                    className="btn btn--gold"
                    onClick={() => handleAddSize(g.productId)}
                    disabled={busyKey === g.productId}
                  >
                    Добавить
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      setAddingFor(null);
                      setNewSize("");
                      setNewStock("0");
                    }}
                  >
                    Отмена
                  </button>
                </div>
              ) : (
                <button
                  className="btn"
                  style={{ marginTop: 14 }}
                  onClick={() => setAddingFor(g.productId)}
                >
                  + Добавить размер
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inventory;
