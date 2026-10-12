import type { PostMeta, Thumb } from "@/lib/posts";

/**
 * Small animated SVG thumbnails in the theme's colours. They sit still until the card around them
 * (a `.group`) is hovered or focused, and never move under reduced motion. See ".thumb" in globals.css.
 */
export type Motif = Thumb | "deps";

export function thumbFor(post: Pick<PostMeta, "thumb" | "tags">): Motif {
  if (post.thumb) return post.thumb;
  if (post.tags.includes("cors")) return "origins";
  if (post.tags.includes("security")) return "shield";
  return "journey";
}

const STOPS = [14, 36, 58, 80, 102, 124, 146];

const MOTIFS: Record<Motif, React.ReactNode> = {
  // A request travelling through seven stops, with its timing waterfall underneath.
  journey: (
    <>
      <line x1="14" y1="34" x2="146" y2="34" className="stroke-line-strong" strokeWidth="1.5" />
      {STOPS.map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy="34"
          r="4.5"
          strokeWidth="1.5"
          className={`fill-card ${i === 0 ? "stroke-line-strong" : i < 4 ? "stroke-teal-soft" : i < 6 ? "stroke-accent-soft" : "stroke-fg"}`}
        />
      ))}
      <circle cx="14" cy="34" r="3" className="thumb-packet fill-accent-soft" />
      {(
        [
          [14, 26, "fill-line-strong"],
          [40, 44, "fill-teal-soft"],
          [84, 52, "fill-accent-soft"],
          [136, 10, "fill-fg/45"],
        ] as const
      ).map(([x, w, c], i) => (
        <rect key={x} x={x} y={52 + i * 10} width={w} height="5" rx="2.5" className={`thumb-grow ${c}`} style={{ animationDelay: `${i * 0.22}s` }} />
      ))}
    </>
  ),
  // Two origins; the answer crossing between them is stopped at the gate.
  origins: (
    <>
      {[10, 98].map((x) => (
        <g key={x}>
          <rect x={x} y="22" width="52" height="56" rx="6" strokeWidth="1.5" className="fill-card stroke-line-strong" />
          <line x1={x} y1="33" x2={x + 52} y2="33" strokeWidth="1.5" className="stroke-line" />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={x + 7 + i * 6} cy="27.5" r="1.6" className="fill-line-strong" />
          ))}
          {[34, 26, 30].map((w, i) => (
            <rect key={i} x={x + 8} y={44 + i * 8} width={w} height="3.5" rx="1.75" className={x === 10 ? "fill-teal-soft/50" : "fill-accent-soft/50"} />
          ))}
        </g>
      ))}
      <line x1="64" y1="50" x2="96" y2="50" strokeWidth="2" strokeDasharray="4 4" className="thumb-flow stroke-accent-soft" />
      <g className="thumb-pulse">
        <circle cx="80" cy="50" r="8" strokeWidth="1.5" className="fill-card stroke-accent-soft" />
        <path d="M76.5 46.5l7 7m0-7l-7 7" strokeWidth="1.6" strokeLinecap="round" className="stroke-accent-soft" />
      </g>
    </>
  ),
  // Response headers stacked inside a shield; an attack bounces off its edge.
  shield: (
    <>
      <path d="M80 14 L108 24 V48 C108 67 96 79 80 86 C64 79 52 67 52 48 V24 Z" strokeWidth="1.8" strokeLinejoin="round" className="fill-card stroke-teal-soft" />
      {[32, 24, 28, 18].map((w, i) => (
        <rect key={i} x="64" y={34 + i * 9} width={w} height="3.5" rx="1.75" className="thumb-slide fill-teal-soft/60" style={{ animationDelay: `${i * 0.14}s` }} />
      ))}
      <g className="thumb-bounce">
        <path d="M14 50h20" strokeWidth="2" strokeLinecap="round" className="stroke-accent-soft" />
        <path d="M29 45l5 5-5 5" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="stroke-accent-soft" />
      </g>
      <path d="M120 44l6 6 12-12" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="stroke-ok" />
    </>
  ),
  // A project, its packages, and the one shared store they all link into.
  deps: (
    <>
      <rect x="62" y="12" width="36" height="16" rx="4" strokeWidth="1.5" className="fill-card stroke-line-strong" />
      {[40, 80, 120].map((x) => (
        <path key={`a${x}`} d={`M80 28 L${x} 42`} strokeWidth="1.2" className="stroke-line-strong" />
      ))}
      {[22, 62, 102].map((x) => (
        <rect key={x} x={x} y="42" width="36" height="14" rx="4" strokeWidth="1.5" className="fill-card stroke-teal-soft" />
      ))}
      {[40, 80, 120].map((x) => (
        <path key={`b${x}`} d={`M${x} 56 L80 74`} strokeWidth="1.2" strokeDasharray="3 3" className="thumb-flow stroke-accent-soft" />
      ))}
      <rect x="40" y="74" width="80" height="14" rx="4" strokeWidth="1.5" className="fill-accent-tint stroke-accent-soft" />
    </>
  ),
};

/** `lift` nudges the thumbnail up on hover; turn it off when the whole card already lifts. */
export function PostThumb({ motif, className = "", lift = true }: { motif: Motif; className?: string; lift?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`thumb overflow-hidden rounded-xl border border-line bg-bg-soft transition-[border-color,transform] duration-300 group-hover:border-line-strong motion-reduce:transition-none ${lift ? "group-hover:-translate-y-0.5" : ""} ${className}`}
    >
      <svg viewBox="0 0 160 100" className="block h-auto w-full">
        {MOTIFS[motif]}
      </svg>
    </div>
  );
}
