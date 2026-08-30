# AstroTracker — product interpretation, architecture and plan

This is the document written before the code. It answers, in order: what the
product is, what is deliberately not being built, the stack, the architecture,
the schema, the user flows, how progress is calculated, and the build sequence.

---

## A. What AstroTracker actually is

A **personal execution ledger with a memory**.

Three things happen in it, and only three:

1. **You declare** — who you are becoming, what you are working toward, what
   the next 90 days are for, what today is for.
2. **You record** — what you actually did, what you did not do, and why.
3. **You zoom out** — and the recorded data, not a mood, tells you how you are
   operating.

The value is not in the tracking. Anyone can tick a box. The value is that
**the declaration and the record sit in the same place**, so the gap between
them is visible and cannot be argued with. A habit tracker says "you did 5 of
7". AstroTracker says "you said you were becoming internally disciplined, and
you skipped deep work four times this week, three of them on days you started
without a defined first task."

That single move — treating failure as data rather than as a moral event — is
the product.

The name is personal history, not functionality. There is no astrology in the
system, and the schema has no room reserved for it.

### The nine questions, mapped to screens

| Question | Answered by |
| --- | --- |
| What am I trying to become? | Identity (settings, and the dashboard header) |
| What am I trying to accomplish? | Goals, 90-day cycles |
| What should I do today? | Today: focus, actions, habits |
| Did I actually do it? | Today, and the day's execution score |
| Where did I fail? | Skipped actions and missed habits |
| Why did I fail? | Failure reason + free text on each miss |
| Am I progressing? | Goal progress estimate, milestone completion |
| What pattern is emerging? | Weekly/monthly reviews, computed from records |
| What should I change next? | Review notes — written by you, not generated |

---

## B. MVP boundaries

### Built

Single account with a password. Identity. Goals with categories, priority,
target date and "why it matters". 90-day cycles. Milestones, generated from
deterministic templates and fully editable. Habits with a done/not-done log.
Day-scoped tasks linked to goals and milestones. Daily focus, notes, the
INTERNAL PATCHES worksheet, evening reflection and a 1–5 self-assessment.
Failure reasons on every miss. Explainable progress estimates. Weekly,
biweekly, monthly and 90-day reviews computed from stored records. Full
history by date. Everything editable, forever.

### Not built, on purpose

Anything social — sharing, teams, profiles, followers, leaderboards. Payments
and subscriptions. Notifications and email. Roles and permissions. Streak
mechanics, badges, XP, celebration animations. An AI layer of any kind. Mobile
apps. Offline sync. Analytics or telemetry. Astrology.

### Deliberately deferred, with the seams left in place

- **AI generation** — `Milestone.source` already distinguishes `TEMPLATE` from
  `AI`, and generation sits behind one interface, so an AI generator is a
  second implementation rather than a rewrite.
- **Multi-user** — every table already carries `userId`. Nothing else changes.
- **Richer habit tracking** (counts, partial credit) — `HabitLog.status` is an
  enum, so it can gain values without a data migration.
- **Task history** — task state changes are not journalled; the current status
  plus `completedAt` is enough for every MVP review. A `TaskEvent` table can be
  added later without touching what exists.

---

## C. Stack, and why

**Next.js 16 (App Router) + TypeScript.** One process, one deployment, no API
layer to keep in sync with a client. Server Components read the database
directly; Server Actions write to it. For a single-user app this removes an
entire tier.

**PostgreSQL + Prisma 7.** The data is relational — goals have milestones have
tasks have failures — and the whole point is that it survives. A free hosted
Postgres (Neon, Supabase, Prisma Postgres) covers one person for years.
Prisma's schema file doubles as readable documentation, and migrations are
checked in so the production database is never hand-edited.

**Auth: a signed JWT in an httpOnly cookie.** One account. bcrypt for the
password, `jose` for the token, `User.sessionVersion` to invalidate every
session at once. About 120 lines. NextAuth/Clerk/Auth0 would each add more
configuration than the whole feature is worth.

**Zod** for every input boundary. **Tailwind v4** for styling, with tokens in
one file. **No client state library** — there is no client state worth naming;
`useActionState` covers form submission, the server owns the rest.

