"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Archive, Check, FileJson, FolderTree, Globe, X, type LucideIcon } from "lucide-react";
import { inline } from "./inline";
import { BREAKS, RUNS, STEPS, STOPS, TREE, pick, type Break, type Run, type StopId } from "./install-data";
import { PlayerControls, useStepPlayer } from "./step-player";

const ICONS: Record<StopId, LucideIcon> = { project: FileJson, registry: Globe, cache: Archive, modules: FolderTree };
const EASE = [0.22, 1, 0.36, 1] as const;
const centre = (id: StopId) => ((STOPS.findIndex((s) => s.id === id) + 0.5) / STOPS.length) * 100;

/** What each stop holds after the current step, in a few words. */
function stopNote(id: StopId, step: number, run: Run, failedAt: number) {
  const reached = (n: number) => step >= n && !(failedAt && failedAt <= n);
  if (id === "project") return run === "again" || reached(9) ? "package.json + lockfile" : "package.json";
  if (id === "registry") {
    if (run === "again") return reached(9) ? "asked about vulnerabilities" : "not contacted";
    return reached(3) ? "65 metadata documents" : reached(2) ? "express: 5.3.0 is newest" : "not contacted yet";
  }
  if (id === "cache") return run === "again" || reached(5) ? "65 tarballs, by hash" : "empty";
  return reached(7) ? "65 folders + .bin" : "empty";
}

