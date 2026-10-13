import Link from "next/link";
import { socialLinks, type Author } from "@/lib/authors";
import type { Person } from "@/lib/git-meta";
import { withBase } from "@/lib/site";
import { BrandIcon } from "./brand-icons";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

/** A round photo for people with a profile, their initials for everyone else. Decorative: the name sits beside it. */
export function Avatar({ person, size = 28 }: { person: Person; size?: number }) {
  const src = person.author?.avatar;
  return src ? (
    <img
      src={withBase(src)}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className="shrink-0 rounded-full border border-line object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-full border border-line bg-bg-soft font-mono text-[0.7em] font-semibold text-muted"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(person.name)}
    </span>
  );
}

/** Only the platforms an author has configured; nothing renders for empty fields. */
export function SocialLinks({ author, className = "" }: { author: Author; className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-1 ${className}`} aria-label={`${author.name} elsewhere`}>
      {socialLinks(author).map((s) => (
        <li key={s.kind}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer me"
            aria-label={`${author.name} on ${s.label}`}
            title={s.label}
            className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-bg-soft hover:text-fg"
          >
            <BrandIcon kind={s.kind} className="size-[15px]" />
          </a>
        </li>
      ))}
    </ul>
  );
}

/** The same links as pills with their names, for roomier places such as the About page. */
export function SocialPills({ author, className = "" }: { author: Author; className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`} aria-label={`${author.name} elsewhere`}>
      {socialLinks(author).map((s) => (
        <li key={s.kind}>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer me"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-bg px-3.5 py-1.5 text-[13px] font-medium text-muted transition-colors hover:border-line-strong hover:text-fg"
          >
            <BrandIcon kind={s.kind} className="size-[13px]" />
            {s.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

type Stats = { articles: number; commits: number; added: number; removed: number };
const n = (x: number) => x.toLocaleString("en-GB");

/**
 * A portfolio-style developer card: a status line and links on top, then a tilted photo beside a big name,
 * the role between thin rules, and numbers from the Git history underneath.
 */
export function DevCard({ author, stats, status }: { author: Author; stats?: Stats; status?: string }) {
  const tiles: [string, string][] = stats
    ? [
        ["Articles written", n(stats.articles)],
        ["Commits", n(stats.commits)],
        ["Lines changed", `+${n(stats.added)} −${n(stats.removed)}`],
      ]
    : [];
  return (
    <div id={author.id} className="scroll-mt-28 overflow-hidden rounded-3xl border border-line bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5 sm:px-8">
        {status ? (
          <span className="inline-flex items-center gap-2 font-mono text-[12px] text-muted">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-ok opacity-50 motion-reduce:hidden" />
              <span className="relative inline-flex size-2 rounded-full bg-ok" />
            </span>
            {status}
          </span>
        ) : (
          <span />
        )}
        <SocialPills author={author} />
      </div>

      <div className="grid gap-8 px-5 py-9 sm:px-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center lg:gap-12 lg:py-12">
        <div className="flex items-center gap-5 sm:gap-7">
          {author.avatar && (
            <img
              src={withBase(author.avatar)}
              alt={`${author.name}'s profile picture`}
              width={112}
              height={112}
              loading="lazy"
              decoding="async"
              className="size-20 shrink-0 -rotate-6 rounded-[1.4rem] border-4 border-bg object-cover shadow-lift sm:size-28 sm:rounded-[1.75rem]"
            />
          )}
          <div className="min-w-0">
            <p className="font-mono text-sm font-semibold tracking-widest text-accent">I&apos;M</p>
            <p className="mt-1 text-[2.1rem] leading-[0.95] font-semibold tracking-[-0.04em] text-balance uppercase sm:text-[3.2rem]">{author.name}</p>
          </div>
        </div>
        <div className="border-y border-line py-5 font-mono text-[14px] leading-relaxed text-muted">
          {author.title && <p className="font-semibold text-fg">{author.title}</p>}
          {author.bio && <p className="mt-2">{author.bio}</p>}
          {author.note && <p className="mt-3 font-sans text-[14.5px] text-accent italic">{author.note}</p>}
        </div>
      </div>

      {tiles.length > 0 && (
        <dl className="grid grid-cols-1 gap-px border-t border-line bg-line sm:grid-cols-3">
          {tiles.map(([label, value], i) => (
            <div key={label} className="bg-card px-5 py-5 sm:px-8">
              <dt className="font-mono text-[11.5px] text-subtle">
                {"// "}
                {String(i + 1).padStart(2, "0")} {label}
              </dt>
              <dd className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

/** A profile card. `wide` lays it out in one row, for when there's only one person to show. */
export function AuthorCard({ author, eyebrow, wide = false }: { author: Author; eyebrow?: string; wide?: boolean }) {
  return (
    <div
      id={author.id}
      className={`scroll-mt-28 rounded-2xl border border-line bg-card p-5 ${wide ? "sm:flex sm:items-start sm:gap-5" : ""}`}
    >
      <Avatar person={{ name: author.name, author }} size={wide ? 64 : 52} />
      <div className={`min-w-0 ${wide ? "mt-3 sm:mt-0" : "mt-3"}`}>
        {eyebrow && <p className="eyebrow text-subtle">{eyebrow}</p>}
        <p className={`${eyebrow ? "mt-1" : ""} text-[17px] font-semibold tracking-tight`}>{author.name}</p>
        {author.title && <p className="mt-0.5 text-[13.5px] text-muted">{author.title}</p>}
        {author.bio && <p className="mt-2.5 max-w-xl text-[14.5px] leading-relaxed text-muted">{author.bio}</p>}
        <SocialLinks author={author} className="mt-3 -ml-2" />
      </div>
    </div>
  );
}

/** "Name", linked to their card on the About page when they have a profile. */
export function PersonName({ person, className = "" }: { person: Person; className?: string }) {
  return person.author ? (
    <Link href={`/about/#${person.author.id}`} className={`hover:text-accent hover:underline ${className}`}>
      {person.name}
    </Link>
  ) : (
    <span className={className}>{person.name}</span>
  );
}
