/**
 * The illustrative ID scheme from the snowflake case study, small enough to read in one go.
 * It's the classic snowflake layout (41 bits of time from a fixed start date, 10 bits of machine,
 * 12 of counter), folded into a 16-digit ID: digit 2, then the last 15. It breaks the same ways
 * the real scheme did, on its own dates. Values stay BigInts or digit strings, so nothing here
 * is ever rounded by accident. Runs the same on the server (figures) and in the browser (player).
 */

/** The fixed start date the clock counts from. */
export const EPOCH = Date.UTC(2014, 0, 1);

/** The ID's length, and the largest integer a JavaScript number holds exactly: 2^53 − 1. */
export const LENGTH = 16;
export const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);

/** The time field has 41 bits, so the layout runs out 2^41 ms after the start date. */
export const LAYOUT_ENDS = EPOCH + 2 ** 41;

/**
 * time << 22 | machine << 12 | counter. The released version shifted the machine by 10, so its
 * lowest two bits landed on the 12-bit counter's highest two, and bits 20 and 21 went unused.
 */
export function snowflake(ms: number, machine: number, counter: number, layout: "fixed" | "released" = "fixed") {
  const machineShift = layout === "fixed" ? 12n : 10n;
  return ((BigInt(ms - EPOCH) << 22n) | (BigInt(machine) << machineShift) | BigInt(counter)).toString();
}

/** Snowflake positions (from 0) the fold keeps: digit 2, then the last 15. */
export const KEPT = [1, ...Array.from({ length: 15 }, (_, i) => 4 + i)];

/** The fold: digit 2, which moves with the date, then the 15 digits that change every millisecond. */
export const fold = (snowflakeId: string) => KEPT.map((i) => snowflakeId[i]).join("");

/** Safe: 16 digits, no leading zero, and no more than 2^53 − 1. */
export const isSafe = (id: string) => id.length === LENGTH && id[0] !== "0" && BigInt(id) <= MAX_SAFE;

/** The fix: an unsafe fold gets 1 as its first digit, and a 16-digit number starting with 1 is always safe. */
export function fixedId(snowflakeId: string) {
  const folded = fold(snowflakeId);
  return isSafe(folded) ? folded : "1" + folded.slice(1);
}

export type Outcome = "exact" | "rounded" | "shortened" | "unsafe";

/** What `parseInt` hands to the rest of the code. This is the real parseInt, not a model of it. */
export function readBack(id: string): { value: string; outcome: Outcome } {
  const value = String(parseInt(id, 10));
  if (value.length < id.length) return { value, outcome: "shortened" };
  if (value !== id) return { value, outcome: "rounded" };
  // Exact only because it is even: above 2^53 every odd neighbour rounds onto it.
  return { value, outcome: BigInt(id) > MAX_SAFE ? "unsafe" : "exact" };
}

/** The first millisecond whose snowflake reaches tenths × 10^17 (19 → 1.9 × 10^18, when digit 2 turns 9). */
export const crossing = (tenths: number) => EPOCH + Number((BigInt(tenths) * 10n ** 17n + (1n << 22n) - 1n) >> 22n);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const dayLabel = (ms: number) => {
  const d = new Date(ms);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

export const monthLabel = (ms: number) => {
  const d = new Date(ms);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

export const timeLabel = (ms: number) => {
  const d = new Date(ms);
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${dayLabel(ms)}, ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}.${pad(d.getUTCMilliseconds(), 3)} UTC`;
};

/** 1692419280593928234 → 1,692,419,280,593,928,234 */
export const grouped = (digits: string | number | bigint) => String(digits).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export type Scenario = { id: string; label: string; ms: number; machine: number; counter: number };

/** Three moments for the player: today, a month into the "9" window, and a month into the "0" window. */
export const SCENARIOS: Scenario[] = [
  { id: "today", label: "Today", ms: Date.UTC(2026, 9, 15, 4, 30, 0, 123), machine: 300, counter: 42 },
  { id: "nine", label: "1 Jun 2028", ms: Date.UTC(2028, 5, 1, 4, 30, 0, 123), machine: 300, counter: 43 },
  { id: "zero", label: "1 Mar 2029", ms: Date.UTC(2029, 2, 1, 4, 30, 0, 123), machine: 300, counter: 42 },
];

export type Run = { from: number; to: number; broken: boolean };

/** The sweep covers every month from January 2026 until the layout runs out. */
export const SWEEP_START = 2026;
export const SWEEP_MONTHS = (new Date(LAYOUT_ENDS).getUTCFullYear() - SWEEP_START) * 12;

/**
 * Month by month, at the smallest and the largest machine number, like the unit test.
 * Before the fix a month breaks when the fold starts with 0, or with 9 (over 99% of those pass
 * 2^53 − 1; the rest are safe only by luck). After the fix every month must pass `isSafe`.
 * Consecutive months with the same answer merge into one run.
 */
export function sweep(fixed: boolean): Run[] {
  const runs: Run[] = [];
  for (let m = 0; m < SWEEP_MONTHS; m++) {
    const ms = Date.UTC(SWEEP_START, m, 1);
    const broken = [0, 1023].some((machine) => {
      const s = snowflake(ms, machine, 0);
      if (fixed) return !isSafe(fixedId(s));
      const first = fold(s)[0];
      return first === "0" || first === "9";
    });
    const last = runs[runs.length - 1];
    if (last && last.broken === broken) last.to = m + 1;
    else runs.push({ from: m, to: m + 1, broken });
  }
  return runs;
}
