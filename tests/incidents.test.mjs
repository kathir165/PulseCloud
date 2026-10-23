import test from "node:test";
import assert from "node:assert/strict";
import { deriveIncidents } from "../src/lib/incidents.ts";
import { explain } from "../src/lib/troubleshoot.ts";

const T = 1_000_000;
const site = (list) => ({
  url: "https://x.test/",
  history: list.map(([ok, ms, extra], i) => ({
    t: T + i * 1000,
    ok,
    status: ok ? 200 : null,
    ms: ok ? ms : null,
    ...extra,
  })),
});
const dns = { error: "DNS lookup failed" };

test("one ongoing failure is a single incident", () => {
  const inc = deriveIncidents(site([[true, 100], [false, 0, dns], [false, 0, dns], [false, 0, dns]]));
  assert.equal(inc.length, 1);
  assert.equal(inc[0].kind, "down");
  assert.equal(inc[0].checks, 3);
  assert.equal(inc[0].endT, null);
});

test("a healthy check records recovery", () => {
  const inc = deriveIncidents(site([[false, 0, dns], [false, 0, dns], [true, 100]]));
  assert.equal(inc.length, 1);
  assert.equal(inc[0].endT, T + 2000);
});

test("one slow blip is ignored, two in a row are an incident", () => {
  assert.equal(deriveIncidents(site([[true, 100], [true, 1500], [true, 100]])).length, 0);
  assert.equal(deriveIncidents(site([[true, 100], [true, 1500], [true, 1600], [true, 100]])).length, 1);
});

test("explanations use the real status or error", () => {
  const [a] = deriveIncidents(site([[false, 0, { status: 503 }]]));
  assert.match(explain(a).summary, /503/);
  const [b] = deriveIncidents(site([[false, 0, { error: "Timed out after 8 s" }]]));
  assert.match(explain(b).summary, /8 seconds/);
});