import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Avatar, DevCard } from "@/components/author";
import { PageHeader } from "@/components/page-header";
import { authors } from "@/lib/authors";
import { contributorStats } from "@/lib/git-meta";
import { getPost } from "@/lib/posts";
import { alternates, currentWeek, site, weekName } from "@/lib/site";

const n = (x: number) => x.toLocaleString("en-GB");

export const metadata: Metadata = {
  title: "About",
  description: `About ${site.name} and its author, ${site.author.name}.`,
  alternates: alternates("/about/"),
};

const questions = [
  ["What problem does this solve?", "Why the thing exists at all."],
  ["What does the developer see?", "The error message or behaviour you actually run into."],
  ["What is actually happening underneath?", "How it works, step by step, often with something you can try."],
  ["What breaks when it fails?", "What goes wrong in real systems, and how to spot it."],
  ["What do developers often get wrong?", "The common wrong idea worth unlearning."],
];

/** What this blog does that docs and tutorials don't. */
const differences = [
  ["Docs say what a thing does.", "These posts show what happens underneath, and what breaks when it goes wrong."],
  ["You can try it.", "Step-by-step diagrams and playgrounds let you change one thing and watch what happens."],
  ["Every claim is checked.", "Error messages and behaviour are tested in a real browser, not copied from somewhere else."],
  ["It makes you ask why.", "You predict before you read on, and every post ends with a quiz and interview questions."],
];

const H2 = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <h2 id={id} className="mt-0 scroll-mt-28 text-3xl leading-tight font-semibold tracking-[-0.03em]">
    {children}
  </h2>
);

export default function AboutPage() {
  const stats = contributorStats();
  const statsFor = (id: string) => stats.find((s) => s.author?.id === id);
  // People with commits but no profile in content/authors.json still get credit.
  const others = stats.filter((s) => !s.author);
  const start = getPost("one-request-seven-stops");

  return (
    <>
      <PageHeader eyebrow="About" title="A running record of backend engineering">
        {site.hook}
      </PageHeader>

      <div className="container-page space-y-20 py-14">
        <section aria-labelledby="why">
          <H2 id="why">Why another blog?</H2>
          <p className="mt-4 max-w-3xl text-[17px] leading-relaxed text-muted">
            <strong className="text-fg">Dev Ledger</strong> explains how the systems we use every day really work, in plain
            words. Every article starts with something ordinary, like an error message, a library you installed or a command
            you run without thinking. Then it goes one step deeper at a time. A student can follow it from the first line, and
            an experienced engineer should still learn something new.
          </p>
          <ul className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2">
            {differences.map(([lead, rest]) => (
              <li key={lead} className="bg-card px-6 py-5">
                <p className="font-semibold">{lead}</p>
                <p className="mt-1 text-[15px] leading-relaxed text-muted">{rest}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="who-writes-it">
          <H2 id="who-writes-it">Who writes it</H2>
          <div className="mt-8 grid grid-cols-1 gap-6">
            {authors.map((a, i) => (
              <DevCard key={a.id} author={a} stats={statsFor(a.id)} status={i === 0 ? `Writing ${weekName(currentWeek)}` : undefined} />
            ))}
          </div>
          <p id="contributions" className="mt-5 max-w-3xl scroll-mt-28 text-[13.5px] leading-relaxed text-subtle">
            Counted from the Git history every time the site is built. <strong className="text-muted">Articles</strong> are the
            ones a person first wrote. <strong className="text-muted">Commits</strong> and{" "}
            <strong className="text-muted">lines changed</strong> cover the whole project, leaving out merge commits and the
            lockfile. Lines changed show how much work went in, not how valuable it was, so treat them as a rough guide.
          </p>
          {others.length > 0 && (
            <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" aria-label="Other contributors">
              {others.map((c) => (
                <li key={c.name} className="flex items-center gap-4 rounded-2xl border border-line bg-card p-5">
                  <Avatar person={c} size={44} />
                  <div className="min-w-0">
                    <p className="font-semibold">{c.name}</p>
                    <p className="mt-1 font-mono text-[12.5px] text-muted">
                      {n(c.articles)} articles · {n(c.commits)} commits · +{n(c.added)} −{n(c.removed)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="five-questions" className="prose-ledger prose max-w-3xl">
          <H2 id="five-questions">Every article answers five questions</H2>
          <p>
            There are no beginner or advanced labels here. Each article gets deeper as it goes, so you can stop as soon as you
            have what you came for. Hover over (or tap) an underlined word to see what it means.
          </p>
          <ol>
            {questions.map(([q, a]) => (
              <li key={q}>
                <strong>{q}</strong> {a}
              </li>
            ))}
          </ol>
          <p>
            Each article ends with those five answers in one table, so the whole idea fits on one screen when you come back
            later.
          </p>
        </section>

        <section aria-labelledby="reuse" className="prose-ledger prose max-w-3xl">
          <H2 id="reuse">Reading, reusing, correcting</H2>
          <p>
            Articles are licensed <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> and code is{" "}
            <a href={`${site.repo}/blob/main/LICENSE`}>MIT</a>, so you can reuse both as long as you give credit. If you spot a
            mistake, the whole site is <a href={site.repo}>open source</a>, and a pull request is the fastest way to fix it.
          </p>
        </section>

        {start && (
          <Link
            href={`/posts/${start.slug}/`}
            className="group flex flex-wrap items-baseline justify-between gap-3 border-t border-line pt-10 text-xl font-semibold tracking-tight"
          >
            <span>
              New here? Start with <span className="text-accent">{start.title.split(":")[0]}</span>
            </span>
            <ArrowRight className="size-5 self-center text-accent transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>
    </>
  );
}
