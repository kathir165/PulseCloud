import { runCheck, TIMEOUT_MS, type CheckOutcome } from "@/lib/safeFetch";

const MAX_ATTEMPTS = 3;
const RETRY_DELAYS = [1000, 2000];
const BUDGET_MS = 20_000;

export type VerifiedOutcome = CheckOutcome & { attempts: number };

function retryable(r: CheckOutcome) {
  if (r.ok) return false;
  if (r.status !== null) return r.status >= 500 || r.status === 408 || r.status === 429;
  return !/certificate|blocked|redirect/i.test(r.error ?? "");
}

export async function verifiedCheck(rawUrl: string): Promise<VerifiedOutcome> {
  const started = Date.now();
  let result = await runCheck(rawUrl);
  let attempts = 1;
  while (attempts < MAX_ATTEMPTS && retryable(result)) {
    const delay = RETRY_DELAYS[attempts - 1];
    if (Date.now() - started + delay + TIMEOUT_MS > BUDGET_MS) break;
    await new Promise((r) => setTimeout(r, delay));
    result = await runCheck(rawUrl);
    attempts++;
  }
  return { ...result, attempts };
}