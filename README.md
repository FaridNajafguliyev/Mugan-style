# Mugan Style — сайт бренда + интернет-магазин

Премиальный сайт и полноценный интернет-магазин для бренда дублёнок, пальто и
курток из натуральной кожи и овчины (Москва).

- **Фронтенд**: React + TypeScript + Vite + React Router + SCSS (папка `/`)
- **Бэкенд**: Node.js + Express + TypeScript + MongoDB + Mongoose (папка `server/`)
- **Оплата**: YooKassa (ЮKassa) — онлайн-оплата, без наложенного платежа

## Быстрый старт (разработка)

Нужны Node.js и локальный MongoDB (`brew install mongodb-community` на macOS).

```bash
# 1. Установить зависимости фронтенда и бэкенда
npm install
npm --prefix server install

# 2. Настроить бэкенд
cp server/.env.example server/.env
# откройте server/.env и задайте свои JWT_ACCESS_SECRET / JWT_REFRESH_SECRET,
# ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD, а позже — реальные YOOKASSA_SHOP_ID /
# YOOKASSA_SECRET_KEY (тестовый режим тоже подходит)

# 3. Заполнить базу каталогом и создать первого администратора
npm --prefix server run seed
npm --prefix server run seed:admin

# 4. Запустить фронтенд и бэкенд одновременно
npm run dev:all
```

Сайт откроется на http://localhost:5173, API — на http://localhost:5001.
Админ-панель: http://localhost:5173/admin/login (логин/пароль — те, что
задали в `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`).

Можно также запускать отдельно: `npm run dev` (фронтенд) и
`npm run dev:server` (бэкенд).

## Онлайн-оплата (YooKassa)

Оплата подключена по-настоящему (не эмуляция): бэкенд создаёт платёж через
YooKassa REST API и ждёт подтверждения через webhook, прежде чем заказ
считается подтверждённым. Пока в `server/.env` стоят тестовые заглушки
(`YOOKASSA_SHOP_ID=000000`), оформление заказа будет корректно завершаться
ошибкой на этапе оплаты — это ожидаемо.

Чтобы включить настоящую оплату:
1. Зарегистрируйтесь на yookassa.ru, получите `shopId` и `secretKey`
   (тестовый магазин подходит для проверки).
2. Впишите их в `server/.env`.
3. Для приёма вебхуков на локальной машине нужен публичный туннель
   (например, `ngrok http 5001`) — зарегистрируйте URL вида
   `https://<ваш-туннель>/api/payments/webhook/yookassa` в личном кабинете
   YooKassa.

## Структура

```
src/                    фронтенд (существующий сайт + новые разделы)
  components/           Header, Footer, Reveal, CartDrawer, OrderTimeline…
  pages/                Home, Catalog, Product, About, Contact,
                         Checkout, OrderResult, TrackOrder
  pages/admin/           Login, Dashboard, Orders, OrderDetail, Inventory,
                         Customers, Delivery, Products, Settings
  layouts/               PublicLayout (публичный сайт), AdminLayout (админка)
  context/               CartContext, AdminAuthContext
  lib/                   api.ts (HTTP-клиент), types.ts, format.ts

server/                 бэкенд
  src/models/            User, Customer, Category, Product, Inventory, Order,
                         OrderStatusHistory, Payment, Delivery, ContactLead
  src/routes/            REST API (см. ниже)
  src/services/          бизнес-логика (заказы, платежи, склад, доставка…)
  src/payments/          адаптер платёжного провайдера + реализация YooKassa
  src/scripts/           seed.ts (каталог), createAdmin.ts (первый админ)
```

## REST API (кратко)

| Метод | Путь | Доступ |
|---|---|---|
| GET | /api/products, /api/products/:slug | публичный |
| GET | /api/categories | публичный |
| POST | /api/orders | публичный (оформление заказа) |
| GET | /api/orders/by-number/:orderNumber | публичный (страница результата оплаты) |
| POST | /api/orders/track | публичный (номер заказа + телефон) |
| POST | /api/payments/webhook/yookassa | YooKassa |
| POST | /api/customers/leads | публичный (форма «Контакты») |
| POST | /api/auth/login, /refresh, /logout | публичный |
| GET/PATCH | /api/orders, /api/inventory, /api/customers, /api/delivery, /api/dashboard/stats | админ/продавец (JWT) |

