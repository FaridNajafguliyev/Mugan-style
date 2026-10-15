import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "../components/Reveal/Reveal";
import ProductCard from "../components/ProductCard/ProductCard";
import { apiFetch } from "../lib/api";
import type { Product } from "../lib/types";
import { useFavorites } from "../context/FavoritesContext";
import "./Catalog.scss";
import "./Favorites.scss";

const Favorites: React.FC = () => {
  const { ids } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    apiFetch<{ products: Product[] }>("/products")
      .then((data) => setProducts(data.products))
      .catch(() => setProducts([]))
      .finally(() => setLoaded(true));
  }, []);

  const favoriteProducts = products.filter((p) => ids.includes(p.id));

  return (
    <div className="ms-favorites-page">
      <section className="ms-favorites-hero">
        <div className="container">
          <Reveal><span className="eyebrow eyebrow--dark">Ваш выбор</span></Reveal>
          <Reveal delay={80}>
            <h1>
              Избранные <em>модели</em>
            </h1>
          </Reveal>
        </div>
      </section>

      {loaded && favoriteProducts.length === 0 ? (
        <section className="container ms-favorites-empty">
          <Reveal>
            <p>Пока здесь пусто — отмечайте понравившиеся модели сердечком в каталоге.</p>
            <Link to="/catalog" className="btn btn--gold">Смотреть каталог</Link>
          </Reveal>
        </section>
      ) : (
        <section className="ms-catalog-grid container">
          {favoriteProducts.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 90}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </section>
      )}
    </div>
  );
};

export default Favorites;
