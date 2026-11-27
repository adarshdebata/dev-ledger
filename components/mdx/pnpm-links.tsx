import { inline } from "./inline";
import { PnpmPlayer } from "./lazy";
import { STEPS } from "./pnpm-data";

/**
 * npm's node_modules beside pnpm's. Laptops and tablets get the step-by-step player, wide on big screens;
 * phones and reduced motion get the same steps as a numbered list, each with what the terminal showed.
 */
export function PnpmLinks() {
  return (
    <figure className="not-prose my-10 md:motion-safe:breakout" data-wide>
      <div className="max-md:hidden motion-reduce:hidden">
        <PnpmPlayer />
      </div>
      <PnpmSteps />
    </figure>
  );
}

function PnpmSteps() {
  return (
    <div className="mx-auto max-w-[45rem] overflow-hidden rounded-2xl border border-line bg-card md:motion-safe:hidden">
      <div className="border-b border-line bg-bg-soft/70 px-4 py-3">
        <p className="text-[14px] font-semibold">One package.json, two node_modules</p>
        <p className="font-mono text-[11.5px] text-subtle">&quot;express&quot;: &quot;^4.22.3&quot; with npm 11 and pnpm 12</p>
      </div>
      <ol>
        {STEPS.map((s, i) => (
          <li key={s.title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-line px-4 py-3.5 last:border-0">
            <span className="grid size-8 place-items-center rounded-full border border-accent-soft/50 font-mono text-sm font-semibold text-accent">{i + 1}</span>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-fg">{s.title}</p>
              <p className="mt-1 text-[14.5px] leading-relaxed text-muted">{inline(s.caption)}</p>
              <pre className="mt-2 overflow-x-auto rounded-md bg-code px-2.5 py-1.5 font-mono text-[11.5px] leading-relaxed text-fg">
                {s.term.filter((l) => !l.startsWith("#")).slice(0, 3).join("\n")}
              </pre>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
