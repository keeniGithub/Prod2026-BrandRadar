<img src="public/banner.png" style="width:1000px">

<img src="public/logo.png" style="width:400px">

# Brand Radar (Frontend)

**Frontend by Kenyka, URLyata team, Prod 2026**

## стек

| Компонент | Технология |
|---|---|
| Фреймворк | Next.js 15 (App Router, Turbopack) |
| UI-библиотека | React 19 |
| Компоненты | shadcn/ui (Radix UI primitives) |
| Стили | Tailwind CSS v4 |
| Графики | Recharts 2.15 |
| HTTP-клиент | Axios 1.13 |
| SSE | fetch-event-source |
| Push-уведомления | Web Push API + Service Worker |
| Язык | TypeScript 5 |
| Тесты | Vitest 3.2 + React Testing Library |
| Сборка | Docker (standalone output) |
| CI/CD | GitLab CI |

**Основные разделы приложения:**

| Раздел | Путь | Описание |
|---|---|---|
| Авторизация | `/auth` | Вход в аккаунт |
| Лента | `/dashboard` | Поток упоминаний с фильтрами по тональности, релевантности, дате и источнику |
| Аналитика | `/dashboard/analytic` | Графики динамики, распределение тональности, KPI |
| Алерты | `/dashboard/alert` | Управление спайк-алертами и правилами уведомлений |
| Здоровье бренда | `/dashboard/health` | Репутационные метрики и системная статистика |
| Аудит | `/dashboard/audit` | Лог действий пользователя |
| Настройки | `/dashboard/settings` | Управление брендами, источниками и проектом |

---

## Структура проекта

```
frontend/
├── public/
│   ├── manifest.json          # PWA манифест
│   └── sw.js                  # Service Worker для push-уведомлений
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx         # Корневой layout (шрифты, провайдеры)
│   │   ├── page.tsx           # Главная страница (проверка авторизации + редирект)
│   │   ├── auth/              # Модуль авторизации (вход / регистрация)
│   │   ├── dashboard/         # Основное приложение (защищённая зона)
│   │   │   ├── page.tsx       # Дашборд — лента упоминаний
│   │   │   ├── alert/         # Управление алертами
│   │   │   ├── analytic/      # Аналитика и графики
│   │   │   ├── audit/         # Лог аудита действий
│   │   │   ├── health/        # Мониторинг здоровья бренда
│   │   │   └── settings/      # Настройки пользователя и проекта
│   │   ├── api/               # Клиентские функции вызовов бэкенда
│   │   │   ├── alerts.ts      # CRUD алертов
│   │   │   ├── analytic.ts    # Аналитические данные
│   │   │   ├── brands.ts      # Управление брендами/проектами
│   │   │   ├── mentions.ts    # Лента и фильтрация упоминаний
│   │   │   └── ...
│   │   └── config/            # Конфигурация и типы для каждого домена
│   ├── components/            # React-компоненты
│   │   ├── mention-card.tsx        # Карточка упоминания
│   │   ├── mentions-feed.tsx       # Лента упоминаний с пагинацией
│   │   ├── brand-context.tsx       # Контекст активного бренда
│   │   ├── alert-context.tsx       # Контекст состояния алертов
│   │   ├── analytic/              # Компоненты аналитики (графики, KPI)
│   │   ├── health/                # Компоненты здоровья бренда
│   │   └── ui/                    # Базовые UI-примитивы (shadcn/ui)
│   └── lib/
│       ├── push.ts            # Web Push подписка
│       └── utils.ts           # Общие хелперы
├── Dockerfile
├── docker-compose.yml
├── next.config.ts
└── vitest.config.ts
```

---

## Переменные окружения

Создайте `.env.local` в корне `frontend/`:

```env
# URL бэкенда (обязательно)
NEXT_PUBLIC_API_URL=http://localhost:8000

# URL ML (обязательно)
NEXT_PUBLIC_ML=http://localhost:8001

# VAPID-ключ для Web Push уведомлений (опционально)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
```

---

## Запуск

```bash
# Установка зависимостей
npm install

# Dev-режим
npm run dev
# С https на локалке
npm run dev-https

# Production-сборка
npm run build
npm run start

# Docker
docker compose up --build
```

---

## Тестирование

```bash
# Unit-тесты
npm run test

# С отчётом покрытия
npm run test -- --coverage

# Watch-режим
npm run test -- --watch
```

Тесты — **Vitest** + **React Testing Library**. Конфигурация — `vitest.config.ts`.

---

## Архитектурные решения

**Управление состоянием**

- `BrandContext` — активный бренд, доступен через `useBrand()` по всему приложению.
- `AlertContext` — состояние алертов для счётчиков и уведомлений.
- Серверное состояние хранится в компонентном `useState`; глобальный state-manager не используется намеренно.

**API-слой**

Все вызовы бэкенда сгруппированы в `src/app/api/` по доменам. Axios-инстанс в `src/app/config/axios.ts` автоматически подставляет JWT из `localStorage`.

**Push-уведомления и PWA**

`lib/push.ts` оформляет подписку через `PushManager`. `public/sw.js` обрабатывает push-события и показывает нативные уведомления браузера. `public/manifest.json` делает приложение устанавливаемым на мобильных устройствах.
