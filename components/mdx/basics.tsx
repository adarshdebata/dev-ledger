import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Bug,
  CircleAlert,
  Eye,
  Info,
  Layers,
  Lightbulb,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { CopyButton } from "./client-bits";
import { inline } from "./inline";

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & { id?: string };

function makeHeading(Tag: "h2" | "h3") {
  return function Heading({ id, children, ...rest }: HeadingProps) {
    return (
      <Tag id={id} className="group relative" {...rest}>
        {id && (
          <span className="not-prose">
            {/* The "#" is drawn by CSS, so it isn't part of the heading's text (search titles, copy-paste). */}
            <a
              href={`#${id}`}
              aria-hidden="true"
              tabIndex={-1}
              className="absolute top-0 -left-6 hidden pr-2 font-normal text-subtle opacity-0 transition-opacity group-hover:opacity-100 before:content-['#'] hover:text-accent md:block"
            />
          </span>
        )}
        {children}
      </Tag>
    );
  };
}

export const H2 = makeHeading("h2");
export const H3 = makeHeading("h3");

export function SmartLink({ href = "", children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }
  if (href.startsWith("#")) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
      <ArrowUpRight className="ml-0.5 inline size-[0.8em] align-baseline opacity-60" aria-hidden="true" />
    </a>
  );
}

const langLabels: Record<string, string> = {
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  http: "HTTP",
  bash: "Terminal",
  sh: "Terminal",
  shell: "Terminal",
  nginx: "Nginx",
  json: "JSON",
  text: "Text",
  console: "Console",
};

type PreProps = React.HTMLAttributes<HTMLPreElement> & { "data-title"?: string; "data-lang"?: string };

export function CodeBlock({ "data-title": title, "data-lang": lang = "text", ...props }: PreProps) {
  return (
    <figure className="code-block not-prose my-7 overflow-hidden rounded-xl border border-code-line bg-code">
      <figcaption className="flex h-10 items-center justify-between gap-3 border-b border-code-line pr-1.5 pl-4">
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="truncate font-mono text-xs text-muted">{title ?? langLabels[lang] ?? lang}</span>
        </span>
        <CopyButton />
      </figcaption>
      <pre {...props} />
    </figure>
  );
}

export function Table(props: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="my-7 overflow-x-auto">
      <table {...props} className="my-0" />
    </div>
  );
}

const calloutStyles = {
  note: { icon: Info, cls: "border-info bg-info-tint", iconCls: "text-info", label: "Note" },
  tip: { icon: Lightbulb, cls: "border-ok bg-ok-tint", iconCls: "text-ok", label: "Tip" },
  warning: { icon: AlertTriangle, cls: "border-warn bg-warn-tint", iconCls: "text-warn", label: "Watch out" },
  danger: { icon: XCircle, cls: "border-bad bg-bad-tint", iconCls: "text-bad", label: "Be careful" },
  insight: { icon: Sparkles, cls: "border-accent-soft bg-accent-tint", iconCls: "text-accent", label: "Under the hood" },
  story: { icon: BookOpen, cls: "border-teal-soft bg-teal-tint", iconCls: "text-teal", label: "Think of it like this" },
};

export function Callout({
  type = "note",
  title,
  children,
}: {
  type?: keyof typeof calloutStyles;
  title?: string;
  children: React.ReactNode;
}) {
  const s = calloutStyles[type];
  const Icon = s.icon;
  return (
    <aside className={`my-8 rounded-r-xl border-l-[3px] px-5 py-4 ${s.cls}`}>
      <p className="not-prose flex items-center gap-2 text-[15px] font-semibold">
        <Icon className={`size-[18px] shrink-0 ${s.iconCls}`} />
        {title ?? s.label}
      </p>
      <div className="mt-1.5 text-[0.95em] [&>:first-child]:mt-0 [&>:last-child]:mb-0">{children}</div>
    </aside>
  );
}

export function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="not-prose my-8 [counter-reset:step]">{children}</ol>;
}

export function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="relative grid grid-cols-[2rem_1fr] gap-4 pb-7 [counter-increment:step] last:pb-0">
      <span
        aria-hidden="true"
        className="relative z-10 grid size-8 place-items-center rounded-full border border-accent-soft/50 bg-card font-mono text-sm font-semibold text-accent before:content-[counter(step)]"
      />
      <span aria-hidden="true" className="absolute top-9 bottom-1 left-4 w-px bg-line [li:last-child>&]:hidden" />
      <div className="min-w-0 pt-1">
        <p className="font-semibold tracking-tight">{title}</p>
        <div className="prose-ledger prose mt-1.5 text-[0.95em] [&>:first-child]:mt-0 [&>:last-child]:mb-0 [&_.code-block]:my-4">
          {children}
        </div>
      </div>
    </li>
  );
}

const fiveQuestions = [
  { key: "problem", q: "What problem does this solve?", icon: ShieldCheck },
  { key: "sees", q: "What does the developer see?", icon: Eye },
  { key: "underneath", q: "What is actually happening underneath?", icon: Layers },
  { key: "breaks", q: "What breaks when it fails?", icon: Bug },
  { key: "misconception", q: "What do developers often get wrong?", icon: CircleAlert },
] as const;

