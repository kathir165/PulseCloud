import StatCard from "@/components/StatCard";
import TrafficChart from "@/components/TrafficChart";
import ServiceList from "@/components/ServiceList";
import SiteMonitor from "@/components/SiteMonitor";
import StatusHero from "@/components/StatusHero";
import LiveStats from "@/components/LiveStats";
import LiveChart from "@/components/LiveChart";
import Incidents from "@/components/Incidents";
import Reveal from "@/components/Reveal";

const demoStats = [
  { label: "Uptime", value: "99.98%", delta: "+0.02% this week", good: true },
  { label: "Avg latency", value: "142 ms", delta: "-8 ms vs yesterday", good: true },
  { label: "Requests / min", value: "24.6k", delta: "+12% vs last hour", good: true },
  { label: "Active alerts", value: "3", delta: "2 warning, 1 critical", good: false },
];

export default function Dashboard() {
  return (
    <div className="p-4 sm:p-6">
      <Reveal>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted">
          Real checks you run. The demo overview at the bottom is simulated.
        </p>
      </Reveal>

      <Reveal className="mt-4">
        <StatusHero />
      </Reveal>
      <Reveal className="mt-4">
        <LiveStats />
      </Reveal>
      <Reveal className="mt-4">
        <SiteMonitor />
      </Reveal>
      <Reveal className="mt-4">
        <LiveChart />
      </Reveal>
      <Reveal className="mt-4">
        <Incidents />
      </Reveal>

      <Reveal className="mt-10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-muted">Demo overview</span>
          <span className="rounded-full border border-line px-3 py-1 font-mono text-xs text-muted">
            Simulated data
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {demoStats.map((s, i) => (
            <StatCard key={s.label} {...s} index={i} />
          ))}
        </div>
      </Reveal>
      <Reveal className="mt-4">
        <TrafficChart />
      </Reveal>
      <Reveal className="mt-4">
        <ServiceList />
      </Reveal>
    </div>
  );
}