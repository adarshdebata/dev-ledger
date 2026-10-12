import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PostCard, PostTile } from "@/components/post-card";
import { WeekList } from "@/components/week-list";
import { postsInSeries, seriesRoadmap } from "@/lib/posts";
import { alternates, currentWeek, series, weekName } from "@/lib/site";

export const metadata: Metadata = {
  title: "Series",
  description: "Every Dev Ledger article, grouped into series and in reading order.",
  alternates: alternates("/series/"),
};

export default function SeriesIndexPage() {
  return (
    <>
      <PageHeader eyebrow="Series" title="Read in order, or jump in anywhere">
        Each series starts with something you already use and goes one step deeper with every article. Every series shows its
        newest articles first; open the full list when you want them all.
      </PageHeader>

      <div className="container-page py-6">
        {series.map((s) => {
          const posts = postsInSeries(s.n);
          const topics = seriesRoadmap(s.n);
          // One or two cards are enough at a glance; the full list opens on demand.
          const preview = posts.slice(0, posts.length > 2 ? 2 : 1);
          return (
            <section key={s.n} id={`series-${s.n}`} aria-labelledby={`series-${s.n}-title`} className="scroll-mt-28 border-b border-line py-14 last:border-b-0">
              <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
                <div className="max-w-2xl">
                  <p className="font-mono text-sm font-medium text-accent">{String(s.n).padStart(2, "0")}</p>
                  <h2 id={`series-${s.n}-title`} className="mt-2 text-2xl leading-tight font-semibold tracking-[-0.02em] sm:text-3xl">
                    {s.title}
                  </h2>
                  <p className="mt-2.5 text-[15.5px] leading-relaxed text-muted">{s.blurb}</p>
                </div>
                <Link href={`/series/${s.n}/`} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-accent hover:underline">
                  All {topics.length} topics <ArrowRight className="size-4" />
                </Link>
              </div>

              {preview.length > 0 ? (
                <div className="mt-10">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {preview.map((p) => (
                      <PostTile key={p.slug} post={p} />
                    ))}
                  </div>
                  {posts.length > preview.length && (
                    <details className="group/all mt-8">
                      <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-line-strong px-5 py-2.5 text-sm font-semibold transition-colors hover:border-fg [&::-webkit-details-marker]:hidden">
                        <span className="group-open/all:hidden">Read all {posts.length} blogs</span>
                        <span className="hidden group-open/all:inline">Hide the list</span>
                        <ChevronDown className="size-4 transition-transform duration-300 group-open/all:rotate-180" />
                      </summary>
                      <div className="mt-4">
                        {posts.map((p) => (
                          <PostCard key={p.slug} post={p} />
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              ) : (
                <p className="mt-10 rounded-2xl border border-dashed border-line-strong px-6 py-5 text-[15px] text-muted">
                  <span className="font-semibold text-fg">Coming soon.</span> The first topics:{" "}
                  {topics
                    .slice(0, 3)
                    .map((t) => t.title)
                    .join(" · ")}
                </p>
              )}
            </section>
          );
        })}

        {/* Last on purpose: none of it can be read yet. */}
        <section aria-labelledby="this-week" className="mt-6 grid gap-8 border-t border-line pt-14 pb-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-14">
          <div>
            <h2 id="this-week" className="text-3xl leading-tight font-semibold tracking-[-0.03em]">
              Upcoming this week
            </h2>
            <p className="mt-3 font-mono text-[13px] font-medium text-accent">{weekName(currentWeek)}</p>
            <p className="mt-4 max-w-md text-[16px] leading-relaxed text-muted">{currentWeek.blurb}</p>
          </div>
          <WeekList week={currentWeek} />
        </section>
      </div>
    </>
  );
}
