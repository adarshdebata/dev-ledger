"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, Rss, X } from "lucide-react";
import { Wordmark } from "./logo";
import { Search } from "./search";
import { ThemeToggle } from "./theme-toggle";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nav = [
  { href: "/#series", label: "Series" },
  { href: "/chains/request/", label: "Follow a request" },
  { href: "/tags/", label: "Tags" },
  { href: "/about/", label: "About" },
];

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.33-1.29-1.69-1.29-1.69-1.050-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

const iconBtn = "grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-bg-soft hover:text-fg";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => !href.startsWith("/#") && pathname.startsWith(href.replace(/\/$/, ""));

  return (
    <header data-pagefind-ignore className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
      <div className={`glass mx-auto max-w-[73.5rem] rounded-2xl transition-shadow duration-300 ${scrolled ? "shadow-lift" : ""}`}>
        <div className="flex h-14 items-center gap-3 px-3 sm:px-4">
          <Link href="/" className="rounded-lg" aria-label="Dev Ledger home">
            <Wordmark />
          </Link>

          <nav className="ml-6 hidden items-center gap-0.5 lg:flex" aria-label="Main">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:text-fg ${
                  isActive(n.href) ? "text-fg" : "text-muted"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1">
            <Search />
            <a href={`${base}/rss.xml`} className={`${iconBtn} hidden sm:grid`} aria-label="RSS feed">
              <Rss className="size-[17px]" />
            </a>
            <a href="https://github.com/adarshdebata/dev-ledger" className={`${iconBtn} hidden sm:grid`} aria-label="Source on GitHub">
              <GitHubIcon className="size-[17px]" />
            </a>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className={`${iconBtn} lg:hidden`}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.nav
              key="mobile-nav"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden lg:hidden"
              aria-label="Mobile"
            >
              <div className="flex flex-col border-t border-line px-3 py-2">
                {nav.map((n) => (
                  <Link key={n.href} href={n.href} className="rounded-lg px-2 py-3 text-[15px] font-medium text-muted hover:text-fg">
                    {n.label}
                  </Link>
                ))}
                <div className="mt-1 flex gap-4 border-t border-line px-2 pt-3 pb-2 text-sm text-muted">
                  <a href={`${base}/rss.xml`} className="flex items-center gap-1.5 hover:text-fg">
                    <Rss className="size-4" /> RSS
                  </a>
                  <a href="https://github.com/adarshdebata/dev-ledger" className="flex items-center gap-1.5 hover:text-fg">
                    <GitHubIcon className="size-4" /> GitHub
                  </a>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
