import Link from "next/link";
import { ArrowRight } from "lucide-react";

const TOTAL = 140;

/** Illustrative timings for one request, laid out like DevTools' timing waterfall. */
const rows = [
  { label: "DNS lookup", start: 2, end: 14 },
  { label: "TCP connect", start: 14, end: 38 },
  { label: "TLS handshake", start: 38, end: 71 },
  { label: "Request sent", start: 71, end: 73 },
  { label: "Proxy → Node.js", start: 73, end: 84 },
  { label: "Auth + database", start: 84, end: 126 },
  { label: "Content download", start: 126, end: 135 },
  { label: "CORS check", start: 135, end: 137, accent: true },
];

export function HeroWaterfall() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(closest-side,rgba(139,92,246,0.18),transparent)]" />
      <div className="relative overflow-hidden rounded-2xl border border-line bg-card/85 shadow-lift backdrop-blur">
        <div className="flex items-center gap-3 border-b border-line bg-bg-soft/70 px-4 py-2.5">
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-[#ff5f57]/80" />
            <span className="size-2.5 rounded-full bg-[#febc2e]/80" />
            <span className="size-2.5 rounded-full bg-[#28c840]/80" />
          </span>
          <span className="truncate font-mono text-[11.5px] text-muted">GET api.example.com/orders</span>
          <span className="ml-auto shrink-0 rounded-md bg-ok-tint px-1.5 py-0.5 font-mono text-[10.5px] font-semibold text-ok">
            200 · {TOTAL - 3} ms
          </span>
        </div>

        <div className="px-4 pt-4 pb-3">
          <p className="text-[13px] font-semibold">Where one request&apos;s time actually goes</p>
          <ol className="mt-3 space-y-2" aria-label="Request timing waterfall">
            {rows.map((r, i) => (
              <li key={r.label} className="grid grid-cols-[7.4rem_1fr_2.4rem] items-center gap-2.5">
                <span className={`truncate text-[12px] ${r.accent ? "font-semibold text-accent" : "text-muted"}`}>{r.label}</span>
                <span className="relative h-2.5 rounded-full bg-bg-soft">
                  <span
                    className={`animate-grow-x absolute inset-y-0 origin-left rounded-full ${r.accent ? "bg-accent-soft" : "bg-brand"}`}
                    style={{
                      left: `${(r.start / TOTAL) * 100}%`,
                      width: `${Math.max(((r.end - r.start) / TOTAL) * 100, 2.2)}%`,
                      animationDelay: `${0.35 + i * 0.16}s`,
                      opacity: r.accent ? 1 : 0.55 + (i / rows.length) * 0.45,
                    }}
                  />
                </span>
                <span className="text-right font-mono text-[10.5px] text-subtle tabular-nums">{r.end - r.start} ms</span>
              </li>
            ))}
          </ol>
        </div>

        <Link
          href="/chains/request/"
          className="group flex items-center justify-between border-t border-line px-4 py-2.5 text-[12.5px] text-muted transition-colors hover:text-fg"
        >
          <span>Every bar is a stop on Follow One Request</span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
