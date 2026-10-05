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
  ["What problem does this solve?", "Why the thing exists at all. Nothing is installed for no reason."],
  ["What does the developer see?", "The error, the log line or the behaviour you actually run into."],
  ["What is actually happening underneath?", "The mechanism, step by step, often with something you can poke at."],
  ["What breaks when it fails?", "The failure modes that show up in production, and how to recognise them."],
  ["What misconception do developers commonly have?", "The confident wrong idea worth unlearning."],
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
            <strong>Dev Ledger</strong> is where I write down how the systems we use every day actually work. Every
            article starts with something ordinary: an error message, a library you installed, a command you run
            without thinking. Then it goes underneath, far enough that a student can follow from the first line and an
            experienced engineer still finds something new.
          </p>
          <p>
            There are no beginner or advanced labels here. The depth grows inside each article, so you can stop
            wherever you have what you came for.
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
            Each one ends with those five answers in a single table, so the whole idea fits on one screen when you
            come back to it later.
          </p>
          <h2>Who writes it</h2>
          <p>
            I&apos;m {site.author.name}, a backend developer working in fintech and digital payments, mostly with
            Node.js and event-driven microservices. Payments are a good teacher: retries, timeouts and duplicates stop
            being theory very quickly. A lot of what you read here comes from learning those lessons, written up
            generically so anyone can use them.
          </p>
          <h2>Reading, reusing, correcting</h2>
          <p>
            Articles are licensed <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> and code is{" "}
            <a href={`${site.repo}/blob/main/LICENSE`}>MIT</a>, so you&apos;re free to reuse both with credit. If you
            spot a mistake, the whole site is <a href={site.repo}>open source</a>: a pull request is the fastest way
            to fix it.
          </p>
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <a
            href={site.author.github}
            className="block rounded-2xl border border-line bg-card p-5 shadow-card transition-colors hover:border-line-strong"
          >
            <p className="text-xs text-subtle">GitHub</p>
            <p className="mt-1 font-semibold">@adarshdebata →</p>
          </a>
          <Link
            href="/chains/request/"
            className="block rounded-2xl border border-line bg-card p-5 shadow-card transition-colors hover:border-line-strong"
          >
            <p className="text-xs text-subtle">Start here</p>
            <p className="mt-1 font-semibold">Follow One Request →</p>
          </Link>
        </aside>
      </div>
    </>
  );
}
