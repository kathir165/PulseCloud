"use client";

import Link from "next/link";
import { useSites } from "@/components/SitesProvider";

export default function LiveServices() {
  const { sites, loaded } = useSites();

  return (
    <div className="rounded-xl border border-line bg-graphite-800/75">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-4 sm:px-5">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">Your websites</span>
        <span className="rounded-full border border-accent/40 px-3 py-1 font-mono text-xs text-accent">
          Real data · checked on demand
        </span>
      </div>
      {sites.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted sm:px-5">
          {loaded ? "No websites yet. " : "Loading… "}
          <Link href="/dashboard" className="text-accent hover:underline">
            Add one on the Overview page
          </Link>
          .
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {sites.map((s) => {
            const h = s.history;
            const last = h[h.length - 1];
            const ms = h.map((c) => c.ms).filter((m): m is number => m !== null);
            const avg = ms.length ? Math.round(ms.reduce((a, b) => a + b, 0) / ms.length) : null;
            const uptime = Math.round((h.filter((c) => c.ok).length / h.length) * 1000) / 10;
            const state = !last.ok ? "Down" : (last.ms ?? 0) > 1000 ? "Slow" : "Operational";
            const dot = !last.ok ? "bg-red-400" : (last.ms ?? 0) > 1000 ? "bg-amber-400" : "bg-accent";
            return (
              <li
                key={s.url}
                className="flex flex-col gap-2 px-4 py-3.5 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
                  <span className="truncate text-fg">
                    {s.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </span>
                </span>
                <span className="flex items-center gap-4 pl-5 font-mono text-xs text-muted sm:shrink-0 sm:gap-6 sm:pl-0">
                  <span>
                    {uptime}% of {h.length}
                  </span>
                  <span className="sm:w-16 sm:text-right">{avg === null ? "n/a" : `${avg} ms`}</span>
                  <span className="sm:w-24 sm:text-right">{state}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}