"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

function Core() {
  const ref = useRef<Mesh>(null);
    useFrame((state) => {
    if (!ref.current) return;
    const s = window.scrollY / window.innerHeight;
    ref.current.rotation.y = state.clock.elapsedTime * 0.15 + s * 2;
    ref.current.rotation.x = state.clock.elapsedTime * 0.05 + s * 0.8;
    ref.current.scale.setScalar(1 + s * 0.4);
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[2.2, 2]} />
      <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.35} />
    </mesh>
  );
}

export default function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]}>
      <Core />
    </Canvas>
  );
}