"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { MotionConfig, motion } from "motion/react";
import Avatar from "@/components/Avatar";
import { useSites } from "@/components/SitesProvider";
import { useProfile } from "@/lib/profileStore";

type Item = { label: string; href: string; icon: ReactNode };

const icon = (d: ReactNode) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const top: Item[] = [
  { label: "Overview", href: "/dashboard", icon: icon(<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />) },
  {
    label: "Services",
    href: "/services",
    icon: icon(
      <>
        <path d="M4 6h16v5H4zM4 13h16v5H4z" />
        <path d="M8 8.5h.01M8 15.5h.01" />
      </>,
    ),
  },
  {
    label: "Alerts",
    href: "/alerts",
    icon: icon(
      <>
        <path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z" />
        <path d="M10 20a2 2 0 0 0 4 0" />
      </>,
    ),
  },
];

const bottom: Item[] = [
  {
    label: "Settings",
    href: "/settings",
    icon: icon(
      <>
        <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
        <circle cx="16" cy="7" r="2" />
        <circle cx="8" cy="17" r="2" />
      </>,
    ),
  },
];

function NavItem({
  item,
  active,
  idPrefix,
  onNavigate,
}: {
  item: Item;
  active: boolean;
  idPrefix: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
        active ? "text-accent" : "text-muted hover:bg-graphite-800/60 hover:text-fg"
      }`}
    >
      {active && (
        <motion.span
          layoutId={`${idPrefix}-active`}
          className="absolute inset-0 rounded-md bg-graphite-800 shadow-[inset_2px_0_0_0_#22d3ee]"
          transition={{ type: "spring", stiffness: 400, damping: 34 }}
        />
      )}
      <span className="relative transition-transform duration-200 group-hover:translate-x-0.5">{item.icon}</span>
      <span className="relative">{item.label}</span>
    </Link>
  );
}

function LiveCard() {
  const { sites, loaded } = useSites();
  const n = sites.length;
  const last = sites.map((s) => s.history[s.history.length - 1]);
  const down = last.filter((c) => !c.ok).length;
  const ms = last.map((c) => c.ms).filter((m): m is number => m !== null);
  const avg = ms.length ? Math.round(ms.reduce((a, b) => a + b, 0) / ms.length) : null;

  const tone = !loaded
    ? { dot: "bg-muted", text: "Loading…" }
    : n === 0
      ? { dot: "bg-muted", text: "No sites yet" }
      : down === 0
        ? { dot: "bg-accent", text: n === 1 ? "1 site up" : `${n} sites up` }
        : { dot: "bg-red-400", text: `${down} of ${n} down` };

  return (
    <div className="mx-3 mt-2 rounded-lg border border-line bg-graphite-800/60 p-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Live</span>
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 motion-reduce:animate-none ${tone.dot}`} />
          <span className={`relative inline-flex h-2 w-2 rounded-full ${tone.dot}`} />
        </span>
      </div>
      <p className="mt-2 text-sm text-fg">{tone.text}</p>
      <p className="mt-0.5 font-mono text-xs text-muted">{avg === null ? "Add a site to begin" : `${avg} ms avg`}</p>
    </div>
  );
}

function ProfileCard({ active, onNavigate }: { active: boolean; onNavigate?: () => void }) {
  const p = useProfile();
  return (
    <Link
      href="/profile"
      onClick={onNavigate}
      className={`group mt-1 flex items-center gap-3 rounded-lg border p-2.5 transition ${
        active ? "border-accent/50 bg-graphite-800" : "border-line hover:border-accent/40 hover:bg-graphite-800/60"
      }`}
    >
      <Avatar src={p.avatar} name={p.name} className="h-10 w-10" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-fg">{p.name || "Set up profile"}</span>
        <span className="block truncate font-mono text-xs text-muted">{p.role || "Add your details"}</span>
      </span>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-accent"
      >
        <path d="M6 3l5 5-5 5" />
      </svg>
    </Link>
  );
}

export default function SidebarContent({
  pathname,
  idPrefix,
  onNavigate,
}: {
  pathname: string;
  idPrefix: string;
  onNavigate?: () => void;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-0 flex-1 flex-col">
        <nav className="flex flex-col gap-1 p-3 pb-1">
          {top.map((item) => (
            <NavItem key={item.href} item={item} active={item.href === pathname} idPrefix={idPrefix} onNavigate={onNavigate} />
          ))}
        </nav>
        <LiveCard />
        <div className="mt-auto flex flex-col gap-1 border-t border-line p-3">
          {bottom.map((item) => (
            <NavItem key={item.href} item={item} active={item.href === pathname} idPrefix={idPrefix} onNavigate={onNavigate} />
          ))}
          <ProfileCard active={pathname === "/profile"} onNavigate={onNavigate} />
        </div>
      </div>
    </MotionConfig>
  );
}