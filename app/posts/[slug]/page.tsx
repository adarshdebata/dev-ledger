import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronDown, Pencil } from "lucide-react";
import { AuthorCard, Avatar, PersonName } from "@/components/author";
import { mdxComponents } from "@/components/mdx";
import { RevealOnScroll } from "@/components/reveal-on-scroll";
import { ReadingProgress, Toc } from "@/components/toc";
import { historyOf } from "@/lib/git-meta";
import { renderMdx } from "@/lib/mdx";
import { formatDate, getAllPosts, getPost, postForRoadmapItem } from "@/lib/posts";
import { absoluteUrl, alternates, getChain, getSeries, roadmap, site, weekName, weekPlace } from "@/lib/site";

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
  const at = weekPlace(post.slug);
  const nextDayPost = at?.next?.slug ? getPost(at.next.slug) : undefined;
  // Posts outside the weekly plan point at the next topic in their series instead.
  const nextItem = at ? undefined : roadmap.find((r) => r.n === Math.max(...post.roadmap) + 1 && r.series === post.series);
  const nextItemPost = nextItem ? postForRoadmapItem(nextItem.n) : undefined;

  // Who wrote it (frontmatter, else the first commit) and who last changed it (file-level Git history).
  const history = historyOf(`content/posts/${post.slug}/index.mdx`, post.author);
  const author = history.author ?? { name: site.author.name };
  const updated = history.updated && (history.revisions ?? 1) > 1 && history.updated.date > post.date ? history.updated : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    ...(updated ? { dateModified: updated.date } : {}),
    author: { "@type": "Person", name: author.name, url: author.author ? `https://github.com/${author.author.github}` : site.author.github },
    image: absoluteUrl(`/posts/${post.slug}/og.png`),
    url: absoluteUrl(`/posts/${post.slug}/`),
    keywords: post.tags.join(", "),
    license: "https://creativecommons.org/licenses/by/4.0/",
  };

  return (
    <>
      <ReadingProgress />
      <RevealOnScroll />
      {/* "<" is escaped so no title or summary can ever close this tag early. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <article className="relative isolate">
        <div
          aria-hidden="true"
          className="bg-airflow pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[34rem] opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />

        <div className="container-page">
          <div className="mx-auto max-w-[45rem] xl:grid xl:max-w-[64rem] xl:grid-cols-[minmax(0,45rem)_15rem] xl:gap-16">
            <div className="min-w-0">
              <header className="pt-14 pb-10 sm:pt-20" data-pagefind-body>
                <Link href={`/series/${series.n}/`} className="eyebrow animate-fade-up inline-block text-accent hover:underline" data-pagefind-ignore>
                  Series {series.n} · {series.title}
                </Link>
                <h1
                  data-pagefind-meta="title"
                  className="animate-fade-up mt-5 text-[2.35rem] leading-[1.06] font-semibold tracking-[-0.04em] text-balance [animation-delay:40ms] sm:text-[3.4rem]"
                >
                  {post.title}
                </h1>
                <p className="animate-fade-up mt-5 text-lg leading-relaxed text-muted [animation-delay:100ms] sm:text-xl">
                  {post.subtitle}
                </p>

                <div
                  className="animate-fade-up mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-line py-3 font-mono text-[12.5px] text-subtle [animation-delay:160ms]"
                  data-pagefind-ignore
                >
                  <span className="flex items-center gap-2 text-fg">
                    <Avatar person={author} size={22} />
                    <PersonName person={author} />
                  </span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span aria-hidden="true">·</span>
                  <span>{post.readingMinutes} min read</span>
                  {at && (
                    <>
                      <span aria-hidden="true">·</span>
                      <Link href="/#this-week" className="hover:text-fg hover:underline">
                        {weekName(at.week)}
                      </Link>
                    </>
                  )}
                  {chain && stage && (
                    <>
                      <span aria-hidden="true">·</span>
                      <Link href={`/chains/${chain.id}/`} className="text-teal hover:underline">
                        {chain.title} / {stage.name}
                      </Link>
                    </>
                  )}
                </div>
                {updated && (
                  <p className="animate-fade-up mt-2.5 font-mono text-[11.5px] text-subtle [animation-delay:180ms]" data-pagefind-ignore>
                    Updated <time dateTime={updated.date}>{formatDate(updated.date)}</time> by <PersonName person={updated.by} />
                    {history.revisions && <> · {history.revisions} revisions</>}
                  </p>
                )}
              </header>

              {toc.length > 0 && (
                <details className="group animate-fade-up mb-10 rounded-xl border border-line [animation-delay:200ms] xl:hidden" data-pagefind-ignore>
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

              <div className="prose-ledger prose animate-fade-up [animation-delay:220ms]" data-pagefind-body data-reveal-root>
                <Content components={mdxComponents(post.slug)} />
              </div>

              <footer className="mt-16 space-y-8 border-t border-line pt-10" data-pagefind-ignore>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((t) => (
                      <Link
                        key={t}
                        href={`/tags/${t}/`}
                        className="rounded-lg border border-line px-3 py-1.5 font-mono text-[12.5px] text-muted transition-colors hover:border-line-strong hover:text-fg"
                      >
                        #{t}
                      </Link>
                    ))}
                  </div>
                )}

                {author.author && <AuthorCard author={author.author} eyebrow="Written by" wide />}
                {history.contributors.length > 1 && (
                  <p className="text-[13.5px] text-muted">
                    <span className="font-semibold text-fg">Contributors to this article: </span>
                    {history.contributors.map((c, i) => (
                      <span key={c.name}>
                        {i > 0 && ", "}
                        <PersonName person={c} />
                      </span>
                    ))}
                  </p>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  {at?.next && (
                    <NextCard
                      eyebrow={`Next in Week ${at.week.n}`}
                      title={at.next.title}
                      href={nextDayPost ? `/posts/${nextDayPost.slug}/` : "/#this-week"}
                      soon={!nextDayPost}
                    />
                  )}
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

                <div className="flex flex-col gap-3 text-[13px] text-subtle sm:flex-row sm:items-center sm:justify-between">
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

            {/* The whole column steps aside for wide figures: its empty sticky area must not catch their clicks. */}
            <aside className="hidden xl:block" data-pagefind-ignore data-toc-panel>
              <div className="sticky top-28 pt-20 pb-6">
                <div className="glass max-h-[calc(100dvh-9rem)] overflow-y-auto rounded-2xl p-5">
                  <Toc items={toc} />
                </div>
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
    <Link href={href} className="group flex flex-col rounded-2xl border border-line p-5 transition-colors hover:border-line-strong hover:bg-card">
      <span className="flex items-center justify-between gap-3 font-mono text-[11.5px] text-subtle">
        {eyebrow}
        {soon && <span className="text-accent">coming soon</span>}
      </span>
      <span className="mt-2 text-[17px] leading-snug font-semibold tracking-tight">{title}</span>
      {sub && <span className="mt-1 text-[13.5px] text-muted">{sub}</span>}
      <ArrowRight className="mt-3 size-4 text-subtle transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent" />
    </Link>
  );
}
