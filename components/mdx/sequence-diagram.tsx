"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Code2, Database, Globe, Network, Pause, Play, RotateCcw, Server, Shield, SkipBack, SkipForward } from "lucide-react";
import { HttpLines } from "./http-lines";
import { inline } from "./inline";

type ActorIcon = "js" | "browser" | "server" | "db" | "proxy" | "shield";
type Tone = "default" | "ok" | "bad" | "warn" | "muted";

export type SeqActor = { id: string; label: string; sub?: string; icon?: ActorIcon };
export type SeqStep = {
  from: string;
  to: string;
  label: string;
  caption: string;
  detail?: string;
  tone?: Tone;
};

const icons = { js: Code2, browser: Globe, server: Server, db: Database, proxy: Network, shield: Shield };

const toneColor: Record<Tone, string> = {
  default: "var(--accent-soft)",
  ok: "var(--ok)",
  bad: "var(--bad)",
  warn: "var(--warn)",
  muted: "var(--subtle)",
};

const ease = [0.22, 1, 0.36, 1] as const;
const TRAVEL = 0.75;
const ROW = 50;

const readTime = (s: SeqStep) => Math.min(7000, Math.max(3200, 1800 + s.caption.length * 32 + (s.detail ? 900 : 0)));

export function SequenceDiagram({ title, actors, steps }: { title?: string; actors: SeqActor[]; steps: SeqStep[] }) {
  const [step, setStep] = useState(0);
  const [run, setRun] = useState(0); // bumps to replay the current step's animation
  const [animated, setAnimated] = useState(false);
  const [playing, setPlaying] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { once: true, amount: 0.45 });
  const reduce = useReducedMotion();
  const n = actors.length;
  const col = (id: string) => Math.max(0, actors.findIndex((a) => a.id === id));
  const center = (i: number) => ((i + 0.5) / n) * 100;
  const last = steps.length - 1;

  const go = useCallback(
    (to: number, keepPlaying = false) => {
      setAnimated(true);
      setStep(Math.max(0, Math.min(last, to)));
      setRun((r) => r + 1);
      if (!keepPlaying) setPlaying(false);
    },
    [last],
  );

  // Autoplay once, the first time the diagram is mostly on screen.
  useEffect(() => {
    if (inView && !reduce) {
      setAnimated(true);
      setRun((r) => r + 1);
      setPlaying(true);
    }
  }, [inView, reduce]);

  useEffect(() => {
    if (!playing) return;
    if (step >= last) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => go(step + 1, true), readTime(steps[step]));
    return () => clearTimeout(t);
  }, [playing, step, run, last, steps, go]);

  const togglePlay = () => {
    if (playing) return setPlaying(false);
    if (step >= last) go(0, true);
    else setRun((r) => r + 1);
    setAnimated(true);
    setPlaying(true);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(step + 1);
    else if (e.key === "ArrowLeft") go(step - 1);
    else return;
    e.preventDefault();
  };

  const current = steps[step];
  const arrivedAt = current.from === current.to ? null : current.to;

  return (
    <figure
      ref={root}
      tabIndex={0}
      onKeyDown={onKey}
      aria-label={title ? `Sequence diagram: ${title}` : "Sequence diagram"}
      className="not-prose my-9 overflow-hidden rounded-2xl border border-line bg-card outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
    >
      <figcaption className="flex items-center justify-between gap-3 border-b border-line bg-bg-soft/70 px-4 py-2.5">
        <span className="truncate text-[13px] font-semibold">{title}</span>
        <span className="shrink-0 font-mono text-[11px] text-subtle">
          {step + 1} / {steps.length}
        </span>
      </figcaption>

      <div className="px-2 pt-5 sm:px-5">
        {/* Actors */}
        <div className="grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
          {actors.map((a) => {
            const Icon = icons[a.icon ?? "server"];
            const active = current.from === a.id || current.to === a.id;
            return (
              <div key={a.id} className="flex flex-col items-center text-center">
                <div className="relative">
                  {animated && arrivedAt === a.id && (
                    <motion.span
                      key={`pulse-${step}-${run}`}
                      className="absolute inset-0 rounded-xl"
                      style={{ boxShadow: `0 0 0 2px ${toneColor[current.tone ?? "default"]}` }}
                      initial={{ opacity: 0, scale: 1 }}
                      animate={{ opacity: [0, 0.9, 0], scale: [1, 1, 1.45] }}
                      transition={{ delay: TRAVEL * 0.92, duration: 0.7, ease: "easeOut" }}
                    />
                  )}
                  <div
                    className={`grid size-10 place-items-center rounded-xl border transition-colors duration-300 sm:size-11 ${
                      active ? "border-accent-soft/60 bg-accent-tint text-accent" : "border-line bg-bg-soft text-muted"
                    }`}
                  >
                    <Icon className="size-[18px] sm:size-5" />
                  </div>
                </div>
                <span className="mt-2 px-0.5 text-[11.5px] leading-tight font-semibold sm:text-[13px]">{a.label}</span>
                {a.sub && <span className="mt-0.5 hidden font-mono text-[10.5px] text-subtle sm:block">{a.sub}</span>}
              </div>
            );
          })}
        </div>

        {/* Lanes */}
        <div className="relative mt-3 pb-3" style={{ height: steps.length * ROW + 12 }}>
          {actors.map((a, i) => (
            <span
              key={a.id}
              aria-hidden="true"
              className="absolute top-0 bottom-0 border-l border-dashed border-line-strong"
              style={{ left: `${center(i)}%` }}
            />
          ))}

          {steps.map((s, i) => {
            const state = i < step ? "past" : i === step ? "current" : "future";
            const top = i * ROW + 6;
            const fresh = animated && state === "current";
            return (
              <div key={i} className="absolute inset-x-0" style={{ top, height: ROW }}>
                <motion.div
                  aria-hidden="true"
                  className="absolute inset-x-0 inset-y-1 rounded-lg bg-accent-tint"
                  initial={false}
                  animate={{ opacity: state === "current" ? 0.7 : 0 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  className="absolute inset-0"
                  initial={false}
                  animate={{ opacity: state === "future" ? 0 : state === "past" ? 0.62 : 1 }}
                  transition={{ duration: 0.35 }}
                >
                  {s.from === s.to ? (
                    <SelfBadge key={fresh ? `${i}-${run}` : i} left={center(col(s.from))} step={s} fresh={fresh} />
                  ) : (
                    <Arrow
                      key={fresh ? `${i}-${run}` : i}
                      a={center(col(s.from))}
                      b={center(col(s.to))}
                      step={s}
                      fresh={fresh}
                    />
                  )}
                </motion.div>
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => go(i)}
                  className="absolute inset-0 cursor-pointer"
                  aria-label={`Go to step ${i + 1}: ${s.label}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Captions: stacked in one grid cell so the panel is as tall as the longest one and never jumps */}
      <div className="grid grid-cols-1 border-t border-line bg-bg-soft/40 px-4 py-4 sm:px-5" aria-live="polite">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            className="min-w-0 [grid-area:1/1]"
            initial={false}
            animate={{ opacity: i === step ? 1 : 0, y: i === step ? 0 : 6 }}
            transition={{ duration: 0.3, ease }}
            style={{ visibility: i === step ? "visible" : "hidden" }}
            aria-hidden={i !== step}
          >
            <p className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-subtle uppercase">
              <span className="size-1.5 rounded-full" style={{ background: toneColor[s.tone ?? "default"] }} />
              Step {i + 1}
            </p>
            <p className="mt-1.5 text-[15px] leading-relaxed text-fg">{inline(s.caption)}</p>
            {s.detail && <HttpLines text={s.detail} className="mt-3" />}
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 border-t border-line px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-0.5">
          <CtrlButton label="Restart" onClick={() => go(0)}>
            <RotateCcw className="size-4" />
          </CtrlButton>
          <CtrlButton label="Previous step" onClick={() => go(step - 1)} disabled={step === 0}>
            <SkipBack className="size-4" />
          </CtrlButton>
          <button
            type="button"
            onClick={togglePlay}
            className="mx-1 grid size-9 place-items-center rounded-full bg-fg text-bg transition-transform hover:scale-105"
            aria-label={playing ? "Pause" : step >= last ? "Replay" : "Play"}
          >
            {playing ? <Pause className="size-4" /> : step >= last ? <RotateCcw className="size-4" /> : <Play className="ml-0.5 size-4" />}
          </button>
          <CtrlButton label="Next step" onClick={() => go(step + 1)} disabled={step === last}>
            <SkipForward className="size-4" />
          </CtrlButton>
        </div>
        <div className="flex flex-1 gap-1" aria-hidden="true">
          {steps.map((s, i) => (
            <button
              key={i}
              type="button"
              tabIndex={-1}
              onClick={() => go(i)}
              className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-line"
            >
              {i < step && <span className="bg-brand absolute inset-0" />}
              {i === step && (
                <motion.span
                  key={`${step}-${run}-${playing}`}
                  className="bg-brand absolute inset-y-0 left-0"
                  initial={{ width: playing ? "0%" : "100%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: playing && step < last ? readTime(s) / 1000 : 0, ease: "linear" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </figure>
  );
}

function CtrlButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-accent-tint hover:text-fg disabled:pointer-events-none disabled:opacity-35"
    >
      {children}
    </button>
  );
}

function Arrow({ a, b, step, fresh }: { a: number; b: number; step: SeqStep; fresh: boolean }) {
  const rtl = b < a;
  const left = Math.min(a, b);
  const width = Math.abs(a - b);
  const tone = step.tone ?? "default";
  const color = toneColor[tone];
  const dashed = tone === "muted";
  const lineY = 32;

  return (
    <div className="absolute top-0 h-full" style={{ left: `${left}%`, width: `${width}%` }}>
      <motion.span
        className="absolute left-1/2 top-[7px] max-w-[calc(100%+2.5rem)] -translate-x-1/2 truncate rounded-md border bg-card px-1.5 py-0.5 font-mono text-[10.5px] leading-none font-medium whitespace-nowrap sm:text-[11.5px]"
        style={{ borderColor: `color-mix(in oklab, ${color} 35%, transparent)`, color }}
        initial={fresh ? { opacity: 0, y: 4 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: fresh ? 0.1 : 0, ease }}
      >
        {step.label}
      </motion.span>

      <motion.span
        className="absolute inset-x-1 h-[2px] rounded-full"
        style={{
          top: lineY,
          transformOrigin: rtl ? "right" : "left",
          background: dashed ? `repeating-linear-gradient(90deg, ${color} 0 6px, transparent 6px 11px)` : color,
        }}
        initial={fresh ? { scaleX: 0 } : false}
        animate={{ scaleX: 1 }}
        transition={{ duration: TRAVEL, ease }}
      />

      <motion.svg
        viewBox="0 0 10 10"
        className="absolute size-2.5"
        style={{ top: lineY - 4, [rtl ? "left" : "right"]: 2, color }}
        initial={fresh ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ delay: fresh ? TRAVEL * 0.8 : 0, duration: 0.2 }}
        aria-hidden="true"
      >
        <path d={rtl ? "M9 1 3 5l6 4" : "M1 1l6 4-6 4"} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </motion.svg>

      {fresh && (
        // A full-width carrier slides by its own width, so the packet rides a GPU transform rather than `left`.
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-1 h-0"
          style={{ top: lineY + 1 }}
          initial={{ x: rtl ? "100%" : "-100%", opacity: 1 }}
          animate={{ x: "0%", opacity: [1, 1, 0] }}
          transition={{ x: { duration: TRAVEL, ease }, opacity: { duration: TRAVEL + 0.25, times: [0, 0.8, 1] } }}
        >
          <span
            className="absolute -top-[5px] size-2.5 rounded-full"
            style={{ [rtl ? "left" : "right"]: -5, background: color, boxShadow: `0 0 0 4px color-mix(in oklab, ${color} 22%, transparent), 0 0 16px ${color}` }}
          />
        </motion.span>
      )}
    </div>
  );
}

function SelfBadge({ left, step, fresh }: { left: number; step: SeqStep; fresh: boolean }) {
  const color = toneColor[step.tone ?? "default"];
  return (
    <div className="absolute top-0 h-full" style={{ left: `${left}%` }}>
      <motion.span
        className="absolute top-[18px] left-0 max-w-[9.5rem] -translate-x-1/2 truncate rounded-full border px-2.5 py-1 text-center font-mono text-[10.5px] leading-none font-semibold whitespace-nowrap sm:max-w-none sm:text-[11.5px]"
        style={{
          color,
          borderColor: `color-mix(in oklab, ${color} 45%, transparent)`,
          background: `color-mix(in oklab, ${color} 12%, var(--card))`,
        }}
        initial={fresh ? { opacity: 0, scale: 0.7 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={fresh ? { type: "spring", stiffness: 420, damping: 22 } : { duration: 0 }}
      >
        {step.label}
      </motion.span>
    </div>
  );
}
