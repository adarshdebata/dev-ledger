"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";

/**
 * Reader-controlled stepping. Nothing moves until the reader presses Play or Next,
 * Play moves at once and then every `delay` ms, and it stops at the last step: no loops.
 * `onMove` runs on every reader action (used to switch off per-step toggles).
 */
export function useStepPlayer(last: number, { delay = 2600, onMove }: { delay?: number; onMove?: () => void } = {}) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (step > last) setStep(last);
  }, [step, last]);

  useEffect(() => {
    if (!playing) return;
    if (step >= last) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => Math.min(last, s + 1)), delay);
    return () => clearTimeout(t);
  }, [playing, step, last, delay]);

  const go = (to: number) => {
    onMove?.();
    setPlaying(false);
    setStep(Math.max(0, Math.min(last, to)));
  };

  return {
    step,
    playing,
    go,
    /** Set the step without clamping, for when the number of steps is about to change. */
    jump: (to: number) => setStep(Math.max(0, to)),
    pause: () => setPlaying(false),
    toggle: () => {
      onMove?.();
      if (playing) return setPlaying(false);
      setStep((s) => (s >= last ? 1 : s + 1));
      setPlaying(true);
    },
  };
}

function Ctrl({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-accent-tint hover:text-fg disabled:pointer-events-none disabled:opacity-35"
    >
      {children}
    </button>
  );
}

/** Reset, Back, Play/Pause and Next, plus one segment per step that can be clicked. */
export function PlayerControls({
  step,
  last,
  playing,
  onGo,
  onToggle,
}: {
  step: number;
  last: number;
  playing: boolean;
  onGo: (to: number) => void;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 border-t border-line px-3 py-2.5 sm:px-4">
      <div className="flex items-center gap-0.5">
        <Ctrl label="Reset" onClick={() => onGo(0)} disabled={step === 0 && !playing}>
          <RotateCcw className="size-4" />
        </Ctrl>
        <Ctrl label="Back" onClick={() => onGo(step - 1)} disabled={step === 0}>
          <SkipBack className="size-4" />
        </Ctrl>
        <button
          type="button"
          onClick={onToggle}
          className="mx-1 grid size-9 place-items-center rounded-full bg-fg text-bg transition-transform hover:scale-105"
          aria-label={playing ? "Pause" : step >= last ? "Play again" : "Play"}
          title={playing ? "Pause" : step >= last ? "Play again" : "Play"}
        >
          {playing ? <Pause className="size-4" /> : step >= last ? <RotateCcw className="size-4" /> : <Play className="ml-0.5 size-4" />}
        </button>
        <Ctrl label="Next" onClick={() => onGo(step + 1)} disabled={step >= last}>
          <SkipForward className="size-4" />
        </Ctrl>
      </div>
      <div className="flex flex-1 gap-1">
        {Array.from({ length: last }, (_, i) => (
          <button
            key={i}
            type="button"
            tabIndex={-1}
            aria-label={`Go to step ${i + 1}`}
            onClick={() => onGo(i + 1)}
            className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-line"
          >
            <span
              className={`absolute inset-0 origin-left bg-accent-soft transition-transform duration-500 ${i < step ? "scale-x-100" : "scale-x-0"}`}
            />
          </button>
        ))}
      </div>
      <span className="shrink-0 font-mono text-[11px] text-subtle tabular-nums">
        {step} / {last}
      </span>
    </div>
  );
}
