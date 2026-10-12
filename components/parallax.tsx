"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * Drifts its content down by up to `distance` px over the first 800 px of scrolling, so a background
 * layer moves slower than the text over it. Transform only; nothing moves under reduced motion.
 */
export function Parallax({ children, distance = 90, className }: { children?: React.ReactNode; distance?: number; className?: string }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, distance], { clamp: true });
  // Always pass a transform, so the server's markup and the browser's first render match.
  return (
    <motion.div aria-hidden="true" className={className} style={{ y: reduce ? 0 : y }}>
      {children}
    </motion.div>
  );
}
