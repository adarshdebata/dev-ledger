/**
 * npm's node_modules beside pnpm's, for the same package.json ("express": "^4"). The layout, the store
 * hashes and every message are real: pnpm 12.23 and npm 11.19 on Windows (where pnpm's folder links are
 * junctions), checked with `fsutil hardlink list`.
 */

export type Box = { id: string; x: number; y: number; w: number; label: string; ver?: string; kind: "dir" | "link" | "file" | "ghost" | "hash" | "head" | "more" };

/** Everything that can appear in the picture. Coordinates are in a 1000 × 470 viewBox. */
export const BOXES: Box[] = [
  // npm: one flat folder of real copies
  { id: "n-head", x: 20, y: 64, w: 250, label: "node_modules/", kind: "head" },
  { id: "n-express", x: 36, y: 96, w: 234, label: "express/", ver: "4.22.3", kind: "dir" },
  { id: "n-debug", x: 36, y: 128, w: 234, label: "debug/", ver: "2.6.9", kind: "dir" },
  { id: "n-bp", x: 36, y: 160, w: 234, label: "body-parser/", ver: "1.20.9", kind: "dir" },
  { id: "n-ms", x: 36, y: 192, w: 234, label: "ms/", ver: "2.0.0", kind: "dir" },
  { id: "n-more", x: 36, y: 224, w: 234, label: "…63 more, all real folders", kind: "more" },
  // pnpm: what your project sees
  { id: "p-head", x: 330, y: 64, w: 170, label: "node_modules/", kind: "head" },
  { id: "p-express", x: 346, y: 96, w: 154, label: "express", kind: "link" },
  { id: "p-pnpm", x: 346, y: 128, w: 154, label: ".pnpm/", kind: "dir" },
  { id: "p-ghost", x: 346, y: 160, w: 154, label: "debug (none)", kind: "ghost" },
  // pnpm: the virtual store, one folder per package@version
  { id: "v-head1", x: 540, y: 64, w: 230, label: ".pnpm/express@4.22.3/node_modules/", kind: "head" },
  { id: "v-express", x: 556, y: 96, w: 214, label: "express/", kind: "dir" },
  { id: "v-app", x: 572, y: 128, w: 198, label: "lib/application.js", kind: "file" },
  { id: "v-debuglink", x: 556, y: 160, w: 214, label: "debug", kind: "link" },
  { id: "v-more", x: 556, y: 192, w: 214, label: "accepts, body-parser … 30 links", kind: "more" },
  { id: "v-head2", x: 540, y: 248, w: 230, label: ".pnpm/debug@2.6.9/node_modules/", kind: "head" },
  { id: "v-debug", x: 556, y: 280, w: 214, label: "debug/", kind: "dir" },
  { id: "v-index", x: 572, y: 312, w: 198, label: "src/index.js", kind: "file" },
  { id: "v-mslink", x: 556, y: 344, w: 214, label: "ms", kind: "link" },
  // pnpm: the global store, files named by their hash
  { id: "s-head", x: 806, y: 64, w: 176, label: "pnpm store (v11)", kind: "head" },
  { id: "s-app", x: 806, y: 128, w: 176, label: "files/c0/63277a59…", kind: "hash" },
  { id: "s-index", x: 806, y: 312, w: 176, label: "files/0b/53bc9841…", kind: "hash" },
  // a second project on the same drive
  { id: "o-app", x: 556, y: 410, w: 214, label: "pn2/…/application.js", kind: "file" },
];

export type Arrow = { from: string; to: string; kind: "symlink" | "hardlink" | "require" | "fail" };

export type PnpmStep = {
  title: string;
  caption: string;
  show: string[];
  /** Boxes to light up, and how. */
  lit: Record<string, "on" | "ok" | "bad">;
  arrows: Arrow[];
  term: string[];
};

const NPM = ["n-head", "n-express", "n-debug", "n-bp", "n-ms", "n-more"];
const TOP = ["p-head", "p-express", "p-pnpm"];
const V1 = ["v-head1", "v-express", "v-app", "v-debuglink", "v-more"];
const V2 = ["v-head2", "v-debug", "v-index", "v-mslink"];
const STORE = ["s-head", "s-app", "s-index"];

