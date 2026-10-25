import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

const FAIL_LIMIT = 10;
const WINDOW_MS = 60_000;
const fails = new Map<string, number[]>();

// Returns a response to send back when the request is not allowed, or null when it may continue.
export function requirePasscode(req: Request): NextResponse | null {
  const pass = process.env.ADMIN_PASSCODE;
  if (!pass) {
    if (process.env.VERCEL) {
      return NextResponse.json(
        { error: "Changes are disabled until ADMIN_PASSCODE is set" },
        { status: 503 },
      );
    }
    return null; // local development without a passcode
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  const now = Date.now();
  if (fails.size > 1000) fails.clear();
  const recent = (fails.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= FAIL_LIMIT) {
    return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });
  }

  const given = req.headers.get("x-passcode") ?? "";
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(pass).digest();
  if (timingSafeEqual(a, b)) return null;

  recent.push(now);
  fails.set(ip, recent);
  return NextResponse.json({ error: "Passcode required" }, { status: 401 });
}