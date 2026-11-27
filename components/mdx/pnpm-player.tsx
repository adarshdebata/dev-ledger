"use client";

import { AnimatePresence, motion } from "motion/react";
import { inline } from "./inline";
import { BOXES, STEPS, type Arrow, type Box } from "./pnpm-data";
import { PlayerControls, useStepPlayer } from "./step-player";

const H = 26;
const EASE = [0.22, 1, 0.36, 1] as const;
const byId = Object.fromEntries(BOXES.map((b) => [b.id, b])) as Record<string, Box>;

/** A path between two rows: a curve to the right if the target is in a later column, else a loop round the left side. */
function route(a: Box, b: Box) {
  const ay = a.y + H / 2;
  const by = b.y + H / 2;
  if (b.x >= a.x + a.w - 4) {
    const x1 = a.x + a.w;
    const x2 = b.x;
    const mid = (x1 + x2) / 2;
    return `M${x1} ${ay} C${mid} ${ay} ${mid} ${by} ${x2 - 2} ${by}`;
  }
  const bend = Math.min(a.x, b.x) - 26;
  return `M${a.x} ${ay} C${bend} ${ay} ${bend} ${by} ${b.x - 2} ${by}`;
}

const ARROW_CLS: Record<Arrow["kind"], string> = {
  symlink: "stroke-teal-soft",
  hardlink: "stroke-accent-soft",
  require: "stroke-ok",
  fail: "stroke-bad",
};

function Row({ b, lit }: { b: Box; lit?: "on" | "ok" | "bad" }) {
  if (b.kind === "head") {
    return (
      <g>
        <text x={b.x} y={b.y + 15} className="fill-subtle font-mono text-[12px] font-semibold">
          {b.label}
        </text>
        <line x1={b.x} y1={b.y + 22} x2={b.x + b.w} y2={b.y + 22} strokeWidth="1" className="stroke-line" />
      </g>
    );
  }
  const tone =
    lit === "bad"
      ? "fill-bad-tint stroke-bad"
      : lit === "ok"
        ? "fill-ok-tint stroke-ok"
        : lit === "on"
          ? "fill-accent-tint stroke-accent-soft"
          : b.kind === "link"
            ? "fill-teal-tint stroke-teal-soft"
            : b.kind === "hash"
              ? "fill-card stroke-accent-soft/60"
              : b.kind === "ghost"
                ? "fill-card stroke-bad/60"
                : b.kind === "more"
                  ? "fill-transparent stroke-transparent"
                  : "fill-card stroke-line-strong";
  const dashed = b.kind === "link" || b.kind === "ghost" ? "5 4" : undefined;
  return (
    <g>
      <rect x={b.x} y={b.y} width={b.w} height={H} rx="6" strokeWidth={lit ? 2.2 : 1.3} strokeDasharray={dashed} className={`${tone} transition-colors duration-300`} />
      {b.kind === "dir" && <path d={`M${b.x + 10} ${b.y + 9} h4.5 l1.5 1.8 h6 v7.7 h-12 z`} className="fill-teal-soft/70" />}
      {b.kind === "file" && <rect x={b.x + 11} y={b.y + 7.5} width="9" height="11" rx="1.5" strokeWidth="1.2" className="fill-none stroke-subtle" />}
      <text
        x={b.x + (b.kind === "dir" || b.kind === "file" ? 28 : 11)}
        y={b.y + 17.5}
        className={`font-mono text-[12.5px] ${b.kind === "more" || b.kind === "ghost" ? "fill-subtle italic" : b.kind === "hash" ? "fill-accent" : "fill-fg"}`}
      >
        {b.label}
        {b.kind === "link" && <tspan className="fill-teal"> →</tspan>}
      </text>
      {b.ver && (
        <text x={b.x + b.w - 9} y={b.y + 17.5} textAnchor="end" className="fill-subtle font-mono text-[11.5px]">
          {b.ver}
        </text>
      )}
    </g>
  );
}