function Chip({ label, tone, dashed }: { label: string; tone: "plain" | "fetched" | "done" | "bad"; dashed?: boolean }) {
  const cls = {
    plain: "border-line-strong bg-card text-fg",
    fetched: "border-teal-soft/60 bg-teal-tint text-teal",
    done: "border-ok/50 bg-ok-tint text-ok",
    bad: "border-bad/50 bg-bad-tint text-bad",
  }[tone];
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: EASE }}
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[11.5px] leading-snug whitespace-nowrap ${cls} ${dashed ? "border-dashed" : ""}`}
    >
      {tone === "done" && <Check className="size-3" />}
      {label}
    </motion.span>
  );
}

/** One install, nine steps: the registry, the cache, the integrity check and node_modules. Desktop and tablet only. */
export default function InstallPlayer() {
  const [run, setRun] = useState<Run>("first");
  const [brk, setBrk] = useState<Break>("none");
  const failAt = BREAKS.find((b) => b.id === brk)!.at;
  const last = failAt || STEPS.length;
  const p = useStepPlayer(last, { delay: 3600 });
  const s = p.step > 0 ? STEPS[p.step - 1] : undefined;
  const failing = !!s && failAt === p.step && !!s.fail;
  const at = s ? pick(s.at, run) : undefined;
  const trip = s ? (pick(s.trip ?? null, run) ?? null) : null;
  const term = s ? (failing ? s.fail!.term : pick(s.term, run)) : [];
  const caption = s ? (failing ? s.fail!.caption : pick(s.caption, run)) : "";
  // Packages turn teal once their tarball is in hand, green once unpacked; red where the install stopped.
  const chipTone = failing ? "bad" : p.step >= 7 ? "done" : p.step >= 5 ? "fetched" : "plain";
  const resolved = !!s && s.tree >= 1 && !(failing && p.step === 2);

  const choose = <T,>(set: (v: T) => void, v: T) => {
    set(v);
    p.pause();
    p.jump(0);
  };

  return (
    <div
      role="group"
      aria-label="What npm install does, step by step. Use Next and Back, or the arrow keys."
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") p.go(p.step + 1);
        if (e.key === "ArrowLeft") p.go(p.step - 1);
      }}
      className="overflow-hidden rounded-2xl border border-line bg-card outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-line bg-bg-soft/70 px-5 py-3">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold">What npm install does</p>
          <p className="font-mono text-[11.5px] text-subtle">package.json: &quot;express&quot;: &quot;^5.1.0&quot;</p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <div className="flex gap-1 rounded-xl border border-line bg-card p-1" role="group" aria-label="Which install">
            {RUNS.map((r) => (
              <button
                key={r.id}
                type="button"
                aria-pressed={r.id === run}
                onClick={() => choose(setRun, r.id)}
                className={`rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors ${r.id === run ? "bg-fg text-bg" : "text-muted hover:bg-bg-soft hover:text-fg"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-line bg-card p-1" role="group" aria-label="Break something">
            <span className="px-2 text-[11.5px] font-semibold text-subtle">Break:</span>
            {BREAKS.map((b) => (
              <button
                key={b.id}
                type="button"
                aria-pressed={b.id === brk}
                onClick={() => choose(setBrk, b.id)}
                className={`rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium transition-colors ${
                  b.id === brk ? (b.id === "none" ? "bg-fg text-bg" : "bg-bad text-bg") : "text-muted hover:bg-bg-soft hover:text-fg"
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* The four stops, with the current trip drawn underneath */}
      <div className="px-5 pt-5">
        <div className="grid grid-cols-4 gap-4">
          {STOPS.map((stop) => {
            const Icon = ICONS[stop.id];
            const active = at === stop.id;
            const bad = failing && active;
            return (
              <div
                key={stop.id}
                className={`rounded-xl border-2 px-3.5 py-3 transition-colors duration-300 ${
                  bad ? "border-bad bg-bad-tint" : active ? "border-accent-soft bg-accent-tint" : "border-line bg-card"
                }`}
              >
                <p className="flex items-center gap-2 text-[14px] font-semibold">
                  <Icon className={`size-4 shrink-0 ${bad ? "text-bad" : active ? "text-accent" : "text-subtle"}`} />
                  {stop.name}
                </p>
                <p className="mt-0.5 font-mono text-[11.5px] text-subtle">{stop.sub}</p>
                <p className={`mt-2 text-[12.5px] leading-snug ${bad ? "font-semibold text-bad" : "text-muted"}`}>
                  {bad ? "stopped here" : stopNote(stop.id, p.step, run, failAt && p.step >= failAt ? failAt : 0)}
                </p>
              </div>
            );
          })}
        </div>
        <div className="relative mt-2 h-7" aria-hidden="true">
          <div className="absolute inset-x-[12.5%] top-1/2 h-px bg-line" />
          {s && trip && (
            <div key={`${run}-${brk}-${p.step}`} className="absolute inset-0">
              <motion.div
                className={`absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full ${failing ? "bg-bad" : "bg-accent-soft"}`}
                style={{ left: `${Math.min(centre(trip[0]), centre(trip[1]))}%`, width: `${Math.abs(centre(trip[1]) - centre(trip[0]))}%`, transformOrigin: centre(trip[1]) > centre(trip[0]) ? "left" : "right" }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, ease: EASE }}
              />
              <motion.span
                className={`absolute top-1/2 grid size-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full ${failing ? "bg-bad" : "bg-accent-soft"}`}
                initial={{ left: `${centre(trip[0])}%` }}
                animate={{ left: `${centre(trip[1])}%` }}
                transition={{ duration: 1, ease: EASE }}
              >
                {failing && <X className="size-3 text-bg" />}
              </motion.span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 px-5 pb-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* The dependency tree */}
        <div className="rounded-xl border border-line p-3.5 md:min-h-[12.5rem]">
          <p className="flex items-baseline justify-between gap-3">
            <span className="eyebrow text-subtle">The tree</span>
            <span className="font-mono text-[11.5px] text-subtle">{s && s.tree >= 3 ? `${TREE.total} packages` : s && s.tree >= 1 ? "1 package so far" : "a range, not a version"}</span>
          </p>
          <div className="mt-2.5 space-y-2.5">
            <div>
              <Chip label={resolved ? TREE.resolved : TREE.range} tone={failing && p.step === 2 ? "bad" : resolved ? chipTone : "plain"} dashed={!resolved} />
            </div>
            {s && s.tree >= 3 && !(failing && p.step <= 3) && (
              <>
                <div className="flex flex-wrap gap-1.5 border-l-2 border-line pl-3">
                  {TREE.direct.map((d) => (
                    <Chip key={d} label={d} tone={chipTone} />
                  ))}
                  <span className="self-center font-mono text-[11px] text-subtle">+{TREE.moreDirect} more</span>
                </div>
                <div className="ml-4 flex flex-wrap gap-1.5 border-l-2 border-line pl-3">
                  {TREE.deep.map((d) => (
                    <Chip key={d} label={d} tone={chipTone} />
                  ))}
                  <span className="self-center font-mono text-[11px] text-subtle">…and the rest</span>
                </div>
              </>
            )}
            {failing && p.step === 3 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <Chip label="react@17.0.2" tone="plain" />
                <Chip label='react-dom@18.3.1 wants react "^18.3.1"' tone="bad" />
              </div>
            )}
          </div>
        </div>

        {/* What npm prints at this step */}
        <div className="min-w-0 overflow-hidden rounded-xl border border-code-line bg-code md:min-h-[12.5rem]">
          <p className="border-b border-code-line px-3.5 py-2 font-mono text-[11px] text-subtle">What npm prints (--loglevel http, --timing)</p>
          <div className="space-y-1 px-3.5 py-3 font-mono text-[11.5px] leading-relaxed" aria-live="polite">
            {s ? (
              term.map((line, i) => (
                <motion.p
                  key={`${run}-${brk}-${p.step}-${i}`}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.12, duration: 0.3 }}
                  className={`break-all ${line.startsWith("npm error") ? "text-bad" : line.startsWith("npm warn") ? "text-warn" : line.startsWith("#") ? "text-subtle" : "text-fg"}`}
                >
                  {line}
                </motion.p>
              ))
            ) : (
              <p className="text-subtle">$ npm install</p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-line px-5 py-4 md:min-h-[7.5rem]" aria-live="polite">
        <p className={`eyebrow ${failing ? "text-bad" : "text-subtle"}`}>{s ? `Step ${p.step} of ${last} · ${pick(s.title, run)}` : "Nine steps, one command"}</p>
        <p className="mt-2 max-w-[62rem] text-[14.5px] leading-relaxed text-muted">
          {s ? inline(caption) : "Press Next, or Play, to follow npm through the install. Switch to a second install with a warm cache and a lockfile, or break something and see where npm stops."}
        </p>
      </div>

      <PlayerControls step={p.step} last={last} playing={p.playing} onGo={p.go} onToggle={p.toggle} />
    </div>
  );
}
