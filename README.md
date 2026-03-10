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
