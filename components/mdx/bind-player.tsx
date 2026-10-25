"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check, X } from "lucide-react";
import { inline } from "./inline";
import { SETUPS, listensOn, type Bind, type Box } from "./bind-data";
import { PlayerControls, useStepPlayer } from "./step-player";

const BINDS: Bind[] = ["127.0.0.1", "0.0.0.0"];
const EASE = [0.22, 1, 0.36, 1] as const;

function Node({ b, lit, open }: { b: Box; lit: boolean; open?: boolean }) {
  const tone =
    b.kind === "app"
      ? "fill-card stroke-fg"
      : b.kind === "door"
        ? open
          ? "fill-ok-tint stroke-ok"
          : "fill-card stroke-line-strong"
        : b.kind === "forward"
          ? "fill-teal-tint stroke-teal-soft"
          : "fill-card stroke-line-strong";
  return (
    <g>
      <rect
        x={b.x}
        y={b.y}
        width={b.w}
        height={b.h}
        rx="10"
        strokeWidth={lit ? 2.5 : 1.5}
        strokeDasharray={b.kind === "door" && !open ? "5 4" : undefined}
        className={`${tone} transition-[stroke-width] duration-300`}
      />
      <text x={b.x + b.w / 2} y={b.y + b.h / 2 - 4} textAnchor="middle" className="fill-fg text-[15px] font-semibold">
        {b.title}
      </text>
      <text x={b.x + b.w / 2} y={b.y + b.h / 2 + 16} textAnchor="middle" className="fill-subtle font-mono text-[12.5px]">
        {b.sub}
      </text>
    </g>
  );
}

