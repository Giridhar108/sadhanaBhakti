# Codex Handoff

## 1. Что уже сделано в проекте

- `hare-krishna` - React + Vite + TypeScript dashboard для духовной практики: джапа, чтение книг, стихи, календарь, друзья, прогресс, профиль и настройки.
- Есть auth-зона: welcome, login, registration и onboarding из 3 шагов.
- Авторизация работает через NestJS backend в `backend/`, Prisma, PostgreSQL и Redis; сессия хранится в httpOnly cookies `access_token` и `refresh_token`.
- Реализованы auth/user endpoints: register, login, refresh, logout, `GET/PATCH /api/users/me`; Google auth временно удален из UI и логики.
- Настройки практики сохраняются на backend: ежедневное напоминание, цель кругов, дата начала ежедневной практики, тема, события календаря, стихи дня.
- Для глобальной цели кругов есть история `japaGoalHistory`: до даты изменения считается 16 кругов/день, после даты изменения - новая цель.
- Страница `Моя джапа` кастомизирована: большой круговой progress, таймер, аудиоплеер, блок ритма, стих дня и общий прогресс до `35 000 000` мантр.
- Добавлен backend-домен `japa`: дневные круги и дневная цель сохраняются в `JapaDailyProgress` по `userId + date`.
- На странице джапы кнопки `+1`, `+4`, `Добавить 16 кругов` сохраняют сегодняшние круги на backend; после reload они восстанавливаются.
- Поле `Цель на день` на странице джапы сохраняется только для текущего дня (`goalRounds`) и не меняет глобальную цель в настройках.
- Блок `Общий прогресс` прибавляет сегодняшние фактически добавленные круги к расчетному прогрессу от даты старта практики.
- В sidebar заменены иконки на PNG `01_home.png` ... `07_settings.png`; настройки перенесены из header в sidebar.
- В header остались уведомления (`08_notifications.png`) и профиль (`09_profile.png`).
- Добавлен preview-режим без авторизации для локальной проверки: `?preview=app`; выключение: `?preview=off`.
- Последние важные коммиты: `f9045ee Persist daily japa progress`, `365a726 Update navigation icons`.

## 2. Какие файлы важны

- `AGENTS.md` - правила проекта и стиль работы.
- `docs/design-system.md` - дизайн-система и визуальные токены.
- `docs/assets/design-system-reference.png` - утвержденный визуальный референс.
- `package.json` - root scripts, включая `npm run dev`, `npm run build`.
- `docker-compose.yml` - PostgreSQL и Redis.
- `backend/prisma/schema.prisma` - Prisma schema: `User`, `AudioTrack`, `JapaDailyProgress`.
- `backend/src/modules/japa/` - backend endpoints `GET/PATCH /api/japa/today`.
- `backend/src/modules/users/` - user DTO/service/controller для сохранения настроек.
- `src/app/router/AppRouter.tsx` - auth gate, routing и preview-режим.
- `src/entities/user/model/auth.ts` и `types.ts` - frontend auth/session logic, default settings и типы пользователя.
- `src/entities/japa-session/api/japaApi.ts` и `model/types.ts` - frontend API/типы дневной джапы.
- `src/shared/api/endpoints.ts` и `src/shared/api/httpClient.ts` - frontend API слой.
- `src/shared/lib/japaProgress.ts` - расчет 35 млн мантр, дневных кругов, склонений и дат.
- `src/pages/MyJapaPage/MyJapaPage.tsx` и `.module.css` - страница джапы.
- `src/pages/SettingsPage/SettingsPage.tsx` и `.module.css` - настройки практики, аудио, календаря, стихов и темы.
- `src/widgets/Sidebar/Sidebar.tsx` и `.module.css` - навигация и новые PNG-иконки.
- `src/widgets/Header/Header.tsx` и `.module.css` - верхняя панель, уведомления, профиль.
- `src/shared/assets/images/` - все изображения; новые nav/header иконки: `01_home.png` ... `09_profile.png`.

## 3. Какие дизайн-решения приняты

- Стиль: мягкий devotional, calm, pastel/premium, не корпоративный dashboard.
- Основной шрифт: Nunito.
- Фон: теплый milk/ivory.
- Акценты: lavender, green, gold; без неона, резкого контраста и тяжелых теней.
- Карточки: soft white/warm surface, деликатные границы, мягкие тени, округления.
- Main app container: `max-width: 1540px`, центрированный.
- Использовать CSS Modules, не Tailwind.
- Новые иконки меню - обрезанные PNG без лишнего прозрачного поля; текущий размер sidebar-иконок `48px`.
- Для компонентных задач менять только нужные `.tsx` и `.module.css`, если не требуется shared token/schema/helper.
- Пользователь предпочитает точные итерации: не редизайнить весь экран при изменении одной карточки или одного меню.

## 4. Какие команды запускать

Первичная установка:

```bash
npm install
cd backend && npm install && cd ..
```

Обычный запуск всего проекта:

```bash
npm run dev
```

Раздельный запуск:

```bash
npm run dev:web
npm --prefix backend run dev
```

Проверки:

```bash
npm run build
npm --prefix backend run build
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:push
git status --short
```

Важно:

- Frontend dev-server: `http://localhost:5173/`.
- Backend API: `http://localhost:4000/api`.
- Vite proxy `/api` ведет на `http://localhost:4000`.
- Для полного `npm run dev` нужен установленный и запущенный Docker Desktop.
- Если Prisma `generate` падает на Windows с `EPERM rename query_engine...`, backend держит Prisma DLL. Остановить backend-процесс, выполнить `prisma:generate`/`prisma:push`, затем снова запустить backend.

## 5. Что нужно делать дальше

- Вручную проверить полный auth-flow: регистрация, login, logout, refresh, onboarding, переход в dashboard.
- Вручную проверить сохранение настроек через UI: цель кругов, дата начала практики, напоминание, тема, события, стихи.
- Вручную проверить дневную джапу: добавить круги, поменять `Цель на день`, reload, убедиться что `rounds` и `goalRounds` восстановились.
- Проверить, что общий прогресс на странице джапы соответствует принятой логике: расчет от даты старта + сегодняшние фактически добавленные круги.
- Если пользователь попросит строгую историю всех реально прочитанных дней, расширять `JapaDailyProgress`/историю, а не подменять текущий расчет.
- Продолжать перенос остальных mock/localStorage данных на backend только по одному домену и по запросу.
- При новых backend-полях не забывать: Prisma schema, DTO validation, DTO/types, frontend types, `prisma:generate`, `prisma:push`.

## 6. Чего нельзя менять

- Не возвращать Google auth без отдельной просьбы.
- Не удалять backend-сессию и не возвращать чистый localStorage auth.
- Не редизайнить весь dashboard, auth-зону или страницу джапы при точечной задаче.
- Не менять утвержденный мягкий devotional стиль на корпоративный.
- Не добавлять Tailwind.
- Не заменять CSS Modules глобальными стилями для компонентных правок.
- Не менять глобальные design tokens без явной причины.
- Не удалять assets из `src/shared/assets/images/`, особенно auth assets, lotus assets, `play.svg`, `pause.svg` и новые `01_...09_` PNG.
- Не делать визуальные проверки/скриншоты, если пользователь явно не попросил.
- Не сохранять временные скриншоты, профили Chrome или другие артефакты в репозитории.
- Не трогать чужие/несвязанные изменения в `git status`.
- Не коммитить `node_modules`, `dist`, screenshots, `.env`.
- Не делать destructive git commands (`git reset --hard`, `git checkout --`) без явной просьбы.
