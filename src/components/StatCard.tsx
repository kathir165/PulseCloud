"use client";

import { motion } from "motion/react";

type Props = {
  label: string;
  value: string;
  delta: string;
  good?: boolean;
  index: number;
};

export default function StatCard({ label, value, delta, good = true, index }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 + index * 0.15 }}
      className="rounded-xl border border-line bg-graphite-800/75 p-4 transition sm:p-5 hover:border-accent/50 hover:shadow-[0_0_24px_-8px_#22d3ee]"
    >
      <p className="font-mono text-xs uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-3 text-2xl font-semibold sm:text-3xl tracking-tight text-fg">{value}</p>
      <p className={`mt-2 text-xs ${good ? "text-accent" : "text-muted"}`}>{delta}</p>
    </motion.div>
  );
}