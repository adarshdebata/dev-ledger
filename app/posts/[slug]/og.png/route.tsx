import { ImageResponse } from "next/og";
import { OG, OG_SIZE, OgMark, ogFonts } from "@/lib/og";
import { getAllPosts, getPost } from "@/lib/posts";
import { getChain, getSeries, placeLabel } from "@/lib/site";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

const { INK, IVORY, MUTED, TERRACOTTA, TEAL } = OG;

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) return new Response("Not found", { status: 404 });
  const series = getSeries(post.series)!;
  const chain = post.chain ? getChain(post.chain) : undefined;
  const stage = chain?.stages.find((s) => s.roadmap.some((n) => post.roadmap.includes(n)));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 76px",
          background: IVORY,
          color: INK,
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <OgMark />
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 5 }}>DEV LEDGER</div>
          <div style={{ marginLeft: "auto", fontSize: 22, color: MUTED }}>{`Series ${series.n} · ${series.title}`}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ width: 96, height: 5, background: TERRACOTTA }} />
          <div style={{ fontSize: post.title.length > 48 ? 66 : 76, fontWeight: 700, lineHeight: 1.04, letterSpacing: -2.5 }}>{post.title}</div>
          <div style={{ fontSize: 30, lineHeight: 1.35, color: MUTED }}>{post.subtitle}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 22, color: MUTED }}>
          <div style={{ display: "flex", color: TERRACOTTA, fontWeight: 700 }}>{placeLabel(post)}</div>
          {chain && stage && <div style={{ display: "flex", color: TEAL }}>{`${chain.title} · ${stage.name}`}</div>}
          <div style={{ marginLeft: "auto", display: "flex" }}>adarshdebata.github.io/dev-ledger</div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await ogFonts() },
  );
}
