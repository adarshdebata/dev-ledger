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
