import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { PostCard } from "@/components/post-card";
import { pageParams, paginate, parsePage, postsInSeries, seriesRoadmap } from "@/lib/posts";
import { alternates, getSeries, series } from "@/lib/site";

type Props = { params: Promise<{ n: string; page?: string[] }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return series.flatMap((s) => pageParams(postsInSeries(s.n).length).map((page) => ({ n: String(s.n), page })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { n } = await params;
  const s = getSeries(Number(n));
  return s ? { title: `Series ${s.n}: ${s.title}`, description: s.blurb, alternates: alternates(`/series/${s.n}/`) } : {};
}

export default async function SeriesPage({ params }: Props) {
  const { n, page: segments } = await params;
  const s = getSeries(Number(n));
  const page = parsePage(segments);
  if (!s || !page) notFound();

  const { items, pages } = paginate(postsInSeries(s.n), page);
  const topics = seriesRoadmap(s.n);
  const covered = topics.filter((t) => t.post).length;

  return (
    <>
      <PageHeader eyebrow={`Series ${String(s.n).padStart(2, "0")}`} title={s.title}>
        {s.blurb}
      </PageHeader>

      <div className="container-page grid grid-cols-1 gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section>
          <h2 className="text-sm font-semibold tracking-wide text-subtle uppercase">Articles</h2>
          {items.length > 0 ? (
            <div className="mt-5 grid gap-5">
              {items.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-2xl border border-dashed border-line-strong p-8 text-center text-muted">
              The first article in this series is being written. The topics on the right are what&apos;s coming.
            </p>
          )}
          <Pagination base={`/series/${s.n}/`} page={page} pages={pages} />
        </section>

        <aside>
          <div className="rounded-2xl border border-line p-5 lg:sticky lg:top-28">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold">Topics in this series</h2>
              <span className="font-mono text-xs text-subtle">{covered}/20</span>
            </div>
            <ol className="mt-4 space-y-2.5 text-[13.5px] lg:max-h-[65vh] lg:overflow-y-auto lg:pr-1">
              {topics.map((t) => (
                <li key={t.n} className="flex gap-2.5">
                  {t.post ? (
                    <span className="bg-brand mt-0.5 grid size-4 shrink-0 place-items-center rounded-full">
                      <Check className="size-2.5 text-white" strokeWidth={3.5} />
                    </span>
                  ) : (
                    <span className="mt-[3px] w-4 shrink-0 text-right font-mono text-[11px] text-subtle">{t.n}</span>
                  )}
                  {t.post ? (
                    <Link href={`/posts/${t.post.slug}/`} className="font-medium text-fg hover:text-accent">
                      {t.title}
                    </Link>
                  ) : (
                    <span className="text-muted">{t.title}</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </>
  );
}
