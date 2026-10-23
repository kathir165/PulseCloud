import LiveAlerts from "@/components/LiveAlerts";
import Reveal from "@/components/Reveal";

const demo = [
  { id: 1, level: "critical", title: "Queue Workers unreachable", source: "eu-central-1", time: "4 min ago" },
  { id: 2, level: "warning", title: "Database Cluster latency above 150 ms", source: "us-east-1", time: "18 min ago" },
  { id: 3, level: "resolved", title: "API Gateway latency spike", source: "us-east-1", time: "3 hr ago" },
];

const badge = {
  critical: "border-red-400/40 text-red-400",
  warning: "border-amber-400/40 text-amber-400",
  resolved: "border-line text-muted",
};

export default function Alerts() {
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Alerts</h1>
      <p className="mt-1 text-sm text-muted">Failed and slow checks from your websites.</p>

      <Reveal className="mt-6">
        <LiveAlerts />
      </Reveal>

      <Reveal className="mt-10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-muted">Demo alerts</span>
          <span className="rounded-full border border-line px-3 py-1 font-mono text-xs text-muted">
            Simulated data
          </span>
        </div>
        <div className="mt-4 rounded-xl border border-line bg-graphite-800/75">
          <ul className="divide-y divide-line">
            {demo.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
                <div className="min-w-0">
                  <p className="truncate text-fg">{a.title}</p>
                  <p className="mt-1 font-mono text-xs text-muted">
                    {a.source} · {a.time}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-3 py-1 font-mono text-xs capitalize ${badge[a.level]}`}
                >
                  {a.level}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </div>
  );
}