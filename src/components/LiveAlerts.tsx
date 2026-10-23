"use client";

import IncidentHelp from "@/components/IncidentHelp";
import { useSites } from "@/components/SitesProvider";
import { deriveAll, levelOf, titleOf, whenOf } from "@/lib/incidents";

const badge = {
  critical: "border-red-400/40 text-red-400",
  warning: "border-amber-400/40 text-amber-400",
  resolved: "border-line text-muted",
};

export default function LiveAlerts() {
  const { sites, loaded } = useSites();
  const items = deriveAll(sites).slice(0, 30);

  return (
    <div className="rounded-xl border border-line bg-graphite-800/75">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">Live alerts</span>
        <span className="rounded-full border border-accent/40 px-3 py-1 font-mono text-xs text-accent">
          Real data · from your checks
        </span>
      </div>
      {items.length === 0 ? (
        <p className="px-5 py-6 text-sm text-muted">
          {loaded ? "No alerts. Confirmed failures and sustained slowness will appear here." : "Loading…"}
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {items.map((i) => {
            const level = levelOf(i);
            return (
              <li key={i.id} className="flex items-start justify-between gap-4 px-5 py-4 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="break-words text-fg">
                    {i.site}: {titleOf(i)}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted">{whenOf(i)}</p>
                  <IncidentHelp incident={i} />
                </div>
                <span
                  className={`shrink-0 rounded-full border px-3 py-1 font-mono text-xs capitalize ${badge[level]}`}
                >
                  {level}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}