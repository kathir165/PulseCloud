"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import CountUp from "@/components/CountUp";

type Tone = "accent" | "warn" | "danger" | "neutral";

const text: Record<Tone, string> = {
  accent: "text-accent",
  warn: "text-amber-400",
  danger: "text-red-400",
  neutral: "text-muted",
};
const stroke: Record<Tone, string> = {
  accent: "#22d3ee",
  warn: "#fbbf24",
  danger: "#f87171",
  neutral: "#8a97ad",
};

function Spark({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = Math.max(max - min, 1);
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * 100},${28 - ((v - min) / span) * 24}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="mt-3 h-8 w-full" aria-hidden>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function MetricCard({
  label,
  icon,
  tone,
  value,
  note,
  spark,
  index,
}: {
  label: string;
  icon: ReactNode;
  tone: Tone;
  value: string | { to: number; decimals?: number; suffix?: string };
  note: string;
  spark?: number[];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 + index * 0.12 }}
      className="rounded-xl border border-line bg-graphite-800/75 p-4 transition hover:border-accent/50 hover:shadow-[0_0_24px_-8px_#22d3ee] sm:p-5"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">{label}</p>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-navy-900/60 ${text[tone]}`}>
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
        {typeof value === "string" ? value : <CountUp {...value} />}
      </p>
      <p className={`mt-2 text-xs ${text[tone]}`}>{note}</p>
      {spark && <Spark values={spark} color={stroke[tone]} />}
    </motion.div>
  );
}