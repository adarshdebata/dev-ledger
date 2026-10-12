import fs from "node:fs";
import path from "node:path";
import { getAuthor } from "./authors";
import { parseFrontmatter, readingMinutes, THUMBS, type Thumb } from "./posts";
import { external } from "./site";

/**
 * Case studies: real problems from real projects, written up as
 * content/case-studies/<slug>/index.mdx, plus stories already published elsewhere.
 */
export type CaseStudy = {
  slug: string;
  title: string;
  summary: string;
  date?: string;
  author?: string;
  tags: string[];
  thumb?: Thumb | "deps";
  /** Set when the case study lives on its own site. */
  url?: string;
  source?: string;
  readingMinutes?: number;
};

const DIR = path.join(process.cwd(), "content", "case-studies");

/** Already published as its own site; listed here, never copied. */
const EXTERNAL: CaseStudy[] = [
  {
    slug: "external-npm-to-pnpm",
    title: external.title,
    summary: external.blurb,
    url: external.url,
    author: "adarshdebata",
    tags: ["npm", "pnpm", "jest", "docker"],
    thumb: "deps",
  },
];

function load(slug: string): CaseStudy {
  const file = path.join(DIR, slug, "index.mdx");
  const { data, content } = parseFrontmatter(fs.readFileSync(file, "utf8"));
  const where = `content/case-studies/${slug}/index.mdx`;
  for (const key of ["title", "summary", "date"]) {
    if (data[key] === undefined || data[key] === "") throw new Error(`${where}: missing frontmatter "${key}"`);
  }
  const date = new Date(String(data.date));
  if (Number.isNaN(date.getTime())) throw new Error(`${where}: invalid date "${String(data.date)}"`);
  const author = data.author === undefined ? undefined : String(data.author);
  if (author && !getAuthor(author)) throw new Error(`${where}: unknown author "${author}" (add them to content/authors.json)`);
  const thumb = data.thumb === undefined ? undefined : String(data.thumb);
  if (thumb && !THUMBS.includes(thumb as Thumb)) throw new Error(`${where}: "thumb" must be one of ${THUMBS.join(", ")}`);
  return {
    slug,
    title: String(data.title),
    summary: String(data.summary),
    date: date.toISOString().slice(0, 10),
    author,
    tags: (Array.isArray(data.tags) ? data.tags : []).map((t: unknown) => String(t)),
    thumb: thumb as Thumb | undefined,
    source: content,
    readingMinutes: readingMinutes(content),
  };
}

/** Case studies written on this site, newest first. */
export function localCaseStudies(): CaseStudy[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((d) => fs.existsSync(path.join(DIR, d, "index.mdx")))
    .map(load)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

/** Everything for the index: local write-ups first, then ones published elsewhere. */
export const allCaseStudies = () => [...localCaseStudies(), ...EXTERNAL];

export const getCaseStudy = (slug: string) => localCaseStudies().find((c) => c.slug === slug);
