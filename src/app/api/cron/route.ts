import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { verifiedCheck } from "@/lib/verify";
import { getSites, recordCronRun, type Check } from "@/lib/store";

const CONCURRENCY = 20;
const FAIL_LIMIT = 10;
const WINDOW_MS = 60_000;

type Outcome = { ok: boolean; status: number | null; ms: number | null; error?: string; attempts?: number };

let running = false;
const fails = new Map<string, number[]>();

function authorized(req: Request, secret: string) {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const a = createHash("sha256").update(token).digest();
  const b = createHash("sha256").update(secret).digest();
  return timingSafeEqual(a, b);
}

async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) {
    return NextResponse.json({ error: "Scheduled checks are not configured" }, { status: 503 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const now = Date.now();
  if (fails.size > 1000) fails.clear();
  const recent = (fails.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= FAIL_LIMIT) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }
  if (!authorized(req, secret)) {
    recent.push(now);
    fails.set(ip, recent);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (running) {
    return NextResponse.json({ error: "A run is already in progress" }, { status: 409 });
  }
  running = true;
  try {
    const queue = [...(await getSites())];
    const results: { url: string; check: Check }[] = [];
    const worker = async () => {
      for (let s = queue.shift(); s; s = queue.shift()) {
        const r: Outcome = await verifiedCheck(s.url).catch(
          (e: unknown): Outcome => ({
            ok: false,
            status: null,
            ms: null,
            error: (e as Error).message.slice(0, 120),
          }),
        );
        results.push({
          url: s.url,
          check: { t: Date.now(), ok: r.ok, status: r.status, ms: r.ms, error: r.error,attempts: r.attempts, src: "cron" },
        });
      }
    };
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker));
    return NextResponse.json(await recordCronRun(results));
  } finally {
    running = false;
  }
}

export const GET = handle;
export const POST = handle;