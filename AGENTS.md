# AGENTS.md

Руководство для агентов, работающих с `geotravels_ui`.

## Назначение проекта

- Репозиторий содержит frontend для Tripmark.
- Текущий MVP: `Authorization flow` и личный архив поездок.
- Актуальные пользовательские маршруты:
  - `/auth`
  - `/tg-app`
  - `/visits`
  - `/plans`
  - `/statistics`
  - `/trips/:visitId`

## Быстрая карта архитектуры

- `src/main.tsx`
  - точка входа приложения, router, auth provider, глобальные стили
- `src/app/App.tsx`
  - маршруты и корневые редиректы
- `src/app/layout.tsx`
  - общий layout после логина
- `src/features/auth`
  - логин, OTP, session storage, auth context, route guard
- `src/features/trips`
  - посещения, планы, статистика, детали поездки и создание поездки
- `src/shared/api`
  - общий HTTP клиент, refresh token flow, типы backend-ответов
- `src/shared/config/env.ts`
  - работа с `VITE_API_BASE_URL`
- `src/shared/ui`
  - общие UI-компоненты (layout/navigation/surfaces)

## Принцип разделения ответственности

- `app/` — каркас приложения (роутинг, layout).
- `features/` — доменные сценарии.
- `shared/` — инфраструктурные и переиспользуемые компоненты без бизнес-специфики.

## API и HTTP conventions

- Все запросы должны идти через `src/shared/api/http.ts`.
- Не используйте прямой `fetch()` из page-компонентов без явной причины.
- `http.ts` отвечает за:
  - auth header
  - `401 -> refresh -> retry`
  - нормализацию ошибок

## Тесты и проверки

Стек тестов:
- Vitest
- Testing Library
- jsdom

Перед завершением frontend-изменений запускайте:
- `npm run test:run`
- `npm run build`
- `npm run lint`

## Safe workflow

1. Найти нужный `feature`/`shared` модуль.
2. Изменить минимально достаточный участок.
3. Прогнать тесты и сборку.
4. Проверить линтер.

## Done checklist

- Авторизация (включая OTP) работает.
- После логина пользователь попадает на `/visits`.
- Layout/top navigation не содержит ссылок на удалённые legacy-экраны.
- `npm run test:run` проходит.
- `npm run build` проходит.
- `npm run lint` проходит.
