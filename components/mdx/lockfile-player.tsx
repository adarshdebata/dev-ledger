"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { inline } from "./inline";
import { COLS, PKGS, STEPS, TOTALS, type Col } from "./lockfile-data";
import { PlayerControls, useStepPlayer } from "./step-player";

const EASE = [0.22, 1, 0.36, 1] as const;
const DAYS = ["1 Oct", "October", "1 Nov"];

/** The value in a column: October's for the October install and npm ci, November's for the unlocked install. */
const valueIn = (col: Col, oct: string, nov: string) => (col === "nov" ? nov : oct);

/** One package.json installed a month apart, with and without a lockfile. Desktop and tablet only. */
export default function LockfilePlayer() {
  const p = useStepPlayer(STEPS.length, { delay: 4200 });
  const s = p.step > 0 ? STEPS[p.step - 1] : undefined;
  const day = s?.day ?? 0;
  const show = new Set<Col>(s?.show ?? []);

  return (
    <div
      role="group"
      aria-label="The same package.json installed a month apart, with and without a lockfile. Use Next and Back, or the arrow keys."
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") p.go(p.step + 1);
        if (e.key === "ArrowLeft") p.go(p.step - 1);
      }}
      className="overflow-hidden rounded-2xl border border-line bg-card outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line bg-bg-soft/70 px-5 py-3">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold">Same package.json, a month apart</p>
          <p className="font-mono text-[11.5px] text-subtle">&quot;dependencies&quot;: &#123; &quot;express&quot;: &quot;^5.1.0&quot; &#125;</p>
        </div>
        <p className="ml-auto font-mono text-[11.5px] text-subtle">npm 11.19 · versions as of each date</p>
      </div>

      {/* Timeline */}
      <div className="px-6 pt-5 pb-2" aria-hidden="true">
        <div className="relative h-12">
          <div className="absolute inset-x-[8%] top-3 h-0.5 rounded-full bg-line" />
          <motion.div
            className="absolute top-3 left-[8%] h-0.5 origin-left rounded-full bg-accent-soft"
            initial={false}
            animate={{ width: `${(day / 2) * 84}%` }}
            transition={{ duration: 0.9, ease: EASE }}
          />
          {DAYS.map((d, i) => (
            <div key={d} className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1.5" style={{ left: `${8 + i * 42}%` }}>
              <span
                className={`grid size-6 place-items-center rounded-full border-2 transition-colors duration-500 ${
                  s && i <= day ? "border-accent-soft bg-accent-soft" : "border-line-strong bg-card"
                }`}
              >
                {i === 1 && <span className={`size-1.5 rounded-full ${s && day >= 1 ? "bg-bg" : "bg-line-strong"}`} />}
              </span>
              <span className={`font-mono text-[11.5px] ${s && i === day ? "font-semibold text-fg" : "text-subtle"}`}>{d}</span>
            </div>
          ))}
          {s && day >= 1 && (
            <motion.div
              className="absolute top-[-2px] left-[29%] flex gap-1"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {["5.3.0", "6.17.1", "2.0.1"].map((v) => (
                <span key={v} className="rounded border border-warn/40 bg-warn-tint px-1 font-mono text-[10px] text-warn">
                  {v}
                </span>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 px-5 pb-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="overflow-x-auto rounded-xl border border-line md:min-h-[19rem]">
          <table className="w-full min-w-[34rem] text-left">
            <thead>
              <tr className="border-b border-line text-[12px] text-subtle">
                <th className="px-3.5 py-2 font-semibold">Package</th>
                {COLS.map((c) => (
                  <th key={c.id} className={`px-3 py-2 font-semibold transition-opacity ${show.has(c.id) ? "" : "opacity-40"}`}>
                    <span className="block text-fg">{c.label}</span>
                    <span className="font-mono text-[11px] font-normal">{c.sub}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono text-[12.5px]">
              {PKGS.map((pkg) => (
                <tr key={pkg.name} className="border-b border-line/70">
                  <th scope="row" className="px-3.5 py-1.5 font-normal">
                    <span className="text-fg">{pkg.name}</span>
                    {pkg.note && s?.diff && pkg.oct !== pkg.nov && <span className="ml-2 font-sans text-[11px] text-warn">{pkg.note}</span>}
                  </th>
                  {COLS.map((c) => {
                    const v = valueIn(c.id, pkg.oct, pkg.nov);
                    const changed = c.id === "nov" && !!s?.diff && pkg.oct !== pkg.nov;
                    const same = c.id === "ci" && show.has("ci");
                    return (
                      <td key={c.id} className="px-3 py-1.5">
                        {show.has(c.id) ? (
                          <motion.span
                            key={`${c.id}-${p.step >= 3}`}
                            initial={{ opacity: 0, y: 3 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, ease: EASE }}
                            className={`inline-flex items-center gap-1 rounded px-1.5 ${changed ? "bg-warn-tint font-semibold text-warn" : same ? "text-ok" : "text-fg"}`}
                          >
                            {same && <Check className="size-3" />}
                            {v}
                          </motion.span>
                        ) : (
                          <span className="text-line-strong">·</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="bg-bg-soft/50">
                <th scope="row" className="px-3.5 py-2 font-sans text-[12px] font-semibold text-muted">Packages in total</th>
                {COLS.map((c) => (
                  <td key={c.id} className="px-3 py-2 font-semibold">
                    {show.has(c.id) ? (
                      <span className={c.id === "nov" && s?.diff ? "text-warn" : c.id === "ci" ? "text-ok" : "text-fg"}>
                        {c.id === "nov" ? `${TOTALS.nov} (${TOTALS.changed} differ)` : c.id === "ci" ? `${TOTALS.oct}, 0 differ` : TOTALS.oct}
                      </span>
                    ) : (
                      <span className="text-line-strong">·</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="min-w-0 overflow-hidden rounded-xl border border-code-line bg-code md:min-h-[19rem]">
          <p className="border-b border-code-line px-3.5 py-2 font-mono text-[11px] text-subtle">Terminal</p>
          <div className="space-y-1 px-3.5 py-3 font-mono text-[11.5px] leading-relaxed" aria-live="polite">
            {(s?.term ?? ["$ npm install"]).map((line, i) => (
              <motion.p
                key={`${p.step}-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                className={`break-words ${line.startsWith("npm error") ? "text-bad" : line.startsWith("#") ? "text-subtle" : line.startsWith("$") ? "text-muted" : "text-fg"}`}
              >
                {line}
              </motion.p>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-line px-5 py-4 md:min-h-[7rem]" aria-live="polite">
        <p className={`eyebrow ${s?.bad ? "text-bad" : "text-subtle"}`}>{s ? `Step ${p.step} of ${STEPS.length} · ${s.title}` : "Two installs, one month apart"}</p>
        <p className="mt-2 max-w-[62rem] text-[14.5px] leading-relaxed text-muted">
          {s ? inline(s.caption) : "Press Next, or Play, to install the same package.json on 1 October and again on 1 November: once resolving the ranges afresh, once from the lockfile."}
        </p>
      </div>

      <PlayerControls step={p.step} last={STEPS.length} playing={p.playing} onGo={p.go} onToggle={p.toggle} />
    </div>
  );
}
