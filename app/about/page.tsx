import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { alternates, site } from "@/lib/site";

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

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About" title="A running record of backend engineering">
        {site.hook}
      </PageHeader>
      <div className="container-page grid grid-cols-1 gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="prose-ledger prose max-w-2xl">
          <p>
            <strong>Dev Ledger</strong> explains how the systems we use every day really work, in plain words. Every
            article starts with something ordinary, like an error message, a library you installed or a command you
            run without thinking. Then it goes one step deeper at a time. A student can follow it from the first line,
            and an experienced engineer should still learn something new.
          </p>
          <p>
            There are no beginner or advanced labels here. Each article gets deeper as it goes, so you can stop as
            soon as you have what you came for. Hover over (or tap) an underlined word to see what it means.
          </p>
          <h2>Every article answers five questions</h2>
          <ol>
            {questions.map(([q, a]) => (
              <li key={q}>
                <strong>{q}</strong> {a}
              </li>
            ))}
          </ol>
          <p>
            Each article ends with those five answers in one table, so the whole idea fits on one screen when you
            come back later.
          </p>
          <h2>Who writes it</h2>
          <p>
            I&apos;m {site.author.name}, a backend developer working in fintech and digital payments, mostly with
            Node.js and event-driven microservices. Payments teach you quickly that retries, timeouts and duplicates
            are real problems, not theory. Much of what you read here comes from those lessons, written up in a
            general way so anyone can use them.
          </p>
          <h2>Reading, reusing, correcting</h2>
          <p>
            Articles are licensed <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> and code is{" "}
            <a href={`${site.repo}/blob/main/LICENSE`}>MIT</a>, so you can reuse both as long as you give credit. If
            you spot a mistake, the whole site is <a href={site.repo}>open source</a>, and a pull request is the
            fastest way to fix it.
          </p>
        </div>
        <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
          <a
            href={site.author.github}
            className="block rounded-2xl border border-line p-5 transition-colors hover:border-line-strong hover:bg-card"
          >
            <p className="eyebrow text-subtle">GitHub</p>
            <p className="mt-1 font-semibold">@adarshdebata →</p>
          </a>
          <Link
            href="/chains/request/"
            className="block rounded-2xl border border-line p-5 transition-colors hover:border-line-strong hover:bg-card"
          >
            <p className="eyebrow text-subtle">Start here</p>
            <p className="mt-1 font-semibold">Follow One Request →</p>
          </Link>
        </aside>
      </div>
    </>
  );
}
