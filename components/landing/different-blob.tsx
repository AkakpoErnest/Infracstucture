"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import type { Group } from "three";

// A fourth distinct 3D motif, alongside the hero's smooth photo-mapped
// sphere, the auth pages' faceted glass icosahedron, and How It Works'
// wireframe torus knot: a slow-drifting cluster of small glowing points
// (no solid mesh at all) - reads as an abstract "possibilities/options"
// motif, fitting the Different section's old-way-vs-new-way contrast.
export function DifferentBlob({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (reducedMotion || !groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.08;
  });

  return (
    <Float
      speed={reducedMotion ? 0 : 1}
      rotationIntensity={reducedMotion ? 0 : 0.3}
      floatIntensity={reducedMotion ? 0 : 0.8}
    >
      <group ref={groupRef}>
        <Sparkles
          count={60}
          scale={[3, 3, 3]}
          size={4}
          speed={reducedMotion ? 0 : 0.3}
          color="#c17a52"
        />
      </group>
    </Float>
  );
}
