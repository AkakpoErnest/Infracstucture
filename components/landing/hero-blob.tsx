"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import type { Mesh } from "three";

export function HeroBlob({ reducedMotion }: { reducedMotion: boolean }) {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (reducedMotion || !meshRef.current) return;
    meshRef.current.rotation.x += delta * 0.15;
    meshRef.current.rotation.y += delta * 0.2;
  });

  return (
    <Float
      speed={reducedMotion ? 0 : 1.5}
      rotationIntensity={reducedMotion ? 0 : 0.6}
      floatIntensity={reducedMotion ? 0 : 1.2}
    >
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.4, 4]} />
        <MeshDistortMaterial
          color="#e07a5f"
          distort={reducedMotion ? 0.15 : 0.4}
          speed={reducedMotion ? 0 : 1.8}
          roughness={0.15}
          metalness={0.1}
        />
      </mesh>
    </Float>
  );
}
