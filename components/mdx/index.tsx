import type { MDXComponents } from "mdx/types";
import { withBase } from "@/lib/site";
import { Callout, CodeBlock, Compare, DevTools, FiveQuestions, H2, H3, SmartLink, Step, Steps, Table } from "./basics";
import { CodeTabs, Predict } from "./client-bits";
import { DnsLookup } from "./dns";
import { Interview, Question } from "./interview";
import { RequestJourney } from "./journey";
import { CorsPlayground, HelmetLab } from "./lazy";
import { Quiz } from "./quiz";
import { OriginCompare } from "./origin-compare";
import { SequenceDiagram } from "./sequence-diagram";
import { Term } from "./term";
import { TimingTab } from "./timing";
import { UrlAnatomy } from "./url-anatomy";

/** Component map for a post or case study. Relative image paths resolve to its own folder. */
export function mdxComponents(slug: string, section: "posts" | "case-studies" = "posts"): MDXComponents {
  return {
    h2: H2,
    h3: H3,
    a: SmartLink,
    pre: CodeBlock,
    table: Table,
    img: ({ src = "", alt = "", ...rest }) => (
      <img
        src={typeof src === "string" && src.startsWith("./") ? withBase(`/${section}/${slug}/${src.slice(2)}`) : src}
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
    Term,
    CorsPlayground,
    HelmetLab,
    RequestJourney,
    DnsLookup,
    TimingTab,
    Quiz,
    Interview,
    Question,
  };
}
