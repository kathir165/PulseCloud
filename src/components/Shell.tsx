"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useSites } from "@/components/SitesProvider";
import SidebarContent from "@/components/SidebarContent";

const titles: Record<string, string> = {
  "/dashboard": "Overview",
  "/services": "Services",
  "/alerts": "Alerts",
  "/settings": "Settings",
  "/profile": "Profile",
};

function LogoDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:animate-none" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
    </span>
  );
}

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { sites, loaded } = useSites();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const close = () => setOpenPath(null);
  const current = titles[pathname] ?? "Overview";

  const n = sites.length;
  const down = sites.filter((s) => !s.history[s.history.length - 1]?.ok).length;
  const status = !loaded
    ? { text: "Loading…", dot: "bg-muted" }
    : n === 0
      ? { text: "No sites checked", dot: "bg-muted" }
      : down === 0
        ? { text: n === 1 ? "1 site up" : `All ${n} sites up`, dot: "bg-accent" }
        : { text: `${down} of ${n} down`, dot: "bg-red-400" };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenPath(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-navy-900 md:sticky md:top-0 md:flex md:h-screen md:self-start">
        <Link href="/" className="flex h-14 shrink-0 items-center gap-2 border-b border-line px-5">
          <LogoDot />
          <span className="font-semibold tracking-tight">PulseCloud</span>
        </Link>
        <SidebarContent pathname={pathname} idPrefix="side" />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-line bg-navy-900/60 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setOpenPath(pathname)}
              aria-label="Open menu"
              className="-ml-1 rounded-md p-2 text-fg transition hover:bg-graphite-800"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M3 5h14M3 10h14M3 15h14" />
              </svg>
            </button>
            <span className="font-semibold tracking-tight">{current}</span>
          </div>
          <span className="hidden text-sm font-medium md:block">{current}</span>
          <span className="flex items-center gap-2 rounded-full border border-line px-3 py-1 font-mono text-xs text-muted">
            <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
            {status.text}
          </span>
        </header>
        <div className="flex-1">{children}</div>
      </div>

      <MotionConfig reducedMotion="user">
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                key="scrim"
                className="fixed inset-0 z-40 bg-navy-950/70 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={close}
              />
              <motion.aside
                key="drawer"
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
                className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col border-r border-line bg-navy-900 md:hidden"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={{ left: 0.4, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80 || info.velocity.x < -400) close();
                }}
              >
                <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5">
                  <Link href="/" onClick={close} className="flex items-center gap-2">
                    <LogoDot />
                    <span className="font-semibold tracking-tight">PulseCloud</span>
                  </Link>
                  <button
                    onClick={close}
                    aria-label="Close menu"
                    className="rounded-md p-2 text-muted transition hover:text-fg"
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                      <path d="M4 4l10 10M14 4L4 14" />
                    </svg>
                  </button>
                </div>
                <SidebarContent pathname={pathname} idPrefix="drawer" onNavigate={close} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </MotionConfig>
    </div>
  );
}