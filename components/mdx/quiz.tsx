"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, RotateCcw, X } from "lucide-react";
import { inline } from "./inline";

export type QuizQuestion = { q: string; options: string[]; answer: number; why: string };

const verdicts = [
  [1, "Perfect score. You could teach this."],
  [0.75, "Strong. Skim the questions you missed and you've got it."],
  [0.5, "A good start. The sections above cover every answer."],
  [0, "Worth a second read. Every answer is in the article above."],
] as const;

/** A short multiple-choice quiz: one question at a time, an explanation after each, a score at the end. */
export function Quiz({ title = "Test yourself", questions }: { title?: string; questions: QuizQuestion[] }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = questions[index];
  const answered = picked !== null;
  const last = index === questions.length - 1;

  const choose = (i: number) => {
    if (answered) return;
    setPicked(i);
    if (i === current.answer) setScore((s) => s + 1);
  };
  const next = () => {
    if (last) return setFinished(true);
    setIndex((i) => i + 1);
    setPicked(null);
  };
  const restart = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setFinished(false);
  };

  const verdict = verdicts.find(([min]) => score / questions.length >= min)?.[1];

  return (
    <div className="not-prose my-10 overflow-hidden rounded-2xl border border-line bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-line bg-bg-soft px-5 py-3">
        <p className="eyebrow text-accent">{title}</p>
        <p className="font-mono text-[12px] text-subtle">
          {finished ? `${score} / ${questions.length}` : `${index + 1} / ${questions.length}`}
        </p>
      </div>
      <div className="h-[2px] bg-line">
        <motion.div
          className="h-full bg-accent-soft"
          initial={false}
          animate={{ width: `${((finished ? questions.length : index + (answered ? 1 : 0)) / questions.length) * 100}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <div className="px-5 py-6 sm:px-6" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {finished ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="text-center"
            >
              <p className="text-5xl font-semibold tracking-tight">
                {score}
                <span className="text-2xl text-subtle"> / {questions.length}</span>
              </p>
              <p className="mt-3 text-[15px] text-muted">{verdict}</p>
              <button
                type="button"
                onClick={restart}
                className="mt-6 inline-flex items-center gap-2 rounded-xl border border-line-strong px-4 py-2 text-sm font-semibold transition-colors hover:border-fg"
              >
                <RotateCcw className="size-4" /> Try again
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-[17px] leading-snug font-semibold">{inline(current.q)}</p>
              <div className="mt-4 grid gap-2">
                {current.options.map((o, i) => {
                  const state = !answered ? "idle" : i === current.answer ? "right" : i === picked ? "wrong" : "dim";
                  return (
                    <button
                      key={o}
                      type="button"
                      disabled={answered}
                      onClick={() => choose(i)}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-[15px] transition-all duration-300 ${
                        state === "idle"
                          ? "border-line hover:border-line-strong hover:bg-bg-soft"
                          : state === "right"
                            ? "border-ok/50 bg-ok-tint"
                            : state === "wrong"
                              ? "border-bad/50 bg-bad-tint"
                              : "border-line opacity-55"
                      }`}
                    >
                      <span
                        className={`grid size-6 shrink-0 place-items-center rounded-full border font-mono text-xs ${
                          state === "right"
                            ? "border-ok bg-ok text-white"
                            : state === "wrong"
                              ? "border-bad bg-bad text-white"
                              : "border-line-strong text-subtle"
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
                style={{ gridTemplateRows: answered ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden" inert={!answered}>
                  <div className="mt-4 rounded-xl bg-bg-soft p-4">
                    <p className={`text-sm font-semibold ${picked === current.answer ? "text-ok" : "text-bad"}`}>
                      {picked === current.answer ? "Correct." : "Not quite."}
                    </p>
                    <p className="mt-1 text-[15px] leading-relaxed text-muted">{inline(current.why)}</p>
                    <button
                      type="button"
                      onClick={next}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-fg px-4 py-2 text-sm font-semibold text-bg transition-transform hover:-translate-y-0.5"
                    >
                      {last ? "See my score" : "Next question"} <ArrowRight className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
