import { inline } from "./inline";
import { RequirePlayer } from "./lazy";
import { MODES } from "./require-data";

/**
 * How require() searches node_modules, and where npm puts each copy. Laptops and tablets get the
 * step-by-step player, wide on big screens; phones and reduced motion get the same steps as numbered lists.
 */
export function RequireWalk() {
  return (
    <figure className="not-prose my-10 md:motion-safe:breakout" data-wide>
      <div className="max-md:hidden motion-reduce:hidden">
        <RequirePlayer />
      </div>
      <RequireSteps />
    </figure>
  );
}

function RequireSteps() {
  let n = 0;
  return (
    <div className="mx-auto max-w-[45rem] overflow-hidden rounded-2xl border border-line bg-card md:motion-safe:hidden">
      <div className="border-b border-line bg-bg-soft/70 px-4 py-3">
        <p className="text-[14px] font-semibold">Inside node_modules</p>
        <p className="font-mono text-[11.5px] text-subtle">npm install express@4 debug@4</p>
      </div>
      {MODES.map((m) => (
        <section key={m.id}>
          <p className="border-b border-line bg-bg-soft/40 px-4 py-2 text-[13px] font-semibold tracking-wide text-muted uppercase">{m.label}</p>
          <p className="border-b border-line px-4 py-3 text-[14px] leading-relaxed text-muted">{inline(m.intro)}</p>
          <ol>
            {m.steps.map((s) => {
              n += 1;
              return (
                <li key={s.title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-line px-4 py-3.5">
                  <span className="grid size-8 place-items-center rounded-full border border-accent-soft/50 font-mono text-sm font-semibold text-accent">{n}</span>
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-fg">{s.title}</p>
                    <p className="mt-1 text-[14.5px] leading-relaxed text-muted">{inline(s.caption)}</p>
                    {s.tried && (
                      <ul className="mt-2 space-y-0.5 font-mono text-[12px]">
                        {s.tried.map((t) => (
                          <li key={t.path} className={`break-all ${t.found ? "text-ok" : "text-subtle"}`}>
                            {t.found ? "✓" : "✗"} {t.path}
                          </li>
                        ))}
                      </ul>
                    )}
                    {s.result && <p className={`mt-2 font-mono text-[12.5px] font-semibold ${s.result.ok ? "text-ok" : "text-bad"}`}>{s.result.text}</p>}
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
