import React, { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import Reveal from "../components/Reveal/Reveal";
import { apiFetch, ApiError } from "../lib/api";
import { formatPrice } from "../lib/format";
import type { Product as ProductType } from "../lib/types";
import { useCart } from "../context/CartContext";
import "./Product.scss";
import Lightbox from "../components/Lightbox/Lightbox";

const Product: React.FC = () => {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [related, setRelated] = useState<ProductType[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    setActive(0);
    setProduct(null);
    setNotFound(false);
    window.scrollTo({ top: 0 });

    if (!id) return;

    apiFetch<{ product: ProductType }>(`/products/${id}`)
      .then((data) => setProduct(data.product))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) setNotFound(true);
      });
  }, [id]);

  useEffect(() => {
    if (!product) {
      setRelated([]);
      return;
    }
    apiFetch<{ products: ProductType[] }>(`/products?category=${product.category}`)
      .then((data) => setRelated(data.products.filter((p) => p.id !== product.id).slice(0, 3)))
      .catch(() => setRelated([]));
  }, [product]);

  if (notFound) return <Navigate to="/catalog" replace />;
  if (!product) return null;

  return (
    <div className="ms-product-page">
      <div className="container ms-product-page__breadcrumb">
        <Link to="/catalog">Каталог</Link>
      </div>

      <div className="container ms-product-page__layout">
        <div className="ms-product-gallery">
          <div
            className="ms-product-gallery__main"
            onClick={() => setLightbox(true)}
            style={{ cursor: "zoom-in" }}
          >
            <img src={product.images[active]} alt={product.title} />
            <span className="ms-product-gallery__tag">
              {product.categoryLabel}
            </span>
          </div>
          {product.images.length > 1 && (
            <div className="ms-product-gallery__thumbs">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  className={`ms-product-gallery__thumb ${i === active ? "is-active" : ""}`}
                  onClick={() => setActive(i)}
                  aria-label={`Фото ${i + 1}`}
                >
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <Reveal as="div" className="ms-product-info">
          <span className="eyebrow">{product.categoryLabel}</span>
          <h1>{product.title}</h1>
          <p className="ms-product-info__price">{formatPrice(product.priceKopecks, product.priceFrom)}</p>
          <p className="ms-product-info__desc">{product.description}</p>

          <div className="ms-product-info__specs">
            <div>
              <span>Материал</span>
              <strong>{product.material}</strong>
            </div>
            <div>
              <span>Подкладка</span>
              <strong>{product.lining}</strong>
            </div>
            <div>
              <span>Размеры</span>
              <strong>{product.sizes}</strong>
            </div>
          </div>

          <div className="ms-product-info__actions">
            <button
              className="btn btn--gold"
              disabled={product.available <= 0}
              onClick={() =>
                addItem({
                  id: product.id,
                  title: product.title,
                  priceKopecks: product.priceKopecks,
                  priceFrom: product.priceFrom,
                  image: product.images[0],
                  available: product.available,
                })
              }
            >
              {product.available > 0 ? "Добавить в корзину" : "Нет в наличии"}
            </button>
            <Link to="/contact" className="btn">
              Заказать модель
            </Link>
            <a href="tel:+79265939880" className="btn">
              +7 926 593 98 80
            </a>
          </div>

          <p className="ms-product-info__note">
            Пошив и подгонка по индивидуальным меркам. Доставка по Москве — 1–2
            дня, по России — 3–7 дней.
          </p>
        </Reveal>
      </div>

      {related.length > 0 && (
        <section className="ms-product-related container">
          <Reveal>
            <h2>Похожие модели</h2>
          </Reveal>
          <div className="ms-product-related__grid">
            {related.map((p, i) => (
              <Reveal
                key={p.id}
                delay={i * 90}
                className="ms-product-related__card"
              >
                <Link to={`/catalog/${p.id}`}>
                  <div>
                    <img src={p.images[0]} alt={p.title} />
                  </div>
                  <h3>{p.title}</h3>
                  <span>{formatPrice(p.priceKopecks, p.priceFrom)}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}
      {lightbox && (
        <Lightbox
          images={product.images}
          current={active}
          onClose={() => setLightbox(false)}
          onPrev={() =>
            setActive(
              (a) => (a - 1 + product.images.length) % product.images.length,
            )
          }
          onNext={() => setActive((a) => (a + 1) % product.images.length)}
        />
      )}
    </div>
  );
};

export default Product;
