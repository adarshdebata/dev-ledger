# Contributing to Dev Ledger

Thanks for reading closely enough to want to fix something. Dev Ledger is a
personal blog, so new articles are written by the author, but corrections and
improvements are very welcome.

## What helps most

- **Technical corrections.** A wrong header name, an outdated browser
  behaviour, a code sample that doesn't run. Please link a source (a spec, MDN,
  official docs) so the fix can be checked quickly.
- **Typos and unclear sentences.**
- **Accessibility and layout bugs**, especially on small screens.
- **Broken links.**

For anything larger, such as a new interactive component or a restructured
section, open an issue first so we can agree on it before you spend time.

## How to propose a change

1. Fork the repository and create a branch from `main`.
2. Make your change. Each article lives in `content/posts/<slug>/index.mdx`;
   the "Suggest an edit" link at the bottom of every article opens it directly.
3. Run `pnpm install` and `pnpm build` to make sure the site still builds.
4. Open a pull request against `main` describing what changed and why.

`main` is protected, so every change arrives through a reviewed pull request.

## House style for articles

- Start from something developers already use or run into, then go underneath.
- Every article answers five questions and ends with the `FiveQuestions` table:
  what problem it solves, what the developer sees, what happens underneath,
  what breaks when it fails, and the common misconception.
- No "beginner", "intermediate" or "senior" labels. Depth grows inside the article.
- Titles are questions people actually ask, not topic names.
- Keep examples generic: `example.com` domains, made-up IDs, no real company
  names, figures or configurations.

## Licences

By contributing you agree that changes to article text are licensed
[CC BY 4.0](content/LICENSE.md) and changes to code are licensed [MIT](LICENSE).
