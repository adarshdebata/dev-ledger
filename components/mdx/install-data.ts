/**
 * What `npm install` does for a project that depends on express, step by step. Every terminal line is
 * real output from npm 11.19 on Node.js 24 (Windows), captured with --loglevel http and --timing:
 * "first" is a cold cache with no lockfile, "again" is the same project reinstalled with both in place.
 * The failures were reproduced on purpose (the office-proxy one with a local server that re-signs TLS).
 */

export const STOPS = [
  { id: "project", name: "Your project", sub: "package.json" },
  { id: "registry", name: "Registry", sub: "registry.npmjs.org" },
  { id: "cache", name: "npm cache", sub: "npm-cache/_cacache" },
  { id: "modules", name: "node_modules", sub: "on disk" },
] as const;

export type StopId = (typeof STOPS)[number]["id"];
export type Run = "first" | "again";
export type Break = "none" | "proxy" | "peer" | "tamper";

export const RUNS: { id: Run; label: string }[] = [
  { id: "first", label: "First install" },
  { id: "again", label: "Again, with cache + lockfile" },
];

/** Each break makes one step fail; the player stops there. */
export const BREAKS: { id: Break; label: string; at: number }[] = [
  { id: "none", label: "Nothing", at: 0 },
  { id: "proxy", label: "Office proxy", at: 2 },
  { id: "peer", label: "Peer conflict", at: 3 },
  { id: "tamper", label: "Changed tarball", at: 6 },
];

/** How far the tree has grown: 0 = just the range, 1 = express resolved, 3 = all 65 packages. */
export type Growth = 0 | 1 | 3;

type ByRun<T> = T | Record<Run, T>;
export const pick = <T,>(v: ByRun<T>, run: Run): T =>
  v !== null && typeof v === "object" && !Array.isArray(v) && "first" in (v as object) ? (v as Record<Run, T>)[run] : (v as T);

export type InstallStep = {
  title: ByRun<string>;
  /** Where the action is, and the trip it makes (from → to), if any. */
  at: ByRun<StopId>;
  trip?: ByRun<[StopId, StopId] | null>;
  tree: Growth;
  /** What's on disk after this step: nothing, the folders, or the folders plus a fresh lockfile. */
  disk: 0 | 1 | 2;
  caption: ByRun<string>;
  term: ByRun<string[]>;
  /** What this step shows when its break is switched on. */
  fail?: { caption: string; term: string[] };
};

