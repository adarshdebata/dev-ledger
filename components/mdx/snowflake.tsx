import { ArrowDown, ArrowRight, Check, X } from "lucide-react";
import { IdMachinePlayer } from "./lazy";
import {
  EPOCH,
  LAYOUT_ENDS,
  SCENARIOS,
  SWEEP_MONTHS,
  SWEEP_START,
  crossing,
  dayLabel,
  fixedId,
  fold,
  grouped,
  monthLabel,
  readBack,
  snowflake,
  sweep,
  timeLabel,
} from "./snowflake-data";

/*
 * Figures for the snowflake case study, all drawn from the illustrative scheme in snowflake-data.ts.
 * Everything is computed at build time, so the numbers in the pictures are the numbers the code
 * produces. Red always means "broken".
 */

/* ---------- The player, with numbered steps for phones and reduced motion ---------- */

export function IdMachine() {
  return (
    <figure className="not-prose my-10 md:motion-safe:breakout-center" data-wide>
      <div className="max-md:hidden motion-reduce:hidden">
        <IdMachinePlayer />
      </div>
      <IdMachineSteps />
    </figure>
  );
}

function IdMachineSteps() {
  const [today] = SCENARIOS;
  const elapsed = today.ms - EPOCH;
  const s = snowflake(today.ms, today.machine, today.counter);
  const id = fold(s);
  const steps: [string, string][] = [
    ["Read the clock: milliseconds since 1 January 2014", `${grouped(elapsed)} (${timeLabel(today.ms)})`],
    ["Shift left 22 bits (× 4,194,304)", grouped(BigInt(elapsed) << 22n)],
    [`Add machine ${today.machine} and counter ${today.counter}: the snowflake`, s],
    ["Keep digit 2", id[0]],
    ["Add the last 15 digits: the ID", id],
    ["parseInt(id) gives back", `${readBack(id).value} (exact)`],
  ];
  return (
    <div className="mx-auto max-w-[45rem] overflow-hidden rounded-2xl border border-line bg-card md:motion-safe:hidden">
      <div className="border-b border-line bg-bg-soft/70 px-4 py-3">
        <p className="text-[14px] font-semibold">One ID, from the clock to a number</p>
        <p className="font-mono text-[11.5px] text-subtle">An ID made today in the example scheme, step by step</p>
      </div>
      <ol>
        {steps.map(([title, value], i) => (
          <li key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-line px-4 py-3.5">
            <span className="grid size-8 place-items-center rounded-full border border-accent-soft/50 font-mono text-sm font-semibold text-accent">{i + 1}</span>
            <div className="min-w-0">
              <p className="text-[13.5px] font-semibold text-muted">{title}</p>
              <p className="mt-1 font-mono text-[13px] break-all text-fg">{value}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="px-4 py-4">
        <p className="eyebrow text-subtle">The same steps on three dates</p>
        <ul className="mt-3 space-y-3">
          {SCENARIOS.map((sc) => {
            const snow = snowflake(sc.ms, sc.machine, sc.counter);
            const folded = fold(snow);
            const back = readBack(folded);
            const ok = back.outcome === "exact";
            return (
              <li key={sc.id} className="rounded-xl border border-line px-3.5 py-3 font-mono text-[12.5px] leading-relaxed">
                <p className="font-sans text-[13px] font-semibold">{dayLabel(sc.ms)}</p>
                <p className="mt-1 break-all text-muted">ID {folded}</p>
                <p className={ok ? "text-ok" : "font-semibold text-bad"}>
                  <span className="break-all">parseInt → {back.value}</span>{" "}
                  <span className="whitespace-nowrap">{ok ? "✓ exact" : back.outcome === "rounded" ? "✗ a different ID" : "✗ lost a digit"}</span>
                </p>
                <p className="break-all text-ok">fixed → {fixedId(snow)} ✓</p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ---------- Where the bits go: released vs fixed ---------- */

type FieldKey = "time" | "machine" | "counter";
type Field = { key: FieldKey; label: string; hi: number; lo: number };

const SHOWN = 24; // bits 23..0; the time carries on to the left
const col = (bit: number) => 2 + (SHOWN - 1 - bit); // grid column; column 1 is the "…" of the time

const LAYOUTS: { id: string; title: string; code: string; note: string; fields: Field[] }[] = [
  {
    id: "released",
    title: "Released",
    code: "time << 22 | machine << 10 | counter",
    note: "The counter has 12 bits, but the machine was shifted by only 10. Bits 10 and 11 belong to both the machine and the counter, and bits 20 and 21 are never used. Once OR-ed together, nothing can tell the shared bits apart.",
    fields: [
      { key: "time", label: "time", hi: 99, lo: 22 },
      { key: "machine", label: "machine · 10 bits", hi: 19, lo: 10 },
      { key: "counter", label: "counter · 12 bits", hi: 11, lo: 0 },
    ],
  },
  {
    id: "fixed",
    title: "Fixed",
    code: "time << 22 | machine << 12 | counter",
    note: "Every bit has exactly one owner.",
    fields: [
      { key: "time", label: "time", hi: 99, lo: 22 },
      { key: "machine", label: "machine · 10 bits", hi: 21, lo: 12 },
      { key: "counter", label: "counter · 12 bits", hi: 11, lo: 0 },
    ],
  },
];

const FIELD_TONE: Record<FieldKey, { cell: string; line: string; text: string }> = {
  time: { cell: "border-teal-soft/50 bg-teal-tint text-teal", line: "border-teal-soft", text: "text-teal" },
  machine: { cell: "border-accent-soft/50 bg-accent-tint text-accent", line: "border-accent-soft", text: "text-accent" },
  counter: { cell: "border-line-strong bg-bg-soft text-muted", line: "border-line-strong", text: "text-muted" },
};

function Bracket({ field, row, above }: { field: Field; row: number; above?: boolean }) {
  const t = FIELD_TONE[field.key];
  const start = field.hi >= SHOWN ? 1 : col(field.hi);
  return (
    <span className={`flex flex-col items-center ${above ? "justify-end" : ""}`} style={{ gridColumn: `${start} / ${col(field.lo) + 1}`, gridRow: row }}>
      {above && <span className={`mb-1 text-[11.5px] font-semibold whitespace-nowrap ${t.text}`}>{field.label}</span>}
      <span className={`h-2 w-full border-x-2 ${above ? "rounded-t-md border-t-2" : "rounded-b-md border-b-2"} ${t.line}`} />
      {!above && <span className={`mt-1 text-[11.5px] font-semibold whitespace-nowrap ${t.text}`}>{field.label}</span>}
    </span>
  );
}

export function BitLayout() {
  return (
    <figure className="not-prose my-8 space-y-7 rounded-2xl border border-line px-4 py-6 sm:px-6">
      {LAYOUTS.map((layout) => {
        const owners = (bit: number) => layout.fields.filter((f) => bit <= f.hi && bit >= f.lo);
        const [time, machine, counter] = layout.fields;
        return (
          <div key={layout.id}>
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-[14px] font-semibold">{layout.title}</span>
              <code className="font-mono text-[12.5px] text-muted">{layout.code}</code>
            </p>
            <div className="mt-3 grid gap-x-[3px] gap-y-1" style={{ gridTemplateColumns: `minmax(0, 1.3fr) repeat(${SHOWN}, minmax(0, 1fr))` }}>
              <Bracket field={machine} row={1} above />
              <span style={{ gridColumn: 1, gridRow: 2 }} className={`grid h-8 place-items-center rounded-md border font-mono text-[11px] ${FIELD_TONE.time.cell}`}>
                …
              </span>
              {Array.from({ length: SHOWN }, (_, i) => {
                const bit = SHOWN - 1 - i;
                const own = owners(bit);
                const tone =
                  own.length > 1
                    ? "border-bad bg-bad text-bg"
                    : own.length === 0
                      ? "border-dashed border-line-strong bg-transparent text-subtle"
                      : FIELD_TONE[own[0].key].cell;
                return (
                  <span
                    key={bit}
                    style={{ gridColumn: col(bit), gridRow: 2 }}
                    className={`grid h-8 place-items-center rounded-md border font-mono text-[10px] tabular-nums ${tone}`}
                    title={`bit ${bit}: ${own.length ? own.map((f) => f.key).join(" and ") : "unused"}`}
                  >
                    <span className="max-sm:hidden">{bit}</span>
                  </span>
                );
              })}
              <Bracket field={time} row={3} />
              <Bracket field={counter} row={3} />
            </div>
            <p className="mt-3 flex items-start gap-2 text-[13.5px] leading-relaxed text-muted">
              {layout.id === "released" ? (
                <span className="mt-[5px] size-2.5 shrink-0 rounded-sm bg-bad" aria-hidden="true" />
              ) : (
                <Check className="mt-[3px] size-3.5 shrink-0 text-ok" aria-hidden="true" />
              )}
              <span>{layout.note}</span>
            </p>
          </div>
        );
      })}
      <figcaption className="border-t border-line pt-4 text-[13px] text-muted">
        The lowest 24 bits of a snowflake in the example scheme. The time fills every bit from 22 upwards (the “…”). Red marks a bit with two owners; dashed
        bits have none.
      </figcaption>
    </figure>
  );
}

/* ---------- The first digit's march, 2026 to 2030 ---------- */

const T_FROM = Date.UTC(2026, 0, 1);
const T_TO = Date.UTC(2031, 5, 1);
const tPct = (ms: number) => ((ms - T_FROM) / (T_TO - T_FROM)) * 100;
const EDGES = [T_FROM, crossing(17), crossing(18), crossing(19), crossing(20), crossing(21), crossing(22), T_TO];
const MARKED = EDGES.slice(3, 6); // where the 9 starts, where the 0 starts, where it ends

type Seg = { long: string; short: string; broken?: boolean };
const plain = (long: string, short: string): Seg => ({ long, short });
const TRACKS: { title: string; note: string; segs: Seg[] }[] = [
  {
    title: "First digit",
    note: "of every ID",
    segs: ["6", "7", "8", "9", "0", "1", "2"].map((d) => plain(d, d)),
  },
  {
    title: "Released code",
    note: "16-digit IDs",
    segs: [
      plain("fine", "fine"),
      plain("fine", "fine"),
      plain("fine", "fine"),
      { long: "IDs clash", short: "clash", broken: true },
      { long: "loses its 0", short: "loses 0", broken: true },
      plain("fine", "fine"),
      plain("fine", "fine"),
    ],
  },
  {
    title: "With the fix",
    note: "16-digit IDs",
    segs: [
      plain("unchanged", "same"),
      plain("unchanged", "same"),
      plain("unchanged", "same"),
      plain("starts with 1", "1…"),
      plain("starts with 1", "1…"),
      plain("unchanged", "same"),
      plain("unchanged", "same"),
    ],
  },
];

export function FirstDigitTimeline() {
  const today = Date.UTC(2026, 9, 15);
  const years = Array.from({ length: 6 }, (_, i) => 2026 + i);
  return (
    <figure className="not-prose my-10 rounded-2xl border border-line bg-card px-4 py-6 sm:px-6 md:breakout-center">
      <p className="text-[14px] font-semibold">The digit that moves</p>
      <p className="mt-0.5 text-[13px] text-muted">
        In the example scheme, the ID's first digit is the snowflake's second digit. It moves up by one about every nine months.
      </p>
      <div className="mt-6 grid gap-x-4 sm:grid-cols-[8.5rem_minmax(0,1fr)]">
        <div className="hidden sm:block">
          <div className="h-7" />
          {TRACKS.map((t) => (
            <div key={t.title} className="mb-2.5 flex h-10 flex-col justify-center">
              <p className="text-[13px] leading-tight font-semibold">{t.title}</p>
              <p className="font-mono text-[11px] text-subtle">{t.note}</p>
            </div>
          ))}
        </div>
        <div className="relative">
          <div className="relative h-7 max-sm:h-2">
            {MARKED.map((ms) => (
              <span
                key={ms}
                className="absolute bottom-1.5 -translate-x-1/2 font-mono text-[11.5px] font-semibold whitespace-nowrap text-fg max-sm:hidden"
                style={{ left: `${tPct(ms)}%` }}
              >
                <span className="hidden lg:inline">{dayLabel(ms)}</span>
                <span className="lg:hidden">{monthLabel(ms).replace(" 20", " ’")}</span>
              </span>
            ))}
          </div>
          <div className="relative">
            {TRACKS.map((t, row) => (
              <div key={t.title} className="mb-2.5">
                <p className="relative z-10 mb-1 w-fit bg-card pr-1.5 text-[12px] font-semibold sm:hidden">{t.title}</p>
                <div className="relative h-10">
                  {t.segs.map((seg, i) => {
                    const left = tPct(EDGES[i]);
                    const width = tPct(EDGES[i + 1]) - left;
                    const tone = seg.broken
                      ? "bg-bad text-bg"
                      : row === 0
                        ? "border border-line-strong bg-bg-soft text-fg"
                        : row === 2
                          ? "border border-ok/40 bg-ok-tint text-ok"
                          : "bg-line/80 text-muted";
                    const tiny = row === 0 || seg.short.length <= 2;
                    return (
                      <span
                        key={i}
                        className={`absolute inset-y-0 flex items-center justify-center overflow-hidden rounded-[4px] px-1 text-center whitespace-nowrap ${tone} ${
                          row === 0 ? "font-mono text-[17px] font-semibold" : "text-[11.5px] font-medium"
                        }`}
                        style={{ left: `calc(${left}% + 1px)`, width: `calc(${width}% - 2px)` }}
                        title={`${t.title}, ${dayLabel(EDGES[i])} – ${dayLabel(EDGES[i + 1])}: ${seg.broken ? (seg.short === "clash" ? "IDs round onto each other" : "the leading 0 is dropped") : seg.long}`}
                      >
                        {seg.broken && <X className="size-3 shrink-0 sm:mr-1" aria-hidden="true" />}
                        <span className="hidden lg:inline">{seg.long}</span>
                        <span className={`lg:hidden ${tiny ? "" : "max-sm:hidden"}`}>{seg.short}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
            {/* Boundaries and today run through every track */}
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              {MARKED.map((ms) => (
                <span key={ms} className="absolute inset-y-0 w-px bg-fg/25" style={{ left: `${tPct(ms)}%` }} />
              ))}
              <span className="absolute inset-y-0 w-0.5 -translate-x-1/2 rounded-full bg-accent-soft" style={{ left: `${tPct(today)}%` }} />
            </div>
          </div>
          <div className="relative mt-1 h-6 border-t border-line">
            {years.map((y) => (
              <span
                key={y}
                className="absolute top-1 -translate-x-1/2 font-mono text-[10.5px] text-subtle tabular-nums"
                style={{ left: `${tPct(Date.UTC(y, 0, 1))}%` }}
              >
                {y}
              </span>
            ))}
          </div>
          <p className="mt-2 flex items-center gap-2 text-[12px] text-muted">
            <span className="h-3 w-0.5 rounded-full bg-accent-soft" aria-hidden="true" /> Today, 15 Oct 2026
          </p>
        </div>
      </div>
    </figure>
  );
}

/* ---------- Six IDs in a row after 2^53 ---------- */

export function RoundingRows() {
  const sc = SCENARIOS[1];
  const rows = Array.from({ length: 6 }, (_, i) => {
    const id = fold(snowflake(sc.ms, sc.machine, 40 + i));
    return { id, value: readBack(id).value };
  });
  const hundred = Array.from({ length: 100 }, (_, i) => readBack(fold(snowflake(sc.ms, sc.machine, i))).value);
  const distinct = new Set(rows.map((r) => r.value)).size;
  return (
    <figure className="not-prose my-8 overflow-hidden rounded-2xl border border-line bg-card">
      <div className="border-b border-line bg-bg-soft/70 px-4 py-3 sm:px-5">
        <p className="text-[14px] font-semibold">Six transactions in a row, {dayLabel(sc.ms)}</p>
        <p className="font-mono text-[11.5px] text-subtle">example scheme · 16-digit IDs, one counter step apart</p>
      </div>
      <ol className="divide-y divide-line font-mono text-[13px] sm:text-[14px]">
        {rows.map((r, i) => {
          const twin = rows.findIndex((o, j) => j !== i && o.value === r.value);
          return (
            <li key={r.id} className="grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-x-3 gap-y-1 px-4 py-2.5 sm:grid-cols-[1.5rem_minmax(0,1fr)_1.25rem_minmax(0,1fr)_minmax(0,11rem)] sm:px-5">
              <span className="text-[11px] text-subtle">#{i + 1}</span>
              <span className="tabular-nums">
                {r.id.slice(0, -3)}
                <span className="font-semibold">{r.id.slice(-3)}</span>
              </span>
              <ArrowRight className="hidden size-3.5 text-subtle sm:block" aria-hidden="true" />
              <span className="tabular-nums max-sm:col-start-2">
                {[...r.value].map((d, j) => (
                  <span key={j} className={d !== r.id[j] ? "rounded-sm bg-bad px-px font-semibold text-bg" : j >= 13 ? "font-semibold" : ""}>
                    {d}
                  </span>
                ))}
              </span>
              <span className={`flex items-center gap-1.5 font-sans text-[12.5px] max-sm:col-start-2 ${twin >= 0 ? "font-semibold text-bad" : "text-muted"}`}>
                {twin >= 0 ? <X className="size-3.5 shrink-0" aria-hidden="true" /> : <Check className="size-3.5 shrink-0 text-ok" aria-hidden="true" />}
                {twin >= 0 ? `same number as #${twin + 1}` : "no clash in these six"}
              </span>
            </li>
          );
        })}
      </ol>
      <figcaption className="border-t border-line px-4 py-3 text-[13px] leading-relaxed text-muted sm:px-5">
        Left: the ID the code built, as text. Right: what <code className="font-mono text-fg">parseInt</code> returns. Six different IDs became{" "}
        <strong className="text-fg">{distinct} numbers</strong>. Out of 100 in a row, only <strong className="text-fg">{new Set(hundred).size}</strong> survive.
      </figcaption>
    </figure>
  );
}

/* ---------- The fix as a decision ---------- */

function Box({ tone = "plain", children }: { tone?: "plain" | "swap" | "ok" | "bad" | "check"; children: React.ReactNode }) {
  const cls = {
    plain: "border-line-strong bg-card",
    check: "border-line-strong border-dashed bg-bg-soft",
    swap: "border-accent-soft/60 bg-accent-tint",
    ok: "border-ok/50 bg-ok-tint",
    bad: "border-bad/60 bg-bad-tint",
  }[tone];
  return <div className={`rounded-xl border px-4 py-3 text-[14px] leading-relaxed ${cls}`}>{children}</div>;
}

function Down() {
  return (
    <div className="flex justify-center py-1.5 text-subtle" aria-hidden="true">
      <ArrowDown className="size-4" />
    </div>
  );
}

export function FixFlow() {
  return (
    <figure className="not-prose my-8 rounded-2xl border border-line px-4 py-6 sm:px-6">
      <p className="eyebrow text-accent">safeFold(snowflake)</p>
      <div className="mt-4 grid gap-x-5 gap-y-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <Box>
            <strong>Fold</strong> the snowflake exactly as before: digit 2, then the last 15.
          </Box>
          <Down />
          <Box tone="check">
            <strong>Is it safe?</strong> 16 digits, no leading 0, and no more than 9,007,199,254,740,991.
          </Box>
        </div>
        <div className="flex flex-col justify-end">
          <div className="grid items-center gap-2 sm:grid-cols-[3.5rem_minmax(0,1fr)]">
            <span className="flex items-center gap-1 font-mono text-[11.5px] font-semibold text-ok">
              yes <ArrowRight className="size-3.5 max-sm:rotate-90" aria-hidden="true" />
            </span>
            <Box tone="ok">
              <strong>Return it, unchanged.</strong> Every ID issued today takes this path.
            </Box>
          </div>
        </div>
        <div>
          <Down />
          <Box tone="swap">
            <strong>No: make the first digit 1.</strong> Only that digit changes.
          </Box>
          <Down />
          <Box tone="ok">
            <strong>Return it.</strong> Same length, never a leading 0, and a 16-digit number starting with 1 is always far below 2^53 − 1.
          </Box>
        </div>
        <div className="flex flex-col justify-end">
          <Box tone="bad">
            <strong>One guard, in the generator:</strong> once the time no longer fits in its 41 bits, on {dayLabel(LAYOUT_ENDS)}, it throws instead of
            making an ID.
          </Box>
        </div>
      </div>
    </figure>
  );
}

/* ---------- Every month until the layout runs out ---------- */

export function FutureSweep() {
  const groups: { title: string; fixed: boolean }[] = [
    { title: "Released code", fixed: false },
    { title: "With the fix", fixed: true },
  ];
  const yearOf = (m: number) => new Date(Date.UTC(SWEEP_START, m, 1)).getUTCFullYear();
  const lastYear = yearOf(SWEEP_MONTHS - 1);
  const decades = [2030, 2040, 2050, 2060, 2070, 2080];
  return (
    <figure className="not-prose my-10 rounded-2xl border border-line bg-card px-4 py-6 sm:px-6 md:breakout-center">
      <p className="text-[14px] font-semibold">
        Every month from January {SWEEP_START} to December {lastYear}
      </p>
      <p className="mt-0.5 text-[13px] text-muted">
        {SWEEP_MONTHS} months per strip in the example scheme, each checked at the smallest and the largest machine number, the same sweep the unit test
        runs.{" "}
        <span className="inline-flex items-center gap-1.5 align-middle">
          <span className="inline-block h-2.5 w-4 rounded-[3px] bg-bad" aria-hidden="true" /> broken
        </span>{" "}
        <span className="ml-2 inline-flex items-center gap-1.5 align-middle">
          <span className="inline-block h-2.5 w-4 rounded-[3px] bg-line-strong" aria-hidden="true" /> fine
        </span>
      </p>
      <div className="mt-6 space-y-6">
        {groups.map((g) => {
          const runs = sweep(g.fixed);
          const bad = runs.filter((r) => r.broken).reduce((n, r) => n + r.to - r.from, 0);
          return (
            <div key={g.title}>
              {!g.fixed && (
                <div className="relative h-5 max-sm:hidden sm:mr-[6.5rem] sm:ml-[9.5rem]">
                  {runs
                    .filter((r) => r.broken)
                    .map((r) => (
                      <span
                        key={r.from}
                        className="absolute bottom-0.5 -translate-x-1/2 font-mono text-[10px] font-semibold whitespace-nowrap text-bad"
                        style={{ left: `${((r.from + r.to) / 2 / SWEEP_MONTHS) * 100}%` }}
                      >
                        {yearOf(r.from)}–{String(yearOf(r.to - 1)).slice(2)}
                      </span>
                    ))}
                </div>
              )}
              <div className="grid items-center gap-x-4 gap-y-1 sm:grid-cols-[8.5rem_minmax(0,1fr)_5.5rem]">
                <p className="flex items-center gap-2 text-[13px] font-semibold">
                  {g.fixed ? <Check className="size-4 text-ok" aria-hidden="true" /> : <X className="size-4 text-bad" aria-hidden="true" />}
                  {g.title}
                </p>
                <div className="relative h-7">
                  {runs.map((r) => (
                    <span
                      key={r.from}
                      className={`absolute inset-y-0 rounded-[4px] ${r.broken ? "bg-bad" : "bg-line-strong/70"}`}
                      style={{ left: `calc(${(r.from / SWEEP_MONTHS) * 100}% + 1px)`, width: `calc(${((r.to - r.from) / SWEEP_MONTHS) * 100}% - 2px)` }}
                      title={`${g.title}, ${monthLabel(Date.UTC(SWEEP_START, r.from, 1))} – ${monthLabel(Date.UTC(SWEEP_START, r.to - 1, 1))}: ${
                        r.broken ? "broken" : "fine"
                      }`}
                    />
                  ))}
                </div>
                <p className={`font-mono text-[11.5px] tabular-nums sm:text-right ${bad ? "font-semibold text-bad" : "text-ok"}`}>{bad} broken</p>
              </div>
            </div>
          );
        })}
        <div className="relative h-5 border-t border-line sm:mr-[6.5rem] sm:ml-[9.5rem]">
          {decades.map((y) => (
            <span
              key={y}
              className="absolute top-1 -translate-x-1/2 font-mono text-[10.5px] text-subtle tabular-nums"
              style={{ left: `${(((y - SWEEP_START) * 12) / SWEEP_MONTHS) * 100}%` }}
            >
              {y}
            </span>
          ))}
        </div>
      </div>
      <figcaption className="mt-4 border-t border-line pt-4 text-[13px] leading-relaxed text-muted">
        It isn't one bad date. The snowflake's second digit passes 9 and then 0 every time its first digit goes up, so the same two failures come back
        about every 7½ years until the layout runs out. After the fix, all {grouped(SWEEP_MONTHS * 2)} checks pass.
      </figcaption>
    </figure>
  );
}
