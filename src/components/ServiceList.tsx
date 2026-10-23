const services = [
  { name: "API Gateway", region: "us-east-1", latency: "92 ms", status: "operational" },
  { name: "Auth Service", region: "eu-west-1", latency: "118 ms", status: "operational" },
  { name: "Database Cluster", region: "us-east-1", latency: "164 ms", status: "degraded" },
  { name: "Object Storage", region: "ap-south-1", latency: "201 ms", status: "operational" },
  { name: "Queue Workers", region: "eu-central-1", latency: "n/a", status: "down" },
] as const;

const dot = {
  operational: "bg-accent",
  degraded: "bg-amber-400",
  down: "bg-red-400",
};

export default function ServiceList() {
  return (
    <div className="rounded-xl border border-line bg-graphite-800/75">
      <p className="border-b border-line px-4 py-4 font-mono text-xs uppercase tracking-widest text-muted sm:px-5">
        Services
      </p>
      <ul className="divide-y divide-line">
        {services.map((s) => (
          <li key={s.name} className="flex items-center justify-between gap-3 px-4 py-3.5 text-sm sm:px-5">
            <span className="flex min-w-0 items-center gap-3">
              <span className={`h-2 w-2 shrink-0 rounded-full ${dot[s.status]}`} />
              <span className="truncate text-fg">{s.name}</span>
            </span>
            <span className="flex shrink-0 items-center gap-3 font-mono text-xs text-muted sm:gap-6">
              <span className="hidden sm:inline">{s.region}</span>
              <span className="sm:w-14 sm:text-right">{s.latency}</span>
              <span className="capitalize sm:w-20 sm:text-right">{s.status}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}