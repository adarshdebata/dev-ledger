/**
 * Dev Ledger's falcon: a geometric peregrine head, facing right. Flat crown, a brow that
 * cuts across the eye, the peregrine's cheek stripe, and an open beak that doubles as a
 * ">" prompt. The head takes currentColor; the beak uses the terracotta accent.
 */
export function FalconMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M5.5 29 7 15.5 12.5 7.5 19.5 5.5l5 2.6 1.6 2.6-.9 1.9-3.5 1-.6 6-1.3 4-1.4-4-.7-4-4.6 4.3L11.5 29ZM18.1 10.1l4.2-.8a2.15 2.15 0 0 1-4.2.8Z"
      />
      <path
        d="M26.3 10.6l4.3 4.5-3.9 4"
        fill="none"
        stroke="var(--accent-soft)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

/** Mark plus the DEV LEDGER wordmark in mono. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <FalconMark className="size-7 shrink-0 text-fg" />
      <span className="font-mono text-[13px] leading-none font-semibold tracking-[0.18em] text-fg">DEV LEDGER</span>
    </span>
  );
}
