import { BALANCER, EDGE, PROXY, type FlowData } from "./flow-data";
import { inline } from "./inline";
import { FlowPlayer } from "./lazy";

/**
 * Request-flow scenarios. Laptops and tablets get the step-by-step player, wide on big screens;
 * phones and readers who prefer reduced motion get every scenario as numbered steps.
 */
function FlowFigure({ data }: { data: FlowData }) {
  return (
    <figure className="not-prose my-10 md:motion-safe:breakout" data-wide>
      <div className="max-md:hidden motion-reduce:hidden">
        <FlowPlayer data={data} />
      </div>
      <FlowSteps data={data} />
    </figure>
  );
}

function FlowSteps({ data }: { data: FlowData }) {
  const name = (id: string) => data.actors.find((a) => a.id === id)?.label ?? id;
  return (
    <div className="mx-auto max-w-[45rem] overflow-hidden rounded-2xl border border-line bg-card md:motion-safe:hidden">
      <div className="border-b border-line bg-bg-soft/70 px-4 py-3">
        <p className="text-[14px] font-semibold">{data.title}</p>
        <p className="font-mono text-[11.5px] text-subtle">{data.sub}</p>
      </div>
      {data.scenarios.map((sc) => (
        <section key={sc.id}>
          <p className="border-b border-line bg-bg-soft/40 px-4 py-2 text-[13px] font-semibold tracking-wide text-muted uppercase">{sc.label}</p>
          <p className="border-b border-line px-4 py-3 text-[14px] leading-relaxed text-muted">{inline(sc.intro)}</p>
          <ol>
            {sc.steps.map((s, i) => (
              <li key={s.title} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-line px-4 py-3.5">
                <span className="grid size-8 place-items-center rounded-full border border-accent-soft/50 font-mono text-sm font-semibold text-accent">{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold text-fg">{s.title}</p>
                  <p className="mt-1 text-[14.5px] leading-relaxed text-muted">{inline(s.caption)}</p>
                  {s.msgs && (
                    <ul className="mt-2 space-y-0.5 font-mono text-[12px] text-subtle">
                      {s.msgs.map((m, j) => (
                        <li key={j} className={m.tone === "bad" ? "text-bad" : m.tone === "ok" ? "text-ok" : ""}>
                          {name(m.from)} → {name(m.to)}: {m.label}
                        </li>
                      ))}
                    </ul>
                  )}
                  {s.meters && (
                    <p className="mt-2 font-mono text-[12px] text-fg">
                      {Object.entries(s.meters)
                        .map(([k, v]) => `${name(k)}: ${v}`)
                        .join(" · ")}
                    </p>
                  )}
                  {s.log?.find((l) => !l.startsWith("#")) && (
                    <p className="mt-2 rounded-md bg-code px-2.5 py-1.5 font-mono text-[11.5px] leading-relaxed break-words text-fg">{s.log.find((l) => !l.startsWith("#"))}</p>
                  )}
                  {s.result && <p className={`mt-2 font-mono text-[12.5px] font-semibold ${s.result.ok ? "text-ok" : "text-bad"}`}>{s.result.text}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

export const ProxyFlow = () => <FlowFigure data={PROXY} />;
export const BalancerFlow = () => <FlowFigure data={BALANCER} />;
export const EdgeFlow = () => <FlowFigure data={EDGE} />;
