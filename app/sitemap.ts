import type { MetadataRoute } from "next";
import { localCaseStudies } from "@/lib/case-studies";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { absoluteUrl, chains, series } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const latest = posts[0]?.date;
  return [
    { url: absoluteUrl("/"), lastModified: latest },
    { url: absoluteUrl("/about/") },
    { url: absoluteUrl("/tags/") },
    { url: absoluteUrl("/series/") },
    { url: absoluteUrl("/case-studies/") },
    ...localCaseStudies().map((c) => ({ url: absoluteUrl(`/case-studies/${c.slug}/`), lastModified: c.date })),
    ...series.map((s) => ({ url: absoluteUrl(`/series/${s.n}/`) })),
    ...chains.map((c) => ({ url: absoluteUrl(`/chains/${c.id}/`) })),
    ...getAllTags().map(({ tag }) => ({ url: absoluteUrl(`/tags/${tag}/`) })),
    ...posts.map((p) => ({ url: absoluteUrl(`/posts/${p.slug}/`), lastModified: p.date })),
  ];
}
