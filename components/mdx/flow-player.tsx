"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { AppWindow, Boxes, Check, Cloud, Network, Server, Split, X, type LucideIcon } from "lucide-react";
import { inline } from "./inline";
import type { ActorIcon, FlowData, FlowMsg, Tone } from "./flow-data";
import { PlayerControls, useStepPlayer } from "./step-player";

const ICONS: Record<ActorIcon, LucideIcon> = { browser: AppWindow, proxy: Network, server: Server, balancer: Split, edge: Cloud, origin: Server, service: Boxes };
const EASE = [0.22, 1, 0.36, 1] as const;

const LINE: Record<Tone, string> = { default: "bg-accent-soft", ok: "bg-ok", bad: "bg-bad", warn: "bg-warn", muted: "bg-line-strong" };
const TEXT: Record<Tone, string> = { default: "text-accent", ok: "text-ok", bad: "text-bad", warn: "text-warn", muted: "text-subtle" };
const PILL: Record<Tone, string> = {
  default: "border-accent-soft/50 text-accent",
  ok: "border-ok/50 text-ok",
  bad: "border-bad/50 text-bad",
  warn: "border-warn/50 text-warn",
  muted: "border-line-strong text-subtle",
};

function Message({ m, cols, delay }: { m: FlowMsg; cols: string[]; delay: number }) {
  const tone = m.tone ?? "default";
  const a = cols.indexOf(m.from);
  const b = cols.indexOf(m.to);
  const centre = (i: number) => ((i + 0.5) / cols.length) * 100;
  if (a === b) {
    return (
      <div className="relative h-9">
        <motion.span
          className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md border bg-card px-2 py-0.5 font-mono text-[11.5px] font-medium whitespace-nowrap ${PILL[tone]}`}
          style={{ left: `${centre(a)}%` }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay, duration: 0.4 }}
        >
          ↻ {m.label}
        </motion.span>
      </div>
    );
  }
  const left = Math.min(centre(a), centre(b));
  const width = Math.abs(centre(b) - centre(a));
  const rtl = b < a;
  return (
    <div className="relative h-9">
      <motion.div
        className={`absolute top-[22px] h-[2.5px] rounded-full ${LINE[tone]}`}
        style={{ left: `${left}%`, width: `${width}%`, transformOrigin: rtl ? "right" : "left" }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay, duration: 0.7, ease: EASE }}
      />
      <motion.span
        className={`absolute top-[17px] text-[12px] leading-none ${TEXT[tone]} ${rtl ? "" : "-translate-x-full"}`}
        style={{ left: `${centre(b)}%` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.6 }}
      >
        {tone === "bad" ? <X className="size-3.5" strokeWidth={3} /> : rtl ? "◀" : "▶"}
      </motion.span>
      <motion.span
        className={`absolute top-0 max-w-[90%] -translate-x-1/2 truncate rounded-md border bg-card px-1.5 py-0.5 font-mono text-[11.5px] leading-tight font-medium whitespace-nowrap ${PILL[tone]}`}
        style={{ left: `${left + width / 2}%` }}
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.15, duration: 0.35 }}
      >
        {m.label}
      </motion.span>
    </div>
  );
}

/** Actors in columns, messages as arrows, one scenario at a time. Desktop and tablet only. */
export default function FlowPlayer({ data }: { data: FlowData }) {
  const [which, setWhich] = useState(0);
  const sc = data.scenarios[which];
  const p = useStepPlayer(sc.steps.length, { delay: 4200 });
  const s = p.step > 0 ? sc.steps[p.step - 1] : undefined;
  const cols = data.actors.map((a) => a.id);
  const meters = s?.meters;
  const scale = meters ? Math.max(6, ...Object.values(meters)) : 1;
  const lanes = Math.max(3, ...data.scenarios.flatMap((x) => x.steps.map((y) => y.msgs?.length ?? 0)));

  const pick = (i: number) => {
    setWhich(i);
    p.pause();
    p.jump(0);
  };

  return (
    <div
      role="group"
      aria-label={`${data.title}. Use Next and Back, or the arrow keys.`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") p.go(p.step + 1);
        if (e.key === "ArrowLeft") p.go(p.step - 1);
      }}
      className="overflow-hidden rounded-2xl border border-line bg-card outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
    >
      <div className="flex flex-wrap items-start gap-x-5 gap-y-3 border-b border-line bg-bg-soft/70 px-5 py-3">
        <div className="min-w-0 pt-1">
          <p className="text-[14px] font-semibold">{data.title}</p>
          <p className="font-mono text-[11.5px] text-subtle">{data.sub}</p>
        </div>
        <div className="ml-auto flex max-w-full flex-wrap justify-end gap-1 rounded-xl border border-line bg-card p-1" role="group" aria-label="Scenario">
          {data.scenarios.map((x, i) => (
            <button
              key={x.id}
              type="button"
              aria-pressed={i === which}
              onClick={() => pick(i)}
              className={`rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium whitespace-nowrap transition-colors ${i === which ? "bg-fg text-bg" : "text-muted hover:bg-bg-soft hover:text-fg"}`}
            >
              {x.label}
            </button>
          ))}
        </div>
      </div>

      {/* Actors */}
      <div className="grid gap-3 px-5 pt-5" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }}>
        {data.actors.map((a) => {
          const Icon = ICONS[a.icon];
          const badge = s?.badges?.[a.id];
          const busy = !!s?.msgs?.some((m) => m.from === a.id || m.to === a.id);
          const value = meters?.[a.id];
          return (
            <div key={a.id} className="flex min-w-0 flex-col items-center text-center">
              <span
                className={`grid size-11 place-items-center rounded-xl border-2 transition-colors duration-300 ${busy ? "border-accent-soft bg-accent-tint text-accent" : "border-line bg-card text-subtle"}`}
              >
                <Icon className="size-5" />
              </span>
              <p className="mt-1.5 text-[13.5px] font-semibold">{a.label}</p>
              {a.sub && <p className="font-mono text-[11px] text-subtle">{a.sub}</p>}
              <div className="mt-1.5 flex min-h-[1.6rem] items-start justify-center">
                {badge && (
                  <motion.span
                    key={`${which}-${p.step}-${a.id}`}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className={`rounded-md border px-1.5 py-0.5 text-[11.5px] leading-snug ${PILL[badge.tone ?? "muted"]} ${badge.tone ? "" : "bg-bg-soft"}`}
                  >
                    {inline(badge.text)}
                  </motion.span>
                )}
              </div>
              {data.meterMax && a.icon === "server" && (
                <div className="mt-1 w-full max-w-[9rem]">
                  <div className="h-2 overflow-hidden rounded-full bg-line">
                    <motion.div className="h-full rounded-full bg-accent-soft" initial={false} animate={{ width: `${((value ?? 0) / scale) * 100}%` }} transition={{ duration: 0.6, ease: EASE }} />
                  </div>
                  <p className="mt-1 font-mono text-[12px] font-semibold text-fg tabular-nums">{value ?? 0} req</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Messages for this step, drawn one after another */}
      <div className="relative mx-5 mt-3 mb-1 border-t border-dashed border-line pt-2" style={{ minHeight: `${lanes * 2.25 + 0.5}rem` }}>
        <div className="pointer-events-none absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))` }} aria-hidden="true">
          {cols.map((c) => (
            <span key={c} className="mx-auto w-px bg-line" />
          ))}
        </div>
        <div className="relative">
          {(s?.msgs ?? []).map((m, i) => (
            <Message key={`${which}-${p.step}-${i}`} m={m} cols={cols} delay={0.1 + i * 0.6} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 border-t border-line lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="border-b border-line px-5 py-4 md:min-h-[9rem] lg:border-r lg:border-b-0" aria-live="polite">
          <p className="eyebrow text-subtle">{s ? `Step ${p.step} of ${sc.steps.length} · ${s.title}` : sc.label}</p>
          <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{inline(s ? s.caption : sc.intro)}</p>
          {!s && <p className="mt-2 text-[13.5px] text-subtle">Press Next, or Play. Switch scenarios at the top.</p>}
          {s?.result && (
            <p
              className={`mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 font-mono text-[13px] font-semibold ${
                s.result.ok ? "border-ok/40 bg-ok-tint text-ok" : "border-bad/40 bg-bad-tint text-bad"
              }`}
            >
              {s.result.ok ? <Check className="size-4 shrink-0" /> : <X className="size-4 shrink-0" />}
              {s.result.text}
            </p>
          )}
        </div>
        <div className="min-w-0 bg-code">
          <p className="border-b border-code-line px-5 py-2 font-mono text-[11px] text-subtle">{data.logTitle}</p>
          <div className="space-y-1 px-5 py-3 font-mono text-[11.5px] leading-relaxed">
            {(s?.log ?? []).map((line, i) => (
              <motion.p
                key={`${which}-${p.step}-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.12 }}
                className={`break-words ${line.includes("[error]") ? "text-bad" : line.includes("[warn]") ? "text-warn" : line.startsWith("#") ? "text-subtle" : "text-fg"}`}
              >
                {line}
              </motion.p>
            ))}
            {!s?.log?.length && <p className="text-subtle">{s ? "(nothing logged at this step)" : "…"}</p>}
          </div>
        </div>
      </div>

      <PlayerControls step={p.step} last={sc.steps.length} playing={p.playing} onGo={p.go} onToggle={p.toggle} />
    </div>
  );
}
