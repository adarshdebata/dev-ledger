"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";
import { PostThumb, type Motif } from "./post-thumb";

/** One row of the list: a post or a case study, with everything the filters and sorts need. */
export type BlogEntry = {
  href: string;
  title: string;
  subtitle: string;
  /** Extra text that search looks through but the row doesn't show. */
  summary: string;
  date: string;
  dateLabel: string;
  minutes: number;
  tags: string[];
  /** "Week 2: Things We Install Without Understanding", "Case study", … */
  place: string;
  /** Which collection filter it belongs to, e.g. "week-2" or "case-studies". */
  group: string;
  /** Position in the reading plan: week × 100 + day; case studies come after every week. */
  order: number;
  motif: Motif;
};

export type BlogGroup = { id: string; label: string };

const SORTS = [
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
  { id: "reading", label: "Reading order" },
  { id: "az", label: "Title, A to Z" },
  { id: "za", label: "Title, Z to A" },
  { id: "short", label: "Shortest read" },
  { id: "long", label: "Longest read" },
] as const;
type SortId = (typeof SORTS)[number]["id"];

const byTitle = (a: BlogEntry, b: BlogEntry) => a.title.localeCompare(b.title, "en", { numeric: true, sensitivity: "base" });
const COMPARE: Record<SortId, (a: BlogEntry, b: BlogEntry) => number> = {
  newest: (a, b) => b.date.localeCompare(a.date) || b.order - a.order,
  oldest: (a, b) => a.date.localeCompare(b.date) || a.order - b.order,
  reading: (a, b) => a.order - b.order || a.date.localeCompare(b.date),
  az: byTitle,
  za: (a, b) => byTitle(b, a),
  short: (a, b) => a.minutes - b.minutes || byTitle(a, b),
  long: (a, b) => b.minutes - a.minutes || byTitle(a, b),
};

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Wraps every search term found in `text` in a <mark>. */
function highlight(text: string, terms: string[]) {
  if (terms.length === 0) return text;
  const re = new RegExp(`(${terms.map(escapeRe).join("|")})`, "gi");
  return text.split(re).map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded-sm bg-accent-tint px-0.5 text-fg">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

/** Every blog in one list: search as you type, sort by date, title or length, filter by collection or topic. */
export function BlogIndex({ entries, groups }: { entries: BlogEntry[]; groups: BlogGroup[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortId>("newest");
  const [group, setGroup] = useState("all");
  const [tag, setTag] = useState("");
  const [ready, setReady] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  // Start from the URL (?q=, ?sort=, ?in=, ?tag=), so a filtered list can be shared or bookmarked.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const s = p.get("sort");
    if (p.get("q")) setQuery(p.get("q")!);
    if (s && SORTS.some((x) => x.id === s)) setSort(s as SortId);
    if (p.get("in") && groups.some((g) => g.id === p.get("in"))) setGroup(p.get("in")!);
    if (p.get("tag")) setTag(p.get("tag")!);
    setReady(true);
  }, [groups]);

  // Keep the URL in step with the controls, without adding history entries. Waits until the URL has been read.
  useEffect(() => {
    if (!ready) return;
    const p = new URLSearchParams();
    if (query.trim()) p.set("q", query.trim());
    if (sort !== "newest") p.set("sort", sort);
    if (group !== "all") p.set("in", group);
    if (tag) p.set("tag", tag);
    const qs = p.toString();
    window.history.replaceState(window.history.state, "", qs ? `?${qs}` : window.location.pathname);
  }, [ready, query, sort, group, tag]);

  // "/" jumps to the search box, as on many documentation sites.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      e.preventDefault();
      input.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const terms = useMemo(() => norm(query).split(/\s+/).filter(Boolean), [query]);
  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of entries) for (const t of e.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [entries]);
  const groupCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of entries) counts.set(e.group, (counts.get(e.group) ?? 0) + 1);
    return counts;
  }, [entries]);

  const shown = useMemo(() => {
    const matches = entries.filter((e) => {
      if (group !== "all" && e.group !== group) return false;
      if (tag && !e.tags.includes(tag)) return false;
      if (terms.length === 0) return true;
      const hay = norm([e.title, e.subtitle, e.summary, e.place, ...e.tags].join(" "));
      return terms.every((t) => hay.includes(t));
    });
    return matches.sort(COMPARE[sort]);
  }, [entries, group, tag, terms, sort]);

  const filtered = terms.length > 0 || group !== "all" || tag !== "";
  const reset = () => {
    setQuery("");
    setGroup("all");
    setTag("");
  };

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-line pb-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <label htmlFor="blog-search" className="sr-only">
              Search the blogs
            </label>
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-subtle" />
            <input
              ref={input}
              id="blog-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setQuery("");
              }}
              placeholder="Search by title, topic or tag"
              autoComplete="off"
              spellCheck={false}
              className="h-11 w-full rounded-xl border border-line bg-card pr-20 pl-10 text-[15px] text-fg placeholder:text-subtle focus:border-accent-soft focus:ring-2 focus:ring-accent-tint focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  input.current?.focus();
                }}
                aria-label="Clear the search"
                className="absolute top-1/2 right-2.5 grid size-7 -translate-y-1/2 place-items-center rounded-md text-subtle hover:bg-bg-soft hover:text-fg"
              >
                <X className="size-4" />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-md border border-line px-1.5 font-mono text-[11px] text-subtle sm:block">
                /
              </kbd>
            )}
          </div>
          <div className="flex gap-3">
            <label className="flex min-w-0 flex-1 items-center gap-2 text-[13px] text-muted lg:flex-none">
              <span className="shrink-0 font-medium">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortId)}
                className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-card px-3 text-[14px] text-fg focus:border-accent-soft focus:ring-2 focus:ring-accent-tint focus:outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-0 flex-1 items-center gap-2 text-[13px] text-muted lg:flex-none">
              <span className="shrink-0 font-medium">Topic</span>
              <select
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-card px-3 text-[14px] text-fg focus:border-accent-soft focus:ring-2 focus:ring-accent-tint focus:outline-none lg:w-44"
              >
                <option value="">Any topic</option>
                {tags.map(([t, n]) => (
                  <option key={t} value={t}>
                    #{t} ({n})
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Show">
            {[{ id: "all", label: "All" }, ...groups].map((g) => {
              const n = g.id === "all" ? entries.length : (groupCounts.get(g.id) ?? 0);
              const on = group === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setGroup(g.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                    on ? "border-fg bg-fg text-bg" : "border-line text-muted hover:border-line-strong hover:text-fg"
                  }`}
                >
                  {g.label} <span className={`font-mono text-[11.5px] ${on ? "opacity-70" : "text-subtle"}`}>{n}</span>
                </button>
              );
            })}
          </div>
          <p className="ml-auto font-mono text-[12.5px] text-subtle" aria-live="polite">
            {filtered ? `${shown.length} of ${entries.length} blogs` : `${entries.length} blogs`}
            {filtered && (
              <button type="button" onClick={reset} className="ml-3 font-sans text-[13px] font-semibold text-accent hover:underline">
                Clear filters
              </button>
            )}
          </p>
        </div>
      </div>

      {shown.length > 0 ? (
        <ol>
          {shown.map((e, i) => {
            const external = /^https?:/.test(e.href);
            return (
              <li
                key={e.href}
                className="group relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 border-b border-line py-6 sm:grid-cols-[2.5rem_9rem_minmax(0,1fr)_1.25rem] sm:gap-x-6"
              >
                <span className="pt-1 font-mono text-[13px] text-subtle tabular-nums transition-colors group-hover:text-accent">{String(i + 1).padStart(2, "0")}</span>
                <PostThumb motif={e.motif} lift={false} className="hidden self-start sm:block" />
                <div className="min-w-0">
                  <p className="truncate font-mono text-[11.5px] font-medium text-accent">{e.place}</p>
                  <h2 className="mt-1.5 text-[1.15rem] leading-snug font-semibold tracking-tight text-balance sm:text-[1.25rem]">
                    {external ? (
                      <a href={e.href} target="_blank" rel="noopener noreferrer" className="after:absolute after:inset-0">
                        {highlight(e.title, terms)}
                      </a>
                    ) : (
                      <Link href={e.href} className="after:absolute after:inset-0">
                        {highlight(e.title, terms)}
                      </Link>
                    )}
                  </h2>
                  <p className="mt-1.5 line-clamp-2 max-w-3xl text-[14.5px] leading-relaxed text-muted">{highlight(e.subtitle, terms)}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[12px] text-subtle">
                    <time dateTime={e.date}>{e.dateLabel}</time>
                    <span aria-hidden="true">·</span>
                    <span>{e.minutes} min read</span>
                    {e.tags.length > 0 && <span aria-hidden="true">·</span>}
                    {e.tags.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTag(tag === t ? "" : t)}
                        aria-pressed={tag === t}
                        className={`relative z-10 rounded-md border px-1.5 py-px transition-colors ${
                          tag === t ? "border-accent-soft bg-accent-tint text-fg" : "border-line hover:border-line-strong hover:text-fg"
                        }`}
                      >
                        #{highlight(t, terms)}
                      </button>
                    ))}
                  </div>
                </div>
                <ArrowUpRight
                  aria-hidden="true"
                  className="hidden size-5 text-subtle transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent sm:block"
                />
              </li>
            );
          })}
        </ol>
      ) : (
        <div className="py-16 text-center">
          <p className="text-lg font-semibold">No blogs match {query.trim() ? `“${query.trim()}”` : "these filters"}.</p>
          <p className="mt-2 text-[15px] text-muted">
            Try a shorter word, or another topic. The site search in the header (Ctrl K) also looks inside every article.
          </p>
          <button type="button" onClick={reset} className="mt-5 rounded-full border border-line-strong px-5 py-2 text-sm font-semibold hover:border-fg">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
