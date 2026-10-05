import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { getAllTags } from "@/lib/posts";
import { alternates } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tags",
  description: "Every topic covered on Dev Ledger.",
  alternates: alternates("/tags/"),
};

export default function TagsPage() {
  const tags = getAllTags();
  return (
    <>
      <PageHeader eyebrow="Index" title="Tags">
        Every topic the ledger has touched so far.
      </PageHeader>
      <div className="container-page py-12">
        <ul className="flex flex-wrap gap-3">
          {tags.map(({ tag, count }) => (
            <li key={tag}>
              <Link
                href={`/tags/${tag}/`}
                className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-[15px] font-medium transition-colors hover:border-line-strong hover:bg-card"
              >
                <span className="text-accent">#</span>
                {tag}
                <span className="rounded-md bg-bg-soft px-1.5 py-0.5 font-mono text-xs text-subtle">{count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
