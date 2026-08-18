"use client";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";

const HeroScene = dynamic(
  () => import("./hero-scene").then((m) => m.HeroScene),
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
 * reduced-motion preference (unknown during SSR).
 */
export function HeroSceneLoader() {
  const reducedMotion = useReducedMotion();
  return <HeroScene reducedMotion={Boolean(reducedMotion)} />;
}
