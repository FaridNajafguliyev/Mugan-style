import React, { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import Reveal from "../components/Reveal/Reveal";
import { products } from "../data/products";
import "./Product.scss";

const Product: React.FC = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
    window.scrollTo({ top: 0 });
  }, [id]);

  if (!product) return <Navigate to="/catalog" replace />;

  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3);

  return (
    <div className="ms-product-page">
      <div className="container ms-product-page__breadcrumb">
        <Link to="/catalog">Каталог</Link>
      </div>

      <div className="container ms-product-page__layout">
        <div className="ms-product-gallery">
          <div className="ms-product-gallery__main">
            <img src={product.images[active]} alt={product.title} />
            <span className="ms-product-gallery__tag">{product.categoryLabel}</span>
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
          <p className="ms-product-info__price">{product.price}</p>
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
            <Link to="/contact" className="btn btn--gold">Заказать модель</Link>
            <a href="tel:+79265939880" className="btn">+7 926 593 98 80</a>
          </div>

          <p className="ms-product-info__note">
            Пошив и подгонка по индивидуальным меркам. Доставка по Москве — 1–2 дня, по России — 3–7 дней.
          </p>
        </Reveal>
      </div>

      {related.length > 0 && (
        <section className="ms-product-related container">
          <Reveal><h2>Похожие модели</h2></Reveal>
          <div className="ms-product-related__grid">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={i * 90} className="ms-product-related__card">
                <Link to={`/catalog/${p.id}`}>
                  <div>
                    <img src={p.images[0]} alt={p.title} />
                  </div>
                  <span>{p.price}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Product;
