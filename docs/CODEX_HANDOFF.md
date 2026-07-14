# Codex Handoff

Актуально на 11 июля 2026 года. Ветка: `design`. Последний production-коммит: `38d6d9f`.

## 1. Что уже сделано

- React + Vite + TypeScript dashboard для джапы, чтения, стихов, календаря, прогресса, профиля и настроек.
- Есть welcome/login/register, onboarding и auth gate. Backend: NestJS + Prisma + PostgreSQL; сессия в httpOnly cookies `access_token` и `refresh_token`. Google auth удалён.
- Настройки пользователя, события календаря, стихи дня и история глобальной цели джапы сохраняются через backend.
- `Моя джапа`: круговой прогресс, таймер, аудиоплеер, ритм, стих дня и цель `35 000 000` мантр. `+1`, `+4`, `+16` и дневная цель сохраняются в `JapaDailyProgress` по `userId + date`.
- Аудиотреки загружаются через API и хранятся в настраиваемом каталоге; в production он подключён как постоянный Docker volume.
- Production подготовлен: Docker-образы frontend/backend, `compose.production.yml`, Nginx, initial Prisma migration, healthcheck с проверкой БД, env validation, persistent volumes, deploy/backup scripts и инструкция.
- Production-стек проверен на чистой БД: migration, auth, SPA fallback, healthcheck, пересоздание API и сохранность volumes прошли успешно. В интернет проект ещё не развёрнут.
- В рабочем дереве есть три незакоммиченных пользовательских файла: `ShrilaPrabhupada.png`, `ShrilaPrabhupada1.png`, `ShrilaPrabhupada2.png`. Не удалять и не коммитить без отдельного решения.

## 2. Важные файлы

- `AGENTS.md`, `docs/design-system.md`, `src/shared/styles/tokens.css` — правила и дизайн-токены.
- `src/app/router/AppRouter.tsx` — маршруты, auth gate и preview (`?preview=app`, `?preview=off`, legacy `?preview=components`).
- `src/entities/user/model/auth.ts`, `src/shared/api/` — frontend auth/API.
- `src/pages/MyJapaPage/`, `src/entities/japa-session/`, `src/shared/lib/japaProgress.ts` — джапа и расчёт прогресса.
- `src/pages/SettingsPage/` — пользовательские настройки, календарь, стихи и аудио.
- `backend/prisma/schema.prisma`, `backend/prisma/migrations/` — схема и production migrations.
- `backend/src/modules/auth/`, `users/`, `japa/`, `audio/`, `health/` — backend-домены.
- `backend/src/config/env.ts` — обязательные production env и проверка секретов/HTTPS.
- `Dockerfile`, `backend/Dockerfile`, `compose.production.yml` — production stack.
- `.env.production.example`, `deploy/deploy.sh`, `deploy/backup.sh`, `deploy/nginx/`, `docs/deployment.md` — развёртывание, HTTPS и бэкапы.

## 3. Принятые дизайн-решения

- Стиль: спокойный devotional, pastel/premium, не корпоративный dashboard.
- Nunito; тёплый milk/ivory фон; lavender, green и gold accents; мягкие поверхности, границы и тени.
- Main container: `max-width: 1540px`, по центру.
- CSS Modules, компоненты в отдельных папках; глобальные цвета/radius/shadows только через tokens.
- Навигация использует PNG `01_home.png` ... `09_profile.png`; sidebar-иконки около `48px`.
- Изменения должны быть точечными: одна карточка/страница не является поводом переделывать весь интерфейс.

## 4. Команды

```bash
# установка
npm ci
npm --prefix backend ci

# локально: frontend + backend + PostgreSQL/Redis
npm run dev

# проверки
npm run build:all
npm --prefix backend run prisma:generate
cd backend && npx prisma validate && cd ..
git status --short

# новая Prisma migration после изменения schema.prisma
npm --prefix backend run prisma:migrate -- --name short_description

# production (Linux VPS)
cp .env.production.example .env.production
# заполнить домен и секреты, затем:
chmod +x deploy/deploy.sh deploy/backup.sh
./deploy/deploy.sh
./deploy/backup.sh
```

Frontend: `http://localhost:5173`; API: `http://localhost:4000/api`. Для `npm run dev` нужен запущенный Docker Desktop. Полный production-порядок описан в `docs/deployment.md`.

## 5. Что делать дальше

1. Решить, нужны ли три `ShrilaPrabhupada*.png`, и отдельно добавить их в подходящий UI/коммит либо оставить вне Git.
2. Для публикации: подготовить VPS и домен, заполнить `.env.production`, запустить `deploy/deploy.sh`, установить host Nginx config и выпустить HTTPS через Certbot.
3. После деплоя выполнить smoke test: register/login/logout/refresh, onboarding, сохранение настроек, дневная джапа после reload, upload/play/delete аудио, restart stack.
4. Настроить ежедневный `deploy/backup.sh` и внешнее хранение дампов; проверить восстановление.
5. Дальше переносить оставшиеся mock/localStorage-домены на backend по одному. Для каждой новой схемы создавать и коммитить Prisma migration.

Если production БД уже непустая и раньше управлялась через `prisma db push`, initial migration нельзя применять напрямую: сначала нужен backup и Prisma baseline.

## 6. Чего нельзя менять

- Не возвращать Google auth и localStorage-only auth; не ослаблять httpOnly/Secure cookies.
- Не запускать `prisma db push` на production и не удалять существующие migrations.
- Не коммитить `.env`, секреты, `node_modules`, `dist`, `backups`, uploads и временные screenshots.
- Не открывать PostgreSQL `5432` наружу; production web должен идти через HTTPS/Nginx.
- Не добавлять Tailwind и не заменять CSS Modules без явной просьбы.
- Не менять глобальные tokens, approved devotional style, layout и assets при точечной задаче.
- Не ломать семантику джапы: дневная цель не меняет глобальную; фактические круги сохраняются по дате; общий target — `35 000 000` мантр.
- Не удалять assets, особенно `01_...09_`, lotus/auth/audio изображения, `play.svg` и `pause.svg`.
- Не трогать чужие изменения в `git status` и не использовать destructive git commands без явной просьбы.
