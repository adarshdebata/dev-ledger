import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Avatar, SocialLinks } from "@/components/author";
import { HeroWaterfall } from "@/components/hero-waterfall";
import { Parallax } from "@/components/parallax";
import { IssueTag, PostCard, PostCover, PostMetaLine, postStage } from "@/components/post-card";
import { PostThumb, thumbFor } from "@/components/post-thumb";
import { WeekList } from "@/components/week-list";
import { WindField } from "@/components/wind-field";
import { authors } from "@/lib/authors";
import { getAllPosts, postsInSeries, seriesRoadmap } from "@/lib/posts";
import { chains, currentWeek, external, series, site } from "@/lib/site";

const fiveQuestions = [
  "What problem does it solve?",
  "What do you see on screen?",
  "What really happens underneath?",
  "What breaks when it fails?",
  "What do people often get wrong?",
];

export default function Home() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;
  const where = featured ? postStage(featured) : undefined;
  const owner = authors[0];

  return (
    <>
      {/* Hero: big type over a quiet field of moving air that drifts a little slower than the page */}
      <section className="relative isolate overflow-hidden">
        <Parallax distance={110} className="absolute inset-0 -z-10">
          <WindField className="size-full" />
        </Parallax>
        <div className="container-page pt-20 pb-16 sm:pt-28 sm:pb-24">
          <p className="eyebrow animate-fade-up text-accent">{site.theme}</p>
          <h1 className="animate-fade-up mt-6 max-w-4xl text-[3rem] leading-[0.98] font-semibold tracking-[-0.045em] text-balance [animation-delay:60ms] sm:text-[5.25rem]">
            Engineering,
            <br />
            <span className="text-accent">under the hood.</span>
          </h1>
          <p className="animate-fade-up mt-8 max-w-2xl text-lg leading-relaxed text-muted [animation-delay:120ms] sm:text-xl">
            {site.tagline} What really happens when you click a button, call an API or hit an error, explained so anyone can
            follow, then deep enough that experienced engineers still learn something.
          </p>
          <p className="animate-fade-up mt-6 font-mono text-[13px] text-subtle [animation-delay:160ms]">{site.hook}</p>
          <div className="animate-fade-up mt-10 flex flex-wrap items-center gap-3 [animation-delay:200ms]">
            {featured && (
              <Link
                href={`/posts/${featured.slug}/`}
                className="inline-flex items-center gap-2 rounded-xl bg-fg px-5 py-3 text-sm font-semibold text-bg transition-transform duration-300 hover:-translate-y-0.5"
              >
                Read the latest <ArrowRight className="size-4" />
              </Link>
            )}
            <Link
              href="/chains/request/"
              className="inline-flex items-center gap-2 rounded-xl border border-line-strong px-5 py-3 text-sm font-semibold transition-colors hover:border-fg"
            >
              Follow one request
            </Link>
          </div>
          {owner && (
            <div className="animate-fade-up mt-10 flex flex-wrap items-center gap-x-3 gap-y-1 [animation-delay:240ms]">
              <Avatar person={{ name: owner.name, author: owner }} size={30} />
              <p className="text-[14px] text-muted">
                Written by{" "}
                <Link href={`/about/#${owner.id}`} className="font-medium text-fg hover:text-accent">
                  {owner.name}
                </Link>
                {owner.title && <span className="hidden sm:inline"> · {owner.title}</span>}
              </p>
              <SocialLinks author={owner} className="-ml-1" />
            </div>
          )}
        </div>
      </section>

      {/* Featured: an editorial block, not a card */}
      <section id="latest" className="container-page scroll-mt-28">
        <div className="border-t border-line pt-10">
          <SectionLabel>Latest</SectionLabel>
          {featured ? (
            <article className="group relative mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
              <div>
                <h2 className="max-w-3xl text-3xl leading-[1.1] font-semibold tracking-[-0.03em] text-balance sm:text-[2.75rem]">
                  <Link href={`/posts/${featured.slug}/`} className="after:absolute after:inset-0">
                    {featured.title}
                  </Link>
                </h2>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{featured.subtitle}</p>
                <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-muted">{featured.summary}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                  Read the article <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
              <dl className="space-y-4 border-line text-sm lg:border-l lg:pl-8">
                {featured.cover ? <PostCover post={featured} /> : <PostThumb motif={thumbFor(featured)} />}
                <div>
                  <dt className="eyebrow text-subtle">Part of</dt>
                  <dd className="mt-1.5 flex flex-col gap-1">
                    <IssueTag post={featured} />
                    {currentWeek.days.some((d) => d.slug === featured.slug) && <span className="text-muted">{currentWeek.title}</span>}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-subtle">Published</dt>
                  <dd className="mt-1.5"><PostMetaLine post={featured} /></dd>
                </div>
                <div>
                  <dt className="eyebrow text-subtle">Series</dt>
                  <dd className="mt-1.5 text-muted">{series[featured.series - 1].title}</dd>
                </div>
                {where && (
                  <div>
                    <dt className="eyebrow text-subtle">Path</dt>
                    <dd className="mt-1.5 text-teal">
                      {where.chain.title} · {where.stage.name}
                    </dd>
                  </div>
                )}
              </dl>
            </article>
          ) : (
            <p className="mt-6 text-muted">The first article is on its way.</p>
          )}
          {rest.length > 0 && (
            <div className="mt-10">
              {rest.slice(0, 6).map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* The current week: one theme, one post a day */}
      <section id="this-week" className="container-page mt-24 scroll-mt-28">
        <div className="grid gap-10 border-t border-line pt-10 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-14">
          <div>
            <SectionLabel>This week</SectionLabel>
            <h2 className="mt-4 max-w-xl text-3xl leading-tight font-semibold tracking-[-0.03em]">
              Week {currentWeek.n}: {currentWeek.title}
            </h2>
            <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-muted">
              {currentWeek.blurb} Start at the top for the full picture, or jump to any post.
            </p>
            <WeekList week={currentWeek} className="mt-7 max-w-xl" />
          </div>
          <HeroWaterfall />
        </div>
      </section>

      {/* Series */}
      <section id="series" className="container-page mt-24 scroll-mt-28">
        <div className="border-t border-line pt-10">
          <SectionLabel>Series</SectionLabel>
          <h2 className="mt-4 text-3xl leading-tight font-semibold tracking-[-0.03em]">Five series, one hundred questions</h2>
          <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-muted">
            No levels and no prerequisites. Every article starts with something you already use, then goes one step deeper at a
            time.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {series.map((s) => {
              const covered = seriesRoadmap(s.n).filter((r) => r.post).length;
              const count = postsInSeries(s.n).length;
              return (
                <Link key={s.n} href={`/series/${s.n}/`} className="group flex flex-col bg-bg p-6 transition-colors hover:bg-card">
                  <span className="font-mono text-sm font-medium text-accent">{String(s.n).padStart(2, "0")}</span>
                  <h3 className="mt-3 text-lg leading-snug font-semibold tracking-tight">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.blurb}</p>
                  <div className="mt-auto pt-6">
                    <div className="flex justify-between font-mono text-[11.5px] text-subtle">
                      <span>{count === 0 ? "coming soon" : `${count} article${count === 1 ? "" : "s"}`}</span>
                      <span>{covered}/20</span>
                    </div>
                    <div className="mt-2 h-[2px] bg-line">
                      <div className="h-full bg-accent-soft" style={{ width: `${covered * 5}%` }} />
                    </div>
                  </div>
                </Link>
              );
            })}
            <div className="flex flex-col bg-bg-soft p-6">
              <p className="text-lg font-semibold tracking-tight">Every article answers five questions</p>
              <ol className="mt-4 space-y-2.5 text-[15px] text-muted">
                {fiveQuestions.map((q, i) => (
                  <li key={q} className="flex gap-3">
                    <span className="font-mono text-[13px] leading-6 text-accent">{i + 1}</span>
                    {q}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Chains */}
      <section id="chains" className="container-page mt-24 scroll-mt-28">
        <div className="border-t border-line pt-10">
          <SectionLabel>Chains</SectionLabel>
          <h2 className="mt-4 text-3xl leading-tight font-semibold tracking-[-0.03em]">Follow one thing all the way</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {chains.map((c) => (
              <Link
                key={c.id}
                href={`/chains/${c.id}/`}
                className="group rounded-2xl border border-line p-6 transition-colors hover:border-line-strong hover:bg-card"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold tracking-tight">{c.title}</h3>
                  <ArrowRight className="size-5 text-subtle transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent" />
                </div>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{c.blurb}</p>
                <p className="mt-5 font-mono text-[12px] leading-relaxed text-subtle">{c.stages.map((s) => s.name).join("  →  ")}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Case studies */}
      <section className="container-page mt-24">
        <div className="border-t border-line pt-10">
          <div className="flex items-baseline justify-between gap-4">
            <SectionLabel>Case studies</SectionLabel>
            <Link href="/case-studies/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline">
              All case studies <ArrowRight className="size-4" />
            </Link>
          </div>
          <a href={external.url} className="group mt-6 flex items-start justify-between gap-6 rounded-2xl border border-line p-6 transition-colors hover:border-line-strong hover:bg-card">
            <span className="min-w-0">
              <span className="block text-xl font-semibold tracking-tight">{external.title}</span>
              <span className="mt-1.5 block max-w-2xl text-[15px] leading-relaxed text-muted">{external.blurb}</span>
              <span className="mt-3 block font-mono text-xs text-subtle">adarshdebata.github.io/npm-to-pnpm-migration</span>
            </span>
            <ArrowUpRight className="size-5 shrink-0 text-subtle transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
          </a>
        </div>
      </section>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow text-accent">{children}</p>;
}
