# DocReview — Blog/Document Review Platform

A full-stack blog platform where users submit documents and reviewers approve or reject them.

| Service | Tech | Port |
|---|---|---|
| `web` | Next.js 16 (React 19, Tailwind 4) | 3001 |
| `api` | Express 5 + PostgreSQL (pg) | 3000 |
| `postgres` | PostgreSQL 16 | 5434 (host) |

## Prerequisites

- Docker (with Compose)
- Node.js 22+ (only needed for local-dev mode)

## Option A — Everything in Docker (recommended)

```bash
docker compose up -d --build
```

- App: http://localhost:3001
- API: http://localhost:3000
- API health check: http://localhost:3000/health

**Stop:**

```bash
docker compose down          # stop + remove containers (data volumes kept)
docker compose stop          # stop, keep containers
```

**Rebuild after code changes:**

```bash
docker compose up -d --build
```

**Logs:**

```bash
docker compose logs -f api   # or: web, postgres, migrate
```

## Option B — Local dev servers (hot reload) + Docker postgres

Requires `api/.env` (see `api/.env.example`). It already points to
`postgresql://bloguser:blogpass@localhost:5434/blogdb`, which matches the
container port mapping — no changes needed.

**Terminal 1 — database:**

```bash
docker compose up -d postgres
```

**Terminal 2 — API:**

```bash
cd api
npm run dev
```

**Terminal 3 — web:**

```bash
cd web
npm run dev
```

**Stop:** `Ctrl+C` in each terminal, then optionally
`docker compose stop postgres`.

> Note: Options A and B cannot run at the same time — ports 3000/3001 clash.
> Before switching from local dev to Docker, stop the dev servers first.

## Database setup

Schema is auto-applied on a fresh postgres volume (init.sql mount). For an
existing volume, run the migration manually:

```bash
docker compose run --rm migrate
```

The SQL is idempotent — safe to run repeatedly.

## Roles

- **First user to register** automatically becomes `REVIEWER`.
- **Reviewers** review documents (Pass/Fail) and can promote/demote other
  users (`POST /auth/promote/:id`, `POST /auth/demote/:id`).
- **Reviewers cannot create documents** — only regular users submit docs.
- A reviewer cannot be registered as a reviewer afterwards; promotion is done
  by an existing reviewer.

## Notes

- Uploaded files are stored in the `uploads` Docker volume (persisted across
  restarts).
- `JWT_SECRET` is set in `docker-compose.yml` (dev value) — change it for any
  real deployment.
