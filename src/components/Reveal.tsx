"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

export default function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 70, damping: 24, mass: 0.4 });
  const opacity = useTransform(p, [0, 0.28, 0.85, 1], [0, 1, 1, 0]);
  const y = useTransform(p, [0, 0.28, 0.85, 1], [50, 0, 0, -50]);

  return (
    <motion.div ref={ref} style={reduce ? undefined : { opacity, y }} className={className}>
      {children}
    </motion.div>
  );
}