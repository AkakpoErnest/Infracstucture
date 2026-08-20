# Post-login Welcome Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the bare upload dropzone on `/design/new` with a split-screen layout — a name greeting plus the (unchanged) upload/form flow on the left, a slowly cross-fading rotation through 4 images on the right (hidden on mobile).

**Architecture:** One new pure function (`lib/greeting.ts`) for the only real branching logic, one new component (`components/design/post-login-hero.tsx`) that owns the split layout and the crossfade — mirroring the existing `components/landing/hero-transform.tsx` pattern exactly — and a thin modification to `app/design/new/page.tsx` to read the session name and wrap its existing body in the new component. Four unused repo-root PNGs are converted to compressed `.webp` and placed under `public/images/post-login/`.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind, framer-motion (already a dependency), next-auth/react's `useSession`, `sharp` (new devDependency, for one-off image conversion).

---

## Task 1: Convert the 4 source images to compressed webp

**Files:**
- Create: `scripts/convert-post-login-images.mjs`
- Create (generated, not hand-written): `public/images/post-login/3d-isometric-living-room.webp`
- Create (generated, not hand-written): `public/images/post-login/japandi-before-after.webp`
- Create (generated, not hand-written): `public/images/post-login/luxury-living-room.webp`
- Create (generated, not hand-written): `public/images/post-login/bohemian-living-room.webp`

- [ ] **Step 1: Install sharp**

Run: `npm install --save-dev sharp`
Expected: adds `sharp` to `devDependencies` in `package.json`, updates `package-lock.json`, no errors.

- [ ] **Step 2: Create the output directory**

Run: `mkdir -p public/images/post-login`

- [ ] **Step 3: Write the conversion script**

```javascript
// scripts/convert-post-login-images.mjs
import sharp from "sharp";
import path from "path";

// One-off script: converts 4 of the unused repo-root PNGs (2-8MB each) into
// compressed webp for the post-login welcome screen's rotating visual panel.
// Source files stay untouched at the repo root (out of scope to clean those
// up here) - this only produces the public/ copies actually served.
const conversions = [
  {
    src: "16_3d_isometric_cozy_living_room.png",
    out: "public/images/post-login/3d-isometric-living-room.webp",
  },
  {
    src: "03_before_after_japandi_room.png",
    out: "public/images/post-login/japandi-before-after.webp",
  },
  {
    src: "07_style_luxury_living_room.png",
    out: "public/images/post-login/luxury-living-room.webp",
  },
  {
    src: "10_style_bohemian_living_room.png",
    out: "public/images/post-login/bohemian-living-room.webp",
  },
];

for (const { src, out } of conversions) {
  await sharp(path.resolve(src))
    .resize({ width: 1200 })
    .webp({ quality: 80 })
    .toFile(path.resolve(out));
  console.log(`converted ${src} -> ${out}`);
}
```

- [ ] **Step 4: Run the script**

Run: `node scripts/convert-post-login-images.mjs`
Expected output:
```
converted 16_3d_isometric_cozy_living_room.png -> public/images/post-login/3d-isometric-living-room.webp
converted 03_before_after_japandi_room.png -> public/images/post-login/japandi-before-after.webp
converted 07_style_luxury_living_room.png -> public/images/post-login/luxury-living-room.webp
converted 10_style_bohemian_living_room.png -> public/images/post-login/bohemian-living-room.webp
```

- [ ] **Step 5: Verify output file sizes are reasonable**

Run: `ls -la public/images/post-login/`
Expected: each file well under 300KB (matching the size discipline of the existing `public/images/hero/*.webp` files, which range 50-330KB). If any file is unexpectedly large, lower the `quality` value in the script and re-run Step 4.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json scripts/convert-post-login-images.mjs public/images/post-login/
git commit -m "Add converted post-login welcome screen images

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: Greeting text helper

**Files:**
- Create: `lib/greeting.ts`
- Test: `lib/greeting.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// lib/greeting.test.ts
import { describe, it, expect } from "vitest";
import { greetingText } from "./greeting";

describe("greetingText", () => {
  it("includes the name when given", () => {
    expect(greetingText("Demo User")).toBe("Welcome back, Demo User");
  });

  it("falls back to a plain greeting when name is null", () => {
    expect(greetingText(null)).toBe("Welcome back");
  });

  it("falls back to a plain greeting when name is undefined", () => {
    expect(greetingText(undefined)).toBe("Welcome back");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node_modules/.bin/vitest run lib/greeting.test.ts`
