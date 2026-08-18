"use client";
import { Canvas } from "@react-three/fiber";
import { HeroBlob } from "./hero-blob";

export function HeroScene({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 4.2], fov: 42 }}
      style={{ touchAction: "pan-y" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 3, 4]} intensity={1.2} />
      <directionalLight position={[-3, -2, -3]} intensity={0.4} color="#a78bfa" />
      <HeroBlob reducedMotion={reducedMotion} />
    </Canvas>
  );
}
