import React from "react";
import { Link } from "react-router-dom";
import Reveal from "../components/Reveal/Reveal";
import { products } from "../data/products";
import "./Home.scss";

const testimonials = [
  {
    initials: "А.М.",
    quote: "Лёгкая, тёплая и невероятно мягкая — носила всю осень, выглядит как новая.",
  },
  {
    initials: "Е.К.",
    quote: "Необычный дизайн, отличное качество пошива. Обратимая модель — гениальное решение.",
  },
  {
    initials: "М.С.",
    quote: "Сидит идеально, очень красивая упаковка при доставке — чувствуется премиум-уровень.",
  },
  {
    initials: "О.В.",
    quote: "Удобно носить каждый день и за рулём. Отличный выбор на осень и мягкую зиму.",
  },
];

const Home: React.FC = () => {
  const featured = products.slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="ms-hero">
        <div className="ms-hero__media">
          <img src="/images/hero-red-square.jpg" alt="Девушка в дублёнке Mugan Style на Красной площади" />
          <div className="ms-hero__scrim" />
        </div>

        <div className="ms-hero__content container">
          <span className="eyebrow eyebrow--dark ms-hero__eyebrow">Москва · Сезон 2026/27</span>
          <h1 className="ms-hero__title">
            Кожа и мех,
            <br />
            <em>скроенные для зимы</em>
          </h1>
          <p className="ms-hero__sub">
            Дублёнки, пальто и куртки ручной работы из натуральной овчины и кожи.
            Тепло, которое носят с гордостью.
          </p>
          <div className="ms-hero__actions">
            <Link to="/catalog" className="btn btn--gold">Смотреть каталог</Link>
            <Link to="/about" className="btn btn--light">О бренде</Link>
          </div>
        </div>

        <div className="ms-hero__seam" aria-hidden="true">
          <svg viewBox="0 0 1 100" preserveAspectRatio="none">
            <line x1="0.5" y1="0" x2="0.5" y2="100" />
          </svg>
        </div>

        <div className="ms-hero__scroll">
          <span />
          <p>Прокрутите</p>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="section ms-philosophy">
        <div className="container ms-philosophy__grid">
          <Reveal as="div" className="ms-philosophy__image">
            <img src="/images/coat-black-long-0222.jpg" alt="Пальто Yantar Mugan Style" />
            <div className="ms-philosophy__frame" />
          </Reveal>

          <div className="ms-philosophy__text">
            <Reveal><span className="eyebrow">Философия</span></Reveal>
            <Reveal delay={80}>
              <h2 className="ms-philosophy__title">
                Mugan Style — это тепло,
                <br />которое <em>не кричит</em>, а говорит уверенно
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p>
                Мы создаём верхнюю одежду из натуральной овчины и кожи для женщин, которые ценят
                качество вместо показного блеска. Каждая дублёнка проходит ручную обработку швов,
                подбор меха по плотности ворса и примерку по российским размерам — от 42 до 66.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <Link to="/about" className="ms-philosophy__link">
                Узнать историю бренда
                <span>→</span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CATALOG TEASER */}
      <section className="section ms-catalog-teaser">
        <div className="container">
          <div className="ms-catalog-teaser__head">
            <Reveal><span className="eyebrow">Коллекция</span></Reveal>
            <Reveal delay={80}>
              <h2>
                Избранные <em>модели</em>
              </h2>
            </Reveal>
          </div>

          <div className="ms-catalog-teaser__grid">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 100} className="ms-product-card">
                <Link to={`/catalog/${p.id}`}>
                  <div className="ms-product-card__image">
                    <img src={p.images[0]} alt={p.title} loading="lazy" />
                    <img src={p.images[1] ?? p.images[0]} alt="" className="ms-product-card__hover" loading="lazy" />
                    <span className="ms-product-card__tag">{p.categoryLabel}</span>
                  </div>
                  <div className="ms-product-card__info">
                    <span>{p.price}</span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <Reveal className="ms-catalog-teaser__cta">
            <Link to="/catalog" className="btn">Весь каталог</Link>
          </Reveal>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section ms-testimonials">
        <div className="container">
          <Reveal><span className="eyebrow eyebrow--dark">Отзывы</span></Reveal>
          <Reveal delay={80}>
            <h2 className="ms-testimonials__title">
              Нам доверяют <em>тысячи женщин</em>
            </h2>
          </Reveal>

          <div className="ms-testimonials__grid">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 90} className="ms-testimonial-card">
                <div className="ms-testimonial-card__stars">★★★★★</div>
                <p>«{t.quote}»</p>
                <div className="ms-testimonial-card__author">
                  <span className="ms-testimonial-card__avatar">{t.initials}</span>
                  Покупательница
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="ms-cta-strip">
        <div className="container ms-cta-strip__inner">
          <Reveal>
            <h2>
              Подберём модель <em>лично для вас</em>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <Link to="/contact" className="btn btn--gold">Записаться в шоурум</Link>
          </Reveal>
        </div>
      </section>
    </>
  );
};

export default Home;
