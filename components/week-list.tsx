import Link from "next/link";
import { ArrowRight, Check, ChevronDown, PenLine } from "lucide-react";
import { getCurrentWeek, weekProgress, type DayStatus } from "@/lib/posts";
import { weekName, weeks, type Week } from "@/lib/site";

const STATUS: Record<DayStatus, { label: string; tone: string }> = {
  live: { label: "Live", tone: "text-ok" },
  writing: { label: "Writing now", tone: "text-accent" },
  soon: { label: "Coming soon", tone: "text-subtle" },
};

/** Same 16px box for every status, so titles line up whichever icon they have. */
function StatusIcon({ status, className = "" }: { status: DayStatus; className?: string }) {
  const box = `inline-flex size-4 shrink-0 items-center justify-center ${className}`;
  if (status === "live") return <Check aria-hidden="true" className={`${box} text-ok`} />;
  if (status === "writing") return <PenLine aria-hidden="true" className={`${box} text-accent`} />;
  return (
    <span aria-hidden="true" className={box}>
      <span className="size-2 rounded-full border border-line-strong" />
    </span>
  );
}

/** A week's posts in reading order: live ones link, the rest say what they'll cover. No day numbers. */
export function WeekList({ week, className = "" }: { week: Week; className?: string }) {
  const { days } = weekProgress(week);
  return (
    <ol className={`border-t border-line ${className}`}>
      {days.map((d) => {
        const { label, tone } = STATUS[d.status];
        const detail = d.post?.subtitle ?? d.about;
        // On phones the status sits above the title, so the title gets the full width; from `sm` up it moves to the right.
        const row = (
          <>
            <StatusIcon status={d.status} className="mt-px sm:mt-[3px]" />
            <span className="min-w-0">
              <span aria-hidden="true" className={`mb-1 block font-mono text-[11px] sm:hidden ${tone}`}>
                {label}
              </span>
              <span
                className={`block text-[15.5px] leading-snug font-medium ${d.post ? "transition-colors group-hover:text-accent" : d.status === "soon" ? "text-muted" : ""}`}
              >
                <span className="sr-only">{label}: </span>
                {d.title}
              </span>
              {detail && <span className="mt-1 block text-[13.5px] leading-relaxed text-subtle">{detail}</span>}
            </span>
            <span aria-hidden="true" className={`mt-[3px] hidden font-mono text-[11px] whitespace-nowrap sm:block ${tone}`}>
              {label}
            </span>
          </>
        );
        const grid = "grid grid-cols-[1.25rem_minmax(0,1fr)] items-start gap-x-3 py-4 sm:grid-cols-[1.25rem_minmax(0,1fr)_auto]";
        return (
          <li key={d.day} className="border-b border-line">
            {d.post ? (
              <Link href={`/posts/${d.post.slug}/`} className={`group ${grid}`}>
                {row}
              </Link>
            ) : (
              <div className={grid}>{row}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * "Upcoming this week": the week being written, what's live, what's being written now and what's next,
 * with the finished week before it folded into a card.
 */
export function WeekBoard({ headingId }: { headingId?: string }) {
  const week = getCurrentWeek();
  const { days, live } = weekProgress(week);
  const previous = weeks[weeks.indexOf(week) - 1];
  const count = (s: DayStatus) => days.filter((d) => d.status === s).length;
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:grid-rows-[auto_1fr] lg:gap-x-14">
      <div>
        <h2 id={headingId} className="text-3xl leading-tight font-semibold tracking-[-0.03em]">
          Upcoming this week
        </h2>
        <p className="mt-3 font-mono text-[13px] font-medium text-accent">{weekName(week)}</p>
        <p className="mt-4 max-w-md text-[16px] leading-relaxed text-muted">
          {week.blurb}{" "}
          {live > 0 ? "Start at the top for the full picture, or jump to any post that's live." : "Posts go live in this order, one at a time."}
        </p>
        <ul aria-label="Where this week stands" className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[12px] text-subtle">
          {(["live", "writing", "soon"] as const).map((s) => (
            <li key={s} className="flex items-center gap-2">
              <StatusIcon status={s} />
              {STATUS[s].label}
              <span className="text-fg">{count(s)}</span>
            </li>
          ))}
        </ul>
      </div>
      <WeekList week={week} className="lg:col-start-2 lg:row-span-2 lg:row-start-1" />
      {previous && <DoneWeek week={previous} />}
    </div>
  );
}

/** A finished week: a way back in, with its full list one click away. */
function DoneWeek({ week }: { week: Week }) {
  const { days } = weekProgress(week);
  const first = days[0]?.post;
  return (
    <div className="self-start rounded-2xl border border-line p-5 lg:col-start-1 lg:row-start-2">
      <p className="flex items-center gap-2 font-mono text-[11.5px] text-ok">
        <Check aria-hidden="true" className="size-3.5" /> Complete · all {days.length} posts are live
      </p>
      <p className="mt-2 text-[17px] leading-snug font-semibold tracking-tight">{weekName(week)}</p>
      <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{week.blurb}</p>
      {first && (
        <Link href={`/posts/${first.slug}/`} className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-accent hover:underline">
          Start from the first post <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      )}
      <details className="group/done mt-3">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-[13.5px] font-semibold text-muted hover:text-fg [&::-webkit-details-marker]:hidden">
          <span className="group-open/done:hidden">Show all {days.length} posts</span>
          <span className="hidden group-open/done:inline">Hide the list</span>
          <ChevronDown aria-hidden="true" className="size-4 transition-transform duration-300 group-open/done:rotate-180" />
        </summary>
        <ol className="mt-3 border-t border-line">
          {days.map(
            (d) =>
              d.post && (
                <li key={d.day} className="border-b border-line last:border-b-0">
                  <Link href={`/posts/${d.post.slug}/`} className="flex items-start gap-2.5 py-2.5 text-[14px] leading-snug transition-colors hover:text-accent">
                    <Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-ok" />
                    {d.title}
                  </Link>
                </li>
              ),
          )}
        </ol>
      </details>
    </div>
  );
}
