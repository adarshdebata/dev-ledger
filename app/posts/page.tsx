import type { Metadata } from "next";
import Link from "next/link";
import { BlogIndex, type BlogEntry, type BlogGroup } from "@/components/blog-index";
import { PageHeader } from "@/components/page-header";
import { thumbFor } from "@/components/post-thumb";
import { localCaseStudies } from "@/lib/case-studies";
import { formatDate, getAllPosts } from "@/lib/posts";
import { alternates, getSeries, series, weekName, weekPlace, weeks } from "@/lib/site";

export const metadata: Metadata = {
  title: "All blogs",
  description: "Every Dev Ledger blog in one list. Search by title, topic or tag, and sort by date, title or reading time.",
  alternates: alternates("/posts/"),
};

/** Every post and case study written on this site, built from the content folders at build time. */
function entries(): BlogEntry[] {
  const posts: BlogEntry[] = getAllPosts().map((p) => {
    const at = weekPlace(p.slug);
    return {
      href: `/posts/${p.slug}/`,
      title: p.title,
      subtitle: p.subtitle,
      summary: p.summary,
      date: p.date,
      dateLabel: formatDate(p.date),
      minutes: p.readingMinutes,
      tags: p.tags,
      place: at ? weekName(at.week) : `Series ${p.series}: ${getSeries(p.series)?.title}`,
      group: at ? `week-${at.week.n}` : `series-${p.series}`,
      // Reading order: week by week, then any post outside the weekly plan, then case studies.
      order: at ? at.week.n * 100 + at.day.day : 5_000 + p.series,
      motif: thumbFor(p),
    };
  });
  const cases: BlogEntry[] = localCaseStudies().map((c) => ({
    href: `/case-studies/${c.slug}/`,
    title: c.title,
    subtitle: c.summary,
    summary: "case study",
    date: c.date ?? "",
    dateLabel: c.date ? formatDate(c.date) : "",
    minutes: c.readingMinutes ?? 1,
    tags: c.tags,
    place: "Case study",
    group: "case-studies",
    order: 10_000,
    motif: c.thumb ?? thumbFor({ tags: c.tags }),
  }));
  return [...posts, ...cases];
}

/** The collection filters, in reading order, for whatever exists: each week, any series outside the plan, case studies. */
function groupsFor(list: BlogEntry[]): BlogGroup[] {
  const has = (id: string) => list.some((e) => e.group === id);
  return [
    ...weeks.filter((w) => has(`week-${w.n}`)).map((w) => ({ id: `week-${w.n}`, label: `Week ${w.n}` })),
    ...series.filter((s) => has(`series-${s.n}`)).map((s) => ({ id: `series-${s.n}`, label: `Series ${s.n}` })),
    ...(has("case-studies") ? [{ id: "case-studies", label: "Case studies" }] : []),
  ];
}

export default function AllBlogsPage() {
  const list = entries();
  return (
    <>
      <PageHeader eyebrow="All blogs" title="Every blog, in one list">
        Search by title, topic or tag, sort by date, title or reading time, or narrow it to one week. Prefer to read in order?{" "}
        <Link href="/series/" className="font-medium text-fg underline decoration-line-strong underline-offset-4 hover:decoration-accent">
          The series
        </Link>{" "}
        keep each topic together.
      </PageHeader>
      <div className="container-page py-10">
        <BlogIndex entries={list} groups={groupsFor(list)} />
      </div>
    </>
  );
}
