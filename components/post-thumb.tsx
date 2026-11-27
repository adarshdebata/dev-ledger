import type { PostMeta, Thumb } from "@/lib/posts";

/**
 * Small animated SVG thumbnails in the theme's colours. They sit still until the card around them
 * (a `.group`) is hovered or focused, and never move under reduced motion. See ".thumb" in globals.css.
 */
export type Motif = Thumb;

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
  // One line in package.json fans out into a tree of packages; each one travels down to node_modules.
  tree: (
    <>
      <rect x="66" y="8" width="28" height="12" rx="4" strokeWidth="1.5" className="fill-accent-tint stroke-accent-soft" />
      {[18, 56, 94, 132].map((x, i) => (
        <g key={x}>
          <path d={`M80 20 L${x + 5} 34`} strokeWidth="1.2" className="stroke-line-strong" />
          <rect x={x - 5} y="34" width="20" height="10" rx="3" strokeWidth="1.5" className="thumb-slide fill-card stroke-teal-soft" style={{ animationDelay: `${i * 0.12}s` }} />
          {[-7, 7].map((dx, j) => (
            <g key={dx}>
              <path d={`M${x + 5} 44 L${x + 5 + dx} 56`} strokeWidth="1" strokeDasharray="2.5 2.5" className="thumb-flow stroke-line-strong" />
              <circle cx={x + 5 + dx} cy="59" r="3" className={`thumb-pulse ${(i + j) % 3 === 0 ? "fill-accent-soft" : "fill-teal-soft/70"}`} style={{ animationDelay: `${(i * 2 + j) * 0.1}s` }} />
            </g>
          ))}
        </g>
      ))}
      <line x1="14" y1="82" x2="146" y2="82" strokeWidth="1.5" className="stroke-line-strong" />
      {[14, 80, 146].map((x, i) => (
        <rect key={x} x={x - 6} y="76" width="12" height="12" rx="3" strokeWidth="1.5" className={`fill-card ${i === 2 ? "stroke-fg" : "stroke-teal-soft"}`} />
      ))}
      <circle cx="14" cy="82" r="3" className="thumb-packet fill-accent-soft" />
    </>
  ),
  // require() climbs from the deepest folder up, checking each node_modules until one has the package.
  climb: (
    <>
      {(
        [
          [12, 14, "stroke-line-strong"],
          [28, 40, "stroke-line-strong"],
          [44, 66, "stroke-line-strong"],
        ] as const
      ).map(([x, y, c]) => (
        <g key={y}>
          <path d={`M${x} ${y + 4} h8 l3 -3 h${92 - x} v18 h-${103 - x} z`} strokeWidth="1.5" strokeLinejoin="round" className={`fill-card ${c}`} />
          <rect x="116" y={y + 3} width="30" height="12" rx="3" strokeWidth="1.5" strokeDasharray={y === 14 ? undefined : "3 2.5"} className={y === 14 ? "fill-ok/15 stroke-ok" : "fill-card stroke-line-strong"} />
        </g>
      ))}
      <path d="M131 86 V29" strokeWidth="1.8" strokeDasharray="4 3" className="thumb-flow stroke-accent-soft" />
      <circle cx="131" cy="90" r="4" className="fill-accent-soft" />
      {[49, 75].map((y) => (
        <path key={y} d={`M150 ${y - 3} l6 6 m0 -6 l-6 6`} strokeWidth="1.6" strokeLinecap="round" className="stroke-bad" />
      ))}
      <path d="M149 23 l3 3 6 -6" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" className="thumb-pulse stroke-ok" />
    </>
  ),
  // Version ranges on one side, exact pinned versions on the other, held by a lock.
  lock: (
    <>
      <rect x="10" y="16" width="56" height="68" rx="6" strokeWidth="1.5" className="fill-card stroke-line-strong" />
      {[30, 22, 34, 26].map((w, i) => (
        <g key={i}>
          <rect x="18" y={28 + i * 13} width="6" height="4" rx="2" className="fill-teal-soft" />
          <rect x="27" y={28 + i * 13} width={w} height="4" rx="2" className="fill-line-strong" />
        </g>
      ))}
      <path d="M70 50 H88" strokeWidth="1.8" strokeDasharray="4 3" className="thumb-flow stroke-accent-soft" />
      <rect x="94" y="16" width="56" height="68" rx="6" strokeWidth="1.5" className="fill-card stroke-accent-soft" />
      {[34, 26, 38, 30].map((w, i) => (
        <rect key={i} x="102" y={28 + i * 13} width={w} height="4" rx="2" className="thumb-slide fill-accent-soft/70" style={{ animationDelay: `${i * 0.12}s` }} />
      ))}
      <g className="thumb-pulse">
        <rect x="132" y="62" width="14" height="11" rx="2.5" className="fill-accent-soft" />
        <path d="M135 62v-3a4 4 0 0 1 8 0v3" fill="none" strokeWidth="1.8" className="stroke-accent-soft" />
      </g>
    </>
  ),
  // Browser, proxy, app: the hop behind the proxy breaks, and the proxy answers for it.
  gateway: (
    <>
      {(
        [
          [8, "stroke-line-strong"],
          [62, "stroke-accent-soft"],
          [116, "stroke-line-strong"],
        ] as const
      ).map(([x, c]) => (
        <rect key={x} x={x} y="30" width="36" height="40" rx="6" strokeWidth="1.5" className={`fill-card ${c}`} />
      ))}
      {[40, 48, 56].map((y) => (
        <rect key={y} x="69" y={y} width="22" height="3.5" rx="1.75" className="fill-accent-soft/60" />
      ))}
      <path d="M44 44 H62" strokeWidth="1.8" strokeDasharray="4 3" className="thumb-flow stroke-teal-soft" />
      <path d="M62 58 H44" strokeWidth="1.8" className="stroke-bad" />
      <path d="M48 54 l-4 4 4 4" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" className="stroke-bad" />
      <path d="M98 50 H116" strokeWidth="1.8" strokeDasharray="3 4" className="stroke-line-strong" />
      <g className="thumb-pulse">
        <circle cx="107" cy="50" r="7" strokeWidth="1.5" className="fill-card stroke-bad" />
        <path d="M104 47l6 6m0-6l-6 6" strokeWidth="1.6" strokeLinecap="round" className="stroke-bad" />
      </g>
    </>
  ),
  // A balancer and three servers: one server's load bar is full, the others sit almost empty.
  balance: (
    <>
      <circle cx="30" cy="50" r="13" strokeWidth="1.5" className="fill-card stroke-accent-soft" />
      <path d="M24 50 h12 M32 46 l4 4 -4 4" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" className="stroke-accent-soft" />
      {(
        [
          [18, 60, "stroke-accent-soft", 2.4, undefined],
          [44, 14, "stroke-line-strong", 1.2, "3 3"],
          [70, 8, "stroke-line-strong", 1.2, "3 3"],
        ] as const
      ).map(([y, w, c, sw, dash]) => (
        <g key={y}>
          <path d={`M43 50 L96 ${y + 9}`} strokeWidth={sw} strokeDasharray={dash} className={`${dash ? "" : "thumb-flow"} ${c}`} />
          <rect x="96" y={y} width="56" height="18" rx="4" strokeWidth="1.5" className="fill-card stroke-line-strong" />
          <rect x="101" y={y + 6} width={w * 0.77} height="6" rx="3" className={`thumb-grow ${w > 30 ? "fill-accent-soft" : "fill-teal-soft/60"}`} />
        </g>
      ))}
    </>
  ),
  // Users get answers from a nearby edge copy; only a miss travels on to the origin.
  edge: (
    <>
      {[30, 70].map((y) => (
        <circle key={y} cx="16" cy={y} r="6" strokeWidth="1.5" className="fill-card stroke-line-strong" />
      ))}
      <rect x="56" y="24" width="44" height="52" rx="8" strokeWidth="1.5" className="fill-card stroke-teal-soft" />
      {[36, 46, 56].map((y, i) => (
        <rect key={y} x="64" y={y} width="28" height="5" rx="2.5" className={i === 2 ? "fill-line-strong" : "fill-teal-soft/70"} />
      ))}
      <path d="M22 30 H56 M56 70 H22" strokeWidth="1.8" strokeDasharray="4 3" className="thumb-flow stroke-ok" />
      <rect x="124" y="30" width="28" height="40" rx="5" strokeWidth="1.5" className="fill-card stroke-fg" />
      {[40, 48, 56].map((y) => (
        <rect key={y} x="130" y={y} width="16" height="3.5" rx="1.75" className="fill-line-strong" />
      ))}
      <path d="M100 50 H124" strokeWidth="1.5" strokeDasharray="2 4" className="stroke-line-strong" />
      <circle cx="78" cy="84" r="5" strokeWidth="1.5" className="thumb-pulse fill-card stroke-accent-soft" />
      <path d="M78 81.5 V84 H80" strokeWidth="1.3" fill="none" strokeLinecap="round" className="stroke-accent-soft" />
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
