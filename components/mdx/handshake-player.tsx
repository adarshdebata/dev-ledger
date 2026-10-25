"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Eye, Globe, Lock, Server } from "lucide-react";
import { inline } from "./inline";
import { DISTANCES, SCENARIOS, firstByte, type Layer, type Msg } from "./handshake-data";
import { PlayerControls, useStepPlayer } from "./step-player";

// Diagram geometry, in viewBox units: two lifelines, time flowing down, 108 units per round trip.
const W = 640;
const BX = 120;
const SX = 520;
const TOP = 18;
const PER_RTT = 108;
const MAX_RTT = 4;
const H = TOP + MAX_RTT * PER_RTT + 26;
const y = (rtt: number) => TOP + rtt * PER_RTT;

const STROKE: Record<Layer, string> = {
  tcp: "stroke-teal-soft",
  tls: "stroke-accent-soft",
  quic: "stroke-teal",
  http: "stroke-fg",
};
const DOT: Record<Layer, string> = { tcp: "fill-teal-soft", tls: "fill-accent-soft", quic: "fill-teal", http: "fill-fg" };
const LAYER_NAME: Record<Layer, string> = { tcp: "TCP", tls: "TLS", quic: "QUIC + TLS", http: "HTTP" };

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
const ends = (m: Msg) => {
  const [x1, x2] = m.dir === "out" ? [BX, SX] : [SX, BX];
  return { x1, x2, y1: y(m.at), y2: y(m.at + 0.5) };
};

function LockGlyph({ x, yy }: { x: number; yy: number }) {
  return (
    <g transform={`translate(${x - 5} ${yy - 11})`} aria-hidden="true">
      <path d="M2.5 5V3.5a2.5 2.5 0 0 1 5 0V5" fill="none" strokeWidth="1.3" className="stroke-subtle" />
      <rect x="1" y="5" width="8" height="6" rx="1.4" className="fill-subtle" />
    </g>
  );
}

