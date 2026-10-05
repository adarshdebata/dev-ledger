"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CornerDownLeft, FileText, Hash, Search as SearchIcon } from "lucide-react";

type Sub = { title: string; url: string; excerpt: string };
type ResultData = { url: string; excerpt: string; meta: { title?: string }; sub_results?: Sub[] };
type Pagefind = {
  options: (o: Record<string, unknown>) => Promise<void>;
  search: (q: string) => Promise<{ results: { id: string; data: () => Promise<ResultData> }[] } | null>;
};
type Hit = { key: string; title: string; url: string; excerpt: string; sub: boolean };

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
let pagefind: Promise<Pagefind | null> | null = null;

function loadPagefind() {
  pagefind ??= (async () => {
    try {
      const url = `${base}/pagefind/pagefind.js`;
      const pf: Pagefind = await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url);
      await pf.options({ baseUrl: `${base}/` });
      return pf;
    } catch {
      return null;
    }
  })();
  return pagefind;
}

export function Search() {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "unavailable">("idle");
  const [shortcut, setShortcut] = useState("Ctrl K");

  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.userAgent)) setShortcut("⌘K");
  }, []);

  const open = useCallback(() => {
    dialog.current?.showModal();
    requestAnimationFrame(() => input.current?.select());
    loadPagefind().then((pf) => setState(pf ? "ready" : "unavailable"));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest("input, textarea, select, [contenteditable]");
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    const q = query.trim();
    if (!q) {
      setHits([]);
      return;
    }
    const t = setTimeout(async () => {
      const pf = await loadPagefind();
      if (!pf || cancelled) return;
      const res = await pf.search(q);
      if (!res || cancelled) return;
      const data = await Promise.all(res.results.slice(0, 6).map((r) => r.data()));
      if (cancelled) return;
      const next: Hit[] = [];
      for (const d of data) {
        next.push({ key: d.url, title: d.meta.title ?? d.url, url: d.url, excerpt: d.excerpt, sub: false });
        for (const s of (d.sub_results ?? []).filter((s) => s.url !== d.url).slice(0, 3)) {
          next.push({ key: s.url, title: s.title, url: s.url, excerpt: s.excerpt, sub: true });
        }
      }
      setHits(next);
      setActive(0);
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query]);

  const go = (hit?: Hit) => {
    if (!hit) return;
    dialog.current?.close();
    window.location.href = hit.url;
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(hits[active]);
    }
  };

  useEffect(() => {
    document.getElementById(`hit-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="group flex h-9 items-center gap-2 rounded-lg border border-line bg-card/60 px-2.5 text-sm text-subtle transition-colors hover:border-line-strong hover:text-muted sm:w-52"
        aria-label="Search articles"
      >
        <SearchIcon className="size-4" />
        <span className="hidden sm:inline">Search…</span>
        <kbd className="ml-auto hidden rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-subtle sm:inline">{shortcut}</kbd>
      </button>

      <dialog
        ref={dialog}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="animate-fade-up m-0 mx-auto mt-[12vh] w-[calc(100%-2rem)] max-w-xl overflow-hidden rounded-2xl border border-line bg-card p-0 text-fg shadow-lift [animation-duration:0.25s]"
        aria-label="Search"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <SearchIcon className="size-4 shrink-0 text-subtle" />
          <input
            ref={input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Search articles, headings, ideas…"
            className="h-14 w-full bg-transparent text-[15px] outline-none placeholder:text-subtle"
            aria-label="Search query"
          />
          <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-subtle">Esc</kbd>
        </div>

        <div className="scroll-thin max-h-[55vh] overflow-y-auto p-2">
          {state === "unavailable" && (
            <p className="px-3 py-8 text-center text-sm text-muted">
              The search index is generated by <code className="font-mono text-accent">pnpm build</code>, so it isn&apos;t
              available in development.
            </p>
          )}
          {state !== "unavailable" && query.trim() === "" && (
            <p className="px-3 py-8 text-center text-sm text-subtle">Try “preflight”, “credentials” or “OPTIONS”.</p>
          )}
          {state === "ready" && query.trim() !== "" && hits.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-subtle">No matches for “{query}”.</p>
          )}
          <ul role="listbox" aria-label="Results">
            {hits.map((h, i) => (
              <li key={h.key} id={`hit-${i}`} role="option" aria-selected={i === active}>
                <a
                  href={h.url}
                  onMouseMove={() => setActive(i)}
                  onClick={(e) => {
                    e.preventDefault();
                    go(h);
                  }}
                  className={`flex gap-3 rounded-xl px-3 py-2.5 transition-colors ${h.sub ? "ml-5" : ""} ${
                    i === active ? "bg-accent-tint" : ""
                  }`}
                >
                  {h.sub ? (
                    <Hash className="mt-0.5 size-4 shrink-0 text-subtle" />
                  ) : (
                    <FileText className="mt-0.5 size-4 shrink-0 text-accent" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{h.title}</span>
                    <span
                      className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-muted"
                      dangerouslySetInnerHTML={{ __html: h.excerpt }}
                    />
                  </span>
                  {i === active && <CornerDownLeft className="mt-0.5 size-4 shrink-0 text-subtle" />}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-between border-t border-line px-4 py-2 text-[11px] text-subtle">
          <span>↑ ↓ to move · ↵ to open</span>
          <span>Powered by Pagefind</span>
        </div>
      </dialog>
    </>
  );
}
