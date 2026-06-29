# Design System

Дизайн-система для проекта **«Путь практики»** — базовые стили, токены и компоненты интерфейса. Этот документ собран по утверждённому экрану дизайн-системы и должен быть главным источником визуальных правил для новых экранов: Главная, Джапа, Чтение книг, Стихи, Календарь, Профиль и Достижения.

Референс сохранён в проекте: `docs/assets/design-system-reference.png`.

---

## 1. Принципы стиля

Интерфейс должен ощущаться как спокойное личное пространство для практики, а не как сухой analytics-dashboard.

Ключевые принципы:

- **мягкий** — плавные формы, низкий контраст, деликатные тени;
- **духовный** — лотос, спокойные символы, devotional-настроение;
- **воздушный** — много пространства, карточки не должны быть тесными;
- **пастельный** — приглушённые lavender/green/gold цвета;
- **дружелюбный** — округлые элементы, понятные подписи, мягкие CTA;
- **спокойный** — без агрессивных цветов, резких границ и тяжёлых теней.

---

## 2. Цветовая палитра

Основные CSS-токены лежат в `src/shared/styles/tokens.css`.

| Назначение | Token | HEX | Использование |
|---|---:|---:|---|
| Primary / Lavender | `--violet` | `#A97AD9` | активные состояния, акценты, progress для чтения, ссылки |
| Primary Light | `--violet-soft` | `#E9D8F7` | активные tabs, hover, мягкие lavender-плашки |
| Background | `--bg` | `#FCFAF8` | общий фон приложения |
| Surface | `--surface` | `#FFFFFF` | основные карточки и поля |
| Surface Soft | `--surface-soft` | `#F7F0FA` | мягкие вторичные карточки, active nav, disabled secondary |
| Text Primary | `--text` | `#2E2438` | заголовки и основной текст |
| Text Secondary | `--muted` | `#6E6277` | описания, подписи, secondary text |
| Border | `--stroke` | `#E9E0EB` | границы карточек, инпутов, кнопок |
| Success / Green | `--green` | `#84B97A` | джапа, подтверждения, включённые toggles, primary CTA |
| Success Light | `--green-soft` | `#E3F0DF` | мягкий зелёный фон, disabled green, календарные отметки |
| Accent Gold | `--gold` | `#D9AE5F` | серии, достижения, огонь, стиховые/тёплые акценты |
| Accent Gold Light | `--gold-soft` | `#F6EBC7` | streak-card, мягкие золотые подложки |
| Warning / Flame | `--warning` | `#FF8A3D` | огонь, предупреждения, горячие акценты |

### Рекомендации по цветам

- Не использовать чистый чёрный для текста. Вместо него — `#2E2438`.
- Не использовать чисто серые холодные UI-фоны. Фон должен оставаться тёплым: `#FCFAF8`.
- Lavender — главный духовный акцент, но не заливать им большие площади.
- Green — для практики Джапы и успешного состояния.
- Gold — для достижений, streak-серий и вдохновляющих деталей.
- Warning/Flame — только точечно, чтобы не сделать интерфейс тревожным.

---

## 3. Типографика

Основной шрифт проекта: **Nunito**.

Подключение в CSS:

```css
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
```

Базовый стек:

