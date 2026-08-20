# Sign-in / sign-up visual redesign

**Date:** 2026-08-20
**Status:** Approved, ready for implementation plan

## Problem

`/sign-in` and `/sign-up` are currently bare, centered forms with zero
background or visual identity (`<main className="mx-auto flex min-h-screen
max-w-sm flex-col justify-center gap-4 p-8">`) — a stark contrast to the
rest of the site, which has a real 3D scene and photography on the
homepage, and a rotating image panel on the post-login welcome screen.

## Goal

Give both auth pages the same split-screen treatment as the post-login
welcome screen: the actual form (unchanged fields/logic/validation) on one
side, a visual panel on the other. The visual panel must use a **3D scene
distinct from the homepage's** (not a reuse of `HeroScene`/`HeroBlob`) plus
a rotating image, both hidden on mobile — matching the established pattern
from `components/design/post-login-hero.tsx`.

## Components

- **`components/auth/auth-blob.tsx`** (new) — the 3D mesh, mirroring
  `components/landing/hero-blob.tsx`'s structure but visually distinct:
  - `icosahedronGeometry` (faceted/angular) instead of `sphereGeometry`
    (smooth/organic) — the homepage's blob is soft and rounded, this
    should read as geometric and crystalline.
  - `MeshTransmissionMaterial` (from `@react-three/drei`, already a
    dependency, already confirmed available in the installed version —
    no new dependency) for a glass/transmission look, instead of the
    homepage's `MeshDistortMaterial` (opaque, liquid-warping photo
    surface).
  - A different source photo than the homepage's
    (`scandinavian-living-room.webp`) — one of the still-unused repo-root
    images, converted the same way as prior image work.
  - Different rotation/float rhythm (different speed constants) so it
    doesn't feel like a re-skinned copy even at a glance.
- **`components/auth/auth-scene.tsx`** (new) — the `Canvas` wrapper,
  mirroring `components/landing/hero-scene.tsx`'s structure (lighting
  setup, camera position) but rendering `AuthBlob` instead of `HeroBlob`.
- **`components/auth/auth-scene-loader.tsx`** (new) — `next/dynamic` loader
  wrapper, mirroring `components/landing/hero-scene-loader.tsx` exactly
  (same reduced-motion prop pass-through), so the 3D bundle is still
  code-split and doesn't block initial page load.
- **`components/auth/auth-visual-panel.tsx`** (new) — the split-screen
  host, mirroring `components/design/post-login-hero.tsx`'s structure:
  left column renders `{children}` (the untouched form), right column
  (`hidden md:block`) stacks `AuthSceneLoader` above a rotating-image
  crossfade (same `setInterval` + `AnimatePresence` pattern already used
  twice in this codebase). No session-based greeting here (unauthenticated
  pages have no session) — just the visual, no text content needed beyond
  what the form itself already provides.
- **`app/sign-in/page.tsx`** and **`app/sign-up/page.tsx`** (modified) —
  each wraps its existing form JSX (completely unchanged: same fields,
  same `useState`, same submit handlers, same error handling) inside
  `<AuthVisualPanel>...</AuthVisualPanel>` instead of its current bare
  `<main>`.

## Assets

Exact source files (all from the unused repo-root set — none already used
by the homepage or the post-login screen):

- **3D scene texture** (mapped onto `AuthBlob`, one photo):
  `02_hero_modern_living_golden_hour.png`
- **Rotating image panel** (4 images, cross-fading, same technique as
  `post-login-hero.tsx`):
  1. `05_style_scandinavian_bedroom.png`
  2. `08_style_industrial_loft.png`
  3. `21_archviz_openplan_living_room.png`
  4. `26_abstract_fluid_violet_indigo.png`

All 5 converted to compressed webp the same way as the post-login screen's
images (`sharp`, resize to a sane width, quality ~80), placed under a new
`public/images/auth/` folder.

## Responsive behavior

Same as the post-login screen: `hidden md:block` on the visual panel,
full-width form-only on mobile.

## Edge cases

- **WebGL/3D fails to load or is slow:** `next/dynamic` code-splits it
  already (matches homepage's existing pattern); the form itself is never
  blocked by the visual panel, same separation as the post-login screen.
- **Reduced motion:** `AuthBlob` respects `useReducedMotion()` the same way
  `HeroBlob` does (freezes rotation/float), and the rotating image panel
  freezes on its first image, same as the post-login screen's precedent.

## Testing

Same precedent as every other visual/presentational piece built so far in
this project: no dedicated unit test (nothing here is pure logic), verified
live instead — load both pages, confirm the 3D scene renders and is
visibly distinct from the homepage's, confirm the image rotates, confirm
the form still submits/validates/errors exactly as before, confirm mobile
hides the visual panel, confirm zero console errors.

## Explicitly out of scope

- Any change to sign-in/sign-up form fields, validation, or submit logic.
- Any change to `HeroScene`/`HeroBlob` (the homepage's existing 3D scene).
- A shared layout/route-group refactor for `components/auth/` vs. the
  per-page wrapping already used elsewhere in this codebase (noted as a
  legitimate future consideration in a prior code review, not addressed
  here — consistent with how the rest of the app currently works).
