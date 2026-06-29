# Codex Handoff

## 1. Что уже сделано в проекте

- Проект `hare-krishna` работает как React + Vite + TypeScript приложение.
- Текущая git-ветка: `design`.
- Архитектура разложена по слоям: `app`, `pages`, `widgets`, `features`, `entities`, `shared`.
- Подключены `React Router`, `TanStack Query`, `Zustand`, `React Hook Form`, `Zod`.
- Основной dashboard доступен на `/`.
- Есть lazy routes: `/components`, `/japa`, `/books`, `/verses`, `/calendar`, `/statistics`, `/profile`, `/settings`.
- Старый preview также поддерживается через `/?preview=components`.
- Главный dashboard собран из `Sidebar`, `Header`, `MemorizationSection`, `ProgressChartCard`, `PracticeCardsGrid`, `QuoteCard`, `CalendarCard`, `FriendsCard`, `RemindersCard`.
- Для внутренних страниц используется общий layout `ModulePage`.
- В `Sidebar` сейчас используется карточка `GoalReminderCard` с текстом «Помни о цели».
- Компонент `UttamaBhaktiCard` и его стили всё ещё есть в папке `Sidebar`, но сейчас он не подключен в `Sidebar.tsx`.
- В `src/shared/assets/images/` лежат основные изображения: lotus/logo/profile/friends/krishna/ornament/uttamaLotus и другие.

## 2. Какие файлы важны

- `AGENTS.md` - главные правила работы агента в проекте.
- `docs/design-system.md` - дизайн-система, токены, визуальные правила.
- `docs/components-map.md` - карта компонентов.
- `docs/workflow.md` и `docs/project-context.md` - дополнительный проектный контекст.
- `src/app/App.tsx` - вход приложения.
- `src/app/router/AppRouter.tsx` - маршруты, lazy loading, legacy preview.
- `src/app/providers/AppProviders.tsx` - `QueryClientProvider`.
- `src/app/store/useUiStore.ts` - локальное UI-состояние через Zustand.
- `src/shared/styles/tokens.css` - глобальные CSS-токены.
- `src/shared/styles/globals.css` - глобальные стили, Nunito, `html { min-width: 1280px; }`.
- `src/pages/DashboardPage/DashboardPage.tsx` и `.module.css` - главный dashboard layout.
- `src/pages/ModulePage/` - общий layout для модульных страниц.
- `src/pages/ComponentsPreviewPage/` - страница просмотра отдельных компонентов.
- `src/widgets/Sidebar/Sidebar.tsx` и `.module.css` - левое меню.
- `src/widgets/Sidebar/GoalReminderCard.tsx` и `.module.css` - текущая нижняя карточка sidebar.
- `src/widgets/Sidebar/UttamaBhaktiCard.tsx` - неиспользуемая сейчас карточка «Уттама-бхакти».
- `src/shared/ui/Icon/Icon.tsx` - локальные SVG-иконки.
- `src/shared/ui/Card/` и `src/shared/ui/ProgressRing/` - базовые UI-компоненты.
- `src/shared/api/httpClient.ts`, `endpoints.ts`, `types.ts` - заготовка API-слоя.
- `src/entities/*/model/types.ts` - базовые типы доменных сущностей.

## 3. Какие дизайн-решения приняты

- Стиль: мягкий, спокойный, devotional, пастельный, премиальный.
- Продукт должен ощущаться как личное пространство практики, а не корпоративная аналитика.
- Основной фон: тёплый ivory/milk через `--bg`.
- Главный контейнер: `max-width: 1540px`, центрированный.
- Desktop layout сейчас зафиксирован через `html { min-width: 1280px; }`.
- Dashboard: слева sticky sidebar, справа основной контент с main column и right panel.
- Базовый шрифт: Nunito.
- Акценты: lavender, green, gold.
- Карточки спокойные, округлые, без тяжёлых теней; в текущей дизайн-системе предпочтение `box-shadow: none`.
- Иконки линейные и мягкие, через локальный `Icon`.
- Компоненты стилизуются через CSS Modules.
- Новые страницы должны пользоваться общим `ModulePage`, чтобы сохранять ритм продукта.
- Изменения делать точечно: если правится один компонент, не менять весь dashboard.

## 4. Какие команды запускать

```bash
npm install
npm run dev
npm run build
npm run preview
```

Локальные URL:

```txt
http://localhost:5173/
http://localhost:5173/components
http://localhost:5173/?preview=components
http://localhost:5173/japa
http://localhost:5173/books
http://localhost:5173/verses
http://localhost:5173/calendar
http://localhost:5173/statistics
http://localhost:5173/profile
http://localhost:5173/settings
```

Git:

```bash
git status
git add .
git commit -m "..."
```

## 5. Что нужно делать дальше

- Продолжать точечные итерации по компонентам, не меняя весь экран без просьбы.
- Уточнить судьбу sidebar-карточек: оставить `GoalReminderCard` или вернуть/доработать `UttamaBhaktiCard`.
- Проверить и доработать адаптивность: сейчас проект ориентирован на desktop и имеет `min-width: 1280px`.
- Постепенно выносить моковые данные dashboard в `entities` или `shared`.
- Подключить реальные API-методы к `httpClient` и TanStack Query.
- Проверить актуальность `docs/components-map.md` после изменений компонентов.
- Оптимизировать крупные изображения перед продакшеном.
- Следить за git-статусом: сейчас `docs/CODEX_HANDOFF.md` и `src/shared/assets/images/logoLotus.png` отображались как untracked.

## 6. Чего нельзя менять

- Не редизайнить весь dashboard при задаче на один компонент.
- Не менять дизайн-систему, палитру, типографику, радиусы и общий визуальный ритм без явной просьбы.
- Не удалять текущий dashboard, widgets, routes и `ModulePage`.
- Не ломать маршруты `/`, `/components`, `/japa`, `/books`, `/verses`, `/calendar`, `/statistics`, `/profile`, `/settings`.
- Не удалять `static-preview.html`.
- Не удалять ассеты из `src/shared/assets/images/`, если не проверено, что они не используются.
- Не добавлять Tailwind и новые зависимости без сильной причины.
- Не делать backend или микросервисы в этом репозитории без отдельного согласования.
- Не коммитить `node_modules`, `dist`, build info, screenshots, временные файлы и env-файлы.
- Не заменять CSS Modules глобальными стилями для отдельных компонентов.
