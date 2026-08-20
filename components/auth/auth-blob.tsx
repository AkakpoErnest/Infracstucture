"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, useTexture } from "@react-three/drei";
import type { Mesh } from "three";

// Deliberately distinct from components/landing/hero-blob.tsx: a faceted
// icosahedron (angular) instead of a smooth sphere, a glass/transmission
// material instead of an opaque distorted-liquid one, a different source
// photo, and a different rotation rhythm/direction - this should read as
// its own thing at a glance, not a re-skin of the homepage's blob.
export function AuthBlob({ reducedMotion }: { reducedMotion: boolean }) {
  const meshRef = useRef<Mesh>(null);
  const texture = useTexture("/images/auth/hero-golden-hour.webp");

  useFrame((_, delta) => {
    if (reducedMotion || !meshRef.current) return;
    meshRef.current.rotation.x += delta * 0.25;
    meshRef.current.rotation.y -= delta * 0.18;
  });

  return (
    <Float
      speed={reducedMotion ? 0 : 2.2}
      rotationIntensity={reducedMotion ? 0 : 0.9}
      floatIntensity={reducedMotion ? 0 : 0.8}
    >
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.3, 0]} />
        <MeshTransmissionMaterial
          map={texture}
          thickness={0.5}
          roughness={0.1}
          transmission={0.9}
          ior={1.2}
          chromaticAberration={0.03}
          distortion={0.1}
        />
      </mesh>
    </Float>
  );
}
