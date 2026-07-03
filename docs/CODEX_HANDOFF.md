# Codex Handoff

## 1. Что уже сделано в проекте

- Проект `hare-krishna` - React + Vite + TypeScript dashboard для духовной практики: джапа, книги, стихи, календарь, прогресс, профиль и настройки.
- Текущая ветка: `design`.
- Последний коммит: `10ae536 Enhance settings and practice calendar`.
- Основные маршруты: `/`, `/components`, `/japa`, `/books`, `/verses`, `/calendar`, `/statistics`, `/profile`, `/settings`.
- Главная страница показывает `Header`, слева `VerseImageBlock`, `PracticeCardsGrid`, `QuoteCard`, справа `CalendarCard`.
- `CalendarCard` стал настоящим календарем: считает дни месяца, переключает месяцы, подсвечивает текущий день, выбранный день и дни с событиями.
- В `/settings` добавлена карточная страница настроек в мягком devotional-стиле.
- В настройках можно добавлять календарные события; они сохраняются в `localStorage`, отображаются в календаре и на странице `/calendar`.
- В настройках можно добавлять любое количество стихов дня: картинка с круглым crop-попапом, текст стиха и источник.
- `QuoteCard` на главной читает список стихов дня и плавно сменяет их каждые 2 минуты. Если список пустой, показывает стандартный стих.
- Бренд-зона `Садхана Бхакти` в сайдбаре теперь кликабельна и ведет на `/`.
- `Header`: поиск убран, настройки ведут на `/settings`.
- `Sidebar`: отдельный пункт `Настройки` не возвращать без явной просьбы.
- `MemorizationSection` сохранен в проекте, но сейчас не выводится на главной.

## 2. Какие файлы важны

- `AGENTS.md` - правила работы в проекте.
- `docs/design-system.md` - дизайн-система и визуальные правила.
- `docs/assets/design-system-reference.png` - визуальный референс дизайн-системы.
- `src/shared/styles/tokens.css` - глобальные цвета, радиусы, тени, spacing.
- `src/shared/styles/globals.css` - глобальные стили; там есть `scrollbar-gutter: stable`.
- `src/pages/DashboardPage/DashboardPage.tsx` и `.module.css` - состав и сетка главной.
- `src/pages/SettingsPage/SettingsPage.tsx` и `.module.css` - новая карточная страница настроек.
- `src/pages/CalendarPage/CalendarPage.tsx` - отдельная страница календаря и список событий.
- `src/widgets/CalendarCard/` - настоящий календарь на dashboard.
- `src/widgets/QuoteCard/` - блок стиха дня с автосменой.
- `src/widgets/Sidebar/` - навигация и кликабельный бренд.
- `src/shared/lib/calendarEvents.ts` - localStorage-хранилище календарных событий.
- `src/shared/lib/dailyVerse.ts` - localStorage-хранилище списка стихов дня.
- `src/shared/assets/images/` - текущие изображения: `verseImg2.png`, `lotus-soft.png`, `lotus-logo.png`, `krishna.png` и другие.

## 3. Какие дизайн-решения приняты

- Общий стиль: мягкий, спокойный, devotional, pastel, premium, без корпоративной аналитики.
- Основной фон теплый молочный/ivory; карточки светлые, с тонкими границами и мягкими тенями.
- Акценты: lavender, green, gold из токенов.
- Main app container: `max-width: 1540px`, центрированный.
- Используется Nunito как базовый UI-шрифт.
- Компонентные стили делать через CSS Modules.
- Страница настроек выбрана в варианте `Devotional Cards`: крупные мягкие карточки, иконки, лотосные watermark, понятные формы.
- `CalendarCard` должен оставаться компактным и помещаться в верхнюю правую карточку dashboard.
- Дни календаря с событиями отмечаются зеленым фоном и маленькой золотой точкой.
- `QuoteCard` построен сеткой: слева круглая картинка, справа текст и источник, чтобы изображение не наезжало на текст.
- Лотос в `QuoteCard` использует `lotus-soft.png`.
- Скроллбар не должен быть видимым постоянно; для стабильности layout используется `scrollbar-gutter: stable`.

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

Скриншот через Chrome:

```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu --hide-scrollbars --screenshot="dashboard-current-screenshot.png" --window-size=1540,2200 http://localhost:5173/
```

После любых изменений запускать:

```bash
npm run build
git status --short
```

## 5. Что нужно делать дальше

- Визуально проверить `/settings` после добавления нескольких стихов дня: длинные тексты, несколько картинок, удаление, пустое состояние.
- При необходимости уплотнить страницу настроек по высоте, если карточки покажутся слишком воздушными.
- Проверить `QuoteCard` с 2-3 стихами: fade-переход, отсутствие наезда картинки на текст, длинные источники.
- Проверить `/calendar`: добавление событий в настройках, подсветка дней, список событий.
- Решить, нужен ли возврат `MemorizationSection` на главную. Если возвращать, не потерять логику 4 стихов, стрелки, показ/скрытие ответа и tooltip.
- При каждом изменении сохранять точечность: менять только нужный компонент и его CSS.
- Перед новым коммитом проверять `git status`, чтобы не добавить `dist`, screenshots или временные файлы.

## 6. Чего нельзя менять

- Не редизайнить весь dashboard при задаче на один блок.
- Не возвращать поиск в `Header` без явной просьбы.
- Не возвращать пункт `Настройки` в `Sidebar` без явной просьбы.
- Не удалять маршруты `/`, `/components`, `/japa`, `/books`, `/verses`, `/calendar`, `/statistics`, `/profile`, `/settings`.
- Не удалять `static-preview.html`.
- Не удалять ассеты из `src/shared/assets/images/`, пока не проверено, что они нигде не используются.
- Не добавлять Tailwind, backend или новые зависимости без отдельного согласования.
- Не заменять CSS Modules глобальными стилями для компонентных правок.
- Не коммитить `node_modules`, `dist`, временные screenshot-файлы и env-файлы.
- Не менять глобальные токены без явной причины или просьбы изменить дизайн-систему.
