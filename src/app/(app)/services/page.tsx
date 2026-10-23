import LiveServices from "@/components/LiveServices";
import ServiceList from "@/components/ServiceList";
import Reveal from "@/components/Reveal";

export default function Services() {
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Services</h1>
      <p className="mt-1 text-sm text-muted">Status of the websites you check.</p>

      <Reveal className="mt-6">
        <LiveServices />
      </Reveal>

      <Reveal className="mt-10">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-widest text-muted">Demo services</span>
          <span className="rounded-full border border-line px-3 py-1 font-mono text-xs text-muted">
            Simulated data
          </span>
        </div>
        <div className="mt-4">
          <ServiceList />
        </div>
      </Reveal>
    </div>
  );
}