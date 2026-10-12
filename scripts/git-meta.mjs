// Reads the Git history once, before dev/build, and writes .generated/git-meta.json:
//   - per article: who first committed it, who last changed it and when, how many revisions
//   - per contributor: commits, lines added/removed, and articles they first wrote
// File-level history is used (git log --follow -- <file>), so the person who last pushed
// is never credited with articles they didn't touch. Merge commits and the lockfile are skipped.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT_FILE = path.join(ROOT, ".generated", "git-meta.json");
const CONTENT_DIRS = ["content/posts", "content/case-studies"];

const git = (...args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

function write(meta) {
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(meta, null, 2));
}

let shallow = false;
try {
  git("rev-parse", "--is-inside-work-tree");
  shallow = git("rev-parse", "--is-shallow-repository").trim() === "true";
} catch {
  write({ available: false, shallow: false, files: {}, contributors: [] });
  console.log("git-meta: no Git repository, attribution falls back to frontmatter");
  process.exit(0);
}

const person = (name, email) => ({ name, email: email.toLowerCase() });

// Per content file
const files = {};
for (const dir of CONTENT_DIRS) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) continue;
  for (const slug of fs.readdirSync(abs)) {
    const rel = `${dir}/${slug}/index.mdx`;
    if (!fs.existsSync(path.join(ROOT, rel))) continue;
    const lines = git("log", "--follow", "--format=%H%x09%an%x09%ae%x09%aI", "--", rel).trim().split("\n").filter(Boolean);
    if (lines.length === 0) continue; // not committed yet
    const commits = lines.map((l) => {
      const [hash, name, email, date] = l.split("\t");
      return { hash, ...person(name, email), date };
    });
    const first = commits[commits.length - 1];
    const last = commits[0];
    const byEmail = new Map();
    for (const c of commits) byEmail.set(c.email, { name: c.name, email: c.email, commits: (byEmail.get(c.email)?.commits ?? 0) + 1 });
    files[rel] = {
      // In a shallow clone the oldest commit we can see isn't the real first one.
      created: shallow ? null : { name: first.name, email: first.email, date: first.date },
      updated: { name: last.name, email: last.email, date: last.date },
      revisions: shallow ? null : commits.length,
      contributors: [...byEmail.values()],
    };
  }
}

// Per contributor, across the whole repository
const stats = new Map();
let current = null;
const log = git("log", "--no-merges", "--numstat", "--format=@%x09%an%x09%ae", "--", ".", ":(exclude)pnpm-lock.yaml");
for (const line of log.split("\n")) {
  if (line.startsWith("@\t")) {
    const [, name, email] = line.split("\t");
    const key = email.toLowerCase();
    current = stats.get(key) ?? { ...person(name, email), commits: 0, added: 0, removed: 0, articles: 0 };
    current.commits++;
    stats.set(key, current);
  } else if (current && /^\d+\t\d+\t/.test(line)) {
    const [added, removed] = line.split("\t");
    current.added += Number(added);
    current.removed += Number(removed);
  }
}
for (const f of Object.values(files)) {
  if (f.created && stats.has(f.created.email)) stats.get(f.created.email).articles++;
}

const contributors = [...stats.values()].sort((a, b) => b.articles - a.articles || b.added + b.removed - (a.added + a.removed));
write({ available: true, shallow, files, contributors });
console.log(`git-meta: ${Object.keys(files).length} article(s), ${contributors.length} contributor(s)${shallow ? " (shallow clone)" : ""}`);
