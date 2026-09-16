# Russian Boxing Academy

Membership, subscription, and finance tracking system for Russian Boxing Academy (Amman), plus a public page showing what the gym offers. Replaces paper-based subscription records.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- PostgreSQL + Prisma
- Vercel (hosting) + Vercel Cron (daily subscription-expiry check)
- PWA — installable on tablet/phone, works as a normal site on desktop

## Scope (MVP, confirmed with client)
- Member registration: first/last name, birth date, subscription plan
- Plans: 1 month / 30 JOD, 2 months / 50 JOD
- Subscription expiry tracked automatically; "Expiring Soon" dashboard alert 3 days before end date
- Income (auto-logged from subscriptions) + expense tracking (equipment, repairs, gloves, wraps, other)
- Cash-only payments — no online payment processing
- In-app notifications only for MVP — no WhatsApp/SMS integration; coach phone numbers stored for direct/manual contact
- All staff (admin + coach) see everything, including financials
- Schema is location-ready (`locationId` on every core table) for future expansion to additional gym locations, though MVP launches with one

## Getting Started

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL
npx prisma migrate dev --name init
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/              # Next.js routes (App Router)
  features/
    members/        # member CRUD
    subscriptions/  # plan selection, expiry logic
    transactions/    # income/expense ledger
    notifications/  # expiry-alert job + in-app feed
    dashboard/       # summary views
    auth/            # staff login
    site/            # public "what we offer" page content
  lib/               # shared utilities (Prisma client, etc.)
prisma/
  schema.prisma      # data model
```

Each feature owns its own components/hooks/services/types. Shared code only lives in `lib/` when it's genuinely reused across features.

## Engineering Notes
- Business logic (subscription expiry, financial totals) lives server-side only.
- Prefer Server Components/Server Actions; Client Components only where interactivity is required.
- Every feature needs loading/empty/error/success states.
- No AI co-author attribution in commits.
