import Link from "next/link";
import { LogoMark } from "./logo";
import { series, site, withBase } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer data-pagefind-ignore className="mt-24 border-t border-line bg-bg-soft/60">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <LogoMark className="size-7" />
            <span className="font-bold tracking-tight">Dev Ledger</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">{site.description}</p>
          <p className="mt-4 text-sm text-muted">
            Written by{" "}
            <a href={site.author.github} className="font-medium text-fg underline decoration-line-strong underline-offset-4 hover:decoration-accent">
              {site.author.name}
            </a>
          </p>
        </div>
        <div>
          <h2 className="text-xs font-semibold tracking-wider text-subtle uppercase">Series</h2>
          <ul className="mt-3 space-y-2 text-sm">
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
          <h2 className="text-xs font-semibold tracking-wider text-subtle uppercase">More</h2>
          <ul className="mt-3 space-y-2 text-sm">
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
          Articles are licensed{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/" className="underline underline-offset-2 hover:text-muted">CC BY 4.0</a>
          , code samples and site source{" "}
          <a href={`${site.repo}/blob/main/LICENSE`} className="underline underline-offset-2 hover:text-muted">MIT</a>.
          Found a mistake?{" "}
          <a href={`${site.repo}/blob/main/CONTRIBUTING.md`} className="underline underline-offset-2 hover:text-muted">Open a pull request</a>.
        </p>
      </div>
    </footer>
  );
}
