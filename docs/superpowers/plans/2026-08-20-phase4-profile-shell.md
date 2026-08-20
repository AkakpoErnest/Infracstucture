# Phase 4 Profile Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a minimal shared header across the logged-in pages and a `/profile` page showing account info, a design history preview, and visible "coming soon" stubs for favorites/saved addresses/turnkey bookings/purchase history.

**Architecture:** One new presentational header component (`AppHeader`) wired into the three existing logged-in pages as a sibling above their current content, plus one new `/profile` page that reads the existing session and the existing `/api/designs` endpoint — no new data model, no new API routes, no new business logic.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind, `next-auth/react` (`useSession`, `signOut`).

---

## Task 1: AppHeader component

**Files:**
- Create: `components/layout/app-header.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/layout/app-header.tsx
"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

/**
 * Minimal shared header for the logged-in pages (/design/new, /design/[id],
 * /design, /profile). The marketing homepage (app/page.tsx) has its own
 * separate nav and does not use this - this header is specifically for
 * pages that assume a signed-in user.
 */
export function AppHeader() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between p-4">
        <Link href="/" className="text-lg font-bold">
          Afuna AI
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/design" className="text-sm text-muted-foreground hover:text-foreground">
            My Designs
          </Link>
          <Link href="/profile" className="text-sm text-muted-foreground hover:text-foreground">
            Profile
          </Link>
          {session && (
            <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
              Sign out
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `node_modules/.bin/tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/layout/app-header.tsx
git commit -m "Add shared AppHeader component for logged-in pages

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: Wire AppHeader into /design/new

**Files:**
- Modify: `app/design/new/page.tsx`

- [ ] **Step 1: Add the header as a sibling above PostLoginHero**

The current file's `return` statement is:

```typescript
  return (
    <PostLoginHero userName={session?.user?.name}>
      {!roomPhotoUrl ? (
        <RoomUpload onUploaded={setRoomPhotoUrl} />
      ) : (
        <DesignRequestForm roomPhotoUrl={roomPhotoUrl} onSubmit={handleSubmit} submitting={submitting} />
      )}
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
    </PostLoginHero>
  );
```

Replace it with:

```typescript
  return (
    <>
      <AppHeader />
      <PostLoginHero userName={session?.user?.name}>
        {!roomPhotoUrl ? (
          <RoomUpload onUploaded={setRoomPhotoUrl} />
        ) : (
          <DesignRequestForm roomPhotoUrl={roomPhotoUrl} onSubmit={handleSubmit} submitting={submitting} />
        )}
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </PostLoginHero>
    </>
  );
```

And add the import alongside the other component imports at the top of the file:

```typescript
import { AppHeader } from "@/components/layout/app-header";
```

- [ ] **Step 2: Type-check**

Run: `node_modules/.bin/tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Run the full test suite**

Run: `node_modules/.bin/vitest run`
Expected: all tests still pass (this page has no dedicated test; this change touches no tested logic).

- [ ] **Step 4: Commit**

```bash
git add app/design/new/page.tsx
git commit -m "Add AppHeader to /design/new

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: Wire AppHeader into /design/[id]

**Files:**
- Modify: `app/design/[id]/page.tsx`

This file has three separate `return` statements (error state, loading state, loaded state) - each needs the header added, since which branch renders depends on fetch state at any given moment.

- [ ] **Step 1: Add the import**

Add alongside the existing imports at the top of the file:

```typescript
import { AppHeader } from "@/components/layout/app-header";
```

- [ ] **Step 2: Add AppHeader to the error-state return**

Current:

```typescript
  if (error) {
    return (
      <main className="mx-auto max-w-xl p-8">
        <p className="text-sm text-destructive">{error}</p>
        <Link href="/design/new" className="mt-4 inline-block text-sm underline">
          Start a new design
        </Link>
      </main>
    );
  }
```

Replace with:

```typescript
  if (error) {
    return (
      <>
        <AppHeader />
        <main className="mx-auto max-w-xl p-8">
          <p className="text-sm text-destructive">{error}</p>
          <Link href="/design/new" className="mt-4 inline-block text-sm underline">
            Start a new design
          </Link>
        </main>
      </>
    );
  }
```

- [ ] **Step 3: Add AppHeader to the loading-state return**

Current:

```typescript
  if (!design) {
    return <main className="p-8">Loading...</main>;
  }
```

Replace with:

```typescript
  if (!design) {
    return (
      <>
        <AppHeader />
        <main className="p-8">Loading...</main>
      </>
    );
  }
```

- [ ] **Step 4: Add AppHeader to the loaded-state return**

Current:

```typescript
  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Your designs</h1>
      <AlternativeGrid alternatives={alternatives} onRegenerate={() => load()} />
    </main>
  );
```

Replace with:

```typescript
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-4xl p-8">
        <h1 className="mb-6 text-2xl font-bold">Your designs</h1>
        <AlternativeGrid alternatives={alternatives} onRegenerate={() => load()} />
      </main>
    </>
  );
```

- [ ] **Step 5: Type-check**

Run: `node_modules/.bin/tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Run the full test suite**

Run: `node_modules/.bin/vitest run`
Expected: all tests still pass.

- [ ] **Step 7: Commit**

```bash
git add "app/design/[id]/page.tsx"
git commit -m "Add AppHeader to /design/[id]

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: Wire AppHeader into /design (My Designs list)

