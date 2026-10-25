import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeShiki from "@shikijs/rehype";
import {
  transformerMetaHighlight,
  transformerNotationDiff,
  transformerNotationHighlight,
} from "@shikijs/transformers";
import type { ShikiTransformer } from "shiki";
import type { Element, Root, Text } from "hast";
import { visit } from "unist-util-visit";

export type TocItem = { id: string; text: string; depth: 2 | 3 };

const textOf = (node: Element | Text): string =>
  node.type === "text" ? node.value : node.children.map((c) => (c.type === "element" || c.type === "text" ? textOf(c) : "")).join("");

/** Puts the language and an optional `title="…"` from the code fence meta on the <pre>. */
const transformerFenceMeta: ShikiTransformer = {
  name: "fence-meta",
  pre(node) {
    const raw = (this.options.meta?.__raw as string | undefined) ?? "";
    const title = raw.match(/title="([^"]+)"/)?.[1];
    if (title) node.properties["data-title"] = title;
    if (/(^|\s)wrap(\s|$)/.test(raw)) node.properties["data-wrap"] = "";
    node.properties["data-lang"] = this.options.lang;
  },
};

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const mix = (hex: string, to: number, t: number) =>
  "#" + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - t) + to * t).toString(16).padStart(2, "0")).join("");

/** Nudges a token colour towards black (light theme) or white (dark theme) until it reads at 4.5:1 on every background. */
function readable(hex: string, bgs: string[], towards: 0 | 255) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  for (let t = 0; t <= 1; t += 0.04) {
    const c = mix(hex, towards, t);
    if (bgs.every((bg) => contrast(c, bg) >= 4.5)) return c;
  }
  return hex;
}

/**
 * The vitesse themes have a few soft token colours (comments, numbers) below WCAG AA on our code
 * backgrounds, and some are see-through. Each one becomes opaque and is checked against the plain,
 * highlighted and diff line colours of each theme.
 */
const LIGHT_BGS = ["#eef1f5", "#dce2ea", "#ebe6e7", "#e3ebe8", "#ece5e9"];
const DARK_BGS = ["#0f1726", "#1e2a42", "#2b2731", "#17283a", "#2a2236"];

const transformerReadableColors: ShikiTransformer = {
  name: "readable-colors",
  span(node) {
    const style = node.properties.style;
    if (typeof style !== "string") return;
    node.properties.style = style
      .replace(/--shiki-light:(#[0-9a-fA-F]{6})(?:[0-9a-fA-F]{2})?/, (_, c: string) => `--shiki-light:${readable(c, LIGHT_BGS, 0)}`)
      .replace(/--shiki-dark:(#[0-9a-fA-F]{6})(?:[0-9a-fA-F]{2})?/, (_, c: string) => `--shiki-dark:${readable(c, DARK_BGS, 255)}`);
  },
};

export async function renderMdx(source: string) {
  const toc: TocItem[] = [];
  const collectToc = () => (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if ((node.tagName === "h2" || node.tagName === "h3") && node.properties.id) {
        toc.push({ id: String(node.properties.id), text: textOf(node), depth: node.tagName === "h2" ? 2 : 3 });
      }
    });
  };

  const { default: Content } = await evaluate(source, {
    ...runtime,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      collectToc,
      [
        rehypeShiki,
        {
          themes: { light: "vitesse-light", dark: "vitesse-dark" },
          defaultColor: false,
          defaultLanguage: "text",
          fallbackLanguage: "text",
          transformers: [
            transformerFenceMeta,
            transformerMetaHighlight(),
            transformerNotationHighlight(),
            transformerNotationDiff(),
            transformerReadableColors,
          ],
        },
      ],
    ],
  });

  return { Content, toc };
}
