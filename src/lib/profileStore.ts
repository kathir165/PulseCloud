import { useSyncExternalStore } from "react";

export type Profile = {
  name: string;
  email: string;
  role: string;
  org: string;
  avatar: string | null;
};

const KEY = "pulsecloud.profile";
const DEFAULT: Profile = { name: "", email: "", role: "", org: "", avatar: null };

let cache: { raw: string | null; value: Profile } = { raw: null, value: DEFAULT };
const listeners = new Set<() => void>();

function read(): Profile {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    /* storage unavailable */
  }
  if (raw === cache.raw) return cache.value;
  let value = DEFAULT;
  if (raw) {
    try {
      value = { ...DEFAULT, ...(JSON.parse(raw) as Partial<Profile>) };
    } catch {
      /* ignore corrupted data */
    }
  }
  cache = { raw, value };
  return value;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function saveProfile(p: Profile) {
  localStorage.setItem(KEY, JSON.stringify(p));
  listeners.forEach((l) => l());
}

export function useProfile(): Profile {
  return useSyncExternalStore(subscribe, read, () => DEFAULT);
}