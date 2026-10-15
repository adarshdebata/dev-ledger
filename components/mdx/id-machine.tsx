"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Check, X } from "lucide-react";
import { inline } from "./inline";
import { PlayerControls, useStepPlayer } from "./step-player";
import { EPOCH, KEPT, LENGTH, SCENARIOS, fixedId, fold, grouped, readBack, snowflake, timeLabel, type Outcome } from "./snowflake-data";

const LAST = 7;

const COLS = { gridTemplateColumns: "repeat(19, minmax(0, 2.6rem))" };

const CELL = "grid h-10 place-items-center rounded-lg border font-mono text-[14px] font-semibold tabular-nums lg:h-11 lg:text-[16px]";
const TONE = {
  plain: "border-line-strong bg-card text-fg",
  kept: "border-accent-soft/70 bg-accent-tint text-accent",
  tail: "border-teal-soft/60 bg-teal-tint text-teal",
  dropped: "border-line bg-card text-subtle/60 line-through",
  lost: "border-dashed border-bad/50 bg-bad-tint text-bad/70 line-through",
  bad: "border-bad bg-bad text-bg",
  good: "border-ok/60 bg-ok-tint text-ok",
  empty: "border-dashed border-line bg-transparent text-transparent",
};

function Digit({ d, tone, delay = 0, className = "" }: { d: string; tone: keyof typeof TONE; delay?: number; className?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`${CELL} transition-colors duration-500 ${TONE[tone]} ${className}`}
    >
      {d}
    </motion.span>
  );
}

const Slot = () => <span className={`${CELL} ${TONE.empty}`}>0</span>;

