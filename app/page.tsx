import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, GitBranch } from "lucide-react";
import { ChainStrip } from "@/components/chain-path";
import { HeroWaterfall } from "@/components/hero-waterfall";
import { PostCard, PostCover, PostMetaLine } from "@/components/post-card";
import { getAllPosts, postsInSeries, seriesRoadmap } from "@/lib/posts";
import { chains, external, series, site } from "@/lib/site";

export default function Home() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;
  const requestChain = chains[0];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
        <div className="pointer-events-none absolute -top-48 left-1/2 h-[34rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(118,75,162,0.22),transparent)]" />
        <div className="pointer-events-none absolute top-20 -left-40 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(102,126,234,0.16),transparent)]" />

        <div className="container-page relative pt-16 pb-14 sm:pt-24 sm:pb-20">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_25rem] xl:gap-16">
            <div>
              {featured && (
                <Link
                  href={`/posts/${featured.slug}/`}
                  className="animate-fade-up group inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-card/70 py-1 pr-3 pl-1 text-[13px] shadow-card backdrop-blur transition-colors hover:border-line-strong"
                >
                  <span className="bg-brand shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white">New</span>
                  <span className="truncate text-muted group-hover:text-fg">{featured.title}</span>
                  <ArrowRight className="size-3.5 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}

              <h1 className="animate-fade-up mt-7 max-w-4xl text-[2.6rem] leading-[1.05] font-extrabold tracking-[-0.035em] text-balance [animation-delay:60ms] sm:text-7xl lg:text-[4.25rem]">
                Engineering, <span className="text-gradient">under the hood.</span>
              </h1>
              <p className="animate-fade-up mt-6 max-w-2xl text-lg leading-relaxed text-muted [animation-delay:120ms] sm:text-xl">
                {site.tagline} From the browser to the database, from a button click to bank settlement, one honest
                deep dive at a time.
              </p>
              <p className="animate-fade-up mt-5 border-l-2 border-accent-soft pl-4 text-[15px] text-fg/80 italic [animation-delay:180ms]">
                {site.hook}
              </p>

              <div className="animate-fade-up mt-9 flex flex-wrap gap-3 [animation-delay:240ms]">
                {featured && (
                  <Link
                    href={`/posts/${featured.slug}/`}
                    className="bg-brand inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lift transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    <BookOpen className="size-4" /> Read the latest
                  </Link>
                )}
                <Link
                  href="/chains/request/"
                  className="inline-flex items-center gap-2 rounded-xl border border-line bg-card px-5 py-3 text-sm font-semibold shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong"
                >
                  <GitBranch className="size-4 text-accent" /> Follow one request
                </Link>
              </div>
            </div>
            <div className="animate-fade-up [animation-delay:200ms]">
              <HeroWaterfall />
            </div>
          </div>

          <div className="animate-fade-up mt-14 rounded-2xl border border-line bg-card/70 p-5 shadow-card backdrop-blur [animation-delay:300ms] sm:p-6">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <p className="text-sm font-semibold">
                {requestChain.title}
                <span className="ml-2 font-normal text-subtle">every hop, its own article</span>
              </p>
              <Link href="/chains/request/" className="shrink-0 text-sm font-medium text-accent hover:underline">
                See the chain
              </Link>
            </div>
            <ChainStrip chain={requestChain} />
          </div>
        </div>
      </section>

      {/* Latest */}
      <section id="latest" className="container-page scroll-mt-24 py-12">
        <SectionTitle eyebrow="Latest" title="Fresh from the ledger" />
        {featured ? (
          <article className="group relative mt-8 grid grid-cols-1 overflow-hidden rounded-3xl border border-line bg-card shadow-card transition-all duration-300 hover:border-line-strong hover:shadow-lift md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            <div className="flex flex-col p-6 sm:p-9">
              <p className="text-xs font-semibold tracking-wide text-accent">
                Series {featured.series} · {series[featured.series - 1].title}
              </p>
              <h3 className="mt-3 text-2xl leading-tight font-bold tracking-tight text-balance sm:text-[2rem]">
                <Link href={`/posts/${featured.slug}/`} className="after:absolute after:inset-0">
                  {featured.title}
                </Link>
              </h3>
              <p className="mt-3 text-[17px] leading-relaxed text-muted">{featured.subtitle}</p>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">{featured.summary}</p>
              <div className="mt-auto flex items-center justify-between pt-6">
                <PostMetaLine post={featured} />
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent">
                  Read <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
            <div className="p-3 pt-0 md:p-3 md:pl-0">
              <PostCover post={featured} large />
            </div>
          </article>
        ) : (
          <p className="mt-6 text-muted">The first article is on its way.</p>
        )}
        {rest.length > 0 && (
          <div className="mt-6 grid gap-5">
            {rest.slice(0, 6).map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        )}
      </section>

      {/* Series */}
      <section id="series" className="container-page scroll-mt-24 py-12">
        <SectionTitle eyebrow="Series" title="Five series, one hundred questions">
          No levels, no prerequisites. Start anywhere: each article begins with something you already use and goes as
          deep as it needs to.
        </SectionTitle>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {series.map((s) => {
            const covered = seriesRoadmap(s.n).filter((r) => r.post).length;
            const count = postsInSeries(s.n).length;
            return (
              <Link
                key={s.n}
                href={`/series/${s.n}/`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift"
              >
                <span className="text-gradient font-mono text-4xl font-bold">{String(s.n).padStart(2, "0")}</span>
                <h3 className="mt-4 text-lg leading-snug font-bold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.blurb}</p>
                <div className="mt-auto pt-6">
                  <div className="flex justify-between text-xs text-subtle">
                    <span>{count === 0 ? "Coming soon" : `${count} article${count === 1 ? "" : "s"}`}</span>
                    <span className="font-mono">{covered}/20 topics</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-soft">
                    <div className="bg-brand h-full rounded-full" style={{ width: `${Math.max(covered * 5, 0)}%` }} />
                  </div>
                </div>
              </Link>
            );
          })}
          <div className="flex flex-col justify-center rounded-2xl border border-dashed border-line-strong p-6">
            <p className="text-sm font-semibold">Every article answers five questions</p>
            <ol className="mt-3 space-y-1.5 text-sm text-muted">
              {["What problem does this solve?", "What does the developer see?", "What is actually happening underneath?", "What breaks when it fails?", "What misconception do developers commonly have?"].map((q, i) => (
                <li key={q} className="flex gap-2.5">
                  <span className="font-mono text-xs leading-5 text-accent">{i + 1}</span>
                  {q}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Chains */}
      <section id="chains" className="container-page scroll-mt-24 py-12">
        <SectionTitle eyebrow="Chains" title="Follow one thing all the way down">
          Two long-running threads: a single HTTP request and a single payment, traced hop by hop.
        </SectionTitle>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {chains.map((c) => (
            <Link
              key={c.id}
              href={`/chains/${c.id}/`}
              className="group rounded-2xl border border-line bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold tracking-tight">{c.title}</h3>
                <ArrowRight className="size-5 text-subtle transition-all group-hover:translate-x-0.5 group-hover:text-accent" />
              </div>
              <p className="mt-2 text-[15px] text-muted">{c.blurb}</p>
              <p className="mt-5 font-mono text-[12px] leading-relaxed text-subtle">
                {c.stages.map((s) => s.name).join("  →  ")}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* External */}
      <section className="container-page py-12">
        <SectionTitle eyebrow="Elsewhere" title="Also written" />
        <a
          href={external.url}
          className="group mt-8 flex items-start gap-5 rounded-2xl border border-line bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent-tint font-mono text-sm font-bold text-accent">
            npm
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2 text-lg font-bold tracking-tight">
              {external.title}
              <ArrowUpRight className="size-4 text-subtle transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
            </span>
            <span className="mt-1 block text-[15px] text-muted">{external.blurb}</span>
            <span className="mt-2 block font-mono text-xs text-subtle">adarshdebata.github.io/npm-to-pnpm-migration</span>
          </span>
        </a>
      </section>
    </>
  );
}

function SectionTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-xs tracking-widest text-accent uppercase">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
      {children && <p className="mt-3 text-[16px] leading-relaxed text-muted">{children}</p>}
    </div>
  );
}
