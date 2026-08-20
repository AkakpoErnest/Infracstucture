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
    <main className="grid min-h-screen md:grid-cols-2">
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
    </main>
  );
}
