import { getAllPosts } from "@/lib/posts";
import { absoluteUrl, site } from "@/lib/site";

export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const rfc822 = (isoDate: string) => new Date(`${isoDate}T00:00:00Z`).toUTCString();

export function GET() {
  const posts = getAllPosts();
  const items = posts
    .map((p) => {
      const url = absoluteUrl(`/posts/${p.slug}/`);
      return [
        "    <item>",
        `      <title>${esc(p.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${rfc822(p.date)}</pubDate>`,
        `      <description>${esc(`${p.subtitle} ${p.summary}`)}</description>`,
        ...p.tags.map((t) => `      <category>${esc(t)}</category>`),
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(site.name)}</title>
    <link>${site.url}/</link>
    <description>${esc(site.description)}</description>
    <language>en</language>
    ${posts[0] ? `<lastBuildDate>${rfc822(posts[0].date)}</lastBuildDate>` : ""}
    <atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