/** Who can reach a server, depending on where it listens: on a laptop, then inside a container. Desktop and tablet only. */
export default function BindPlayer() {
  const [which, setWhich] = useState(0);
  const [bind, setBind] = useState<Bind>("127.0.0.1");
  const setup = SETUPS[which];
  const p = useStepPlayer(setup.trips.length, { delay: 3200 });
  const trip = p.step > 0 ? setup.trips[p.step - 1] : undefined;
  const outcome = trip?.result[bind];
  const open = listensOn(bind, setup);
  const app = setup.boxes.find((b) => b.kind === "app")!;
  const end = trip?.path.at(-1);

  const pick = (i: number) => {
    setWhich(i);
    p.pause();
    p.jump(0);
  };

  return (
    <div
      role="group"
      aria-label="Who can reach the server, depending on the address it listens on. Use Next and Back, or the arrow keys."
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") p.go(p.step + 1);
        if (e.key === "ArrowLeft") p.go(p.step - 1);
      }}
      className="overflow-hidden rounded-2xl border border-line bg-card outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-line bg-bg-soft/70 px-5 py-3">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold">Where is the server listening?</p>
          <p className="font-mono text-[11.5px] text-subtle">
            server.listen(3000, &quot;{bind}&quot;)
          </p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <div className="flex gap-1 rounded-xl border border-line bg-card p-1" role="group" aria-label="Where it runs">
            {SETUPS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={i === which}
                onClick={() => pick(i)}
                className={`rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors ${i === which ? "bg-fg text-bg" : "text-muted hover:bg-bg-soft hover:text-fg"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1 rounded-xl border border-line bg-card p-1" role="group" aria-label="Listening address">
            {BINDS.map((b) => (
              <button
                key={b}
                type="button"
                aria-pressed={b === bind}
                onClick={() => setBind(b)}
                className={`rounded-lg px-3 py-1.5 font-mono text-[12.5px] transition-colors ${b === bind ? "bg-accent text-bg" : "text-muted hover:bg-bg-soft hover:text-fg"}`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-3 pt-3 pb-2 sm:px-5">
        <svg viewBox="0 0 1000 420" className="block h-auto w-full" role="img" aria-label={`${setup.label}, listening on ${bind}`}>
          {setup.frames.map((f) => (
            <g key={f.label}>
              <rect x={f.x} y={f.y} width={f.w} height={f.h} rx="16" strokeWidth="1.5" className="fill-bg-soft/40 stroke-line-strong" />
              <text x={f.x + 16} y={f.y + 24} className="fill-subtle text-[12.5px] font-semibold tracking-wider uppercase">
                {f.label}
              </text>
            </g>
          ))}

          {/* Which interfaces the server is listening on */}
          {setup.boxes
            .filter((b) => b.kind === "door")
            .map((d) => {
              const on = open.includes(d.id);
              return (
                <line
                  key={d.id}
                  x1={d.x + d.w}
                  y1={d.y + d.h / 2}
                  x2={app.x}
                  y2={app.y + app.h / 2}
                  strokeWidth={on ? 2.5 : 1.5}
                  strokeDasharray={on ? undefined : "4 5"}
                  className={`transition-colors duration-300 ${on ? "stroke-ok" : "stroke-line-strong"}`}
                />
              );
            })}

          {setup.boxes.map((b) => (
            <Node key={b.id} b={b} lit={!!trip && (trip.door === b.id || b.kind === "app")} open={open.includes(b.id)} />
          ))}

          {trip && outcome && end && (
            <g key={`${setup.id}-${p.step}-${bind}`}>
              <motion.polyline
                points={trip.path.map(([x, y]) => `${x},${y}`).join(" ")}
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={outcome.ok ? "stroke-accent-soft" : "stroke-bad"}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, ease: EASE }}
              />
              <motion.circle
                r="7"
                className={outcome.ok ? "fill-accent-soft" : "fill-bad"}
                initial={{ cx: trip.path[0][0], cy: trip.path[0][1] }}
                animate={{ cx: trip.path.map((pt) => pt[0]), cy: trip.path.map((pt) => pt[1]) }}
                transition={{ duration: 1.1, ease: EASE }}
              />
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.05, duration: 0.3 }}>
                <circle cx={end[0]} cy={end[1]} r="13" className={outcome.ok ? "fill-ok" : "fill-bad"} />
                <path
                  d={outcome.ok ? `M${end[0] - 6} ${end[1]} l4 4 8-8` : `M${end[0] - 5} ${end[1] - 5} l10 10 m0 -10 l-10 10`}
                  fill="none"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="stroke-bg"
                />
              </motion.g>
            </g>
          )}
        </svg>
        <p className="mt-1 flex flex-wrap gap-x-5 gap-y-1 px-1 text-[12px] text-subtle">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-6 bg-ok" /> listening on this interface
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-6 border-t-[1.5px] border-dashed border-line-strong" /> not listening
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 border-t border-line md:min-h-[10rem] lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]" aria-live="polite">
        <div className="border-b border-line px-5 py-4 lg:border-r lg:border-b-0">
          <p className="eyebrow text-subtle">{trip ? `Step ${p.step} of ${setup.trips.length} · ${trip.who}` : setup.label}</p>
          <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{inline(outcome ? outcome.caption : setup.intro)}</p>
          {!trip && <p className="mt-2 text-[13.5px] text-subtle">Press Next to send the first connection. Switch the listening address at any step to compare.</p>}
        </div>
        <div className="px-5 py-4">
          <p className="eyebrow text-subtle">What the caller gets</p>
          {outcome ? (
            <p
              className={`mt-2 inline-flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-[13px] font-semibold break-all ${
                outcome.ok ? "border-ok/40 bg-ok-tint text-ok" : "border-bad/40 bg-bad-tint text-bad"
              }`}
            >
              {outcome.ok ? <Check className="size-4 shrink-0" /> : <X className="size-4 shrink-0" />}
              {outcome.text}
            </p>
          ) : (
            <p className="mt-2 text-[13.5px] text-subtle">Nothing sent yet.</p>
          )}
        </div>
      </div>

      <PlayerControls step={p.step} last={setup.trips.length} playing={p.playing} onGo={p.go} onToggle={p.toggle} />
    </div>
  );
}
