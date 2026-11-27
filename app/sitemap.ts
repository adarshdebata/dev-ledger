import type { MetadataRoute } from "next";
import { localCaseStudies } from "@/lib/case-studies";
import { historyOf } from "@/lib/git-meta";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { absoluteUrl, chains, series } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const latest = posts[0]?.date;
  return [
    { url: absoluteUrl("/"), lastModified: latest },
    { url: absoluteUrl("/posts/"), lastModified: latest },
    { url: absoluteUrl("/about/") },
    { url: absoluteUrl("/tags/") },
    { url: absoluteUrl("/series/") },
    { url: absoluteUrl("/case-studies/") },
    ...localCaseStudies().map((c) => ({ url: absoluteUrl(`/case-studies/${c.slug}/`), lastModified: c.date })),
    ...series.map((s) => ({ url: absoluteUrl(`/series/${s.n}/`) })),
    ...chains.map((c) => ({ url: absoluteUrl(`/chains/${c.id}/`) })),
    ...getAllTags().map(({ tag }) => ({ url: absoluteUrl(`/tags/${tag}/`) })),
    // The last commit to a post, so search engines recrawl it after a correction.
    ...posts.map((p) => {
      const changed = historyOf(`content/posts/${p.slug}/index.mdx`).updated?.date;
      return { url: absoluteUrl(`/posts/${p.slug}/`), lastModified: changed && changed > p.date ? changed : p.date };
    }),
  ];
}
