"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore, type RefObject } from "react";
import * as THREE from "three";
import { useSitesOptional, type Site } from "@/components/SitesProvider";
import { MAX_SITES } from "@/lib/limits";

const CYAN = "#22d3ee";
const AMBER = "#fbbf24";
const RED = "#f87171";
const DIM = "#3b4a63";

type Health = "ok" | "slow" | "down";

function siteHealth(s: Site): Health {
  const last = s.history[s.history.length - 1];
  if (!last || !last.ok) return "down";
  return (last.ms ?? 0) > 1000 ? "slow" : "ok";
}
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const BOX_EDGES = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.22, 0.34, 0.22));
const AXIS_X = new THREE.Vector3(1, 0, 0);
const AXIS_Y = new THREE.Vector3(0, 1, 0);
const QA = new THREE.Quaternion();
const QB = new THREE.Quaternion();

type ServerItem = { pos: THREE.Vector3; phase: number; color: string };

type InputState = {
  x: number;
  y: number;
  scroll: number;
  dx: number;
  dy: number;
  dragging: boolean;
};

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function geoFrom(pos: number[]) {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  return g;
}

function buildNetwork(n: number, radius: number) {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    points.push(
      new THREE.Vector3(Math.cos(GOLDEN * i) * r, y, Math.sin(GOLDEN * i) * r).multiplyScalar(radius),
    );
  }
  const maxD = Math.sqrt((4 * Math.PI * radius * radius) / n) * 1.5;
  const lines: number[] = [];
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      if (points[i].distanceTo(points[j]) < maxD)
        lines.push(points[i].x, points[i].y, points[i].z, points[j].x, points[j].y, points[j].z);
  return {
    points,
    pointGeo: geoFrom(points.flatMap((p) => [p.x, p.y, p.z])),
    lineGeo: geoFrom(lines),
  };
}

function buildServers(n: number, sphere: THREE.Vector3[]) {
  const rand = rng(7);
  const items: ServerItem[] = Array.from({ length: n }, (_, i) => {
    const y = 1 - ((i + 0.5) / n) * 2;
    const r = Math.sqrt(1 - y * y);
    const radius = 3.4 + rand() * 1.3;
    return {
      pos: new THREE.Vector3(Math.cos(GOLDEN * i) * r, y * 0.8, Math.sin(GOLDEN * i) * r).multiplyScalar(radius),
      phase: rand() * Math.PI * 2,
      color: i === 3 ? AMBER : CYAN,
    };
  });
  const paths: number[] = [];
  items.forEach(({ pos }) => {
    let best = sphere[0];
    for (const p of sphere) if (p.distanceTo(pos) < best.distanceTo(pos)) best = p;
    paths.push(pos.x, pos.y, pos.z, best.x, best.y, best.z);
  });
  const links: [THREE.Vector3, THREE.Vector3][] = [];
  items.forEach((a, i) => {
    links.push([a.pos, items[(i + 1) % n].pos]);
    if (i % 4 === 0) links.push([a.pos, items[(i + 3) % n].pos]);
  });
  return {
    items,
    links,
    pathGeo: geoFrom(paths),
    linkGeo: geoFrom(links.flatMap(([a, b]) => [a.x, a.y, a.z, b.x, b.y, b.z])),
    pulseGeo: geoFrom(links.flatMap(([a]) => [a.x, a.y, a.z])),
  };
}

function buildDust(n: number) {
  const rand = rng(21);
  const pos: number[] = [];
  for (let i = 0; i < n; i++)
    pos.push((rand() - 0.5) * 26, (rand() - 0.5) * 15, (rand() - 0.5) * 16 - 2);
  return geoFrom(pos);
}

function useMedia(query: string) {
  const subscribe = useCallback(
    (cb: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    [query],
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}

function useInput(inputRef: RefObject<InputState>) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    const i = inputRef.current;
    let lx = 0;
    let ly = 0;
    const down = (e: PointerEvent) => {
      if (e.button !== 0) return;
      if (e.pointerType === "touch" && document.documentElement.dataset.rotate !== "on") return;
      if (e.target instanceof Element && e.target.closest("a, button, input, textarea, select, svg")) return;
      i.dragging = true;
      lx = e.clientX;
      ly = e.clientY;
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
    };
    const move = (e: PointerEvent) => {
      i.x = (e.clientX / window.innerWidth) * 2 - 1;
      i.y = (e.clientY / window.innerHeight) * 2 - 1;
      if (i.dragging) {
        i.dx += e.clientX - lx;
        i.dy += e.clientY - ly;
        lx = e.clientX;
        ly = e.clientY;
        invalidate();
      }
    };
    const up = () => {
      if (!i.dragging) return;
      i.dragging = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    const scroll = () => {
      i.scroll = Math.min(window.scrollY / 1200, 1);
    };
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    window.addEventListener("scroll", scroll, { passive: true });
    scroll();
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      window.removeEventListener("scroll", scroll);
      up();
    };
  }, [invalidate, inputRef]);
}

function Server({ item, color, big }: { item: ServerItem; color: string; big: boolean }) {
  const ref = useRef<THREE.LineSegments>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = item.pos.y + Math.sin(t * 0.6 + item.phase) * 0.1;
    ref.current.rotation.y = t * 0.25 + item.phase;
  });
  return (
    <lineSegments ref={ref} geometry={BOX_EDGES} position={item.pos} scale={big ? 1.45 : 1}>
      <lineBasicMaterial color={color} transparent opacity={0.9} />
    </lineSegments>
  );
}

