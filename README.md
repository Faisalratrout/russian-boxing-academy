# Russian Boxing Academy

Membership, subscription, and finance tracking system for Russian Boxing
Academy (Amman), plus a public page showing what the gym offers. Replaces
paper-based subscription records.

## Structure

This repo holds two independently runnable Next.js projects. They are
**not** a single merged app — the frontend calls the backend over HTTP.

```
/frontend   Next.js (App Router) + TypeScript + Tailwind — the UI.
            PWA-installable, calls the backend via its REST API.

/backend    Next.js (App Router, Route Handlers only) + TypeScript +
            Prisma + PostgreSQL — the REST API. Owns all business
            logic and the daily subscription-expiry check.
```

Each folder has its own `package.json`, `node_modules`, and `.env`, and
deploys as its own Vercel project.

## Scope (MVP, confirmed with client)
- Member registration: first/last name, birth date, subscription plan
- Plans: 1 month / 30 JOD, 2 months / 50 JOD
- Subscription expiry tracked automatically; "Expiring Soon" dashboard alert 3 days before end date (configurable)
- Income (auto-logged from subscriptions) + expense tracking (equipment, repairs, gloves, wraps, other)
- Cash-only payments — no online payment processing
- In-app notifications only for MVP — no WhatsApp/SMS integration; coach phone numbers stored for direct/manual contact
- All staff (admin + coach) see everything, including financials
- Schema is location-ready (`locationId` on every core table) for future expansion to additional gym locations, though MVP launches with one

## Running locally

### Backend (start first)

```bash
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL
npx prisma migrate dev --name init
npm run dev            # http://localhost:3000 by default — see below
```

The backend and frontend both default to Next.js port 3000, so when
running both at once, start the backend on a different port, e.g.
`npm run dev -- -p 3001`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set NEXT_PUBLIC_API_URL to the backend's URL
npm run dev            # http://localhost:3000
```

### How they connect

The frontend reads `NEXT_PUBLIC_API_URL` (see `frontend/.env.example`)
and calls the backend's REST API at that base URL — e.g.
`http://localhost:3001` locally, or the backend's deployed Vercel URL
in production. The backend never renders UI; it only exposes
`app/api/*` route handlers.

## Data model

Defined in `backend/prisma/schema.prisma`: `Location`, `Member`,
`Subscription`, `Transaction`, `User`, `NotificationLog`. See
`LAYER2.md` for the confirmed product decisions behind each field.

## Engineering Notes
- Business logic (subscription expiry, financial totals) lives in `/backend` only; the frontend never re-implements it.
- Prefer Server Components/Server Actions in `/frontend`; Client Components only where interactivity is required.
- Every feature needs loading/empty/error/success states.
- No AI co-author attribution in commits.
- Full standing rules: `LAYER1.md`. Full project context: `LAYER2.md`.
