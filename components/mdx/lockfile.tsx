import { inline } from "./inline";
import { LockfilePlayer } from "./lazy";
import { PKGS, STEPS, TOTALS } from "./lockfile-data";

/**
 * The same package.json installed a month apart. Laptops and tablets get the step-by-step player;
 * phones and reduced motion get the steps as a list and the versions as a plain table.
 */
export function LockfileTimeline() {
  return (
    <figure className="not-prose my-10 md:motion-safe:breakout" data-wide>
      <div className="max-md:hidden motion-reduce:hidden">
        <LockfilePlayer />
      </div>
      <LockfileSteps />
    </figure>
  );
}

function LockfileSteps() {
  return (
    <div className="mx-auto max-w-[45rem] overflow-hidden rounded-2xl border border-line bg-card md:motion-safe:hidden">
      <div className="border-b border-line bg-bg-soft/70 px-4 py-3">
        <p className="text-[14px] font-semibold">Same package.json, a month apart</p>
        <p className="font-mono text-[11.5px] text-subtle">&quot;express&quot;: &quot;^5.1.0&quot;, installed 1 Oct and 1 Nov</p>
      </div>
      <ol>
        {STEPS.map((s, i) => (
          <li key={s.title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-line px-4 py-3.5">
            <span className="grid size-8 place-items-center rounded-full border border-accent-soft/50 font-mono text-sm font-semibold text-accent">{i + 1}</span>
            <div className="min-w-0">
              <p className={`text-[15px] font-semibold ${s.bad ? "text-bad" : "text-fg"}`}>{s.title}</p>
              <p className="mt-1 text-[14.5px] leading-relaxed text-muted">{inline(s.caption)}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-bg-soft/60 text-[12px] text-subtle">
            <tr>
              <th className="px-4 py-2 font-semibold">Package</th>
              <th className="px-3 py-2 font-semibold">1 Oct, and npm ci</th>
              <th className="px-3 py-2 font-semibold">1 Nov, no lockfile</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {PKGS.map((p) => (
              <tr key={p.name} className="border-t border-line">
                <td className="px-4 py-1.5">{p.name}</td>
                <td className="px-3 py-1.5">{p.oct}</td>
                <td className={`px-3 py-1.5 ${p.oct !== p.nov ? "font-semibold text-warn" : ""}`}>{p.nov}</td>
              </tr>
            ))}
            <tr className="border-t border-line font-sans">
              <td className="px-4 py-2 font-semibold">Total</td>
              <td className="px-3 py-2">{TOTALS.oct} packages</td>
              <td className="px-3 py-2 text-warn">
                {TOTALS.nov} packages, {TOTALS.changed} differ
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