**Files:**
- Modify: `app/design/page.tsx`

This file has two `return` statements (error state, main state) - both need the header.

- [ ] **Step 1: Add the import**

Add alongside the existing imports at the top of the file:

```typescript
import { AppHeader } from "@/components/layout/app-header";
```

- [ ] **Step 2: Add AppHeader to the error-state return**

Current:

```typescript
  if (error) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <p className="text-sm text-destructive">{error}</p>
        <Link href="/design/new" className="mt-4 inline-block text-sm underline">
          Start a new design
        </Link>
      </main>
    );
  }
```

Replace with:

```typescript
  if (error) {
    return (
      <>
        <AppHeader />
        <main className="mx-auto max-w-2xl p-8">
          <p className="text-sm text-destructive">{error}</p>
          <Link href="/design/new" className="mt-4 inline-block text-sm underline">
            Start a new design
          </Link>
        </main>
      </>
    );
  }
```

- [ ] **Step 3: Add AppHeader to the main return**

Current:

```typescript
  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="mb-6 flex items-center justify-between">
```

Change the opening to:

```typescript
  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-2xl p-8">
        <div className="mb-6 flex items-center justify-between">
```

...and at the very end of that same return statement, the existing closing:

```typescript
    </main>
  );
}
```

becomes:

```typescript
      </main>
    </>
  );
}
```

(The whole JSX tree inside stays exactly as it is - only the outermost `<main>` gains one level of indentation inside a new `<><AppHeader />...</>` wrapper. Re-indent the block's contents accordingly so it still reads cleanly, but don't change any of the actual markup/logic inside it.)

- [ ] **Step 4: Type-check**

Run: `node_modules/.bin/tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Run the full test suite**

Run: `node_modules/.bin/vitest run`
Expected: all tests still pass.

- [ ] **Step 6: Commit**

```bash
git add app/design/page.tsx
git commit -m "Add AppHeader to /design (My Designs list)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: /profile page

**Files:**
- Create: `app/profile/page.tsx`

- [ ] **Step 1: Write the page**

```typescript
// app/profile/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AppHeader } from "@/components/layout/app-header";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

interface DesignSummary {
  id: string;
  roomType: string;
  style: string;
  createdAt: string;
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
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">Coming soon.</CardContent>
          </Card>
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
Expected: all tests still pass (no new tested logic - same precedent as `app/design/page.tsx`, which also has no dedicated test).

- [ ] **Step 4: Commit**

```bash
git add app/profile/page.tsx
git commit -m "Add /profile page with account info, design history preview, and stub sections

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 6: Live verification

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

```bash
set -a; source .env.local; set +a
node_modules/.bin/next dev > /tmp/wf-phase4-verify.log 2>&1 &
```
Poll `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` until it returns `200`.

- [ ] **Step 2: Sign up a fresh test account and check the header everywhere**

Using a headless browser (Playwright), at a desktop viewport (e.g. 1280px):
1. Sign up a new account, land on `/design/new`.
2. Confirm the header is visible with "Afuna AI", "My Designs", "Profile", and "Sign out".
3. Click "Profile" - confirm it navigates to `/profile` and shows the real signed-up name and email, and all five sections (design history + 4 stubs) render.
4. Click "My Designs" - confirm it navigates to `/design` and the header is still present there.
5. Navigate to any `/design/[id]` URL for a design created by this account (or check the loading/error state briefly renders the header too) - confirm the header is present there as well.
6. Check browser console for errors across all of the above - expect none.

- [ ] **Step 3: Confirm the auth redirect works**

1. Sign out (via the header's "Sign out" button).
2. Navigate directly to `/profile`.
3. Confirm it redirects to `/sign-in` rather than rendering a broken/empty profile page.

- [ ] **Step 4: Stop the dev server**

```bash
lsof -ti:3000 | xargs kill -9
```

No commit for this task - if any check fails, fix the relevant file from Tasks 1-5, re-run that task's type-check/test step, then re-verify here.

---

## Self-review notes

- **Spec coverage:** AppHeader (Task 1), wired into all 4 logged-in pages (Tasks 2-4 for the 3 existing pages, Task 5's page itself includes it), `/profile` with account info + design history preview + 4 stub sections (Task 5), auth redirect edge case (Task 5's `required: true` + verified in Task 6 Step 3), design-history-fetch-fails edge case (Task 5's `designsError` state). Out-of-scope items (favorites/addresses/booking functionality, editing account info, real purchase history, sign-in/up redesign, auth guards on other pages) - untouched by any task. All covered.
- **No placeholders:** every code step above is complete, runnable code - none omitted or summarized. "Coming soon" text is literal intended UI copy, not a plan placeholder.
- **Type consistency:** `AppHeader` takes no props anywhere it's used (Tasks 2-5 all just render `<AppHeader />`) - consistent. `DesignSummary` in Task 5's `/profile` page matches the exact shape already used by `app/design/page.tsx`'s `DesignSummary` interface (`id`, `roomType`, `style`, `createdAt` as `string`) - consistent with what `/api/designs` actually returns.
