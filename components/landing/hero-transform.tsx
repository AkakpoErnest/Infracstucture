"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const STATES = [
  { src: "/images/hero/room-empty.webp", label: "Before" },
  { src: "/images/hero/room-furnished.webp", label: "After" },
] as const;

const INTERVAL_MS = 2800;

/**
 * Crosses-fades between an empty room and its AI-furnished version, so the
 * hero visual directly shows the product's value prop instead of an
 * abstract shape — real photography needs no color-matching decisions the
 * way a synthetic 3D material would.
 */
export function HeroTransform() {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % STATES.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [reducedMotion]);

  // With reduced motion, show the "after" state once, statically — it's
  // the more informative of the two for a static view.
  const active = reducedMotion ? STATES[1] : STATES[index];

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl shadow-lg">
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
            alt={
              active.label === "Before"
                ? "Empty living room before an AI redesign"
                : "The same living room after an AI-generated redesign"
            }
            fill
            sizes="(min-width: 640px) 480px, 100vw"
            className="object-cover"
            priority
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-3 left-3 z-10 rounded-md bg-background/85 px-2.5 py-1 text-xs font-medium backdrop-blur">
        {active.label}
      </div>
    </div>
  );
}
