# Mugan Style — сайт бренда

Премиальный сайт для бренда дублёнок, пальто и курток из натуральной кожи и овчины (Москва).
Стек: React + TypeScript + Vite + React Router + SCSS.

## Запуск в режиме разработки

cd mugan-style
npm install
npm run dev

Откройте адрес из терминала (обычно http://localhost:5173).

## Сборка для продакшена

npm run build

Готовые файлы появятся в папке dist/ — их нужно загрузить на хостинг
(Vercel, Netlify, Reg.ru, Timeweb и т.д.). Так как сайт использует
клиентский роутинг, на хостинге нужно настроить редирект всех путей на
index.html (на Vercel/Netlify это работает из коробки).

## Структура

src/components   Header, Footer, Reveal (анимация появления при скролле)
src/pages        Home, Catalog, Product, About, Contact
src/data         products.ts — каталог товаров (тексты, цены, фото)
src/styles       tokens.scss (палитра, шрифты), global.scss
public/images    все фотографии товаров и логотип

## Как изменить каталог

Откройте src/data/products.ts — каждая модель описана объектом с полями
title, material, lining, sizes, price, description, images.
Чтобы добавить новую модель, скопируйте объект и положите фото в public/images.

## Где менять текст и контакты

- Телефоны и адрес: src/components/Footer/Footer.tsx, src/pages/Contact.tsx
- Текст «О бренде»: src/pages/About.tsx
- Заголовок и подпись на главной: src/pages/Home.tsx

## Форма заявки

Форма на странице «Контакты» сейчас показывает экран успеха без реальной
отправки данных. Чтобы подключить приём заявок (на почту, в Telegram или CRM),
нужен обработчик — например, Telegram Bot API, Formspree или серверный API.
Скажите, куда должны приходить заявки, и это можно подключить.
