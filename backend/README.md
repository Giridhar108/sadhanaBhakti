# Hare Krishna API

NestJS backend for auth and user profile data.

## Stack

- NestJS + TypeScript
- PostgreSQL + Prisma
- JWT access token
- Refresh token in httpOnly cookie

## Local Setup

1. Copy env file:

```bash
cp .env.example .env
```

2. Start infrastructure from project root:

```bash
docker compose up -d
```

3. Install and prepare backend:

```bash
cd backend
npm install
npm run prisma:migrate
npm run dev
```

The frontend dev server proxies `/api` to `http://localhost:4000`.

## Database migrations

Production uses committed Prisma migrations:

```bash
npm run prisma:deploy
```

When changing `prisma/schema.prisma`, create and commit a migration locally:

```bash
npm run prisma:migrate -- --name describe_the_change
```

Do not use `prisma db push` against the production database.

## Auth Endpoints

```txt
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout

GET   /api/users/me
PATCH /api/users/me

GET /api/health
```
