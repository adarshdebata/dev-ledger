import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { AuthorCard, Avatar, PersonName } from "@/components/author";
import { mdxComponents } from "@/components/mdx";
import { PageHeader } from "@/components/page-header";
import { PostThumb, thumbFor } from "@/components/post-thumb";
import { getAuthor } from "@/lib/authors";
import { allCaseStudies, getCaseStudy, localCaseStudies, type CaseStudy } from "@/lib/case-studies";
import { historyOf } from "@/lib/git-meta";
import { renderMdx } from "@/lib/mdx";
import { formatDate } from "@/lib/posts";
import { alternates, site } from "@/lib/site";

type Props = { params: Promise<{ slug?: string[] }> };

export const dynamicParams = false;

/** The index always exists, so the export never sees an empty list even before the first write-up. */
export function generateStaticParams() {
  return [{ slug: [] as string[] }, ...localCaseStudies().map((c) => ({ slug: [c.slug] }))];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!slug?.length) {
    return {
      title: "Case studies",
      description: "Real problems from real projects: what broke, how it was found, and what fixed it.",
      alternates: alternates("/case-studies/"),
    };
  }
  const cs = getCaseStudy(slug[0]);
  return cs ? { title: cs.title, description: cs.summary, alternates: alternates(`/case-studies/${cs.slug}/`) } : {};
}

export default async function CaseStudiesPage({ params }: Props) {
  const { slug } = await params;
  if (!slug?.length) return <Index />;
  const cs = slug.length === 1 ? getCaseStudy(slug[0]) : undefined;
  if (!cs) notFound();
  return <Detail cs={cs} />;
}

function Index() {
  const list = allCaseStudies();
  return (
    <>
      <PageHeader eyebrow="Case studies" title="Real problems, and how they were solved">
        Write-ups of things that actually went wrong in real projects: how the problem showed up, how it was tracked down,
        and what fixed it. Every one is a true story.
      </PageHeader>
      <div className="container-page py-12">
        <ul className="grid max-w-4xl grid-cols-1 gap-5">
          {list.map((cs) => (
            <li key={cs.slug}>
              <CaseCard cs={cs} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function CaseCard({ cs }: { cs: CaseStudy }) {
  const author = getAuthor(cs.author);
  const external = Boolean(cs.url);
  const body = (
    <>
      <PostThumb motif={cs.thumb ?? thumbFor({ tags: cs.tags })} className="hidden sm:block" />
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl leading-snug font-semibold tracking-tight">{cs.title}</h2>
          <ArrowUpRight className="mt-1 size-5 shrink-0 text-subtle transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
        </div>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{cs.summary}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] text-subtle">
          {author && (
            <span className="flex items-center gap-2 font-sans text-[13px] text-muted">
              <Avatar person={{ name: author.name, author }} size={20} />
              {author.name}
            </span>
          )}
          {cs.date && <time dateTime={cs.date}>{formatDate(cs.date)}</time>}
          {external && <span>Published separately · {new URL(cs.url!).host}</span>}
        </div>
      </div>
    </>
  );
  const cls =
    "group grid grid-cols-1 gap-5 rounded-2xl border border-line p-5 transition-colors hover:border-line-strong hover:bg-card sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-start";
  return external ? (
    <a href={cs.url} target="_blank" rel="noopener noreferrer" className={cls}>
      {body}
    </a>
  ) : (
    <Link href={`/case-studies/${cs.slug}/`} className={cls}>
      {body}
    </Link>
  );
}

async function Detail({ cs }: { cs: CaseStudy }) {
  const { Content } = await renderMdx(cs.source ?? "");
  const history = historyOf(`content/case-studies/${cs.slug}/index.mdx`, cs.author);
  const author = history.author;
  const updated = history.updated && (history.revisions ?? 1) > 1 && cs.date && history.updated.date > cs.date ? history.updated : undefined;
  return (
    <article className="container-page">
      <div className="mx-auto max-w-[45rem]">
        <header className="pt-14 pb-10 sm:pt-20" data-pagefind-body>
          <Link href="/case-studies/" className="eyebrow animate-fade-up inline-flex items-center gap-1.5 text-accent hover:underline" data-pagefind-ignore>
            <ArrowLeft className="size-3.5" /> Case studies
          </Link>
          <h1 data-pagefind-meta="title" className="animate-fade-up mt-5 text-[2.35rem] leading-[1.06] font-semibold tracking-[-0.04em] text-balance sm:text-[3.2rem]">
            {cs.title}
          </h1>
          <p className="animate-fade-up mt-5 text-lg leading-relaxed text-muted sm:text-xl">{cs.summary}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-line py-3 font-mono text-[12.5px] text-subtle" data-pagefind-ignore>
            {author && (
              <span className="flex items-center gap-2 text-fg">
                <Avatar person={author} size={22} />
                <PersonName person={author} />
              </span>
            )}
            {cs.date && <time dateTime={cs.date}>{formatDate(cs.date)}</time>}
            {cs.readingMinutes && <span>{cs.readingMinutes} min read</span>}
          </div>
          {updated && (
            <p className="mt-2.5 font-mono text-[11.5px] text-subtle" data-pagefind-ignore>
              Updated {formatDate(updated.date)} by <PersonName person={updated.by} />
            </p>
          )}
        </header>
        <div className="prose-ledger prose" data-pagefind-body>
          <Content components={mdxComponents(cs.slug, "case-studies")} />
        </div>
        <footer className="mt-16 space-y-6 border-t border-line pt-10" data-pagefind-ignore>
          {author?.author && <AuthorCard author={author.author} eyebrow="Written by" wide />}
          <a href={`${site.repo}/edit/main/content/case-studies/${cs.slug}/index.mdx`} className="text-[13px] font-medium text-fg hover:text-accent">
            Suggest an edit
          </a>
        </footer>
      </div>
    </article>
  );
}
