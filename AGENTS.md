# AGENTS.md

Руководство для агентов, работающих с `geotravels_ui`.

## Назначение проекта

- Этот репозиторий содержит frontend для backend-сервиса `geotravels`, который лежит по пути `/home/vova/Desktop/projects/geotravels`.
- Это небольшое SPA на React + Vite + TypeScript.
- Основные экраны:
  - `/auth`
  - `/map`
  - `/history`
- Главная карта теперь не slippy-map на тайлах, а atlas-style SVG карта, которая рисуется из backend GeoJSON через `d3-geo`.

## Быстрая карта архитектуры

- `src/main.tsx`
  - точка входа приложения, router, auth provider, глобальные стили
- `src/app/App.tsx`
  - маршруты и переключение экранов
- `src/app/layout.tsx`
  - общий layout после логина
- `src/features/auth`
  - логин, регистрация, session storage, auth context, route guard
- `src/features/map`
  - atlas-карта и логика работы со странами
- `src/features/visits`
  - история визитов и visit API
- `src/shared/api`
  - общий HTTP клиент, refresh token flow, типы backend-ответов
- `src/shared/config/env.ts`
  - работа с `VITE_API_BASE_URL`

## Принцип разделения ответственности

### `map-page.tsx`

Файл `src/features/map/map-page.tsx` отвечает за orchestration:

- загрузку стран
- загрузку GeoJSON
- загрузку визитов
- selected country state
- mark-as-visited flow
- правую sidebar-панель

### `atlas-map.tsx`

Файл `src/features/map/atlas-map.tsx` отвечает только за сам atlas-renderer:

- projection
- SVG paths
- graticule
- zoom/pan
- hover/click по странам
- визуальный рендер карты

Не переносите сетевые запросы в `atlas-map.tsx`.

## Важные решения, которые уже приняты

- Экран `/map` не должен зависеть от OSM tiles.
- Канонический источник геометрии стран — backend GeoJSON.
- Первая atlas-версия намеренно без:
  - country labels
  - ocean labels
  - city layer
- Zoom/pan допустим, но карта должна оставаться atlas-like, а не превращаться в generic web map.

## Если хотите что-то поменять

### Изменить цвет посещенных стран

Меняйте `src/features/map/atlas-map.tsx`.
Ищите логику:

- `const isVisited = visitedCountryCodes.has(countryCode)`
- `const fill = isVisited ? ... : ...`
- `const stroke = isVisited ? ... : ...`

### Изменить базовые цвета стран

Меняйте массив `PALETTE` в `src/features/map/atlas-map.tsx`.

### Изменить projection, zoom, pan, graticule

Меняйте `src/features/map/atlas-map.tsx`.

### Изменить фон карты, toolbar, paper/ocean styling

Меняйте `src/index.css`.
Основные классы:

- `.atlas-shell`
- `.atlas-toolbar`
- `.atlas-canvas`
- `.atlas-paper`
- `.atlas-ocean`
- `.atlas-graticule`
- `.atlas-country`

### Изменить тексты на экране карты

Меняйте `src/features/map/map-page.tsx`.

### Изменить логику загрузки карты

Меняйте `src/features/map/map-page.tsx`.
Ищите:

- `loadInitialState()`
- `reloadVisitedCodes()`
- `onMarkVisit()`

### Изменить backend-запросы карты

Меняйте `src/features/map/countries-api.ts`.

### Изменить visit-запросы

Меняйте `src/features/visits/visits-api.ts`.

### Изменить auth/session поведение

Смотрите:

- `src/features/auth/session.ts`
- `src/features/auth/auth-context.tsx`
- `src/shared/api/http.ts`

### Изменить backend response types

Меняйте `src/shared/api/types.ts`.

Если backend контракт меняется, порядок такой:

1. обновить `types.ts`
2. обновить нужный `*-api.ts`
3. обновить компонент или страницу, которая это использует

## API и HTTP conventions

- Все запросы должны идти через `src/shared/api/http.ts`.
- Не делайте прямой `fetch()` из page-компонентов без сильной причины.
- `http.ts` отвечает за:
  - auth header
  - `401 -> refresh -> retry`
  - нормализацию ошибок

## Тесты и проверки

Текущий стек тестов:

- Vitest
- Testing Library
- jsdom

Перед завершением frontend-изменений желательно прогонять:

- `npm run test:run`
- `npm run build`
- `npm run lint`

Для map-изменений обычно нужен хотя бы один regression test на:

- click по стране
- zoom/pan без потери кликабельности
- сохранение visit flow

## Практические предупреждения

- В зависимостях все еще могут лежать `leaflet` и `react-leaflet`, но основной экран карты их больше не использует.
- Не возвращайте tile-based basemap на экран `/map`, если это не отдельное осознанное продуктовое решение.
- Если меняете backend GeoJSON, сохраняйте как минимум:
  - `properties.iso_a2`
  - `properties.name`
- Для будущих городов и внутренних границ держите карту модульной: глобальный atlas screen и детальные слои не обязаны жить в одном рендер-подходе.

## Safe workflow

Если меняете что-то в UI, безопасная последовательность обычно такая:

1. найти нужный `page` или `feature`
2. поменять минимальный кусок логики или стиля
3. проверить тесты
4. проверить build
5. проверить lint

## Done checklist

Перед завершением изменений проверьте:

- экран `/map` открывается после логина
- click по стране открывает sidebar
- mark-as-visited обновляет visited state
- `npm run test:run` проходит
- `npm run build` проходит
- `npm run lint` проходит
- если менялась геометрия на backend, `/api/v1/countries/geojson` все еще совместим по contract
