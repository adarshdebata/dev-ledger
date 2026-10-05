import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { postForRoadmapItem } from "@/lib/posts";
import type { Chain } from "@/lib/site";

const stageHasPost = (roadmap: number[]) => roadmap.some((n) => postForRoadmapItem(n));

/**
 * The chain as a row of stages with a highlight that travels along it,
 * like a packet moving hop by hop. Pure CSS, so it costs nothing to run
 * and stops for readers who prefer reduced motion.
 */
export function ChainStrip({ chain, animated = true }: { chain: Chain; animated?: boolean }) {
  const step = 0.5;
  const duration = chain.stages.length * step;
  return (
    <ol className="flex flex-wrap items-center gap-x-1 gap-y-2" aria-label={`${chain.title} stages`}>
      {chain.stages.map((s, i) => {
        const live = stageHasPost(s.roadmap);
        const style = animated
          ? { animationDelay: `${i * step - duration}s`, animationDuration: `${duration}s` }
          : undefined;
        return (
          <li key={s.name} className="flex items-center gap-1">
            <span
              className={`relative isolate inline-flex items-center gap-1.5 overflow-hidden rounded-full border px-3 py-1 text-[13px] font-medium ${
                live ? "border-accent-soft/60 text-fg" : "border-line text-muted"
              }`}
            >
              {animated && (
                <span
                  aria-hidden="true"
                  className="animate-flow-bg absolute inset-0 -z-10 bg-teal-tint opacity-0 motion-reduce:hidden"
                  style={style}
                />
              )}
              {live && <span className="size-1.5 rounded-full bg-accent-soft" aria-label="published" />}
              {s.name}
            </span>
            {i < chain.stages.length - 1 && (
              <ChevronRight
                aria-hidden="true"
                className={`size-3.5 text-subtle ${animated ? "animate-flow motion-reduce:animate-none" : ""}`}
                style={style}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Vertical timeline of a chain, with every stage's articles (published or upcoming). */
export function ChainTimeline({ chain, titles }: { chain: Chain; titles: Map<number, string> }) {
  return (
    <ol className="relative">
      {chain.stages.map((s, i) => {
        const items = s.roadmap.map((n) => ({ n, title: titles.get(n) ?? "", post: postForRoadmapItem(n) }));
        const posts = [...new Map(items.filter((x) => x.post).map((x) => [x.post!.slug, x.post!])).values()];
        const upcoming = items.filter((x) => !x.post);
        const live = posts.length > 0;
        return (
          <li key={s.name} className="relative grid grid-cols-[2.5rem_1fr] gap-4 pb-10 last:pb-0">
            {i < chain.stages.length - 1 && (
              <span
                aria-hidden="true"
                className={`absolute top-10 bottom-0 left-[1.2rem] w-px ${live ? "bg-accent-soft/60" : "bg-line"}`}
              />
            )}
            <span
              className={`relative z-10 grid size-10 place-items-center rounded-full border font-mono text-sm font-semibold ${
                live ? "border-fg bg-fg text-bg" : "border-line bg-bg text-subtle"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="pt-1.5">
              <h2 className="text-lg font-semibold tracking-tight">{s.name}</h2>
              <p className="mt-1 text-[15px] text-muted">{s.note}</p>
              {posts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/posts/${p.slug}/`}
                  className="group mt-3 flex items-center justify-between gap-3 rounded-xl border border-line bg-card px-4 py-3 transition-colors hover:border-accent-soft/70"
                >
                  <span className="font-semibold">{p.title}</span>
                  <ChevronRight className="size-4 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
              {upcoming.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {upcoming.map((u) => (
                    <li key={u.n} className="flex gap-2.5 text-sm text-subtle">
                      <span className="font-mono text-xs leading-5">#{u.n}</span>
                      <span>{u.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
