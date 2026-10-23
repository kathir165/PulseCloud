
import Shell from "@/components/Shell";
import NetworkScene from "@/components/NetworkScene";
import { SitesProvider } from "@/components/SitesProvider";
import NodeLegend from "@/components/NodeLegend";
import RotateToggle from "@/components/RotateToggle";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SitesProvider>
      <>
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <NetworkScene />
          <div className="absolute inset-0 bg-navy-950/55 md:bg-navy-950/30" />
        </div>
        <Shell>{children}</Shell>
        <NodeLegend />
        <RotateToggle />
      </>
    </SitesProvider>
  );
}
