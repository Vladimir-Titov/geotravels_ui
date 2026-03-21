# GeoTravels UI

Minimal React UI for the `geotravels` backend.

## Stack
- React + Vite + TypeScript
- React Router
- Leaflet + React Leaflet
- Vitest + Testing Library

## Run
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure env:
   ```bash
   cp .env.example .env
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```

Default UI URL: `http://localhost:5173`

## Required backend
- Backend URL is configured by `VITE_API_BASE_URL`.
- Default expects backend at `http://localhost:8000`.
- Ensure backend CORS allows `http://localhost:5173`.

## Scripts
- `npm run dev` - start development server
- `npm run build` - type-check and build production bundle
- `npm run test` - run tests in watch mode
- `npm run test:run` - run tests once
- `npm run lint` - run eslint

## Screens
- `/auth` - login/register
- `/map` - countries map + mark visited
- `/history` - visit events and visited country codes

## Структура `src/`

```
src/
├── main.tsx                  ← точка входа
│
├── app/                      ← "скелет" приложения
│   ├── App.tsx               — роутер, список маршрутов
│   ├── app.css               — CSS-переменные, reset, body
│   ├── layout.tsx            — шапка + навигация + <Outlet>
│   └── layout.css            — стили шапки
│
├── features/                 ← бизнес-домены
│   ├── auth/                 — авторизация
│   │   ├── index.ts          — публичный API фичи
│   │   ├── auth-page.tsx     — страница входа/регистрации
│   │   ├── auth-page.css
│   │   ├── auth-context.tsx  — глобальное состояние сессии (useAuth)
│   │   ├── auth-api.ts       — запросы: login, register, telegram
│   │   ├── require-auth.tsx  — guard: редирект если не залогинен
│   │   ├── session.ts        — чтение/запись токенов в localStorage
│   │   └── telegram-login-button.tsx
│   │
│   ├── map/                  — карта мира
│   │   ├── index.ts
│   │   ├── map-page.tsx      — страница с картой и сайдбаром
│   │   ├── map-page.css
│   │   ├── atlas-map.tsx     — SVG-компонент карты (D3)
│   │   ├── atlas-map.css
│   │   └── countries-api.ts  — запросы: список стран, GeoJSON
│   │
│   └── visits/               — история визитов
│       ├── index.ts
│       ├── history-page.tsx  — страница истории
│       ├── history-page.css
│       └── visits-api.ts     — запросы: список визитов, отметить страну
│
├── shared/                   ← не привязано к домену
│   ├── api/
│   │   ├── http.ts           — HTTP-клиент: fetch + авто-refresh токена на 401
│   │   └── types.ts          — TypeScript-типы для всех API-ответов
│   ├── config/
│   │   └── env.ts            — переменные окружения (API_BASE_URL и т.д.)
│   └── ui/                   — место для будущих общих компонентов
│
├── assets/
│   └── logo.png
│
└── tests/                    ← зеркало src/, только тесты
    ├── setup.ts              — глобальный setup для vitest
    ├── features/auth/
    ├── features/map/
    ├── features/visits/
    └── shared/api/
```

### Ключевые принципы

**`app/` vs `features/`** — `app/` это каркас (роутер, layout), `features/` — содержимое. Добавить новую страницу = создать папку в `features/`, зарегистрировать маршрут в `App.tsx`.

**`features/` изолированы** — `auth` не импортирует из `map`, `visits` не импортирует из `auth`. Общее — в `shared/`.

**`shared/` без бизнес-логики** — утилиты и типы, не зависящие от конкретного домена.

**`index.ts` как граница** — снаружи фичи пишешь `from '../features/auth'`, не залезая в конкретные файлы внутри. Позволяет переносить внутренности без правки всего проекта.

**CSS co-location** — каждый компонент импортирует свой `.css` файл рядом. Глобальные переменные только в `app/app.css`.

**Тесты отдельно** — `src/tests/` зеркалит структуру `src/`, чтобы тесты не засоряли папки с кодом.
