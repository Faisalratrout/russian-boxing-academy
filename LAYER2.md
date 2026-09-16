# LAYER 2 — Project Context

## Project

Russian Boxing Academy — membership, subscription, and finance tracking
system for a boxing gym in Amman, Jordan, replacing paper records. Also
includes a public page showing what the gym offers (built from real gym
info, not placeholder content).

## Repo Structure

- `/frontend` — Next.js (App Router) + TypeScript + Tailwind, the UI.
  PWA-installable (tablet/phone home screen), works as a normal site on
  desktop. Calls the backend via its REST API.
- `/backend` — Next.js (App Router, Route Handlers only — no pages/UI) +
  TypeScript + Prisma + PostgreSQL. Exposes a REST API. Owns all business
  logic and the daily subscription-expiry check (Vercel Cron-compatible
  route).
- Each folder is an independently runnable Next.js project with its own
  package.json, node_modules, .env. They are NOT a single merged app —
  frontend calls backend over HTTP.
- Deployment: each deploys as its own Vercel project. Frontend's env
  points at backend's deployed URL.

## Confirmed Product Decisions (do not deviate without asking)

- Member fields: first name, last name, birth date.
- Subscription plans: 1 month = 30 JOD, 2 months = 50 JOD. No other plans for MVP.
- Payment is cash-only at the gym — no online payment processing anywhere in the system.
- Expiry alert window: 3 days before subscription end date. Store this as a config value, not hardcoded.
- Notifications are in-app only for MVP — no WhatsApp/SMS/email integration. Coach phone numbers are stored on the User record for manual/direct contact only.
- All staff (ADMIN and COACH roles) see everything, including financial data. No restricted views for MVP.
- Schema is location-ready: every core table carries locationId, but MVP only seeds a single Location row. Do not build multi-location UI yet — just don't block it in the schema.
- Transaction categories: SUBSCRIPTION (income, auto-logged), EQUIPMENT, REPAIR, GLOVES, WRAPS, OTHER (expenses, manually logged).

## Data Model

Already defined — migrated into `/backend/prisma/schema.prisma`, not
redesigned. Models: Location, Member, Subscription (enum
SubscriptionPlan: ONE_MONTH, TWO_MONTH; enum SubscriptionStatus: ACTIVE,
EXPIRING_SOON, EXPIRED), Transaction (enum TransactionType: INCOME,
EXPENSE; enum TransactionCategory: SUBSCRIPTION, EQUIPMENT, REPAIR,
GLOVES, WRAPS, OTHER), User (enum UserRole: ADMIN, COACH),
NotificationLog (channel defaults to "in_app").

## Branching

main holds the full structure (both frontend/ and backend/). Team
members work on frontend or backend branches, each touching only their
own folder, merged back into main via PR.
