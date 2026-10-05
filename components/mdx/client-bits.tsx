"use client";

import { Children, isValidElement, useId, useRef, useState } from "react";
import { motion } from "motion/react";
import { Check, Copy, HelpCircle, RotateCcw, X } from "lucide-react";
import { inline } from "./inline";

export function CopyButton() {
  const ref = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const pre = ref.current?.closest("figure")?.querySelector("pre");
    if (!pre) return;
    const lines = [...pre.querySelectorAll(".line")].filter((l) => !l.classList.contains("remove"));
    const text = lines.length ? lines.map((l) => l.textContent).join("\n") : (pre.textContent ?? "");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard can be blocked; nothing useful to do */
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={copy}
      className="grid size-7 place-items-center rounded-md border border-transparent text-subtle transition-colors hover:border-line hover:bg-bg/70 hover:text-fg hover:backdrop-blur"
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? <Check className="size-3.5 text-ok" /> : <Copy className="size-3.5" />}
    </button>
  );
}

export function CodeTabs({ labels, children }: { labels: string[]; children: React.ReactNode }) {
  const panels = Children.toArray(children).filter(isValidElement);
  const [active, setActive] = useState(0);
  const id = useId();

  return (
    <div className="not-prose my-8">
      <div role="tablist" aria-label="Code variants" className="inline-flex max-w-full gap-1 overflow-x-auto rounded-xl border border-line bg-bg-soft p-1">
        {labels.map((label, i) => (
          <button
            key={label}
            role="tab"
            type="button"
            id={`${id}-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`${id}-panel-${i}`}
            onClick={() => setActive(i)}
            className={`relative shrink-0 rounded-lg px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition-colors ${
              i === active ? "text-bg" : "text-muted hover:text-fg"
            }`}
          >
            {i === active && (
              <motion.span
                layoutId={`${id}-pill`}
                className="absolute inset-0 rounded-lg bg-fg"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>
      {panels.map((panel, i) => (
        <div
          key={i}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={i !== active}
          className="[&_.code-block]:mt-3 [&_.code-block]:mb-0"
        >
          {panel}
        </div>
      ))}
    </div>
  );
}

/** "Predict the outcome" check: commit to an answer before reading on. */
export function Predict({
  question,
  options,
  answer,
  children,
}: {
  question: string;
  options: string[];
  answer: number;
  children: React.ReactNode;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const done = picked !== null;

  return (
    <div className="not-prose my-8 rounded-2xl border border-line p-5 sm:p-6">
      <p className="flex items-center gap-2 text-xs font-semibold tracking-wider text-accent uppercase">
        <HelpCircle className="size-4" /> Predict first
      </p>
      <p className="mt-2 text-[17px] leading-snug font-semibold">{question}</p>
      <div className="mt-4 grid gap-2">
        {options.map((o, i) => {
          const isAnswer = i === answer;
          const state = !done ? "idle" : isAnswer ? "right" : i === picked ? "wrong" : "dim";
          return (
            <button
              key={o}
              type="button"
              disabled={done}
              onClick={() => setPicked(i)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-[15px] transition-all duration-300 ${
                state === "idle"
                  ? "border-line hover:border-accent-soft/60 hover:bg-accent-tint"
                  : state === "right"
                    ? "border-ok/50 bg-ok-tint"
                    : state === "wrong"
                      ? "border-bad/50 bg-bad-tint"
                      : "border-line opacity-55"
              }`}
            >
              <span
                className={`grid size-6 shrink-0 place-items-center rounded-full border font-mono text-xs ${
                  state === "right" ? "border-ok bg-ok text-white" : state === "wrong" ? "border-bad bg-bad text-white" : "border-line-strong text-subtle"
                }`}
              >
                {state === "right" ? <Check className="size-3.5" /> : state === "wrong" ? <X className="size-3.5" /> : String.fromCharCode(65 + i)}
              </span>
              <span className="min-w-0 leading-relaxed">{inline(o)}</span>
            </button>
          );
        })}
      </div>
      <div
        className="grid grid-cols-1 transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ gridTemplateRows: done ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden" inert={!done}>
          <div className="mt-4 rounded-xl bg-bg-soft p-4">
            <p className={`text-sm font-semibold ${picked === answer ? "text-ok" : "text-bad"}`}>
              {picked === answer ? "Exactly right." : "Not quite, and you're in good company."}
            </p>
            <div className="prose-ledger prose mt-1.5 text-[15px] [&>:first-child]:mt-0 [&>:last-child]:mb-0">{children}</div>
            <button
              type="button"
              onClick={() => setPicked(null)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-fg"
            >
              <RotateCcw className="size-3" /> Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