type FiveProps = Record<(typeof fiveQuestions)[number]["key"], string>;

export function FiveQuestions(props: FiveProps) {
  return (
    <div className="not-prose my-8 overflow-hidden rounded-2xl border border-line">
      <div className="border-b border-line bg-bg-soft px-5 py-3.5">
        <p className="eyebrow text-accent">The five questions, answered</p>
      </div>
      <dl className="divide-y divide-line">
        {fiveQuestions.map(({ key, q, icon: Icon }, i) => (
          <div key={key} className="grid gap-2 px-5 py-4 sm:grid-cols-[15rem_1fr] sm:gap-6">
            <dt className="flex items-start gap-2.5 text-[14.5px] font-semibold">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-md bg-accent-tint">
                <Icon className="size-3.5 text-accent" />
              </span>
              <span>
                <span className="mr-1 font-mono text-xs text-subtle">{i + 1}.</span>
                {q}
              </span>
            </dt>
            <dd className="text-[15px] leading-relaxed text-muted">{inline(props[key])}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function Compare({
  leftTitle,
  rightTitle,
  leftTone = "ok",
  rightTone = "bad",
  children,
}: {
  leftTitle: string;
  rightTitle: string;
  leftTone?: "ok" | "bad" | "neutral";
  rightTone?: "ok" | "bad" | "neutral";
  children: React.ReactNode;
}) {
  const tone = { ok: "bg-ok", bad: "bg-bad", neutral: "bg-subtle" };
  const [left, ...right] = Array.isArray(children) ? children : [children];
  return (
    <div className="not-prose my-8 grid gap-4 md:grid-cols-2">
      {[
        [leftTitle, leftTone, left],
        [rightTitle, rightTone, right],
      ].map(([title, t, content], i) => (
        <div key={i} className="flex min-w-0 flex-col">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <span className={`size-2 rounded-full ${tone[t as keyof typeof tone]}`} />
            {title as string}
          </p>
          <div className="flex-1 [&>*]:my-0! [&>*]:h-full">{content as React.ReactNode}</div>
        </div>
      ))}
    </div>
  );
}

type ConsoleLine = { level: "error" | "warn" | "log"; text: string; source?: string };
type NetRow = { name: string; method: string; status: string; type: string; bad?: boolean };

/** A faithful-looking slice of Chrome DevTools: console messages and network rows. */
export function DevTools({ console: lines = [], network = [] }: { console?: ConsoleLine[]; network?: NetRow[] }) {
  return (
    <div className="not-prose my-8 overflow-hidden rounded-xl border border-line bg-card font-mono text-[12.5px]">
      <div className="flex items-center gap-4 border-b border-line bg-bg-soft px-3 text-[12px] text-muted">
        <span className={`py-2 ${lines.length ? "border-b-2 border-accent-soft text-fg" : ""}`}>Console</span>
        <span className={`py-2 ${!lines.length ? "border-b-2 border-accent-soft text-fg" : ""}`}>Network</span>
        <span className="py-2">Elements</span>
        <span className="hidden py-2 sm:inline">Application</span>
      </div>
      {lines.map((l, i) => (
        <div
          key={i}
          className={`flex gap-2.5 border-b px-3 py-2 leading-relaxed last:border-b-0 ${
            l.level === "error"
              ? "border-bad/20 bg-bad-tint text-bad"
              : l.level === "warn"
                ? "border-warn/20 bg-warn-tint text-warn"
                : "border-line text-fg"
          }`}
        >
          {l.level === "error" ? (
            <XCircle className="mt-[3px] size-3.5 shrink-0" />
          ) : l.level === "warn" ? (
            <AlertTriangle className="mt-[3px] size-3.5 shrink-0" />
          ) : (
            <span className="w-3.5 shrink-0" />
          )}
          <span className="min-w-0 flex-1 break-words whitespace-pre-wrap">{l.text}</span>
          {l.source && <span className="hidden shrink-0 text-subtle underline sm:inline">{l.source}</span>}
        </div>
      ))}
      {network.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[26rem] text-left">
            <thead className="border-b border-line bg-bg-soft/60 text-[11.5px] text-subtle">
              <tr>
                <th className="px-3 py-1.5 font-normal">Name</th>
                <th className="px-3 py-1.5 font-normal">Method</th>
                <th className="px-3 py-1.5 font-normal">Status</th>
                <th className="px-3 py-1.5 font-normal">Type</th>
              </tr>
            </thead>
            <tbody>
              {network.map((r, i) => (
                <tr key={i} className={`border-b border-line last:border-b-0 ${r.bad ? "text-bad" : "text-fg"}`}>
                  <td className="px-3 py-1.5">{r.name}</td>
                  <td className="px-3 py-1.5">{r.method}</td>
                  <td className="px-3 py-1.5">{r.status}</td>
                  <td className="px-3 py-1.5 text-muted">{r.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
