import type { PostMeta, Thumb } from "@/lib/posts";

/**
 * Small animated SVG thumbnails in the theme's colours. They sit still until the card around them
 * (a `.group`) is hovered or focused, and never move under reduced motion. See ".thumb" in globals.css.
 */
export type Motif = Thumb | "deps";

export function thumbFor(post: Pick<PostMeta, "thumb" | "tags">): Motif {
  if (post.thumb) return post.thumb;
  if (post.tags.includes("dns")) return "lookup";
  if (post.tags.includes("cors")) return "origins";
  if (post.tags.includes("security")) return "shield";
  if (post.tags.includes("ids")) return "ids";
  if (post.tags.includes("tls")) return "handshake";
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
  // A name goes out through three servers and comes back as an address.
  lookup: (
    <>
      <rect x="8" y="24" width="42" height="14" rx="7" strokeWidth="1.5" className="fill-card stroke-line-strong" />
      <rect x="15" y="29.5" width="28" height="3" rx="1.5" className="fill-line-strong" />
      <path d="M50 31 H62" strokeWidth="1.5" strokeDasharray="3 3" className="thumb-flow stroke-accent-soft" />
      {[78, 104, 130].map((cx, i) => (
        <g key={cx}>
          <circle cx={cx} cy="31" r="9" strokeWidth="1.5" className={`fill-card ${i === 2 ? "stroke-accent-soft" : "stroke-teal-soft"}`} />
          <circle cx={cx} cy="31" r="2.5" className={i === 2 ? "fill-accent-soft" : "fill-teal-soft"} />
        </g>
      ))}
      <path d="M87 31 H95 M113 31 H121" strokeWidth="1.5" strokeDasharray="3 3" className="thumb-flow stroke-teal-soft" />
      <path d="M130 40 V52 Q130 60 122 60 H58" strokeWidth="1.5" fill="none" strokeDasharray="3 3" className="thumb-flow stroke-ok" />
      <rect x="10" y="52" width="48" height="16" rx="8" strokeWidth="1.5" className="thumb-pulse fill-ok/15 stroke-ok" />
      <rect x="18" y="58.5" width="32" height="3" rx="1.5" className="fill-ok" />
      <rect x="8" y="78" width="64" height="5" rx="2.5" className="fill-line-strong" />
      <rect x="8" y="88" width="44" height="5" rx="2.5" className="fill-line" />
    </>
  ),
  // A long time-based number folds into a shorter ID; the first digit is the one that breaks.
  ids: (
    <>
      {Array.from({ length: 19 }, (_, i) => (
        <rect
          key={`s${i}`}
          x={8.5 + i * 7.6}
          y="20"
          width="6.2"
          height="12"
          rx="1.6"
          className={i === 1 ? "fill-accent-soft" : i >= 4 ? "fill-teal-soft/55" : "fill-line-strong"}
        />
      ))}
      <path d="M19.2 33 L23 61" strokeWidth="1.2" strokeDasharray="2.5 2.5" className="thumb-flow stroke-accent-soft" />
      <path d="M95.2 33 L83.8 61" strokeWidth="1.2" strokeDasharray="2.5 2.5" className="thumb-flow stroke-teal-soft" />
      {Array.from({ length: 16 }, (_, i) => (
        <rect
          key={`i${i}`}
          x={19.9 + i * 7.6}
          y="62"
          width="6.2"
          height="12"
          rx="1.6"
          className={i === 0 ? "thumb-pulse fill-bad" : "fill-teal-soft/55"}
        />
      ))}
      <rect x="19.9" y="84" width="64" height="5" rx="2.5" className="fill-line-strong" />
      <rect x="19.9" y="93" width="40" height="5" rx="2.5" className="fill-line" />
    </>
  ),
  // Browser and server lifelines; three messages cross before the padlock closes.
  handshake: (
    <>
      {[30, 130].map((x) => (
        <g key={x}>
          <rect x={x - 14} y="10" width="28" height="11" rx="5.5" strokeWidth="1.5" className="fill-card stroke-line-strong" />
          <line x1={x} y1="21" x2={x} y2="94" strokeWidth="1.5" className="stroke-line-strong" />
        </g>
      ))}
      {(
        [
          [30, 30, 130, 42, "stroke-teal-soft"],
          [130, 46, 30, 58, "stroke-teal-soft"],
          [30, 62, 130, 74, "stroke-accent-soft"],
          [130, 78, 30, 90, "stroke-ok"],
        ] as const
      ).map(([x1, y1, x2, y2, c], i) => (
        <path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} strokeWidth="2" strokeLinecap="round" className={`thumb-slide ${c}`} style={{ animationDelay: `${i * 0.16}s` }} />
      ))}
      <g className="thumb-pulse">
        <rect x="73" y="47" width="14" height="11" rx="2.5" className="fill-accent-soft" />
        <path d="M76 47v-3a4 4 0 0 1 8 0v3" fill="none" strokeWidth="1.8" className="stroke-accent-soft" />
      </g>
    </>
  ),
  // A request's header lines; each stop along the top lights up the lines it reads.
  headers: (
    <>
      {[28, 62, 98, 132].map((x, i) => (
        <circle key={x} cx={x} cy="16" r="5" strokeWidth="1.5" className={`fill-card ${i === 3 ? "stroke-accent-soft" : "stroke-teal-soft"}`} />
      ))}
      <line x1="33" y1="16" x2="127" y2="16" strokeWidth="1.5" strokeDasharray="3 3" className="thumb-flow stroke-line-strong" />
      <rect x="18" y="30" width="124" height="64" rx="7" strokeWidth="1.5" className="fill-card stroke-line-strong" />
      {(
        [
          [26, "fill-teal-soft", 0],
          [38, "fill-line-strong", 1],
          [50, "fill-accent-soft", 2],
          [62, "fill-line-strong", 3],
          [74, "fill-ok", 4],
        ] as const
      ).map(([w, c, i]) => (
        <g key={i}>
          <rect x="28" y={39 + i * 10.5} width={w} height="4" rx="2" className={`thumb-slide ${c}`} style={{ animationDelay: `${i * 0.12}s` }} />
          <rect x={34 + w} y={39 + i * 10.5} width={98 - w} height="4" rx="2" className="fill-line" />
        </g>
      ))}
    </>
  ),
  // A machine with two doors; only one is open, and a connection reaches the app through it.
  ports: (
    <>
      <rect x="36" y="12" width="116" height="80" rx="9" strokeWidth="1.5" className="fill-card stroke-line-strong" />
      <rect x="82" y="26" width="60" height="52" rx="7" strokeWidth="1.5" strokeDasharray="3 3" className="fill-teal-tint stroke-teal-soft" />
      <rect x="31" y="26" width="10" height="16" rx="2.5" strokeWidth="1.5" className="fill-ok/20 stroke-ok" />
      <rect x="31" y="60" width="10" height="16" rx="2.5" strokeWidth="1.5" strokeDasharray="2 2" className="fill-card stroke-line-strong" />
      <rect x="100" y="42" width="26" height="20" rx="4" className="fill-accent-soft" />
      <path d="M8 34 H31 M41 34 Q70 34 100 50" strokeWidth="1.8" fill="none" strokeDasharray="4 4" className="thumb-flow stroke-accent-soft" />
      <path d="M8 68 H24" strokeWidth="1.8" strokeLinecap="round" className="stroke-bad" />
      <path d="M22 63 l6 10 m0 -10 l-6 10" strokeWidth="1.6" strokeLinecap="round" className="thumb-pulse stroke-bad" />
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
