import React, { useEffect, useState } from "react";
import Reveal from "../components/Reveal/Reveal";
import ProductCard from "../components/ProductCard/ProductCard";
import { apiFetch } from "../lib/api";
import type { Product } from "../lib/types";
import "./Catalog.scss";

const Catalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    apiFetch<{ products: Product[] }>("/products")
      .then((data) => setProducts(data.products))
      .catch(() => setProducts([]));
  }, []);

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

      <section className="ms-catalog-grid container">
        {products.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 90}>
            <ProductCard product={p} />
          </Reveal>
        ))}
      </section>
    </div>
  );
};

export default Catalog;
