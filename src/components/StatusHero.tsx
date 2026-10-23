"use client";

import { motion } from "motion/react";
import { useSites } from "@/components/SitesProvider";
import { useProfile } from "@/lib/profileStore";

export default function StatusHero() {
  const { sites, lastCron, loaded, busy, checkAll } = useSites();
  const profile = useProfile();
  const first = profile.name.trim().split(/\s+/)[0];

  const n = sites.length;
  const last = sites.map((s) => s.history[s.history.length - 1]);
  const down = last.filter((c) => !c.ok).length;
  const up = n - down;
  const ms = last.map((c) => c.ms).filter((m): m is number => m !== null);
  const avg = ms.length ? Math.round(ms.reduce((a, b) => a + b, 0) / ms.length) : null;
  const latest = last.reduce((t, c) => Math.max(t, c.t), 0);
  const healthy = n > 0 && down === 0;
  const frac = n === 0 ? 0 : up / n;

  const headline =
    n === 0 ? "No websites yet" : healthy ? "All systems healthy" : `${down} of ${n} need attention`;
  const sub =
    n === 0
      ? loaded
        ? "Add a website below to run your first real check."
        : "Loading…"
      : `${avg !== null ? `${avg} ms average · ` : ""}last check ${new Date(latest).toLocaleTimeString()}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="flex flex-col gap-5 rounded-xl border border-line bg-graphite-800/75 p-5 sm:flex-row sm:items-center"
    >
      <div
        className={`relative h-24 w-24 shrink-0 rounded-full ${healthy ? "shadow-[0_0_40px_-12px_#22d3ee]" : ""}`}
      >
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke={down > 0 ? "rgba(248,113,113,0.45)" : "#2a3446"}
            strokeWidth="8"
          />
          {frac > 0 && (
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: frac }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          )}
        </svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold text-fg">{n === 0 ? "—" : `${up}/${n}`}</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">up</span>
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">
          Welcome back{first ? `, ${first}` : ""}
        </p>
        <p className="mt-1 text-xl font-semibold tracking-tight text-fg sm:text-2xl">{headline}</p>
        <p className="mt-1 text-sm text-muted">{sub}</p>
        <p className="mt-2 font-mono text-xs text-muted">
          {lastCron
            ? `Last scheduled run ${new Date(lastCron.t).toLocaleString()} · ${lastCron.checked} checked, ${lastCron.failed} failed. Runs only when an external scheduler calls this app.`
            : "Checks run only when you press a button. No scheduler is connected yet."}
        </p>
      </div>

      <button
        onClick={checkAll}
        disabled={n === 0 || busy !== null}
        className="shrink-0 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-navy-950 transition hover:brightness-110 disabled:opacity-50"
      >
        {busy === "all" ? "Checking…" : "Check all"}
      </button>
    </motion.div>
  );
}