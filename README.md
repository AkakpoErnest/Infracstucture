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
| 3 | **AI Design Engine** — room upload → design-request form → 4 AI-generated redesigns from the seeded catalog, with clickable products | **Feature-complete** (16/16 tasks, all reviewed) — on branch `worktree-ai-design-engine`, pending merge to `main` | [spec](docs/superpowers/specs/2026-08-15-ai-design-engine-design.md) | [plan](docs/superpowers/plans/2026-08-15-ai-design-engine.md) |
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
- [x] Task 15 — "My designs" list page
- [x] Task 16 — Full test suite and manual smoke check

All 16 tasks were built implementer-first, then independently verified by a
separate spec-compliance pass and a separate code-quality pass, with issues
sent back for fixes and re-verified before merging — this caught and fixed
a critical path-traversal vulnerability (Task 13), several stuck-loading/race
bugs, and an all-or-nothing hotspot-insert failure mode, among others.

**Verification status:** 48/48 automated tests passing, `tsc --noEmit` clean,
and a live scripted end-to-end smoke test (sign up → sign in → upload →
generate → fetch results → my-designs list) confirmed the full pipeline
works, including the error-handling path. **Known limitation:** the
`GEMINI_API_KEY` configured in this environment has zero image-generation
quota on its current billing tier (confirmed via live API calls in Tasks 12
and 16), so real AI-generated images can't be produced here — every
alternative currently comes back as a handled `failed` state with a quota
error message rather than a rendered design. The code path for a working key
is implemented and was verified against the real API for auth, request
shape, and response parsing; only image-output itself is blocked by billing,
not by anything in this codebase. Swapping in a key with image-generation
quota should make designs render with no code changes.

See the [plan](docs/superpowers/plans/2026-08-15-ai-design-engine.md) for the
full step-by-step breakdown of each task, and the
[spec](docs/superpowers/specs/2026-08-15-ai-design-engine-design.md) for
goals, data model, user flow, and error handling.

## Repo layout

- `docs/superpowers/specs/` — design specs, one per phase
- `docs/superpowers/plans/` — implementation plans, one per phase
- `.claude/worktrees/<name>/` — git worktrees used to build each phase in
  isolation (gitignored; each is its own checkout of a feature branch)
