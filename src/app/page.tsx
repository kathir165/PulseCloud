import NetworkScene from "@/components/NetworkScene";
import Features from "@/components/Features";
import RotateToggle from "@/components/RotateToggle";

export default function Home() {
  return (
    <>
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-navy-950 px-6 relative isolate overflow-hidden">
            <div className="pointer-events-none fixed inset-0 -z-10">
                <NetworkScene hero />
        <div className="absolute inset-0 bg-navy-950/50 md:bg-navy-950/30" />
      </div>
      <span className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
        System online
      </span>
      <h1 className="text-5xl font-semibold tracking-tight text-fg">PulseCloud</h1>
      <p className="text-muted">Cloud monitoring, in real time.</p>
            <span className="mt-10 font-mono text-xs uppercase tracking-[0.3em] text-muted">
        Scroll
      </span>
    </main>
    <Features />
    <RotateToggle />
    </>
  );
}