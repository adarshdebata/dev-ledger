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

/** `compact` is the small floating version used in the home hero: fewer rows, glass, fixed width. */
export function HeroWaterfall({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  const shown = compact ? rows.filter((r) => ["DNS", "TCP", "TLS", ""].includes(r.tag)).slice(0, 5) : rows;
  return (
    <div className={`self-start overflow-hidden rounded-2xl ${compact ? "glass w-[19rem] shadow-lift" : "border border-line bg-card"} ${className}`}>
      <div className={`flex items-center gap-3 border-b border-line ${compact ? "px-3.5 py-2" : "px-4 py-2.5"}`}>
        <span className="truncate font-mono text-[11.5px] text-muted">GET api.example.com/orders</span>
        <span className="ml-auto shrink-0 font-mono text-[11px] font-semibold text-ok">200 · {TOTAL - 3} ms</span>
      </div>

      <div className={compact ? "px-3.5 pt-3 pb-2.5" : "px-4 pt-4 pb-3"}>
        <p className="text-[13.5px] font-semibold">Where one click&apos;s time goes</p>
        <ol className={`${compact ? "mt-2.5 space-y-2" : "mt-3.5 space-y-2.5"}`} aria-label="Request timing waterfall">
          {shown.map((r, i) => (
            <li key={r.label} className={`grid items-center gap-2.5 ${compact ? "grid-cols-[7.4rem_1fr_2.2rem]" : "grid-cols-[8.2rem_1fr_2.4rem]"}`}>
              <span className={`truncate text-[12px] ${r.accent ? "font-semibold text-accent" : "text-muted"}`}>
                {r.label}
                {r.tag && <span className="ml-1.5 font-mono text-[10px] text-subtle">{r.tag}</span>}
              </span>
              <span className="relative h-1.5 rounded-full bg-bg-soft">
                <span
                  className={`animate-grow-x absolute inset-y-0 origin-left rounded-full motion-reduce:animate-none ${r.accent ? "bg-accent-soft" : "bg-teal-soft"}`}
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
        href="/posts/one-request-seven-stops/"
        className={`group flex items-center justify-between border-t border-line text-[12.5px] text-muted transition-colors hover:text-fg ${compact ? "px-3.5 py-2" : "px-4 py-2.5"}`}
      >
        <span>Each bar is a stop: learn to read them</span>
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