export const STEPS: PnpmStep[] = [
  {
    title: "Same package.json, two very different folders",
    caption:
      "npm unpacks real copies of all 68 packages, most of them side by side at the top of node_modules. pnpm's node_modules holds exactly what you declared, express, plus a hidden `.pnpm` folder.",
    show: [...NPM, ...TOP],
    lit: { "n-head": "on", "p-head": "on" },
    arrows: [],
    term: ["$ pnpm add express@4", "Packages: +68", "Progress: resolved 68, reused 45, downloaded 23, added 68, done", "dependencies:", "+ express 4.22.3 (5.3.0 is available)"],
  },
  {
    title: "node_modules/express is only a link",
    caption:
      "The express you see at the top is a link, a junction on Windows and a symlink elsewhere. It points into `.pnpm`, where every package version gets a folder of its own, named after it: `express@4.22.3`.",
    show: [...NPM, ...TOP, ...V1],
    lit: { "p-express": "on", "v-express": "on" },
    arrows: [{ from: "p-express", to: "v-express", kind: "symlink" }],
    term: ["$ ls -la node_modules", "express -> …/node_modules/.pnpm/express@4.22.3/node_modules/express"],
  },
  {
    title: "express's dependencies sit right beside it",
    caption:
      "Inside `express@4.22.3/node_modules/` sits express itself, plus a link for each of its own dependencies. `debug` there points at debug's folder, which holds debug plus links to its dependencies, and so on down the tree.",
    show: [...NPM, ...TOP, ...V1, ...V2],
    lit: { "v-debuglink": "on", "v-debug": "on" },
    arrows: [
      { from: "p-express", to: "v-express", kind: "symlink" },
      { from: "v-debuglink", to: "v-debug", kind: "symlink" },
    ],
    term: ["$ ls -la node_modules/.pnpm/express@4.22.3/node_modules", "accepts -> …/.pnpm/accepts@1.3.8/node_modules/accepts", "debug -> …/.pnpm/debug@2.6.9/node_modules/debug", "express"],
  },
  {
    title: "The files are hard links into one store",
    caption:
      "Even the real files aren't copies. `application.js` is a hard link: a second name for a file in pnpm's store, which names every file after a hash of its contents. One file on disk, two names.",
    show: [...NPM, ...TOP, ...V1, ...V2, ...STORE],
    lit: { "v-app": "on", "s-app": "on", "v-index": "on", "s-index": "on" },
    arrows: [
      { from: "v-app", to: "s-app", kind: "hardlink" },
      { from: "v-index", to: "s-index", kind: "hardlink" },
    ],
    term: ["> fsutil hardlink list …\\express\\lib\\application.js", "\\…\\pnpm\\store\\v11\\files\\c0\\63277a59b83dffc0851167…", "\\…\\pn1\\node_modules\\.pnpm\\express@4.22.3\\node_modules\\express\\lib\\application.js"],
  },
  {
    title: "A second project costs almost nothing",
    caption:
      "Install the same package in another project on the same drive and pnpm downloads nothing. It adds more hard links to the files already in the store, so 68 packages take up disk space once, however many projects use them.",
    show: [...NPM, ...TOP, ...V1, ...V2, ...STORE, "o-app"],
    lit: { "o-app": "on", "s-app": "on" },
    arrows: [
      { from: "v-app", to: "s-app", kind: "hardlink" },
      { from: "o-app", to: "s-app", kind: "hardlink" },
    ],
    term: ["Packages are hard linked from the content-addressable store to the virtual store.", "Progress: resolved 68, reused 68, downloaded 0, added 68, done"],
  },
  {
    title: "Your code asks for debug: npm says yes, pnpm says no",
    caption:
      "Your code calls `require('debug')` without declaring debug. In npm's flat folder there it is, hoisted: it works by accident. Your project's node_modules under pnpm has no debug, so Node.js throws.",
    show: [...NPM, ...TOP, "p-ghost", ...V1, ...V2, ...STORE],
    lit: { "n-debug": "ok", "p-ghost": "bad" },
    arrows: [],
    term: ["# npm:  require('debug') → node_modules/debug (2.6.9)", "# pnpm:", "Error: Cannot find module 'debug'", "  code: 'MODULE_NOT_FOUND'"],
  },
  {
    title: "But express's own require('debug') works",
    caption:
      "Node.js follows links to the real folder before it searches, so express's code runs from inside `.pnpm/express@4.22.3/node_modules/express`. Climbing one folder up, it finds the `debug` link sitting next to it.",
    show: [...NPM, ...TOP, ...V1, ...V2, ...STORE],
    lit: { "v-app": "on", "v-debuglink": "ok", "v-debug": "ok" },
    arrows: [
      { from: "v-app", to: "v-debuglink", kind: "require" },
      { from: "v-debuglink", to: "v-debug", kind: "symlink" },
    ],
    term: ["> require.resolve('debug', { paths: [express's real folder] })", "node_modules\\.pnpm\\debug@2.6.9\\node_modules\\debug\\src\\index.js"],
  },
];
