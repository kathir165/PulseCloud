"use client";

import type { ReactNode } from "react";
import MetricCard from "@/components/MetricCard";
import { useSites } from "@/components/SitesProvider";

const ico = (d: ReactNode) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

export default function LiveStats() {
  const { sites } = useSites();
  const all = sites.flatMap((s) => s.history);
  const total = all.length;
  const failed = all.filter((c) => !c.ok).length;
  const series = all
    .slice()
    .sort((a, b) => a.t - b.t)
    .map((c) => c.ms)
    .filter((m): m is number => m !== null);
  const avg = series.length ? Math.round(series.reduce((a, b) => a + b, 0) / series.length) : null;
  const slowest = series.length ? Math.max(...series) : null;
  const rate = total ? Math.round(((total - failed) / total) * 1000) / 10 : null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      <MetricCard
        index={0}
        label="Success rate"
        icon={ico(
          <>
            <circle cx="12" cy="12" r="9" />
            <path d="M8 12.5l2.7 2.7L16 9.5" />
          </>,
        )}
        tone={rate === null ? "neutral" : failed === 0 ? "accent" : "danger"}
        value={rate === null ? "—" : { to: rate, decimals: Number.isInteger(rate) ? 0 : 1, suffix: "%" }}
        note={total ? `${total} checks run` : "No checks yet"}
      />
      <MetricCard
        index={1}
        label="Avg response"
        icon={ico(<path d="M13 3L5 13h6l-1 8 8-10h-6z" />)}
        tone={avg === null ? "neutral" : avg > 1000 ? "warn" : "accent"}
        value={avg === null ? "—" : { to: avg, suffix: " ms" }}
        note={slowest === null ? "Run a check" : `slowest ${slowest} ms`}
        spark={series.slice(-20)}
      />
      <MetricCard
        index={2}
        label="Websites"
        icon={ico(
          <>
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
          </>,
        )}
        tone={sites.length ? "accent" : "neutral"}
        value={{ to: sites.length }}
        note="checked on demand"
      />
      <MetricCard
        index={3}
        label="Failed checks"
        icon={ico(
          <>
            <path d="M12 4l9 16H3z" />
            <path d="M12 10v4M12 17h.01" />
          </>,
        )}
        tone={total === 0 ? "neutral" : failed ? "danger" : "accent"}
        value={{ to: failed }}
        note={failed ? "see the timeline below" : "none recorded"}
      />
    </div>
  );
}