```css
font-family: 'Nunito', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

| Роль | Размер | Вес | Пример |
|---|---:|---:|---|
| Display / H1 | `32px` | `700 / Bold` | «Добро пожаловать» |
| H2 | `24px` | `600 / Semibold` | «Мой прогресс» |
| H3 | `18px` | `600 / Semibold` | «Чтение книг» |
| Body | `14px` | `400 / Regular` | основной текст карточек |
| Caption | `12px` | `400 / Regular` | «Ежедневно в 20:00» |

### Правила типографики

- Заголовки могут иметь лёгкое отрицательное `letter-spacing`, но без чрезмерной плотности.
- Body-текст должен оставаться мягким и читабельным.
- Caption не делать слишком бледным: использовать `--muted`, а не сильно прозрачный текст.
- Для кнопок и навигации использовать `600–700`, чтобы они ощущались уверенно.

---

## 4. Отступы, радиусы и тени

### Spacing scale

Используем шкалу `sp`:

| Token | Значение |
|---|---:|
| `--sp-1` | `4px` |
| `--sp-2` | `8px` |
| `--sp-3` | `12px` |
| `--sp-4` | `16px` |
| `--sp-6` | `24px` |
| `--sp-8` | `32px` |

### Radius scale

| Token | Значение | Использование |
|---|---:|---|
| `--radius-sm` | `12px` | маленькие фильтры, compact controls |
| `--radius-md` | `16px` | инпуты, кнопки, небольшие карточки |
| `--radius-lg` | `20px` | карточки среднего размера |
| `--radius-xl` | `24px` | крупные контейнеры и dashboard cards |

### Shadows

В текущем направлении dashboard используются минимальные мягкие тени, как в референсе `Image.png`: они должны слегка отделять белые карточки от тёплого фона, но не делать интерфейс тяжёлым.

Правило:

- для основных карточек использовать очень мягкую тень `var(--shadow-soft)`;
- для крупных ключевых блоков можно использовать `var(--shadow-card)`;
- не использовать `filter: drop-shadow(...)` и декоративный `text-shadow`;
- отделять компоненты цветом, мягкими градиентами, спокойными подложками и деликатной тенью;
- не добавлять резкие hover-тени без отдельной просьбы;
- не использовать жёсткие тени с чёрным цветом.

### Border

Базовая граница:

```css
border: 1px solid #E9E0EB;
```

---

## 5. Кнопки

### Primary button

Используется для основного действия: «Добавить круг», «Начать практику», «Сохранить».

- background: `--green` / `#84B97A`;
- hover: чуть темнее, например `--green-dark`;
- text: `#FFFFFF`;
- radius: `12–16px`;
- height: обычно `36–48px`.

### Secondary button

Используется для спокойных действий: «Найти друзей», «Продолжить», «Настроить».

- background: `--surface-soft` или `--violet-soft`;
- text: `--violet-dark`;
- hover: `--violet-soft`;
- border можно не использовать, если фон хорошо отделяется.

### Tertiary / Ghost

Используется для ссылочных действий: «Смотреть все», «Настроить».

- background: transparent;
- text: `--violet`;
- hover: лёгкая lavender-подложка.

### Small filter

Пример: «Неделя», «Месяц», «Год».

- inactive: surface + border;
- active: `--violet-soft`;
- radius: `999px`;
- text: `12px / 600`.

### Disabled

- background: `--surface-soft` или `--green-soft`;
- text: приглушённый `--muted-2`;
- opacity не опускать слишком сильно, чтобы интерфейс не выглядел сломанным.

---

## 6. Элементы форм

### Search input

- height: `40–44px`;
- radius: `16–22px`;
- background: `--surface`;
- border: `1px solid var(--stroke)`;
- icon: `--muted`;
- placeholder: `--muted-2`.

### Select

- height: `40–44px`;
- radius: `16px`;
- border: `1px solid var(--stroke)`;
- right icon chevron;
- text: `14px / 600`.

### Toggle

Включён:

- track: `--green`;
- knob: `#FFFFFF`.

Выключен:

- track: нейтральный светло-серый;
- knob: `#FFFFFF`.

### Icon button

- size: `40–44px`;
- radius: circle или `16px`;
- border: `1px solid var(--stroke)`;
- background: `--surface`;
- icon: `--text` или `--muted`.

---

## 7. Навигация / Sidebar

Sidebar — ключевой навигационный блок. Он должен быть лёгким, духовным и спокойным.

### Brand area

