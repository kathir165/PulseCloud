"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Check = {
  t: number;
  ok: boolean;
  status: number | null;
  ms: number | null;
  error?: string;
  src?: "cron";
  attempts?: number;
};
export type Site = { url: string; history: Check[] };
export type LastCron = { t: number; checked: number; ok: number; failed: number };

type Ctx = {
  sites: Site[];
  lastCron: LastCron | null;
  loaded: boolean;
  busy: string | null;
  error: string | null;
  check: (url: string, key: string) => Promise<boolean>;
  remove: (url: string) => Promise<boolean>;
  checkAll: () => Promise<void>;
};

const SitesContext = createContext<Ctx | null>(null);

async function fetchState(): Promise<{ sites: Site[]; lastCron: LastCron | null }> {
  const r = await fetch("/api/check");
  const d = (await r.json()) as { sites?: Site[]; lastCron?: LastCron | null };
  return { sites: d.sites ?? [], lastCron: d.lastCron ?? null };
}

export function SitesProvider({ children }: { children: ReactNode }) {
  const [sites, setSites] = useState<Site[]>([]);
  const [lastCron, setLastCron] = useState<LastCron | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const d = await fetchState();
    setSites(d.sites);
    setLastCron(d.lastCron);
  }, []);

  useEffect(() => {
    let alive = true;
    fetchState()
      .then((d) => {
        if (alive) {
          setSites(d.sites);
          setLastCron(d.lastCron);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (alive) setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const check = useCallback(
    async (target: string, key: string) => {
      setBusy(key);
      setError(null);
      try {
        const r = await fetch("/api/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: target }),
        });
        const d = (await r.json()) as { error?: string };
        if (!r.ok) throw new Error(d.error ?? "Check failed");
        await refresh();
        return true;
      } catch (e) {
        setError((e as Error).message);
        return false;
      } finally {
        setBusy(null);
      }
    },
    [refresh],
  );

  const remove = useCallback(
    async (target: string) => {
      setBusy(`rm:${target}`);
      setError(null);
      try {
        const r = await fetch("/api/check", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: target }),
        });
        if (!r.ok) {
          const d = (await r.json()) as { error?: string };
          throw new Error(d.error ?? "Could not remove");
        }
        await refresh();
        return true;
      } catch (e) {
        setError((e as Error).message);
        return false;
      } finally {
        setBusy(null);
      }
    },
    [refresh],
  );

  const checkAll = useCallback(async () => {
    setBusy("all");
    setError(null);
    const state = { error: null as string | null };
    const queue = [...sites];
    const worker = async () => {
      for (let s = queue.shift(); s; s = queue.shift()) {
        try {
          const r = await fetch("/api/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: s.url }),
          });
          if (!r.ok) {
            const d = (await r.json()) as { error?: string };
            state.error = d.error ?? "Check failed";
            queue.length = 0;
            return;
          }
        } catch (e) {
          state.error = (e as Error).message;
          queue.length = 0;
          return;
        }
      }
    };
    await Promise.all([worker(), worker(), worker(), worker()]);
    if (state.error) setError(state.error);
    try {
      await refresh();
    } catch {
      /* keep the current list */
    }
    setBusy(null);
  }, [sites, refresh]);

  const value = useMemo(
    () => ({ sites, lastCron, loaded, busy, error, check, remove, checkAll }),
    [sites, lastCron, loaded, busy, error, check, remove, checkAll],
  );
  return <SitesContext.Provider value={value}>{children}</SitesContext.Provider>;
}

export function useSites() {
  const c = useContext(SitesContext);
  if (!c) throw new Error("useSites must be used inside SitesProvider");
  return c;
}

export function useSitesOptional() {
  return useContext(SitesContext);
}