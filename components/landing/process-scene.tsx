"use client";
import { Canvas } from "@react-three/fiber";
import { ProcessBlob } from "./process-blob";

export function ProcessScene({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 4.5], fov: 42 }}
      style={{ touchAction: "pan-y" }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 3, 4]} intensity={1} />
      {/* No Suspense needed here (unlike HeroScene/AuthScene) - this shape
          has no texture to load, nothing to suspend on. */}
      <ProcessBlob reducedMotion={reducedMotion} />
    </Canvas>
  );
}
