"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, FileCode, Folder, FolderOpen, Package, X, type LucideIcon } from "lucide-react";
import { inline } from "./inline";
import { MODES, ROWS, type Mark, type RowKind } from "./require-data";
import { PlayerControls, useStepPlayer } from "./step-player";

const ICON: Record<RowKind, LucideIcon | null> = { dir: Folder, file: FileCode, nm: FolderOpen, ghost: FolderOpen, pkg: Package, more: null };
const EASE = [0.22, 1, 0.36, 1] as const;

const MARK_ROW: Record<Mark, string> = {
  start: "bg-accent-tint ring-1 ring-accent-soft/60",
  miss: "bg-bad-tint/60",
  hit: "bg-ok-tint ring-1 ring-ok/50",
  warn: "bg-warn-tint ring-1 ring-warn/50",
  copy: "bg-teal-tint",
  gone: "",
};

const MARK_LABEL: Partial<Record<Mark, { text: string; cls: string }>> = {
  start: { text: "require() is called here", cls: "text-accent" },
  miss: { text: "not here", cls: "text-bad" },
  hit: { text: "found", cls: "text-ok" },
  warn: { text: "look out", cls: "text-warn" },
  copy: { text: "a copy", cls: "text-teal" },
  gone: { text: "debug isn't listed", cls: "text-warn" },
};

/** require()'s search through node_modules folders, and npm's placement of each copy. Desktop and tablet only. */
export default function RequirePlayer() {
  const [which, setWhich] = useState(0);
  const mode = MODES[which];
  const p = useStepPlayer(mode.steps.length, { delay: 3800 });
  const s = p.step > 0 ? mode.steps[p.step - 1] : undefined;
  const rows = s ? s.rows : mode.steps[0].rows;
  const marks = s?.marks ?? {};

  const pick = (i: number) => {
    setWhich(i);
    p.pause();
    p.jump(0);
  };

  return (
    <div
      role="group"
      aria-label="How require() finds a package, and where npm puts each copy. Use Next and Back, or the arrow keys."
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") p.go(p.step + 1);
        if (e.key === "ArrowLeft") p.go(p.step - 1);
      }}
      className="overflow-hidden rounded-2xl border border-line bg-card outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-line bg-bg-soft/70 px-5 py-3">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold">Inside node_modules</p>
          <p className="font-mono text-[11.5px] text-subtle">npm install express@4 debug@4</p>
        </div>
        <div className="ml-auto flex gap-1 rounded-xl border border-line bg-card p-1" role="group" aria-label="What to watch">
          {MODES.map((m, i) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={i === which}
              onClick={() => pick(i)}
              className={`rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors ${i === which ? "bg-fg text-bg" : "text-muted hover:bg-bg-soft hover:text-fg"}`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        {/* The folder tree */}
        <div className="rounded-xl border border-line py-2 md:min-h-[27rem]">
          <ul className="font-mono text-[12.5px]">
            <AnimatePresence initial={false}>
              {rows.map((id) => {
                const r = ROWS[id];
                const Icon = ICON[r.kind];
                const m = marks[id] as Mark | undefined;
                const label = m ? MARK_LABEL[m] : undefined;
                return (
                  <motion.li
                    key={id}
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className={`mx-2 flex items-center gap-2 rounded-md py-[3px] pr-2 transition-colors duration-300 ${m ? MARK_ROW[m] : ""}`}
                    style={{ paddingLeft: `${0.5 + r.depth * 1.05}rem` }}
                  >
                    {Icon ? (
                      <Icon className={`size-3.5 shrink-0 ${r.kind === "ghost" ? "text-line-strong" : r.kind === "nm" ? "text-teal" : r.kind === "pkg" ? "text-accent" : "text-subtle"}`} />
                    ) : (
                      <span className="w-3.5" />
                    )}
                    <span className={`truncate ${r.kind === "ghost" || r.kind === "more" ? "text-subtle italic" : "text-fg"} ${m === "gone" ? "underline decoration-warn decoration-wavy underline-offset-4" : ""}`}>
                      {r.name}
                      {r.kind === "ghost" && id !== "parent" && <span className="not-italic"> (doesn&apos;t exist)</span>}
                    </span>
                    {r.ver && <span className="shrink-0 rounded border border-line bg-bg-soft px-1.5 text-[11px] text-muted">{r.ver}</span>}
                    {label && (
                      <span className={`ml-auto flex shrink-0 items-center gap-1 font-sans text-[11.5px] font-semibold ${label.cls}`}>
                        {m === "miss" ? <X className="size-3.5" /> : m === "hit" ? <Check className="size-3.5" /> : null}
                        {label.text}
                      </span>
                    )}
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </div>

        {/* What was searched, or what the terminal says */}
        <div className="flex min-w-0 flex-col gap-3">
          {mode.id === "lookup" && (
            <div className="rounded-xl border border-line p-3.5">
              <p className="eyebrow text-subtle">Folders searched, in order</p>
              <ol className="mt-2 space-y-1.5 font-mono text-[12px]">
                {(s?.tried ?? []).map((t, i) => (
                  <motion.li
                    key={`${p.step}-${i}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.12, duration: 0.3 }}
                    className="flex items-start gap-2"
                  >
                    <span className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full ${t.found ? "bg-ok text-bg" : "bg-bad-tint text-bad"}`}>
                      {t.found ? <Check className="size-3" /> : <X className="size-3" />}
                    </span>
                    <span className={`break-all ${t.found ? "text-fg" : "text-muted"}`}>{t.path}</span>
                  </motion.li>
                ))}
                {!s && <li className="text-subtle">Nothing yet: press Next.</li>}
              </ol>
            </div>
          )}
          <div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-code-line bg-code">
            <p className="border-b border-code-line px-3.5 py-2 font-mono text-[11px] text-subtle">Output</p>
            <div className="space-y-0.5 px-3.5 py-3 font-mono text-[11.5px] leading-relaxed">
              {(s?.term ?? []).map((line, i) => (
                <motion.p
                  key={`${which}-${p.step}-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  className={`break-all whitespace-pre-wrap ${line.startsWith("Error") ? "text-bad" : line.startsWith("#") ? "text-subtle" : line.startsWith(">") || line.startsWith("$") ? "text-muted" : "text-fg"}`}
                >
                  {line}
                </motion.p>
              ))}
              {!s?.term && <p className="text-subtle">{s ? "(nothing printed at this step)" : mode.id === "lookup" ? "> require('debug')" : "$ npm install express@4 debug@4"}</p>}
            </div>
          </div>
          {s?.result && (
            <p
              className={`inline-flex items-center gap-2 self-start rounded-lg border px-3 py-2 font-mono text-[13px] font-semibold ${
                s.result.ok ? "border-ok/40 bg-ok-tint text-ok" : "border-bad/40 bg-bad-tint text-bad"
              }`}
            >
              {s.result.ok ? <Check className="size-4 shrink-0" /> : <X className="size-4 shrink-0" />}
              {s.result.text}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-line px-5 py-4 md:min-h-[7rem]" aria-live="polite">
        <p className="eyebrow text-subtle">{s ? `Step ${p.step} of ${mode.steps.length} · ${s.title}` : mode.label}</p>
        <p className="mt-2 max-w-[62rem] text-[14.5px] leading-relaxed text-muted">{inline(s ? s.caption : mode.intro)}</p>
      </div>

      <PlayerControls step={p.step} last={mode.steps.length} playing={p.playing} onGo={p.go} onToggle={p.toggle} />
    </div>
  );
}
