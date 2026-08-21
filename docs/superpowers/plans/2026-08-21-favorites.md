# Favorites (Products) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a signed-in user favorite/unfavorite catalog products from the product-detail panel, and show their real favorited products on `/profile`, replacing the static stub.

**Architecture:** One new Prisma model (`Favorite`) plus a migration, two small API route files following the exact auth/response pattern every other route in this app already uses, and three existing UI files gaining favorite-related props/state - no new business logic beyond straightforward CRUD.

**Tech Stack:** Next.js 14 (App Router), Prisma + Postgres (Supabase), next-auth, vitest, lucide-react (`Heart` icon, already available).

---

## Task 1: Favorite Prisma model + migration

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add the Favorite model and back-relations**

In `prisma/schema.prisma`, add `favorites Favorite[]` to the `User` model (after its existing `designs Design[]` line), so it reads:

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  name         String
  createdAt    DateTime @default(now())
  designs      Design[]
  favorites    Favorite[]
}
```

Add `favorites Favorite[]` to the `Product` model (after its existing `designItems DesignItem[]` line), so it reads:

```prisma
model Product {
  id          String       @id @default(uuid())
  name        String
  brandId     String
  brand       Brand        @relation(fields: [brandId], references: [id])
  category    String
  styleTags   String
  color       String
  material    String
  price       Float
  dimensions  String
  imageUrl    String
  designItems DesignItem[]
  favorites   Favorite[]

  @@index([brandId])
}
```

Add a new `Favorite` model at the end of the file (after the existing `DesignItem` model):

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

- [ ] **Step 2: Generate and apply the migration**

Run (from the project root, with env vars loaded so Prisma can reach the real Supabase Postgres database):

```bash
set -a; source .env.local; set +a
node_modules/.bin/prisma migrate dev --name add_favorites
```

Expected: Prisma prints a generated migration name like
`prisma/migrations/<timestamp>_add_favorites/migration.sql`, applies it
to the database, and regenerates the Prisma Client. No prompts should
appear (this is a purely additive migration - new table, new columns on
existing tables via new back-relation fields don't add real columns since
they're virtual/relation-only on the Prisma side, only `Favorite`'s table
is new).

- [ ] **Step 3: Verify the migration applied cleanly**

Run: `set -a; source .env.local; set +a; node_modules/.bin/prisma migrate status`
Expected: `Database schema is up to date!`

- [ ] **Step 4: Type-check**

Run: `node_modules/.bin/tsc --noEmit`
Expected: no errors (the regenerated Prisma Client now has `prisma.favorite`
typed and available).

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "Add Favorite model and migration

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: GET + POST /api/favorites

**Files:**
- Create: `app/api/favorites/route.ts`
- Test: `app/api/favorites/route.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// app/api/favorites/route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({ getServerSession: (...a: unknown[]) => mockGetServerSession(...a) }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

const mockFindMany = vi.fn();
const mockCreate = vi.fn();
const mockProductFindUnique = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: {
    favorite: {
      findMany: (...a: unknown[]) => mockFindMany(...a),
      create: (...a: unknown[]) => mockCreate(...a),
    },
    product: {
      findUnique: (...a: unknown[]) => mockProductFindUnique(...a),
    },
  },
}));

import { GET, POST } from "./route";

function postReq(body: unknown) {
  return new Request("http://localhost/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/favorites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
  });

  it("returns 401 when not signed in", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns favorited products in ProductDetail shape", async () => {
    mockFindMany.mockResolvedValue([
      {
        id: "f1",
        createdAt: new Date(),
        product: {
          id: "p1",
          name: "Oslo Sofa",
          color: "Grey",
          dimensions: "210x90x80cm",
          material: "Boucle",
          price: 899,
          imageUrl: "/img/oslo.png",
          brand: { name: "Nordika" },
        },
      },
    ]);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([
      {
        id: "p1",
        name: "Oslo Sofa",
        brandName: "Nordika",
        color: "Grey",
        dimensions: "210x90x80cm",
        material: "Boucle",
        price: 899,
        imageUrl: "/img/oslo.png",
      },
    ]);
  });
});

