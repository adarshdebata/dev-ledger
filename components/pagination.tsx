import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** `base` is the page-1 URL, e.g. "/tags/cors/"; later pages live at `${base}page/<n>/`. */
export function Pagination({ base, page, pages }: { base: string; page: number; pages: number }) {
  if (pages <= 1) return null;
  const href = (n: number) => (n === 1 ? base : `${base}page/${n}/`);
  const cls = "grid h-10 min-w-10 place-items-center rounded-lg border px-3 text-sm font-medium transition-colors";
  return (
    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
      {page > 1 ? (
        <Link href={href(page - 1)} className={`${cls} border-line hover:border-line-strong`} aria-label="Previous page">
          <ChevronLeft className="size-4" />
        </Link>
      ) : null}
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={href(n)}
          aria-current={n === page ? "page" : undefined}
          className={`${cls} ${n === page ? "border-fg bg-fg text-bg" : "border-line text-muted hover:border-line-strong"}`}
        >
          {n}
        </Link>
      ))}
      {page < pages ? (
        <Link href={href(page + 1)} className={`${cls} border-line hover:border-line-strong`} aria-label="Next page">
          <ChevronRight className="size-4" />
        </Link>
      ) : null}
    </nav>
  );
}
