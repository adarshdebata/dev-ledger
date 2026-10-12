import { inline } from "./inline";
import { FRESH, REUSED, STOPS, type StopId } from "./journey-data";
import { JourneyPlayer } from "./lazy";
import { fmtMs, layoutTimings, totalOf } from "./timing";

const STOP_MS: Record<StopId, number> = {
  queue: FRESH.queueing + FRESH.stalled,
  dns: FRESH.dns!,
  tcp: FRESH.tcp!,
  tls: FRESH.ssl!,
  send: FRESH.send!,
  server: FRESH.wait!,
  download: FRESH.download!,
};

/**
 * The seven stops. Laptops and tablets get the step-by-step player, wide on big screens;
 * phones and readers who prefer reduced motion get the same content as plain numbered steps.
 */
export function RequestJourney() {
  return (
    <figure className="not-prose my-10 md:motion-safe:breakout" data-wide>
      <div className="max-md:hidden motion-reduce:hidden">
        <JourneyPlayer />
      </div>
      <JourneySteps />
    </figure>
  );
}

function JourneySteps() {
  return (
    <div className="mx-auto max-w-[45rem] overflow-hidden rounded-2xl border border-line bg-card md:motion-safe:hidden">
      <div className="border-b border-line bg-bg-soft/70 px-4 py-3">
        <p className="text-[14px] font-semibold">One request, seven stops</p>
        <p className="font-mono text-[11.5px] text-subtle">GET https://api.example.com/orders</p>
      </div>
      <ol>
        {STOPS.map((s) => (
          <li key={s.id} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-line px-4 py-4">
            <span className="grid size-8 place-items-center rounded-full border border-accent-soft/50 font-mono text-sm font-semibold text-accent">
              {s.n}
            </span>
            <div className="min-w-0">
              <p className="font-semibold tracking-tight">
                {s.name}: {s.title.charAt(0).toLowerCase() + s.title.slice(1)}
              </p>
              <p className="mt-0.5 font-mono text-[11.5px] text-subtle">
                DevTools: {s.devtools} · {fmtMs(STOP_MS[s.id])}
              </p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{inline(s.text)}</p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                <span className={`font-semibold ${s.breaks.kind === "error" ? "text-bad" : "text-warn"}`}>
                  {s.breaks.kind === "error" ? "When it fails: " : "When it's slow: "}
                </span>
                {s.breaks.console ? (
                  <code className="rounded bg-bad-tint px-1 py-px font-mono text-[0.9em] text-bad [overflow-wrap:anywhere]">{s.breaks.console}</code>
                ) : (
                  inline(s.breaks.text)
                )}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <p className="px-4 py-3.5 text-[14px] leading-relaxed text-muted">
        <span className="font-semibold text-fg">Total: {fmtMs(totalOf(layoutTimings(FRESH)))}.</span> On a connection that&apos;s
        already open, stops 2 to 4 disappear and the same request takes {Math.round(totalOf(layoutTimings(REUSED)))} ms.
      </p>
    </div>
  );
}