export const STEPS: InstallStep[] = [
  {
    title: "npm reads package.json",
    at: "project",
    tree: 0,
    disk: 0,
    caption: {
      first:
        "Your package.json doesn't name a version. `^5.1.0` is a range: 5.1.0 or anything newer below 6.0.0. Which exact version you get depends on what the registry holds today.",
      again:
        "This time there's a package-lock.json next to package.json. It names the exact version of every package in the tree, where to download it, and the hash its bytes must have.",
    },
    term: {
      first: ["$ npm install", '# package.json: "express": "^5.1.0"', "# no package-lock.json yet"],
      again: ["$ npm install", '# package.json: "express": "^5.1.0"', '# package-lock.json: express 5.3.0, express-5.3.0.tgz, "sha512-qCqy1xSo…"'],
    },
  },
  {
    title: { first: "It asks the registry what versions exist", again: "No need to ask the registry" },
    at: { first: "registry", again: "project" },
    trip: { first: ["project", "registry"], again: null },
    tree: 1,
    disk: 0,
    caption: {
      first:
        "npm downloads express's metadata from the registry: one document listing every version ever published. It picks the newest version inside the range: 5.3.0.",
      again: "The lockfile already says express@5.3.0, so npm doesn't fetch any metadata. Not for express, and not for the other 64 packages.",
    },
    term: {
      first: ["npm http fetch GET 200 https://registry.npmjs.org/express 547ms (cache miss)"],
      again: ["# 0 metadata requests: the versions come from package-lock.json"],
    },
    fail: {
      caption:
        "Behind a firewall that inspects HTTPS, the registry's certificate arrives re-signed by the company's own authority, which Node.js doesn't trust. npm stops before it learns a single version.",
      term: [
        "npm error code SELF_SIGNED_CERT_IN_CHAIN",
        "npm error errno SELF_SIGNED_CERT_IN_CHAIN",
        "npm error request to https://registry.npmjs.org/express failed, reason: self-signed certificate in certificate chain",
      ],
    },
  },
  {
    title: { first: "Every dependency has dependencies", again: "The tree comes straight from the lockfile" },
    at: { first: "registry", again: "project" },
    trip: { first: ["project", "registry"], again: null },
    tree: 3,
    disk: 0,
    caption: {
      first:
        "express 5.3.0 lists 28 dependencies, each with its own ranges. npm fetches metadata for every one, then for theirs, until nothing new turns up: 65 packages from one line. On a cold install this is the slowest part.",
      again: "npm builds the whole 65-package tree from the lockfile without a single network call. The step that took six seconds now takes 47 milliseconds.",
    },
    term: {
      first: ["npm http fetch GET 200 https://registry.npmjs.org/body-parser 418ms (cache miss)", "# …and so on, for all 65 packages", "npm timing idealTree:buildDeps Completed in 5968ms"],
      again: ["npm timing idealTree Completed in 47ms"],
    },
    fail: {
      caption:
        "Two packages disagree, and npm won't build a tree it knows is wrong. In this reproduction, react-dom 18 needs react 18 as a peer, but the project asks for react 17. Nothing has been downloaded yet.",
      term: [
        "npm error code ERESOLVE",
        "npm error ERESOLVE unable to resolve dependency tree",
        "npm error Found: react@17.0.2",
        "npm error Could not resolve dependency:",
        'npm error peer react@"^18.3.1" from react-dom@18.3.1',
      ],
    },
  },
  {
    title: "It compares that tree with the disk",
    at: "modules",
    tree: 3,
    disk: 0,
    caption:
      "npm now knows the tree it wants. It compares it with what's already in node_modules to work out what to add, change and remove. The folder is empty, so all 65 packages need adding.",
    term: ["npm timing reify:diffTrees Completed in 1ms", "# 65 to add, 0 to change, 0 to remove"],
  },
  {
    title: "Each tarball: the cache first, then the registry",
    at: "cache",
    trip: { first: ["registry", "cache"], again: null },
    tree: 3,
    disk: 0,
    caption: {
      first:
        "A package version ships as a tarball, a compressed archive. npm looks in its cache first, where files are stored under their hash. Nothing's there yet, so all 65 come from the registry, and npm keeps a copy of each.",
      again: "Every tarball is already in the cache from the first install, so nothing is downloaded: 65 cache hits, most in 0 ms.",
    },
    term: {
      first: ["npm http fetch GET 200 https://registry.npmjs.org/media-typer/-/media-typer-1.1.1.tgz 756ms (cache miss)", "# …65 tarballs downloaded and stored in the cache"],
      again: ["npm http cache unpipe@https://registry.npmjs.org/unpipe/-/unpipe-1.0.0.tgz 0ms (cache hit)", "# …65 tarballs, all from the cache"],
    },
  },
  {
    title: "Every tarball's fingerprint is checked",
    at: "cache",
    tree: 3,
    disk: 0,
    caption:
      "Each package comes with a sha512 hash of its tarball, from the registry's metadata or the lockfile. npm hashes the bytes it actually has and compares. Same hash means same bytes: nothing was changed on the way.",
    term: ["# ms@2.1.3  expected  sha512-6FlzubTLZG3J2a/NVCAle…", "#           got       sha512-6FlzubTLZG3J2a/NVCAle…  ✓"],
    fail: {
      caption:
        "The bytes don't match the hash in the lockfile. npm retries twice, in case a download was cut short, then refuses to install a file it can't vouch for.",
      term: [
        "npm warn tarball tarball data for ms@https://registry.npmjs.org/ms/-/ms-2.1.3.tgz (sha512-Bwc…) seems to be corrupted. Trying again.",
        "npm error code EINTEGRITY",
        "npm error sha512-Bwc… integrity checksum failed when using sha512: wanted sha512-Bwc… but got sha512-6Flz…== (2967 bytes)",
      ],
    },
  },
  {
    title: "Tarballs are unpacked into node_modules",
    at: "modules",
    trip: ["cache", "modules"],
    tree: 3,
    disk: 1,
    caption:
      "npm unpacks each tarball into its own folder. Most land side by side at the top of node_modules. Commands that packages ship, like tsc or jest, get a small launcher in node_modules/.bin, which is how npm run finds them.",
    term: { first: ["npm timing reify:unpack Completed in 2852ms", "# node_modules/express, node_modules/body-parser, … 65 folders"], again: ["npm timing reify:unpack Completed in 3143ms", "# node_modules/express, node_modules/body-parser, … 65 folders"] },
  },
  {
    title: "Install scripts run, or get blocked",
    at: "modules",
    tree: 3,
    disk: 1,
    caption:
      "Some packages ask to run a command once they're unpacked, often to fetch a native binary. None of express's 65 do. Add esbuild and npm 11 runs its script and warns; npm 12 blocks it until you approve that package.",
    term: [
      "# with esbuild added, npm 11.19:",
      "npm warn install-scripts 1 package has install scripts not yet covered by allowScripts:",
      "# npm 12.2:",
      "npm warn install-scripts 1 package had install scripts blocked because they are not covered by allowScripts:",
    ],
  },
  {
    title: { first: "The lockfile is written, then the audit runs", again: "The audit runs, and npm is done" },
    at: "project",
    trip: ["project", "registry"],
    tree: 3,
    disk: 2,
    caption: {
      first:
        "npm writes package-lock.json: the exact version, download address and hash of all 65 packages, so the next install builds this same tree. Then the audit sends the list to the registry and reports known vulnerabilities.",
      again: "The lockfile already matched, so it stays as it was. The audit still asks the registry about known vulnerabilities, since new ones are published every day.",
    },
    term: {
      first: ["npm http fetch POST 200 https://registry.npmjs.org/-/npm/v1/security/advisories/bulk 859ms", "added 65 packages, and audited 66 packages in 14s", "found 0 vulnerabilities"],
      again: ["npm http fetch POST 200 https://registry.npmjs.org/-/npm/v1/security/advisories/bulk 857ms", "added 65 packages, and audited 66 packages in 7s", "found 0 vulnerabilities"],
    },
  },
];

/** The tree as it grows: a few of express's 28 dependencies, then a few of theirs. */
export const TREE = {
  range: "express ^5.1.0",
  resolved: "express@5.3.0",
  direct: ["body-parser", "debug", "send", "router", "qs", "accepts", "cookie", "finalhandler"],
  moreDirect: 20,
  deep: ["ms", "iconv-lite", "side-channel", "mime-db", "raw-body", "negotiator", "get-intrinsic", "wrappy"],
  total: 65,
};
