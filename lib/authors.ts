import data from "@/content/authors.json";

/**
 * Author profiles live in content/authors.json so contributors can add or edit themselves
 * without touching any component. Only `id`, `name` and `github` are required.
 */
export const SOCIALS = {
  website: { label: "Website", href: (v: string) => v },
  linkedin: { label: "LinkedIn", href: (v: string) => `https://www.linkedin.com/in/${v}/` },
  x: { label: "X", href: (v: string) => `https://x.com/${v}` },
  instagram: { label: "Instagram", href: (v: string) => `https://www.instagram.com/${v}/` },
} as const;

export type SocialKind = keyof typeof SOCIALS;

export type Author = {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  /** An optional light line for the profile card. */
  note?: string;
  github: string;
  avatar?: string;
  socials: Partial<Record<SocialKind, string>>;
  /** Commit emails, used only to match Git history to this profile. Never shown. */
  gitEmails: string[];
};

function load(): Author[] {
  const list: unknown = (data as { authors?: unknown }).authors;
  if (!Array.isArray(list)) throw new Error('content/authors.json: expected { "authors": [...] }');
  return list.map((raw, i) => {
    const a = raw as Record<string, unknown>;
    const where = `content/authors.json: author #${i + 1}`;
    for (const key of ["id", "name", "github"]) {
      if (typeof a[key] !== "string" || !a[key]) throw new Error(`${where} needs a "${key}"`);
    }
    const socials: Author["socials"] = {};
    for (const [kind, value] of Object.entries((a.socials ?? {}) as Record<string, unknown>)) {
      if (!(kind in SOCIALS)) throw new Error(`${where}: unknown social "${kind}" (use ${Object.keys(SOCIALS).join(", ")})`);
      // Empty values are allowed and simply hidden.
      if (typeof value === "string" && value.trim()) socials[kind as SocialKind] = value.trim();
    }
    return {
      id: String(a.id),
      name: String(a.name),
      title: typeof a.title === "string" && a.title ? a.title : undefined,
      bio: typeof a.bio === "string" && a.bio ? a.bio : undefined,
      note: typeof a.note === "string" && a.note ? a.note : undefined,
      github: String(a.github),
      avatar: typeof a.avatar === "string" && a.avatar ? a.avatar : undefined,
      socials,
      gitEmails: Array.isArray(a.gitEmails) ? a.gitEmails.map((e) => String(e).toLowerCase()) : [],
    };
  });
}

export const authors: Author[] = load();

export const getAuthor = (id?: string) => (id ? authors.find((a) => a.id === id) : undefined);

export const authorByEmail = (email?: string) =>
  email ? authors.find((a) => a.gitEmails.includes(email.toLowerCase())) : undefined;

/** Social links that are actually configured, GitHub first. Empty ones never render. */
export function socialLinks(a: Author) {
  return [
    { kind: "github" as const, label: "GitHub", href: `https://github.com/${a.github}` },
    ...(Object.keys(SOCIALS) as SocialKind[])
      .filter((k) => a.socials[k])
      .map((k) => ({ kind: k, label: SOCIALS[k].label, href: SOCIALS[k].href(a.socials[k]!) })),
  ];
}
