# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev              # dev server (localhost:3000)
npm run build             # production build (also type-checks)
npm run lint               # eslint
npx tsc --noEmit           # type-check only, no build

npx prisma migrate deploy  # apply migrations (use this, not `migrate dev`, in real environments)
npx prisma generate        # regenerate client after editing prisma/schema.prisma
npm run seed                # demo users + sample cars — LOCAL ONLY, refuses to run when NODE_ENV=production
npm run create-admin        # ADMIN_EMAIL= ADMIN_PASSWORD= npm run create-admin — provisions a real admin
                             # and deletes the three demo accounts (and their cars/bookings/reviews/images)
```

There is no test suite/`test` script in this repo. Verify changes with `npm run build` + `npm run lint`, and by exercising the flow through `npm run dev` (or Playwright, per the "run" skill) — see the security-fix history in git log for the standard of manual verification expected (booking lifecycle, image upload, commission math checked end-to-end in a browser before merging).

A local PostgreSQL instance is required even for `npm run dev` — there is no SQLite/embedded fallback. Point `DATABASE_URL` at it in `.env` (copy `.env.example`).

## Architecture

**Next.js 16 App Router, Prisma 7 (driver adapters), NextAuth v5, PostgreSQL.** This is *not* the Next.js from training data — breaking API/convention changes exist; consult `node_modules/next/dist/docs/` before writing App Router code (this is what `AGENTS.md`, imported above, points at).

### Prisma 7 specifics that affect every file touching the DB

- The schema uses the new `prisma-client` generator (not the classic `prisma-client-js`), outputting to `src/generated/prisma/` — import from `@/generated/prisma/client` and `@/generated/prisma/enums`, never `@prisma/client`.
- No built-in query engine binary — the app talks to Postgres through `@prisma/adapter-pg` (`pg` driver), wired up once in `src/lib/prisma.ts` as a singleton (`globalForPrisma` pattern to survive Next.js dev-mode hot reload).
- `prisma/seed.ts` and `scripts/create-admin.ts` instantiate their own `PrismaPg` client rather than importing `src/lib/prisma.ts`, since they run outside the Next.js process via `tsx`.
- Migrations are consolidated into a single `20260728000000_init` — earlier history was squashed after a migration-ordering bug (see git log) blew up the first production deploy. When adding a new migration, run `prisma migrate dev` locally against a real Postgres (there's no shadow-DB-free path); don't hand-edit migration SQL.

### Auth and authorization

- NextAuth v5 (`src/lib/auth.ts`) with a single Credentials provider, JWT sessions, bcrypt password hashing. `session.user.id` / `session.user.role` are added via the `jwt`/`session` callbacks and typed in `src/types/next-auth.d.ts`.
- There is no middleware-based route protection. Every API route and server page does its own `await auth()` + role check at the top. When adding a new mutating route, follow the existing pattern: fetch the record, check `session.user.id` against the record's owner and/or `session.user.role === "ADMIN"`, return early with a Thai-language error `NextResponse.json({ error: "..." }, { status })` on failure.
- Roles: `RENTER`, `OWNER`, `ADMIN` (see `prisma/schema.prisma`). No org/multi-tenant concept.

### Domain state machines (read before touching booking or car status)

- **Booking status** transitions are explicit and centralized in `src/app/api/bookings/[id]/route.ts` as a `TRANSITIONS: Record<"FROM->TO", Role[]>` map — this is deliberate (an earlier ad-hoc guard silently made `CONFIRMED -> COMPLETED` unreachable, which broke reviews). Adding a new transition means editing that map, not adding a special case elsewhere.
- **Car status** (`PENDING -> APPROVED/REJECTED`, admin-moderated) resets to `PENDING` on every owner edit — see `src/app/api/cars/[id]/route.ts`. Any code path that lets an owner mutate car fields must preserve this re-review behavior.
- Commission is captured *at booking time* (`Booking.commissionRate`), read from `PlatformSetting` (a singleton row, `id: "singleton"`). Changing the platform rate (`/api/settings`, admin-only) never rewrites existing bookings — don't "fix" old rows to match a new rate.

### Image storage

Uploaded car photos are stored as `bytea` in Postgres (`CarImage` model, one-to-one with `Car`) and streamed back through `GET /api/cars/[id]/image`, not an external bucket/CDN. `Car.imageUrl` is either that internal API path or an owner-pasted external URL — check which case you're in before assuming it's always a same-origin path.

### Validation

Zod schemas live in `src/lib/validation.ts` and are shared between client-side forms and the API routes that receive them (`carSchema`, `bookingSchema`, `reviewSchema`, etc.) — extend schemas there rather than re-validating ad hoc in a route handler.