function Scene({
  mobile,
  hero,
  reduced,
  health,
}: {
  mobile: boolean;
  hero: boolean;
  reduced: boolean;
  health: Health[];
}) {
  const input = useRef<InputState>({ x: 0, y: 0, scroll: 0, dx: 0, dy: 0, dragging: false });
  useInput(input);
  const rig = useRef<THREE.Group>(null);
  const core = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const dust = useRef<THREE.Group>(null);
  const pulses = useRef<THREE.Points>(null);
  const sm = useRef({ x: 0, y: 0, s: 0, vx: 0, vy: 0 });
  const orient = useRef(new THREE.Quaternion().setFromEuler(new THREE.Euler(0.3, 0, 0)));

  const net = useMemo(() => buildNetwork(mobile ? 42 : 72, 2.2), [mobile]);
  const sv = useMemo(() => buildServers(MAX_SITES, net.points), [net]);
  const dustGeo = useMemo(() => buildDust(mobile ? 100 : 260), [mobile]);

  useFrame((state, dt) => {
    const i = input.current;
    const s = sm.current;
    const t = state.clock.elapsedTime;
    const step = Math.max(dt, 0.001);
    s.x = THREE.MathUtils.damp(s.x, i.x, 2.5, dt);
    s.y = THREE.MathUtils.damp(s.y, i.y, 2.5, dt);
    s.s = THREE.MathUtils.damp(s.s, i.scroll, 3, dt);

    if (i.dragging) {
      s.vx = i.dx / step;
      s.vy = i.dy / step;
    } else if (reduced) {
      s.vx = 0;
      s.vy = 0;
    } else {
      s.vx = THREE.MathUtils.damp(s.vx, 0, 2.5, dt);
      s.vy = THREE.MathUtils.damp(s.vy, 0, 2.5, dt);
    }
    i.dx = 0;
    i.dy = 0;
    if (s.vx || s.vy) {
      const K = 0.008;
      QA.setFromAxisAngle(AXIS_Y, s.vx * step * K);
      QB.setFromAxisAngle(AXIS_X, s.vy * step * K);
      orient.current.premultiply(QA).premultiply(QB).normalize();
    }
    if (core.current) core.current.quaternion.copy(orient.current);
    if (spin.current) spin.current.rotation.y = (reduced ? 0 : t * 0.07) + s.s * Math.PI * 1.5;

    if (rig.current) {
      rig.current.position.x = (mobile || hero ? 0 : 2.4) - s.s * 1.2;
      rig.current.position.y = s.s * 1.4;
      rig.current.scale.setScalar((mobile ? 0.75 : 1) * (hero ? 1.1 + s.s * (mobile ? 0.1 : 0.4) : 1));
    }
    if (dust.current) {
      dust.current.rotation.y = t * 0.012;
      dust.current.position.x = -s.x * 0.8;
      dust.current.position.y = s.y * 0.5 + s.s * 0.9;
    }
    const cam = state.camera;
    cam.position.set(s.x * 0.5, -s.y * 0.35, 9 - s.s * (mobile ? 0.4 : 1.6));
    cam.lookAt(0, 0, 0);

    if (pulses.current) {
      const attr = pulses.current.geometry.getAttribute("position") as THREE.BufferAttribute;
      sv.links.forEach(([a, b], k) => {
        const u = (t * 0.12 + k * 0.37) % 1;
        attr.setXYZ(k, a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u, a.z + (b.z - a.z) * u);
      });
      attr.needsUpdate = true;
    }
  });

  return (
    <>
      <group ref={rig}>
        <group ref={core} rotation={[0.3, 0, 0]}>
          <group ref={spin}>
            {hero && (
              <mesh>
                <icosahedronGeometry args={[2, 2]} />
                <meshBasicMaterial color={CYAN} wireframe transparent opacity={0.3} />
              </mesh>
            )}
            <lineSegments geometry={net.lineGeo}>
              <lineBasicMaterial color={CYAN} transparent opacity={0.4} />
            </lineSegments>
            <points geometry={net.pointGeo}>
              <pointsMaterial color={CYAN} size={0.08} sizeAttenuation transparent opacity={0.9} />
            </points>
            <lineSegments geometry={sv.pathGeo}>
              <lineBasicMaterial color={CYAN} transparent opacity={0.6} />
            </lineSegments>
            <lineSegments geometry={sv.linkGeo}>
              <lineBasicMaterial color={CYAN} transparent opacity={0.25} />
            </lineSegments>
                        {sv.items.map((it, k) => {
              const h = health[k];
              const color =
                health.length === 0
                  ? it.color
                  : h === "down"
                    ? RED
                    : h === "slow"
                      ? AMBER
                      : h === "ok"
                        ? CYAN
                        : DIM;
              return <Server key={k} item={it} color={color} big={h === "down"} />;
            })}
            <points ref={pulses} geometry={sv.pulseGeo} frustumCulled={false}>
              <pointsMaterial color="#a5f3fc" size={0.09} sizeAttenuation transparent />
            </points>
          </group>
        </group>
      </group>
      <group ref={dust}>
        <points geometry={dustGeo}>
          <pointsMaterial color="#7dd3fc" size={0.03} sizeAttenuation transparent opacity={0.5} depthWrite={false} />
        </points>
      </group>
    </>
  );
}

export default function NetworkScene({ hero = false }: { hero?: boolean }) {
  const mobile = useMedia("(max-width: 767px)");
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const sites = useSitesOptional()?.sites;
  const health = useMemo(() => (sites ?? []).map(siteHealth), [sites]);
  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 50 }}
      dpr={mobile ? [1, 1.25] : [1, 1.75]}
      frameloop={reduced ? "demand" : "always"}
      gl={{ antialias: !mobile, powerPreference: "high-performance" }}
    >
      <Scene
  mobile={mobile}
  hero={hero}
  reduced={reduced}
  health={health}
/>
    </Canvas>
  );
}