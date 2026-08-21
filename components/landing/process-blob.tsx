"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Mesh } from "three";

// A third distinct 3D shape, alongside the homepage hero's smooth
// photo-mapped sphere and the auth pages' faceted glass icosahedron: a
// plain wireframe torus knot with a flat, untextured material (no photo
// mapped onto this one at all) - reads as an abstract "process/flow"
// motif, appropriate for decorating the How It Works section rather than
// competing with its text.
export function ProcessBlob({ reducedMotion }: { reducedMotion: boolean }) {
  const meshRef = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (reducedMotion || !meshRef.current) return;
    meshRef.current.rotation.x += delta * 0.12;
    meshRef.current.rotation.y += delta * 0.22;
  });

  return (
    <Float
      speed={reducedMotion ? 0 : 1.2}
      rotationIntensity={reducedMotion ? 0 : 0.4}
      floatIntensity={reducedMotion ? 0 : 0.6}
    >
      <mesh ref={meshRef}>
        <torusKnotGeometry args={[1, 0.32, 128, 16]} />
        <meshStandardMaterial color="#c17a52" wireframe roughness={0.4} />
      </mesh>
    </Float>
  );
}