Expected: FAIL — `Cannot find module './greeting'` (the module doesn't exist yet).

- [ ] **Step 3: Write the implementation**

```typescript
// lib/greeting.ts
/**
 * Renders the post-login welcome greeting. Falls back to a plain "Welcome
 * back" (no trailing text) when there's no name to show, rather than
 * printing "undefined"/"null" - defensive only, since signup requires a
 * name today so this branch shouldn't be reachable in practice.
 */
export function greetingText(name: string | null | undefined): string {
  return name ? `Welcome back, ${name}` : "Welcome back";
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node_modules/.bin/vitest run lib/greeting.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/greeting.ts lib/greeting.test.ts
git commit -m "Add greeting text helper for post-login welcome screen

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: PostLoginHero component

**Files:**
- Create: `components/design/post-login-hero.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/design/post-login-hero.tsx
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { greetingText } from "@/lib/greeting";

// Same rotating-crossfade pattern as components/landing/hero-transform.tsx,
// generalized from 2 fixed states to a 4-image rotation.
const VISUALS = [
  {
    src: "/images/post-login/3d-isometric-living-room.webp",
    alt: "3D isometric render of a cozy living room",
  },
  {
    src: "/images/post-login/japandi-before-after.webp",
    alt: "A room shown before and after an AI-generated Japandi redesign",
  },
  {
    src: "/images/post-login/luxury-living-room.webp",
    alt: "A luxury-style living room design example",
  },
  {
    src: "/images/post-login/bohemian-living-room.webp",
    alt: "A bohemian-style living room design example",
  },
] as const;

const INTERVAL_MS = 3500;

function RotatingVisual() {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % VISUALS.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [reducedMotion]);

  const active = VISUALS[reducedMotion ? 0 : index];

  return (
    <div className="relative hidden h-full w-full overflow-hidden md:block">
      <AnimatePresence mode="sync">
        <motion.div
          key={active.src}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={active.src}
            alt={active.alt}
            fill
            sizes="(min-width: 768px) 50vw, 0px"
            className="object-cover"
            priority={active.src === VISUALS[0].src}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export function PostLoginHero({
  userName,
  children,
}: {
  userName: string | null | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="flex flex-col justify-center gap-6 p-8">
        <div>
          <p className="text-sm text-muted-foreground">{greetingText(userName)}</p>
          <h1 className="mt-1 text-2xl font-bold">Design your room</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Upload a photo of your room to get 4 AI-generated redesigns.
          </p>
        </div>
        {children}
      </div>
      <RotatingVisual />
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `node_modules/.bin/tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/design/post-login-hero.tsx
git commit -m "Add PostLoginHero component with rotating visual panel

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: Wire PostLoginHero into the /design/new page

**Files:**
- Modify: `app/design/new/page.tsx`

- [ ] **Step 1: Replace the page body**

Replace the full contents of `app/design/new/page.tsx` with:

```typescript
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { RoomUpload } from "@/components/design/room-upload";
import { DesignRequestForm } from "@/components/design/design-request-form";
import { PostLoginHero } from "@/components/design/post-login-hero";
import type { DesignRequestInput } from "@/types/design";

export default function NewDesignPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [roomPhotoUrl, setRoomPhotoUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(input: DesignRequestInput) {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/designs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(typeof data.error === "string" ? data.error : "Could not generate designs");
        return;
      }

      const data = await res.json();
      router.push(`/design/${data.designId}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

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
}
```

- [ ] **Step 2: Type-check**

Run: `node_modules/.bin/tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Run the full test suite**

Run: `node_modules/.bin/vitest run`
Expected: all tests still pass (this change touches no tested logic — `RoomUpload`, `DesignRequestForm`, and the submit/error handling are unchanged, only re-wrapped).

- [ ] **Step 4: Commit**

```bash
git add app/design/new/page.tsx
git commit -m "Wire PostLoginHero into the /design/new page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: Live verification

No automated test covers the crossfade timing or responsive behavior (same as the existing `hero-transform.tsx`, which also has none) - this is verified live, matching how every other feature in this project has been checked.

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Run (from the project root, with `.env.local` sourced):
```bash
set -a; source .env.local; set +a
node_modules/.bin/next dev > /tmp/wf-verify.log 2>&1 &
```
Poll `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` until it returns `200` before continuing.

- [ ] **Step 2: Desktop-width check**

Using a headless browser (Playwright, or the project's `chromium-cli`/`run` skill tooling if available) at a 1280px-wide viewport:
1. Sign in with a test account (or sign up a fresh one via `/sign-up`).
2. Confirm landing on `/design/new` shows: the greeting text containing the signed-up name, the upload box, AND the right-hand visual panel (not blank/broken image).
3. Wait ~4 seconds and re-screenshot - confirm the visual panel's image has changed (crossfade advanced).
4. Check browser console for errors (`console --errors` if using `chromium-cli`, or `page.on("console", ...)` if scripting Playwright directly) - expect none.

- [ ] **Step 3: Mobile-width check**

Same flow at a 375px-wide viewport:
1. Confirm the greeting + upload box render full-width.
2. Confirm the visual panel does NOT render at all (no broken image, no empty gap - `hidden md:block` should remove it from layout entirely).

- [ ] **Step 4: Stop the dev server**

Run: `lsof -ti:3000 | xargs kill -9`

No commit for this task - if either check fails, fix the relevant file from Task 3 or 4, re-run the affected task's type-check/test step, then re-verify here.

---

## Self-review notes

- **Spec coverage:** components (Task 3, 4), assets (Task 1), responsive behavior (Task 3's `hidden md:block`, verified in Task 5), edge cases - no-name fallback (Task 2) and image-load failure (inherent to `next/image`, no extra code needed, not separately testable), testing (Task 2's unit test + Task 5's live check), explicitly-out-of-scope items - untouched by any task. All covered.
- **No placeholders:** every code step above is complete, runnable code - none omitted or summarized.
- **Type consistency:** `greetingText(name: string | null | undefined)` in Task 2 matches the `userName: string | null | undefined` prop in Task 3's `PostLoginHero`, which matches `session?.user?.name` (typed `string | null | undefined` per `next-auth`'s `DefaultSession["user"]`) passed in Task 4 - no mismatches.
