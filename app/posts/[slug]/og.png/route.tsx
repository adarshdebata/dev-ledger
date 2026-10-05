import fs from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { hawk } from "@/components/logo";
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
          <svg width="54" height="54" viewBox="0 0 64 64">
            <path fill={INK} d={hawk.head} />
            <path fill={TERRACOTTA} d={hawk.beak} />
            <circle cx={hawk.eye.cx} cy={hawk.eye.cy} r={hawk.eye.r} fill={TERRACOTTA} />
            <path fill={INK} d={hawk.brow} />
            <circle cx={hawk.pupil.cx} cy={hawk.pupil.cy} r={hawk.pupil.r} fill="#141c2e" />
            <circle cx={hawk.glint.cx} cy={hawk.glint.cy} r={hawk.glint.r} fill={IVORY} />
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
