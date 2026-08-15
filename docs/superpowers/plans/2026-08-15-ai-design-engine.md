# AI Design Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Phase 3 of the AI-Powered Interior Design & Shopping Platform — a user uploads a room photo, fills out a design-request form, and gets four AI-generated room redesigns built only from a seeded product catalog, with clickable products on each.

**Architecture:** Next.js 14 App Router monolith (UI + API routes in one app), Prisma/SQLite for persistence, NextAuth credentials auth, Google Gemini for both image generation and a follow-up vision call that identifies placed products with bounding boxes.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn-style components, Prisma + SQLite, NextAuth.js, `@google/generative-ai`, Vitest.

**Spec:** `docs/superpowers/specs/2026-08-15-ai-design-engine-design.md`

---

## Task 1: Scaffold the Next.js project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `next-env.d.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `vitest.config.ts`
- Create: `.eslintrc.json`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "interior-ai",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest",
    "db:seed": "tsx prisma/seed.ts",
    "db:migrate": "prisma migrate dev"
  },
  "dependencies": {
    "next": "14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "next-auth": "^4.24.7",
    "@prisma/client": "^5.19.1",
    "bcryptjs": "^2.4.3",
    "@google/generative-ai": "^0.21.0",
    "zod": "^3.23.8",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.2",
    "class-variance-authority": "^0.7.0",
    "lucide-react": "^0.445.0",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-label": "^2.1.0",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "typescript": "^5.6.2",
    "@types/node": "^22.5.5",
    "@types/react": "^18.3.9",
    "@types/react-dom": "^18.3.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/uuid": "^10.0.0",
    "tailwindcss": "^3.4.12",
    "postcss": "^8.4.47",
    "autoprefixer": "^10.4.20",
    "prisma": "^5.19.1",
    "tsx": "^4.19.1",
    "vitest": "^2.1.1",
    "eslint": "^8.57.1",
    "eslint-config-next": "14.2.15"
  }
}
```

- [ ] **Step 2: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Write `next.config.js`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

module.exports = nextConfig;
```

- [ ] **Step 4: Write `next-env.d.ts`**

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

- [ ] **Step 5: Write `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 6: Write `postcss.config.js`**

```js
module.exports = {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
```

- [ ] **Step 7: Write `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 8: Write `.eslintrc.json`**

```json
{ "extends": "next/core-web-vitals" }
```

- [ ] **Step 9: Write `app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222 47% 11%;
    --primary: 222 47% 11%;
    --primary-foreground: 0 0% 98%;
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 98%;
    --border: 214 32% 91%;
  }
}

body {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
}
```

- [ ] **Step 10: Write `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Interior AI",
  description: "AI-powered interior design & shopping platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 11: Write `app/page.tsx`**

```tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-3xl font-bold">Interior AI</h1>
      <p className="max-w-md text-muted-foreground">
        Upload a photo of your room and get AI-generated redesigns built
        entirely from real, purchasable products.
      </p>
      <div className="flex gap-4">
        <Link
          href="/sign-in"
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="rounded-md border border-border px-4 py-2"
        >
          Sign up
        </Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 12: Install dependencies and verify the dev server boots**

Run: `cd /Users/pablo/Documents/Wife-Fred && npm install`
Expected: installs without errors.

Run: `npm run dev -- -p 3100 &` then `sleep 3 && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100`
Expected: `200`. Then stop it: `lsof -ti:3100 -sTCP:LISTEN | xargs -r kill`.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 14 + TypeScript + Tailwind project"
```

---

## Task 2: shadcn-style UI primitives

**Files:**
- Create: `lib/utils.ts`
- Create: `components/ui/button.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/label.tsx`
- Create: `components/ui/card.tsx`
- Create: `components/ui/dialog.tsx`

- [ ] **Step 1: Write `lib/utils.ts`**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Write `components/ui/button.tsx`**

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:opacity-90",
        outline: "border border-border bg-transparent hover:bg-muted",
        ghost: "hover:bg-muted",
        destructive: "bg-destructive text-destructive-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
);
Button.displayName = "Button";
```

- [ ] **Step 3: Write `components/ui/input.tsx`**

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
```

- [ ] **Step 4: Write `components/ui/label.tsx`**

```tsx
"use client";
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn("text-sm font-medium leading-none", className)}
    {...props}
  />
));
Label.displayName = "Label";
```

- [ ] **Step 5: Write `components/ui/card.tsx`**

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-lg border border-border bg-background shadow-sm", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 pb-2", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 pt-0", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold", className)} {...props} />;
}
```

- [ ] **Step 6: Write `components/ui/dialog.tsx`**

```tsx
"use client";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export function DialogContent({
  className,
  children,
  ...props
}: DialogPrimitive.DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
          "rounded-lg border border-border bg-background p-6 shadow-lg",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4">
          <X className="h-4 w-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
```

- [ ] **Step 7: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add shadcn-style UI primitives"
```

---

## Task 3: Prisma schema and client

**Files:**
- Create: `prisma/schema.prisma`
- Create: `lib/prisma.ts`
- Create: `.env.example`

- [ ] **Step 1: Write `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  name         String
  createdAt    DateTime @default(now())
  designs      Design[]
}

model Brand {
  id       String    @id @default(uuid())
  name     String    @unique
  logoUrl  String?
  products Product[]
}

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
}

model Design {
  id             String              @id @default(uuid())
  userId         String
  user           User                @relation(fields: [userId], references: [id])
  roomPhotoUrl   String
  roomType       String
  style          String
  colorPrefs     String
  materialPrefs  String
  flooringPref   String
  budget         Float
  serviceOption  String
  createdAt      DateTime            @default(now())
  alternatives   DesignAlternative[]
}

model DesignAlternative {
  id           String       @id @default(uuid())
  designId     String
  design       Design       @relation(fields: [designId], references: [id])
  index        Int
  imageUrl     String?
  status       String       @default("pending")
  hasHotspots  Boolean      @default(false)
  errorMessage String?
  items        DesignItem[]
}

model DesignItem {
  id                  String            @id @default(uuid())
  designAlternativeId String
  alternative         DesignAlternative @relation(fields: [designAlternativeId], references: [id])
  productId           String
  product             Product           @relation(fields: [productId], references: [id])
  bboxX               Float
  bboxY               Float
  bboxWidth           Float
  bboxHeight          Float
}
```

- [ ] **Step 2: Write `lib/prisma.ts`**

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 3: Write `.env.example`**

```
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="replace-with-a-random-32-byte-string"
NEXTAUTH_URL="http://localhost:3000"
GEMINI_API_KEY=""
GEMINI_IMAGE_MODEL="gemini-2.5-flash-image"
```

- [ ] **Step 4: Add the same two vars to `.env.local` (already holds `GEMINI_API_KEY`)**

Run:
```bash
grep -q DATABASE_URL .env.local || cat >> .env.local << 'EOF'
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="dev-only-secret-change-me-1234567890abcdef"
NEXTAUTH_URL="http://localhost:3000"
GEMINI_IMAGE_MODEL="gemini-2.5-flash-image"
EOF
```

- [ ] **Step 5: Run the initial migration**

Run: `npx prisma migrate dev --name init`
Expected: creates `prisma/dev.db` and prints "Your database is now in sync with your schema."

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma lib/prisma.ts .env.example
git commit -m "feat: add Prisma schema and client singleton"
```

Note: `prisma/dev.db` and `prisma/migrations/` are covered by `.gitignore`'s `*.db` rule — verify migrations aren't accidentally excluded:

Run: `git status --short prisma/`
Expected: only `schema.prisma` (and untracked `migrations/` if `*.db` pattern doesn't match it — it shouldn't). If `migrations/` is untracked, add it: `git add prisma/migrations && git commit -m "chore: track prisma migrations"`.

---

## Task 4: Seed script and catalog data

