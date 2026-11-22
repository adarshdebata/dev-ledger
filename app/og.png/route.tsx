import { ImageResponse } from "next/og";
import { OG, OG_SIZE, OgMark, ogFonts } from "@/lib/og";
import { site } from "@/lib/site";

export const dynamic = "force-static";

/** The share image for pages without their own: home, About, Series, tags. */
export async function GET() {
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
          background: OG.IVORY,
          color: OG.INK,
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <OgMark />
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 5 }}>DEV LEDGER</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ width: 96, height: 5, background: OG.TERRACOTTA }} />
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3 }}>{site.theme}</div>
          <div style={{ fontSize: 32, lineHeight: 1.35, color: OG.MUTED }}>{site.tagline}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 22, color: OG.MUTED }}>
          <div style={{ display: "flex", color: OG.TERRACOTTA, fontWeight: 700 }}>Interactive deep dives for developers</div>
          <div style={{ marginLeft: "auto", display: "flex" }}>adarshdebata.github.io/dev-ledger</div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await ogFonts() },
  );
}