## Хранение фото товаров (Cloudinary)

По умолчанию загруженные в админке фото сохраняются на диск сервера
(`server/uploads/`) — годится для разработки, но на большинстве хостингов
(Render, Railway и т.д.) диск сбрасывается при каждом деплое, и фото
пропадут. Чтобы этого не случилось, подключите Cloudinary (бесплатно):

1. Зарегистрируйтесь на [cloudinary.com](https://cloudinary.com) (план Free,
   карта не требуется).
2. На Dashboard скопируйте **Cloud name**, **API Key**, **API Secret**.
3. Впишите их в `server/.env`:
   ```
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```
4. Перезапустите бэкенд — с этого момента все новые загрузки идут в
   Cloudinary автоматически (старые локальные фото продолжат работать).

Если переменные не заданы — всё работает как раньше, через локальный диск.

## Деплой на свой домен (например, mugan-style.com)

Рекомендуемый вариант — три бесплатных/недорогих managed-сервиса, без
настройки собственного VPS:

| Часть | Сервис | Что сделать |
|---|---|---|
| База данных | [MongoDB Atlas](https://www.mongodb.com/atlas) | Создать бесплатный кластер (M0), получить `MONGODB_URI` |
| Бэкенд (API) | [Render](https://render.com) | Новый **Web Service** из GitHub-репозитория, Root Directory `server`, Build `npm install && npm run build`, Start `npm start` |
| Фронтенд | [Vercel](https://vercel.com) | Импортировать репозиторий, Root Directory — корень проекта, Framework — Vite |
| Фото товаров | Cloudinary | См. раздел выше — обязательно для продакшена |
| Домен | Любой регистратор (Namecheap, Reg.ru и т.п.) | Купить `mugan-style.com`, настроить DNS на Vercel/Render |

### Шаги

1. **MongoDB Atlas** — создать кластер, пользователя БД, разрешить доступ
   (0.0.0.0/0 для простоты), скопировать connection string.
2. **Render (бэкенд)** — создать Web Service, подключить GitHub-репозиторий,
   задать все переменные из `server/.env` (включая `MONGODB_URI` с Atlas,
   реальные `YOOKASSA_*`, `CLOUDINARY_*`, и `CLIENT_URL=https://mugan-style.com`).
   После деплоя запустить один раз `npm run seed` и `npm run seed:admin`
   (через Render Shell) — наполнит каталог и создаст первого админа.
3. **Vercel (фронтенд)** — импортировать репозиторий, задать переменную
   `VITE_API_URL=https://<ваш-бэкенд>.onrender.com/api`, задеплоить.
4. **Домен** — купить `mugan-style.com`, в DNS добавить:
   - `A`/`CNAME` на корень домена → Vercel (инструкция появится в настройках
     проекта на Vercel после добавления домена)
   - поддомен, например `api.mugan-style.com`, → Render (аналогично, в
     настройках Render)
5. Обновить в `server/.env` на Render: `CLIENT_URL=https://mugan-style.com`
   и `YOOKASSA_RETURN_URL=https://mugan-style.com/order/:orderNumber/result`.
6. В личном кабинете YooKassa указать боевой webhook:
   `https://api.mugan-style.com/api/payments/webhook/yookassa`.

### Локальная сборка (для проверки)

```bash
npm run build            # фронтенд → dist/
npm --prefix server run build   # бэкенд → server/dist/
```

## Где менять текст и контакты

- Телефоны и адрес: `src/components/Footer/Footer.tsx`, `src/pages/Contact.tsx`
- Текст «О бренде»: `src/pages/About.tsx`
- Заголовок и подпись на главной: `src/pages/Home.tsx`
- Каталог товаров и остатки — через админ-панель (`/admin/products`,
  `/admin/inventory`) или напрямую в MongoDB; исходные данные для
  первичного заполнения — `server/src/seed/products.seed.ts`.
