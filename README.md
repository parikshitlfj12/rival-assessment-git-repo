# Rival Tasks

A full-stack task management application built for the Rival assessment. Users can sign up, authenticate with secure httpOnly cookie sessions, and manage personal tasks with filtering, search, sorting, and pagination.

## Tech stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js App Router, React, TypeScript, Tailwind CSS |
| Backend | Next.js Route Handlers |
| Database | PostgreSQL |
| ORM | Prisma |
| Validation | Zod |
| Auth | bcrypt + DB-backed sessions in httpOnly cookies |
| UI extras | next-themes, sonner |
| Tests | Vitest |

## Prerequisites

- Node.js 20+ (for local development without Docker)
- PostgreSQL 14+ (for local development without Docker)
- Docker Desktop or Docker Engine + Compose v2 (for one-command setup)

## Quick start (Docker)

Run the full stack (PostgreSQL, migrations, and app) with one command:

```bash
docker compose up --build
```

Or:

```bash
npm run docker:up
```

Open [http://localhost:3000](http://localhost:3000).

The compose file starts:

1. **db** — PostgreSQL 16 with a persistent volume
2. **migrate** — applies Prisma migrations once
3. **app** — production Next.js server on port 3000

Optional: set admin emails for the containerized app:

```bash
ADMIN_EMAILS=you@example.com docker compose up --build
```

Stop containers:

```bash
npm run docker:down
```

Remove containers and volumes (fresh database):

```bash
npm run docker:reset
```

## Local setup (without Docker)

```bash
cp .env.example .env
# edit DATABASE_URL and SESSION_SECRET
npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Generate Prisma client and build Next.js |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest integration tests |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Create/apply local migrations |
| `npm run db:migrate:deploy` | Apply migrations in CI/production |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:push` | Push schema without migration history |
| `npm run docker:up` | Build and start app + Postgres via Docker Compose |
| `npm run docker:down` | Stop Docker Compose services |
| `npm run docker:reset` | Stop services and delete Docker volumes |

## API overview

All responses use `{ data, error }`.

### Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Create account and session |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Clear session |
| GET | `/api/auth/me` | Current user |

### Tasks (authenticated)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tasks` | List with filter/search/sort/pagination |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/[id]` | Get one task |
| PATCH | `/api/tasks/[id]` | Update task |
| DELETE | `/api/tasks/[id]` | Hard delete task (204 empty body) |
| GET | `/api/tasks/[id]/activity` | Task change history |
| GET | `/api/tasks/[id]/attachments` | List attachments for a task |
| POST | `/api/tasks/[id]/attachments` | Upload attachment (`multipart/form-data`, field `file`) |
| GET | `/api/tasks/[id]/attachments/[attachmentId]` | Download attachment |
| DELETE | `/api/tasks/[id]/attachments/[attachmentId]` | Remove attachment |
| GET | `/api/tasks/events` | Server-sent events stream for task changes |
| GET | `/api/admin/tasks` | Admin-only cross-user task list |

## Assumptions & trade-offs

- Task statuses are `todo`, `in_progress`, and `done`.
- Timestamps are stored in UTC (`timestamptz`) and formatted locally in the UI.
- Authentication uses DB-backed sessions in httpOnly cookies, not JWT in localStorage.
- Tasks are hard-deleted.
- Search matches task titles only (case-insensitive).
- API routes live in Next.js instead of a separate Go service, per the assessment brief.
- Delete responses return HTTP 204 with an empty body.
- Due date sorting uses NULLS LAST for ascending order and NULLS FIRST for descending order.
- Priority sorting uses in-memory ordering (high > medium > low) after fetching filtered rows; suitable for paginated personal task lists.
- Bonus features implemented: optimistic UI, dark/light theme toggle, GitHub Actions CI, admin RBAC, per-task activity log, real-time task updates via SSE, task file attachments, Docker Compose one-command local setup.
- Real-time updates use an in-process SSE pub/sub channel (works for local dev and single-instance deploys; multi-instance production would need a shared bus).
- Attachments are stored on the local filesystem under `UPLOAD_DIR` (default `.uploads/`). This works for local dev, Docker Compose (persistent volume), and any single-server deploy with a writable disk.
- **Attachments on Vercel:** Serverless functions only allow writes under `/tmp`. Set `UPLOAD_DIR=/tmp/rival-uploads` (or similar) in Vercel env vars — without it, uploads fail because the project directory is read-only. With `/tmp`, uploads work for demo and single-session use, but files are **not** durable across redeploys, cold starts, or requests routed to a different instance. Task CRUD, auth, activity log, SSE, and admin work normally in production; durable attachments would need object storage (e.g. Supabase Storage, S3). Fully persistent attachment testing: local dev or Docker Compose.

## Deployment

Recommended setup:

| Component | Platform |
|-----------|----------|
| Next.js app | Vercel |
| PostgreSQL | Neon or Supabase |

### Supabase database (local or production)

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → Database**, copy the **URI** under **Connection string → Direct connection** (use direct connection for Prisma migrations, not the pooler-only URL).
3. Replace `[YOUR-PASSWORD]` with your database password.
4. Put the URI in `.env` as `DATABASE_URL` (append `?sslmode=require` if it is not already in the string).
5. Apply migrations from your machine:

```bash
npx prisma migrate deploy
```

6. Start the app locally against Supabase:

```bash
npm run dev
```

For **Vercel**, use the **Transaction pooler** connection string (port `6543`) as `DATABASE_URL` in Vercel env vars for runtime, but run `prisma migrate deploy` once from your laptop using the **direct** connection string above.

Steps:

1. Create a managed PostgreSQL database (Supabase or Neon) and copy the connection string.
2. Configure Vercel env vars: `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV=production`, `NEXT_PUBLIC_APP_URL`, and `UPLOAD_DIR=/tmp/rival-uploads` if you want to demo attachments on the live URL.
3. Run `npx prisma migrate deploy` against production once from your machine (direct Supabase connection).
4. Deploy the Next.js app to Vercel (`postinstall` runs `prisma generate`).
5. Smoke-test signup and task CRUD on the live URL. Optional: upload an attachment via **Edit task** on Vercel (demo-only; see trade-offs above). For persistent file storage, use local dev or Docker Compose.

## Testing

By default, `npm run test` spins up an embedded PostgreSQL instance (via `embedded-postgres`), applies migrations, and runs integration tests.

To use an external test database instead:

```bash
set USE_EXTERNAL_TEST_DB=true
set DATABASE_URL=postgresql://test:test@localhost:5432/rival_test
npx prisma migrate deploy
npm run test
```

Tests cover auth flow, task creation with user scoping, cross-user isolation, and list filtering/sorting/pagination.
