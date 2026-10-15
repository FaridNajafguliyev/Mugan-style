import React from "react";
import Reveal from "../components/Reveal/Reveal";
import "./Requisites.scss";

const Requisites: React.FC = () => {
  return (
    <div className="ms-requisites-page">
      <section className="ms-requisites-hero">
        <div className="container">
          <Reveal><span className="eyebrow eyebrow--dark">Юридическая информация</span></Reveal>
          <Reveal delay={80}>
            <h1>
              Реквизиты <em>продавца</em>
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="container ms-requisites-body">
        <Reveal as="div" className="ms-requisites-card">
          <dl>
            <div>
              <dt>Статус</dt>
              <dd>Индивидуальный предприниматель</dd>
            </div>
            <div>
              <dt>ФИО</dt>
              <dd>Наджафкулиев Рафаэль Анвер оглы</dd>
            </div>
            <div>
              <dt>ИНН</dt>
              <dd>772395970235</dd>
            </div>
            <div>
              <dt>ОГРНИП</dt>
              <dd>316774600510995</dd>
            </div>
            <div>
              <dt>Телефон</dt>
              <dd>
                <a href="tel:+79265939880">+7 926 593 98 80</a>,{" "}
                <a href="tel:+79645939880">+7 964 593 98 80</a>
              </dd>
            </div>
            <div>
              <dt>Эл. почта</dt>
              <dd><a href="mailto:rafael-1969@mail.ru">rafael-1969@mail.ru</a></dd>
            </div>
          </dl>
        </Reveal>
      </section>
    </div>
  );
};

export default Requisites;
