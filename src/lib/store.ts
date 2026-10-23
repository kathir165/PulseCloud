import { promises as fs } from "node:fs";
import path from "node:path";
import { MAX_SITES } from "@/lib/limits";

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
type Db = { sites: Record<string, Site>; lastCron?: LastCron };

const MAX_HISTORY = 200;
const FILE = path.join(process.cwd(), ".data", "checks.json");

// Online storage (Upstash Redis over its REST API). When these variables are not set,
// the app keeps using the local file above, so development on your PC works as before.
const REMOTE_URL = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const REMOTE_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const remote = REMOTE_URL && REMOTE_TOKEN ? { url: REMOTE_URL, token: REMOTE_TOKEN } : null;

const DB_KEY = "pulsecloud:db";
const VER_KEY = "pulsecloud:ver";
// Saves only if nobody else saved since we read (compare-and-set on a version counter).
const SAVE_IF_UNCHANGED = `
local ver = tonumber(redis.call('GET', KEYS[2]) or '0')
if ver ~= tonumber(ARGV[1]) then return 0 end
redis.call('SET', KEYS[1], ARGV[2])
redis.call('SET', KEYS[2], ver + 1)
return 1
`;
const MAX_ATTEMPTS = 5;

function requireStorage() {
  if (!remote && process.env.VERCEL) {
    throw new Error("Storage is not configured. Connect an Upstash Redis database to this project.");
  }
}

// ---------- remote (Upstash) ----------

async function redis<T>(command: string[]): Promise<T> {
  if (!remote) throw new Error("Remote storage is not configured");
  const res = await fetch(remote.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${remote.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  const data = (await res.json()) as { result?: T; error?: string };
  if (!res.ok || data.error) throw new Error(data.error ?? `Storage error ${res.status}`);
  return data.result as T;
}

async function loadRemote(): Promise<{ db: Db; ver: number }> {
  const [raw, ver] = await redis<[string | null, string | null]>(["MGET", DB_KEY, VER_KEY]);
  // A missing key means "empty". Unreadable data throws, so it is never overwritten.
  const db: Db = raw ? (JSON.parse(raw) as Db) : { sites: {} };
  return { db, ver: Number(ver ?? 0) };
}

async function saveRemote(db: Db, ver: number): Promise<boolean> {
  const done = await redis<number>([
    "EVAL",
    SAVE_IF_UNCHANGED,
    "2",
    DB_KEY,
    VER_KEY,
    String(ver),
    JSON.stringify(db),
  ]);
  return done === 1;
}

// ---------- local file ----------

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn);
  queue = run.catch(() => undefined);
  return run;
}

async function loadLocal(): Promise<Db> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Db;
  } catch (e) {
    // Only a missing file means "empty". Any other failure must not be treated
    // as an empty database, or the next save would overwrite the real data.
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return { sites: {} };
    throw e;
  }
}

async function saveLocal(db: Db) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db));
  await fs.rename(tmp, FILE);
}

// ---------- shared ----------

async function read(): Promise<Db> {
  requireStorage();
  return remote ? (await loadRemote()).db : loadLocal();
}

async function mutate<T>(fn: (db: Db) => T): Promise<T> {
  requireStorage();
  if (!remote) {
    return enqueue(async () => {
      const db = await loadLocal();
      const out = fn(db);
      await saveLocal(db);
      return out;
    });
  }
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const { db, ver } = await loadRemote();
    const out = fn(db);
    if (await saveRemote(db, ver)) return out;
  }
  throw new Error("Storage is busy. Please try again.");
}

function withCheck(history: Check[], check: Check): Check[] {
  return [...history, check].sort((a, b) => a.t - b.t).slice(-MAX_HISTORY);
}

export async function getState() {
  const db = await read();
  return { sites: Object.values(db.sites), lastCron: db.lastCron ?? null };
}

export async function getSites(): Promise<Site[]> {
  return (await getState()).sites;
}

export function addCheck(url: string, check: Check): Promise<Site> {
  return mutate((db) => {
    if (!db.sites[url] && Object.keys(db.sites).length >= MAX_SITES) {
      throw new Error(`Site limit reached (${MAX_SITES}). Remove one to add another.`);
    }
    const site = db.sites[url] ?? { url, history: [] };
    site.history = withCheck(site.history, check);
    db.sites[url] = site;
    return site;
  });
}

export function removeSite(url: string): Promise<boolean> {
  return mutate((db) => {
    if (!db.sites[url]) return false;
    delete db.sites[url];
    return true;
  });
}

export function recordCronRun(results: { url: string; check: Check }[]): Promise<LastCron> {
  return mutate((db) => {
    let ok = 0;
    let failed = 0;
    for (const { url, check } of results) {
      const site = db.sites[url];
      if (!site) continue;
      site.history = withCheck(site.history, check);
      if (check.ok) ok++;
      else failed++;
    }
    const last: LastCron = { t: Date.now(), checked: ok + failed, ok, failed };
    db.lastCron = last;
    return last;
  });
}