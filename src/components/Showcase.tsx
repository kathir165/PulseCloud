"use client";

import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

const steps = [
  { n: "01", title: "Add your services", text: "Bring every site and endpoint into one list." },
  { n: "02", title: "Watch them together", text: "Status, latency and uptime side by side." },
  { n: "03", title: "Act on incidents", text: "See what broke, where, and when it started." },
];

const group: Variants = {
  hidden: { transition: { staggerChildren: 0.08, staggerDirection: -1 } },
  visible: { transition: { staggerChildren: 0.3, delayChildren: 0.4 } },
};

const pop: Variants = {
  hidden: { opacity: 0, y: 50, transition: { duration: 0.4 } },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

const stats = [
  { label: "Uptime", value: "99.98%" },
  { label: "Latency", value: "142 ms" },
  { label: "Requests / min", value: "24.6k" },
  { label: "Alerts", value: "3" },
];

const rows = [
  { name: "API Gateway", status: "Operational", dot: "bg-accent" },
  { name: "Database Cluster", status: "Degraded", dot: "bg-amber-400" },
  { name: "Queue Workers", status: "Down", dot: "bg-red-400" },
];

function Scaled({ width, children }: { width: number; children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<{ scale: number; height: number } | null>(null);

  useEffect(() => {
    const o = outer.current;
    const i = inner.current;
    if (!o || !i) return;
    const update = () => {
      if (o.clientWidth >= width) {
        setFit(null);
        return;
      }
      const scale = o.clientWidth / width;
      const height = Math.round(i.offsetHeight * scale);
      setFit((p) => (p && p.scale === scale && p.height === height ? p : { scale, height }));
    };
    const ro = new ResizeObserver(update);
    ro.observe(o);
    ro.observe(i);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div ref={outer} style={fit ? { height: fit.height } : undefined} className="w-full overflow-hidden">
      <div
        ref={inner}
        style={fit ? { width, transform: `scale(${fit.scale})`, transformOrigin: "top left" } : undefined}
      >
        {children}
      </div>
    </div>
  );
}

function Preview() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [22, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0.2, 1]);

  return (
    <div className="mx-auto max-w-5xl px-3 pb-24 sm:px-6" style={{ perspective: 1200 }}>
      <motion.div
        ref={ref}
        style={reduce ? undefined : { rotateX, scale, opacity, transformOrigin: "50% 100%" }}
        className="overflow-hidden rounded-2xl border border-line bg-navy-900/85"
      >
        <Scaled width={760}>
          <div className="p-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-muted">
                Dashboard preview
              </span>
              <span className="rounded-full border border-line px-3 py-1 font-mono text-xs text-muted">
                Simulated data
              </span>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-lg border border-line bg-graphite-800/80 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted">{s.label}</p>
                  <p className="mt-2 text-xl font-semibold text-fg">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-lg border border-line bg-graphite-800/80 p-4">
              <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="h-28 w-full">
                <path
                  d="M0 70 L40 62 L80 66 L120 48 L160 40 L200 44 L240 28 L280 34 L320 22 L360 30 L400 38 L400 100 L0 100 Z"
                  fill="rgba(34,211,238,0.12)"
                />
                <path
                  d="M0 70 L40 62 L80 66 L120 48 L160 40 L200 44 L240 28 L280 34 L320 22 L360 30 L400 38"
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>

            <ul className="mt-3 divide-y divide-line rounded-lg border border-line bg-graphite-800/80">
              {rows.map((r) => (
                <li key={r.name} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="flex items-center gap-3 text-fg">
                    <span className={`h-2 w-2 rounded-full ${r.dot}`} />
                    {r.name}
                  </span>
                  <span className="font-mono text-xs text-muted">{r.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </Scaled>
      </motion.div>
    </div>
  );
}

export default function Showcase() {
  return (
    <>
      <motion.section
        variants={group}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.35 }}
        className="mx-auto max-w-5xl px-6 pb-20 pt-16"
      >
        <motion.p variants={pop} className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
          How it works
        </motion.p>
        <motion.h2
          variants={pop}
          className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-fg"
        >
          One view of everything you run in the cloud.
        </motion.h2>
        <motion.p variants={pop} className="mt-4 max-w-xl text-muted">
          PulseCloud turns scattered health checks into a single picture: which services are up,
          how fast they respond, and what went wrong.
        </motion.p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <motion.div key={s.n} variants={pop} className="border-t border-line pt-4">
              <span className="font-mono text-xs text-accent">{s.n}</span>
              <h3 className="mt-2 font-semibold text-fg">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <Preview />
    </>
  );
}