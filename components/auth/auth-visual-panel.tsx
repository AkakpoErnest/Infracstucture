"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AuthSceneLoader } from "./auth-scene-loader";
import { HouseSceneLoader } from "@/components/landing/house-scene-loader";

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
      <div className="relative flex flex-col justify-center overflow-hidden p-8">
        {/* Same house motif as the homepage's Benefits section - rendered
            large, centered, and very low-opacity directly behind the form
            itself, on every screen size (the only 3D visible at all on
            mobile, where the right-hand panel below is hidden). Inputs
            have an opaque bg-background so text stays perfectly legible;
            this only shows through the surrounding whitespace. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30"
        >
          <div className="h-[28rem] w-[28rem]">
            <HouseSceneLoader />
          </div>
        </div>
        <div className="relative mx-auto flex w-full max-w-sm flex-col gap-4">
          <Link href="/" className="mb-2 flex items-center gap-2 self-start">
            <Image
              src="/images/logo-icon.png"
              alt="Afuna AI logo"
              width={28}
              height={28}
              className="rounded-md"
            />
            <span className="flex flex-col leading-tight">
              <span className="text-lg font-bold">Afuna AI</span>
              <span className="text-[11px] font-medium text-muted-foreground">
                Design for everybody
              </span>
            </span>
          </Link>
          {children}
        </div>
      </div>
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
