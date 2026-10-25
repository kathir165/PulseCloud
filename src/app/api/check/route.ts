import { NextResponse } from "next/server";
import { verifiedCheck } from "@/lib/verify";
import { addCheck, getState, removeSite } from "@/lib/store";
import { requirePasscode } from "@/lib/auth";

const hits = new Map<string, number[]>();
const LIMIT = 40;
const WINDOW_MS = 60_000;

function limited(ip: string) {
  if (hits.size > 1000) hits.clear();
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > LIMIT;
}

function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(await getState());
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const denied = requirePasscode(req);
  if (denied) return denied;
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (limited(ip)) {
    return NextResponse.json({ error: "Too many checks. Try again in a minute." }, { status: 429 });
  }
  const text = await req.text();
  if (text.length > 2000) return NextResponse.json({ error: "Request too large" }, { status: 413 });

  let url: unknown;
  try {
    url = (JSON.parse(text) as { url?: unknown }).url;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof url !== "string") return NextResponse.json({ error: "Missing url" }, { status: 400 });

  try {
    const r = await verifiedCheck(url);
    const check = { t: Date.now(), ok: r.ok, status: r.status, ms: r.ms, error: r.error, attempts: r.attempts };
    await addCheck(r.site, check);
    return NextResponse.json({ site: r.site, check, simulated: false });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const denied = requirePasscode(req);
  if (denied) return denied;
  const text = await req.text();
  if (text.length > 2000) return NextResponse.json({ error: "Request too large" }, { status: 413 });

  let url: unknown;
  try {
    url = (JSON.parse(text) as { url?: unknown }).url;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof url !== "string") return NextResponse.json({ error: "Missing url" }, { status: 400 });

  return NextResponse.json({ removed: await removeSite(url) });
}