import fs from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { roadmapLabel } from "@/components/post-card";
import { getAllPosts, getPost } from "@/lib/posts";
import { getChain, getSeries } from "@/lib/site";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

const fontDir = path.join(process.cwd(), "node_modules", "@fontsource", "inter", "files");

const INK = "#172033";
const IVORY = "#f8f5ee";
const MUTED = "#4b5568";
const TERRACOTTA = "#c8643f";
const TEAL = "#1d6b73";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) return new Response("Not found", { status: 404 });
  const series = getSeries(post.series)!;
  const chain = post.chain ? getChain(post.chain) : undefined;
  const stage = chain?.stages.find((s) => s.roadmap.some((n) => post.roadmap.includes(n)));
  const [regular, semibold] = await Promise.all([
    fs.readFile(path.join(fontDir, "inter-latin-400-normal.woff")),
    fs.readFile(path.join(fontDir, "inter-latin-700-normal.woff")),
  ]);

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
          <svg width="46" height="46" viewBox="0 0 32 32">
            <path
              fill={INK}
              fillRule="evenodd"
              d="M5.5 29 7 15.5 12.5 7.5 19.5 5.5l5 2.6 1.6 2.6-.9 1.9-3.5 1-.6 6-1.3 4-1.4-4-.7-4-4.6 4.3L11.5 29ZM18.1 10.1l4.2-.8a2.15 2.15 0 0 1-4.2.8Z"
            />
            <path d="M26.3 10.6l4.3 4.5-3.9 4" fill="none" stroke={TERRACOTTA} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="miter" />
          </svg>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 5 }}>DEV LEDGER</div>
          <div style={{ marginLeft: "auto", fontSize: 22, color: MUTED }}>{`Series ${series.n} · ${series.title}`}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ width: 96, height: 5, background: TERRACOTTA }} />
          <div style={{ fontSize: post.title.length > 48 ? 66 : 76, fontWeight: 700, lineHeight: 1.04, letterSpacing: -2.5 }}>{post.title}</div>
          <div style={{ fontSize: 30, lineHeight: 1.35, color: MUTED }}>{post.subtitle}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 22, color: MUTED }}>
          <div style={{ display: "flex", color: TERRACOTTA, fontWeight: 700 }}>{roadmapLabel(post.roadmap)}</div>
          {chain && stage && <div style={{ display: "flex", color: TEAL }}>{`${chain.title} · ${stage.name}`}</div>}
          <div style={{ marginLeft: "auto", display: "flex" }}>adarshdebata.github.io/dev-ledger</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Inter", data: regular, weight: 400, style: "normal" },
        { name: "Inter", data: semibold, weight: 700, style: "normal" },
      ],
    },
  );
}
