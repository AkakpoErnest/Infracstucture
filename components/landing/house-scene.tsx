"use client";
import { Canvas } from "@react-three/fiber";
import { HouseBlob } from "./house-blob";

export function HouseScene({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 5], fov: 40 }}
      style={{ touchAction: "pan-y" }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 3, 4]} intensity={1} />
      {/* No Suspense needed - no texture to load, just wireframe geometry. */}
      <HouseBlob reducedMotion={reducedMotion} />
    </Canvas>
  );
}
