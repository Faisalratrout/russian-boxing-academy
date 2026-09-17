# Russian Boxing Academy — Build-Out & Production Roadmap

Claude Code: check off an item with `[x]` only once it's implemented,
built successfully, and committed — not when merely planned or approved.

## Postgres vs. Redis — division of labor (reference, not a task list)

Postgres (Neon) is the only source of truth for persistent data: Members,
Subscriptions, Transactions, Users, Locations, NotificationLog. Redis
(Upstash) is purely operational and short-lived: rate-limit counters and
idempotency keys. Redis is never a cache of Postgres data at this stage —
add that only if a specific query proves slow under real load.

---

## Phase 1 — Backend

- [x] Auth: bcryptjs password hashing, stateless JWT (jose) in httpOnly/Secure/SameSite cookie, no-user-enumeration login response
- [x] Logout route (clears cookie, requires auth)
- [x] Members: real GET (status + search filters), real POST (Prisma create)
- [x] Members: PATCH for updates + soft-deactivate (status: INACTIVE, never hard-delete)
- [x] Seed script: one Location, one ADMIN user, password from ADMIN_SEED_PASSWORD env var, no sample data
- [x] Subscriptions: POST creates subscription + matching INCOME transaction in one Prisma `$transaction`; endDate computed from planType
- [x] Subscriptions: GET with status/member filters
- [ ] Subscriptions: early renewal/extension flow (deferred — currently blocked, not designed)
- [ ] Transactions: POST for EXPENSE only (locked via schema), GET with type/category/date filters
- [ ] Notifications: daily expiry-check logic — flag EXPIRING_SOON within 3-day window, flag EXPIRED past endDate, write NotificationLog rows, idempotent per cycle
- [ ] Notifications endpoint secured for Vercel Cron via CRON_SECRET header check

## Phase 2 — Frontend

- [ ] Typed API client wrapper (base URL from env, cookie credentials included, centralized error handling)
- [ ] Login screen wired to real auth cookie flow
- [ ] Member registration: form + list wired to real API
- [ ] Subscription creation flow, tied to a member
- [ ] Expense logging form wired to real API
- [ ] Dashboard: active members, expiring-soon list, income/expense summary — real data only
- [ ] Public gym page: real content + photos, built with next/image
- [ ] PWA polish: icons, manifest, install prompt

## Phase 3 — Production Readiness

- [ ] prisma migrate deploy against Neon production branch, pooled connection string
- [ ] All env vars set in Vercel (both projects): DATABASE_URL, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, FRONTEND_URL, CRON_SECRET, SESSION_SECRET, ADMIN_SEED_PASSWORD
- [ ] Upstash token rotated before go-live
- [ ] Vercel Cron configured to hit notifications endpoint daily with CRON_SECRET
- [ ] CORS FRONTEND_URL matches real production frontend domain exactly
- [ ] Audit: no secrets accidentally exposed via NEXT_PUBLIC_* prefix
- [ ] Final pass: every route confirmed behind its auth middleware, none accidentally open
- [ ] End-to-end smoke test in production: login → create member → create subscription → confirm income transaction → log expense → confirm dashboard reflects it

## Standing Implementation Rules (already added to LAYER1.md)

- No mock/fake/placeholder data — real Prisma queries from the start
- No hardcoded secrets/credentials — env vars only
- No route implemented without validation + rate-limit + auth scaffolding
- Minimal comments — only where the *why* isn't obvious from the code
- Noted trade-off: stateless JWT means no per-session revocation; only full SESSION_SECRET rotation logs everyone out. Accepted for MVP at this team size.