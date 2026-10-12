/**
 * A slice of Chrome DevTools' Network → Timing tab. The rows and their names match Chrome 154.
 * Plain markup with CSS transitions, so both the static figure and the animated journey use it.
 */

export type Phase = "queueing" | "stalled" | "dns" | "connect" | "ssl" | "send" | "wait" | "download";

/** Milliseconds per phase. `tcp` is the handshake part of "Initial connection"; DevTools draws SSL inside it. */
export type Durations = {
  queueing: number;
  stalled: number;
  dns?: number;
  tcp?: number;
  ssl?: number;
  send?: number;
  wait?: number;
  download?: number;
};

export type TimingRow = {
  phase: Phase;
  start: number;
  dur: number;
  /** How much of the bar is drawn right now (for the step-by-step journey). Defaults to all of it. */
  shown?: number;
  state?: "pending" | "active" | "done";
  problem?: "slow" | "error";
};

const LABELS: Record<Phase, string> = {
  queueing: "Queueing",
  stalled: "Stalled",
  dns: "DNS Lookup",
  connect: "Initial connection",
  ssl: "SSL",
  send: "Request sent",
  wait: "Waiting for server response",
  download: "Content Download",
};

const GROUPS: { title: string; phases: Phase[] }[] = [
  { title: "Resource Scheduling", phases: ["queueing"] },
  { title: "Connection Start", phases: ["stalled", "dns", "connect", "ssl"] },
  { title: "Request/Response", phases: ["send", "wait", "download"] },
];

/** Colour families: waiting in the browser, setting up the connection, the exchange itself. */
const BAR: Record<Phase, string> = {
  queueing: "bg-line-strong",
  stalled: "bg-line-strong",
  dns: "bg-teal-soft/55",
  connect: "bg-teal-soft",
  ssl: "bg-teal",
  send: "bg-accent-soft/60",
  wait: "bg-accent-soft",
  download: "bg-fg/45",
};

export const fmtMs = (ms: number) => (ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${ms.toFixed(2)} ms`);

/** Lays the phases out one after another, the way DevTools does. Missing phases (a reused connection) are left out. */
export function layoutTimings(d: Durations): TimingRow[] {
  const rows: TimingRow[] = [];
  let t = 0;
  const push = (phase: Phase, dur: number | undefined) => {
    if (dur === undefined) return;
    rows.push({ phase, start: t, dur });
    t += dur;
  };
  push("queueing", d.queueing);
  push("stalled", d.stalled);
  push("dns", d.dns);
  if (d.tcp !== undefined) {
    const start = t;
    push("connect", d.tcp + (d.ssl ?? 0));
    if (d.ssl !== undefined) rows.push({ phase: "ssl", start: start + d.tcp, dur: d.ssl });
  }
  push("send", d.send);
  push("wait", d.wait);
  push("download", d.download);
  return rows;
}

/** The request's total time: SSL sits inside Initial connection, so it isn't added twice. */
export const totalOf = (rows: TimingRow[]) => Math.max(0, ...rows.map((r) => r.start + r.dur));

export function TimingRows({ rows, scale, footer }: { rows: TimingRow[]; scale: number; footer: React.ReactNode }) {
  return (
    <div className="text-[12.5px]">
      {GROUPS.map((g) => {
        const groupRows = g.phases.flatMap((p) => rows.filter((r) => r.phase === p));
        if (groupRows.length === 0) return null;
        return (
          <div key={g.title}>
            <div className="mt-3 flex justify-between border-b border-line pb-1 text-[10.5px] font-semibold tracking-wider text-subtle uppercase first:mt-0">
              <span>{g.title}</span>
              <span>Duration</span>
            </div>
            {groupRows.map((r) => {
              const shown = r.shown ?? r.dur;
              const pending = r.state === "pending";
              const tone = r.problem === "error" ? "bg-bad" : r.problem === "slow" ? "bg-warn" : BAR[r.phase];
              return (
                <div
                  key={r.phase}
                  className={`grid grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-x-3 gap-y-1 rounded-md py-[5px] pl-3 transition-colors duration-300 sm:grid-cols-[12.5rem_minmax(0,1fr)_5.5rem] ${
                    r.state === "active" ? "bg-accent-tint" : ""
                  }`}
                >
                  <span
                    className={`truncate ${
                      r.problem === "error" ? "font-semibold text-bad" : r.problem === "slow" ? "font-semibold text-warn" : pending ? "text-subtle" : "text-fg"
                    }`}
                  >
                    {LABELS[r.phase]}
                  </span>
                  <span className="relative order-3 col-span-2 mr-2 h-2.5 rounded-sm bg-bg-soft sm:order-none sm:col-span-1 sm:mr-0">
                    <span
                      className={`absolute inset-y-0 rounded-sm transition-[left,width,background-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${tone}`}
                      style={{
                        left: `${(r.start / scale) * 100}%`,
                        width: shown > 0 ? `max(2px, ${(shown / scale) * 100}%)` : "0%",
                      }}
                    />
                  </span>
                  <span
                    className={`pr-2 text-right font-mono text-[11.5px] tabular-nums ${
                      r.problem === "error" ? "text-bad" : r.problem === "slow" ? "text-warn" : pending ? "text-subtle" : "text-muted"
                    }`}
                  >
                    {pending ? "–" : fmtMs(r.dur)}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
      <div className="mt-3 flex items-center justify-between border-t border-line-strong pt-2 pl-3">{footer}</div>
    </div>
  );
}

/** A static Timing tab for one request, as DevTools shows it after the request has finished. */
export function TimingTab({
  request,
  queuedAt,
  startedAt,
  timings,
  caption,
}: {
  request: string;
  queuedAt: number;
  startedAt: number;
  timings: Durations;
  caption?: string;
}) {
  const rows = layoutTimings(timings);
  const total = totalOf(rows);
  return (
    <figure className="not-prose my-8 overflow-hidden rounded-xl border border-line bg-card">
      <div className="flex items-center gap-3 border-b border-line bg-bg-soft px-3 text-[12px] text-muted">
        <span className="truncate py-2 font-mono text-[11.5px] text-fg">{request}</span>
        <span className="ml-auto hidden gap-4 sm:flex">
          {["Headers", "Preview", "Response", "Initiator"].map((t) => (
            <span key={t} className="py-2">
              {t}
            </span>
          ))}
          <span className="border-b-2 border-accent-soft py-2 text-fg">Timing</span>
        </span>
      </div>
      <div className="px-3 py-3 sm:px-4">
        <p className="mb-3 pl-3 font-mono text-[11.5px] text-subtle">
          Queued at {fmtMs(queuedAt)} · Started at {fmtMs(startedAt)}
        </p>
        <TimingRows
          rows={rows}
          scale={total}
          footer={
            <>
              <span className="text-[12.5px] font-semibold">Total</span>
              <span className="pr-2 font-mono text-[12px] font-semibold tabular-nums">{fmtMs(total)}</span>
            </>
          }
        />
      </div>
      {caption && <figcaption className="border-t border-line bg-bg-soft/50 px-4 py-2.5 text-[13px] text-muted">{caption}</figcaption>}
    </figure>
  );
}
