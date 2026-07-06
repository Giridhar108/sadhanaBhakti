# Codex Handoff

## 1. Что уже сделано в проекте

- Проект `hare-krishna`: React + Vite + TypeScript dashboard для практики: джапа, чтение книг, изучение стихов, календарь, статистика, профиль, настройки.
- Добавлена полноценная auth-зона: welcome, login, registration, onboarding из 3 шагов.
- Если пользователь не авторизован, приложение сразу открывает авторизацию.
- Регистрация работает через backend-сессию: email + пароль + повтор пароля.
- Google-авторизация временно полностью удалена из UI и логики.
- Добавлен backend на NestJS в `backend/`.
- Backend использует Prisma, PostgreSQL и Redis через `docker-compose.yml`.
- Реализованы backend endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/users/me`, `PATCH /api/users/me`.
- Сессия хранится в httpOnly cookies `access_token` и `refresh_token`.
- Frontend auth model переведен на backend-сессию.
- Dashboard показывает имя пользователя: сначала духовное имя, если его нет - обычное.
- Приветствие на главной: `Харе Кришна, <имя>`.
- Добавлен запуск frontend + backend одной командой `npm run dev`.

## 2. Какие файлы важны

- `AGENTS.md` - главные правила проекта и стиль работы.
- `docs/design-system.md` - дизайн-система.
- `docs/CODEX_HANDOFF.md` - этот handoff.
- `package.json` - root scripts, включая единый `npm run dev`.
- `docker-compose.yml` - PostgreSQL и Redis для локального backend.
- `scripts/ensure-backend-env.mjs` - создает `backend/.env` из примера.
- `scripts/start-db.mjs` - поднимает Docker Compose и красиво сообщает, если Docker не установлен.
- `backend/` - NestJS backend.
- `backend/.env.example` - пример env для backend.
- `backend/prisma/schema.prisma` - Prisma schema.
- `src/app/router/AppRouter.tsx` - auth gate и роутинг.
- `src/entities/user/model/auth.ts` - frontend auth/session logic.
- `src/entities/user/model/types.ts` - типы пользователя.
- `src/shared/api/endpoints.ts` - API endpoints.
- `src/pages/AuthPage/` - все экраны авторизации и onboarding.
- `src/pages/AuthPage/model/authPageModel.ts` - тексты, схемы и модели auth-страниц.
- `src/shared/assets/images/` - auth и dashboard assets, включая `lotus-logo.png`, `authLotus.png`, teaser card images.

## 3. Какие дизайн-решения приняты

- Общий стиль: мягкий devotional, спокойный, pastel/premium, без корпоративной жесткости.
- Основной шрифт: Nunito.
- Фон: теплый milk/ivory.
- Акценты: lavender, green, gold.
- Карточки: soft white, тонкая граница, мягкая тень, округление.
- Регистрация сделана по макетам из папки `C:\Users\Admin\Desktop\проектСадханы\начальный экран`.
- В auth-зоне используется настоящий лотос `lotus-logo.png` вместо старой контурной иконки.
- Большой декоративный лотос снизу слева заменен на `authLotus.png`.
- Карточки преимуществ на auth-странице вставлены как PNG-картинки, а не сверстаны HTML/CSS.
- Auth layout адаптирован до 360px: левый информационный блок не пропадает, а становится выше формы.
- Onboarding step indicator кликабельный: можно вернуться на предыдущий шаг и исправить ввод.
- Высота onboarding card зафиксирована, чтобы блок не прыгал при переходах между шагами.
- Блоки выбора практик и целей в onboarding должны быть одинаковой высоты: 85px.

## 4. Какие команды запускать

Первичная установка:

```bash
npm install
cd backend && npm install && cd ..
```

Обычный запуск всего проекта одной командой:

```bash
npm run dev
```

Что делает `npm run dev`:

- создает `backend/.env`, если его нет;
- поднимает PostgreSQL и Redis через Docker Compose;
- применяет Prisma schema;
- запускает Vite frontend и NestJS backend параллельно.

Проверки:

```bash
npm run build
npm --prefix backend run build
git status --short
```

Важно: для `npm run dev` нужен установленный и запущенный Docker Desktop.

## 5. Что нужно делать дальше

- Проверить полный auth-flow вручную: регистрация, повтор пароля, login, logout, refresh session, onboarding, переход в dashboard.
- Если Docker установлен, запустить `npm run dev` и проверить реальные backend-сессии в браузере.
- Подумать, какие данные onboarding должны сохраняться в backend окончательно: выбранные практики, цели, духовное имя.
- Довести backend schema под будущие сущности: japa, books, verses, calendar, reminders, friends.
- Перенести dashboard данные с mock/localStorage на backend постепенно, по одному домену.
- Добавить нормальную обработку ошибок auth на frontend: неверный пароль, email занят, session expired.
- После стабилизации backend можно вернуть Google OAuth, но только отдельной задачей и с реальными ключами.

## 6. Чего нельзя менять

- Не возвращать Google auth без отдельной просьбы.
- Не удалять backend-сессию и не возвращать чисто localStorage auth.
- Не редизайнить весь dashboard или всю auth-зону при точечной задаче.
- Не менять утвержденный мягкий devotional стиль на корпоративный dashboard.
- Не добавлять Tailwind.
- Не заменять CSS Modules глобальными стилями для компонентных правок.
- Не менять глобальные design tokens без явной причины.
- Не удалять auth assets из `src/shared/assets/images/`.
- Не трогать чужие/несвязанные изменения в git status.
- Не коммитить `node_modules`, `dist`, screenshots, `.env` файлы.
- Не делать destructive git commands: `git reset --hard`, `git checkout --` без явной просьбы.
