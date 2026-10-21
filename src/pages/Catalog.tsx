import React, { useEffect, useState } from "react";
import Reveal from "../components/Reveal/Reveal";
import ProductCard from "../components/ProductCard/ProductCard";
import { apiFetch, ApiError } from "../lib/api";
import type { Product } from "../lib/types";
import "./Catalog.scss";

const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    apiFetch<{ products: Product[] }>("/products")
      .then((data) => setProducts(data.products))
      .catch((err) => {
        setProducts([]);
        setError(
          err instanceof ApiError
            ? err.message
            : "Не удалось загрузить каталог — сервер мог ещё не проснуться, попробуйте ещё раз",
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="ms-catalog-page">
      <section className="ms-catalog-hero">
        <div className="container">
          <Reveal><span className="eyebrow eyebrow--dark">Коллекция 2026/27</span></Reveal>
          <Reveal delay={80}>
            <h1>
              Наши <em>модели</em>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p>Дублёнки из натуральной кожи и овчины. Размеры 44–64, доставка по Москве и России.</p>
          </Reveal>
        </div>
      </section>

      {loading ? (
        <p className="ms-catalog-status container">Загрузка…</p>
      ) : error ? (
        <div className="ms-catalog-status container">
          <p>{error}</p>
          <button className="btn" onClick={load}>
            Попробовать снова
          </button>
        </div>
      ) : products.length === 0 ? (
        <p className="ms-catalog-status container">Пока нет товаров в этой категории.</p>
      ) : (
        <section className="ms-catalog-grid container">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 90}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </section>
      )}
    </div>
  );
};

export default Catalog;
