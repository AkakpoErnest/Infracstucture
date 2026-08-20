# Sign-in/Sign-up Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the bare centered forms on `/sign-in` and `/sign-up` with a split-screen layout: the unchanged form on one side, a new 3D scene (visually distinct from the homepage's) plus a rotating image on the other.

**Architecture:** A new `components/auth/` directory mirroring the existing `components/landing/` (3D scene) and `components/design/post-login-hero.tsx` (rotating image, split layout) patterns exactly, just with different geometry/material/images so it isn't a literal re-skin. Both auth pages get a thin wrapper change only - form logic is completely untouched.

**Tech Stack:** Next.js 14, TypeScript, Tailwind, `@react-three/fiber` + `@react-three/drei` (both already dependencies, already used by the homepage), framer-motion (already a dependency).

---

## Task 1: Convert the 5 source images to webp

**Files:**
- Create: `scripts/convert-auth-images.mjs`
- Create (generated): `public/images/auth/hero-golden-hour.webp`
- Create (generated): `public/images/auth/style-scandinavian-bedroom.webp`
- Create (generated): `public/images/auth/style-industrial-loft.webp`
- Create (generated): `public/images/auth/archviz-openplan-living-room.webp`
- Create (generated): `public/images/auth/abstract-fluid-violet-indigo.webp`

- [ ] **Step 1: Create the output directory**

Run: `mkdir -p public/images/auth`

- [ ] **Step 2: Write the conversion script**

```javascript
// scripts/convert-auth-images.mjs
import sharp from "sharp";
import path from "path";

// One-off script (same pattern as scripts/convert-post-login-images.mjs):
// converts 5 of the unused repo-root PNGs into compressed webp for the
// sign-in/sign-up visual panel. Source files stay untouched at the repo
// root - this only produces the public/ copies actually served.
const conversions = [
  {
    src: "02_hero_modern_living_golden_hour.png",
    out: "public/images/auth/hero-golden-hour.webp",
  },
  {
    src: "05_style_scandinavian_bedroom.png",
    out: "public/images/auth/style-scandinavian-bedroom.webp",
  },
  {
    src: "08_style_industrial_loft.png",
    out: "public/images/auth/style-industrial-loft.webp",
  },
  {
    src: "21_archviz_openplan_living_room.png",
    out: "public/images/auth/archviz-openplan-living-room.webp",
  },
  {
    src: "26_abstract_fluid_violet_indigo.png",
    out: "public/images/auth/abstract-fluid-violet-indigo.webp",
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

- [ ] **Step 3: Run the script**

Run: `node scripts/convert-auth-images.mjs`
Expected output:
```
converted 02_hero_modern_living_golden_hour.png -> public/images/auth/hero-golden-hour.webp
converted 05_style_scandinavian_bedroom.png -> public/images/auth/style-scandinavian-bedroom.webp
converted 08_style_industrial_loft.png -> public/images/auth/style-industrial-loft.webp
converted 21_archviz_openplan_living_room.png -> public/images/auth/archviz-openplan-living-room.webp
converted 26_abstract_fluid_violet_indigo.png -> public/images/auth/abstract-fluid-violet-indigo.webp
```

- [ ] **Step 4: Verify output file sizes are reasonable**

Run: `ls -la public/images/auth/`
Expected: each file well under 300KB (matching the size discipline already established by `public/images/post-login/*.webp`, which range 50-330KB). If any file is unexpectedly large, lower the `quality` value in the script and re-run Step 3.

- [ ] **Step 5: Commit**

```bash
git add scripts/convert-auth-images.mjs public/images/auth/
git commit -m "Add converted sign-in/sign-up visual redesign images

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: 3D scene components (AuthBlob, AuthScene, AuthSceneLoader)

**Files:**
- Create: `components/auth/auth-blob.tsx`
- Create: `components/auth/auth-scene.tsx`
- Create: `components/auth/auth-scene-loader.tsx`

- [ ] **Step 1: Write AuthBlob**

```typescript
// components/auth/auth-blob.tsx
"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, useTexture } from "@react-three/drei";
import type { Mesh } from "three";

// Deliberately distinct from components/landing/hero-blob.tsx: a faceted
// icosahedron (angular) instead of a smooth sphere, a glass/transmission
// material instead of an opaque distorted-liquid one, a different source
// photo, and a different rotation rhythm/direction - this should read as
// its own thing at a glance, not a re-skin of the homepage's blob.
export function AuthBlob({ reducedMotion }: { reducedMotion: boolean }) {
  const meshRef = useRef<Mesh>(null);
  const texture = useTexture("/images/auth/hero-golden-hour.webp");

  useFrame((_, delta) => {
    if (reducedMotion || !meshRef.current) return;
    meshRef.current.rotation.x += delta * 0.25;
    meshRef.current.rotation.y -= delta * 0.18;
  });

  return (
    <Float
      speed={reducedMotion ? 0 : 2.2}
      rotationIntensity={reducedMotion ? 0 : 0.9}
      floatIntensity={reducedMotion ? 0 : 0.8}
    >
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.3, 0]} />
        <MeshTransmissionMaterial
          map={texture}
          thickness={0.5}
          roughness={0.1}
          transmission={1}
          ior={1.2}
          chromaticAberration={0.03}
          distortion={0.1}
        />
      </mesh>
    </Float>
  );
}
```

- [ ] **Step 2: Write AuthScene**

```typescript
// components/auth/auth-scene.tsx
"use client";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { AuthBlob } from "./auth-blob";

export function AuthScene({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 4.2], fov: 42 }}
      style={{ touchAction: "pan-y" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 3, 4]} intensity={1.2} />
      <directionalLight position={[-3, -2, -3]} intensity={0.4} color="#a78bfa" />
      {/* useTexture (loading the room photo) suspends until it resolves */}
      <Suspense fallback={null}>
        <AuthBlob reducedMotion={reducedMotion} />
      </Suspense>
    </Canvas>
  );
}
```

- [ ] **Step 3: Write AuthSceneLoader**

```typescript
// components/auth/auth-scene-loader.tsx
"use client";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";

