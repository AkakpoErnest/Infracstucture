"use client";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";

const DifferentScene = dynamic(
  () => import("./different-scene").then((m) => m.DifferentScene),
  {
    ssr: false,
    loading: () => null,
  }
);

/**
 * Client-only wrapper, same pattern as ProcessSceneLoader - purely
 * decorative background accent, no need to draw attention to it loading.
 */
export function DifferentSceneLoader() {
  const reducedMotion = useReducedMotion();
  return <DifferentScene reducedMotion={Boolean(reducedMotion)} />;
}
