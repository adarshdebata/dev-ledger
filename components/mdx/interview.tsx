import { ChevronDown } from "lucide-react";
import { inline } from "./inline";

/** A numbered list of interview questions; each answer opens in place. Works without JavaScript. */
export function Interview({ children }: { children: React.ReactNode }) {
  return <div className="not-prose my-8 divide-y divide-line rounded-2xl border border-line [counter-reset:iq]">{children}</div>;
}

export function Question({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group [counter-increment:iq]">
      <summary className="flex cursor-pointer list-none items-start gap-3 px-5 py-4 transition-colors hover:bg-bg-soft [&::-webkit-details-marker]:hidden">
        <span className="mt-[3px] w-7 shrink-0 font-mono text-[12px] text-accent before:content-['Q'_counter(iq)]" aria-hidden="true" />
        <span className="min-w-0 flex-1 text-[15.5px] leading-snug font-semibold">{inline(q)}</span>
        <ChevronDown className="mt-0.5 size-4 shrink-0 text-subtle transition-transform duration-300 group-open:rotate-180" />
      </summary>
      <div className="prose-ledger prose px-5 pb-5 pl-[3.75rem] text-[0.95em] [&>:first-child]:mt-0 [&>:last-child]:mb-0">{children}</div>
    </details>
  );
}
