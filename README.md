# Dev Ledger

**Engineering under the hood: understand the systems behind the code you write every day.**

A running record of backend engineering: practical, interactive deep dives for
developers, from students to seniors. Every article starts with something you
already use, such as an error, a library or a command, and goes underneath far
enough that experienced engineers still learn something.

**Read it:** <https://adarshdebata.github.io/dev-ledger/>

## What's inside

- **Five series, one hundred questions**: the web, the tools we install, Docker,
  databases and distributed systems.
- **Two chains** that follow a single thing hop by hop:
  [Follow One Request](https://adarshdebata.github.io/dev-ledger/chains/request/)
  and [Follow One Payment](https://adarshdebata.github.io/dev-ledger/chains/payment/).
- **Interactive teaching components**: animated sequence diagrams, simulators
  such as the CORS playground, prediction checks, and a five-question summary at
  the end of every article.

## Stack

- [Next.js](https://nextjs.org) App Router with static export, deployed to GitHub Pages
- MDX articles compiled at build time, with [Shiki](https://shiki.style) highlighting
- [Tailwind CSS](https://tailwindcss.com) and [Motion](https://motion.dev) for animation
  (reduced-motion aware)
- [Pagefind](https://pagefind.app) static search, RSS feed, sitemap and per-article
  Open Graph images

## Running it locally

Requires Node.js 22+ and pnpm.

```bash
pnpm install
pnpm dev     # http://localhost:3000/  (the /dev-ledger base path applies only to production builds)
pnpm build   # static site in out/, plus the search index
```

Search only works after `pnpm build`, because the Pagefind index is generated from
the built pages. To preview the build, serve `out/` so that it's reachable under
`/dev-ledger/`.

## Writing an article

Each article is a folder: `content/posts/<slug>/index.mdx`, with any images
(WebP, around 150 KB at most) next to it, referenced as `./image.webp`.

```yaml
---
title: "Your Browser Just Blocked Your Request. Why?"
subtitle: "Postman says 200 OK. Chrome says CORS error. Same request — so what's actually going on?"
date: 2026-10-05
series: 1            # 1–5
roadmap: [9, 10, 11] # roadmap items this article covers
chain: request       # optional: request | payment
tags: [cors, http]   # lowercase-kebab-case
summary: "One or two sentences for cards, RSS and search results."
cover: ./cover.webp  # optional
---
```

Components available inside MDX live in [`components/mdx/`](components/mdx):
`Callout`, `Steps`/`Step`, `CodeTabs`, `Compare`, `DevTools`, `Predict`,
`SequenceDiagram`, `FiveQuestions`, and article-specific widgets such as
`CorsPlayground`. Code fences accept `title="file.js"`, line highlights like
`{2,4-6}`, `// [!code ++]` diff markers and a `wrap` flag.

Keep the writing plain: short sentences, everyday words. Wrap the first use of a
technical word in `<Term id="origin">origins</Term>` to show a definition on hover
or tap; definitions live in [`lib/glossary.ts`](lib/glossary.ts). Use
`<Callout type="story">` for a "think of it like this" analogy.

## Deployment

Pushing to `main` builds the site and deploys it with GitHub Actions
([workflow](.github/workflows/deploy.yml)). Pull requests are built but not
deployed. In the repository settings, **Pages → Source** must be set to
**GitHub Actions**.

## Licences

- Articles in [`content/`](content): [CC BY 4.0](content/LICENSE.md)
- Code, including code samples: [MIT](LICENSE)

Corrections are welcome; see [CONTRIBUTING.md](CONTRIBUTING.md).
