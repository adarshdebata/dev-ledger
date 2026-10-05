"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, X } from "lucide-react";

const PAIRS: [string, string, string][] = [
  ["http://localhost:3000", "http://localhost:5173/api/orders", ":3000 vs :5173"],
  ["https://app.example.com", "https://api.example.com/orders", "app. vs api."],
  ["https://example.com/a", "https://example.com/b?page=2", "different paths"],
  ["http://example.com", "https://example.com", "http vs https"],
  ["http://localhost:3000", "http://127.0.0.1:3000", "localhost vs 127.0.0.1"],
  ["https://example.com", "https://example.com:443/x", "explicit :443"],
];

type Parsed = { scheme: string; host: string; port: string; defaultPort: boolean; origin: string } | { error: string };

function parse(input: string): Parsed {
  try {
    const u = new URL(input.trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") return { error: "Use an http:// or https:// URL" };
    const def = u.protocol === "https:" ? "443" : "80";
    return { scheme: u.protocol.slice(0, -1), host: u.hostname, port: u.port || def, defaultPort: !u.port, origin: u.origin };
  } catch {
    return { error: "That isn't a complete URL yet" };
  }
}

const PARTS = [
  { key: "scheme", label: "scheme" },
  { key: "host", label: "host" },
  { key: "port", label: "port" },
] as const;

export function OriginCompare() {
  const [a, setA] = useState(PAIRS[0][0]);
  const [b, setB] = useState(PAIRS[0][1]);
  const pa = parse(a);
  const pb = parse(b);
  const valid = !("error" in pa) && !("error" in pb);
  const diffs = valid ? PARTS.filter((p) => pa[p.key] !== pb[p.key]).map((p) => p.label) : [];
  const same = valid && diffs.length === 0;

  return (
    <div className="not-prose my-8 rounded-2xl border border-line bg-card p-4 sm:p-5">
      <p className="text-xs font-semibold tracking-wider text-accent uppercase">Try it: are these the same origin?</p>
      <div className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {PAIRS.map(([x, y, label]) => {
          const on = x === a && y === b;
          return (
            <button
              key={x + y}
              type="button"
              onClick={() => {
                setA(x);
                setB(y);
              }}
              className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-[11px] whitespace-nowrap transition-colors ${
                on ? "border-accent-soft/60 bg-accent-tint text-accent" : "border-line text-muted hover:text-fg"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-3">
        {[
          { label: "Page", value: a, set: setA, p: pa },
          { label: "Request", value: b, set: setB, p: pb },
        ].map((row) => (
          <div key={row.label}>
            <label className="flex items-center gap-2">
              <span className="w-16 shrink-0 text-[12px] font-semibold text-muted">{row.label}</span>
              <input
                value={row.value}
                onChange={(e) => row.set(e.target.value)}
                spellCheck={false}
                className="h-9 w-full min-w-0 rounded-lg border border-line bg-bg-soft px-3 font-mono text-[12.5px] text-fg focus:border-accent-soft focus:outline-none"
              />
            </label>
            <div className="mt-2 flex flex-wrap gap-1.5 pl-[4.5rem]">
              {"error" in row.p ? (
                <span className="text-[12px] text-subtle">{row.p.error}</span>
              ) : (
                PARTS.map((part) => {
                  const p = row.p as Exclude<Parsed, { error: string }>;
                  const differs = valid && diffs.includes(part.label);
                  return (
                    <span
                      key={part.key}
                      className={`inline-flex items-baseline gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[12px] transition-colors duration-300 ${
                        differs ? "border-bad/50 bg-bad-tint text-bad" : "border-ok/40 bg-ok-tint text-ok"
                      }`}
                    >
                      <span className="text-[10px] tracking-wide uppercase opacity-70">{part.label}</span>
                      {p[part.key]}
                      {part.key === "port" && p.defaultPort && <span className="text-[10px] opacity-70">(default)</span>}
                    </span>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 min-h-[4.25rem] rounded-xl border border-line bg-bg-soft px-4 py-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={valid ? (same ? "same" : diffs.join()) : "invalid"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="flex gap-2.5"
          >
            {!valid ? (
              <p className="text-[13.5px] text-subtle">Type two full URLs to compare them.</p>
            ) : same ? (
              <>
                <Check className="mt-0.5 size-5 shrink-0 text-ok" />
                <p className="text-[13.5px]">
                  <strong>Same origin.</strong> Scheme, host and port all match. Paths and query strings never count, so no CORS check
                  happens.
                </p>
              </>
            ) : (
              <>
                <X className="mt-0.5 size-5 shrink-0 text-bad" />
                <p className="text-[13.5px]">
                  <strong>Cross-origin.</strong> The {diffs.join(" and ")} {diffs.length > 1 ? "differ" : "differs"}, so the browser
                  sends <code className="font-mono text-accent">Origin: {(pa as { origin: string }).origin}</code> and checks the response.
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
