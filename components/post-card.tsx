import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { formatDate, type PostMeta } from "@/lib/posts";
import { getChain, getSeries, weekPlace, withBase } from "@/lib/site";

/** The chain stage a post belongs to, if any. */
export function postStage(post: PostMeta) {
  const chain = post.chain ? getChain(post.chain) : undefined;
  const stage = chain?.stages.find((s) => s.roadmap.some((n) => post.roadmap.includes(n)));
  return chain && stage ? { chain, stage } : undefined;
}

/** A small mono index line: "Week 1 / Day 5" for posts in the weekly plan, "Series 2" otherwise. */
export function IssueTag({ post }: { post: PostMeta }) {
  const at = weekPlace(post.slug);
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium tracking-wide text-subtle">
      {at ? (
        <>
          <span className="text-accent">Week {at.week.n}</span>
          <span aria-hidden="true">/</span>
          <span>Day {at.day.day}</span>
        </>
      ) : (
        <span className="text-accent">Series {post.series}</span>
      )}
    </span>
  );
}

/** Optional cover image; posts without one simply don't show a cover. */
export function PostCover({ post }: { post: PostMeta }) {
  if (!post.cover) return null;
  return (
    <img
      src={withBase(`/posts/${post.slug}/${post.cover.replace(/^\.\//, "")}`)}
      alt=""
      loading="lazy"
      className="aspect-[16/9] w-full rounded-xl border border-line object-cover"
    />
  );
}

export function PostMetaLine({ post }: { post: PostMeta }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[12px] text-subtle">
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <span aria-hidden="true">·</span>
      <span>{post.readingMinutes} min read</span>
    </div>
  );
}

/** One article as an editorial list row: index line, title, subtitle and meta. */
export function PostCard({ post }: { post: PostMeta }) {
  const s = getSeries(post.series);
  const where = postStage(post);
  return (
    <article className="group relative grid gap-3 border-t border-line py-7 sm:grid-cols-[11rem_1fr] sm:gap-8">
      <div className="space-y-1.5">
        <IssueTag post={post} />
        <PostMetaLine post={post} />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-muted">
          {s?.title}
          {where && <span className="text-teal"> · {where.chain.title}</span>}
        </p>
        <h3 className="mt-1.5 text-[1.4rem] leading-snug font-semibold tracking-tight text-balance">
          <Link href={`/posts/${post.slug}/`} className="after:absolute after:inset-0">
            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1.5px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 group-hover:bg-[length:100%_1.5px]">
              {post.title}
            </span>
          </Link>
        </h3>
        <p className="mt-2 max-w-2xl text-[15.5px] leading-relaxed text-muted">{post.subtitle}</p>
      </div>
      <ArrowUpRight className="absolute top-7 right-0 hidden size-5 text-subtle transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent sm:block" />
    </article>
  );
}
