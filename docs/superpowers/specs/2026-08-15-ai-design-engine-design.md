# AI Design Engine — Design Spec

**Date:** 2026-08-15
**Phase:** 3 of 4 (AI Design Engine) of the AI-Powered Interior Design & Shopping Platform
**Status:** Approved

## Background

The full product vision (see project brief) is an all-in-one platform combining
AI-generated interior designs with an integrated shopping experience for every
product used in the design. That scope spans several independent subsystems —
auth/catalog/admin, shopping/checkout, AI design generation, and a turnkey
service layer — so it's being built as four phases, each with its own spec and
plan. This document covers **Phase 3: the AI Design Engine**, the flagship
feature: a user uploads a room photo, fills out a design-request form, and
receives four AI-generated, photorealistic redesigns built only from products
in our own catalog, with each product clickable for details.

Phase 1 (Foundation: full auth, full catalog, full admin panel) has not been
built yet. This phase builds the minimum slice of each it needs to be real
end-to-end: real (if basic) auth, and a small seeded product catalog — not
placeholders, but not the full admin experience either. Phase 2 (Shopping:
cart, checkout, payments) and Phase 4 (turnkey booking, favorites, full
profile) are explicitly out of scope here; this phase visibly acknowledges them
in the UI (see Service Option below) without implementing them.

## Goals

- A user can sign up, upload a room photo, fill out the design-request form,
  and get four distinct AI-generated redesigns of their room.
- Every design is built only from products in our seeded catalog — no
  hallucinated or generic internet furniture.
- Each product placed in a design is clickable (via an AI-estimated bounding
  box) and opens a detail panel with name, brand, color, dimensions, material,
  and price.
- The system degrades gracefully: a missing API key, a failed generation, or a
  malformed AI response should never break the rest of the app.

## Non-goals

- Real payments, cart, or checkout (Phase 2).
- Turnkey service booking, favorites, or full profile aggregation (Phase 4).
- Full admin panel for managing products (Phase 1) — this phase seeds the
  catalog via script, not a UI.
- Video or 3D room scanning (explicitly deferred in the product brief).

## Stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- Prisma + SQLite (`prisma/dev.db`, gitignored) for persistence.
- NextAuth.js, credentials provider, backed by the Prisma `User` table
  (hashed passwords). No OAuth, no email verification this phase.
- Google Gemini image generation API for both the room renderings and the
  follow-up bounding-box identification call.
- Repo: `Wife-Fred`, its own git repository (already initialized, isolated
  from the unrelated home-directory repo it previously lived under).

## Data model (Prisma)

```
User            id, email, passwordHash, name, createdAt
Brand           id, name, logoUrl
Product         id, name, brandId, category, styleTags[], color,
                 material, price, dimensions, imageUrl
Design          id, userId, roomPhotoUrl, roomType, style, colorPrefs,
                 materialPrefs, flooringPref, budget, serviceOption,
                 createdAt
DesignAlternative
                id, designId, index (0-3), imageUrl, status
                 (pending | ready | failed), hasHotspots (bool)
DesignItem      id, designAlternativeId, productId, bboxX, bboxY,
                 bboxWidth, bboxHeight   (all normalized 0-1)
```

`DesignItem` rows only exist for alternatives generated under "Ready-to-
Implement" (see below); "Design Inspiration Only" alternatives have none.

## Seed catalog

A Prisma seed script (`prisma/seed.ts`) creates ~30-50 products across six
categories — Furniture, Lighting, Rugs & Flooring, Paint & Wall Finishes,
Curtains & Textiles, Decor & Art — each with a realistic name, brand, price,
color, material, dimensions, and a stock photo. This is the only way products
enter the system in this phase; there is no admin UI yet.

## User flow

1. **Sign up / sign in** (NextAuth credentials).
2. **Upload room photo** — jpg/png/webp, max 10MB, stored under
   `public/uploads/rooms/<uuid>.<ext>`, path saved on the `Design` record.
3. **Design request form** — room type, style, color preferences, material
   preferences, flooring preference, budget, and service option. All four
   service options from the product brief are shown:
   - *Design Inspiration Only*
   - *Ready-to-Implement Design*
   - *Purchase Products Only* — generates a design, then shows a "Purchasing
     isn't available yet" notice instead of a real cart action.
   - *Turnkey Service* — generates a design, then shows a "Turnkey booking
     isn't available yet" notice.
4. **Generation** — server filters the seed catalog by room type / style /
   budget into a shortlist, builds a structured prompt, and calls Gemini
   image generation four times (image-to-image, using the uploaded photo as
   the base) to produce four alternatives.
5. **Hotspot mapping** (Ready-to-Implement only) — a follow-up Gemini vision
   call is given the generated image plus the shortlist of catalog products
   used in the prompt, and asked to return, for each item it can identify, the
   matching product ID and a normalized bounding box. Inspiration-Only
   alternatives skip this call entirely (cheaper, faster, no hotspots).
6. **Results** — a 4-alternative grid. Selecting one shows it full-size; if it
   has hotspots, clickable boxes overlay the image. If mapping failed or was
   skipped, a plain "Products used" list appears below instead.
7. **Product detail panel** — opens on hotspot or list-item click: name,
   brand, color, dimensions, material, price, and a **Buy Now** button that is
   visibly present but disabled with a "Coming soon" tooltip (Phase 2 wires
   this up for real).
8. Designs persist under the signed-in user (no profile aggregation UI yet
   beyond a simple "my designs" list — full profile is Phase 4).

## Error handling

- **No/invalid `GEMINI_API_KEY`**: the design-request flow is disabled with a
  clear "AI generation is currently unavailable" banner. Auth, catalog
  browsing, and the rest of the app work normally.
- **One of four generations fails** (safety block, timeout, rate limit): the
  other three still render; the failed tile shows an error state with a
  "Regenerate" button scoped to just that alternative.
- **Malformed/missing bounding-box response**: that alternative silently falls
  back to the plain product list instead of hotspots — never a broken page.
- **Upload validation**: reject non-image types and files over 10MB
  client-side and server-side, with an inline error.

## Testing

- Unit tests: prompt-building function (form + catalog shortlist → expected
  structure), bounding-box response parser (valid, malformed, partial).
- API route tests (Gemini client mocked): full success, partial failure (1 of
  4 alternatives fails), missing API key.
- Seed script sanity check: correct product count and required fields per
  category.
- Manual smoke path: sign up → upload → fill form → generate → open an
  alternative → click a hotspot → see product panel with working (disabled)
  Buy Now.

## Open items for later phases

- Phase 1 replaces the seed script with a real admin CRUD UI for products/
  brands/prices, and generalizes auth (OAuth, email verification).
- Phase 2 wires up the disabled Buy Now buttons and Purchase-Only flow to a
  real cart and checkout.
- Phase 4 wires up Turnkey Service booking, favorites, and full profile
  (design history, purchase history, saved addresses).
