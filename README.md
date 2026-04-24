# GeoTravels UI

MVP frontend for Tripmark (`auth + visits/plans/statistics`).

## Stack
- React + Vite + TypeScript
- React Router
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

## Routes
- `/auth` - login/OTP flow
- `/tg-app` - Telegram mini app auth entry
- `/visits` - visited trips after login
- `/plans` - planned trips
- `/statistics` - secondary statistics view
- `/trips/:visitId` - trip details

`/` and unknown routes are redirected by auth state:
- authenticated -> `/visits`
- guest -> `/auth`

## `src/` structure

```
src/
├── main.tsx                  ← app bootstrap
│
├── app/                      ← router + layout shell
│   ├── App.tsx
│   ├── app.css
│   ├── layout.tsx
│   └── layout.css
│
├── features/
│   ├── auth/                 ← authentication and session
│   └── trips/                ← visits, plans, statistics, trip details
│
├── shared/
│   ├── api/                  ← HTTP client and API contracts
│   ├── config/               ← env accessors
│   └── ui/                   ← shared layout/UI primitives
│
├── assets/
│   └── logo.png
│
└── tests/
    ├── setup.ts
    ├── features/auth/
    ├── features/trips/
    └── shared/
```
