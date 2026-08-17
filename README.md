# AI-Powered Interior Design & Shopping Platform

An all-in-one platform combining AI-generated interior designs with an
integrated shopping experience: upload a room photo, get four AI-generated
redesigns built entirely from our own product catalog, click any item in a
design to see its details, and buy it — or have our team install the whole
project.

This is too large to build as one thing, so it's split into four phases, each
with its own design spec and implementation plan under `docs/superpowers/`.
Phases are being built out of dependency order — the AI design engine
(Phase 3) first, since it's the flagship feature — with each phase building
only the minimum slice of earlier phases it actually needs to be real
end-to-end.

## Phases

| Phase | Name | Status | Spec | Plan |
|---|---|---|---|---|
| 1 | **Foundation** — full auth, full product/brand catalog, full admin CRUD panel | Not started | — | — |
| 2 | **Shopping** — cart, checkout, real payments | Not started | — | — |
| 3 | **AI Design Engine** — room upload → design-request form → 4 AI-generated redesigns from the seeded catalog, with clickable products | **In progress** (14 of 16 tasks done) | [spec](docs/superpowers/specs/2026-08-15-ai-design-engine-design.md) | [plan](docs/superpowers/plans/2026-08-15-ai-design-engine.md) |
| 4 | **Turnkey & Profile** — "have our team complete this project" booking, favorites, full user profile (design history, purchase history, saved addresses) | Not started | — | — |

Phase 3 builds a minimal slice of Phase 1 (basic email/password auth via
NextAuth, a seeded — not admin-managed — catalog) just enough to make the AI
design flow real. Phase 1's full admin panel, Phase 2's cart/checkout, and
Phase 4's turnkey booking/favorites/profile are all explicitly out of scope
for Phase 3 and are visibly stubbed ("coming soon") in its UI rather than
built.

## Phase 3 progress

Stack: Next.js 14 (App Router), TypeScript, Tailwind, shadcn-style
components, Prisma + SQLite, NextAuth.js (credentials), Google Gemini
(image generation + bounding-box product detection).

Being built in a dedicated git worktree/branch (`worktree-ai-design-engine`)
per the 16-task plan linked above:

- [x] Task 1 — Scaffold the Next.js project
- [x] Task 2 — shadcn-style UI primitives
- [x] Task 3 — Prisma schema and client
- [x] Task 4 — Seed script and catalog data
- [x] Task 5 — Auth: password hashing, signup route, NextAuth config
- [x] Task 6 — Auth UI pages
- [x] Task 7 — Room photo upload
- [x] Task 8 — Design request form types and component
- [x] Task 9 — Catalog shortlist filter
- [x] Task 10 — Prompt builder
- [x] Task 11 — Bounding-box response parser
- [x] Task 12 — Gemini client wrapper
- [x] Task 13 — Generate API route (orchestration)
- [x] Task 14 — Results UI: grid, hotspots, product panel, error states
- [ ] Task 15 — "My designs" list page *(next up)*
- [ ] Task 16 — Full test suite and manual smoke check

See the [plan](docs/superpowers/plans/2026-08-15-ai-design-engine.md) for the
full step-by-step breakdown of each task, and the
[spec](docs/superpowers/specs/2026-08-15-ai-design-engine-design.md) for
goals, data model, user flow, and error handling.

## Repo layout

- `docs/superpowers/specs/` — design specs, one per phase
- `docs/superpowers/plans/` — implementation plans, one per phase
- `.claude/worktrees/<name>/` — git worktrees used to build each phase in
  isolation (gitignored; each is its own checkout of a feature branch)
