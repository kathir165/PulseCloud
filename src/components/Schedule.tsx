"use client";

import { useSyncExternalStore } from "react";
import { useSites } from "@/components/SitesProvider";

// The schedule itself lives at cron-job.org (every 5 minutes). The app can only see when the
// last scheduled run happened, so a run older than this counts as stalled (3 missed runs).
const STALE_AFTER_MS = 15 * 60 * 1000;

let now = Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(cb: () => void) {
  listeners.add(cb);
  now = Date.now();
  if (!timer) {
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((l) => l());
    }, 30_000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

function useNow() {
  return useSyncExternalStore(subscribe, () => now, () => 0);
}

export type ScheduleState = "none" | "active" | "stalled";

export function useSchedule(): { state: ScheduleState; lastT: number | null } {
  const { lastCron } = useSites();
  const t = useNow();
  if (!lastCron) return { state: "none", lastT: null };
  return { state: t - lastCron.t <= STALE_AFTER_MS ? "active" : "stalled", lastT: lastCron.t };
}

export function ScheduleBadge() {
  const { state, lastT } = useSchedule();
  const text =
    state === "active"
      ? "Real data · auto-checked"
      : state === "stalled"
        ? "Real data · auto-checks stalled"
        : "Real data · checked on demand";
  const tone =
    state === "stalled" ? "border-amber-400/40 text-amber-400" : "border-accent/40 text-accent";
  return (
    <span
      title={lastT ? `Last scheduled run ${new Date(lastT).toLocaleString()}` : undefined}
      className={`rounded-full border px-3 py-1 font-mono text-xs ${tone}`}
    >
      {text}
    </span>
  );
}