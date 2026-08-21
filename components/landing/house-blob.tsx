"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Group } from "three";

// A fifth distinct 3D motif, alongside the hero's smooth photo-mapped
// sphere, the auth pages' faceted glass icosahedron, How It Works'
// wireframe torus knot, and the Different section's particle cluster: a
// simple low-poly house silhouette (box walls + a four-sided pyramid
// roof) - the most literal motif yet, fitting a section that's
// specifically about trusting what you see before you buy a room's
// worth of furniture.
export function HouseBlob({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (reducedMotion || !groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.15;
  });

  return (
    <Float
      speed={reducedMotion ? 0 : 1}
      rotationIntensity={reducedMotion ? 0 : 0.25}
      floatIntensity={reducedMotion ? 0 : 0.6}
    >
      <group ref={groupRef}>
        {/* Walls */}
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[1.6, 1.2, 1.6]} />
          <meshStandardMaterial color="#c17a52" wireframe roughness={0.4} />
        </mesh>
        {/* Roof - a 4-sided cone rotated 45deg so a flat face points forward */}
        <mesh position={[0, 0.75, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[1.35, 0.9, 4]} />
          <meshStandardMaterial color="#8a5334" wireframe roughness={0.4} />
        </mesh>
      </group>
    </Float>
  );
}
