"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

type Pos = { left: number; top: number; width: number; below: boolean; arrow: number };

/**
 * A keyword with a definition card: hover with a mouse, tap on touch screens,
 * or focus with the keyboard. Rendered in a portal so nothing can clip it.
 */
export function TermTip({ term, def, children }: { term: string; def: string; children: React.ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);
  const lastPointer = useRef<string>("mouse");
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const id = useId();

  const place = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = Math.min(300, window.innerWidth - 24);
    const left = Math.min(Math.max(r.left + r.width / 2 - width / 2, 12), window.innerWidth - width - 12);
    const below = r.top < 190;
    setPos({ left, top: below ? r.bottom + 10 : r.top - 10, width, below, arrow: r.left + r.width / 2 - left });
  }, []);

  useEffect(() => {
    if (!open) return;
    place();
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== "Escape") return;
      if (e instanceof PointerEvent && ref.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
    window.addEventListener("keydown", close);
    window.addEventListener("pointerdown", close);
    return () => {
      window.removeEventListener("scroll", place);
      window.removeEventListener("resize", place);
      window.removeEventListener("keydown", close);
      window.removeEventListener("pointerdown", close);
    };
  }, [open, place]);

  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onPointerDown={(e) => (lastPointer.current = e.pointerType)}
        onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
        // Only keyboard focus opens it here; taps toggle through onClick, hover through pointer events.
        onFocus={(e) => e.currentTarget.matches(":focus-visible") && setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => lastPointer.current !== "mouse" && setOpen((o) => !o)}
        className="cursor-help rounded-sm font-[inherit] text-inherit underline decoration-accent-soft/80 decoration-dotted decoration-[1.5px] underline-offset-[5px] transition-colors hover:bg-accent-tint hover:decoration-solid"
      >
        {children}
      </button>
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && pos && (
              <motion.div
                id={id}
                role="tooltip"
                initial={{ opacity: 0, y: pos.below ? -6 : 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="glass pointer-events-none fixed z-[60] rounded-xl px-4 py-3 text-left shadow-lift"
                style={{
                  left: pos.left,
                  top: pos.top,
                  width: pos.width,
                  translate: pos.below ? "0 0" : "0 -100%",
                }}
              >
                <span className="block font-mono text-[11px] font-semibold tracking-[0.14em] text-accent uppercase">{term}</span>
                <span className="mt-1.5 block text-[14px] leading-relaxed text-fg">{def}</span>
                <span
                  aria-hidden="true"
                  className={`absolute size-3 rotate-45 border-line-strong bg-bg ${
                    pos.below ? "-top-[6.5px] border-t border-l" : "-bottom-[6.5px] border-r border-b"
                  }`}
                  style={{ left: Math.min(Math.max(pos.arrow - 6, 14), pos.width - 26) }}
                />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
