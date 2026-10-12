import fs from "node:fs";
import path from "node:path";
import { authorByEmail, getAuthor, type Author } from "./authors";

/** Shape written by scripts/git-meta.mjs. */
type Who = { name: string; email: string; date: string };
type FileMeta = {
  created: Who | null;
  updated: Who;
  revisions: number | null;
  contributors: { name: string; email: string; commits: number }[];
};
type Contributor = { name: string; email: string; commits: number; added: number; removed: number; articles: number };
type GitMeta = { available: boolean; shallow: boolean; files: Record<string, FileMeta>; contributors: Contributor[] };

const EMPTY: GitMeta = { available: false, shallow: false, files: {}, contributors: [] };

function read(): GitMeta {
  try {
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), ".generated", "git-meta.json"), "utf8")) as GitMeta;
  } catch {
    return EMPTY; // e.g. `next build` run without scripts/git-meta.mjs first
  }
}

let cache: GitMeta | null = null;
const meta = () => (cache && process.env.NODE_ENV === "production" ? cache : (cache = read()));

/** A person as the site shows them: their profile when they have one, otherwise just their Git name. */
export type Person = { name: string; author?: Author };
const toPerson = (name: string, email?: string): Person => ({ name: authorByEmail(email)?.name ?? name, author: authorByEmail(email) });

export type History = {
  /** Original author: frontmatter `author` if given, otherwise whoever first committed the file. */
  author?: Person;
  updated?: { by: Person; date: string };
  revisions?: number;
  contributors: Person[];
};

/** Attribution for one content file, e.g. "content/posts/<slug>/index.mdx". */
export function historyOf(file: string, frontmatterAuthor?: string): History {
  const f = meta().files[file];
  const declared = getAuthor(frontmatterAuthor);
  const author = declared ? { name: declared.name, author: declared } : f?.created ? toPerson(f.created.name, f.created.email) : undefined;
  return {
    author,
    updated: f ? { by: toPerson(f.updated.name, f.updated.email), date: f.updated.date.slice(0, 10) } : undefined,
    revisions: f?.revisions ?? undefined,
    contributors: (f?.contributors ?? []).map((c) => toPerson(c.name, c.email)),
  };
}

/** Everyone who has committed to the project, with what the numbers mean spelled out on the About page. */
export function contributorStats() {
  return meta().contributors.map((c) => ({ ...toPerson(c.name, c.email), commits: c.commits, added: c.added, removed: c.removed, articles: c.articles }));
}
