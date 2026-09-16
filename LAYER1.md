# LAYER 1 — Standing Engineering Rules

These rules apply to every project and do not change per session.

## Priority Order

correctness/safety > a working feature > convention adherence > speed.
Never sacrifice a higher priority for a lower one.

## Git Discipline

- Never commit, push, merge, or modify git history unless explicitly instructed in that session.
- When a task is complete, propose a commit message and WAIT for confirmation before committing. Never commit automatically.
- Never include AI/Claude co-author attribution in any commit message, ever.
- Complete exactly one backlog task at a time unless explicitly told to continue to the next.

## Dependencies

- Zero-dependency by default. Any new package must be justified (what it does, why nothing in the current stack covers it) and approved before installing.

## Feature Structure

- Each feature owns its own components/hooks/services/types/constants.
- Shared code only lives in a shared/lib folder when it's genuinely reused across 2+ features — not preemptively.
- Every feature must handle: loading state, empty state, error state, success state. No feature ships with only the happy path.

## Architecture Preferences

- Prefer Server Components, Server Actions, Streaming, and Suspense over Client Components. Client Components only where real interactivity is required.
- Business logic never lives client-side. Never trust client-side validation alone — always re-validate server-side.

## UI Standards

- Semantic HTML, full keyboard accessibility, labeled form fields, responsive at mobile/tablet/desktop breakpoints, WCAG-conscious contrast and focus states.

## File Hygiene

- CLAUDE.md and any local-only tooling output (e.g. graphify-out/) must be gitignored — never committed to the repo, in any branch.
- Temporary verification files (e.g. VERIFY_OUTPUT.txt, scratch test scripts) must never be committed. Delete them before finishing a task, or gitignore them if they're regenerated often.

## Session Start

- At the start of every session, read LAYER1.md and LAYER2.md in full before doing anything else.
- Before writing any code, present a plan (files to be touched, approach, open questions) and STOP. Wait for explicit approval before writing code.
