/** Path data for the hawk, on a 64-unit grid, shared by the mark, favicon and share images. */
export const hawk = {
  head: "M48 32.6c-1 8.4-9.5 15-21 16.2-7.6.8-15.4 4-22 9.6 2.2-7.8 4-13.8 5.8-19l-5.2-3.8 6-3.6c-.2-9.4 3-16.6 10.4-19.6 5.4-2 13.4-2.2 20.4-.8l4 3.2-2.2 12.2Z",
  beak: "M44.8 15.2c6.4.4 11.8 2.4 14.8 6 2.6 3 2.4 7.8-.4 10.8-.2-1.8-1.2-3-2.8-3.2l-.2 1.4-7 1.4-5.6-3.2-3-2.8 3.8.6Z",
  brow: "M30 12.5 46 14.2 45 17.4 30.6 15.6Z",
  eye: { cx: 37.2, cy: 18.6, r: 4.7 },
  pupil: { cx: 38.4, cy: 19.4, r: 2.3 },
  glint: { cx: 39.2, cy: 18.6, r: 0.75 },
};

/**
 * Dev Ledger's hawk: a side profile with a flat brow over an amber eye, a hooked beak and a
 * neck that sweeps back into one long feather. The head takes currentColor (navy in light,
 * ivory in dark); the beak and eye use the terracotta accent.
 */
export function HawkMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path fill="currentColor" d={hawk.head} />
      <path fill="var(--accent-soft)" d={hawk.beak} />
      <circle {...hawk.eye} fill="var(--accent-soft)" />
      <path fill="currentColor" d={hawk.brow} />
      <circle {...hawk.pupil} fill="#141c2e" />
      <circle {...hawk.glint} fill="#fff8ee" />
    </svg>
  );
}

/** Mark plus the DEV LEDGER wordmark in mono. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <HawkMark className="size-9 shrink-0 text-fg" />
      <span className="font-mono text-[13px] leading-none font-semibold tracking-[0.18em] text-fg">DEV LEDGER</span>
    </span>
  );
}
