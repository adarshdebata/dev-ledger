import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, MousePointerClick } from "lucide-react";
import { Avatar } from "@/components/author";
import { HeroWaterfall } from "@/components/hero-waterfall";
import { Parallax } from "@/components/parallax";
import { PostTile } from "@/components/post-card";
import { WeekList } from "@/components/week-list";
import { WindField } from "@/components/wind-field";
import { authors } from "@/lib/authors";
import { getAllPosts, postsInSeries, seriesRoadmap } from "@/lib/posts";
import { currentWeek, external, series, site, weekName } from "@/lib/site";

const fiveQuestions = [
  "What problem does it solve?",
  "What do you see on screen?",
  "What really happens underneath?",
  "What breaks when it fails?",
  "What do people often get wrong?",
];

/** Headline words rise in one after another (CSS only; still under reduced motion). */
function Rise({ words, from = 0, className = "" }: { words: string[]; from?: number; className?: string }) {
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={w}>
          <span className="word-rise" style={{ "--d": `${(from + i) * 70}ms` } as React.CSSProperties}>
            {w}
          </span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </span>
  );
}

export default function Home() {
  const posts = getAllPosts();
  const latest = posts.slice(0, 3);
  const newest = posts[0];
  const owner = authors[0];

  return (
    <>
      {/* Hero: centred and quiet, over a field of moving air that drifts a little slower than the page */}
      <section className="relative isolate overflow-hidden">
        <Parallax distance={110} className="absolute inset-0 -z-10">
          <WindField className="size-full" />
        </Parallax>
        <div className="container-page flex flex-col items-center pt-20 pb-20 text-center sm:pt-28 lg:pb-24">
          <h1 className="max-w-4xl text-[3.1rem] leading-[0.98] font-semibold tracking-[-0.045em] text-balance sm:text-[5.6rem]">
            <Rise words={["Engineering,"]} />
            <br />
            <Rise words={["under", "the", "hood."]} from={1} className="text-accent" />
          </h1>
          <p className="animate-fade-up mt-7 max-w-xl text-lg leading-relaxed text-muted [animation-delay:280ms] sm:text-xl">{site.tagline}</p>
          <div className="animate-fade-up mt-9 flex flex-wrap justify-center gap-3 [animation-delay:340ms]">
            {newest && (
              <Link
                href={`/posts/${newest.slug}/`}
                className="inline-flex items-center gap-2 rounded-full bg-fg px-6 py-3 text-sm font-semibold text-bg shadow-lift transition-transform duration-300 hover:-translate-y-0.5"
              >
                Start reading <ArrowRight className="size-4" />
              </Link>
            )}
            <Link
              href="/series/"
              className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-transform duration-300 hover:-translate-y-0.5"
            >
              Browse series
            </Link>
          </div>
          {newest && (
            <Link
              href={`/posts/${newest.slug}/`}
              className="glass animate-fade-up group mt-6 inline-flex max-w-full items-center gap-2.5 rounded-full py-1.5 pr-3.5 pl-1.5 text-[13.5px] text-muted [animation-delay:400ms] hover:text-fg"
            >
              <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-0.5 font-mono text-[11px] font-semibold text-white">New</span>
              <span className="truncate">{newest.title}</span>
              <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}

          {/* Floating cards, as in the reference; only where there's room for them */}
          <div role="group" aria-label="At a glance" className="animate-fade-up mt-16 hidden w-full items-end justify-center gap-6 [animation-delay:520ms] lg:flex">
            <HeroWaterfall compact className="-rotate-2 text-left transition-transform duration-300 hover:rotate-0" />
            <div className="flex flex-col items-center gap-3 pb-6">
              <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13.5px] font-medium shadow-lift">
                <MousePointerClick className="size-4 text-accent" /> Interactive diagrams
              </span>
              <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13.5px] font-medium shadow-lift">
                <BadgeCheck className="size-4 text-teal" /> Checked in real Chrome
              </span>
            </div>
            {owner && (
              <Link
                href={`/about/#${owner.id}`}
                className="glass flex w-[17rem] rotate-2 items-center gap-3 rounded-2xl p-3.5 text-left shadow-lift transition-transform duration-300 hover:rotate-0"
              >
                <Avatar person={{ name: owner.name, author: owner }} size={44} />
                <span className="min-w-0">
                  <span className="eyebrow block text-subtle">Written by</span>
                  <span className="mt-0.5 block truncate font-semibold">{owner.name}</span>
                  <span className="block truncate text-[12.5px] text-muted">Backend developer</span>
                </span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Latest: the three newest articles, nothing more */}
      <section id="latest" className="container-page scroll-mt-28">
        <div className="border-t border-line pt-10">
          <div className="flex items-baseline justify-between gap-4">
            <SectionLabel>Latest</SectionLabel>
            <Link href="/series/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline">
              View all articles <ArrowRight className="size-4" />
            </Link>
          </div>
          {latest.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {latest.map((p) => (
                <PostTile key={p.slug} post={p} />
              ))}
            </div>
          ) : (
            <p className="mt-6 text-muted">The first article is on its way.</p>
          )}
        </div>
      </section>

      {/* Series */}
      <section id="series" className="container-page mt-28 scroll-mt-28">
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
                <Link key={s.n} href={`/series/${s.n}/`} className="group flex flex-col bg-bg p-7 transition-colors hover:bg-card">
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
            <div className="flex flex-col bg-bg-soft p-7">
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

      {/* Case studies */}
      <section className="container-page mt-28">
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

      {/* Upcoming this week goes last: none of it can be read yet, and attention drops sharply after the first screens (NN/g). */}
      <section id="this-week" className="container-page mt-28 scroll-mt-28">
        <div className="grid gap-10 border-t border-line pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:gap-14">
          <div>
            <h2 className="text-3xl leading-tight font-semibold tracking-[-0.03em]">Upcoming this week</h2>
            <p className="mt-3 font-mono text-[13px] font-medium text-accent">{weekName(currentWeek)}</p>
            <p className="mt-4 max-w-md text-[16px] leading-relaxed text-muted">
              {currentWeek.blurb} Start at the top for the full picture, or jump to any post.
            </p>
          </div>
          <WeekList week={currentWeek} />
        </div>
      </section>
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow text-accent">{children}</p>;
}
