import fs from "node:fs/promises";
import path from "node:path";
import { hawk } from "@/components/logo";

/** Shared pieces of the 1200 × 630 share images: colours, fonts and the hawk mark. */
export const OG = { INK: "#172033", IVORY: "#f8f5ee", MUTED: "#4b5568", TERRACOTTA: "#c8643f", TEAL: "#1d6b73" };

export const OG_SIZE = { width: 1200, height: 630 };

const fontDir = path.join(process.cwd(), "node_modules", "@fontsource", "inter", "files");

export async function ogFonts() {
  const [regular, bold] = await Promise.all([
    fs.readFile(path.join(fontDir, "inter-latin-400-normal.woff")),
    fs.readFile(path.join(fontDir, "inter-latin-700-normal.woff")),
  ]);
  return [
    { name: "Inter", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Inter", data: bold, weight: 700 as const, style: "normal" as const },
  ];
}

export function OgMark() {
  return (
    <svg width="54" height="54" viewBox="0 0 64 64">
      <path fill={OG.INK} d={hawk.head} />
      <path fill={OG.TERRACOTTA} d={hawk.beak} />
      <circle cx={hawk.eye.cx} cy={hawk.eye.cy} r={hawk.eye.r} fill={OG.TERRACOTTA} />
      <path fill={OG.INK} d={hawk.brow} />
      <circle cx={hawk.pupil.cx} cy={hawk.pupil.cy} r={hawk.pupil.r} fill="#141c2e" />
      <circle cx={hawk.glint.cx} cy={hawk.glint.cy} r={hawk.glint.r} fill={OG.IVORY} />
    </svg>
  );
}
