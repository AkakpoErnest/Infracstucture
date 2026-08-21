# Favorites (products) — design spec

**Date:** 2026-08-21
**Status:** Approved, ready for implementation plan

## Problem

Phase 4's profile page currently shows a static "Coming soon" stub for
Favorites — no data model, no API, no way to actually favorite anything
exists yet.

## Goal

Let a signed-in user favorite/unfavorite individual catalog **products**
(not whole designs) from the product-detail panel they already see when
clicking a hotspot on a generated design, and show their real favorited
products on the `/profile` page, replacing the stub.

## Data model

New Prisma model:

```prisma
model Favorite {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  createdAt DateTime @default(now())

  @@unique([userId, productId])
  @@index([userId])
}
```

`User` gains a `favorites Favorite[]` back-relation; `Product` gains a
`favorites Favorite[]` back-relation (both required by Prisma for the
relations above to compile). The `@@unique([userId, productId])`
constraint is what makes favoriting idempotent — attempting to favorite an
already-favorited product is a conflict the API handles gracefully (see
below), not a duplicate row.

## API

- **`GET /api/favorites`** — returns the signed-in user's favorited
  products, full `ProductDetail` shape (matching
  `components/design/product-detail-panel.tsx`'s existing `ProductDetail`
  interface: `id, name, brandName, color, dimensions, material, price,
  imageUrl`), newest-first. 401 if not signed in.
- **`POST /api/favorites`** — body `{ productId: string }`. Creates a
  Favorite for the signed-in user, returning `200` with `{ favorited: true }`
  whether this call created the row or one already existed (unique
  constraint violation caught and treated as the same success response) —
  a double-click shouldn't surface a failure. 401 if not signed in, 404 if
  `productId` doesn't correspond to a real product.
- **`DELETE /api/favorites/[productId]`** — removes the signed-in user's
  favorite for that product, if any (also idempotent — deleting a
  non-existent favorite is still a success). 401 if not signed in.

All three follow the existing auth pattern already used by every other API
route in this app: `getServerSession(authOptions)` from `lib/auth.ts`,
401 via `NextResponse.json({ error: ... }, { status: 401 })` when absent.

## Components

- **`components/design/product-detail-panel.tsx`** (modified) — gains two
  new props: `isFavorited: boolean` and `onToggleFavorite: () => void`.
  Renders a heart-icon toggle button (filled when favorited, outline when
  not) next to the existing disabled "Buy Now (Coming soon)" button - this
  becomes the one real, immediately usable action in that dialog today.
- **`components/design/alternative-grid.tsx`** (modified) — fetches
  `GET /api/favorites` once on mount, keeps a `Set<string>` of favorited
  product IDs in state, and derives/passes `isFavorited` +
  `onToggleFavorite` (which calls `POST`/`DELETE` then updates the local
  Set optimistically) down to `ProductDetailPanel`.
- **`app/profile/page.tsx`** (modified) — the Favorites section stops
  being a static "Coming soon" card and instead fetches `GET /api/favorites`
  the same way the Design History section already fetches `/api/designs`
  (same loading/error/empty-state pattern), rendering each favorited
  product as a small card (image, name, price).

## Edge cases

- **Favoriting the same product twice** (e.g. a double-click, or opening
  the panel again after already favoriting): idempotent at the database
  level via the unique constraint, and the API treats the resulting
  conflict as success rather than an error - the UI never needs to
  pre-check before allowing the click.
- **Unfavoriting something never favorited:** also idempotent - `DELETE`
  on a non-existent row is still a 200/success, not a 404, since the
  end-state (not favorited) is what the caller actually wants and already
  has.
- **Favorites fetch fails on the profile page or in `AlternativeGrid`:**
  same friendly-error-message pattern already used by the Design History
  section (`"Could not load your designs."` → here, `"Could not load your
  favorites."`), doesn't block the rest of the page from rendering.

## Testing

- API routes get real unit tests, matching the existing convention for
  every other API route in this app (`app/api/designs/route.test.ts` as
  the closest precedent) - mocking `next-auth`'s `getServerSession` and
  `@/lib/prisma`, covering: signed-out → 401 on all three routes; POST
  creates a favorite; POST on an already-favorited product doesn't error;
  DELETE removes a favorite; DELETE on a non-existent favorite doesn't
  error; GET returns the right shape.
- UI components (`ProductDetailPanel`, `AlternativeGrid`, the profile
  page's Favorites section) get no dedicated tests, consistent with this
  codebase's established precedent - no component has ever had one, this
  logic is presentational/wiring around already-tested API routes.

## Explicitly out of scope

- Favoriting whole designs (only products, per this round's decision).
- Any change to the disabled "Buy Now" button or actual purchasing.
- A dedicated `/favorites` page (this round only adds the section inside
  the existing `/profile` page).
- Sorting/filtering the favorites list.
