import { inline } from "./inline";
import { ROWS, STEPS, STOPS, type Act } from "./header-trip-data";
import { HeaderTripPlayer } from "./lazy";

/**
 * Who reads which header. Laptops and tablets get the step-by-step player, wide on big screens;
 * phones and readers who prefer reduced motion get the same story as plain numbered steps.
 */
export function HeaderTrip() {
  return (
    <figure className="not-prose my-10 md:motion-safe:breakout" data-wide>
      <div className="max-md:hidden motion-reduce:hidden">
        <HeaderTripPlayer />
      </div>
      <HeaderSteps />
    </figure>
  );
}

const ORDER: Act[] = ["sets", "adds", "reads", "removes"];

function HeaderSteps() {
  return (
    <div className="mx-auto max-w-[45rem] overflow-hidden rounded-2xl border border-line bg-card md:motion-safe:hidden">
      <div className="border-b border-line bg-bg-soft/70 px-4 py-3">
        <p className="text-[14px] font-semibold">Who reads which header</p>
        <p className="font-mono text-[11.5px] break-all text-subtle">GET https://api.example.com/products?page=2</p>
      </div>
      <ol>
        {STEPS.map((s, i) => {
          const stop = STOPS.find((x) => x.id === s.stop)!;
          const rows = ROWS.filter((r) => r.dir === s.dir && r.acts[s.stop]);
          return (
            <li key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-line px-4 py-3.5 last:border-0">
              <span className="grid size-8 place-items-center rounded-full border border-accent-soft/50 font-mono text-sm font-semibold text-accent">{i + 1}</span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-muted">
                  {stop.name} · {s.dir === "req" ? "request" : "response"}
                </p>
                <p className="mt-0.5 text-[15px] font-semibold text-fg">{s.title}</p>
                <p className="mt-1 text-[14.5px] leading-relaxed text-muted">{inline(s.caption)}</p>
                {rows.length > 0 && (
                  <ul className="mt-2 space-y-1 text-[13px] leading-snug text-subtle">
                    {ORDER.map((act) => {
                      const these = rows.filter((r) => r.acts[s.stop]!.act === act);
                      if (these.length === 0) return null;
                      return (
                        <li key={act}>
                          <span className="font-semibold text-muted">{act[0].toUpperCase() + act.slice(1)}:</span>{" "}
                          {these.map((r, j) => (
                            <span key={r.name}>
                              <code className="font-mono text-[12px] text-fg">{r.name}</code> ({r.acts[s.stop]!.why})
                              {j < these.length - 1 && ", "}
                            </span>
                          ))}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
