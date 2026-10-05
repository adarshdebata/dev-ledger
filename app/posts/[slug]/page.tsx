import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronDown, Clock, GitBranch, Pencil } from "lucide-react";
import { mdxComponents } from "@/components/mdx";
import { roadmapLabel } from "@/components/post-card";
import { ReadingProgress, Toc } from "@/components/toc";
import { renderMdx } from "@/lib/mdx";
import { formatDate, getAllPosts, getPost, postForRoadmapItem } from "@/lib/posts";
import { absoluteUrl, alternates, getChain, getSeries, roadmap, site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  const url = `/posts/${post.slug}/`;
  const image = { url: `${url}og.png`, width: 1200, height: 630, alt: post.title };
  return {
    title: post.title,
    description: post.summary,
    keywords: post.tags,
    alternates: alternates(url),
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      url,
      publishedTime: post.date,
      authors: [site.author.name],
      tags: post.tags,
      images: [image],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.summary, images: [image.url] },
  };
}

export default async function PostPage({ params }: Props) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  const { Content, toc } = await renderMdx(post.source);
  const series = getSeries(post.series)!;
  const chain = post.chain ? getChain(post.chain) : undefined;
  const stageIndex = chain ? chain.stages.findIndex((s) => s.roadmap.some((n) => post.roadmap.includes(n))) : -1;
  const stage = chain && stageIndex >= 0 ? chain.stages[stageIndex] : undefined;
  const nextStage = chain && stageIndex >= 0 ? chain.stages[stageIndex + 1] : undefined;
  const nextStagePost = nextStage?.roadmap.map(postForRoadmapItem).find(Boolean);
  const nextItem = roadmap.find((r) => r.n === Math.max(...post.roadmap) + 1 && r.series === post.series);
  const nextItemPost = nextItem ? postForRoadmapItem(nextItem.n) : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    author: { "@type": "Person", name: site.author.name, url: site.author.github },
    image: absoluteUrl(`/posts/${post.slug}/og.png`),
    url: absoluteUrl(`/posts/${post.slug}/`),
    keywords: post.tags.join(", "),
    license: "https://creativecommons.org/licenses/by/4.0/",
  };

  return (
    <>
      <ReadingProgress />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] overflow-hidden">
          <div className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_80%_70%_at_30%_0%,black,transparent)]" />
          <div className="absolute -top-40 left-[10%] h-96 w-[40rem] rounded-full bg-[radial-gradient(closest-side,rgba(118,75,162,0.16),transparent)]" />
        </div>

        <div className="container-page relative">
          <div className="mx-auto max-w-[45rem] xl:grid xl:max-w-[64rem] xl:grid-cols-[minmax(0,45rem)_15rem] xl:gap-16">
            <div className="min-w-0">
              <header className="pt-12 pb-10 sm:pt-16" data-pagefind-body>
                <Link
                  href={`/series/${series.n}/`}
                  className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-line bg-card/70 px-3 py-1 text-[12.5px] font-medium text-muted backdrop-blur transition-colors hover:border-line-strong hover:text-fg"
                  data-pagefind-ignore
                >
                  <span className="text-gradient font-mono font-bold">S{series.n}</span>
                  {series.title}
                </Link>
                <h1
                  data-pagefind-meta="title"
                  className="animate-fade-up mt-5 text-[2.15rem] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance [animation-delay:60ms] sm:text-5xl"
                >
                  {post.title}
                </h1>
                <p className="animate-fade-up mt-4 text-lg leading-relaxed text-muted [animation-delay:120ms] sm:text-xl">
                  {post.subtitle}
                </p>

                <div className="animate-fade-up mt-7 flex flex-wrap items-center gap-x-4 gap-y-3 [animation-delay:180ms]" data-pagefind-ignore>
                  <span className="flex items-center gap-2.5">
                    <span className="bg-brand grid size-9 place-items-center rounded-full text-[13px] font-bold text-white">AD</span>
                    <span className="leading-tight">
                      <span className="block text-sm font-semibold">{site.author.name}</span>
                      <span className="block text-[12.5px] text-subtle">
                        <time dateTime={post.date}>{formatDate(post.date)}</time>
                        <span className="mx-1.5">·</span>
                        <Clock className="mr-1 inline size-3 align-[-1px]" />
                        {post.readingMinutes} min read
                      </span>
                    </span>
                  </span>
                  <span className="hidden h-8 w-px bg-line sm:block" />
                  <span className="flex flex-wrap gap-2">
                    <span className="rounded-md border border-line bg-card px-2 py-1 font-mono text-[11.5px] text-muted">
                      Roadmap {roadmapLabel(post.roadmap)}
                    </span>
                    {chain && stage && (
                      <Link
                        href={`/chains/${chain.id}/`}
                        className="inline-flex items-center gap-1.5 rounded-md border border-accent-soft/40 bg-accent-tint px-2 py-1 text-[11.5px] font-medium text-accent transition-colors hover:border-accent-soft"
                      >
                        <GitBranch className="size-3" />
                        {chain.title} · {stage.name}
                      </Link>
                    )}
                  </span>
                </div>
              </header>

              {toc.length > 0 && (
                <details className="group mb-10 rounded-xl border border-line bg-card shadow-card xl:hidden" data-pagefind-ignore>
                  <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                    On this page
                    <ChevronDown className="size-4 text-subtle transition-transform group-open:rotate-180" />
                  </summary>
                  <ol className="border-t border-line px-4 py-3 text-[13.5px]">
                    {toc.map((t) => (
                      <li key={t.id} className={t.depth === 3 ? "pl-4" : ""}>
                        <a href={`#${t.id}`} className="block py-1 text-muted hover:text-fg">
                          {t.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </details>
              )}

              <div className="prose-ledger prose" data-pagefind-body>
                <Content components={mdxComponents(post.slug)} />
              </div>

              <footer className="mt-16 space-y-8 border-t border-line pt-10" data-pagefind-ignore>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((t) => (
                      <Link
                        key={t}
                        href={`/tags/${t}/`}
                        className="rounded-lg border border-line bg-card px-3 py-1.5 text-[13px] text-muted transition-colors hover:border-accent-soft/60 hover:text-fg"
                      >
                        <span className="text-accent">#</span>
                        {t}
                      </Link>
                    ))}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {nextItem && (
                    <NextCard
                      eyebrow={`Next in Series ${series.n}`}
                      title={nextItemPost?.title ?? nextItem.title}
                      href={nextItemPost ? `/posts/${nextItemPost.slug}/` : `/series/${series.n}/`}
                      soon={!nextItemPost}
                    />
                  )}
                  {chain && nextStage && (
                    <NextCard
                      eyebrow={`Next stop on ${chain.title}`}
                      title={nextStagePost?.title ?? nextStage.name}
                      sub={nextStagePost ? undefined : nextStage.note}
                      href={nextStagePost ? `/posts/${nextStagePost.slug}/` : `/chains/${chain.id}/`}
                      soon={!nextStagePost}
                    />
                  )}
                </div>

                <div className="flex flex-col gap-3 rounded-xl bg-bg-soft px-5 py-4 text-[13px] text-muted sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    This article is licensed{" "}
                    <a href="https://creativecommons.org/licenses/by/4.0/" className="underline underline-offset-2 hover:text-fg">
                      CC BY 4.0
                    </a>
                    ; its code samples are MIT.
                  </p>
                  <a
                    href={`${site.repo}/edit/main/content/posts/${post.slug}/index.mdx`}
                    className="inline-flex shrink-0 items-center gap-1.5 font-medium text-fg hover:text-accent"
                  >
                    <Pencil className="size-3.5" /> Suggest an edit
                  </a>
                </div>
              </footer>
            </div>

            <aside className="hidden xl:block" data-pagefind-ignore>
              <div className="scroll-thin sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto pt-16 pb-6">
                <Toc items={toc} />
              </div>
            </aside>
          </div>
        </div>
      </article>
    </>
  );
}

function NextCard({ eyebrow, title, sub, href, soon }: { eyebrow: string; title: string; sub?: string; href: string; soon: boolean }) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-line bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift"
    >
      <span className="flex items-center justify-between text-xs font-medium text-subtle">
        {eyebrow}
        {soon && <span className="rounded-full bg-accent-tint px-2 py-0.5 text-[10.5px] font-semibold text-accent">Coming soon</span>}
      </span>
      <span className="mt-2 font-semibold leading-snug tracking-tight">{title}</span>
      {sub && <span className="mt-1 text-[13px] text-muted">{sub}</span>}
      <ArrowRight className="mt-3 size-4 text-subtle transition-all group-hover:translate-x-1 group-hover:text-accent" />
    </Link>
  );
}
