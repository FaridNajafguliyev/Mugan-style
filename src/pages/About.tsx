import React from "react";
import { Link } from "react-router-dom";
import Reveal from "../components/Reveal/Reveal";
import "./About.scss";

const values = [
  {
    title: "Натуральные материалы",
    text: "Только настоящая овчина, кожа и мех — никаких заменителей. Каждая шкура отбирается вручную по плотности ворса и выделке.",
  },
  {
    title: "Российские размеры",
    text: "Лекала разработаны под российскую фигуру — от 44 до 64 размера, с учётом посадки по плечам и длине рукава.",
  },
  {
    title: "Ручная сборка",
    text: "Швы обрабатываются вручную, мех подбирается по тону в каждой партии — поэтому ваша модель не похожа на массовую.",
  },
];

const About: React.FC = () => {
  return (
    <div className="ms-about-page">
      <section className="ms-about-hero">
        <div className="container">
          <Reveal><span className="eyebrow eyebrow--dark">О бренде</span></Reveal>
          <Reveal delay={80}>
            <h1>
              Mugan Style — <em>тепло Москвы</em>,<br />собранное вручную
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="section ms-about-story">
        <div className="container ms-about-story__grid">
          <Reveal as="div" className="ms-about-story__image">
            <img src="/images/coat-black-long-0222.jpg" alt="Дублёнка Mugan Style" />
          </Reveal>
          <div>
            <Reveal><span className="eyebrow">История</span></Reveal>
            <Reveal delay={80}>
              <h2>Бренд для женщин, которые не мёрзнут вполсилы</h2>
            </Reveal>
            <Reveal delay={160}>
              <p>
                Mugan Style родился из простого наблюдения: московская зима требует настоящей защиты,
                а не компромиссов между теплом и стилем. Мы объединили традиции выделки овчины
                с современным кроем — так, чтобы дублёнка работала и в −20°, и на фотографии.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <p>
                Сегодня в коллекции — дублёнки из натуральной кожи, овчины
                и меха. Каждая модель проходит примерку на нескольких типах фигуры,
                прежде чем попасть в шоурум.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section ms-about-values">
        <div className="container">
          <Reveal><span className="eyebrow eyebrow--dark">Принципы</span></Reveal>
          <Reveal delay={80}>
            <h2>На чём держится качество</h2>
          </Reveal>

          <div className="ms-about-values__grid">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 100} className="ms-about-values__card">
                <span>{String(i + 1).padStart(2, "0")}</span>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="ms-about-cta">
        <div className="container ms-about-cta__inner">
          <Reveal>
            <h2>
              Готовы примерить <em>дублёнку мечты?</em>
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <Link to="/catalog" className="btn btn--gold">Смотреть каталог</Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
};

export default About;