/** npm's flat folder beside pnpm's links and store. Desktop and tablet only. */
export default function PnpmPlayer() {
  const p = useStepPlayer(STEPS.length, { delay: 4000 });
  const s = STEPS[Math.max(0, p.step - 1)];
  const live = p.step > 0;
  const show = new Set(live ? s.show : STEPS[0].show);

  return (
    <div
      role="group"
      aria-label="npm's node_modules beside pnpm's links and store. Use Next and Back, or the arrow keys."
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") p.go(p.step + 1);
        if (e.key === "ArrowLeft") p.go(p.step - 1);
      }}
      className="overflow-hidden rounded-2xl border border-line bg-card outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line bg-bg-soft/70 px-5 py-3">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold">One package.json, two node_modules</p>
          <p className="font-mono text-[11.5px] text-subtle">&quot;express&quot;: &quot;^4.22.3&quot; · npm 11 on the left, pnpm 12 on the right</p>
        </div>
        <p className="ml-auto flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-subtle">
          <span className="flex items-center gap-1.5">
            <span className="w-6 border-t-2 border-dashed border-teal-soft" /> link (junction / symlink)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-6 bg-accent-soft" /> hard link: same file
          </span>
        </p>
      </div>

      <div className="px-3 pt-3 pb-1 sm:px-5">
        <svg viewBox="0 0 1000 470" className="block h-auto w-full" role="img" aria-label={live ? s.title : "npm and pnpm layouts side by side"}>
          <defs>
            {(["symlink", "require"] as const).map((k) => (
              <marker key={k} id={`pn-${k}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" className={k === "symlink" ? "fill-teal-soft" : "fill-ok"} />
              </marker>
            ))}
          </defs>
          <rect x="8" y="16" width="282" height="252" rx="14" strokeWidth="1.3" className="fill-bg-soft/40 stroke-line-strong" />
          <text x="22" y="40" className="fill-fg text-[14px] font-semibold">
            npm
          </text>
          <text x="62" y="40" className="fill-subtle text-[12px]">
            real copies, flat
          </text>
          <rect x="314" y="16" width="678" height="446" rx="14" strokeWidth="1.3" className="fill-bg-soft/40 stroke-line-strong" />
          <text x="330" y="40" className="fill-fg text-[14px] font-semibold">
            pnpm
          </text>
          <text x="376" y="40" className="fill-subtle text-[12px]">
            links into a store
          </text>

          <AnimatePresence initial={false}>
            {BOXES.filter((b) => show.has(b.id)).map((b) => (
              <motion.g key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                <Row b={b} lit={live ? s.lit[b.id] : undefined} />
              </motion.g>
            ))}
          </AnimatePresence>

          {live &&
            s.arrows.map((a, i) => (
              <motion.path
                key={`${p.step}-${i}`}
                d={route(byId[a.from], byId[a.to])}
                fill="none"
                strokeWidth={a.kind === "hardlink" ? 2.6 : 2.2}
                strokeDasharray={a.kind === "symlink" ? "6 5" : undefined}
                strokeLinecap="round"
                markerEnd={a.kind === "symlink" || a.kind === "require" ? `url(#pn-${a.kind})` : undefined}
                className={ARROW_CLS[a.kind]}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.25 + i * 0.35, ease: EASE }}
              />
            ))}
        </svg>
      </div>

      <div className="grid grid-cols-1 border-t border-line lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="border-b border-line px-5 py-4 md:min-h-[9rem] lg:border-r lg:border-b-0" aria-live="polite">
          <p className="eyebrow text-subtle">{live ? `Step ${p.step} of ${STEPS.length} · ${s.title}` : "npm vs pnpm"}</p>
          <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
            {live ? inline(s.caption) : "Press Next, or Play, to follow pnpm's links from your project down to the files on disk, and see why one require() breaks."}
          </p>
        </div>
        <div className="min-w-0 bg-code px-5 py-4 font-mono text-[11.5px] leading-relaxed">
          {(live ? s.term : ["$ pnpm add express@4"]).map((line, i) => (
            <motion.p
              key={`${p.step}-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className={`break-all ${line.startsWith("Error") ? "text-bad" : line.startsWith("#") ? "text-subtle" : line.startsWith("$") || line.startsWith(">") ? "text-muted" : "text-fg"}`}
            >
              {line}
            </motion.p>
          ))}
        </div>
      </div>

      <PlayerControls step={p.step} last={STEPS.length} playing={p.playing} onGo={p.go} onToggle={p.toggle} />
    </div>
  );
}
