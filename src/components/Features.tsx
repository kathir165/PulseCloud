"use client";

import Link from "next/link";
import { MotionConfig, motion, type Variants } from "motion/react";
import Showcase from "@/components/Showcase";

const items = [
  { title: "Real-time metrics", text: "Latency, throughput and uptime across every region." },
  { title: "Instant alerts", text: "Know about degraded services before your users do." },
  { title: "One clear view", text: "Every service, one dashboard, no noise." },
];

const group: Variants = {
  hidden: { transition: { staggerChildren: 0.08, staggerDirection: -1 } },
  visible: { transition: { staggerChildren: 0.35, delayChildren: 0.4 } },
};

const pop: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.94, transition: { duration: 0.4 } },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

const buttonPop: Variants = {
  hidden: { opacity: 0, scale: 0.6, transition: { duration: 0.3 } },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 180, damping: 14 },
  },
};

export default function Features() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="relative z-10">
        <motion.section
          variants={group}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.35 }}
          className="mx-auto grid max-w-5xl gap-4 px-6 pb-16 pt-24 md:grid-cols-3"
        >
          {items.map((it) => (
            <motion.div
              key={it.title}
              variants={pop}
              className="rounded-xl border border-line bg-graphite-800/80 p-6 backdrop-blur"
            >
              <h3 className="font-semibold text-fg">{it.title}</h3>
              <p className="mt-2 text-sm text-muted">{it.text}</p>
            </motion.div>
          ))}
        </motion.section>
        <Showcase />

        <motion.section
          variants={group}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.6 }}
          className="flex flex-col items-center gap-6 px-6 pb-40 pt-16 text-center"
        >
          <motion.h2 variants={pop} className="text-3xl font-semibold tracking-tight text-fg">
            Ready to see it live?
          </motion.h2>
          <div className="flex items-center gap-3">
            <motion.div variants={buttonPop}>
              <Link
                href="/dashboard"
                className="block rounded-full bg-accent px-4 py-2 text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-navy-950 transition hover:brightness-110"
              >
                Open Dashboard
              </Link>
            </motion.div>
            <motion.div variants={buttonPop}>
              <a
                href="#"
                className="block rounded-full border border-line px-4 py-2 text-xs sm:px-6 sm:py-3 sm:text-sm font-medium text-fg transition hover:border-accent hover:text-accent"
              >
                Documentation
              </a>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </MotionConfig>
  );
}