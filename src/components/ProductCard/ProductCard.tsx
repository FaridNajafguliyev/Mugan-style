import React from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../../lib/format";
import type { Product } from "../../lib/types";
import { useFavorites } from "../../context/FavoritesContext";
import FavoriteButton from "../FavoriteButton/FavoriteButton";
import "./ProductCard.scss";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product: p }) => {
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <Link to={`/catalog/${p.id}`} className="ms-cat-card">
      <div className="ms-cat-card__image">
        <img src={p.images[0]} alt={p.title} loading="lazy" />
        <img src={p.images[1] ?? p.images[0]} alt="" className="ms-cat-card__hover" loading="lazy" />
        <span className="ms-cat-card__tag">Дублёнка</span>
        <span className="ms-cat-card__view">Подробнее →</span>
      </div>
      <div className="ms-cat-card__info">
        <div className="ms-cat-card__title-row">
          <h3>{p.title}</h3>
          <FavoriteButton
            className="ms-cat-card__fav"
            active={isFavorite(p.id)}
            onToggle={() => toggleFavorite(p.id)}
          />
        </div>
        <div className="ms-cat-card__meta">
          <span>Размеры {p.sizes}</span>
          <span className="ms-cat-card__price">{formatPrice(p.priceKopecks, p.priceFrom)}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
