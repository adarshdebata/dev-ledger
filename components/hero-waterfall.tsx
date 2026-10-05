import Link from "next/link";
import { ArrowRight } from "lucide-react";

const TOTAL = 140;

/** Illustrative timings for one request, laid out like the browser's timing waterfall. */
const rows = [
  { label: "Find the server", tag: "DNS", start: 2, end: 14 },
  { label: "Connect", tag: "TCP", start: 14, end: 38 },
  { label: "Secure it", tag: "TLS", start: 38, end: 71 },
  { label: "Send request", tag: "HTTP", start: 71, end: 73 },
  { label: "Reach the app", tag: "proxy", start: 73, end: 84 },
  { label: "Server + database", tag: "", start: 84, end: 126 },
  { label: "Download reply", tag: "", start: 126, end: 135 },
  { label: "Safety check", tag: "CORS", start: 135, end: 137, accent: true },
];

export function HeroWaterfall() {
  return (
    <div className="self-start overflow-hidden rounded-2xl border border-line bg-card">
      <div className="flex items-center gap-3 border-b border-line px-4 py-2.5">
        <span className="truncate font-mono text-[11.5px] text-muted">GET api.example.com/orders</span>
        <span className="ml-auto shrink-0 font-mono text-[11px] font-semibold text-ok">200 · {TOTAL - 3} ms</span>
      </div>

      <div className="px-4 pt-4 pb-3">
        <p className="text-[13.5px] font-semibold">Where one click&apos;s time goes</p>
        <ol className="mt-3.5 space-y-2.5" aria-label="Request timing waterfall">
          {rows.map((r, i) => (
            <li key={r.label} className="grid grid-cols-[8.2rem_1fr_2.4rem] items-center gap-2.5">
              <span className={`truncate text-[12px] ${r.accent ? "font-semibold text-accent" : "text-muted"}`}>
                {r.label}
                {r.tag && <span className="ml-1.5 font-mono text-[10px] text-subtle">{r.tag}</span>}
              </span>
              <span className="relative h-1.5 rounded-full bg-bg-soft">
                <span
                  className={`animate-grow-x absolute inset-y-0 origin-left rounded-full ${r.accent ? "bg-accent-soft" : "bg-teal-soft"}`}
                  style={{
                    left: `${(r.start / TOTAL) * 100}%`,
                    width: `${Math.max(((r.end - r.start) / TOTAL) * 100, 2.4)}%`,
                    animationDelay: `${0.35 + i * 0.14}s`,
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
        <span>Each bar is a stop on the path</span>
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
