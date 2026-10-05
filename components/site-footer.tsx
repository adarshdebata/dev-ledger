import Link from "next/link";
import { Wordmark } from "./logo";
import { series, site, withBase } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer data-pagefind-ignore className="mt-28 border-t border-line">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex rounded-lg" aria-label="Dev Ledger home">
            <Wordmark />
          </Link>
          <p className="mt-3 font-mono text-[12px] tracking-wide text-subtle">under the hood · engineering · systems</p>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
            Clear, visual explanations of the systems developers use every day, from the browser to the bank.
          </p>
          <p className="mt-4 text-sm text-muted">
            Written by{" "}
            <a href={site.author.github} className="font-medium text-fg underline decoration-line-strong underline-offset-4 hover:decoration-accent">
              {site.author.name}
            </a>
          </p>
        </div>
        <div>
          <h2 className="eyebrow text-subtle">Series</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {series.map((s) => (
              <li key={s.n}>
                <Link href={`/series/${s.n}/`} className="text-muted transition-colors hover:text-fg">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="eyebrow text-subtle">More</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/chains/request/" className="text-muted hover:text-fg">Follow One Request</Link></li>
            <li><Link href="/chains/payment/" className="text-muted hover:text-fg">Follow One Payment</Link></li>
            <li><Link href="/tags/" className="text-muted hover:text-fg">All tags</Link></li>
            <li><Link href="/about/" className="text-muted hover:text-fg">About</Link></li>
            <li><a href={withBase("/rss.xml")} className="text-muted hover:text-fg">RSS feed</a></li>
            <li><a href={site.repo} className="text-muted hover:text-fg">Source on GitHub</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <p className="container-page py-5 text-xs leading-relaxed text-subtle">
          Articles{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/" className="underline underline-offset-2 hover:text-muted">CC BY 4.0</a>
          , code{" "}
          <a href={`${site.repo}/blob/main/LICENSE`} className="underline underline-offset-2 hover:text-muted">MIT</a>.
          Found a mistake?{" "}
          <a href={`${site.repo}/blob/main/CONTRIBUTING.md`} className="underline underline-offset-2 hover:text-muted">Send a fix</a>.
        </p>
      </div>
    </footer>
  );
}
