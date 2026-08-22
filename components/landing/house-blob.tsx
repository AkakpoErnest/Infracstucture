"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Group, Mesh } from "three";

// A fifth distinct 3D motif, alongside the hero's smooth photo-mapped
// sphere, the auth pages' faceted glass icosahedron, How It Works'
// wireframe torus knot, and the Different section's particle cluster: a
// low-poly house (box walls + a four-sided pyramid roof) with a hinged
// front door and a tiny figure that walks up and lets themself in - the
// most literal (and most playful) motif yet, fitting a section that's
// specifically about trusting what you see before you buy a room's
// worth of furniture.
//
// Front face of the walls sits at world z = +1.3 (half of the 2.6-deep
// box). The door is a thin box in a hinge group offset to the door's
// left edge, so rotating that group swings it open like a real door
// instead of spinning around its own center.

const CYCLE_SECONDS = 8;
// Phase boundaries as a fraction of one cycle - walk up, door opens,
// step through and vanish inside, door closes, pause, loop.
const WALK_END = 0.4;
const DOOR_OPEN_END = 0.5;
const ENTER_END = 0.75;
const DOOR_CLOSE_END = 0.85;

const DOOR_OPEN_ANGLE = -1.9; // radians, swings outward toward the viewer

const WALK_START_Z = 2.6;
const DOOR_Z = 1.32;
const INSIDE_Z = 0.6;
const DOOR_X = 0.3;

function smoothstep(t: number) {
  const c = Math.min(Math.max(t, 0), 1);
  return c * c * (3 - 2 * c);
}

function Person({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<Group>(null);
  const bobRef = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    if (reducedMotion) {
      groupRef.current.position.set(DOOR_X, -0.9, WALK_START_Z);
      groupRef.current.visible = true;
      return;
    }

    const phase = (clock.elapsedTime % CYCLE_SECONDS) / CYCLE_SECONDS;

    if (phase < WALK_END) {
      // Walking up to the door.
      const walkT = smoothstep(phase / WALK_END);
      groupRef.current.position.x = walkT * DOOR_X;
      groupRef.current.position.z = WALK_START_Z + walkT * (DOOR_Z - WALK_START_Z);
      groupRef.current.visible = true;
      groupRef.current.scale.setScalar(1);
    } else if (phase < ENTER_END) {
      // Standing at the door while it opens, then stepping through and
      // shrinking away as if walking further inside the house.
      const enterT = smoothstep((phase - DOOR_OPEN_END) / (ENTER_END - DOOR_OPEN_END));
      groupRef.current.position.x = DOOR_X;
      groupRef.current.position.z = DOOR_Z + enterT * (INSIDE_Z - DOOR_Z);
      groupRef.current.scale.setScalar(1 - enterT * 0.7);
      groupRef.current.visible = enterT < 0.98;
    } else {
      groupRef.current.visible = false;
    }

    // A small vertical bob while walking, just so the figure doesn't
    // glide like it's on rails.
    if (bobRef.current && phase < WALK_END) {
      bobRef.current.position.y = Math.sin(clock.elapsedTime * 10) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.9, WALK_START_Z]}>
      <mesh ref={bobRef} position={[0, 0.15, 0]}>
        <capsuleGeometry args={[0.06, 0.22, 4, 8]} />
        <meshStandardMaterial color="#8a5334" wireframe roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <sphereGeometry args={[0.075, 12, 12]} />
        <meshStandardMaterial color="#8a5334" wireframe roughness={0.4} />
      </mesh>
    </group>
  );
}

export function HouseBlob({ reducedMotion }: { reducedMotion: boolean }) {
  const groupRef = useRef<Group>(null);
  const doorHingeRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current && !reducedMotion) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  useFrame(({ clock }) => {
    if (!doorHingeRef.current) return;
    if (reducedMotion) {
      doorHingeRef.current.rotation.y = 0;
      return;
    }

    const phase = (clock.elapsedTime % CYCLE_SECONDS) / CYCLE_SECONDS;
    let target = 0;
    if (phase >= WALK_END && phase < DOOR_OPEN_END) {
      target = DOOR_OPEN_ANGLE * smoothstep((phase - WALK_END) / (DOOR_OPEN_END - WALK_END));
    } else if (phase >= DOOR_OPEN_END && phase < ENTER_END) {
      target = DOOR_OPEN_ANGLE;
    } else if (phase >= ENTER_END && phase < DOOR_CLOSE_END) {
      target = DOOR_OPEN_ANGLE * (1 - smoothstep((phase - ENTER_END) / (DOOR_CLOSE_END - ENTER_END)));
    }
    doorHingeRef.current.rotation.y = target;
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
        {/* Front door - a hinge group at the door's left edge (x=0.1) so
            rotating it swings the door outward like a real hinge, rather
            than spinning around the door's own center. */}
        <group ref={doorHingeRef} position={[DOOR_X - 0.2, -0.55, 1.3]}>
          <mesh position={[0.2, 0, 0]}>
            <boxGeometry args={[0.4, 0.7, 0.05]} />
            <meshStandardMaterial color="#3d2b1f" wireframe roughness={0.5} />
          </mesh>
        </group>
        <Person reducedMotion={reducedMotion} />
      </group>
    </Float>
  );
}