describe("POST /api/favorites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
    mockProductFindUnique.mockResolvedValue({ id: "p1" });
    mockCreate.mockResolvedValue({ id: "f1", userId: "u1", productId: "p1" });
  });

  it("returns 401 when not signed in", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await POST(postReq({ productId: "p1" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when productId is missing", async () => {
    const res = await POST(postReq({}));
    expect(res.status).toBe(400);
  });

  it("returns 404 when the product doesn't exist", async () => {
    mockProductFindUnique.mockResolvedValue(null);
    const res = await POST(postReq({ productId: "missing" }));
    expect(res.status).toBe(404);
  });

  it("creates a favorite and returns 200", async () => {
    const res = await POST(postReq({ productId: "p1" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ favorited: true });
    expect(mockCreate).toHaveBeenCalledWith({ data: { userId: "u1", productId: "p1" } });
  });

  it("treats an already-favorited product as success, not an error", async () => {
    mockCreate.mockRejectedValue({ code: "P2002" });
    const res = await POST(postReq({ productId: "p1" }));
    expect(res.status).toBe(200);
  });

  it("rethrows non-duplicate errors", async () => {
    mockCreate.mockRejectedValue(new Error("db exploded"));
    await expect(POST(postReq({ productId: "p1" }))).rejects.toThrow("db exploded");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node_modules/.bin/vitest run app/api/favorites/route.test.ts`
Expected: FAIL - `Cannot find module './route'` (the route doesn't exist yet).

- [ ] **Step 3: Write the implementation**

```typescript
// app/api/favorites/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { product: { include: { brand: true } } },
  });

  const products = favorites.map((f) => ({
    id: f.product.id,
    name: f.product.name,
    brandName: f.product.brand.name,
    color: f.product.color,
    dimensions: f.product.dimensions,
    material: f.product.material,
    price: f.product.price,
    imageUrl: f.product.imageUrl,
  }));

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const productId = (body as { productId?: unknown })?.productId;
  if (typeof productId !== "string" || !productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  try {
    await prisma.favorite.create({ data: { userId, productId } });
  } catch (err) {
    // Unique constraint violation (already favorited) - idempotent
    // success, not an error. Prisma's known-error code for this is P2002.
    const isDuplicate =
      typeof err === "object" && err !== null && "code" in err && (err as { code: unknown }).code === "P2002";
    if (!isDuplicate) throw err;
  }

  return NextResponse.json({ favorited: true }, { status: 200 });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node_modules/.bin/vitest run app/api/favorites/route.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add app/api/favorites/route.ts app/api/favorites/route.test.ts
git commit -m "Add GET/POST /api/favorites

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: DELETE /api/favorites/[productId]

**Files:**
- Create: `app/api/favorites/[productId]/route.ts`
- Test: `app/api/favorites/[productId]/route.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// app/api/favorites/[productId]/route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({ getServerSession: (...a: unknown[]) => mockGetServerSession(...a) }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

const mockDeleteMany = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: {
    favorite: { deleteMany: (...a: unknown[]) => mockDeleteMany(...a) },
  },
}));

import { DELETE } from "./route";

function req() {
  return new Request("http://localhost/api/favorites/p1", { method: "DELETE" });
}

describe("DELETE /api/favorites/[productId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
    mockDeleteMany.mockResolvedValue({ count: 1 });
  });

  it("returns 401 when not signed in", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await DELETE(req(), { params: { productId: "p1" } });
    expect(res.status).toBe(401);
  });

  it("removes the favorite and returns 200", async () => {
    const res = await DELETE(req(), { params: { productId: "p1" } });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ favorited: false });
    expect(mockDeleteMany).toHaveBeenCalledWith({ where: { userId: "u1", productId: "p1" } });
  });

  it("is idempotent - succeeds even if nothing was favorited", async () => {
    mockDeleteMany.mockResolvedValue({ count: 0 });
    const res = await DELETE(req(), { params: { productId: "p1" } });
    expect(res.status).toBe(200);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node_modules/.bin/vitest run "app/api/favorites/[productId]/route.test.ts"`
Expected: FAIL - `Cannot find module './route'`.

- [ ] **Step 3: Write the implementation**

```typescript
// app/api/favorites/[productId]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: { productId: string } }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // deleteMany (not delete) so removing a favorite that doesn't exist is a
  // no-op success (count: 0) rather than a thrown P2025 error - the
  // end-state the caller wants (not favorited) is already true either way.
  await prisma.favorite.deleteMany({ where: { userId, productId: params.productId } });

  return NextResponse.json({ favorited: false }, { status: 200 });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node_modules/.bin/vitest run "app/api/favorites/[productId]/route.test.ts"`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add "app/api/favorites/[productId]/route.ts" "app/api/favorites/[productId]/route.test.ts"
git commit -m "Add DELETE /api/favorites/[productId]

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: ProductDetailPanel heart-toggle

**Files:**
- Modify: `components/design/product-detail-panel.tsx`

- [ ] **Step 1: Add the favorite props and heart button**

Replace the full contents of `components/design/product-detail-panel.tsx` with:

```typescript
"use client";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface ProductDetail {
  id: string;
  name: string;
  brandName: string;
  color: string;
  dimensions: string;
  material: string;
  price: number;
  imageUrl: string;
}

export function ProductDetailPanel({
  product,
  open,
  onOpenChange,
  isFavorited,
  onToggleFavorite,
}: {
  product: ProductDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isFavorited: boolean;
  onToggleFavorite: () => void;
}) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{product.name}</DialogTitle>
        <DialogDescription className="sr-only">Product details for {product.name}</DialogDescription>
        <Image
          src={product.imageUrl}
          alt={product.name}
          width={400}
          height={300}
          className="mt-2 w-full rounded-md object-cover"
        />
        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <dt className="text-muted-foreground">Brand</dt>
          <dd>{product.brandName}</dd>
          <dt className="text-muted-foreground">Color</dt>
          <dd>{product.color}</dd>
          <dt className="text-muted-foreground">Dimensions</dt>
          <dd>{product.dimensions}</dd>
          <dt className="text-muted-foreground">Material</dt>
          <dd>{product.material}</dd>
          <dt className="text-muted-foreground">Price</dt>
          <dd>${product.price}</dd>
        </dl>
        <div className="mt-4 flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={onToggleFavorite}
            aria-pressed={isFavorited}
          >
            <Heart
              className={
                isFavorited ? "mr-2 h-4 w-4 fill-destructive text-destructive" : "mr-2 h-4 w-4"
              }
            />
            {isFavorited ? "Favorited" : "Add to Favorites"}
          </Button>
          <Button className="w-full" disabled title="Purchasing isn't available yet">
            Buy Now (Coming soon)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

(This adds two new required props - `isFavorited` and `onToggleFavorite` - so
`AlternativeGrid`, the only current caller, must be updated in Task 5 to pass
them or this won't type-check. That's expected; Task 5 does exactly that.)

- [ ] **Step 2: Type-check**

Run: `node_modules/.bin/tsc --noEmit`
Expected: an error in `components/design/alternative-grid.tsx` about missing
`isFavorited`/`onToggleFavorite` props on `<ProductDetailPanel>` - this is
expected and gets fixed in Task 5, not this one. Confirm the error is
*only* about that (no unrelated errors in this file).

- [ ] **Step 3: Commit**

```bash
git add components/design/product-detail-panel.tsx
git commit -m "Add favorite heart-toggle to ProductDetailPanel

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: AlternativeGrid wiring

**Files:**
- Modify: `components/design/alternative-grid.tsx`

- [ ] **Step 1: Replace the full file**

Replace the full contents of `components/design/alternative-grid.tsx` with:

```typescript
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { HotspotOverlay } from "./hotspot-overlay";
import { ProductDetailPanel, type ProductDetail } from "./product-detail-panel";

export interface AlternativeItem {
  productId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  product: ProductDetail;
}

export interface Alternative {
  id: string;
  index: number;
  imageUrl: string | null;
  status: "pending" | "ready" | "failed";
  hasHotspots: boolean;
  errorMessage: string | null;
  items: AlternativeItem[];
}

export function AlternativeGrid({
  alternatives,
  onRegenerate,
}: {
  alternatives: Alternative[];
  onRegenerate: (index: number) => void;
}) {
  const [active, setActive] = useState<Alternative | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/favorites");
        if (!res.ok) return;
        const products: ProductDetail[] = await res.json();
        setFavoriteIds(new Set(products.map((p) => p.id)));
      } catch {
        // Favorites are non-critical to the core design-viewing flow - a
        // failed fetch just means every heart starts unfilled, not an
        // app-breaking error.
      }
    })();
  }, []);

  async function toggleFavorite(productId: string) {
    const alreadyFavorited = favoriteIds.has(productId);

    // Optimistic update - the heart flips immediately, the request
    // confirms it in the background.
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (alreadyFavorited) next.delete(productId);
      else next.add(productId);
      return next;
    });

    try {
      if (alreadyFavorited) {
        await fetch(`/api/favorites/${productId}`, { method: "DELETE" });
      } else {
        await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
      }
    } catch {
      // Revert the optimistic update if the request actually failed.
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (alreadyFavorited) next.add(productId);
        else next.delete(productId);
        return next;
      });
    }
  }

  function selectProduct(productId: string) {
    const item = active?.items.find((i) => i.productId === productId);
    if (item) setSelectedProduct(item.product);
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {alternatives.map((alt) => (
          <Card key={alt.id}>
            <CardContent className="p-2">
              {alt.status === "ready" && alt.imageUrl && (
                <button className="block w-full" onClick={() => setActive(alt)}>
                  <Image
                    src={alt.imageUrl}
                    alt={`Design alternative ${alt.index + 1}`}
                    width={400}
                    height={300}
                    className="w-full rounded-md object-cover"
                  />
                </button>
              )}
              {alt.status === "pending" && (
                <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-md">
                  <Image
                    src="/images/abstract/wireframe-to-rendered.webp"
                    alt=""
                    fill
                    sizes="400px"
                    className="object-cover opacity-40"
                  />
                  <span className="relative rounded-md bg-background/80 px-3 py-1 text-sm text-muted-foreground backdrop-blur">
                    Generating...
                  </span>
                </div>
              )}
              {alt.status === "failed" && (
                <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm">
                  <p className="text-destructive">{alt.errorMessage ?? "Generation failed"}</p>
                  <button
                    className="rounded-md border border-border px-3 py-1 text-xs"
                    onClick={() => onRegenerate(alt.index)}
                  >
                    Regenerate
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {active && active.imageUrl && (
        <div className="mt-6">
          <div className="relative inline-block">
            <Image
              src={active.imageUrl}
              alt={`Design alternative ${active.index + 1} detail`}
              width={800}
              height={600}
              className="rounded-md"
            />
            {active.hasHotspots && (
              <HotspotOverlay
                hotspots={active.items.map((i) => ({
                  productId: i.productId,
                  productName: i.product.name,
                  x: i.x,
                  y: i.y,
                  width: i.width,
                  height: i.height,
                }))}
                onSelect={selectProduct}
              />
            )}
          </div>

          {!active.hasHotspots && active.items.length > 0 && (
            <ul className="mt-4 flex flex-col gap-2">
              {active.items.map((i) => (
                <li key={i.productId}>
                  <button
                    className="text-sm underline"
                    onClick={() => selectProduct(i.productId)}
                  >
                    {i.product.name}: ${i.product.price}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <ProductDetailPanel
        product={selectedProduct}
        open={Boolean(selectedProduct)}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
        isFavorited={selectedProduct ? favoriteIds.has(selectedProduct.id) : false}
        onToggleFavorite={() => selectedProduct && toggleFavorite(selectedProduct.id)}
      />
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `node_modules/.bin/tsc --noEmit`
Expected: no errors (this fixes the expected error from Task 4's Step 2).

- [ ] **Step 3: Run the full test suite**

Run: `node_modules/.bin/vitest run`
Expected: all tests pass (this file has no dedicated test; no tested logic
elsewhere is touched).

- [ ] **Step 4: Commit**

```bash
git add components/design/alternative-grid.tsx
git commit -m "Wire favorite state into AlternativeGrid

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 6: Real Favorites section on /profile

**Files:**
- Modify: `app/profile/page.tsx`

- [ ] **Step 1: Replace the full file**

Replace the full contents of `app/profile/page.tsx` with:

```typescript
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { AppHeader } from "@/components/layout/app-header";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

interface DesignSummary {
  id: string;
  roomType: string;
  style: string;
  createdAt: string;
}

interface FavoriteProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export default function ProfilePage() {
  // `required: true` makes next-auth redirect to the configured sign-in
  // page (pages.signIn = "/sign-in" in lib/auth.ts) when there's no
  // session, rather than rendering this page in a broken half-logged-out
  // state - this is the one route in the app that explicitly needs a
  // session to make sense at all.
  const { data: session } = useSession({ required: true });
  const [designs, setDesigns] = useState<DesignSummary[] | null>(null);
  const [designsError, setDesignsError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoriteProduct[] | null>(null);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/designs");
        if (!res.ok) {
          setDesignsError("Could not load your designs.");
          return;
        }
        setDesigns(await res.json());
      } catch {
        setDesignsError("Could not load your designs.");
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/favorites");
        if (!res.ok) {
          setFavoritesError("Could not load your favorites.");
          return;
        }
        setFavorites(await res.json());
      } catch {
        setFavoritesError("Could not load your favorites.");
      }
    })();
  }, []);

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="mb-6 text-2xl font-bold">Profile</h1>

        <section className="mb-8">
          <h2 className="mb-2 text-lg font-semibold">Account</h2>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium">{session?.user?.name}</p>
              <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-8">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Design history</h2>
            <Link href="/design" className="text-sm underline">
              View all
            </Link>
          </div>
          {designsError && <p className="text-sm text-destructive">{designsError}</p>}
          {designs === null && !designsError && (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
          {designs?.length === 0 && (
            <p className="text-sm text-muted-foreground">No designs yet.</p>
          )}
          <div className="flex flex-col gap-3">
            {designs?.slice(0, 3).map((d) => (
              <Link key={d.id} href={`/design/${d.id}`}>
                <Card>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <CardTitle>
                        {d.roomType}, {d.style}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-lg font-semibold">Favorites</h2>
          {favoritesError && <p className="text-sm text-destructive">{favoritesError}</p>}
          {favorites === null && !favoritesError && (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
          {favorites?.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No favorites yet. Click the heart on any product in a design to save it here.
            </p>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {favorites?.map((p) => (
              <Card key={p.id}>
                <div className="relative aspect-square w-full">
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    sizes="(min-width: 640px) 200px, 45vw"
                    className="rounded-t-lg object-cover"
                  />
                </div>
                <CardContent className="p-3">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">${p.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-lg font-semibold">Saved addresses</h2>
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">Coming soon.</CardContent>
          </Card>
        </section>

        <section className="mb-8">
          <h2 className="mb-2 text-lg font-semibold">Turnkey bookings</h2>
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">Coming soon.</CardContent>
          </Card>
        </section>

        <section>
          <h2 className="mb-2 text-lg font-semibold">Purchase history</h2>
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              Coming soon — needs checkout/payments to exist first.
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `node_modules/.bin/tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Run the full test suite**

Run: `node_modules/.bin/vitest run`
Expected: all tests pass (this page has no dedicated test; no tested logic
is touched).

- [ ] **Step 4: Commit**

```bash
git add app/profile/page.tsx
git commit -m "Show real favorited products on the profile page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 7: Live verification

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

```bash
set -a; source .env.local; set +a
node_modules/.bin/next dev > /tmp/wf-favorites-verify.log 2>&1 &
```
Poll `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` until it
returns `200`.

- [ ] **Step 2: End-to-end favorite/unfavorite check**

Using a headless browser (Playwright) or manual walkthrough:
1. Sign in (or sign up a fresh test account).
2. Upload a room photo, generate a design with `serviceOption` set to
   `ready_to_implement` (this is what gates hotspot detection on - check
   `app/api/designs/route.ts`'s `wantsHotspots` condition) so the result has
   clickable product hotspots.
3. Once a design alternative is ready with hotspots, click a hotspot to
   open the product detail panel. Confirm it shows "Add to Favorites"
   (not filled/not "Favorited").
4. Click "Add to Favorites". Confirm the button immediately updates to
   show "Favorited" with a filled heart, with no page reload.
5. Navigate to `/profile`. Confirm the Favorites section shows this exact
   product (image, name, price) - not "Coming soon", not empty.
6. Go back to the design, reopen the same product's detail panel. Confirm
   it now shows "Favorited" (state persisted via the real API, not just
   local optimistic state from the previous session).
7. Click "Favorited" again to unfavorite. Confirm it reverts to "Add to
   Favorites".
8. Reload `/profile`. Confirm the Favorites section no longer shows that
   product.
9. Check browser console for errors throughout - expect none.

- [ ] **Step 3: Stop the dev server**

```bash
lsof -ti:3000 | xargs kill -9
```

No commit for this task - if any check fails, fix the relevant file from
Tasks 1-6, re-run that task's type-check/test step, then re-verify here.

---

## Self-review notes

- **Spec coverage:** Data model (Task 1), `GET`/`POST`/`DELETE` routes
  with the exact idempotency behavior the spec requires (Tasks 2-3),
  `ProductDetailPanel` heart-toggle (Task 4), `AlternativeGrid` wiring
  with optimistic updates (Task 5), real Favorites section replacing the
  stub (Task 6), all edge cases from the spec (double-favorite,
  unfavorite-nothing, fetch failure) covered by tests or explicit
  fallback UI. Out-of-scope items (favoriting designs, a dedicated
  `/favorites` page, purchasing, sorting) - untouched. All covered.
- **No placeholders:** every code step above is complete, runnable code.
- **Type consistency:** `ProductDetail` (id, name, brandName, color,
  dimensions, material, price, imageUrl) is the same shape everywhere
  it's used - `GET /api/favorites`'s response shape (Task 2),
  `ProductDetailPanel`'s existing interface (Task 4, unchanged),
  `AlternativeGrid`'s import and usage (Task 5). `FavoriteProduct` (a
  narrower id/name/price/imageUrl shape, Task 6) is intentionally
  different since the profile page's list cards don't need brand/color/
  dimensions/material - deliberate, not an inconsistency. `isFavorited`/
  `onToggleFavorite` prop names match exactly between Task 4's
  `ProductDetailPanel` definition and Task 5's `AlternativeGrid` usage.
