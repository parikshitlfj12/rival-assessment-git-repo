# Rival Tasks

A full-stack task management application built for the Rival assessment.

**Live demo:** [https://rival-assessment-git-repo.vercel.app/](https://rival-assessment-git-repo.vercel.app/)

Users can sign up, authenticate with secure httpOnly cookie sessions, and manage personal tasks with filtering, search, sorting, and pagination.

## Assessment coverage

| Requirement | Status |
|-------------|--------|
| **Task 1 — REST API** (CRUD, validation, PostgreSQL, consistent errors) | Done |
| **Task 2 — Auth** (signup/login, hashed passwords, protected routes, user scoping, persisted session) | Done |
| **Task 3 — Frontend** (list, filters, pagination, create/edit, complete/delete, loading/empty/error, responsive) | Done |
| **Task 4 — Search & sort** (title search, sort by due/priority/created, combined with filters) | Done |
| **Task 5 — Deliverables** (README, `.env.example`, tests, setup instructions) | Done |

### Bonus features

| Feature | Status |
|---------|--------|
| Admin role (view all users' tasks + attachments) | Done |
| Real-time updates (SSE) | Done |
| Optimistic UI with rollback | Done |
| Task attachments | Done |
| Activity log per task | Done |
| Docker Compose one-command setup | Done |
| Dark mode (persisted) | Done |

## Tech stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js App Router, React, TypeScript, Tailwind CSS |
| Backend | Next.js Route Handlers (TypeScript) |
| Database | PostgreSQL |
| ORM | Prisma |
| Validation | Zod |
| Auth | bcrypt + DB-backed sessions in httpOnly cookies |
| UI | next-themes, sonner, framer-motion |
| Tests | Vitest (integration tests against PostgreSQL) |

## Project structure

```
src/
├── app/              # Pages and API route handlers
├── components/       # UI, layout, tasks, admin, auth
├── constants/        # Shared constants (filters, sort options)
├── hooks/            # Client hooks (task list URL params)
├── lib/
│   ├── api/          # Typed fetch clients (auth, tasks, admin, …)
│   ├── format/       # Date, file size, activity formatters
│   ├── mappers/      # Prisma model → DTO mappers
│   └── validators/   # Zod schemas
├── types/            # Shared TypeScript types and API envelopes
└── middleware.ts     # Auth gate for protected routes
tests/                # Vitest integration tests
prisma/               # Schema and migrations
```

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
| `npm run db:migrate:deploy` | Apply migrations in production |
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
- Authentication uses DB-backed sessions in httpOnly cookies, not JWT in localStorage (allowed by the brief).
- Tasks are hard-deleted.
- Search matches task titles only (case-insensitive).
- The API lives in Next.js Route Handlers instead of a separate Go service. The assessment allows choosing another backend language based on expertise; TypeScript keeps the stack unified and deploys cleanly to Vercel.
- Delete responses return HTTP 204 with an empty body.
- Due date sorting uses NULLS LAST for ascending order and NULLS FIRST for descending order.
- Priority sorting uses in-memory ordering (high > medium > low) after fetching filtered rows; suitable for paginated personal task lists.
- Real-time updates use an in-process SSE pub/sub channel (works for local dev and single-instance deploys; multi-instance production would need a shared bus).
- Attachments store file bytes in PostgreSQL (`task_attachments.data`) so downloads work on serverless (Vercel) where `/tmp` is not shared across instances. The filesystem under `UPLOAD_DIR` (default `.uploads/`) is an optional local cache for dev and Docker Compose.
- **Attachments on Vercel:** `UPLOAD_DIR=/tmp/rival-uploads` is optional (filesystem cache only). Upload and download work in production because bytes live in the database. For very large files at scale, object storage (e.g. Supabase Storage, S3) would be preferable to storing blobs in Postgres.
- Admin users are assigned via the `ADMIN_EMAILS` environment variable at signup/login.

## Deployment

Production deployment:

| Component | Platform |
|-----------|----------|
| Next.js app | [Vercel](https://rival-assessment-git-repo.vercel.app/) |
| PostgreSQL | Supabase |

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
2. Configure Vercel env vars: `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV=production`, `NEXT_PUBLIC_APP_URL`. Optional: `UPLOAD_DIR=/tmp/rival-uploads` for a local filesystem cache on serverless.
3. Run `npx prisma migrate deploy` against production once from your machine (direct Supabase connection).
4. Deploy the Next.js app to Vercel (`postinstall` runs `prisma generate`).
5. Smoke-test signup and task CRUD on the live URL. Upload and download attachments via **Edit task** (bytes stored in Postgres).

## Testing

By default, `npm run test` spins up an embedded PostgreSQL instance (via `embedded-postgres`), applies migrations, and runs integration tests.

To use an external test database instead:

```bash
set USE_EXTERNAL_TEST_DB=true
set DATABASE_URL=postgresql://test:test@localhost:5432/rival_test
npx prisma migrate deploy
npm run test
```

**Five integration test suites:**

| File | What it covers |
|------|----------------|
| `tests/auth.test.ts` | Signup, session cookie, `/me`, logout, invalid login |
| `tests/tasks.test.ts` | Task creation, user scoping, cross-user isolation, filter/sort/pagination |
| `tests/admin.test.ts` | Admin cross-user listing and non-admin rejection |
| `tests/activity.test.ts` | Activity log on create and update |
| `tests/attachments.test.ts` | Upload, download, delete, and cross-user isolation |

## Submission

- **Live app:** [https://rival-assessment-git-repo.vercel.app/](https://rival-assessment-git-repo.vercel.app/)
