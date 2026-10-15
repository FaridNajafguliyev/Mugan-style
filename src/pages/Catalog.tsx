import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "../components/Reveal/Reveal";
import { apiFetch } from "../lib/api";
import { formatPrice } from "../lib/format";
import type { Category, Product } from "../lib/types";
import "./Catalog.scss";

const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    apiFetch<{ products: Product[] }>("/products")
      .then((data) => setProducts(data.products))
      .catch(() => setProducts([]));
    apiFetch<{ categories: Category[] }>("/categories")
      .then((data) => setCategories(data.categories))
      .catch(() => setCategories([]));
  }, []);

  const visibleProducts =
    activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory);

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
            <p>Дублёнки, пальто и куртки из натуральной кожи и овчины. Размеры 42–66, доставка по Москве и России.</p>
          </Reveal>
        </div>
      </section>

      <section className="ms-catalog-filters">
        <div className="container ms-catalog-filters__row">
          <button
            className={`ms-catalog-filters__btn ${activeCategory === "all" ? "is-active" : ""}`}
            onClick={() => setActiveCategory("all")}
          >
            Все
          </button>
          {categories.map((c) => (
            <button
              key={c.key}
              className={`ms-catalog-filters__btn ${activeCategory === c.key ? "is-active" : ""}`}
              onClick={() => setActiveCategory(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      <section className="ms-catalog-grid container">
        {visibleProducts.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 90} className="ms-cat-card">
            <Link to={`/catalog/${p.id}`}>
              <div className="ms-cat-card__image">
                <img src={p.images[0]} alt={p.title} loading="lazy" />
                <img src={p.images[1] ?? p.images[0]} alt="" className="ms-cat-card__hover" loading="lazy" />
                <span className="ms-cat-card__tag">{p.categoryLabel}</span>
                <span className="ms-cat-card__view">Подробнее →</span>
              </div>
              <div className="ms-cat-card__info">
                <h3>{p.title}</h3>
                <div className="ms-cat-card__meta">
                  <span>Размеры {p.sizes}</span>
                  <span className="ms-cat-card__price">{formatPrice(p.priceKopecks, p.priceFrom)}</span>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </section>
    </div>
  );
};

export default Catalog;
