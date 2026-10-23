"use client";

import { useSites } from "@/components/SitesProvider";
import { MAX_SITES } from "@/lib/limits";

export default function NodeLegend() {
  const { sites } = useSites();
  if (sites.length === 0) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-10 hidden items-center gap-4 rounded-full border border-line bg-navy-900/80 px-4 py-2 font-mono text-xs text-muted md:flex">
      <span>
        3D nodes = your websites ({sites.length}/{MAX_SITES})
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-accent" />
        healthy
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        slow
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-red-400" />
        down
      </span>
    </div>
  );
}