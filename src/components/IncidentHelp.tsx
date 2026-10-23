"use client";

import { useState } from "react";
import type { Incident } from "@/lib/incidents";
import { explain } from "@/lib/troubleshoot";

export default function IncidentHelp({ incident }: { incident: Incident }) {
  const [open, setOpen] = useState(false);
  const g = explain(incident);
  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="text-xs text-accent hover:underline"
      >
        {open ? "Hide details" : "What does this mean?"}
      </button>
      {open && (
        <div className="mt-2 space-y-2 rounded-lg border border-line bg-navy-900/60 p-3 text-sm">
          <p className="text-fg">{g.summary}</p>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">Things to try</p>
          <ul className="list-disc space-y-1 pl-5 text-muted">
            {g.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="font-mono text-xs text-muted">{g.evidence}</p>
          <p className="text-xs text-muted">
            PulseCloud only sees the site from the outside, so these are common causes, not a diagnosis.
          </p>
        </div>
      )}
    </div>
  );
}