**Files:**
- Create: `prisma/seed-data.ts`
- Create: `prisma/seed.ts`
- Test: `prisma/seed-data.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// prisma/seed-data.test.ts
import { describe, it, expect } from "vitest";
import { seedProducts, seedBrands } from "./seed-data";

describe("seed catalog data", () => {
  it("has at least 30 products", () => {
    expect(seedProducts.length).toBeGreaterThanOrEqual(30);
  });

  it("covers all six required categories", () => {
    const categories = new Set(seedProducts.map((p) => p.category));
    expect(categories).toEqual(
      new Set([
        "Furniture",
        "Lighting",
        "Rugs & Flooring",
        "Paint & Wall Finishes",
        "Curtains & Textiles",
        "Decor & Art",
      ])
    );
  });

  it("every product references a brand that exists", () => {
    const brandNames = new Set(seedBrands.map((b) => b.name));
    for (const p of seedProducts) {
      expect(brandNames.has(p.brandName)).toBe(true);
    }
  });

  it("every product has a positive price", () => {
    for (const p of seedProducts) {
      expect(p.price).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run prisma/seed-data.test.ts`
Expected: FAIL with "Cannot find module './seed-data'"

- [ ] **Step 3: Write `prisma/seed-data.ts`**

```ts
export interface SeedBrand {
  name: string;
  logoUrl?: string;
}

export interface SeedProduct {
  name: string;
  brandName: string;
  category:
    | "Furniture"
    | "Lighting"
    | "Rugs & Flooring"
    | "Paint & Wall Finishes"
    | "Curtains & Textiles"
    | "Decor & Art";
  styleTags: string[];
  color: string;
  material: string;
  price: number;
  dimensions: string;
  imageUrl: string;
}

export const seedBrands: SeedBrand[] = [
  { name: "Nordika" },
  { name: "Oakwell" },
  { name: "Luma Lighting" },
  { name: "Terra Finishes" },
  { name: "Weave & Co" },
  { name: "Studio Verde" },
  { name: "Kessho" },
];

const img = (seed: string) =>
  `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/600`;

export const seedProducts: SeedProduct[] = [
  // Furniture
  { name: "Oslo 3-Seat Sofa", brandName: "Nordika", category: "Furniture", styleTags: ["Scandinavian", "Minimalist"], color: "Light Grey", material: "Boucle Fabric", price: 899, dimensions: "210x90x80cm", imageUrl: img("oslo-sofa") },
  { name: "Kyoto Low Sofa", brandName: "Kessho", category: "Furniture", styleTags: ["Japandi", "Minimalist"], color: "Charcoal", material: "Linen", price: 1049, dimensions: "200x85x70cm", imageUrl: img("kyoto-sofa") },
  { name: "Marlowe Chesterfield Sofa", brandName: "Oakwell", category: "Furniture", styleTags: ["Classic", "Luxury"], color: "Emerald", material: "Velvet", price: 1499, dimensions: "220x95x85cm", imageUrl: img("marlowe-sofa") },
  { name: "Foundry Coffee Table", brandName: "Oakwell", category: "Furniture", styleTags: ["Industrial"], color: "Black Steel", material: "Steel & Reclaimed Wood", price: 320, dimensions: "120x60x40cm", imageUrl: img("foundry-table") },
  { name: "Haku Coffee Table", brandName: "Kessho", category: "Furniture", styleTags: ["Japandi", "Minimalist"], color: "Natural Oak", material: "Solid Oak", price: 289, dimensions: "110x55x38cm", imageUrl: img("haku-table") },
  { name: "Bergen Dining Table", brandName: "Nordika", category: "Furniture", styleTags: ["Scandinavian"], color: "Whitewash Oak", material: "Oak Veneer", price: 749, dimensions: "180x90x75cm", imageUrl: img("bergen-table") },
  { name: "Casa Rustica Dining Table", brandName: "Studio Verde", category: "Furniture", styleTags: ["Rustic", "Mediterranean"], color: "Weathered Brown", material: "Reclaimed Pine", price: 680, dimensions: "200x95x76cm", imageUrl: img("rustica-table") },
  { name: "Aria Accent Chair", brandName: "Studio Verde", category: "Furniture", styleTags: ["Bohemian"], color: "Terracotta", material: "Cotton Weave", price: 349, dimensions: "75x80x85cm", imageUrl: img("aria-chair") },
  { name: "Nomad Rattan Chair", brandName: "Weave & Co", category: "Furniture", styleTags: ["Bohemian", "Rustic"], color: "Natural Rattan", material: "Rattan", price: 259, dimensions: "65x70x90cm", imageUrl: img("nomad-chair") },
  { name: "Milano TV Unit", brandName: "Oakwell", category: "Furniture", styleTags: ["Modern", "Luxury"], color: "Walnut", material: "Walnut Veneer", price: 620, dimensions: "180x40x45cm", imageUrl: img("milano-tv-unit") },
  { name: "Cube Bookshelf", brandName: "Nordika", category: "Furniture", styleTags: ["Minimalist", "Scandinavian"], color: "White", material: "MDF", price: 210, dimensions: "80x30x180cm", imageUrl: img("cube-bookshelf") },

  // Lighting
  { name: "Arc Floor Lamp", brandName: "Luma Lighting", category: "Lighting", styleTags: ["Modern", "Minimalist"], color: "Brushed Brass", material: "Metal & Marble Base", price: 189, dimensions: "150cm H", imageUrl: img("arc-lamp") },
  { name: "Kessho Paper Pendant", brandName: "Kessho", category: "Lighting", styleTags: ["Japandi"], color: "Natural White", material: "Washi Paper", price: 129, dimensions: "45cm dia", imageUrl: img("paper-pendant") },
  { name: "Foundry Cage Pendant", brandName: "Oakwell", category: "Lighting", styleTags: ["Industrial"], color: "Matte Black", material: "Iron & Glass", price: 149, dimensions: "30cm dia", imageUrl: img("cage-pendant") },
  { name: "Bergen Table Lamp", brandName: "Nordika", category: "Lighting", styleTags: ["Scandinavian", "Minimalist"], color: "Oak & Linen", material: "Wood & Fabric Shade", price: 89, dimensions: "45cm H", imageUrl: img("bergen-lamp") },
  { name: "Palazzo Crystal Chandelier", brandName: "Oakwell", category: "Lighting", styleTags: ["Luxury", "Classic"], color: "Antique Gold", material: "Crystal & Brass", price: 1290, dimensions: "70cm dia", imageUrl: img("palazzo-chandelier") },
  { name: "Sol Wall Sconce", brandName: "Studio Verde", category: "Lighting", styleTags: ["Mediterranean", "Rustic"], color: "Terracotta", material: "Ceramic", price: 69, dimensions: "20cm H", imageUrl: img("sol-sconce") },

  // Rugs & Flooring
  { name: "Nordic Wool Rug", brandName: "Weave & Co", category: "Rugs & Flooring", styleTags: ["Scandinavian", "Minimalist"], color: "Ivory", material: "Wool", price: 210, dimensions: "200x300cm", imageUrl: img("nordic-rug") },
  { name: "Kessho Tatami Mat", brandName: "Kessho", category: "Rugs & Flooring", styleTags: ["Japandi"], color: "Natural Green", material: "Woven Rush", price: 175, dimensions: "180x270cm", imageUrl: img("tatami-mat") },
  { name: "Casbah Wool Rug", brandName: "Weave & Co", category: "Rugs & Flooring", styleTags: ["Bohemian"], color: "Rust & Cream", material: "Wool", price: 245, dimensions: "200x290cm", imageUrl: img("casbah-rug") },
  { name: "Oak Herringbone Flooring", brandName: "Oakwell", category: "Rugs & Flooring", styleTags: ["Classic", "Modern"], color: "Natural Oak", material: "Engineered Hardwood", price: 62, dimensions: "per sqm", imageUrl: img("herringbone-floor") },
  { name: "Terrazzo Tile Flooring", brandName: "Terra Finishes", category: "Rugs & Flooring", styleTags: ["Modern", "Mediterranean"], color: "Grey Fleck", material: "Terrazzo", price: 48, dimensions: "per sqm", imageUrl: img("terrazzo-floor") },
  { name: "Polished Concrete Finish", brandName: "Terra Finishes", category: "Rugs & Flooring", styleTags: ["Industrial", "Minimalist"], color: "Ash Grey", material: "Concrete", price: 55, dimensions: "per sqm", imageUrl: img("concrete-floor") },
  { name: "Carrara Marble Tile", brandName: "Terra Finishes", category: "Rugs & Flooring", styleTags: ["Luxury", "Classic"], color: "White & Grey Veined", material: "Marble", price: 95, dimensions: "per sqm", imageUrl: img("carrara-tile") },

  // Paint & Wall Finishes
  { name: "Fog Grey Matte Paint", brandName: "Terra Finishes", category: "Paint & Wall Finishes", styleTags: ["Minimalist", "Modern"], color: "Fog Grey", material: "Matte Emulsion", price: 45, dimensions: "5L can", imageUrl: img("fog-grey-paint") },
  { name: "Warm White Paint", brandName: "Terra Finishes", category: "Paint & Wall Finishes", styleTags: ["Scandinavian", "Japandi"], color: "Warm White", material: "Matte Emulsion", price: 42, dimensions: "5L can", imageUrl: img("warm-white-paint") },
  { name: "Terracotta Limewash", brandName: "Terra Finishes", category: "Paint & Wall Finishes", styleTags: ["Mediterranean", "Rustic"], color: "Terracotta", material: "Limewash", price: 58, dimensions: "5L can", imageUrl: img("terracotta-limewash") },
  { name: "Charcoal Feature Paint", brandName: "Terra Finishes", category: "Paint & Wall Finishes", styleTags: ["Industrial", "Luxury"], color: "Charcoal", material: "Matte Emulsion", price: 45, dimensions: "5L can", imageUrl: img("charcoal-paint") },
  { name: "Oak Wood Panelling", brandName: "Oakwell", category: "Paint & Wall Finishes", styleTags: ["Japandi", "Scandinavian"], color: "Natural Oak", material: "Wood Slat Panel", price: 78, dimensions: "per sqm", imageUrl: img("oak-panelling") },
  { name: "Raw Stone Cladding", brandName: "Terra Finishes", category: "Paint & Wall Finishes", styleTags: ["Rustic", "Industrial"], color: "Grey Stone", material: "Stone Veneer", price: 89, dimensions: "per sqm", imageUrl: img("stone-cladding") },
  { name: "Botanical Wallpaper", brandName: "Weave & Co", category: "Paint & Wall Finishes", styleTags: ["Bohemian"], color: "Green & Cream", material: "Non-woven Wallpaper", price: 52, dimensions: "per roll", imageUrl: img("botanical-wallpaper") },

  // Curtains & Textiles
  { name: "Linen Sheer Curtains", brandName: "Weave & Co", category: "Curtains & Textiles", styleTags: ["Scandinavian", "Minimalist"], color: "Off-White", material: "Linen", price: 89, dimensions: "140x260cm (pair)", imageUrl: img("linen-sheers") },
  { name: "Shoji-Style Panel Curtains", brandName: "Kessho", category: "Curtains & Textiles", styleTags: ["Japandi"], color: "Natural White", material: "Washi-textured Fabric", price: 110, dimensions: "150x250cm", imageUrl: img("shoji-curtains") },
  { name: "Velvet Blackout Curtains", brandName: "Oakwell", category: "Curtains & Textiles", styleTags: ["Luxury", "Classic"], color: "Deep Emerald", material: "Velvet", price: 149, dimensions: "140x260cm (pair)", imageUrl: img("velvet-curtains") },
  { name: "Kilim Throw Blanket", brandName: "Weave & Co", category: "Curtains & Textiles", styleTags: ["Bohemian", "Rustic"], color: "Multicolor", material: "Wool Kilim", price: 65, dimensions: "130x180cm", imageUrl: img("kilim-throw") },
  { name: "Boucle Cushion Set", brandName: "Nordika", category: "Curtains & Textiles", styleTags: ["Scandinavian", "Minimalist"], color: "Cream", material: "Boucle", price: 39, dimensions: "45x45cm (set of 2)", imageUrl: img("boucle-cushions") },

  // Decor & Art
  { name: "Kessho Ink Wash Print", brandName: "Kessho", category: "Decor & Art", styleTags: ["Japandi", "Minimalist"], color: "Black & White", material: "Framed Print", price: 89, dimensions: "50x70cm", imageUrl: img("ink-wash-print") },
  { name: "Abstract Terracotta Canvas", brandName: "Studio Verde", category: "Decor & Art", styleTags: ["Bohemian", "Mediterranean"], color: "Terracotta & Cream", material: "Canvas Print", price: 119, dimensions: "60x90cm", imageUrl: img("abstract-canvas") },
  { name: "Brass Sculptural Vase", brandName: "Oakwell", category: "Decor & Art", styleTags: ["Luxury", "Modern"], color: "Antique Brass", material: "Cast Metal", price: 75, dimensions: "35cm H", imageUrl: img("brass-vase") },
  { name: "Raw Ceramic Vase Set", brandName: "Studio Verde", category: "Decor & Art", styleTags: ["Rustic", "Bohemian"], color: "Sand", material: "Stoneware", price: 55, dimensions: "set of 3", imageUrl: img("ceramic-vase-set") },
  { name: "Industrial Wall Clock", brandName: "Oakwell", category: "Decor & Art", styleTags: ["Industrial"], color: "Black & Brass", material: "Metal & Glass", price: 65, dimensions: "40cm dia", imageUrl: img("industrial-clock") },
  { name: "Fiddle Leaf Fig (Faux)", brandName: "Studio Verde", category: "Decor & Art", styleTags: ["Scandinavian", "Bohemian", "Modern"], color: "Green", material: "Faux Botanical", price: 99, dimensions: "150cm H", imageUrl: img("fiddle-leaf-fig") },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run prisma/seed-data.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Write `prisma/seed.ts`**

```ts
import { PrismaClient } from "@prisma/client";
import { seedBrands, seedProducts } from "./seed-data";

