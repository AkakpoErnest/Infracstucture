# Post-login welcome screen — design spec

**Date:** 2026-08-20
**Status:** Approved, ready for implementation plan

## Problem

`/design/new` — the first page a user lands on after signing in — is
currently just a bare upload dropzone with no chrome: no greeting, no name,
no sense of the product's value, nothing to look at. The root layout
(`app/layout.tsx`) has no shared header/nav either, so this really is the
entire post-login experience today. It feels like a dead end compared to the
marketing homepage, which already has a real 3D scene, a before/after
crossfade, and an 8-image style gallery.

## Goal

Make the post-login screen feel alive and welcoming — greet the user by
name, show some visual inspiration, optionally a 3D render — while keeping
the upload box as the clear, immediately-actionable next step. Do this
without touching Phase 1/2/4 scope (no dashboard nav, no profile page, no
"my designs" list wiring) — this is a presentation layer change to the
existing `/design/new` page only.

## Approach chosen

Split-screen layout: left side is the actual task (greeting + one-line
prompt + the existing upload box, unchanged), right side is a slowly
cross-fading rotation through 4 images pulled from the unused visual assets
already sitting in the repo. This was chosen over two alternatives (a
full-width hero banner with a gallery strip below the fold, and a plain
greeting + static style grid) because it keeps the upload box permanently
above the fold with nothing to scroll past, while still giving the screen
a visual identity distinct from a bare form.

**Hard constraint (user-specified): no image may repeat anywhere on the
site.** The 4 images chosen for this screen must not be any of the images
already used by the homepage (`public/images/hero/*.webp`,
`public/images/styles/*.webp`) — they come from the 26 unused PNGs
currently sitting at the repo root instead.

## Components

- **`components/design/post-login-hero.tsx`** (new, client component)
  - Props: `{ userName: string | null }`
  - Renders the two-column split. Left: greeting text + prompt +
    `{children}` (so the existing upload/form flow slots in unchanged).
    Right: the rotating visual panel.
  - Internal sub-piece for the crossfade, following the exact pattern
    already established by `components/landing/hero-transform.tsx`: a
    `setInterval`-driven index over a fixed image array, `AnimatePresence`
    cross-fade, `useReducedMotion()` gate that freezes on one static image
    (the first in the array) when the user has reduced-motion set.
- **`app/design/new/page.tsx`** (modified)
  - Reads the signed-in user's name via `useSession()` (the page is already
    a client component; no new server-side data fetching needed —
    NextAuth's `session.user.name` is already populated per
    `lib/auth.ts`'s `jwt`/`session` callbacks).
  - Wraps its existing body (`RoomUpload` / `DesignRequestForm`, unchanged)
    inside `<PostLoginHero userName={session?.data?.user?.name ?? null}>`.
  - No changes to the upload/generate logic, error handling, or routing in
    this file — purely wrapping.

## Assets

- Exact 4 source files (all from the unused repo-root set, already
  previewed and approved in the brainstorming pass):
  1. `16_3d_isometric_cozy_living_room.png`
  2. `03_before_after_japandi_room.png`
  3. `07_style_luxury_living_room.png`
  4. `10_style_bohemian_living_room.png`
- Convert each from its current multi-MB PNG to compressed `.webp`, sized
  appropriately for a side panel (not full source resolution) — matching
  the size discipline already used by `public/images/hero/*.webp`
  (50–330KB range), since the source PNGs are 3–8MB each and unsuitable to
  ship as-is.
- Place the converted files in a new `public/images/post-login/` folder.
  The original PNGs at the repo root are left alone (out of scope for this
  change — separate cleanup if ever wanted).

## Responsive behavior

- `md:` and up: two-column split, visual panel visible (`hidden md:block`
  on the right column).
- Below `md:`: single column — greeting + upload box only, full width. The
  visual panel does not render at all on mobile (not just hidden via CSS —
  avoids shipping the images to a viewport that never shows them; use a
  simple viewport check or CSS-only `hidden md:block` with `loading="lazy"`
  is acceptable too since these are decorative, non-critical images).

## Edge cases

- **No session name:** signup requires a name today, so this should not
  happen in practice, but defensively: render "Welcome back" with no name
  appended rather than "Welcome back, undefined" or similar.
- **Image fails to load:** `next/image` degrades to a broken-image state
  scoped to that one panel; doesn't block or affect the upload flow, since
  the visual panel is purely decorative and has no interactive role.

## Testing

- One test for `post-login-hero.tsx`'s name-fallback branch (the only real
  conditional logic here): renders "Welcome back, Demo User" when a name is
  given, "Welcome back" with no trailing text when `null`.
- The crossfade/timing behavior is not meaningfully unit-testable (same
  conclusion as the existing `hero-transform.tsx`, which also has no
  dedicated test) — verified instead via a live/manual check per the
  `run` skill once implemented, same as every other visual verification
  done in this project so far.

## Explicitly out of scope

- No shared header/nav across logged-in pages.
- No "My designs" link/dashboard.
- No profile page.
- No changes to `/design/[id]` (the results page).

These remain Phase 1/2/4 concerns per the project README and are not
addressed by this change.
