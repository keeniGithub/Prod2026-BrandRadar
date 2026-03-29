<img src="public/banner.png" style="width:1000px">

<img src="public/logo.png" style="width:400px">

# Brand Radar (Frontend)

**Frontend by Kenyka, URLyata team, Prod 2026**

## стек

| Компонент | Технология |
|---|---|
| Фреймворк | [![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org/) |
| UI-библиотека | [![React](https://img.shields.io/badge/React-19-20232A?logo=react)](https://react.dev/) |
| Компоненты | [![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Radix_UI-111827)](https://ui.shadcn.com/) |
| Стили | [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/) |
| Графики | [![Recharts](https://img.shields.io/badge/Recharts-2.15-FF4B4B)](https://recharts.org/) |
| HTTP-клиент | [![Axios](https://img.shields.io/badge/Axios-1.13-5A29E4?logo=axios&logoColor=white)](https://axios-http.com/) |
| SSE | [![fetch-event-source](https://img.shields.io/badge/fetch--event--source-SSE-0EA5E9)](https://github.com/Azure/fetch-event-source) |
| Push-уведомления | [![Web Push](https://img.shields.io/badge/Web_Push_API-Service_Worker-10B981)](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) |
| Язык | [![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) |
| Тесты | [![Vitest](https://img.shields.io/badge/Vitest-3.2-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/) [![Testing Library](https://img.shields.io/badge/Testing_Library-React-E33332?logo=testinglibrary&logoColor=white)](https://testing-library.com/docs/react-testing-library/intro/) |
| Сборка | [![Docker](https://img.shields.io/badge/Docker-standalone_output-2496ED?logo=docker&logoColor=white)](https://www.docker.com/) |
| CI/CD | [![GitLab CI](https://img.shields.io/badge/GitLab_CI-CD-FC6D26?logo=gitlab&logoColor=white)](https://docs.gitlab.com/ci/) |

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