const AuthScene = dynamic(
  () => import("./auth-scene").then((m) => m.AuthScene),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse rounded-full bg-primary/5" />
    ),
  }
);

/**
 * Client-only wrapper: the WebGL canvas can't be server-rendered, and we
 * only decide whether to actually animate it once we know the visitor's
 * reduced-motion preference (unknown during SSR). Mirrors
 * components/landing/hero-scene-loader.tsx exactly.
 */
export function AuthSceneLoader() {
  const reducedMotion = useReducedMotion();
  return <AuthScene reducedMotion={Boolean(reducedMotion)} />;
}
```

- [ ] **Step 4: Type-check**

Run: `node_modules/.bin/tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/auth/auth-blob.tsx components/auth/auth-scene.tsx components/auth/auth-scene-loader.tsx
git commit -m "Add distinct 3D scene components for sign-in/sign-up

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: AuthVisualPanel component

**Files:**
- Create: `components/auth/auth-visual-panel.tsx`

- [ ] **Step 1: Write the component**

```typescript
// components/auth/auth-visual-panel.tsx
"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AuthSceneLoader } from "./auth-scene-loader";

// Same rotating-crossfade pattern as components/design/post-login-hero.tsx,
// with a different image set (none shared with the homepage or the
// post-login screen) and a slightly slower interval.
const VISUALS = [
  {
    src: "/images/auth/style-scandinavian-bedroom.webp",
    alt: "A Scandinavian-style bedroom design example",
  },
  {
    src: "/images/auth/style-industrial-loft.webp",
    alt: "An industrial-style loft design example",
  },
  {
    src: "/images/auth/archviz-openplan-living-room.webp",
    alt: "An architectural visualization of an open-plan living room",
  },
  {
    src: "/images/auth/abstract-fluid-violet-indigo.webp",
    alt: "An abstract fluid violet and indigo art piece",
  },
] as const;

const INTERVAL_MS = 4000;

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
    <div className="relative h-full w-full overflow-hidden">
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

/**
 * Split-screen host for the auth pages: the form (passed as children) on
 * the left, a 3D scene stacked above a rotating image on the right
 * (hidden on mobile). Unlike PostLoginHero, there is no AppHeader above
 * this on either auth page (AppHeader is only for pages that assume a
 * signed-in user), so plain min-h-screen is safe here with no overflow
 * risk.
 */
export function AuthVisualPanel({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen md:grid-cols-2">
      <div className="flex flex-col justify-center gap-4 p-8">{children}</div>
      <div className="relative hidden h-full flex-col md:flex">
        <div className="flex-1">
          <AuthSceneLoader />
        </div>
        <div className="flex-1">
          <RotatingVisual />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `node_modules/.bin/tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/auth/auth-visual-panel.tsx
git commit -m "Add AuthVisualPanel split-screen host for auth pages

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: Wire AuthVisualPanel into /sign-in and /sign-up

**Files:**
- Modify: `app/sign-in/page.tsx`
- Modify: `app/sign-up/page.tsx`

- [ ] **Step 1: Update /sign-in**

Add the import alongside the other component imports at the top of `app/sign-in/page.tsx`:

```typescript
import { AuthVisualPanel } from "@/components/auth/auth-visual-panel";
```

Replace the return statement - current:

```typescript
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </main>
  );
```

Replace with:

```typescript
  return (
    <AuthVisualPanel>
      <h1 className="text-2xl font-bold">Sign in</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthVisualPanel>
  );
```

(Only the outer `<main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-8">` / `</main>` becomes `<AuthVisualPanel>` / `</AuthVisualPanel>` - the `<h1>`, `<form>`, and everything inside are completely unchanged, not even re-indented since `AuthVisualPanel` takes `children` directly at the same nesting depth `<main>` was at.)

