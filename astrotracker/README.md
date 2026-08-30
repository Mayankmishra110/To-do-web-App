# AstroTracker

A personal transformation and execution system for one person.

It exists to answer, every day: *who am I becoming, what am I working toward,
what should I do today, did I do it, where did I fail, why, and is any of it
adding up?*

The smallest useful loop it supports is:

```
Identity → Goal → 90-day cycle → Milestone → Today → Action → Reflection
        → Pattern → Adjustment → Growth
```

It is not a habit tracker, and despite the name, astrology is not part of the
system. See `docs/ARCHITECTURE.md` for the product interpretation, the data
model and the build plan.

## Stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 16 (App Router, TypeScript) | One deployable for UI and server. Server Components read the database directly; Server Actions write to it. No separate API to keep in sync. |
| Database | PostgreSQL | Relational data with real history. Free hosted tiers (Neon, Supabase, Prisma Postgres) are more than enough for one person. |
| ORM | Prisma 7 | The schema file doubles as the design document, and migrations are checked in. |
| Auth | Signed JWT in an httpOnly cookie | One account. ~120 lines, no third-party service, no roles. |
| Validation | Zod | Same schemas guard every server action. |
| Styling | Tailwind CSS v4 | Tokens live in `globals.css`; no component framework to fight. |
| State | Server state + `useActionState` | Nothing worth keeping lives in the browser. |

## Running it

You need Node 20+ and a PostgreSQL database.

```bash
cp .env.example .env      # then fill in DATABASE_URL and AUTH_SECRET
npm install
npm run db:migrate        # creates the schema
npm run db:seed           # creates your account + reference data
npm run dev               # http://localhost:3000
```

`AUTH_SECRET` should be random: `openssl rand -base64 32`.

`npm run db:seed` reads `SEED_EMAIL` / `SEED_PASSWORD` from `.env` and is
idempotent — running it again resets the password and tops up reference data
without touching anything you have written.

### Scripts

| Script | Does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Create/apply a migration in development |
| `npm run db:deploy` | Apply existing migrations (production) |
| `npm run db:seed` | Create the account and reference data |
| `npm run db:studio` | Browse the database |

### Deploying

Any Node host works. On Vercel: set `DATABASE_URL` and `AUTH_SECRET`, then run
`npm run db:deploy` and `npm run db:seed` once against the production database.
The session cookie is marked `secure` automatically in production.

## Layout

```
prisma/
  schema.prisma          the whole data model, commented
  migrations/            checked in, applied with db:deploy
  seed.ts                first-run account + reference data
src/
  app/
    login/               the only public route
    (app)/               everything behind the session guard
      dashboard/ today/ goals/ milestones/ reviews/ history/ settings/
  components/            presentation only
    ui/                  panel, button, field primitives
  lib/
    env.ts               validated environment
    db.ts                Prisma client
    date.ts              day keys, timezone boundaries
    auth/                password, session, guard
    domain/              rules: patch template, roadmap (progress, scoring next)
  server/actions/        every write, validated and guarded
```

Two rules keep this navigable: **only `src/server/actions` and Server
Components touch the database**, and **`src/components` never does**.

## Build status

Built in vertical slices. Screens that do not exist yet say so rather than
showing placeholder data.

- [x] **Phase 1** — Scaffolding, database, authentication
- [ ] **Phase 2** — Identity, goals, 90-day cycles
- [ ] **Phase 3** — Milestones and editable suggestions
- [ ] **Phase 4** — Today: tasks and habits
- [ ] **Phase 5** — Daily notes, reflection, self-assessment
- [ ] **Phase 6** — Progress calculation
- [ ] **Phase 7** — Weekly, biweekly, monthly reviews
- [ ] **Phase 8** — History and the 90-day review
- [ ] **Phase 9** — Polish and mobile

Phase 1 also ships the north-star editor, because it is the one thing the whole
hierarchy hangs off and it proves the round trip: type it, refresh, close the
browser, come back, it is still there.
