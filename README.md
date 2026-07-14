# Hare Krishna Practice Dashboard

React + Vite + TypeScript dashboard for tracking spiritual practice.

## Development

First install dependencies:

```bash
npm install
cd backend && npm install && cd ..
```

Then start the frontend and backend with one command:

```bash
npm run dev
```

`npm run dev` will:

- create `backend/.env` from `backend/.env.example` if it does not exist;
- start PostgreSQL and Redis through Docker Compose;
- apply the Prisma schema to the local database;
- run the Vite frontend and NestJS backend together.

Docker Desktop must be installed and running before `npm run dev`.

Open the dashboard:

```txt
http://localhost:5173/
```

Open the component preview page:

```txt
http://localhost:5173/?preview=components
```

## Project Pointers

- Main dashboard screen: `src/pages/DashboardPage/`
- Widgets and shared UI: `src/widgets/`, `src/shared/ui/`
- Project rules: `AGENTS.md`
- Design system: `docs/design-system.md`
- Component map: `docs/components-map.md`

## Production

The production stack uses Docker Compose for PostgreSQL, the NestJS API and the
Nginx frontend container. A host-level Nginx instance terminates HTTPS and
forwards traffic to the stack on `127.0.0.1:8080`.

See `docs/deployment.md` for the first deployment, updates, backups and restore
instructions.

## UI Baseline

- Font: Nunito.
- Main design tokens: `docs/design-system.md`.
- Design-system reference image: `docs/assets/design-system-reference.png`.
