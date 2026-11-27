import { inline } from "./inline";
import { STEPS, pick } from "./install-data";
import { InstallPlayer } from "./lazy";

/**
 * What npm install does. Laptops and tablets get the step-by-step player, wide on big screens;
 * phones and readers who prefer reduced motion get the same nine steps as a numbered list.
 */
export function InstallPipeline() {
  return (
    <figure className="not-prose my-10 md:motion-safe:breakout" data-wide>
      <div className="max-md:hidden motion-reduce:hidden">
        <InstallPlayer />
      </div>
      <InstallSteps />
    </figure>
  );
}

function InstallSteps() {
  return (
    <div className="mx-auto max-w-[45rem] overflow-hidden rounded-2xl border border-line bg-card md:motion-safe:hidden">
      <div className="border-b border-line bg-bg-soft/70 px-4 py-3">
        <p className="text-[14px] font-semibold">What npm install does</p>
        <p className="font-mono text-[11.5px] text-subtle">package.json: &quot;express&quot;: &quot;^5.1.0&quot;, first install</p>
      </div>
      <ol>
        {STEPS.map((s, i) => {
          const lines = pick(s.term, "first");
          const term = [lines.find((l) => !l.startsWith("#")) ?? lines[0]];
          return (
            <li key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-line px-4 py-3.5 last:border-0">
              <span className="grid size-8 place-items-center rounded-full border border-accent-soft/50 font-mono text-sm font-semibold text-accent">{i + 1}</span>
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-fg">{pick(s.title, "first")}</p>
                <p className="mt-1 text-[14.5px] leading-relaxed text-muted">{inline(pick(s.caption, "first"))}</p>
                <p className="mt-2 rounded-md bg-code px-2.5 py-1.5 font-mono text-[11.5px] leading-relaxed break-all text-fg">{term[0]}</p>
                {s.fail && (
                  <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
                    <span className="font-semibold text-bad">Can fail here: </span>
                    {inline(s.fail.caption)}{" "}
                    <code className="font-mono text-[12px] text-bad">{s.fail.term.find((l) => l.startsWith("npm error code"))?.replace("npm error code ", "")}</code>
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
