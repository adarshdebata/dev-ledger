import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { chains, roadmap, site, type ChainId } from "./site";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export type PostMeta = {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  series: number;
  roadmap: number[];
  chain?: ChainId;
  tags: string[];
  summary: string;
  cover?: string;
  readingMinutes: number;
};

export type Post = PostMeta & { source: string };

function fail(slug: string, msg: string): never {
  throw new Error(`content/posts/${slug}/index.mdx: ${msg}`);
}

/** Words of prose only: code, JSX and frontmatter don't count towards reading time. */
function readingMinutes(source: string) {
  const prose = source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_`>|-]/g, " ");
  const words = prose.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

function loadPost(slug: string): Post {
  const raw = fs.readFileSync(path.join(POSTS_DIR, slug, "index.mdx"), "utf8");
  const { data, content } = matter(raw);

  for (const key of ["title", "subtitle", "date", "series", "roadmap", "summary"]) {
    if (data[key] === undefined || data[key] === "") fail(slug, `missing frontmatter "${key}"`);
  }
  const series = Number(data.series);
  if (!Number.isInteger(series) || series < 1 || series > 5) fail(slug, `"series" must be 1–5`);
  if (!Array.isArray(data.roadmap)) fail(slug, `"roadmap" must be a list of item numbers`);
  if (data.chain && !chains.some((c) => c.id === data.chain)) fail(slug, `unknown chain "${data.chain}"`);
  const tags: string[] = (data.tags ?? []).map((t: unknown) => String(t));
  for (const t of tags) if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t)) fail(slug, `tag "${t}" must be lowercase-kebab-case`);
  const date = new Date(data.date);
  if (Number.isNaN(date.getTime())) fail(slug, `invalid date "${data.date}"`);

  return {
    slug,
    title: String(data.title),
    subtitle: String(data.subtitle),
    date: date.toISOString().slice(0, 10),
    series,
    roadmap: data.roadmap.map(Number),
    chain: data.chain,
    tags,
    summary: String(data.summary),
    cover: data.cover,
    readingMinutes: readingMinutes(content),
    source: content,
  };
}

let cache: Post[] | null = null;

/** Every post, newest first. */
export function getAllPosts(): Post[] {
  // Cache across a build, but re-read in development so edits to posts show up on refresh.
  if (cache && process.env.NODE_ENV === "production") return cache;
  const slugs = fs.existsSync(POSTS_DIR)
    ? fs.readdirSync(POSTS_DIR).filter((d) => fs.existsSync(path.join(POSTS_DIR, d, "index.mdx")))
    : [];
  cache = slugs.map(loadPost).sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  return cache;
}

export const getPost = (slug: string) => getAllPosts().find((p) => p.slug === slug);

export const postsInSeries = (n: number) => getAllPosts().filter((p) => p.series === n);

export const postsWithTag = (tag: string) => getAllPosts().filter((p) => p.tags.includes(tag));

export function getAllTags() {
  const counts = new Map<string, number>();
  for (const p of getAllPosts()) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** The published post covering a roadmap item, if any. */
export const postForRoadmapItem = (n: number) => getAllPosts().find((p) => p.roadmap.includes(n));

/** Roadmap items of a series with the post that covers each one. */
export const seriesRoadmap = (n: number) =>
  roadmap.filter((r) => r.series === n).map((r) => ({ ...r, post: postForRoadmapItem(r.n) }));

export function paginate<T>(items: T[], page: number) {
  const pages = Math.max(1, Math.ceil(items.length / site.pageSize));
  return { items: items.slice((page - 1) * site.pageSize, page * site.pageSize), page, pages };
}

/**
 * Params for an optional catch-all `[[...page]]` route: page 1 lives at the
 * bare URL, later pages at `.../page/<n>/`.
 */
export function pageParams(count: number) {
  const pages = Math.max(1, Math.ceil(count / site.pageSize));
  return Array.from({ length: pages }, (_, i) => (i === 0 ? [] : ["page", String(i + 1)]));
}

/** Parses `[[...page]]` params; returns null for anything that isn't a valid page. */
export function parsePage(segments: string[] | undefined) {
  if (!segments || segments.length === 0) return 1;
  if (segments.length === 2 && segments[0] === "page" && /^\d+$/.test(segments[1])) {
    const n = Number(segments[1]);
    return n >= 2 ? n : null;
  }
  return null;
}

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

