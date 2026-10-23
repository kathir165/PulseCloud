import type { Incident } from "@/lib/incidents";

export type Guide = { summary: string; steps: string[]; evidence: string };

const BROWSER = "Open the site in your browser to see whether it loads for you too.";
const HOST = "Check your hosting dashboard for restarts, deployments or alerts around that time.";
const LOGS = "Look at the server's error logs from the same time.";
const RECHECK = "Run another check in a few minutes to see whether it was a one-off.";

export function explain(i: Incident): Guide {
  const c = i.worst;
  const tries = c.attempts && c.attempts > 1 ? ` · confirmed after ${c.attempts} attempts` : "";

  if (i.kind === "slow") {
    const ms = c.ms ?? 0;
    const ratio = i.typicalMs ? Math.round((ms / i.typicalMs) * 10) / 10 : null;
    return {
      summary: `The site answered, but slowly: ${ms} ms${ratio ? `, about ${ratio}× its usual ${i.typicalMs} ms` : ""}. Slow responses are often caused by heavy traffic, a busy database, a server waking up from sleep, or a slow service the site depends on.`,
      steps: [
        "Open the site and see whether it feels slow to you too.",
        "Check server load (CPU and memory) and database speed around that time.",
        "On free or sleeping hosting plans, the first request after idle time can be slow.",
        RECHECK,
      ],
      evidence: `Slowest check in this period: ${ms} ms`,
    };
  }

  const s = c.status;
  const e = c.error ?? "";
  const evidence = `Last result: ${s ? `HTTP ${s}` : e || "no response"}${tries}`;
  const g = (summary: string, steps: string[]): Guide => ({ summary, steps, evidence });

  if (s === 503)
    return g(
      "The server said it is temporarily unavailable (HTTP 503). That usually means it is overloaded, restarting, or in maintenance.",
      [HOST, "Check CPU and memory use at that time.", RECHECK],
    );
  if (s === 502 || s === 504)
    return g(
      `A gateway in front of the site could not get a good answer from the actual server (HTTP ${s}). The app behind it may be down, restarting, or too slow.`,
      [HOST, "Make sure the app process is running.", LOGS],
    );
  if (s && s >= 500)
    return g(
      `The site's server hit an internal error (HTTP ${s}). It is reachable, but something in its code or a service it depends on failed.`,
      [LOGS, "Check whether something was deployed or changed just before.", "Make sure its database and other services are running."],
    );
  if (s === 401 || s === 403)
    return g(
      `The server refused the request (HTTP ${s}). The page may need a login, or the site may block automated requests even though it works for people.`,
      [BROWSER, "If you own the site, check firewall or bot-protection rules that might block monitoring.", "Monitor a public page, such as the home page or a health check address."],
    );
  if (s === 404)
    return g(
      "The server is running but could not find this address (HTTP 404). The page may have moved or been removed, or the address may have a typo.",
      ["Check the address for typos.", BROWSER, "If the site was recently changed or redeployed, check that this page still exists."],
    );
  if (s === 429)
    return g("The site is limiting how often it accepts requests (HTTP 429).", [
      "Wait a while and check again.",
      "If you own the site, allow monitoring requests in its rate-limit settings.",
    ]);
  if (s)
    return g(`The server rejected the request (HTTP ${s}).`, [
      BROWSER,
      "Look up what this status code means for the site's server or hosting service.",
      HOST,
    ]);

  if (/timed out/i.test(e))
    return g(
      "The site did not answer within 8 seconds. It may be overloaded or stuck, or something between PulseCloud and the site may be dropping the traffic.",
      [BROWSER, "Check that the app is running and look at CPU and memory use.", "Try the address from another network or device.", RECHECK],
    );
  if (/dns/i.test(e))
    return g(
      "The domain name could not be looked up, so PulseCloud never reached a server. Common reasons are a typo in the address, an expired or removed domain, or a DNS problem at the domain's provider.",
      ["Check the spelling of the address.", "Look the domain up at your registrar to confirm it has not expired.", "Check the DNS records at your DNS provider.", "Try the address from another network or device."],
    );
  if (/refused/i.test(e))
    return g(
      "The computer was reachable, but nothing accepted the connection. The web service may have stopped or crashed, or the address may point to the wrong port.",
      [HOST, "Confirm the web server or app process is running.", "Check firewall and port settings."],
    );
  if (/reset/i.test(e))
    return g(
      "The connection was cut off in the middle. That can happen when the server or a proxy crashes or restarts, or when a firewall closes the connection.",
      [LOGS, HOST, RECHECK],
    );
  if (/certificate|tls/i.test(e))
    return g(
      "The site's security certificate could not be verified, so the secure connection was refused. Typical reasons are an expired certificate, a name mismatch, or a missing intermediate certificate.",
      ["Open the site in a browser and read the certificate warning.", "Check the certificate's expiry date and renew it if needed.", "Make sure it covers the exact domain name being checked."],
    );
  if (/redirect/i.test(e))
    return g(
      "The site kept redirecting without ever reaching a page (PulseCloud follows at most 3 redirects). A misconfigured redirect rule or an http/https loop is a common cause.",
      ["Open it in a browser and watch the address bar for a loop.", "Check redirect rules such as www, http to https, and trailing slashes."],
    );
  if (/blocked/i.test(e))
    return g(
      "PulseCloud refused to follow this address because it points to a private or internal network. This is a safety rule, not an outage.",
      ["Use the site's public address.", "Check whether the site redirects to an internal address."],
    );
  return g(`The check failed with "${e || "no response"}". From the outside, PulseCloud cannot tell more than that.`, [BROWSER, HOST, RECHECK]);
}