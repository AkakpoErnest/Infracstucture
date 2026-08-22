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
        {/* Walls - depth (z) stretched well past width/height so this
            reads as a real building volume from every rotation angle,
            not a flat cube. */}
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[1.6, 1.2, 2.6]} />
          <meshStandardMaterial color="#c17a52" wireframe roughness={0.4} />
        </mesh>
        {/* Roof - an outer group applies the depth stretch in world space
            (unrotated), while the inner mesh's own 45deg rotation just
            orients a flat face to point forward. Scaling the inner mesh
            directly would stretch it along its own rotated local axis
            (a diagonal), not the world Z the walls are stretched along -
            nesting them like this keeps the roof's footprint matching
            the walls exactly. */}
        <group position={[0, 0.75, 0]} scale={[1, 1, 1.6]}>
          <mesh rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[1.35, 0.9, 4]} />
            <meshStandardMaterial color="#8a5334" wireframe roughness={0.4} />
          </mesh>
        </group>
      </group>
    </Float>
  );
}