Two versions worth knowing: Prisma 7 needs a driver adapter (`@prisma/adapter-pg`),
and React 19 resets an uncontrolled form once its action resolves — which is why
every action returns the values it was given, so a rejected edit does not wipe
what was typed.

---

## D. Architecture

Four layers, one direction of dependency:

```
  Route (Server Component)      reads via Prisma, renders
        │
        ├── Components          presentation only, no data access
        │
        ├── Server Actions      the only writes: guard → validate → write → revalidate
        │
        └── Domain (src/lib/domain)   pure functions: progress, scoring, generation
                │
                └── Prisma / Postgres
```

- **Every write goes through a server action**, and every server action starts
  with `requireUser()` and a Zod parse. There is no other way in — no REST
  routes, no client-side database access.
- **The domain layer is pure.** Progress calculation, the daily score,
  milestone generation and review statistics take data in and return numbers
  and reasons out. They touch neither the database nor React, so their rules
  can be read, argued with and later tested without a running app.
- **Components never fetch.** They receive data as props. This is what keeps
  the codebase small enough for one person to hold in their head.
- **Sessions are stateless.** The cookie holds `{ sub, v }`; `v` is checked
  against `User.sessionVersion` on every request, so revocation is a single
  integer bump.

### Timezone

Every day-scoped row stores a `DATE`, and every "day" in the app is a
`YYYY-MM-DD` string in the user's own timezone (`User.timezone`). Conversion
happens in exactly two functions in `src/lib/date.ts`. Without this, a day
recorded at 01:00 IST lands on the previous day in UTC and every consistency
number is quietly wrong.

---

## E. Data model

The full schema, with comments, is `prisma/schema.prisma`. The shape:

```
User ─┬─ Identity ── IdentityRevision        (every re-wording is kept)
      ├─ GoalCategory
      ├─ Goal ─┬─ Cycle (90-day)
      │        ├─ Milestone ─┬─ Habit
      │        │             └─ Task
      │        └─ ProgressSnapshot
      ├─ Habit ── HabitLog
      ├─ Task
      ├─ DailyEntry ─┬─ DailyReflection
      │              └─ DailyScore
      ├─ FailureReason ── FailureEvent ── (Task | HabitLog)
      └─ PeriodicReview
```

Four decisions worth defending:

**1. History outranks structure.** Daily records (`Task`, `HabitLog`,
`DailyEntry`, `FailureEvent`) link to goals and milestones through *nullable*
foreign keys with `onDelete: SetNull`. Delete a goal you have outgrown and the
days you lived stay exactly as they were, minus a link. Definitions that carry
history — habits, failure reasons — use `onDelete: Restrict` and are archived
instead of deleted.

**2. One failure table.** `FailureEvent` covers missed tasks, missed habits and
standalone misses. "Why do I miss things?" is then a single `GROUP BY`, not a
union across three tables. This is the table the pattern insights are built on.

**3. Computed values are stored with their inputs.** `DailyScore.breakdown`,
`ProgressSnapshot.components` and `PeriodicReview.metrics` are JSON snapshots of
the numbers a figure was derived from. A review read a year later still shows
what it was written against, and every percentage can explain itself.

**4. Free-form structure stays JSON.** The INTERNAL PATCHES worksheet lives in
`DailyEntry.patches` against a version string, with the template defined in
`src/lib/domain/patch-template.ts`. The worksheet will change; old days keep
the version they were written against and still render correctly. Everything
that gets *counted* is a real column.

---

## F. Core user flows

**First setup.** Sign in → dashboard says no north star → write one sentence →
it appears in the sidebar on every screen from then on.

**Goal creation.** Title, description, why it matters, category, priority,
target date → optionally open a 90-day cycle for it (name, dates, objective,
success criteria) → the system proposes milestones → review, edit, reorder,
delete, add → the system proposes supporting habits and a first action → same
treatment. Nothing generated is written until it is accepted, and everything
accepted stays editable.

**Daily execution.** Morning: the north star, then today's focus, then the
actions and habits that prove it — reviewed and edited before the day starts.
During the day: tick things off, add notes, and when something is skipped,
record why. Evening: what actually happened, the reflection, the 1–5
self-assessment. Saving the reflection recomputes the day's score and refreshes
progress.

