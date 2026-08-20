# Phase 4 (Turnkey & Profile) — profile shell design

**Date:** 2026-08-20
**Status:** Approved, ready for implementation plan

## Problem

Phase 4 in the README bundles four fairly independent things: a "have our
team complete this project" turnkey booking flow, favorites, and a full
user profile (design history, purchase history, saved addresses). None of
it exists yet — the phase is listed as "Not started." Separately, "purchase
history" has a real dependency gap: Phase 2 (cart/checkout/payments)
doesn't exist either, so there is no real purchase data to show, the same
way earlier phases have deliberately built only the minimum slice of
earlier phases they actually need.

There is also no shared navigation anywhere in the logged-in app today —
`/design/new`, `/design/[id]`, and `/design` each render their own bare
`<main>` with no way to get from one to another except by typing a URL.
Building a profile page without also building navigation to reach it would
make the page unreachable in practice.

## Goal

Build the "shell": a minimal shared header across the logged-in pages, and
a `/profile` page that shows what's real today (account info, a design
history preview) and visibly stubs ("coming soon") what isn't built yet
(favorites, saved addresses, turnkey bookings, purchase history). This
mirrors the same "visibly stubbed rather than built" pattern the README
already uses for other out-of-scope pieces. Each stubbed section becomes
its own future spec — this task adds no new data model, no new business
logic, and no new API routes; it only adds navigation and a page that reads
data that already exists.

## Components

- **`components/layout/app-header.tsx`** (new)
  - A slim header: the existing logo (`/images/logo-icon.png`) + "Interior
    AI" text (same markup as the homepage nav), a "My Designs" link (→
    `/design`), a "Profile" link (→ `/profile`), and a sign-out button
    calling `signOut()` from `next-auth/react`.
  - Rendered as a sibling immediately above `PostLoginHero`'s own `<main>`
    on `/design/new` (i.e. `app/design/new/page.tsx` returns
    `<><AppHeader /><PostLoginHero>...</PostLoginHero></>`, not nested
    inside it), and as a wrapping element above the existing content on
    `/design/[id]`, `/design`, and the new `/profile` page.
  - No props needed beyond what `useSession()` already gives it directly
    (it reads the session itself, same pattern as `app/design/new/page.tsx`
    already established).

- **`app/profile/page.tsx`** (new)
  - Client component, reads the session via `useSession()`, redirects
    unauthenticated visitors to `/sign-in` (this route currently has no
    auth guard anywhere in the app — see Edge cases below for why this
    page gets one and no other existing page changes).
  - Renders `AppHeader`, then six stacked sections:
    1. **Account info** — name + email from the session, read-only, no
       edit form.
    2. **Design history** — fetches `/api/designs` (already exists),
       shows the 3 most recent as small cards (reusing the same card
       markup style as `app/design/page.tsx`), with a "View all" link to
       `/design`. Does not duplicate `/design`'s full list logic — just a
       short preview.
    3. **Favorites** — static "Coming soon" placeholder card.
    4. **Saved addresses** — static "Coming soon" placeholder card.
    5. **Turnkey bookings** — static "Coming soon" placeholder card.
    6. **Purchase history** — static "Coming soon" placeholder card, with
       a one-line note that this needs checkout/payments to exist first.

## Data/backend

None. No new Prisma models, no new API routes. Account info comes from the
existing session; design history comes from the existing `/api/designs`
GET endpoint. Each "coming soon" section gets real data models and routes
in its own future spec (Favorites, Saved Addresses, Turnkey Booking, and —
once Phase 2 exists — Purchase History).

## Edge cases

- **No session on `/profile`:** unlike the rest of the app (which has no
  route-level auth guard anywhere, a pre-existing gap outside this task's
  scope), `/profile` explicitly redirects to `/sign-in` if there's no
  session, since showing account info/design history requires one and
  there's no sensible logged-out state for this specific page.
- **Design history fetch fails or is empty:** show the same "No designs
  yet" / error messaging style already used by `app/design/page.tsx`,
  scoped to the preview section only — doesn't block the rest of the page
  from rendering.

## Testing

Same precedent as the post-login welcome screen: this is presentational
wiring with no new business logic, so no dedicated unit tests. Verified
live instead — sign in, confirm the header appears and its links work from
all four pages, confirm `/profile` shows the real signed-in name/email and
an accurate design history preview, confirm all four stub sections render,
confirm `/profile` redirects to `/sign-in` when signed out.

## Explicitly out of scope

- Actual favorites, saved addresses, or turnkey booking functionality
  (each gets its own future spec/plan cycle).
- Editing account info (name/email changes) — not part of Phase 4's
  original scope.
- Real purchase history — blocked on Phase 2 not existing.
- Sign-in/sign-up page redesign (3D animation + imagery) — explicitly
  deferred to its own separate spec, sequenced right after this one.
- Adding an auth guard to any page other than the new `/profile` (the
  existing gap on `/design/new`, `/design/[id]`, `/design` is pre-existing
  and out of scope here).
