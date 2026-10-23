import type { Check, Site } from "@/components/SitesProvider";

export const SLOW_MS = 1000;
const SLOW_ALWAYS_MS = 3000;
const SLOW_MIN_CHECKS = 2;

export type Incident = {
  id: string;
  url: string;
  site: string;
  kind: "down" | "slow";
  startT: number;
  lastT: number;
  endT: number | null;
  checks: number;
  worst: Check;
  typicalMs: number | null;
};

type Kind = "down" | "slow" | "ok";

function kindOf(c: Check): Kind {
  if (!c.ok) return "down";
  return (c.ms ?? 0) > SLOW_MS ? "slow" : "ok";
}

export function siteLabel(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export function deriveIncidents(site: Site): Incident[] {
  const h = site.history;
  const healthy = h
    .filter((c) => c.ok && c.ms !== null && c.ms <= SLOW_MS)
    .map((c) => c.ms as number)
    .sort((a, b) => a - b);
  const typicalMs = healthy.length >= 3 ? healthy[Math.floor(healthy.length / 2)] : null;

  const out: Incident[] = [];
  let i = 0;
  while (i < h.length) {
    const kind = kindOf(h[i]);
    let j = i;
    while (j + 1 < h.length && kindOf(h[j + 1]) === kind) j++;
    if (kind !== "ok") {
      const run = h.slice(i, j + 1);
      const worst =
        kind === "slow"
          ? run.reduce((a, b) => ((b.ms ?? 0) > (a.ms ?? 0) ? b : a))
          : run[run.length - 1];
      const qualifies =
        kind === "down" || run.length >= SLOW_MIN_CHECKS || (worst.ms ?? 0) >= SLOW_ALWAYS_MS;
      if (qualifies) {
        out.push({
          id: `${site.url}|${h[i].t}`,
          url: site.url,
          site: siteLabel(site.url),
          kind,
          startT: h[i].t,
          lastT: h[j].t,
          endT: j + 1 < h.length ? h[j + 1].t : null,
          checks: run.length,
          worst,
          typicalMs,
        });
      }
    }
    i = j + 1;
  }
  return out;
}

export function deriveAll(sites: Site[]): Incident[] {
  return sites.flatMap((s) => deriveIncidents(s)).sort((a, b) => b.startT - a.startT);
}

export function levelOf(i: Incident): "critical" | "warning" | "resolved" {
  if (i.endT !== null) return "resolved";
  return i.kind === "down" ? "critical" : "warning";
}

export function titleOf(i: Incident): string {
  if (i.kind === "slow") return `Slow response (${i.worst.ms} ms)`;
  return i.worst.error ?? (i.worst.status ? `HTTP ${i.worst.status}` : "No response");
}

export function whenOf(i: Incident): string {
  const fmt = (t: number) => new Date(t).toLocaleString();
  const n = `${i.checks} ${i.kind === "down" ? "failed" : "slow"} check${i.checks === 1 ? "" : "s"} in a row`;
  if (i.endT === null) {
    return `First seen ${fmt(i.startT)} · ${n} · still ${i.kind === "down" ? "failing" : "slow"} at last check (${fmt(i.lastT)})`;
  }
  return `First seen ${fmt(i.startT)} · ${n} · recovered at ${fmt(i.endT)}`;
}