const prisma = new PrismaClient();

async function main() {
  const brandIdByName = new Map<string, string>();

  for (const brand of seedBrands) {
    const created = await prisma.brand.upsert({
      where: { name: brand.name },
      update: {},
      create: { name: brand.name, logoUrl: brand.logoUrl },
    });
    brandIdByName.set(brand.name, created.id);
  }

  for (const product of seedProducts) {
    const brandId = brandIdByName.get(product.brandName);
    if (!brandId) {
      throw new Error(`Unknown brand "${product.brandName}" for product "${product.name}"`);
    }
    const existing = await prisma.product.findFirst({ where: { name: product.name } });
    if (existing) continue;
    await prisma.product.create({
      data: {
        name: product.name,
        brandId,
        category: product.category,
        styleTags: product.styleTags.join(","),
        color: product.color,
        material: product.material,
        price: product.price,
        dimensions: product.dimensions,
        imageUrl: product.imageUrl,
      },
    });
  }

  console.log(`Seeded ${seedBrands.length} brands and ${seedProducts.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 6: Run the seed script against the real dev DB**

Run: `npm run db:seed`
Expected: `Seeded 7 brands and 42 products.`

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add seed catalog data and seed script"
```

---

## Task 5: Auth — password hashing, signup route, NextAuth config

**Files:**
- Create: `lib/password.ts`
- Test: `lib/password.test.ts`
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `app/api/auth/signup/route.ts`
- Test: `app/api/auth/signup/route.test.ts`

- [ ] **Step 1: Write the failing test for password hashing**

```ts
// lib/password.test.ts
import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("verifies a correct password", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(await verifyPassword("correct-horse-battery-staple", hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("never stores the password in plain text", async () => {
    const hash = await hashPassword("correct-horse-battery-staple");
    expect(hash).not.toContain("correct-horse-battery-staple");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/password.test.ts`
Expected: FAIL with "Cannot find module './password'"

- [ ] **Step 3: Write `lib/password.ts`**

```ts
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/password.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Write `lib/auth.ts`**

```ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        const valid = await verifyPassword(credentials.password, user.passwordHash);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as { id?: string }).id = token.id as string;
      return session;
    },
  },
};
```

- [ ] **Step 6: Write `app/api/auth/[...nextauth]/route.ts`**

```ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

- [ ] **Step 7: Write the failing test for the signup route**

