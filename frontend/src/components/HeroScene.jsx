import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Particles({ count = 1200, mouse }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((state, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.04;
    ref.current.rotation.x = mouse.current[1] * 0.15;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color={"#D4AF37"}
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function Rings({ mouse }) {
  const g = useRef();
  useFrame((state, dt) => {
    if (!g.current) return;
    g.current.rotation.z += dt * 0.05;
    g.current.rotation.x = mouse.current[1] * 0.25;
    g.current.rotation.y = mouse.current[0] * 0.25;
  });
  return (
    <group ref={g}>
      {[2.2, 2.7, 3.3].map((r, i) => (
        <mesh key={i} rotation={[Math.PI / 2 + i * 0.2, i * 0.15, 0]}>
          <torusGeometry args={[r, 0.005, 16, 200]} />
          <meshBasicMaterial color={"#D4AF37"} transparent opacity={0.35 - i * 0.08} />
        </mesh>
      ))}
    </group>
  );
}

function NeuralOrb({ mouse, progressRef }) {
  const sphere = useRef();
  const inner = useRef();
  const group = useRef();
  useFrame((state, dt) => {
    const p = (progressRef && progressRef.current ? progressRef.current.v : 0) || 0;
    if (group.current) {
      group.current.position.y = p * 3.5;
      group.current.scale.setScalar(1 + p * 0.6);
    }
    if (sphere.current) {
      sphere.current.rotation.y += dt * 0.25;
      sphere.current.rotation.x = mouse.current[1] * 0.3;
    }
    if (inner.current) inner.current.rotation.y -= dt * 0.4;
  });
  return (
    <group ref={group}>
      {/* Outer wire */}
      <mesh ref={sphere}>
        <icosahedronGeometry args={[1.3, 2]} />
        <meshBasicMaterial color={"#D4AF37"} wireframe transparent opacity={0.55} />
      </mesh>
      {/* Inner core */}
      <mesh ref={inner}>
        <icosahedronGeometry args={[0.65, 1]} />
        <meshBasicMaterial color={"#FCF6BA"} wireframe transparent opacity={0.85} />
      </mesh>
      {/* Glow */}
      <mesh>
        <sphereGeometry args={[1.4, 24, 24]} />
        <meshBasicMaterial color={"#D4AF37"} transparent opacity={0.06} />
      </mesh>
    </group>
  );
}

function CameraDrift({ mouse, progressRef }) {
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const p = (progressRef && progressRef.current ? progressRef.current.v : 0) || 0;
    const tx = Math.sin(t * 0.15) * 0.25 + mouse.current[0] * 0.6;
    const ty = Math.cos(t * 0.12) * 0.15 + mouse.current[1] * 0.4 + p * 1.2;
    state.camera.position.x += (tx - state.camera.position.x) * 0.04;
    state.camera.position.y += (ty - state.camera.position.y) * 0.04;
    // Fly forward through particles as user scrolls
    const targetZ = 6 - p * 5.2;
    state.camera.position.z += (targetZ - state.camera.position.z) * 0.06;
    state.camera.lookAt(0, p * 0.8, 0);
  });
  return null;
}

export default function HeroScene({ progressRef }) {
  const mouse = useRef([0, 0]);

  React.useEffect(() => {
    const onMove = (e) => {
      mouse.current = [
        (e.clientX / window.innerWidth) * 2 - 1,
        -((e.clientY / window.innerHeight) * 2 - 1),
      ];
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 55 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#030303"]} />
      <fog attach="fog" args={["#030303", 5, 14]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 3, 3]} intensity={1.2} color={"#D4AF37"} />
      <pointLight position={[-3, -2, 2]} intensity={0.6} color={"#FCF6BA"} />

      <Particles mouse={mouse} count={1200} />
      <Rings mouse={mouse} />
      <NeuralOrb mouse={mouse} progressRef={progressRef} />
      <CameraDrift mouse={mouse} progressRef={progressRef} />
    </Canvas>
  );
}
