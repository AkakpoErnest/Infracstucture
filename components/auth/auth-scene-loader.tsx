"use client";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";

const AuthScene = dynamic(
  () => import("./auth-scene").then((m) => m.AuthScene),
  {
    ssr: false,
    // rounded-2xl rather than rounded-full: this loader is composed into a
    // short/wide half of a stacked column (AuthVisualPanel), where a
    // full-circle skeleton would render as an odd stadium/pill shape
    // instead of approximating the plain-rectangle canvas it becomes.
    loading: () => (
      <div className="h-full w-full animate-pulse rounded-2xl bg-primary/5" />
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