function Badge({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-sans text-[11.5px] font-semibold whitespace-nowrap ${
        ok ? "border-ok/40 bg-ok-tint text-ok" : "border-bad/40 bg-bad-tint text-bad"
      }`}
    >
      {ok ? <Check className="size-3" /> : <X className="size-3" />}
      {children}
    </span>
  );
}

function Row({ title, note, badge, children }: { title: string; note: string; badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8.5rem_minmax(0,1fr)] items-center gap-x-4 lg:grid-cols-[9rem_minmax(0,1fr)]">
      <div className="min-w-0">
        <p className="text-[13px] leading-tight font-semibold">{title}</p>
        <p className="mt-0.5 font-mono text-[11px] text-subtle">{note}</p>
        {badge && <div className="mt-1.5">{badge}</div>}
      </div>
      <div className="grid gap-1" style={COLS}>
        {children}
      </div>
    </div>
  );
}

const lost = (n: number) => `lost ${n} digit${n === 1 ? "" : "s"}`;

const OUTCOME_LABEL: Record<Outcome, (id: string, value: string) => string> = {
  exact: () => "exact",
  rounded: () => "a different ID",
  shortened: (id, value) => lost(id.length - value.length),
  unsafe: () => "above 2^53 − 1",
};

/** One transaction ID in the example scheme, built from the clock to the number JavaScript holds. Reader-controlled; nothing loops. */
export default function IdMachine() {
  const [which, setWhich] = useState(0);
  const p = useStepPlayer(LAST, { delay: 2600 });
  const step = p.step;

  const sc = SCENARIOS[which];
  const elapsed = sc.ms - EPOCH;
  const shifted = BigInt(elapsed) << 22n;
  const s = snowflake(sc.ms, sc.machine, sc.counter);
  const id = fold(s);
  const back = readBack(id);
  const fixed = fixedId(s);
  const swapped = fixed !== id;
  const broken = back.outcome !== "exact";
  const offset = LENGTH - back.value.length;
  const k = String(which);

  const captions: { title: string; body: string }[] = [
    {
      title: sc.id === "today" ? "Today, 15 October 2026" : sc.label,
      body: "Every transaction gets its ID the same way. Press Next to build one, step by step. You can switch the date at any step and compare.",
    },
    {
      title: "1. Read the clock",
      body: "`Date.now() - EPOCH` counts the milliseconds since the scheme's start date, 1 January 2014. It only ever goes up. That's what makes these IDs unique and roughly sorted by time, and also what will eventually break them.",
    },
    {
      title: "2. Make room at the bottom",
      body: "Shifting left by 22 bits multiplies the time by 4,194,304. The 22 empty bits at the bottom are room for two more numbers.",
    },
    {
      title: "3. Fill the room",
      body: `The server's 10-bit machine number (here ${sc.machine}) and a 12-bit counter (here ${sc.counter}) go into the empty bits. The result is the snowflake: 19 digits, different for every machine and counter value in the same millisecond.`,
    },
    {
      title: "4. Fold it: digit 2",
      body: `The ID has room for only 16 digits, so the fold starts with the snowflake's second digit. It moves with the date: up by one about every nine months. On this date it is ${s[1]}.`,
    },
    {
      title: "5. Fold it: the last 15 digits",
      body: "Then the last 15 digits, where the machine and the counter live. Digits 1, 3 and 4 are left out. The ID is complete, and it's still text.",
    },
    {
      title: "6. JavaScript reads it",
      body:
        back.outcome === "exact"
          ? "`parseInt` turns the text into a number. This ID has no leading zero and sits below 9,007,199,254,740,991, the largest integer a JavaScript number holds exactly, so the number is exact. Nothing is wrong. Today."
          : back.outcome === "rounded"
            ? "This ID starts with 9, which puts it above 9,007,199,254,740,991, the largest integer a JavaScript number holds exactly. `parseInt` rounds it to the nearest number it can hold: a different ID, one that the next transaction can round to as well."
            : back.outcome === "shortened"
              ? `The ID starts with 0, and numbers don't keep leading zeros. \`parseInt\` drops ${offset === 1 ? "it" : "them"}, so a 16-digit ID comes out ${back.value.length} digits long.`
              : "This one comes back exact only because it's even. Above 2^53 − 1 only even numbers exist, so its odd neighbours round onto it.",
    },
    {
      title: swapped ? "7. The fix" : "7. The fix changes nothing here",
      body: swapped
        ? "The first digit becomes 1. Same length, no leading zero, and a 16-digit number starting with 1 is always far below 2^53 − 1, so `parseInt` reads it back exactly."
        : "The ID is already safe, so it goes out exactly as the released code made it. That's true of every ID issued today.",
    },
  ];

  const log: { code: string; value: string; bad?: boolean; good?: boolean }[] = [
    { code: "Date.now() - EPOCH", value: grouped(elapsed) },
    { code: "<< 22n", value: grouped(shifted) },
    { code: `| ${sc.machine}n << 12n | ${sc.counter}n`, value: s },
    { code: "digit 2", value: `"${id[0]}"` },
    { code: "+ last 15", value: `"${id}"` },
    { code: "parseInt(id, 10)", value: back.value, bad: broken, good: !broken },
    { code: "toTransactionId()", value: `"${fixed}"`, good: true },
  ];

  const snowTone = (i: number): keyof typeof TONE => {
    if (step < 4) return "plain";
    if (i === 1) return "kept";
    if (step >= 5) return KEPT.includes(i) ? "tail" : "dropped";
    return "plain";
  };

  return (
    <div
      role="group"
      aria-label="One transaction ID, built step by step. Use Next and Back, or the arrow keys."
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") p.go(step + 1);
        if (e.key === "ArrowLeft") p.go(step - 1);
      }}
      className="overflow-hidden rounded-2xl border border-line bg-card outline-none focus-visible:ring-2 focus-visible:ring-accent-soft"
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line bg-bg-soft/70 px-5 py-3">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold">One ID, from the clock to a number</p>
          <p className="font-mono text-[11.5px] text-subtle">{timeLabel(sc.ms)} · example scheme · real parseInt, in your browser</p>
        </div>
        <div className="ml-auto flex gap-1 rounded-xl border border-line bg-card p-1" role="group" aria-label="Date">
          {SCENARIOS.map((x, i) => (
            <button
              key={x.id}
              type="button"
              aria-pressed={i === which}
              onClick={() => {
                p.pause();
                setWhich(i);
              }}
              className={`rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
                i === which ? "bg-fg text-bg" : "text-muted hover:bg-bg-soft hover:text-fg"
              }`}
            >
              {x.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 px-4 py-6 lg:px-8" aria-hidden="true">
        <div className="grid grid-cols-[8.5rem_minmax(0,1fr)] gap-x-4 lg:grid-cols-[9rem_minmax(0,1fr)]">
          <span />
          <div className="grid gap-1" style={COLS}>
            {Array.from({ length: 19 }, (_, i) => (
              <span
                key={i}
                className={`text-center font-mono text-[10.5px] tabular-nums transition-colors duration-500 ${
                  step >= 4 && i === 1 ? "font-semibold text-accent" : step >= 5 && KEPT.includes(i) ? "text-teal" : "text-subtle"
                }`}
              >
                {i + 1}
              </span>
            ))}
          </div>
        </div>

        <Row title="Snowflake" note="19 digits">
          {Array.from({ length: 19 }, (_, i) =>
            step >= 3 ? (
              <Digit
                key={`${k}-s${i}`}
                d={s[i]}
                tone={snowTone(i)}
                delay={i * 0.02}
                className={step >= 4 && i === 1 ? "ring-2 ring-accent-soft/40 ring-offset-2 ring-offset-card" : ""}
              />
            ) : (
              <Slot key={i} />
            ),
          )}
        </Row>

        <Row title="Transaction ID" note="16 digits, as text">
          {Array.from({ length: LENGTH }, (_, i) =>
            (step >= 4 && i === 0) || step >= 5 ? (
              <Digit key={`${k}-i${i}`} d={id[i]} tone={step >= 6 && i === 0 && id[0] === "0" ? "bad" : i === 0 ? "kept" : "tail"} delay={i * 0.03} />
            ) : (
              <Slot key={i} />
            ),
          )}
        </Row>

        <Row
          title="parseInt(id)"
          note="what the code keeps"
          badge={step >= 6 ? <Badge ok={!broken}>{OUTCOME_LABEL[back.outcome](id, back.value)}</Badge> : undefined}
        >
          {Array.from({ length: LENGTH }, (_, i) => {
            if (step < 6) return <Slot key={i} />;
            if (i < offset) return <Digit key={`${k}-p${i}`} d={id[i]} tone="lost" />;
            const d = back.value[i - offset];
            return <Digit key={`${k}-p${i}`} d={d} tone={d !== id[i] ? "bad" : broken ? "plain" : "good"} delay={i * 0.02} />;
          })}
        </Row>

        <Row title="With the fix" note="toTransactionId()" badge={step >= 7 ? <Badge ok>{swapped ? "first digit 1 · exact" : "unchanged"}</Badge> : undefined}>
          {Array.from({ length: LENGTH }, (_, i) =>
            step >= 7 ? <Digit key={`${k}-f${i}`} d={fixed[i]} tone={swapped && i === 0 ? "good" : "plain"} delay={i * 0.02} /> : <Slot key={i} />,
          )}
        </Row>
      </div>

      <div className="grid grid-cols-1 border-t border-line lg:min-h-[15rem] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="border-b border-line px-5 py-5 lg:border-r lg:border-b-0" aria-live="polite">
          <p className="eyebrow text-subtle">{step === 0 ? "Before you start" : `Step ${step} of ${LAST}`}</p>
          <p className="mt-2 text-[15px] font-semibold">{captions[step].title}</p>
          <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{inline(captions[step].body)}</p>
        </div>
        <div className="flex flex-col px-4 py-5 sm:px-5">
          <p className="eyebrow mb-3 text-subtle">What the code computed</p>
          <ol className="flex-1 space-y-1 font-mono text-[12px] leading-relaxed">
            {log.slice(0, step).map((l, i) => (
              <li
                key={i}
                className={`flex flex-wrap justify-between gap-x-4 rounded-md px-2.5 py-1 ${i === step - 1 ? "bg-accent-tint" : ""}`}
              >
                <span className="text-muted">{l.code}</span>
                <span className={`break-all ${l.bad ? "font-semibold text-bad" : l.good ? "font-semibold text-ok" : "text-fg"}`}>{l.value}</span>
              </li>
            ))}
            {step === 0 && <li className="px-2.5 py-1 text-subtle">Nothing computed yet.</li>}
          </ol>
        </div>
      </div>

      <PlayerControls step={step} last={LAST} playing={p.playing} onGo={p.go} onToggle={p.toggle} />
    </div>
  );
}