```ts
// app/api/auth/signup/route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreate = vi.fn();
const mockFindUnique = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      create: (...args: unknown[]) => mockCreate(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

import { POST } from "./route";

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    mockCreate.mockReset();
    mockFindUnique.mockReset();
  });

  it("creates a user with a hashed password", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue({ id: "u1", email: "a@b.com", name: "Ana" });

    const res = await POST(jsonRequest({ email: "a@b.com", password: "hunter22", name: "Ana" }));

    expect(res.status).toBe(201);
    const createArgs = mockCreate.mock.calls[0][0];
    expect(createArgs.data.passwordHash).not.toBe("hunter22");
  });

  it("rejects a duplicate email with 409", async () => {
    mockFindUnique.mockResolvedValue({ id: "u1", email: "a@b.com" });

    const res = await POST(jsonRequest({ email: "a@b.com", password: "hunter22", name: "Ana" }));

    expect(res.status).toBe(409);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects a short password with 400", async () => {
    const res = await POST(jsonRequest({ email: "a@b.com", password: "123", name: "Ana" }));
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 8: Run test to verify it fails**

Run: `npx vitest run app/api/auth/signup/route.test.ts`
Expected: FAIL with "Cannot find module './route'"

- [ ] **Step 9: Write `app/api/auth/signup/route.ts`**

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password, name } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  });

  return NextResponse.json({ id: user.id, email: user.email, name: user.name }, { status: 201 });
}
```

- [ ] **Step 10: Run test to verify it passes**

Run: `npx vitest run app/api/auth/signup/route.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add password hashing, signup API, and NextAuth config"
```

---

## Task 6: Auth UI pages

**Files:**
- Create: `components/providers/session-provider.tsx`
- Modify: `app/layout.tsx`
- Create: `app/sign-up/page.tsx`
- Create: `app/sign-in/page.tsx`

- [ ] **Step 1: Write `components/providers/session-provider.tsx`**

```tsx
"use client";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
```

- [ ] **Step 2: Modify `app/layout.tsx` to wrap children in the session provider**

```tsx
import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/session-provider";

export const metadata: Metadata = {
  title: "Interior AI",
  description: "AI-powered interior design & shopping platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Write `app/sign-up/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.formErrors?.[0] ?? data.error ?? "Sign up failed");
      setLoading(false);
      return;
    }

    const signInResult = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (signInResult?.ok) {
      router.push("/design/new");
    } else {
      router.push("/sign-in");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold">Create an account</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </Button>
      </form>
    </main>
  );
}
```

- [ ] **Step 4: Write `app/sign-in/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.ok) {
      router.push("/design/new");
    } else {
      setError("Invalid email or password");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </main>
  );
}
```

- [ ] **Step 5: Verify it compiles and the pages render**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run dev -- -p 3100 &` then `sleep 3 && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/sign-up && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/sign-in`
Expected: `200` twice. Then: `lsof -ti:3100 -sTCP:LISTEN | xargs -r kill`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add sign-up and sign-in pages"
```

---

## Task 7: Room photo upload

**Files:**
- Create: `app/api/uploads/route.ts`
- Test: `app/api/uploads/route.test.ts`
- Create: `components/design/room-upload.tsx`

- [ ] **Step 1: Write the failing test**

```ts
// app/api/uploads/route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "./route";

function fileRequest(file: File | null) {
  const form = new FormData();
  if (file) form.set("file", file);
  return new Request("http://localhost/api/uploads", { method: "POST", body: form });
}

