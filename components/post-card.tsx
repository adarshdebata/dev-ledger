import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { formatDate, type PostMeta } from "@/lib/posts";
import { getChain, getSeries, withBase } from "@/lib/site";

/** "#9–11", "#38" or "#4, #7" for a post's roadmap items. */
export function roadmapLabel(items: number[]) {
  const s = [...items].sort((a, b) => a - b);
  if (s.length === 0) return "";
  const contiguous = s.every((n, i) => i === 0 || n === s[i - 1] + 1);
  if (contiguous && s.length > 1) return `#${s[0]}–${s[s.length - 1]}`;
  return s.map((n) => `#${n}`).join(", ");
}

/** Typographic cover: series number, roadmap items and a soft gradient field. */
export function PostCover({ post, large = false }: { post: PostMeta; large?: boolean }) {
  const chain = post.chain ? getChain(post.chain) : undefined;
  const stage = chain?.stages.find((s) => s.roadmap.some((n) => post.roadmap.includes(n)));
  if (post.cover) {
    return (
      <img
        src={withBase(`/posts/${post.slug}/${post.cover.replace(/^\.\//, "")}`)}
        alt=""
        loading="lazy"
        className="h-full min-h-44 w-full rounded-xl object-cover"
      />
    );
  }
  return (
    <div className="relative isolate h-full min-h-44 overflow-hidden rounded-xl bg-[#100f1d]">
      <div className="bg-brand absolute inset-0 opacity-90" />
      <div className="absolute -top-1/3 -right-1/4 size-[120%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.28),transparent_60%)]" />
      <div
        className="absolute inset-0 opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.35) 1px, transparent 1px)",
          backgroundSize: large ? "36px 36px" : "28px 28px",
        }}
      />
      <div className="relative flex h-full flex-col justify-between p-5 text-white">
        <span className="font-mono text-[11px] tracking-widest text-white/75 uppercase">Series {post.series}</span>
        <div>
          <div className={`font-mono font-semibold tracking-tight ${large ? "text-5xl sm:text-6xl" : "text-4xl"}`}>
            {roadmapLabel(post.roadmap)}
          </div>
          {stage && chain && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
              <span className="size-1.5 rounded-full bg-white" />
              {chain.title} · {stage.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PostMetaLine({ post }: { post: PostMeta }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-subtle">
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <span aria-hidden="true">·</span>
      <span className="inline-flex items-center gap-1">
        <Clock className="size-3.5" /> {post.readingMinutes} min read
      </span>
    </div>
  );
}

export function PostCard({ post }: { post: PostMeta }) {
  const s = getSeries(post.series);
  return (
    <article className="group relative flex flex-col gap-4 rounded-2xl border border-line bg-card p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift sm:flex-row sm:p-6">
      <div className="sm:w-48 sm:shrink-0">
        <PostCover post={post} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="text-xs font-semibold tracking-wide text-accent">{s?.title}</div>
        <h3 className="mt-2 text-xl leading-snug font-bold tracking-tight text-balance">
          <Link href={`/posts/${post.slug}/`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-muted">{post.subtitle}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <PostMetaLine post={post} />
          <ArrowUpRight className="size-5 text-subtle transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
        </div>
      </div>
    </article>
  );
}
