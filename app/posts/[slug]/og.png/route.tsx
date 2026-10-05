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

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) return new Response("Not found", { status: 404 });
  const series = getSeries(post.series)!;
  const chain = post.chain ? getChain(post.chain) : undefined;
  const stage = chain?.stages.find((s) => s.roadmap.some((n) => post.roadmap.includes(n)));
  const [regular, bold] = await Promise.all([
    fs.readFile(path.join(fontDir, "inter-latin-400-normal.woff")),
    fs.readFile(path.join(fontDir, "inter-latin-800-normal.woff")),
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
          padding: "64px 72px",
          background: "#0a0a12",
          backgroundImage:
            "radial-gradient(circle at 85% 0%, rgba(118,75,162,0.55), transparent 55%), radial-gradient(circle at 0% 100%, rgba(102,126,234,0.35), transparent 50%)",
          color: "#ecebf6",
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 15,
              backgroundImage: "linear-gradient(135deg, #667EEA, #764BA2)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: 6,
              padding: "0 13px",
            }}
          >
            <div style={{ height: 4, borderRadius: 4, background: "white", width: 26 }} />
            <div style={{ height: 4, borderRadius: 4, background: "white", width: 16 }} />
            <div style={{ height: 4, borderRadius: 4, background: "white", width: 26 }} />
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.5 }}>Dev Ledger</div>
          <div style={{ marginLeft: "auto", fontSize: 24, color: "#a4a3ba" }}>{`Series ${series.n} · ${series.title}`}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: post.title.length > 48 ? 66 : 76, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2.5 }}>
            {post.title}
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.35, color: "#b7b6cc" }}>{post.subtitle}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 24, color: "#a4a3ba" }}>
          <div
            style={{
              display: "flex",
              padding: "8px 16px",
              borderRadius: 999,
              backgroundImage: "linear-gradient(135deg, #667EEA, #764BA2)",
              color: "white",
              fontWeight: 800,
            }}
          >
            {roadmapLabel(post.roadmap)}
          </div>
          {chain && stage && (
            <div style={{ display: "flex" }}>{`${chain.title} · ${stage.name}`}</div>
          )}
          <div style={{ marginLeft: "auto", display: "flex" }}>adarshdebata.github.io/dev-ledger</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Inter", data: regular, weight: 400, style: "normal" },
        { name: "Inter", data: bold, weight: 800, style: "normal" },
      ],
    },
  );
}
