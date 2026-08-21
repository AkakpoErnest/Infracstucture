"use client";
import { Canvas } from "@react-three/fiber";
import { DifferentBlob } from "./different-blob";

export function DifferentScene({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 4.5], fov: 42 }}
      style={{ touchAction: "pan-y" }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 3, 4]} intensity={1} />
      {/* No Suspense needed - Sparkles has no texture to load. */}
      <DifferentBlob reducedMotion={reducedMotion} />
    </Canvas>
  );
}
