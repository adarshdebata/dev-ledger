"use client";

import { useState } from "react";
import { AppWindow, BadgeCheck, Laptop, Layers, Network, Router, type LucideIcon } from "lucide-react";
import { inline } from "./inline";
import { SCENARIOS, STOPS, type Hop, type StopIndex } from "./dns-data";
import { PlayerControls, useStepPlayer } from "./step-player";

const ICONS: LucideIcon[] = [AppWindow, Laptop, Router, Network, Layers, BadgeCheck];

const CHIP: Record<Hop["kind"], string> = {
  ask: "border-accent-soft bg-accent-soft text-white",
  answer: "border-ok bg-ok text-white",
  check: "border-line-strong bg-card text-muted",
  bad: "border-bad bg-bad text-white",
  fix: "border-teal bg-teal text-white",
};

const x = (i: number) => ((i + 0.5) / STOPS.length) * 100;

/** One DNS lookup, hop by hop. Pick a scenario; every Next moves the question out or the answer back. */
export default function DnsLookup() {
  const [which, setWhich] = useState(0);
  const scenario = SCENARIOS[which];
  const p = useStepPlayer(scenario.hops.length, { delay: 2300 });
  const hop: Hop | undefined = p.step > 0 ? scenario.hops[p.step - 1] : undefined;
  const done = p.step === scenario.hops.length;
  const elapsed = scenario.hops.slice(0, p.step).reduce((t, h) => t + h.ms, 0);
  const involved = new Set(scenario.hops.flatMap((h) => [h.from, h.to]));
  const reached = new Set(scenario.hops.slice(0, p.step).flatMap((h) => [h.from, h.to]));
  const at = hop ? hop.to : 0;
  const failed = hop?.kind === "bad";

  const pick = (i: number) => {
    setWhich(i);
    p.pause();
    p.jump(0);
  };

  return (
    <div
      role="group"
      aria-label="One DNS lookup, hop by hop. Use Next and Back, or the arrow keys."
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") p.go(p.step + 1);
        if (e.key === "ArrowLeft") p.go(p.step - 1);
      }}
      className="overflow-hidden rounded-2xl border border-line bg-card outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line bg-bg-soft/70 px-5 py-3">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold">One lookup, hop by hop</p>
          <p className="font-mono text-[11.5px] text-subtle">What is the address of {scenario.question}?</p>
        </div>
        <div className="ml-auto flex flex-wrap gap-1 rounded-xl border border-line bg-card p-1" role="group" aria-label="Scenario">
          {SCENARIOS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={i === which}
              onClick={() => pick(i)}
              className={`rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                i === which ? "bg-fg text-bg" : "text-muted hover:bg-bg-soft hover:text-fg"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* The stops, with the question or answer riding above the stop it's at */}
      <div className="px-4 pt-5 pb-4 lg:px-8">
        <div className="relative">
          <div className="relative h-8">
            <span
              className={`absolute top-0 max-w-[13rem] -translate-x-1/2 truncate rounded-full border px-2.5 py-1 font-mono text-[11px] leading-none font-semibold whitespace-nowrap transition-[left,background-color,border-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                hop ? CHIP[hop.kind] : "border-line-strong bg-card text-muted"
              }`}
              style={{ left: `${x(at)}%` }}
            >
              {hop ? hop.chip : `${scenario.question}?`}
            </span>
          </div>
          <span aria-hidden="true" className="absolute top-[54px] h-[2px] bg-line" style={{ left: `${x(0)}%`, right: `${x(0)}%` }} />
          <ol className="relative grid grid-cols-6">
            {STOPS.map((s, i) => {
              const Icon = ICONS[i];
              const isAt = hop && i === at;
              const skipped = !involved.has(i as StopIndex);
              const ring = isAt
                ? failed
                  ? "border-bad bg-bad-tint text-bad"
                  : "border-accent-soft bg-accent-tint text-accent ring-4 ring-accent-tint"
                : reached.has(i as StopIndex)
                  ? "border-line-strong bg-bg-soft text-fg"
                  : "border-line bg-card text-subtle";
              return (
                <li key={s.id} className={`flex flex-col items-center text-center transition-opacity duration-300 ${skipped ? "opacity-40" : ""}`}>
                  <span className={`grid size-11 place-items-center rounded-full border-2 transition-colors duration-300 ${skipped ? "border-dashed border-line-strong bg-card text-subtle" : ring}`}>
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="mt-2 text-[13px] leading-tight font-semibold">{s.name}</span>
                  <span className="mt-0.5 hidden px-1 font-mono text-[10.5px] leading-tight text-subtle lg:block">{skipped ? "not asked" : s.where}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="grid grid-cols-1 border-t border-line lg:min-h-[19rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="border-b border-line px-5 py-5 lg:border-r lg:border-b-0" aria-live="polite">
          <p className="eyebrow text-subtle">{hop ? `Step ${p.step} of ${scenario.hops.length}` : scenario.label}</p>
          <p className="mt-2.5 text-[15px] leading-relaxed text-muted">{inline(hop ? hop.caption : scenario.intro)}</p>
          {!hop && <p className="mt-3 text-[13.5px] text-subtle">Press Next, or Play, to follow the question.</p>}
          {done && (
            <p
              className={`mt-4 rounded-xl border px-3.5 py-3 text-[14px] leading-relaxed text-fg ${
                scenario.id === "liar" ? "border-teal/40 bg-teal-tint" : "border-ok/40 bg-ok-tint"
              }`}
            >
              {scenario.outcome}
            </p>
          )}
        </div>
        <div className="flex flex-col px-4 py-5 sm:px-5">
          <p className="eyebrow mb-3 text-subtle">What was asked and answered</p>
          <ol className="flex-1 space-y-1.5 font-mono text-[12px] leading-relaxed">
            {scenario.hops.slice(0, p.step).map((h, i) => (
              <li
                key={i}
                className={`rounded-md px-2.5 py-1 break-words ${
                  i === p.step - 1 ? "bg-accent-tint text-fg" : "text-muted"
                } ${h.kind === "bad" ? "text-bad" : h.kind === "fix" ? "text-teal" : ""}`}
              >
                {h.log}
              </li>
            ))}
            {p.step === 0 && <li className="px-2.5 py-1 text-subtle">Nothing asked yet.</li>}
          </ol>
          <div className="mt-3 flex items-center justify-between border-t border-line-strong pt-2 pl-2.5">
            <span className={`text-[12.5px] font-semibold ${done ? "text-ok" : ""}`}>{done ? "Total" : "So far"}</span>
            <span className={`pr-2 font-mono text-[12px] font-semibold tabular-nums ${done ? "text-ok" : ""}`}>{p.step === 0 ? "–" : `${elapsed} ms`}</span>
          </div>
        </div>
      </div>

      <PlayerControls step={p.step} last={scenario.hops.length} playing={p.playing} onGo={p.go} onToggle={p.toggle} />
    </div>
  );
}
