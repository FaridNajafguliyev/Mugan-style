import React, { useEffect, useRef, useState } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { ApiError } from "../../lib/api";
import { formatPrice } from "../../lib/format";
import type { AdminProduct, Category, ProductFormInput } from "../../lib/types";

const emptyForm: ProductFormInput = {
  categoryKey: "",
  title: "",
  material: "",
  lining: "",
  sizes: "",
  priceKopecks: 0,
  priceFrom: true,
  description: "",
  images: [],
};

const Products: React.FC = () => {
  const { authFetch } = useAdminAuth();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null); // null = create mode, "" = form closed
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ProductFormInput>(emptyForm);
  const [initialStock, setInitialStock] = useState(0);
  const [priceRubles, setPriceRubles] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      authFetch<{ products: AdminProduct[] }>("/products/admin/list"),
      authFetch<{ categories: Category[] }>("/categories"),
    ])
      .then(([p, c]) => {
        setProducts(p.products);
        setCategories(c.categories);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [authFetch]);

  const openCreateForm = () => {
    setEditingId(null);
    setForm({ ...emptyForm, categoryKey: categories[0]?.key ?? "" });
    setPriceRubles("");
    setInitialStock(1);
    setError(null);
    setFormOpen(true);
  };

  const openEditForm = (p: AdminProduct) => {
    setEditingId(p.id);
    setForm({
      categoryKey: p.categoryKey,
      title: p.title,
      material: p.material,
      lining: p.lining,
      sizes: p.sizes,
      priceKopecks: p.priceKopecks,
      priceFrom: p.priceFrom,
      description: p.description,
      images: p.images,
    });
    setPriceRubles(String(Math.round(p.priceKopecks / 100)));
    setError(null);
    setFormOpen(true);
  };

  const closeForm = () => setFormOpen(false);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      Array.from(files).forEach((f) => body.append("images", f));
      const data = await authFetch<{ urls: string[] }>("/uploads/product-images", {
        method: "POST",
        body,
      });
      setForm((prev) => ({ ...prev, images: [...prev.images, ...data.urls] }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось загрузить фото");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (url: string) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((i) => i !== url) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const priceKopecks = Math.round(Number(priceRubles) * 100);
    if (!priceRubles || Number.isNaN(priceKopecks) || priceKopecks < 0) {
      setError("Укажите корректную цену");
      return;
    }
    if (form.images.length === 0) {
      setError("Добавьте хотя бы одно фото");
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form, priceKopecks };
      if (editingId === null) {
        await authFetch("/products", {
          method: "POST",
          body: JSON.stringify({ ...payload, initialStock }),
        });
      } else {
        await authFetch(`/products/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Не удалось сохранить товар");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (p: AdminProduct) => {
    await authFetch(`/products/${p.id}`, {
      method: "PATCH",
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    load();
  };

  const handleDelete = async (p: AdminProduct) => {
    if (!window.confirm(`Удалить товар «${p.title}»? Это действие нельзя отменить.`)) return;
    setListError(null);
    setDeletingId(p.id);
    try {
      await authFetch(`/products/${p.id}`, { method: "DELETE" });
      load();
    } catch (err) {
      setListError(err instanceof ApiError ? err.message : "Не удалось удалить товар");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="ms-admin-page">
      <div className="ms-admin-page__head-row">
        <h1 className="ms-admin-page__title">Товары</h1>
        <button className="btn btn--gold" onClick={openCreateForm}>
          + Добавить товар
        </button>
      </div>

      {formOpen && (
        <div className="ms-admin-detail__card" style={{ marginBottom: 28 }}>
          <h3>{editingId === null ? "Новый товар" : `Редактировать: ${form.title}`}</h3>
          <form className="ms-product-form" onSubmit={handleSubmit}>
            <div className="ms-product-form__row">
              <label>
                Название
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Например, Yantar"
                />
              </label>
              <label>
                Категория
                <select
                  required
                  value={form.categoryKey}
                  onChange={(e) => setForm((f) => ({ ...f, categoryKey: e.target.value }))}
                >
                  <option value="" disabled>
                    Выберите категорию…
                  </option>
                  {categories.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="ms-product-form__row">
              <label>
                Материал
                <input
                  type="text"
                  required
                  value={form.material}
                  onChange={(e) => setForm((f) => ({ ...f, material: e.target.value }))}
                  placeholder="Натуральная кожа"
                />
              </label>
              <label>
                Подкладка
                <input
                  type="text"
                  required
                  value={form.lining}
                  onChange={(e) => setForm((f) => ({ ...f, lining: e.target.value }))}
                  placeholder="Овчина, цвет тауп"
                />
              </label>
            </div>

            <div className="ms-product-form__row">
              <label>
                Размеры
                <input
                  type="text"
                  required
                  value={form.sizes}
                  onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))}
                  placeholder="42–52"
                />
              </label>
              <label>
                Цена, ₽
                <input
                  type="number"
                  min={0}
                  required
                  value={priceRubles}
                  onChange={(e) => setPriceRubles(e.target.value)}
                  placeholder="89000"
                />
              </label>
            </div>

            <div className="ms-product-form__row">
              <label className="ms-product-form__checkbox">
                <input
                  type="checkbox"
                  checked={form.priceFrom}
                  onChange={(e) => setForm((f) => ({ ...f, priceFrom: e.target.checked }))}
                />
                Показывать «от» перед ценой
              </label>
              {editingId === null && (
                <label>
                  Начальный остаток
                  <input
                    type="number"
                    min={0}
                    value={initialStock}
                    onChange={(e) => setInitialStock(Number(e.target.value))}
                  />
                </label>
              )}
            </div>

            <label>
              Описание
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Описание модели для страницы товара"
              />
            </label>

            <label>
              Фотографии
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFilesSelected}
                disabled={uploading}
              />
            </label>

            {uploading && <p>Загружаем фото…</p>}

            {form.images.length > 0 && (
              <div className="ms-product-form__images">
                {form.images.map((url) => (
                  <div key={url} className="ms-product-form__image">
                    <img src={url} alt="" />
                    <button type="button" onClick={() => removeImage(url)} aria-label="Удалить фото">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {error && <p className="ms-admin-login__error">{error}</p>}

            <div className="ms-product-form__actions">
              <button type="submit" className="btn btn--gold" disabled={saving || uploading}>
                {saving ? "Сохраняем…" : "Сохранить"}
              </button>
              <button type="button" className="btn" onClick={closeForm}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {listError && <p className="ms-admin-login__error">{listError}</p>}

      {loading ? (
        <p>Загрузка…</p>
      ) : (
        <table className="ms-admin-table">
          <thead>
            <tr>
              <th>Фото</th>
              <th>Название</th>
              <th>Категория</th>
              <th>Цена</th>
              <th>Остаток</th>
              <th>Статус</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} style={{ cursor: "default" }}>
                <td>
                  {p.images[0] && (
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      style={{ width: 44, height: 56, objectFit: "cover" }}
                    />
                  )}
                </td>
                <td>{p.title}</td>
                <td>{p.categoryLabel}</td>
                <td>{formatPrice(p.priceKopecks, p.priceFrom)}</td>
                <td>{p.available}</td>
                <td>
                  <span className={`ms-admin-badge ${p.isActive ? "ms-admin-badge--delivered" : "ms-admin-badge--cancelled"}`}>
                    {p.isActive ? "Активен" : "Скрыт"}
                  </span>
                </td>
                <td>
                  <button className="btn" onClick={() => openEditForm(p)}>
                    Изменить
                  </button>{" "}
                  <button className="btn" onClick={() => toggleActive(p)}>
                    {p.isActive ? "Скрыть" : "Показать"}
                  </button>{" "}
                  <button
                    className="btn"
                    onClick={() => handleDelete(p)}
                    disabled={deletingId === p.id}
                  >
                    {deletingId === p.id ? "Удаляем…" : "Удалить"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Products;