/** One connection, message by message, with a running count of round trips. Desktop and tablet only. */
export default function HandshakePlayer() {
  const [which, setWhich] = useState(0);
  const [dist, setDist] = useState(2);
  const scenario = SCENARIOS[which];
  const rtt = DISTANCES[dist].rtt;
  const p = useStepPlayer(scenario.msgs.length, { delay: 2800 });
  const msg: Msg | undefined = p.step > 0 ? scenario.msgs[p.step - 1] : undefined;
  const done = p.step === scenario.msgs.length;
  const elapsed = msg ? msg.at + 0.5 : 0;

  const pick = (i: number) => {
    setWhich(i);
    p.pause();
    p.jump(0);
  };

  return (
    <div
      role="group"
      aria-label="The handshakes before the first byte, message by message. Use Next and Back, or the arrow keys."
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") p.go(p.step + 1);
        if (e.key === "ArrowLeft") p.go(p.step - 1);
      }}
      className="overflow-hidden rounded-2xl border border-line bg-card outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line bg-bg-soft/70 px-5 py-3">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold">Before the first byte</p>
          <p className="font-mono text-[11.5px] text-subtle">GET https://api.example.com/orders</p>
        </div>
        <div className="ml-auto flex flex-wrap gap-1 rounded-xl border border-line bg-card p-1" role="group" aria-label="Connection">
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

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        {/* The sequence: browser on the left, server on the right, time flowing down */}
        <div className="border-b border-line px-3 pt-4 pb-3 lg:border-r lg:border-b-0">
          <div className="grid grid-cols-[1fr_1fr] px-[6%] text-[13px] font-semibold">
            <span className="flex items-center gap-2">
              <Globe className="size-4 text-accent" /> Browser
            </span>
            <span className="flex items-center justify-end gap-2">
              Server <Server className="size-4 text-teal" />
            </span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 block h-auto w-full" role="img" aria-label={`${scenario.label}: ${p.step} of ${scenario.msgs.length} messages shown`}>
            {Array.from({ length: MAX_RTT }, (_, i) => i + 1).map((n) => (
              <g key={n}>
                <line x1={BX - 70} x2={SX + 70} y1={y(n)} y2={y(n)} strokeWidth="1" strokeDasharray="3 5" className="stroke-line-strong" />
                <text x={BX - 70} y={y(n) - 6} className="fill-subtle font-mono text-[11px]">
                  {n} RTT
                </text>
                <text x={SX + 70} y={y(n) - 6} textAnchor="end" className="fill-subtle font-mono text-[11px]">
                  {n * rtt} ms
                </text>
              </g>
            ))}
            <line x1={BX} x2={BX} y1={TOP - 8} y2={H - 6} strokeWidth="2" className="stroke-line-strong" />
            <line x1={SX} x2={SX} y1={TOP - 8} y2={H - 6} strokeWidth="2" className="stroke-line-strong" />

            {scenario.msgs.slice(0, p.step).map((m, i) => {
              const { x1, x2, y1, y2 } = ends(m);
              const current = i === p.step - 1;
              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2;
              const head = m.dir === "out" ? -1 : 1;
              return (
                <g key={`${scenario.id}-${i}`} className={`transition-opacity duration-300 ${current ? "" : "opacity-45"}`}>
                  <motion.line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    strokeWidth={current ? 2.6 : 2}
                    strokeLinecap="round"
                    className={STROKE[m.layer]}
                    initial={current ? { pathLength: 0 } : false}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <path
                    d={`M${x2 + head * 9} ${y2 - 5} L${x2} ${y2} L${x2 + head * 9} ${y2 + 5}`}
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={STROKE[m.layer]}
                  />
                  {current && (
                    <motion.circle
                      r="5"
                      className={DOT[m.layer]}
                      initial={{ cx: x1, cy: y1 }}
                      animate={{ cx: x2, cy: y2 }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                  <text
                    x={mx}
                    y={my - 9}
                    textAnchor="middle"
                    className="fill-fg text-[13px] font-semibold"
                    style={{ paintOrder: "stroke", stroke: "var(--card)", strokeWidth: 5, strokeLinejoin: "round" }}
                  >
                    {m.label}
                  </text>
                  {m.sub && (
                    <text
                      x={mx}
                      y={my + 17}
                      textAnchor="middle"
                      className="fill-subtle text-[11px]"
                      style={{ paintOrder: "stroke", stroke: "var(--card)", strokeWidth: 4, strokeLinejoin: "round" }}
                    >
                      {m.sub}
                    </text>
                  )}
                  {m.sealed && <LockGlyph x={m.dir === "out" ? x1 + 18 : x1 - 18} yy={y1 + 4} />}
                </g>
              );
            })}

            {done && (
              <g>
                <line x1={BX - 70} x2={BX} y1={y(firstByte(scenario))} y2={y(firstByte(scenario))} strokeWidth="3" className="stroke-ok" />
                <text x={BX - 70} y={y(firstByte(scenario)) + 16} className="fill-ok text-[12px] font-semibold">
                  First byte
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* The counter, the caption and what the network can see */}
        <div className="flex flex-col px-5 py-5" aria-live="polite">
          <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
            <div>
              <p className="eyebrow text-subtle">Round trips so far</p>
              <p className={`mt-1 font-mono text-[34px] leading-none font-semibold tabular-nums ${done ? "text-ok" : ""}`}>{fmt(elapsed)}</p>
            </div>
            <div className="text-right">
              <p className="eyebrow text-subtle">Time</p>
              <p className={`mt-1 font-mono text-[22px] leading-none font-semibold tabular-nums ${done ? "text-ok" : ""}`}>{Math.round(elapsed * rtt)} ms</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1" role="group" aria-label="Server distance">
            <span className="mr-1 text-[12px] text-subtle">Server:</span>
            {DISTANCES.map((d, i) => (
              <button
                key={d.id}
                type="button"
                aria-pressed={i === dist}
                onClick={() => setDist(i)}
                className={`rounded-md border px-2 py-1 text-[11.5px] transition-colors ${
                  i === dist ? "border-fg bg-fg text-bg" : "border-line text-muted hover:border-line-strong hover:text-fg"
                }`}
              >
                {d.label} · {d.rtt} ms
              </button>
            ))}
          </div>

          <p className="eyebrow mt-5 text-subtle">
            {msg ? `Step ${p.step} of ${scenario.msgs.length} · ${LAYER_NAME[msg.layer]}` : scenario.label}
          </p>
          <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{inline(msg ? msg.caption : scenario.intro)}</p>
          {!msg && <p className="mt-3 text-[13.5px] text-subtle">Press Next, or Play, to send the first message.</p>}

          {msg && (
            <div className={`mt-4 rounded-xl border px-3.5 py-3 ${scenario.id === "http" && msg.layer === "http" ? "border-warn/50 bg-warn-tint" : "border-line bg-bg-soft/60"}`}>
              <p className="flex items-center gap-2 text-[12.5px] font-semibold">
                {msg.sealed ? <Lock className="size-3.5 text-ok" /> : <Eye className="size-3.5 text-warn" />}
                {msg.sealed ? "Encrypted. Someone on the network sees:" : "Someone on the network can read:"}
              </p>
              <ul className="mt-1.5 space-y-1 text-[13px] leading-snug text-muted">
                {msg.seen.map((s) => (
                  <li key={s} className="flex gap-2">
                    <span aria-hidden="true" className="mt-[7px] size-1 shrink-0 rounded-full bg-line-strong" />
                    <span>{inline(s)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {done && (
            <div className="mt-4 rounded-xl border border-ok/40 bg-ok-tint px-3.5 py-3">
              <p className="text-[14px] leading-relaxed text-fg">{inline(scenario.outcome)}</p>
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11.5px] text-muted">
                {SCENARIOS.map((s) => (
                  <li key={s.id} className={`flex justify-between gap-2 ${s.id === scenario.id ? "font-semibold text-fg" : ""}`}>
                    <span>{s.short}</span>
                    <span className="tabular-nums">
                      {fmt(firstByte(s))} RTT · {firstByte(s) * rtt} ms
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <PlayerControls step={p.step} last={scenario.msgs.length} playing={p.playing} onGo={p.go} onToggle={p.toggle} />
    </div>
  );
}
