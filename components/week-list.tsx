import Link from "next/link";
import { Check } from "lucide-react";
import { getPost } from "@/lib/posts";
import type { Week } from "@/lib/site";

/** A week's posts in reading order. Published ones link; the rest show what's coming. No day numbers. */
export function WeekList({ week, className = "" }: { week: Week; className?: string }) {
  const items = week.days.map((d) => ({ ...d, post: d.slug ? getPost(d.slug) : undefined }));
  const published = items.filter((d) => d.post).length;
  return (
    <div className={className}>
      <ol className="border-t border-line">
        {items.map((d) => (
          <li key={d.day} className="border-b border-line">
            {d.post ? (
              <Link href={`/posts/${d.post.slug}/`} className="group grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-3 py-3.5">
                <Check className="size-4 text-ok" aria-hidden="true" />
                <span className="text-[15.5px] leading-snug font-medium transition-colors group-hover:text-accent">
                  <span className="sr-only">Published: </span>
                  {d.title}
                </span>
                <span className="font-mono text-[11px] text-ok">read</span>
              </Link>
            ) : (
              <div className="grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-3 py-3.5">
                <span aria-hidden="true" className="size-2 justify-self-center rounded-full border border-line-strong" />
                <span className="text-[15.5px] leading-snug text-muted">
                  <span className="sr-only">Coming soon: </span>
                  {d.title}
                </span>
                <span className="font-mono text-[11px] text-subtle">soon</span>
              </div>
            )}
          </li>
        ))}
      </ol>
      <p className="mt-4 font-mono text-[12px] text-subtle">
        {published} of {items.length} published
      </p>
    </div>
  );
}
