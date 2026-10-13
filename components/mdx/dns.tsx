import { inline } from "./inline";
import { SCENARIOS, STOPS } from "./dns-data";
import { DnsPlayer } from "./lazy";

/**
 * The DNS lookup. Laptops and tablets get the step-by-step player, wide on big screens;
 * phones and readers who prefer reduced motion get the same story as plain numbered steps.
 */
export function DnsLookup() {
  return (
    <figure className="not-prose my-10 md:motion-safe:breakout" data-wide>
      <div className="max-md:hidden motion-reduce:hidden">
        <DnsPlayer />
      </div>
      <DnsSteps />
    </figure>
  );
}

function DnsSteps() {
  const [cold, ...others] = SCENARIOS;
  return (
    <div className="mx-auto max-w-[45rem] overflow-hidden rounded-2xl border border-line bg-card md:motion-safe:hidden">
      <div className="border-b border-line bg-bg-soft/70 px-4 py-3">
        <p className="text-[14px] font-semibold">One lookup, hop by hop</p>
        <p className="font-mono text-[11.5px] text-subtle">What is the address of api.example.com? ({cold.label.toLowerCase()})</p>
      </div>
      <ol>
        {cold.hops.map((h, i) => (
          <li key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-line px-4 py-3.5">
            <span className="grid size-8 place-items-center rounded-full border border-accent-soft/50 font-mono text-sm font-semibold text-accent">{i + 1}</span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-muted">
                {STOPS[h.from].name}
                {h.from !== h.to && <> → {STOPS[h.to].name}</>}
              </p>
              <p className="mt-1 text-[14.5px] leading-relaxed text-muted">{inline(h.caption)}</p>
              <p className="mt-1.5 font-mono text-[12px] break-words text-subtle">{h.log}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="border-b border-line px-4 py-3.5 text-[14px] leading-relaxed text-muted">
        <span className="font-semibold text-fg">Total: {cold.hops.reduce((t, h) => t + h.ms, 0)} ms.</span> {cold.outcome}
      </p>
      <ul className="px-4 py-3.5 text-[14px] leading-relaxed text-muted">
        {others.map((s) => (
          <li key={s.id} className="mt-1.5 first:mt-0">
            <span className="font-semibold text-fg">{s.label}:</span> {s.outcome}
          </li>
        ))}
      </ul>
    </div>
  );
}
