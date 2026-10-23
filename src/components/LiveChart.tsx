"use client";

import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useSites } from "@/components/SitesProvider";

const COLORS = [
  "#22d3ee",
  "#a78bfa",
  "#34d399",
  "#f472b6",
  "#fb923c",
  "#60a5fa",
  "#a3e635",
  "#e879f9",
  "#fda4af",
  "#cbd5e1",
];

function look(k: number) {
  return { color: COLORS[k % COLORS.length], dash: k >= COLORS.length ? "6 4" : undefined };
}

export default function LiveChart() {
  const { sites } = useSites();
  const [hover, setHover] = useState<number | null>(null);

  const { rows, names } = useMemo(() => {
    const names = sites.map((s) => s.url.replace(/^https?:\/\//, "").replace(/\/$/, ""));
    const recent = sites.map((s) => s.history.slice(-20));
    const len = Math.max(0, ...recent.map((h) => h.length));
    const rows = Array.from({ length: len }, (_, i) => {
      const row: Record<string, number | null> = { n: i + 1 };
      recent.forEach((h, k) => {
        row[`s${k}`] = h[i]?.ms ?? null;
      });
      return row;
    });
    return { rows, names };
  }, [sites]);

  return (
    <div className="rounded-xl border border-line bg-graphite-800/75 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          Response time (ms), recent checks
        </p>
        <span className="rounded-full border border-accent/40 px-3 py-1 font-mono text-xs text-accent">
          Real data
        </span>
      </div>
      {rows.length < 2 ? (
        <p className="mt-6 text-sm text-muted">
          Run at least two checks on a website to see its response-time line.
        </p>
      ) : (
        <>
          <div className="mt-4 h-44 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rows} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#2a3446" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="n" stroke="#8a97ad" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#8a97ad" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#0a1428",
                    border: "1px solid #2a3446",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#8a97ad" }}
                  labelFormatter={(n) => `Check ${n}`}
                />
                {names.map((name, k) => {
                  const { color, dash } = look(k);
                  return (
                    <Line
                      key={`${name}-${k}`}
                      dataKey={`s${k}`}
                      name={name}
                      stroke={color}
                      strokeDasharray={dash}
                      strokeWidth={hover === k ? 3 : 2}
                      strokeOpacity={hover === null || hover === k ? 1 : 0.12}
                      dot={false}
                      activeDot={{ r: 5 }}
                      connectNulls
                      isAnimationActive={false}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {names.map((name, k) => {
              const { color, dash } = look(k);
              return (
                <li key={`${name}-${k}`}>
                  <button
                    type="button"
                    onMouseEnter={() => setHover(k)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(k)}
                    onBlur={() => setHover(null)}
                    className="flex items-center gap-2 text-xs text-muted transition hover:text-fg"
                  >
                    <svg width="18" height="6" aria-hidden>
                      <line
                        x1="0"
                        y1="3"
                        x2="18"
                        y2="3"
                        stroke={color}
                        strokeWidth="2.5"
                        strokeDasharray={dash}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="max-w-[10rem] truncate sm:max-w-[16rem]">{name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}