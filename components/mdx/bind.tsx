import { inline } from "./inline";
import { SETUPS } from "./bind-data";
import { BindPlayer } from "./lazy";

/**
 * Who can reach the server. Laptops and tablets get the step-by-step player, wide on big screens;
 * phones and readers who prefer reduced motion get the same results as a numbered list.
 */
export function BindMap() {
  return (
    <figure className="not-prose my-10 md:motion-safe:breakout" data-wide>
      <div className="max-md:hidden motion-reduce:hidden">
        <BindPlayer />
      </div>
      <BindSteps />
    </figure>
  );
}

function BindSteps() {
  let n = 0;
  return (
    <div className="mx-auto max-w-[45rem] overflow-hidden rounded-2xl border border-line bg-card md:motion-safe:hidden">
      <div className="border-b border-line bg-bg-soft/70 px-4 py-3">
        <p className="text-[14px] font-semibold">Where is the server listening?</p>
        <p className="font-mono text-[11.5px] text-subtle">server.listen(3000, &quot;127.0.0.1&quot;) vs &quot;0.0.0.0&quot;</p>
      </div>
      {SETUPS.map((s) => (
        <section key={s.id}>
          <p className="border-b border-line bg-bg-soft/40 px-4 py-2 text-[13px] font-semibold tracking-wide text-muted uppercase">{s.label}</p>
          <ol>
            {s.trips.map((t) => {
              n += 1;
              return (
                <li key={t.who} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-line px-4 py-3.5">
                  <span className="grid size-8 place-items-center rounded-full border border-accent-soft/50 font-mono text-sm font-semibold text-accent">{n}</span>
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-fg">{t.who}</p>
                    <dl className="mt-2 grid gap-2 text-[14px] leading-relaxed">
                      {(t.result["127.0.0.1"].caption === t.result["0.0.0.0"].caption ? (["either"] as const) : (["127.0.0.1", "0.0.0.0"] as const)).map((b) => {
                        const r = t.result[b === "either" ? "0.0.0.0" : b];
                        return (
                          <div key={b}>
                            <dt className="font-mono text-[12.5px] text-subtle">
                              {b === "either" ? "Either address" : `Listening on ${b}`}:{" "}
                              <span className={`font-semibold break-all ${r.ok ? "text-ok" : "text-bad"}`}>{r.text}</span>
                            </dt>
                            <dd className="text-muted">{inline(r.caption)}</dd>
                          </div>
                        );
                      })}
                    </dl>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