**Reviews.** Weekly: completion percentage, habit consistency, milestone
movement, strongest and weakest days, recurring failure reasons — with space to
write observations and next week's priorities. Biweekly: the same, compressed,
against the 90-day objective. Monthly: trajectory — milestones completed and
delayed, consistency trend, what changed. 90-day: what you intended, what you
did, what changed, what you abandoned, what carries into the next cycle.

**History.** Pick any date and see it exactly as recorded: planned actions,
what was completed, habits, notes, reflection, score, failures.

### The zoom principle

Detail is inversely proportional to the window. Today shows every field. The
week shows rates and reasons. Two weeks show trend. The month shows
trajectory. Ninety days show transformation — and the 90-day review does not
show daily rows at all unless asked.

---

## G. Progress calculation

Two numbers. Both are transparent, both are shown with their inputs, and
neither pretends to be a measurement of a person.

### Daily execution score (0–100)

```
score = 50 × task completion
      + 30 × habit completion
      + 20 × self-assessment
```

- **task completion** = completed ÷ planned for that day. Skipped and
  not-started both count as not done.
- **habit completion** = done ÷ habits expected that day (per the day-of-week
  mask).
- **self-assessment** = mean of the dimensions you actually rated, mapped from
  1–5 onto 0–1.

If a component has no data — no tasks planned, no habits due, nothing rated —
its weight is redistributed proportionally across the components that do have
data. If none of them do, **there is no score**: the day shows "—", never 0.

### Goal progress estimate (0–100%)

```
progress = 50 × milestone progress
         + 30 × habit consistency  (last 28 days)
         + 20 × action execution   (last 28 days)
```

- **milestone progress** = (completed + 0.5 × in-progress) ÷ (total − abandoned)
- **habit consistency** = done ÷ expected, over the last 28 days, for habits
  linked to the goal or its milestones
- **action execution** = completed ÷ (completed + skipped + overdue), over the
  last 28 days, for tasks linked to the goal or its milestones

Same redistribution rule when a component is empty. It is always labelled a
**progress estimate**, it is rounded to a whole percent, and clicking it shows
the three components with their raw counts — "78% = 60% of milestones, 85%
habit consistency, 82% action execution" — so the number can always be
argued with.

Explicitly **not** part of either formula: elapsed time. A goal is not 60% done
because 60% of the days have passed.

### Insights

Review insights are counts and comparisons over recorded data, phrased as
counts: *"Distraction was the most common recorded reason for missed tasks
(4 of 9)."* The system never diagnoses, never infers a cause it cannot count,
and never says anything about a psychological state.

---

## H. Implementation plan

Each phase is a vertical slice: schema (if needed), server actions, screen —
usable on its own before the next one starts.

| Phase | Slice | Done when |
| --- | --- | --- |
| 1 | Scaffolding, database, auth, app shell, identity | You can sign in, write your north star, refresh, and it is still there |
| 2 | Goals and 90-day cycles | You can create, edit and archive goals, and open a cycle |
| 3 | Milestones + template generation | Suggested milestones appear, and every one can be edited, reordered or deleted |
| 4 | Today: focus, tasks, habits | You can plan a day and tick it off |
| 5 | Notes, patches worksheet, reflection, self-assessment | An evening pass produces a stored day |
| 6 | Progress and scoring | Every percentage on screen can explain itself |
| 7 | Weekly, biweekly, monthly reviews | Reviews are generated from records and annotated by you |
| 8 | History and the 90-day review | Any past date opens; a cycle can be closed and summarised |
| 9 | Polish, mobile, empty states | Usable one-handed on a phone at 11pm |

---

## I. Known gaps

Honest list, so none of it is a surprise later:

- **No tests yet.** Phase 6 is where they start to matter, because that is
  where the arithmetic lands. The domain layer is pure so it can be tested
  without a database.
- **No rate limiting on sign-in.** One user, one private deployment. If this
  ever becomes multi-user it is the first thing to add.
- **No password reset flow.** `npm run db:seed` resets it.
- **Progress snapshots are not yet written on a schedule.** Phase 6 writes one
  per day on the first request of the day; no cron.
