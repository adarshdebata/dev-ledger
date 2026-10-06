import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { postForRoadmapItem } from "@/lib/posts";
import type { Chain } from "@/lib/site";

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
                <ul className="mt-3 space-y-1.5" aria-label="Coming later">
                  {upcoming.map((u) => (
                    <li key={u.n} className="flex gap-2.5 text-sm text-subtle">
                      <span aria-hidden="true" className="mt-[7px] size-1.5 shrink-0 rounded-full border border-line-strong" />
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