- [ ] **Step 2: Update /sign-up**

Add the same import alongside the other component imports at the top of `app/sign-up/page.tsx`:

```typescript
import { AuthVisualPanel } from "@/components/auth/auth-visual-panel";
```

Replace the return statement - current:

```typescript
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold">Create an account</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </Button>
      </form>
    </main>
  );
```

Replace with:

```typescript
  return (
    <AuthVisualPanel>
      <h1 className="text-2xl font-bold">Create an account</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </Button>
      </form>
    </AuthVisualPanel>
  );
```

- [ ] **Step 3: Type-check**

Run: `node_modules/.bin/tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Run the full test suite**

Run: `node_modules/.bin/vitest run`
Expected: all tests still pass (neither page has a dedicated test; this change touches no tested logic - form fields, `useState`, and submit handlers are completely unchanged).

- [ ] **Step 5: Commit**

```bash
git add app/sign-in/page.tsx app/sign-up/page.tsx
git commit -m "Wire AuthVisualPanel into /sign-in and /sign-up

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: Live verification

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

```bash
set -a; source .env.local; set +a
node_modules/.bin/next dev > /tmp/wf-auth-verify.log 2>&1 &
```
Poll `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` until it returns `200`.

- [ ] **Step 2: Desktop-width check on both pages**

Using a headless browser (Playwright) at a 1280px-wide viewport:
1. Navigate to `/sign-in`. Confirm the form (email/password fields, "Sign in" button) renders on the left, and the right-hand panel shows a 3D canvas element in its top half and an image in its bottom half.
2. Wait ~4.5 seconds and re-screenshot - confirm the rotating image has changed (crossfade advanced), same technique already verified working for the post-login screen.
3. Navigate to `/sign-up`. Confirm the same layout (form now has name/email/password fields, "Sign up" button) plus the same visual panel.
4. Check browser console for errors on both pages - expect none. In particular watch for any WebGL/Three.js context errors, which would indicate the 3D scene failed to initialize.

- [ ] **Step 3: Mobile-width check on both pages**

Same flow at a 375px-wide viewport:
1. Confirm the form renders full-width on both `/sign-in` and `/sign-up`.
2. Confirm the visual panel (3D scene + image) does not render/is not visible on either page (`hidden md:flex` should remove it from layout on mobile).

- [ ] **Step 4: Confirm the actual sign-in/sign-up flow still works**

1. On `/sign-up`, create a new test account (fill name/email/password, submit) - confirm it still redirects to `/design/new` on success, exactly as before this change.
2. Sign out, go to `/sign-in`, sign in with that same account - confirm it still redirects to `/design/new` on success.
3. Try `/sign-in` with a wrong password - confirm the existing "Invalid email or password" error still displays correctly inside the (now differently-wrapped) form.

- [ ] **Step 5: Stop the dev server**

```bash
lsof -ti:3000 | xargs kill -9
```

No commit for this task - if any check fails, fix the relevant file from Tasks 1-4, re-run that task's type-check/test step, then re-verify here.

---

## Self-review notes

- **Spec coverage:** `AuthBlob`/`AuthScene`/`AuthSceneLoader` distinct from the homepage's (Task 2), `AuthVisualPanel` split-screen host with rotating image (Task 3), wired into both auth pages with form logic untouched (Task 4), exact image files converted (Task 1), responsive behavior and reduced-motion handling (Task 3's `hidden md:flex` and `useReducedMotion` checks, verified live in Task 5), the actual auth flow still working (explicitly verified in Task 5 Step 4, which the post-login-welcome-screen plan didn't need since that work didn't touch submit logic - this one also doesn't touch submit logic, but a user-facing auth flow regression would be a much worse outcome to miss, so it gets an explicit re-check here). Out-of-scope items (form field/validation changes, `HeroScene`/`HeroBlob` changes, a shared layout/route-group refactor) - untouched by any task. All covered.
- **No placeholders:** every code step above is complete, runnable code - none omitted or summarized.
- **Type consistency:** `AuthBlob({ reducedMotion: boolean })` in Task 2 matches how `AuthScene` calls it (`<AuthBlob reducedMotion={reducedMotion} />`) and how `AuthSceneLoader` calls `AuthScene` (`<AuthScene reducedMotion={Boolean(reducedMotion)} />`) - consistent chain, mirroring the exact same chain already proven working for `HeroBlob`/`HeroScene`/`HeroSceneLoader`. `AuthVisualPanel({ children: React.ReactNode })` in Task 3 matches how both pages use it in Task 4 (passing the existing `<h1>`/`<form>` JSX as children, no other props). Image paths referenced in Task 3's `VISUALS` array and `AuthBlob`'s `useTexture` call match exactly the output paths produced by Task 1's conversion script.