describe("POST /api/uploads", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a request with no file", async () => {
    const res = await POST(fileRequest(null));
    expect(res.status).toBe(400);
  });

  it("rejects a non-image file", async () => {
    const file = new File(["hello"], "notes.txt", { type: "text/plain" });
    const res = await POST(fileRequest(file));
    expect(res.status).toBe(400);
  });

  it("rejects a file over 10MB", async () => {
    const big = new Uint8Array(10 * 1024 * 1024 + 1);
    const file = new File([big], "room.png", { type: "image/png" });
    const res = await POST(fileRequest(file));
    expect(res.status).toBe(400);
  });

  it("accepts a valid image and returns its path", async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "room.png", { type: "image/png" });
    const res = await POST(fileRequest(file));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.url).toMatch(/^\/uploads\/rooms\/.+\.png$/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/api/uploads/route.test.ts`
Expected: FAIL with "Cannot find module './route'"

- [ ] **Step 3: Write `app/api/uploads/route.ts`**

```ts
import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds 10MB limit" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "rooms");
  await mkdir(uploadDir, { recursive: true });

  const ext = EXT_BY_TYPE[file.type];
  const filename = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/rooms/${filename}` }, { status: 201 });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/api/uploads/route.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Write `components/design/room-upload.tsx`**

```tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function RoomUpload({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const form = new FormData();
    form.set("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body: form });
    setUploading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Upload failed");
      return;
    }

    const data = await res.json();
    onUploaded(data.url);
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground">
        {preview ? (
          <Image src={preview} alt="Room preview" width={300} height={200} className="h-full w-full rounded-lg object-cover" />
        ) : (
          <span>Click to upload a photo of your room (JPG, PNG, WEBP — max 10MB)</span>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>
      {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add room photo upload API and component"
```

---

## Task 8: Design request form types and component

**Files:**
- Create: `types/design.ts`
- Create: `components/design/design-request-form.tsx`

- [ ] **Step 1: Write `types/design.ts`**

```ts
export const ROOM_TYPES = [
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Children's Room",
  "Office",
  "Hallway",
  "Balcony",
  "Other",
] as const;

export const DESIGN_STYLES = [
  "Modern",
  "Minimalist",
  "Scandinavian",
  "Japandi",
  "Luxury",
  "Classic",
  "Industrial",
  "Mediterranean",
  "Bohemian",
  "Rustic",
] as const;

export const MATERIALS = [
  "Painted Walls",
  "Wallpaper",
  "Wood Panels",
  "Stone Cladding",
  "Concrete Finish",
  "Marble",
  "Ceramic",
] as const;

export const FLOORING_OPTIONS = [
  "Hardwood Flooring",
  "Tile",
  "Marble",
  "Concrete",
  "Carpet",
] as const;

export const SERVICE_OPTIONS = [
  { value: "inspiration_only", label: "Design Inspiration Only", implemented: true },
  { value: "ready_to_implement", label: "Ready-to-Implement Design", implemented: true },
  { value: "purchase_only", label: "Purchase Products Only", implemented: false },
  { value: "turnkey", label: "Turnkey Service", implemented: false },
] as const;

export type RoomType = (typeof ROOM_TYPES)[number];
export type DesignStyle = (typeof DESIGN_STYLES)[number];
export type Material = (typeof MATERIALS)[number];
export type Flooring = (typeof FLOORING_OPTIONS)[number];
export type ServiceOptionValue = (typeof SERVICE_OPTIONS)[number]["value"];

export interface DesignRequestInput {
  roomPhotoUrl: string;
  roomType: RoomType;
  style: DesignStyle;
  colorPrefs: string;
  materialPrefs: Material[];
  flooringPref: Flooring;
  budget: number;
  serviceOption: ServiceOptionValue;
}
```

- [ ] **Step 2: Write `components/design/design-request-form.tsx`**

```tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ROOM_TYPES,
  DESIGN_STYLES,
  MATERIALS,
  FLOORING_OPTIONS,
  SERVICE_OPTIONS,
  type DesignRequestInput,
  type Material,
} from "@/types/design";

export function DesignRequestForm({
  roomPhotoUrl,
  onSubmit,
  submitting,
}: {
  roomPhotoUrl: string;
  onSubmit: (input: DesignRequestInput) => void;
  submitting: boolean;
}) {
  const [roomType, setRoomType] = useState<DesignRequestInput["roomType"]>(ROOM_TYPES[0]);
  const [style, setStyle] = useState<DesignRequestInput["style"]>(DESIGN_STYLES[0]);
  const [colorPrefs, setColorPrefs] = useState("");
  const [materialPrefs, setMaterialPrefs] = useState<Material[]>([]);
  const [flooringPref, setFlooringPref] = useState<DesignRequestInput["flooringPref"]>(FLOORING_OPTIONS[0]);
  const [budget, setBudget] = useState(1000);
  const [serviceOption, setServiceOption] = useState<DesignRequestInput["serviceOption"]>(SERVICE_OPTIONS[0].value);

  function toggleMaterial(material: Material) {
    setMaterialPrefs((prev) =>
      prev.includes(material) ? prev.filter((m) => m !== material) : [...prev, material]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      roomPhotoUrl,
      roomType,
      style,
      colorPrefs,
      materialPrefs,
      flooringPref,
      budget,
      serviceOption,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <Label htmlFor="roomType">Room type</Label>
        <select
          id="roomType"
          className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          value={roomType}
          onChange={(e) => setRoomType(e.target.value as DesignRequestInput["roomType"])}
        >
          {ROOM_TYPES.map((rt) => (
            <option key={rt} value={rt}>{rt}</option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="style">Interior design style</Label>
        <select
          id="style"
          className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          value={style}
          onChange={(e) => setStyle(e.target.value as DesignRequestInput["style"])}
        >
          {DESIGN_STYLES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="colorPrefs">Color preferences</Label>
        <Input
          id="colorPrefs"
          placeholder="e.g. warm neutrals, sage green accents"
          value={colorPrefs}
          onChange={(e) => setColorPrefs(e.target.value)}
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Material preferences</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {MATERIALS.map((m) => (
            <label key={m} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={materialPrefs.includes(m)}
                onChange={() => toggleMaterial(m)}
              />
              {m}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <Label htmlFor="flooringPref">Flooring preference</Label>
        <select
          id="flooringPref"
          className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          value={flooringPref}
          onChange={(e) => setFlooringPref(e.target.value as DesignRequestInput["flooringPref"])}
        >
          {FLOORING_OPTIONS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="budget">Maximum budget (USD)</Label>
        <Input
          id="budget"
          type="number"
          min={0}
          step={50}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium">Service option</legend>
        <div className="mt-2 flex flex-col gap-2">
          {SERVICE_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="serviceOption"
                checked={serviceOption === opt.value}
                onChange={() => setServiceOption(opt.value)}
              />
              {opt.label}
              {!opt.implemented && (
                <span className="text-xs text-muted-foreground">(design only — purchasing coming soon)</span>
              )}
            </label>
          ))}
        </div>
      </fieldset>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Generating your designs..." : "Generate designs"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add design request form"
```

---

## Task 9: Catalog shortlist filter

**Files:**
- Create: `lib/catalog-shortlist.ts`
- Test: `lib/catalog-shortlist.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/catalog-shortlist.test.ts
import { describe, it, expect } from "vitest";
import { buildCatalogShortlist, type CatalogProduct } from "./catalog-shortlist";

const products: CatalogProduct[] = [
  { id: "1", name: "Oslo Sofa", category: "Furniture", styleTags: ["Scandinavian", "Minimalist"], price: 899 },
  { id: "2", name: "Palazzo Chandelier", category: "Lighting", styleTags: ["Luxury", "Classic"], price: 1290 },
  { id: "3", name: "Nordic Rug", category: "Rugs & Flooring", styleTags: ["Scandinavian"], price: 210 },
  { id: "4", name: "Industrial Clock", category: "Decor & Art", styleTags: ["Industrial"], price: 65 },
];

describe("buildCatalogShortlist", () => {
  it("only includes products matching the requested style", () => {
    const shortlist = buildCatalogShortlist(products, { style: "Scandinavian", budget: 10000 });
    expect(shortlist.map((p) => p.id).sort()).toEqual(["1", "3"]);
  });

  it("excludes products that individually exceed the total budget", () => {
    const shortlist = buildCatalogShortlist(products, { style: "Luxury", budget: 500 });
    expect(shortlist.find((p) => p.id === "2")).toBeUndefined();
  });

  it("returns an empty list when nothing matches the style", () => {
    const shortlist = buildCatalogShortlist(products, { style: "Bohemian", budget: 10000 });
    expect(shortlist).toEqual([]);
  });

  it("spans multiple categories when available", () => {
    const shortlist = buildCatalogShortlist(products, { style: "Scandinavian", budget: 10000 });
    const categories = new Set(shortlist.map((p) => p.category));
    expect(categories.size).toBeGreaterThan(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/catalog-shortlist.test.ts`
Expected: FAIL with "Cannot find module './catalog-shortlist'"

- [ ] **Step 3: Write `lib/catalog-shortlist.ts`**

```ts
export interface CatalogProduct {
  id: string;
  name: string;
  category: string;
  styleTags: string[];
  price: number;
}

export interface ShortlistCriteria {
  style: string;
  budget: number;
}

/**
 * Filters the catalog down to products that match the requested style and
 * are individually affordable within the total budget. This shortlist is
 * what gets embedded in the Gemini prompt — the model is only ever told
 * about products in this list, never the full catalog.
 */
export function buildCatalogShortlist(
  products: CatalogProduct[],
  criteria: ShortlistCriteria
): CatalogProduct[] {
  return products.filter(
    (p) => p.styleTags.includes(criteria.style) && p.price <= criteria.budget
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/catalog-shortlist.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add catalog shortlist filter"
```

---

## Task 10: Prompt builder

**Files:**
- Create: `lib/prompt-builder.ts`
- Test: `lib/prompt-builder.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/prompt-builder.test.ts
import { describe, it, expect } from "vitest";
import { buildDesignPrompt } from "./prompt-builder";
import type { CatalogProduct } from "./catalog-shortlist";

const shortlist: CatalogProduct[] = [
  { id: "1", name: "Oslo Sofa", category: "Furniture", styleTags: ["Scandinavian"], price: 899 },
  { id: "3", name: "Nordic Rug", category: "Rugs & Flooring", styleTags: ["Scandinavian"], price: 210 },
];

describe("buildDesignPrompt", () => {
  it("includes the room type and style", () => {
    const prompt = buildDesignPrompt({
      roomType: "Living Room",
      style: "Scandinavian",
      colorPrefs: "warm neutrals",
      materialPrefs: ["Wood Panels"],
      flooringPref: "Hardwood Flooring",
      budget: 2000,
      shortlist,
    });
    expect(prompt).toContain("Living Room");
    expect(prompt).toContain("Scandinavian");
  });

  it("lists every shortlisted product by name", () => {
    const prompt = buildDesignPrompt({
      roomType: "Living Room",
      style: "Scandinavian",
      colorPrefs: "warm neutrals",
      materialPrefs: ["Wood Panels"],
      flooringPref: "Hardwood Flooring",
      budget: 2000,
      shortlist,
    });
    expect(prompt).toContain("Oslo Sofa");
    expect(prompt).toContain("Nordic Rug");
  });

  it("instructs the model to use only the listed products", () => {
    const prompt = buildDesignPrompt({
      roomType: "Living Room",
      style: "Scandinavian",
      colorPrefs: "warm neutrals",
      materialPrefs: ["Wood Panels"],
      flooringPref: "Hardwood Flooring",
      budget: 2000,
      shortlist,
    });
    expect(prompt.toLowerCase()).toContain("only");
  });

  it("throws if the shortlist is empty", () => {
    expect(() =>
      buildDesignPrompt({
        roomType: "Living Room",
        style: "Scandinavian",
        colorPrefs: "",
        materialPrefs: [],
        flooringPref: "Hardwood Flooring",
        budget: 2000,
        shortlist: [],
      })
    ).toThrow(/empty shortlist/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/prompt-builder.test.ts`
Expected: FAIL with "Cannot find module './prompt-builder'"

- [ ] **Step 3: Write `lib/prompt-builder.ts`**

```ts
import type { CatalogProduct } from "./catalog-shortlist";

export interface DesignPromptInput {
  roomType: string;
  style: string;
  colorPrefs: string;
  materialPrefs: string[];
  flooringPref: string;
  budget: number;
  shortlist: CatalogProduct[];
}

export function buildDesignPrompt(input: DesignPromptInput): string {
  if (input.shortlist.length === 0) {
    throw new Error("Cannot build a design prompt from an empty shortlist");
  }

  const productLines = input.shortlist
    .map((p) => `- ${p.name} (${p.category}, $${p.price})`)
    .join("\n");

  return [
    `Redesign this ${input.roomType} in a ${input.style} style.`,
    `Preferred colors: ${input.colorPrefs || "no strong preference"}.`,
    `Preferred materials: ${input.materialPrefs.join(", ") || "no strong preference"}.`,
    `Preferred flooring: ${input.flooringPref}.`,
    `Total budget: $${input.budget}.`,
    "",
    "You may ONLY use the following products in the redesign — do not invent, substitute, or use any product not on this list:",
    productLines,
    "",
    "Produce a single photorealistic rendering of the room using the existing room geometry (walls, windows, doors) but replacing furnishings and finishes per the above.",
  ].join("\n");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/prompt-builder.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add design prompt builder"
```

---

## Task 11: Bounding-box response parser

**Files:**
- Create: `lib/bbox-parser.ts`
- Test: `lib/bbox-parser.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/bbox-parser.test.ts
import { describe, it, expect } from "vitest";
import { parseBboxResponse } from "./bbox-parser";

describe("parseBboxResponse", () => {
  it("parses a well-formed JSON array response", () => {
    const raw = JSON.stringify([
      { productId: "1", x: 0.1, y: 0.2, width: 0.3, height: 0.25 },
    ]);
    const result = parseBboxResponse(raw);
    expect(result).toEqual([{ productId: "1", x: 0.1, y: 0.2, width: 0.3, height: 0.25 }]);
  });

  it("strips surrounding markdown code fences", () => {
    const raw = "```json\n" + JSON.stringify([{ productId: "1", x: 0, y: 0, width: 0.5, height: 0.5 }]) + "\n```";
    const result = parseBboxResponse(raw);
    expect(result).toHaveLength(1);
  });

  it("drops entries missing required fields instead of throwing", () => {
    const raw = JSON.stringify([
      { productId: "1", x: 0.1, y: 0.2, width: 0.3, height: 0.25 },
      { productId: "2", x: 0.1 },
    ]);
    const result = parseBboxResponse(raw);
    expect(result).toEqual([{ productId: "1", x: 0.1, y: 0.2, width: 0.3, height: 0.25 }]);
  });

  it("drops entries with out-of-range coordinates", () => {
    const raw = JSON.stringify([
      { productId: "1", x: 1.5, y: 0.2, width: 0.3, height: 0.25 },
    ]);
    const result = parseBboxResponse(raw);
    expect(result).toEqual([]);
  });

  it("returns an empty array for completely malformed input", () => {
    expect(parseBboxResponse("not json at all")).toEqual([]);
  });

  it("returns an empty array for valid JSON that is not an array", () => {
    expect(parseBboxResponse('{"foo": "bar"}')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/bbox-parser.test.ts`
Expected: FAIL with "Cannot find module './bbox-parser'"

- [ ] **Step 3: Write `lib/bbox-parser.ts`**

```ts
export interface ParsedBbox {
  productId: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

function inUnitRange(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 1;
}

/**
 * Parses Gemini's response to the "identify products in this image" call.
 * The model is asked for a JSON array but may wrap it in markdown fences or
 * occasionally omit fields — this never throws; malformed entries are
 * dropped so one bad entry doesn't break the whole alternative.
 */
export function parseBboxResponse(raw: string): ParsedBbox[] {
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  const results: ParsedBbox[] = [];
  for (const entry of parsed) {
    if (
      entry &&
      typeof entry === "object" &&
      typeof (entry as Record<string, unknown>).productId === "string" &&
      inUnitRange((entry as Record<string, unknown>).x) &&
      inUnitRange((entry as Record<string, unknown>).y) &&
      inUnitRange((entry as Record<string, unknown>).width) &&
      inUnitRange((entry as Record<string, unknown>).height)
    ) {
      const e = entry as Record<string, unknown>;
      results.push({
        productId: e.productId as string,
        x: e.x as number,
        y: e.y as number,
        width: e.width as number,
        height: e.height as number,
      });
    }
  }
  return results;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/bbox-parser.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add bounding-box response parser"
```

---

## Task 12: Gemini client wrapper

**Files:**
- Create: `lib/gemini.ts`

> **Note for the implementing engineer:** Gemini's image-generation API surface has moved fast. Verify the exact model name and `generateContent` response shape against the current docs at https://ai.google.dev/gemini-api/docs/image-generation before running this against a real key — the call shape below is correct as of this plan's writing but adjust `GEMINI_IMAGE_MODEL` or the response-parsing logic if the SDK has changed. Everything else in this codebase (the API route, the parsers, the UI) only depends on the two exported function signatures below, so a change here is isolated.

- [ ] **Step 1: Write `lib/gemini.ts`**

```ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";

export interface GeneratedImage {
  base64: string;
  mimeType: string;
}

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenerativeAI(apiKey);
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

/**
 * Generates one photorealistic room redesign image from a source room photo
 * and a text prompt describing the desired style and allowed products.
 */
export async function generateRoomDesign(
  roomPhotoPath: string,
  prompt: string
): Promise<GeneratedImage> {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image",
  });

  const imageBytes = await fs.readFile(roomPhotoPath);
  const mimeType = roomPhotoPath.endsWith(".png")
    ? "image/png"
    : roomPhotoPath.endsWith(".webp")
    ? "image/webp"
    : "image/jpeg";

  const result = await model.generateContent([
    { inlineData: { data: imageBytes.toString("base64"), mimeType } },
    { text: prompt },
  ]);

  const parts = result.response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p) => "inlineData" in p && p.inlineData);

  if (!imagePart || !("inlineData" in imagePart) || !imagePart.inlineData) {
    throw new Error("Gemini response did not contain an image");
  }

  return {
    base64: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType,
  };
}

/**
 * Given a generated design image and the shortlist of products it was
 * allowed to use, asks Gemini to identify which products appear where.
 * Returns the raw text response — parsing/validation happens in
 * lib/bbox-parser.ts so this function stays a thin I/O wrapper.
 */
export async function identifyProductsInImage(
  imageBase64: string,
  mimeType: string,
  shortlist: { id: string; name: string }[]
): Promise<string> {
  const client = getClient();
  const model = client.getGenerativeModel({
    model: process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image",
  });

  const productList = shortlist.map((p) => `- id: ${p.id}, name: ${p.name}`).join("\n");
  const prompt = [
    "Identify which of the following products appear in this room image, and where.",
    productList,
    "",
    'Respond with ONLY a JSON array, no prose, in this exact shape:',
    '[{"productId": "<id>", "x": <0-1>, "y": <0-1>, "width": <0-1>, "height": <0-1>}]',
    "x/y are the top-left corner of the item's bounding box, normalized to the image dimensions.",
    "Omit any product you cannot confidently locate.",
  ].join("\n");

  const result = await model.generateContent([
    { inlineData: { data: imageBase64, mimeType } },
    { text: prompt },
  ]);

  return result.response.text();
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add Gemini client wrapper for image generation and product identification"
```

---

## Task 13: Generate API route (orchestration)

**Files:**
- Create: `app/api/designs/route.ts`
- Test: `app/api/designs/route.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// app/api/designs/route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetServerSession = vi.fn();
vi.mock("next-auth", () => ({ getServerSession: (...a: unknown[]) => mockGetServerSession(...a) }));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

const mockFindMany = vi.fn();
const mockDesignCreate = vi.fn();
const mockAlternativeCreate = vi.fn();
const mockAlternativeUpdate = vi.fn();
const mockDesignItemCreateMany = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: { findMany: (...a: unknown[]) => mockFindMany(...a) },
    design: { create: (...a: unknown[]) => mockDesignCreate(...a) },
    designAlternative: {
      create: (...a: unknown[]) => mockAlternativeCreate(...a),
      update: (...a: unknown[]) => mockAlternativeUpdate(...a),
    },
    designItem: { createMany: (...a: unknown[]) => mockDesignItemCreateMany(...a) },
  },
}));

const mockIsConfigured = vi.fn();
const mockGenerate = vi.fn();
const mockIdentify = vi.fn();
vi.mock("@/lib/gemini", () => ({
  isGeminiConfigured: () => mockIsConfigured(),
  generateRoomDesign: (...a: unknown[]) => mockGenerate(...a),
  identifyProductsInImage: (...a: unknown[]) => mockIdentify(...a),
}));

vi.mock("fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

import { POST } from "./route";

function req(body: unknown) {
  return new Request("http://localhost/api/designs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  roomPhotoUrl: "/uploads/rooms/abc.png",
  roomType: "Living Room",
  style: "Scandinavian",
  colorPrefs: "warm neutrals",
  materialPrefs: ["Wood Panels"],
  flooringPref: "Hardwood Flooring",
  budget: 2000,
  serviceOption: "ready_to_implement",
};

describe("POST /api/designs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
    mockFindMany.mockResolvedValue([
      { id: "1", name: "Oslo Sofa", category: "Furniture", styleTags: "Scandinavian", price: 899 },
      { id: "3", name: "Nordic Rug", category: "Rugs & Flooring", styleTags: "Scandinavian", price: 210 },
    ]);
    mockDesignCreate.mockResolvedValue({ id: "d1" });
    mockAlternativeCreate.mockImplementation(({ data }: { data: Record<string, unknown> }) =>
      Promise.resolve({ id: `alt-${data.index}`, ...data })
    );
    mockIsConfigured.mockReturnValue(true);
    mockGenerate.mockResolvedValue({ base64: "ZmFrZQ==", mimeType: "image/png" });
    mockIdentify.mockResolvedValue(
      JSON.stringify([{ productId: "1", x: 0.1, y: 0.1, width: 0.3, height: 0.3 }])
    );
  });

  it("returns 401 when not signed in", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await POST(req(validBody));
    expect(res.status).toBe(401);
  });

  it("returns 400 for an invalid body", async () => {
    const res = await POST(req({ ...validBody, roomType: "Not A Room" }));
    expect(res.status).toBe(400);
  });

  it("returns 503 with a clear message when Gemini is not configured", async () => {
    mockIsConfigured.mockReturnValue(false);
    const res = await POST(req(validBody));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toMatch(/unavailable/i);
  });

  it("generates 4 alternatives and returns the design id on success", async () => {
    const res = await POST(req(validBody));
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.designId).toBe("d1");
    expect(mockGenerate).toHaveBeenCalledTimes(4);
  });

  it("continues generating remaining alternatives when one fails", async () => {
    mockGenerate
      .mockResolvedValueOnce({ base64: "ZmFrZQ==", mimeType: "image/png" })
      .mockRejectedValueOnce(new Error("safety block"))
      .mockResolvedValueOnce({ base64: "ZmFrZQ==", mimeType: "image/png" })
      .mockResolvedValueOnce({ base64: "ZmFrZQ==", mimeType: "image/png" });

    const res = await POST(req(validBody));
    expect(res.status).toBe(201);
    expect(mockGenerate).toHaveBeenCalledTimes(4);
    const failedUpdate = mockAlternativeUpdate.mock.calls.find(
      (c) => c[0].data.status === "failed"
    );
    expect(failedUpdate).toBeTruthy();
  });

  it("skips the bounding-box call for Design Inspiration Only", async () => {
    await POST(req({ ...validBody, serviceOption: "inspiration_only" }));
    expect(mockIdentify).not.toHaveBeenCalled();
  });

  it("returns 422 when the shortlist is empty for the requested style", async () => {
    mockFindMany.mockResolvedValue([]);
    const res = await POST(req(validBody));
    expect(res.status).toBe(422);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/api/designs/route.test.ts`
Expected: FAIL with "Cannot find module './route'"

- [ ] **Step 3: Write `app/api/designs/route.ts`**

```ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildCatalogShortlist, type CatalogProduct } from "@/lib/catalog-shortlist";
import { buildDesignPrompt } from "@/lib/prompt-builder";
import { parseBboxResponse } from "@/lib/bbox-parser";
import {
  isGeminiConfigured,
  generateRoomDesign,
  identifyProductsInImage,
} from "@/lib/gemini";

const NUM_ALTERNATIVES = 4;

const designRequestSchema = z.object({
  roomPhotoUrl: z.string().min(1),
  roomType: z.enum([
    "Living Room", "Bedroom", "Kitchen", "Bathroom", "Children's Room",
    "Office", "Hallway", "Balcony", "Other",
  ]),
  style: z.enum([
    "Modern", "Minimalist", "Scandinavian", "Japandi", "Luxury", "Classic",
    "Industrial", "Mediterranean", "Bohemian", "Rustic",
  ]),
  colorPrefs: z.string(),
  materialPrefs: z.array(z.string()),
  flooringPref: z.string(),
  budget: z.number().positive(),
  serviceOption: z.enum(["inspiration_only", "ready_to_implement", "purchase_only", "turnkey"]),
});

async function saveGeneratedImage(base64: string, mimeType: string): Promise<string> {
  const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const dir = path.join(process.cwd(), "public", "uploads", "designs");
  await mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  await writeFile(path.join(dir, filename), Buffer.from(base64, "base64"));
  return `/uploads/designs/${filename}`;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = designRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  if (!isGeminiConfigured()) {
    return NextResponse.json(
      { error: "AI generation is currently unavailable — no Gemini API key is configured." },
      { status: 503 }
    );
  }

  const allProducts = await prisma.product.findMany();
  const catalogProducts: CatalogProduct[] = allProducts.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    styleTags: p.styleTags.split(","),
    price: p.price,
  }));

  const shortlist = buildCatalogShortlist(catalogProducts, {
    style: input.style,
    budget: input.budget,
  });

  if (shortlist.length === 0) {
    return NextResponse.json(
      { error: `No catalog products match style "${input.style}" within the given budget.` },
      { status: 422 }
    );
  }

  const design = await prisma.design.create({
    data: {
      userId,
      roomPhotoUrl: input.roomPhotoUrl,
      roomType: input.roomType,
      style: input.style,
      colorPrefs: input.colorPrefs,
      materialPrefs: input.materialPrefs.join(","),
      flooringPref: input.flooringPref,
      budget: input.budget,
      serviceOption: input.serviceOption,
    },
  });

  const prompt = buildDesignPrompt({
    roomType: input.roomType,
    style: input.style,
    colorPrefs: input.colorPrefs,
    materialPrefs: input.materialPrefs,
    flooringPref: input.flooringPref,
    budget: input.budget,
    shortlist,
  });

  const roomPhotoPath = path.join(process.cwd(), "public", input.roomPhotoUrl.replace(/^\//, ""));
  const wantsHotspots = input.serviceOption === "ready_to_implement";

  for (let index = 0; index < NUM_ALTERNATIVES; index++) {
    const alternative = await prisma.designAlternative.create({
      data: { designId: design.id, index, status: "pending" },
    });

    try {
      const generated = await generateRoomDesign(roomPhotoPath, prompt);
      const imageUrl = await saveGeneratedImage(generated.base64, generated.mimeType);

      let hasHotspots = false;
      if (wantsHotspots) {
        try {
          const raw = await identifyProductsInImage(
            generated.base64,
            generated.mimeType,
            shortlist.map((p) => ({ id: p.id, name: p.name }))
          );
          const boxes = parseBboxResponse(raw);
          if (boxes.length > 0) {
            await prisma.designItem.createMany({
              data: boxes.map((b) => ({
                designAlternativeId: alternative.id,
                productId: b.productId,
                bboxX: b.x,
                bboxY: b.y,
                bboxWidth: b.width,
                bboxHeight: b.height,
              })),
            });
            hasHotspots = true;
          }
        } catch {
          // Hotspot mapping failed — alternative still succeeds, just falls
          // back to a plain product list in the UI (hasHotspots stays false).
        }
      }

      await prisma.designAlternative.update({
        where: { id: alternative.id },
        data: { status: "ready", imageUrl, hasHotspots },
      });
    } catch (err) {
      await prisma.designAlternative.update({
        where: { id: alternative.id },
        data: { status: "failed", errorMessage: err instanceof Error ? err.message : "Generation failed" },
      });
    }
  }

  return NextResponse.json({ designId: design.id }, { status: 201 });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/api/designs/route.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add design generation API route with per-alternative error handling"
```

---

## Task 14: Results UI — grid, hotspots, product panel, error states

**Files:**
- Create: `app/api/designs/[id]/route.ts`
- Create: `components/design/ai-unavailable-banner.tsx`
- Create: `components/design/alternative-grid.tsx`
- Create: `components/design/hotspot-overlay.tsx`
- Create: `components/design/product-detail-panel.tsx`
- Create: `app/design/new/page.tsx`
- Create: `app/design/[id]/page.tsx`

- [ ] **Step 1: Write `app/api/designs/[id]/route.ts`**

```ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const design = await prisma.design.findUnique({
    where: { id: params.id },
    include: {
      alternatives: {
        orderBy: { index: "asc" },
        include: { items: { include: { product: { include: { brand: true } } } } },
      },
    },
  });

  if (!design || design.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(design);
}
```

- [ ] **Step 2: Write `components/design/ai-unavailable-banner.tsx`**

```tsx
export function AiUnavailableBanner() {
  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
      AI generation is currently unavailable (no Gemini API key configured). You can still
      browse the catalog and manage your account; design generation will work once a key is added.
    </div>
  );
}
```

- [ ] **Step 3: Write `components/design/hotspot-overlay.tsx`**

```tsx
"use client";

export interface Hotspot {
  productId: string;
  productName: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export function HotspotOverlay({
  hotspots,
  onSelect,
}: {
  hotspots: Hotspot[];
  onSelect: (productId: string) => void;
}) {
  return (
    <div className="absolute inset-0">
      {hotspots.map((h) => (
        <button
          key={h.productId}
          type="button"
          aria-label={h.productName}
          onClick={() => onSelect(h.productId)}
          className="absolute rounded border-2 border-primary/70 bg-primary/10 transition-colors hover:bg-primary/25"
          style={{
            left: `${h.x * 100}%`,
            top: `${h.y * 100}%`,
            width: `${h.width * 100}%`,
            height: `${h.height * 100}%`,
          }}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Write `components/design/product-detail-panel.tsx`**

```tsx
"use client";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
}: {
  product: ProductDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>{product.name}</DialogTitle>
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
        <Button className="mt-4 w-full" disabled title="Purchasing isn't available yet">
          Buy Now — Coming soon
        </Button>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 5: Write `components/design/alternative-grid.tsx`**

```tsx
"use client";
import { useState } from "react";
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
                <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                  Generating...
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
                    {i.product.name} — ${i.product.price}
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
      />
    </div>
  );
}
```

- [ ] **Step 6: Write `app/design/new/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RoomUpload } from "@/components/design/room-upload";
import { DesignRequestForm } from "@/components/design/design-request-form";
import type { DesignRequestInput } from "@/types/design";

export default function NewDesignPage() {
  const router = useRouter();
  const [roomPhotoUrl, setRoomPhotoUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(input: DesignRequestInput) {
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/designs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(typeof data.error === "string" ? data.error : "Could not generate designs");
      return;
    }

    const data = await res.json();
    router.push(`/design/${data.designId}`);
  }

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Design your room</h1>
      {!roomPhotoUrl ? (
        <RoomUpload onUploaded={setRoomPhotoUrl} />
      ) : (
        <DesignRequestForm roomPhotoUrl={roomPhotoUrl} onSubmit={handleSubmit} submitting={submitting} />
      )}
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
    </main>
  );
}
```

- [ ] **Step 7: Write `app/design/[id]/page.tsx`**

```tsx
"use client";
import { useEffect, useState, useCallback } from "react";
import { AlternativeGrid, type Alternative } from "@/components/design/alternative-grid";

interface DesignResponse {
  id: string;
  alternatives: Array<{
    id: string;
    index: number;
    imageUrl: string | null;
    status: "pending" | "ready" | "failed";
    hasHotspots: boolean;
    errorMessage: string | null;
    items: Array<{
      productId: string;
      bboxX: number;
      bboxY: number;
      bboxWidth: number;
      bboxHeight: number;
      product: {
        id: string;
        name: string;
        color: string;
        dimensions: string;
        material: string;
        price: number;
        imageUrl: string;
        brand: { name: string };
      };
    }>;
  }>;
}

export default function DesignResultsPage({ params }: { params: { id: string } }) {
  const [design, setDesign] = useState<DesignResponse | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/designs/${params.id}`);
    if (res.ok) setDesign(await res.json());
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!design) {
    return <main className="p-8">Loading...</main>;
  }

  const alternatives: Alternative[] = design.alternatives.map((a) => ({
    id: a.id,
    index: a.index,
    imageUrl: a.imageUrl,
    status: a.status,
    hasHotspots: a.hasHotspots,
    errorMessage: a.errorMessage,
    items: a.items.map((i) => ({
      productId: i.productId,
      x: i.bboxX,
      y: i.bboxY,
      width: i.bboxWidth,
      height: i.bboxHeight,
      product: {
        id: i.product.id,
        name: i.product.name,
        brandName: i.product.brand.name,
        color: i.product.color,
        dimensions: i.product.dimensions,
        material: i.product.material,
        price: i.product.price,
        imageUrl: i.product.imageUrl,
      },
    })),
  }));

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Your designs</h1>
      <AlternativeGrid alternatives={alternatives} onRegenerate={() => load()} />
    </main>
  );
}
```

- [ ] **Step 8: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add design results page with hotspots, product panel, and error states"
```

---

## Task 15: "My designs" list page

**Files:**
- Modify: `app/api/designs/route.ts` (add `GET`)
- Test: `app/api/designs/route.test.ts` (add `GET` tests)
- Create: `app/design/page.tsx`

- [ ] **Step 1: Add the failing test for `GET /api/designs`**

Append to `app/api/designs/route.test.ts` (same file as Task 13, mocks already in place):

```ts
const mockDesignFindMany = vi.fn();
```

Add `design: { create: (...a: unknown[]) => mockDesignCreate(...a), findMany: (...a: unknown[]) => mockDesignFindMany(...a) },` to the `@/lib/prisma` mock's `prisma` object (replacing the existing `design: { create: ... }` line).

```ts
import { GET } from "./route";

describe("GET /api/designs", () => {
  beforeEach(() => {
    mockGetServerSession.mockResolvedValue({ user: { id: "u1" } });
  });

  it("returns 401 when not signed in", async () => {
    mockGetServerSession.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns only the signed-in user's designs, newest first", async () => {
    mockDesignFindMany.mockResolvedValue([
      { id: "d2", roomType: "Bedroom", style: "Japandi", createdAt: new Date("2026-01-02") },
      { id: "d1", roomType: "Living Room", style: "Scandinavian", createdAt: new Date("2026-01-01") },
    ]);
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
    expect(mockDesignFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "u1" },
        orderBy: { createdAt: "desc" },
      })
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/api/designs/route.test.ts`
Expected: FAIL with "GET is not exported from './route'" (or similar)

- [ ] **Step 3: Add `GET` to `app/api/designs/route.ts`**

Append to the end of the file (imports for `NextResponse`, `getServerSession`, `authOptions`, `prisma` already present from Task 13):

```ts
export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const designs = await prisma.design.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, roomType: true, style: true, createdAt: true },
  });

  return NextResponse.json(designs);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/api/designs/route.test.ts`
Expected: PASS (9 tests total in this file)

- [ ] **Step 5: Write `app/design/page.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DesignSummary {
  id: string;
  roomType: string;
  style: string;
  createdAt: string;
}

export default function MyDesignsPage() {
  const [designs, setDesigns] = useState<DesignSummary[] | null>(null);

  useEffect(() => {
    fetch("/api/designs")
      .then((res) => res.json())
      .then(setDesigns);
  }, []);

  return (
    <main className="mx-auto max-w-2xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My designs</h1>
        <Link href="/design/new">
          <Button>New design</Button>
        </Link>
      </div>

      {designs === null && <p className="text-sm text-muted-foreground">Loading...</p>}
      {designs?.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No designs yet — upload a room photo to get started.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {designs?.map((d) => (
          <Link key={d.id} href={`/design/${d.id}`}>
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <CardTitle>{d.roomType} — {d.style}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {new Date(d.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 6: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add my-designs list page and GET /api/designs"
```

---

## Task 16: Full test suite and manual smoke check

**Files:**
- None created — verification only.

- [ ] **Step 1: Run the full automated test suite**

Run: `npx vitest run`
Expected: all test files pass (password, seed-data, signup route, uploads route, catalog-shortlist, prompt-builder, bbox-parser, designs route).

- [ ] **Step 2: Type-check the whole project**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual smoke test**

Run: `npm run dev`

With the dev server running, in a browser:
1. Go to `http://localhost:3000`, click **Sign up**, create an account.
2. You're redirected to `/design/new` — upload a room photo.
3. Fill out the form (pick a style that has matching seeded products, e.g. "Scandinavian"), choose **Ready-to-Implement Design**, submit.
4. Confirm 4 alternatives appear (or a clear per-tile error if `GEMINI_API_KEY` is invalid — this is expected without a working key).
5. If any generated successfully: click one, confirm hotspot boxes appear over the image, click one, confirm the product detail panel opens with a disabled "Buy Now — Coming soon" button.
6. Go to `/design`, confirm the design you just created appears in the "My designs" list.

If `GEMINI_API_KEY` turns out to be invalid (see the format note from earlier in this project), every alternative will show the per-tile "Regenerate" error state — that confirms the error-handling path works correctly even without a working key. Getting a real key working is a follow-up, not a blocker for this plan.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: verify full test suite and manual smoke path" --allow-empty
```
