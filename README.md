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

- Node.js 20+
- PostgreSQL 14+

## Local setup

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
- Bonus features implemented: optimistic UI, dark/light theme toggle, GitHub Actions CI, admin RBAC, per-task activity log, real-time task updates via SSE, task file attachments.
- Real-time updates use an in-process SSE pub/sub channel (works for local dev and single-instance deploys; multi-instance production would need a shared bus).
- Attachments are stored on the local filesystem under `UPLOAD_DIR` (default `.uploads/`). Suitable for local dev and single-instance deploys with persistent disk; production would typically use object storage.

## Deployment

Recommended setup:

| Component | Platform |
|-----------|----------|
| Next.js app | Vercel |
| PostgreSQL | Neon or Supabase |

Steps:

1. Create a managed PostgreSQL database and copy the connection string.
2. Configure Vercel env vars: `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV=production`.
3. Run `npx prisma migrate deploy` against production once from your machine or CI.
4. Deploy the Next.js app to Vercel (`postinstall` runs `prisma generate`).

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
