import dns from "node:dns";
import http from "node:http";
import https from "node:https";
import net from "node:net";

export const TIMEOUT_MS = 8000;
const MAX_REDIRECTS = 3;

export type CheckOutcome = {
  site: string;
  ok: boolean;
  status: number | null;
  ms: number | null;
  error?: string;
};

function isPrivateV4(ip: string) {
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) return isPrivateV4(ip);
  const v6 = ip.toLowerCase();
  if (v6 === "::" || v6 === "::1") return true;
  const dotted = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (dotted) return isPrivateV4(dotted[1]);
  const hex = v6.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hex) {
    const hi = parseInt(hex[1], 16);
    const lo = parseInt(hex[2], 16);
    return isPrivateV4(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
  }
  if (/^(f[c-f]|fe[89a-f])/.test(v6)) return true;
  if (v6.startsWith("64:ff9b:") || v6.startsWith("2002:")) return true;
  return false;
}

const guardedLookup: net.LookupFunction = (hostname, options, cb) => {
  dns.lookup(hostname, { ...options, all: true } as dns.LookupAllOptions, (err, addrs) => {
    if (err) return cb(err, "");
    if (addrs.length === 0 || addrs.some((a) => isPrivateIp(a.address))) {
      return cb(new Error("Blocked: address is private or reserved") as NodeJS.ErrnoException, "");
    }
    if (options.all) return cb(null, addrs);
    cb(null, addrs[0].address, addrs[0].family);
  });
};

export function parseTarget(raw: string): URL {
  if (raw.length > 2048) throw new Error("URL is too long");
  let input = raw.trim();
  if (!/^https?:\/\//i.test(input)) input = `https://${input}`;
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("That is not a valid URL");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only http and https are allowed");
  }
  if (url.username || url.password) throw new Error("URLs with credentials are not allowed");
  const port = url.port || (url.protocol === "https:" ? "443" : "80");
  if (port !== "80" && port !== "443") throw new Error("Only ports 80 and 443 are allowed");
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  const internalName =
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal") ||
    (!host.includes(".") && !host.includes(":"));
  if (internalName) throw new Error("Blocked: use a public website address");
  if (net.isIP(host) && isPrivateIp(host)) throw new Error("Blocked: address is private or reserved");
  return url;
}

function hop(url: URL, signal: AbortSignal): Promise<{ status: number; location?: string }> {
  return new Promise((resolve, reject) => {
    const lib = url.protocol === "https:" ? https : http;
    const req = lib.request(
      url,
      {
        method: "GET",
        lookup: guardedLookup,
        signal,
        timeout: TIMEOUT_MS,
        headers: { "user-agent": "PulseCloud-Check/0.1", accept: "*/*" },
      },
      (res) => {
        res.destroy();
        resolve({ status: res.statusCode ?? 0, location: res.headers.location });
      },
    );
    req.on("timeout", () => req.destroy(new Error("Timed out")));
    req.on("error", reject);
    req.end();
  });
}

function describe(e: unknown): string {
  const err = e as NodeJS.ErrnoException;
  if (err.name === "AbortError" || err.name === "TimeoutError" || err.message === "Timed out") {
    return "Timed out after 8 s";
  }
  if (err.code === "ENOTFOUND" || err.code === "EAI_AGAIN") return "DNS lookup failed";
  if (err.code === "ECONNREFUSED") return "Connection refused";
  if (err.code === "ECONNRESET") return "Connection reset";
  if (/CERT|SELF_SIGNED|UNABLE_TO_VERIFY/i.test(err.code ?? "")) return "TLS certificate error";
  return (err.message || "Request failed").slice(0, 120);
}

export async function runCheck(rawUrl: string): Promise<CheckOutcome> {
  const first = parseTarget(rawUrl);
  const site = first.href;
  const signal = AbortSignal.timeout(TIMEOUT_MS);
  const started = performance.now();
  let current = first;
  try {
    for (let i = 0; i <= MAX_REDIRECTS; i++) {
      const { status, location } = await hop(current, signal);
      if (status >= 300 && status < 400 && location) {
        if (i === MAX_REDIRECTS) throw new Error("Too many redirects");
        current = parseTarget(new URL(location, current).href);
        continue;
      }
      return { site, ok: status < 400, status, ms: Math.round(performance.now() - started) };
    }
  } catch (e) {
    return { site, ok: false, status: null, ms: null, error: describe(e) };
  }
  return { site, ok: false, status: null, ms: null, error: "Request failed" };
}