- логотип лотоса слева;
- текст «Путь практики»;
- шрифт: Nunito, `18–20px`, `700–800`.

### Nav item default

- background: transparent;
- icon: `--muted`;
- text: `--text`;
- height: около `44–48px`;
- radius: `12–16px`.

### Nav item active

- background: `--surface-soft` или мягкий lavender gradient;
- icon: `--violet-dark`;
- text: `--text`;
- можно добавить очень тонкую внутреннюю подсветку.

### Sidebar UX

- Не делать активный пункт слишком ярким.
- Не использовать тяжёлую заливку на весь sidebar.
- Иконки должны быть линейными, мягкими, без агрессивной толщины.

---

## 8. Карточки и компоненты

### Базовая карточка

```css
background: var(--surface);
border: 0;
border-radius: var(--radius-xl);
box-shadow: var(--shadow-soft);
```

### Practice card / «Практика: Джапа»

Состав:

- иконка практики;
- название;
- progress ring;
- следующая цель;
- progress bar;
- короткая статистика;
- primary CTA.

Тональность:

- Джапа: green;
- Чтение книг: lavender;
- Изучение стихов: gold.

### Verse card

- lavender icon circle;
- ссылка/источник стиха в `--violet`;
- основной текст `--text`;
- описание `--muted`;
- progress bar lavender.

### Friend item

- avatar `40–44px`;
- имя `13–14px / 700`;
- статус `11–12px / 400`;
- справа компактный результат практики.

### Reminder item

- icon button / bell;
- название;
- caption-время;
- toggle справа.

### Streak card

- warm gold background: `--gold-soft`;
- flame/lotus illustration;
- title: «25 дней подряд»;
- caption: «Твоя лучшая серия!».

---

## 9. Визуализация данных

### Линейный график прогресса

Цвета линий:

- Джапа: `--green`;
- Чтение книг: `--violet`;
- Изучение стихов: `--gold`.

Правила:

- сетка очень лёгкая, dashed;
- точки маленькие, с белой обводкой;
- tooltip белый, radius `12px`, border `--stroke`, shadow `--shadow-soft`;
- не использовать резкие chart colors.

### Progress bars

- track: очень светлый lavender/green/gold;
- fill: соответствующий accent color;
- height: `5–8px`;
- radius: `999px`.

### Progress ring

- track: `#E9E0EB` или мягкий tint;
- value: tone color;
- stroke width: `7–9px`;
- текст внутри: крупное число + caption.

---

## 10. Иконография и иллюстрации

Иконки должны быть:

- линейные;
- мягкие;
- stroke около `1.75–2px`;
- без залитых тяжёлых форм;
- единый стиль для навигации и карточек.

Базовый набор:

- Главная;
- Джапа;
- Чтение книг;
- Изучение стихов;
- Календарь;
- Друзья;
- Уведомления;
- Настройки;
- Достижения;
- Заметки.

Декоративные элементы:

- лотос;
- мягкий lotus watermark;
- flame + lotus для streak;
- духовные мягкие символы без перегруза.

---

## 11. Layout

- Main app container: `max-width: 1540px`.
- Desktop dashboard: left sidebar + main content + right panel.
- Cards should feel airy, not cramped.
- For desktop dashboard, keep a clear hierarchy:
  1. header;
  2. memorization / important section;
  3. progress visualization;
  4. practice cards;
  5. supportive right panel.

---

## 12. Codex / agent workflow

Когда меняется один компонент, нельзя случайно редизайнить весь экран.

Правило:

1. Найти компонент в `src/widgets/` или `src/shared/ui/`.
2. Править только его `.tsx` и `.module.css`.
3. Общие токены менять только если пользователь явно просит поменять всю систему.
4. После изменения проверить общий dashboard и `/?preview=components`.

Главная цель дизайн-системы — чтобы новые экраны выглядели частью одного продукта: мягкого, духовного, воздушного, пастельного, дружелюбного и спокойного.
