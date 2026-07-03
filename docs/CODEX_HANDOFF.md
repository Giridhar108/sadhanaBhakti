# Codex Handoff

## 1. Что уже сделано в проекте

- Проект `hare-krishna` - React + Vite + TypeScript dashboard для практики: джапа, книги, стихи, календарь, прогресс.
- Текущая ветка: `design`.
- Последний коммит: `1ad8de6 Add verse image dashboard block`.
- Архитектура разложена по слоям `app`, `pages`, `widgets`, `features`, `entities`, `shared`.
- Есть маршруты `/`, `/components`, `/japa`, `/books`, `/verses`, `/calendar`, `/statistics`, `/profile`, `/settings`.
- `Header`: поиск убран, настройки ведут на `/settings`.
- `Sidebar`: пункт `Настройки` убран.
- На главном dashboard сейчас показываются `Header`, затем основная сетка: слева `VerseImageBlock`, `PracticeCardsGrid`, `QuoteCard`; справа `CalendarCard`.
- `MemorizationSection` с интерактивной проверкой стихов 3.27-3.30 сохранен в проекте, но сейчас закомментирован в `DashboardPage.tsx`.
- Отдельный блок `VerseImageBlock` добавлен и использует `src/shared/assets/images/verseImg2.png`.
- `VerseImageBlock` сделан одной высоты с календарем через `--top-card-height`; картинка использует `object-fit: cover`.
- `ProgressChartCard`, `FriendsCard`, `RemindersCard` скрыты с главного dashboard.
- В текущем рабочем дереве есть незакоммиченные изменения: из `CalendarCard` удален нижний streak-блок `25 дней подряд`.

## 2. Какие файлы важны

- `AGENTS.md` - правила работы в проекте.
- `docs/design-system.md` - дизайн-система и визуальные правила.
- `docs/CODEX_HANDOFF.md` - этот handoff.
- `src/shared/styles/tokens.css` - глобальные цвета, радиусы, тени.
- `src/pages/DashboardPage/DashboardPage.tsx` - состав главного dashboard.
- `src/pages/DashboardPage/DashboardPage.module.css` - сетка dashboard и высота верхней пары блоков.
- `src/widgets/VerseImageBlock/` - отдельная картинка `verseImg2.png`.
- `src/widgets/MemorizationSection/` - интерактивный блок проверки стихов, сейчас не выводится.
- `src/widgets/CalendarCard/` - календарь; streak-блок удален, но изменение пока не закоммичено.
- `src/widgets/PracticeCardsGrid/`, `PracticeCard/`, `QuoteCard/` - видимые нижние блоки dashboard.
- `src/shared/assets/images/verseImg2.png` - большая иллюстрация для `VerseImageBlock` и текущего `MemorizationSection`.

## 3. Какие дизайн-решения приняты

- Стиль: мягкий, devotional, пастельный, молочно-ivory, без ощущения корпоративной аналитики.
- Main container остается `max-width: 1540px` и центрируется.
- Блоки должны быть светлыми, с тонкими границами и мягкими тенями.
- Акценты: lavender, green, gold.
- Не использовать Tailwind и не добавлять зависимости без сильной причины.
- CSS Modules остаются основным способом стилизации компонентов.
- Точечные правки делать только в нужном компоненте, без случайного редизайна всего dashboard.
- Для `VerseImageBlock` принято: картинка обрезается через `object-fit: cover` и визуально совпадает по высоте с календарем.
- Для `CalendarCard` принято убрать нижнюю streak-карточку, оставив только календарную сетку.

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

Для скриншота:

```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu --hide-scrollbars --screenshot="dashboard-current-screenshot.png" --window-size=1540,2200 http://localhost:5173/
```

## 5. Что нужно делать дальше

- Если пользователь подтвердит текущее состояние календаря, закоммитить удаление streak-блока из `CalendarCard`.
- Проверить визуально, устраивает ли высота `VerseImageBlock` относительно календаря.
- Решить, нужен ли на главной странице `MemorizationSection`; сейчас он закомментирован, но сохранен.
- Если `MemorizationSection` возвращать, не потерять логику 4 стихов, стрелки, показ/скрытие ответа и tooltip.
- После любых изменений запускать `npm run build`.
- Перед коммитом проверять `git status`, чтобы не зацепить временные скриншоты или лишние ассеты.

## 6. Чего нельзя менять

- Не редизайнить весь dashboard при задаче на один блок.
- Не возвращать поиск в `Header` без явной просьбы.
- Не возвращать пункт `Настройки` в `Sidebar` без явной просьбы.
- Не удалять маршруты `/`, `/components`, `/japa`, `/books`, `/verses`, `/calendar`, `/statistics`, `/profile`, `/settings`.
- Не удалять `static-preview.html`.
- Не удалять ассеты из `src/shared/assets/images/`, пока не проверено, что они не используются.
- Не добавлять Tailwind, backend или новые зависимости без отдельного согласования.
- Не коммитить `node_modules`, `dist`, временные screenshot-файлы и env-файлы.
- Не заменять CSS Modules глобальными стилями для компонентных правок.
