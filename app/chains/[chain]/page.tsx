import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChainTimeline } from "@/components/chain-path";
import { PageHeader } from "@/components/page-header";
import { alternates, chains, getChain, roadmap } from "@/lib/site";

type Props = { params: Promise<{ chain: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return chains.map((c) => ({ chain: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getChain((await params).chain);
  return c ? { title: c.title, description: c.blurb, alternates: alternates(`/chains/${c.id}/`) } : {};
}

export default async function ChainPage({ params }: Props) {
  const c = getChain((await params).chain);
  if (!c) notFound();
  const titles = new Map(roadmap.map((r) => [r.n, r.title]));
  const other = chains.find((x) => x.id !== c.id)!;

  return (
    <>
      <PageHeader eyebrow="Chain" title={c.title}>
        {c.blurb} Start at any stage; each one stands on its own.
      </PageHeader>
      <div className="container-page grid grid-cols-1 gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <ChainTimeline chain={c} titles={titles} />
        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-line p-5">
            <p className="text-sm font-semibold">How to read a chain</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Each stage is a stop on the way. Highlighted stages already have an article; the rest are on the
              roadmap. Every article answers the same five questions, so you can jump in anywhere.
            </p>
          </div>
          <Link
            href={`/chains/${other.id}/`}
            className="block rounded-2xl border border-line p-5 transition-colors hover:border-line-strong hover:bg-card"
          >
            <p className="text-xs text-subtle">The other chain</p>
            <p className="mt-1 font-semibold">{other.title} →</p>
          </Link>
        </aside>
      </div>
    </>
  );
}
