"use client";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";

const ProcessScene = dynamic(
  () => import("./process-scene").then((m) => m.ProcessScene),
  {
    ssr: false,
    loading: () => null,
  }
);

/**
 * Client-only wrapper, same pattern as HeroSceneLoader/AuthSceneLoader -
 * the WebGL canvas can't be server-rendered, and reduced-motion preference
 * is unknown during SSR. `loading: () => null` (not a pulse skeleton like
 * the other two loaders) since this is a purely decorative background
 * accent, not a primary visual - no need to draw attention to it loading.
 */
export function ProcessSceneLoader() {
  const reducedMotion = useReducedMotion();
  return <ProcessScene reducedMotion={Boolean(reducedMotion)} />;
}
