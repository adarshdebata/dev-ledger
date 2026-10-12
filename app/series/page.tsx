import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PostCard } from "@/components/post-card";
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
        Each series starts with something you already use and goes one step deeper with every article. The weekly reading
        list shows what&apos;s out now and what&apos;s coming next.
      </PageHeader>

      <div className="container-page py-12">
        <section aria-labelledby="this-week" className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-14">
          <div>
            <p className="eyebrow text-accent">This week</p>
            <h2 id="this-week" className="mt-4 text-3xl leading-tight font-semibold tracking-[-0.03em]">
              {weekName(currentWeek)}
            </h2>
            <p className="mt-4 max-w-md text-[16px] leading-relaxed text-muted">{currentWeek.blurb}</p>
          </div>
          <WeekList week={currentWeek} />
        </section>

        {series.map((s) => {
          const posts = postsInSeries(s.n);
          const topics = seriesRoadmap(s.n);
          return (
            <section key={s.n} aria-labelledby={`series-${s.n}`} className="mt-20 border-t border-line pt-10">
              <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
                <div className="max-w-2xl">
                  <p className="font-mono text-sm font-medium text-accent">{String(s.n).padStart(2, "0")}</p>
                  <h2 id={`series-${s.n}`} className="mt-2 text-2xl leading-tight font-semibold tracking-[-0.02em]">
                    {s.title}
                  </h2>
                  <p className="mt-2 text-[15.5px] leading-relaxed text-muted">{s.blurb}</p>
                </div>
                <Link href={`/series/${s.n}/`} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-accent hover:underline">
                  All {topics.length} topics <ArrowRight className="size-4" />
                </Link>
              </div>
              {posts.length > 0 ? (
                <div className="mt-6">
                  {posts.map((p) => (
                    <PostCard key={p.slug} post={p} />
                  ))}
                </div>
              ) : (
                <p className="mt-6 rounded-2xl border border-dashed border-line-strong px-6 py-5 text-[15px] text-muted">
                  Nothing published here yet. The first topics: {topics.slice(0, 3).map((t) => t.title).join(" · ")}
                </p>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
