# Codex Handoff

## 1. Что уже сделано в проекте

- Проект `hare-krishna` работает как React + Vite + TypeScript dashboard.
- Текущая ветка: `design`.
- Последний коммит: `f3497fb Refine dashboard header navigation`.
- Архитектура разложена по слоям: `app`, `pages`, `widgets`, `features`, `entities`, `shared`.
- Подключены `React Router`, `TanStack Query`, `Zustand`, `React Hook Form`, `Zod`.
- Основной dashboard находится на `/`.
- Есть маршруты: `/components`, `/japa`, `/books`, `/verses`, `/calendar`, `/statistics`, `/profile`, `/settings`.
- `Header`: строка поиска удалена, вместо неё иконка настроек; она ведёт на `/settings`.
- `Sidebar`: пункт `Настройки` убран из меню.
- `DashboardPage`: текущий layout статический: `Header`, затем `MemorizationSection`, затем сетка main/right column.
- `MemorizationSection`: старый слайдер удалён, вместо него свёрстан блок «Проверь себя» с `verseImg.png`, карточками оценки и нижней подсказкой.
- Практические карточки приведены к макету с тремя блоками: Джапа, Чтение книг, Изучение стихов.
- `lotus-logo.png` и `lotus-soft.png` были обрезаны, переведены на PNG с alpha-channel; `lotus-soft.png` дополнительно усилен по цвету.
- `lotus-logo.png` подключён как favicon в `index.html`.

Важно: сейчас есть незакоммиченная работа по цветам, теням и границам. Она начата, но не финализирована коммитом.

## 2. Какие файлы важны

- `AGENTS.md` - правила работы в проекте.
- `docs/design-system.md` - дизайн-система; сейчас уже начата правка правила про тени.
- `docs/components-map.md` - карта компонентов.
- `docs/CODEX_HANDOFF.md` - этот handoff.
- `src/shared/styles/tokens.css` - основные цвета, фон, shadow tokens, radii.
- `src/shared/ui/Card/Card.module.css` - базовая карточка; сейчас в ней возвращена тонкая граница и тень.
- `src/app/router/AppRouter.tsx` - lazy routes и legacy `?preview=components`.
- `src/pages/DashboardPage/DashboardPage.tsx` - главный dashboard layout.
- `src/pages/DashboardPage/DashboardPage.module.css` - сетка dashboard; там зафиксировано `grid-auto-rows: max-content` и `align-content: start`, чтобы блоки не уезжали вниз.
- `src/widgets/Header/Header.tsx` и `.module.css` - верхняя панель, настройки через `/settings`.
- `src/widgets/Sidebar/Sidebar.tsx` и `.module.css` - левое меню без пункта настроек.
- `src/widgets/MemorizationSection/MemorizationSection.tsx` и `.module.css` - главный блок «Проверь себя».
- `src/widgets/PracticeCard/` и `src/widgets/PracticeCardsGrid/` - три карточки практики.
- `src/widgets/ProgressChartCard/`, `CalendarCard/`, `FriendsCard/`, `RemindersCard/`, `QuoteCard/` - остальные dashboard-блоки.
- `src/shared/assets/images/verseImg.png` - изображение для блока запоминания.
- `Image.png` - референс по цветам, сейчас лежит в корне и untracked.
- `dashboard-current-screenshot.png` - свежий скриншот текущего состояния, untracked.

## 3. Какие дизайн-решения приняты

- Визуальный стиль: мягкий, devotional, пастельный, молочно-тёплый, без корпоративной аналитики.
- Основной фон должен быть тёплым ivory/milk.
- Палитра должна быть ближе к `Image.png`: больше белого и кремового, меньше плотной серо-лавандовой заливки.
- Акценты остаются lavender, green, gold, но мягче и светлее.
- Раньше было правило `box-shadow: none`; пользователь попросил удалить запрет на тени и добавить минимальные тени как в `Image.png`.
- Сейчас частично добавлены минимальные тени через `--shadow-soft` и `--shadow-card`.
- После добавления теней пользователь попросил вернуть границы в нужные места внутри компонентов.
- В `MemorizationSection` уже начат возврат тонких границ: section, pill, counter, nav buttons, answer button, score card, grade buttons, note, footer.
- Границы должны быть очень светлыми, не тяжёлыми: примерно `rgba(239, 229, 231, 0.6-0.8)`.
- Не менять layout, размеры и тексты при работе только с цветами/тенями/границами.

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

Для скриншота использовался Chrome headless:

```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu --hide-scrollbars --screenshot="dashboard-current-screenshot.png" --window-size=1540,2200 http://localhost:5173/
```

## 5. Что нужно делать дальше

- Продолжить текущую незакоммиченную задачу: довести тени и тонкие границы до состояния, похожего на `Image.png`.
- После завершения обязательно запустить `npm run build`.
- Сделать свежий screenshot и визуально сравнить с `Image.png`.
- Проверить, что границы вернулись только там, где помогают структуре, а не делают UI жёстким.
- Проверить `docs/design-system.md`, чтобы правило про тени больше не конфликтовало с реальным CSS.
- Решить судьбу untracked файлов:
  - `Image.png` - референс, возможно не коммитить;
  - `dashboard-current-screenshot.png` - временный скриншот, обычно не коммитить;
  - `src/shared/assets/images/gosvami.png` - появился untracked, назначение не подтверждено;
  - `src/shared/assets/images/verseImg2.png` - появился untracked, сейчас `MemorizationSection` использует `verseImg.png`, не `verseImg2.png`.
- Если пользователь скажет «сохрани», коммитить только нужные исходники, не временные screenshot/reference, если он явно не попросит.

## 6. Чего нельзя менять

- Не редизайнить весь dashboard при задаче на один компонент.
- Не менять layout, размеры, тексты и структуру, если пользователь просит только цвета/тени/границы.
- Не возвращать поиск в Header без просьбы.
- Не возвращать пункт `Настройки` в Sidebar без просьбы.
- Не удалять текущий dashboard, widgets, routes и `ModulePage`.
- Не ломать маршруты `/`, `/components`, `/japa`, `/books`, `/verses`, `/calendar`, `/statistics`, `/profile`, `/settings`.
- Не удалять `static-preview.html`.
- Не удалять ассеты из `src/shared/assets/images/`, если не проверено, что они не используются.
- Не добавлять Tailwind и новые зависимости без сильной причины.
- Не делать backend или микросервисы в этом репозитории без отдельного согласования.
- Не коммитить `node_modules`, `dist`, временные screenshot-файлы и env-файлы.
- Не заменять CSS Modules глобальными стилями для отдельных компонентов.
