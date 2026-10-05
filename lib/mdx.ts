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
          ],
        },
      ],
    ],
  });

  return { Content, toc };
}
