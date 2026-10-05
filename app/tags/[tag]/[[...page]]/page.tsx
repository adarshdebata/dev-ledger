import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { PostCard } from "@/components/post-card";
import { getAllTags, pageParams, paginate, parsePage, postsWithTag } from "@/lib/posts";
import { alternates } from "@/lib/site";

type Props = { params: Promise<{ tag: string; page?: string[] }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllTags().flatMap(({ tag, count }) => pageParams(count).map((page) => ({ tag, page })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params;
  return { title: `#${tag}`, description: `Articles tagged ${tag}.`, alternates: alternates(`/tags/${tag}/`) };
}

export default async function TagPage({ params }: Props) {
  const { tag, page: segments } = await params;
  const page = parsePage(segments);
  const all = postsWithTag(tag);
  if (!page || all.length === 0) notFound();
  const { items, pages } = paginate(all, page);

  return (
    <>
      <PageHeader eyebrow="Tag" title={`#${tag}`}>
        {all.length} article{all.length === 1 ? "" : "s"}
      </PageHeader>
      <div className="container-page py-12">
        <div className="grid gap-5">
          {items.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
        <Pagination base={`/tags/${tag}/`} page={page} pages={pages} />
      </div>
    </>
  );
}
