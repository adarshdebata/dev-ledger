/**
 * One package.json ("express": "^5.1.0"), installed a month apart. The versions are real: we ran
 * `npm install --before=2026-10-01` and `npm install --before=2026-11-01` (npm 11.19), which resolve
 * every range as if it were that day, and compared the two lockfiles.
 */

export type Col = "oct" | "nov" | "ci";

export const COLS: { id: Col; label: string; sub: string }[] = [
  { id: "oct", label: "1 Oct: you install", sub: "npm install" },
  { id: "nov", label: "1 Nov: CI, no lockfile", sub: "npm install" },
  { id: "ci", label: "1 Nov: CI, with lockfile", sub: "npm ci" },
];

export type Pkg = { name: string; oct: string; nov: string; note?: string };

export const PKGS: Pkg[] = [
  { name: "express", oct: "5.2.1", nov: "5.3.0", note: "the one you asked for" },
  { name: "qs", oct: "6.16.0", nov: "6.17.1" },
  { name: "body-parser", oct: "2.3.0", nov: "2.4.0" },
  { name: "content-disposition", oct: "1.1.0", nov: "2.0.1", note: "a new major version" },
  { name: "content-type", oct: "1.0.5", nov: "2.1.0", note: "a new major version" },
  { name: "debug", oct: "4.4.3", nov: "4.4.3" },
  { name: "send", oct: "1.2.1", nov: "1.2.1" },
];

export const TOTALS = { oct: 68, nov: 65, changed: 10 };

export type LockStep = {
  title: string;
  caption: string;
  /** The day the timeline has reached: 0 = 1 Oct, 1 = during October, 2 = 1 Nov. */
  day: 0 | 1 | 2;
  /** Which columns of the table are filled in. */
  show: Col[];
  /** Highlight what changed between October and November in the no-lockfile column. */
  diff?: boolean;
  term?: string[];
  bad?: boolean;
};

export const STEPS: LockStep[] = [
  {
    title: "1 October: you install",
    caption:
      "npm resolves `^5.1.0` against what the registry holds that day: express 5.2.1, and 68 packages in all. It writes package-lock.json with each exact version and its hash. You test, it works, you commit.",
    day: 0,
    show: ["oct"],
    term: ["$ npm install", "added 68 packages in 16s"],
  },
  {
    title: "October: new versions are published",
    caption:
      "Your package.json doesn't change, but the registry does. express 5.3.0 comes out, qs gets two releases, and express's new version asks for content-disposition 2. Nobody on your team did anything.",
    day: 1,
    show: ["oct"],
    term: ["# published during October:", "# express 5.3.0, body-parser 2.4.0, qs 6.17.x,", "# content-disposition 2.0.1, content-type 2.1.0, …"],
  },
  {
    title: "1 November: CI installs without the lockfile",
    caption:
      "Same package.json, a month later. Without a lockfile, npm resolves every range again and gets today's newest matches. 10 of the 68 entries differ, two of them new major versions you never chose. Nothing in your diff explains it.",
    day: 2,
    show: ["oct", "nov"],
    diff: true,
    term: ["$ npm install", "added 65 packages in 6s", "# 10 of 68 entries differ from the October install"],
    bad: true,
  },
  {
    title: "1 November: CI installs from the lockfile",
    caption:
      "With package-lock.json committed and `npm ci`, CI ignores the ranges and installs exactly what's locked, checking every hash. The tree is the one you tested on 1 October, to the byte.",
    day: 2,
    show: ["oct", "nov", "ci"],
    diff: true,
    term: ["$ npm ci", "added 68 packages in 8s", "# 0 of 68 entries differ from the October install"],
  },
  {
    title: "Someone edits package.json by hand",
    caption:
      "A teammate adds `cors` to package.json but doesn't run `npm install`, so the lockfile doesn't know about it. `npm ci` refuses to guess: it stops instead of installing something nobody tested.",
    day: 2,
    show: ["oct", "nov", "ci"],
    diff: true,
    term: [
      "$ npm ci",
      "npm error code EUSAGE",
      "npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync. Please update your lock file with `npm install` before continuing.",
      "npm error Missing: cors@2.8.6 from lock file",
      "npm error Missing: object-assign@4.1.1 from lock file",
    ],
    bad: true,
  },
];
