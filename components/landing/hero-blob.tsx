"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, useTexture } from "@react-three/drei";
import type { Mesh } from "three";

export function HeroBlob({ reducedMotion }: { reducedMotion: boolean }) {
  const meshRef = useRef<Mesh>(null);
  // A room photo mapped onto the distorted surface. Uses a sphere rather
  // than the previous icosahedron — icosahedron UVs pinch badly at the
  // poles and make a mapped photo look broken rather than liquid; a
  // sphere's UVs are smooth and continuous, which is what makes the photo
  // still read as a photo once it's warped across the surface.
  const texture = useTexture("/images/hero/scandinavian-living-room.webp");

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
        <sphereGeometry args={[1.3, 64, 64]} />
        <MeshDistortMaterial
          map={texture}
          distort={reducedMotion ? 0.15 : 0.4}
          speed={reducedMotion ? 0 : 1.8}
          roughness={0.15}
          metalness={0.1}
        />
      </mesh>
    </Float>
  );
}
