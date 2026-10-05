import type { MDXComponents } from "mdx/types";
import { withBase } from "@/lib/site";
import { Callout, CodeBlock, Compare, DevTools, FiveQuestions, H2, H3, SmartLink, Step, Steps, Table } from "./basics";
import { CodeTabs, Predict } from "./client-bits";
import { CorsPlayground } from "./lazy";
import { OriginCompare } from "./origin-compare";
import { SequenceDiagram } from "./sequence-diagram";
import { UrlAnatomy } from "./url-anatomy";

/** Component map for a post. Relative image paths resolve to that post's folder. */
export function mdxComponents(slug: string): MDXComponents {
  return {
    h2: H2,
    h3: H3,
    a: SmartLink,
    pre: CodeBlock,
    table: Table,
    img: ({ src = "", alt = "", ...rest }) => (
      <img
        src={typeof src === "string" && src.startsWith("./") ? withBase(`/posts/${slug}/${src.slice(2)}`) : src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="rounded-xl border border-line"
        {...rest}
      />
    ),
    Callout,
    Steps,
    Step,
    CodeTabs,
    Predict,
    FiveQuestions,
    Compare,
    DevTools,
    SequenceDiagram,
    OriginCompare,
    UrlAnatomy,
    CorsPlayground,
  };
}
