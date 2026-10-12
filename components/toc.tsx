"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import type { TocItem } from "@/lib/mdx";

export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });
  return <motion.div className="bg-brand fixed inset-x-0 top-0 z-50 h-[3px] origin-left" style={{ scaleX }} aria-hidden="true" />;
}

/** Id of the last heading that has scrolled past the top of the viewport. */
function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 140) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [ids]);
  return active;
}

/**
 * Marks <html data-wide-in-view> while a figure that's wider than the reading column is on screen,
 * so the table of contents beside the column can step aside (see [data-toc-panel] in globals.css).
 */
function useStepAsideForWideFigures() {
  useEffect(() => {
    const figures = document.querySelectorAll<HTMLElement>("[data-wide]");
    if (figures.length === 0) return;
    const visible = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          const wide = el.offsetWidth > (el.parentElement?.offsetWidth ?? Infinity) + 1;
          if (e.isIntersecting && wide) visible.add(el);
          else visible.delete(el);
        }
        document.documentElement.toggleAttribute("data-wide-in-view", visible.size > 0);
      },
      { rootMargin: "-120px 0px 0px 0px" },
    );
    figures.forEach((f) => io.observe(f));
    return () => {
      io.disconnect();
      document.documentElement.removeAttribute("data-wide-in-view");
    };
  }, []);
}

export function Toc({ items }: { items: TocItem[] }) {
  const ids = useRef(items.map((i) => i.id)).current;
  const active = useActiveHeading(ids);
  useStepAsideForWideFigures();
  const list = useRef<HTMLOListElement>(null);
  const [marker, setMarker] = useState({ top: 0, height: 0 });

  useEffect(() => {
    const el = list.current?.querySelector<HTMLElement>(`[data-id="${CSS.escape(active ?? "")}"]`);
    if (el) setMarker({ top: el.offsetTop, height: el.offsetHeight });
  }, [active]);

  return (
    <nav aria-label="On this page" className="text-[13px]">
      <p className="mb-3 text-xs font-semibold tracking-wider text-subtle uppercase">On this page</p>
      <div className="relative">
        <span className="absolute top-0 bottom-0 left-0 w-px bg-line" aria-hidden="true" />
        <span
          className="bg-brand absolute left-0 w-[2px] rounded-full transition-all duration-300 ease-out"
          style={{ top: marker.top, height: marker.height }}
          aria-hidden="true"
        />
        <ol ref={list} className="space-y-0.5">
          {items.map((i) => (
            <li key={i.id} data-id={i.id}>
              <a
                href={`#${i.id}`}
                className={`block py-1 leading-snug transition-colors ${i.depth === 3 ? "pl-7" : "pl-4"} ${
                  active === i.id ? "font-medium text-fg" : "text-muted hover:text-fg"
                }`}
              >
                {i.text}
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
