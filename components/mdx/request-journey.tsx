"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Cable, Check, Download, Hourglass, Lock, Send, Server, Signpost, X, XCircle, type LucideIcon } from "lucide-react";
import { inline } from "./inline";
import { READY, STOPS, journeyRows, type Stop, type StopId } from "./journey-data";
import { PlayerControls, useStepPlayer } from "./step-player";
import { TimingRows, fmtMs } from "./timing";

const ICONS: Record<StopId, LucideIcon> = { queue: Hourglass, dns: Signpost, tcp: Cable, tls: Lock, send: Send, server: Server, download: Download };

const sequenceFor = (reused: boolean) => STOPS.filter((s) => !(reused && s.setup));

/** One request, stop by stop, with the DevTools Timing rows filling in underneath. Desktop and tablet only. */
export default function RequestJourney() {
  const [reused, setReused] = useState(false);
  const [broken, setBroken] = useState(false);
  const sequence = useMemo(() => sequenceFor(reused), [reused]);
  const p = useStepPlayer(sequence.length, { onMove: () => setBroken(false) });

  const current: Stop | undefined = p.step > 0 ? sequence[Math.min(p.step, sequence.length) - 1] : undefined;
  const brokenStop = broken && current ? current : null;
  const failed = brokenStop?.breaks.kind === "error";
  const done = p.step === sequence.length && !brokenStop;
  const at = current?.n ?? 0;
  const { rows, scale, elapsed } = journeyRows(reused, at, brokenStop);

  const toggleReused = () => {
    const next = sequenceFor(!reused);
    setBroken(false);
    p.pause();
    setReused(!reused);
    // Stay on the same stop if it still exists, otherwise on the last one before it.
    p.jump(next.filter((s) => s.n <= at).length);
  };

  const chip = !current
    ? { text: "Enter ↵", cls: "border-line-strong bg-card text-muted" }
    : failed
      ? { text: "failed", cls: "border-bad bg-bad text-white" }
      : brokenStop
        ? { text: "slow…", cls: "border-warn bg-warn text-white" }
        : done
          ? { text: "200 OK", cls: "border-ok bg-ok text-white" }
          : { text: "GET /orders", cls: "border-accent-soft bg-accent-soft text-white" };

  const x = (n: number) => ((n - 0.5) / STOPS.length) * 100;

  return (
    <div
      role="group"
      aria-label="One request, seven stops. Use Next and Back, or the arrow keys."
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") p.go(p.step + 1);
        if (e.key === "ArrowLeft") p.go(p.step - 1);
      }}
      className="overflow-hidden rounded-2xl border border-line bg-card outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
    >
      {/* Title and toggles */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line bg-bg-soft/70 px-5 py-3">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold">One request, seven stops</p>
          <p className="font-mono text-[11.5px] text-subtle">GET https://api.example.com/orders</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-2">
          <Switch label="Reused connection" on={reused} onClick={toggleReused} />
          <Switch
            label="Break this stop"
            on={broken}
            disabled={!current}
            onClick={() => {
              p.pause();
              setBroken((b) => !b);
            }}
          />
        </div>
      </div>

      {/* The journey */}
      <div className="px-4 pt-5 pb-4 lg:px-8">
        <div className="relative">
          {/* the request, riding above the stop it's at */}
          <div className="relative h-8">
            <span
              className={`absolute top-0 -translate-x-1/2 rounded-full border px-2.5 py-1 font-mono text-[11px] leading-none font-semibold whitespace-nowrap transition-[left,background-color,border-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${chip.cls}`}
              style={{ left: `${x(Math.max(1, at))}%` }}
            >
              {chip.text}
            </span>
          </div>
          {/* rail */}
          <span aria-hidden="true" className="absolute top-[54px] h-[2px] bg-line" style={{ left: `${x(1)}%`, right: `${x(1)}%` }} />
          <span
            aria-hidden="true"
            className="absolute top-[54px] h-[2px] origin-left bg-accent-soft transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ left: `${x(1)}%`, right: `${x(1)}%`, transform: `scaleX(${at <= 1 ? 0 : (at - 1) / (STOPS.length - 1)})` }}
          />
          <ol className="relative grid grid-cols-7">
            {STOPS.map((s) => {
              const Icon = ICONS[s.id];
              const skipped = reused && s.setup;
              const isCurrent = current?.id === s.id;
              const passed = !skipped && at > s.n;
              const after = failed && s.n > at;
              const ring = skipped
                ? "border-dashed border-line-strong bg-card text-subtle"
                : isCurrent && failed
                  ? "border-bad bg-bad-tint text-bad"
                  : isCurrent && brokenStop
                    ? "border-warn bg-warn-tint text-warn"
                    : isCurrent
                      ? "border-accent-soft bg-accent-tint text-accent ring-4 ring-accent-tint"
                      : passed
                        ? "border-line-strong bg-bg-soft text-fg"
                        : "border-line bg-card text-subtle";
              return (
                <li key={s.id} className={`flex flex-col items-center text-center transition-opacity duration-300 ${skipped || after ? "opacity-50" : ""}`}>
                  <span className={`relative grid size-11 place-items-center rounded-full border-2 transition-colors duration-300 ${ring}`}>
                    <Icon className="size-[18px]" />
                    {passed && (
                      <span className="absolute -right-1 -bottom-1 grid size-4 place-items-center rounded-full bg-ok text-white">
                        <Check className="size-2.5" strokeWidth={3.5} />
                      </span>
                    )}
                    {isCurrent && failed && (
                      <span className="absolute -right-1 -bottom-1 grid size-4 place-items-center rounded-full bg-bad text-white">
                        <X className="size-2.5" strokeWidth={3.5} />
                      </span>
                    )}
                  </span>
                  <span className="mt-2 text-[13px] leading-tight font-semibold">
                    <span className="font-mono text-[11px] text-subtle">{s.n} </span>
                    {s.name}
                  </span>
                  <span className="mt-0.5 hidden px-1 font-mono text-[10.5px] leading-tight text-subtle lg:block">{skipped ? "skipped: reused" : s.where}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* What's happening, and what DevTools shows for it */}
      <div className="grid grid-cols-1 border-t border-line lg:min-h-[23rem] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="border-b border-line px-5 py-5 lg:border-r lg:border-b-0" aria-live="polite">
          <p className="eyebrow text-subtle">{current ? `Stop ${current.n} of 7` : "Ready"}</p>
          <h3 className="mt-2 text-[19px] leading-snug font-semibold tracking-tight">{current ? current.title : READY.title}</h3>
          {current && (
            <p className="mt-2 inline-block rounded-md border border-line bg-bg-soft px-2 py-1 font-mono text-[11.5px] text-muted">
              DevTools: {current.devtools}
            </p>
          )}
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{inline(current ? current.text : READY.text)}</p>
          {reused && current?.id === "queue" && !brokenStop && (
            <p className="mt-3 text-[14px] leading-relaxed font-medium text-teal">
              A connection to this server is already open, so DNS, TCP and TLS are skipped. Their rows vanish from DevTools.
            </p>
          )}
          {brokenStop && <BreakNote stop={brokenStop} />}
          {done && (
            <p className="mt-4 rounded-xl border border-ok/40 bg-ok-tint px-3.5 py-3 text-[14px] leading-relaxed text-fg">
              {reused
                ? "Done in 729 ms. Same server, same work, but no DNS, TCP or TLS this time: the connection was already open."
                : "Done in 1.16 s. The server itself worked for about 490 ms. The rest was the journey: finding the server, connecting, and the trips across the network."}
            </p>
          )}
        </div>
        <div className="px-4 py-5 sm:px-5">
          <p className="eyebrow mb-3 pl-3 text-subtle">DevTools · Network · Timing</p>
          <TimingRows
            rows={rows}
            scale={scale}
            footer={
              <>
                <span className={`text-[12.5px] font-semibold ${failed ? "text-bad" : done ? "text-ok" : ""}`}>
                  {failed ? "Failed after" : done ? "Total" : "So far"}
                </span>
                <span className={`pr-2 font-mono text-[12px] font-semibold tabular-nums ${failed ? "text-bad" : done ? "text-ok" : ""}`}>
                  {at === 0 ? "–" : fmtMs(elapsed)}
                </span>
              </>
            }
          />
        </div>
      </div>

      <PlayerControls step={p.step} last={sequence.length} playing={p.playing} onGo={p.go} onToggle={p.toggle} />
    </div>
  );
}

function BreakNote({ stop }: { stop: Stop }) {
  const error = stop.breaks.kind === "error";
  return (
    <div className={`mt-4 rounded-xl border px-3.5 py-3 ${error ? "border-bad/40 bg-bad-tint" : "border-warn/40 bg-warn-tint"}`}>
      <p className={`flex items-center gap-1.5 text-[13px] font-semibold ${error ? "text-bad" : "text-warn"}`}>
        {error ? <XCircle className="size-4" /> : <AlertTriangle className="size-4" />}
        {error ? "The request fails here" : "Slow, but not broken"}
      </p>
      <p className="mt-1 text-[14px] leading-relaxed text-fg">{inline(stop.breaks.text)}</p>
      {stop.breaks.console && (
        <p className="mt-2.5 rounded-md border border-bad/25 bg-card px-2.5 py-1.5 font-mono text-[12px] break-words text-bad">
          Failed to load resource: {stop.breaks.console}
        </p>
      )}
      {stop.breaks.page && <p className="mt-2 text-[12.5px] leading-relaxed text-muted">If it&apos;s the page itself, Chrome shows: “{stop.breaks.page}”</p>}
    </div>
  );
}

function Switch({ label, on, onClick, disabled }: { label: string; on: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-2 text-[13px] font-medium text-muted transition-colors hover:text-fg disabled:opacity-40 disabled:hover:text-muted"
    >
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${on ? "bg-accent-soft" : "bg-line-strong"}`}>
        <span className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform duration-200 ${on ? "translate-x-4" : ""}`} />
      </span>
      {label}
    </button>
  );
}
