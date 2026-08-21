"use client";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";

const HouseScene = dynamic(() => import("./house-scene").then((m) => m.HouseScene), {
  ssr: false,
  loading: () => null,
});

/**
 * Client-only wrapper, same pattern as ProcessSceneLoader/DifferentSceneLoader
 * - purely decorative background accent, no need to draw attention to it
 * loading.
 */
export function HouseSceneLoader() {
  const reducedMotion = useReducedMotion();
  return <HouseScene reducedMotion={Boolean(reducedMotion)} />;
}
