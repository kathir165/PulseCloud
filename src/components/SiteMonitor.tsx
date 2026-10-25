"use client";

import { useState } from "react";
import { useSites } from "@/components/SitesProvider";
import { MAX_SITES } from "@/lib/limits";

function Spark({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * 100},${30 - (v / max) * 26}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="hidden h-8 w-24 sm:block">
      <polyline
        points={pts}
        fill="none"
        stroke="#22d3ee"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export default function SiteMonitor() {
  const { sites, busy, error, check, remove, needsPasscode, setPasscode } = useSites();
  const [confirming, setConfirming] = useState<string | null>(null);
  const [pass, setPass] = useState("");
  const [url, setUrl] = useState("");
  const full = sites.length >= MAX_SITES;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || busy) return;
    if (await check(url.trim(), "new")) setUrl("");
  }

  return (
    <div className="rounded-xl border border-line bg-graphite-800/75">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <span className="font-mono text-xs uppercase tracking-widest text-muted">
            Live website checks · {sites.length}/{MAX_SITES}
        </span>
        <span className="rounded-full border border-accent/40 px-3 py-1 font-mono text-xs text-accent">
          Real data · checked on demand
        </span>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3 px-5 py-4 sm:flex-row">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          maxLength={2048}
          placeholder={full ? "Limit reached. Remove a site first." : "example.com"}
          disabled={full}
          aria-label="Website URL"
          className="w-full rounded-lg border border-line bg-navy-900 px-4 py-2.5 text-sm text-fg outline-none placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          disabled={busy !== null || !url.trim() || full}
          className="shrink-0 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-navy-950 transition hover:brightness-110 disabled:opacity-50"
        >
          {busy === "new" ? "Checking…" : "Check now"}
        </button>
      </form>

      {error && <p className="px-5 pb-3 text-sm text-red-400">{error}</p>}
            {needsPasscode && (
        <div className="flex flex-col gap-3 px-5 pb-4 sm:flex-row">
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="Passcode"
            aria-label="Passcode"
            className="w-full rounded-lg border border-line bg-navy-900 px-4 py-2.5 text-sm text-fg outline-none placeholder:text-muted focus:border-accent"
          />
          <button
            type="button"
            onClick={() => {
              setPasscode(pass);
              setPass("");
            }}
            disabled={!pass}
            className="shrink-0 rounded-lg border border-accent px-5 py-2.5 text-sm font-medium text-accent transition hover:bg-accent/10 disabled:opacity-50"
          >
            Unlock
          </button>
        </div>
      )}

      {sites.length === 0 ? (
        <p className="border-t border-line px-5 py-6 text-sm text-muted">
          No websites yet. Add one above to run a real check. Nothing is monitored automatically.
        </p>
      ) : (
        <ul className="divide-y divide-line border-t border-line">
          {sites.map((s) => {
            const h = s.history;
            const last = h[h.length - 1];
            const uptime = Math.round((h.filter((c) => c.ok).length / h.length) * 1000) / 10;
            const ms = h.map((c) => c.ms).filter((m): m is number => m !== null);
            const dot = !last.ok ? "bg-red-400" : (last.ms ?? 0) > 1000 ? "bg-amber-400" : "bg-accent";
            const result = last.ok ? `${last.status} · ${last.ms} ms` : (last.error ?? "Failed");
            return (
              <li key={s.url} className="flex flex-col gap-3 px-5 py-3.5 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
                  <div className="min-w-0">
                    <p className="truncate text-fg">{s.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted">
                      {uptime}% of {h.length} check{h.length === 1 ? "" : "s"} · last{" "}
                      {new Date(last.t).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 pl-5 sm:shrink-0 sm:flex-nowrap sm:gap-4 sm:pl-0">
                  <Spark values={ms.slice(-20)} />
                  <span className="font-mono text-xs text-muted">{result}</span>
                  <button
                    onClick={() => check(s.url, s.url)}
                    disabled={busy !== null}
                    className="rounded-full border border-line px-3 py-1 text-xs text-fg transition hover:border-accent hover:text-accent disabled:opacity-50"
                  >
                    {busy === s.url ? "Checking…" : "Re-check"}
                  </button>
                                    {confirming === s.url ? (
                    <>
                      <button
                        onClick={async () => {
                          await remove(s.url);
                          setConfirming(null);
                        }}
                        disabled={busy !== null}
                        className="rounded-full border border-red-400/50 px-3 py-1 text-xs text-red-400 transition hover:bg-red-400/10 disabled:opacity-50"
                      >
                        {busy === `rm:${s.url}` ? "Removing…" : "Confirm"}
                      </button>
                      <button
                        onClick={() => setConfirming(null)}
                        className="text-xs text-muted transition hover:text-fg"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirming(s.url)}
                      disabled={busy !== null}
                      aria-label={`Remove ${s.url}`}
                      className="rounded-full border border-line px-3 py-1 text-xs text-muted transition hover:border-red-400/50 hover:text-red-400 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}