"use client";

import IncidentHelp from "@/components/IncidentHelp";
import { useSites } from "@/components/SitesProvider";
import { deriveAll, levelOf, titleOf, whenOf } from "@/lib/incidents";

const dot = { critical: "bg-red-400", warning: "bg-amber-400", resolved: "bg-muted" };
const tone = { critical: "text-red-400", warning: "text-amber-400", resolved: "text-muted" };
const label = { critical: "Ongoing", warning: "Slow, ongoing", resolved: "Resolved" };

export default function Incidents() {
  const { sites } = useSites();
  const items = deriveAll(sites).slice(0, 8);

  return (
    <div className="rounded-xl border border-line bg-graphite-800/75 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">Incident timeline</p>
        <span className="rounded-full border border-accent/40 px-3 py-1 font-mono text-xs text-accent">
          Real data
        </span>
      </div>
      {items.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          No incidents recorded. A site that fails every retry, or stays slow across checks, will appear here.
        </p>
      ) : (
        <ol className="mt-5 space-y-5 border-l border-line pl-5">
          {items.map((i) => {
            const level = levelOf(i);
            return (
              <li key={i.id} className="relative">
                <span className={`absolute -left-[26px] top-1.5 h-2 w-2 rounded-full ${dot[level]}`} />
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm text-fg">{i.site}</p>
                  <span className={`font-mono text-xs ${tone[level]}`}>{label[level]}</span>
                </div>
                <p className={`mt-0.5 text-sm ${tone[level]}`}>{titleOf(i)}</p>
                <p className="mt-0.5 font-mono text-xs text-muted">{whenOf(i)}</p>
                <IncidentHelp incident={i} />
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}