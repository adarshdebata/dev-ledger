"use client";

import { useEffect } from "react";

/** Which kind of reveal each part of an article gets. Paragraphs never move: they're for reading. */
const kinds: [selector: string, kind: string][] = [
  [":scope > h2, :scope > h3", "up"],
  [":scope > figure:not(.code-block), :scope > .not-prose:not(.code-block), :scope > aside, :scope > [data-pagefind-ignore]", "scale"],
  [":scope > p > img, :scope > img", "mask"],
  [":scope > .code-block", "fast"],
];

/**
 * Gentle reveals as article content scrolls into view: headings rise a little, diagrams
 * settle from 98% scale, images unmask, code appears almost at once. Content stays fully
 * visible without JavaScript and for readers who prefer reduced motion.
 */
export function RevealOnScroll({ root = "[data-reveal-root]" }: { root?: string }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const container = document.querySelector(root);
    if (!container) return;

    for (const [selector, kind] of kinds) {
      container.querySelectorAll(selector).forEach((el) => {
        if (!el.hasAttribute("data-reveal")) el.setAttribute("data-reveal", kind);
      });
    }
    // Collect every tagged element, not just newly tagged ones, so a re-mount (or React's
    // development double-run of effects) observes them again instead of leaving them hidden.
    const targets = [...container.querySelectorAll("[data-reveal]")];

    // Anything already on screen is shown straight away, so nothing flashes on load.
    for (const el of targets) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-revealed");
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-revealed");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    targets.filter((el) => !el.classList.contains("is-revealed")).forEach((el) => io.observe(el));
    document.documentElement.classList.add("reveal-ready");

    return () => {
      io.disconnect();
      document.documentElement.classList.remove("reveal-ready");
    };
  }, [root]);

  return null;
}
