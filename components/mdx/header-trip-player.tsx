"use client";

import { AppWindow, Cloud, Network, Server, type LucideIcon } from "lucide-react";
import { inline } from "./inline";
import { ROWS, STEPS, STOPS, bornAt, stepOf, type Act, type Row, type StopId } from "./header-trip-data";
import { PlayerControls, useStepPlayer } from "./step-player";

const ICONS: Record<StopId, LucideIcon> = { browser: AppWindow, cdn: Cloud, lb: Network, app: Server };

const ACT_STYLE: Record<Act, string> = {
  sets: "border-accent-soft/50 bg-accent-tint text-accent",
  adds: "border-ok/50 bg-ok-tint text-ok",
  reads: "border-teal-soft/50 bg-teal-tint text-teal",
  removes: "border-line-strong bg-bg-soft text-subtle line-through",
};

function Cell({ row, stop, step }: { row: Row; stop: StopId; step: number }) {
  const at = stepOf(row, stop);
  const a = row.acts[stop];
  if (!a || at === undefined || at > step) return <td className="px-1.5 py-1" />;
  const now = at === step;
  return (
    <td className="px-1.5 py-1">
      <span
        className={`inline-flex max-w-full items-baseline gap-1.5 rounded-md border px-2 py-0.5 leading-snug whitespace-nowrap transition-opacity duration-300 ${ACT_STYLE[a.act]} ${
          now ? "shadow-[0_0_0_3px_var(--accent-tint)]" : "opacity-75"
        }`}
      >
        <span className="text-[11.5px] font-semibold">{a.act}</span>
        <span className="truncate text-[11px] text-muted">{a.why}</span>
      </span>
    </td>
  );
}

/** One request and its response through a CDN and a load balancer, showing who touches each header. */
export default function HeaderTripPlayer() {
  const p = useStepPlayer(STEPS.length, { delay: 3400 });
  const current = p.step > 0 ? STEPS[p.step - 1] : undefined;
  const at = current ? STOPS.findIndex((s) => s.id === current.stop) : 0;
  const removedNow = (r: Row) => {
    const gone = Object.entries(r.acts).find(([, v]) => v?.act === "removes");
    return gone ? (stepOf(r, gone[0] as StopId) ?? Infinity) <= p.step : false;
  };
  // Only the current direction's headers, so the table stays short enough for a laptop screen.
  const dir = current?.dir ?? "req";
  const rows = ROWS.filter((r) => r.dir === dir && bornAt(r) <= p.step);

  return (
    <div
      role="group"
      aria-label="Headers on the way to your app and back. Use Next and Back, or the arrow keys."
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") p.go(p.step + 1);
        if (e.key === "ArrowLeft") p.go(p.step - 1);
      }}
      className="overflow-hidden rounded-2xl border border-line bg-card outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line bg-bg-soft/70 px-5 py-3">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold">Who reads which header</p>
          <p className="font-mono text-[11.5px] text-subtle">GET https://api.example.com/products?page=2</p>
        </div>
        <ul className="ml-auto flex flex-wrap gap-1.5 text-[11.5px]" aria-label="Legend">
          {(["sets", "adds", "reads", "removes"] as const).map((a) => (
            <li key={a} className={`rounded-md border px-2 py-0.5 font-semibold ${ACT_STYLE[a]}`}>
              {a}
            </li>
          ))}
        </ul>
      </div>

      <div className="px-5 py-4" aria-live="polite">
        <p className="flex flex-wrap items-center gap-2.5">
          <span
            className={`rounded-full border px-2.5 py-1 font-mono text-[11px] leading-none font-semibold ${
              !current ? "border-line-strong bg-card text-muted" : current.dir === "req" ? "border-accent bg-accent text-bg" : "border-ok bg-ok text-bg"
            }`}
          >
            {!current ? "fetch()" : current.dir === "req" ? "request →" : "← response"}
          </span>
          <span className="eyebrow text-subtle">{current ? `Step ${p.step} of ${STEPS.length} · ${current.title}` : "One request, four stops"}</span>
        </p>
        <p className="mt-2 max-w-[60rem] text-[14.5px] leading-relaxed text-muted">
          {inline(current ? current.caption : "Press Next, or Play, to send the request and watch each stop pick out the headers it cares about.")}
        </p>
      </div>

      <div className="overflow-x-auto border-t border-line md:min-h-[24rem]">
        <table className="w-full min-w-[44rem] table-fixed text-left">
          <colgroup>
            <col className="w-[34%]" />
            {STOPS.map((s) => (
              <col key={s.id} />
            ))}
          </colgroup>
          <thead>
            <tr className="border-b border-line text-[11.5px] text-subtle">
              <th className="px-4 py-2 align-middle font-semibold">Header</th>
              {STOPS.map((s, i) => {
                const Icon = ICONS[s.id];
                const isAt = current && i === at;
                return (
                  <th key={s.id} className={`px-1.5 py-2 font-semibold transition-colors ${isAt ? "text-accent" : ""}`}>
                    <span className="flex items-center gap-2">
                      <span
                        className={`grid size-8 shrink-0 place-items-center rounded-full border-2 transition-colors duration-300 ${
                          isAt ? "border-accent-soft bg-accent-tint ring-4 ring-accent-tint" : "border-line bg-card"
                        }`}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="text-[12.5px]">{s.name}</span>
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          {rows.length > 0 && (
            <tbody>
              <tr>
                <th colSpan={5} className="bg-bg-soft/60 px-4 py-1.5 text-[11px] font-semibold tracking-wider text-subtle uppercase">
                  {dir === "req" ? "Request headers" : "Response headers"}
                </th>
              </tr>
              {rows.map((r) => (
                <tr key={r.name} className="border-b border-line/70">
                  <th scope="row" className={`px-4 py-1 font-normal ${removedNow(r) ? "opacity-60" : ""}`}>
                    <span className="flex min-w-0 items-baseline gap-2 font-mono">
                      <span className={`shrink-0 text-[12px] font-semibold text-fg ${removedNow(r) ? "line-through" : ""}`}>{r.name}</span>
                      <span className="truncate text-[11px] text-subtle">{r.value}</span>
                    </span>
                  </th>
                  {STOPS.map((s) => (
                    <Cell key={s.id} row={r} stop={s.id} step={p.step} />
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
        {p.step === 0 && <p className="px-4 py-6 text-[13.5px] text-subtle">No headers yet: the request hasn't been built.</p>}
      </div>

      <PlayerControls step={p.step} last={STEPS.length} playing={p.playing} onGo={p.go} onToggle={p.toggle} />
    </div>
  );
}
