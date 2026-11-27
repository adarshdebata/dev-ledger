/**
 * How require() finds a package, and where npm puts each copy. The tree is a real install
 * (`npm install express@4 debug@4`, npm 11.19, Node.js 24); every version, path and message is what we saw.
 */

export type RowKind = "dir" | "file" | "nm" | "ghost" | "pkg" | "more";
export type Row = { id: string; depth: number; name: string; ver?: string; kind: RowKind };
export type Mark = "start" | "miss" | "hit" | "warn" | "copy" | "gone";
export type WalkStep = {
  title: string;
  caption: string;
  /** Rows on screen at this step, by id, in display order. */
  rows: string[];
  marks: Record<string, Mark>;
  /** For the lookup mode: the folders searched so far, in order, and what each one gave. */
  tried?: { path: string; found: boolean | null }[];
  term?: string[];
  result?: { ok: boolean; text: string };
};
export type Mode = { id: string; label: string; intro: string; steps: WalkStep[] };

export const ROWS: Record<string, Row> = {
  parent: { id: "parent", depth: 0, name: "…/projects/node_modules/  (a parent folder)", kind: "nm" },
  root: { id: "root", depth: 0, name: "shop-api/", kind: "dir" },
  src: { id: "src", depth: 1, name: "src/", kind: "dir" },
  srcnm: { id: "srcnm", depth: 2, name: "node_modules/", kind: "ghost" },
  routes: { id: "routes", depth: 2, name: "routes/", kind: "dir" },
  routesnm: { id: "routesnm", depth: 3, name: "node_modules/", kind: "ghost" },
  where: { id: "where", depth: 3, name: "where.js", kind: "file" },
  nm: { id: "nm", depth: 1, name: "node_modules/", kind: "nm" },
  debug: { id: "debug", depth: 2, name: "debug/", ver: "4.4.3", kind: "pkg" },
  debug2: { id: "debug2", depth: 2, name: "debug/", ver: "2.6.9", kind: "pkg" },
  debug2ms: { id: "debug2ms", depth: 3, name: "node_modules/ms/", ver: "2.0.0", kind: "pkg" },
  express: { id: "express", depth: 2, name: "express/", ver: "4.22.3", kind: "pkg" },
  exlib: { id: "exlib", depth: 3, name: "lib/application.js", kind: "file" },
  exnm: { id: "exnm", depth: 3, name: "node_modules/", kind: "nm" },
  exdebug: { id: "exdebug", depth: 4, name: "debug/", ver: "2.6.9", kind: "pkg" },
  exms: { id: "exms", depth: 4, name: "ms/", ver: "2.0.0", kind: "pkg" },
  bp: { id: "bp", depth: 2, name: "body-parser/", ver: "1.20.9", kind: "pkg" },
  bpdebug: { id: "bpdebug", depth: 4, name: "node_modules/debug/", ver: "2.6.9", kind: "pkg" },
  bpms: { id: "bpms", depth: 4, name: "node_modules/ms/", ver: "2.0.0", kind: "pkg" },
  fh: { id: "fh", depth: 2, name: "finalhandler/", ver: "1.3.2", kind: "pkg" },
  fhdebug: { id: "fhdebug", depth: 4, name: "node_modules/debug/", ver: "2.6.9", kind: "pkg" },
  fhms: { id: "fhms", depth: 4, name: "node_modules/ms/", ver: "2.0.0", kind: "pkg" },
  send: { id: "send", depth: 2, name: "send/", ver: "0.19.2", kind: "pkg" },
  senddebug: { id: "senddebug", depth: 4, name: "node_modules/debug/", ver: "2.6.9", kind: "pkg" },
  sendms: { id: "sendms", depth: 6, name: "node_modules/ms/", ver: "2.0.0", kind: "pkg" },
  ms: { id: "ms", depth: 2, name: "ms/", ver: "2.1.3", kind: "pkg" },
  more: { id: "more", depth: 2, name: "…and 64 more packages", kind: "more" },
  more61: { id: "more61", depth: 2, name: "…and 61 more packages", kind: "more" },
  pkgjson: { id: "pkgjson", depth: 1, name: "package.json", kind: "file" },
};

const LOOKUP_ROWS = ["root", "src", "routes", "where", "routesnm", "srcnm", "nm", "debug", "express", "exlib", "exnm", "exdebug", "ms", "more", "pkgjson"];

const PLACE_TOP = ["root", "nm", "debug", "ms", "express", "exnm", "exdebug", "exms", "bp", "bpdebug", "bpms", "fh", "fhdebug", "fhms", "send", "senddebug", "sendms", "more61", "pkgjson"];

export const MODES: Mode[] = [
  {
    id: "lookup",
    label: "How require() searches",
    intro:
      "`src/routes/where.js` calls `require('debug')`. The name doesn't start with `./` or `/`, and it isn't built into Node.js like `fs`, so Node treats it as a package and goes looking in node_modules folders.",
    steps: [
      {
        title: "It starts next to the file that asked",
        caption:
          "Node.js looks for `node_modules/debug` in the folder of the file that called require: `src/routes/`. There's no node_modules folder there at all.",
        rows: LOOKUP_ROWS,
        marks: { where: "start", routesnm: "miss" },
        tried: [{ path: "src/routes/node_modules/debug", found: false }],
      },
      {
        title: "Not there, so it climbs one folder",
        caption: "Up to `src/`, and the same question. Still no node_modules. Each miss costs a check on disk, which is one reason a deep folder tree makes startup a little slower.",
        rows: LOOKUP_ROWS,
        marks: { where: "start", routesnm: "miss", srcnm: "miss" },
        tried: [
          { path: "src/routes/node_modules/debug", found: false },
          { path: "src/node_modules/debug", found: false },
        ],
      },
      {
        title: "Found at the project root, and the search stops",
        caption:
          "`node_modules/debug` exists. Node reads its package.json to find the entry file, `src/index.js`, and stops: the first match wins, even if a different version sits further up or deeper down.",
        rows: LOOKUP_ROWS,
        marks: { where: "start", routesnm: "miss", srcnm: "miss", debug: "hit" },
        tried: [
          { path: "src/routes/node_modules/debug", found: false },
          { path: "src/node_modules/debug", found: false },
          { path: "node_modules/debug", found: true },
        ],
        term: ["> require.resolve('debug')", "node_modules/debug/src/index.js", "> require('debug/package.json').version", "4.4.3"],
        result: { ok: true, text: "debug 4.4.3" },
      },
      {
        title: "Same name from inside express: a different file",
        caption:
          "When express's own code calls `require('debug')`, the search starts in express's folder. Its private `node_modules/debug` is closer, so express gets 2.6.9, the version it asked for, while your code gets 4.4.3.",
        rows: LOOKUP_ROWS,
        marks: { exlib: "start", exdebug: "hit" },
        tried: [
          { path: "node_modules/express/lib/node_modules/debug", found: false },
          { path: "node_modules/express/node_modules/debug", found: true },
        ],
        term: ["> require.resolve('debug', { paths: ['node_modules/express/lib'] })", "node_modules/express/node_modules/debug/src/index.js"],
        result: { ok: true, text: "debug 2.6.9" },
      },
      {
        title: "A package that isn't installed: it keeps climbing",
        caption:
          "For a name that's nowhere in the project, Node doesn't stop at the project root. It keeps climbing through every parent folder. A forgotten node_modules up there, from an install you ran in the wrong place, answers instead.",
        rows: ["parent", ...LOOKUP_ROWS],
        marks: { where: "start", routesnm: "miss", srcnm: "miss", nm: "miss", parent: "warn" },
        tried: [
          { path: "src/routes/node_modules/stray-helper", found: false },
          { path: "src/node_modules/stray-helper", found: false },
          { path: "node_modules/stray-helper", found: false },
          { path: "../node_modules/stray-helper", found: true },
        ],
        term: ["> require('stray-helper')", "found in a parent folder -> ..\\node_modules\\stray-helper\\index.js"],
        result: { ok: false, text: "loaded from outside the project" },
      },
      {
        title: "Nothing anywhere: MODULE_NOT_FOUND",
        caption:
          "Delete that stray folder and the search climbs all the way to the root of the drive, then gives up. The error names the package, not the folders it searched; `module.paths` shows those.",
        rows: LOOKUP_ROWS,
        marks: { where: "start", routesnm: "miss", srcnm: "miss", nm: "miss" },
        tried: [
          { path: "src/routes/node_modules/stray-helper", found: false },
          { path: "src/node_modules/stray-helper", found: false },
          { path: "node_modules/stray-helper", found: false },
          { path: "…every parent folder, up to C:/node_modules", found: false },
        ],
        term: ["Error: Cannot find module 'stray-helper'", "  code: 'MODULE_NOT_FOUND'"],
        result: { ok: false, text: "MODULE_NOT_FOUND" },
      },
    ],
  },
  {
    id: "place",
    label: "Where npm puts each copy",
    intro:
      "You asked for `debug@4` and `express@4`. But express 4 and three of its own dependencies want `debug@2.6.9`. Two versions of one package can't share one folder name, so npm has to decide where each copy lives.",
    steps: [
      {
        title: "Your version takes the top slot",
        caption:
          "npm places every package as high in the tree as it can, so that one copy can be shared. You asked for debug 4 yourself, so `node_modules/debug` holds 4.4.3, and so does `ms`, which it needs.",
        rows: ["root", "nm", "debug", "ms", "express", "bp", "fh", "send", "more61", "pkgjson"],
        marks: { debug: "hit", ms: "hit" },
      },
      {
        title: "2.6.9 can't go up, so it's copied under each parent",
        caption:
          "express, body-parser, finalhandler and send each need debug 2.6.9, and the top slot is taken. Each one gets a private copy in its own node_modules. Same version, same files, four times.",
        rows: ["root", "nm", "debug", "ms", "express", "exnm", "exdebug", "bp", "bpdebug", "fh", "fhdebug", "send", "senddebug", "more61", "pkgjson"],
        marks: { exdebug: "copy", bpdebug: "copy", fhdebug: "copy", senddebug: "copy" },
        term: ["$ npm ls debug", "+-- debug@4.4.3", "`-- express@4.22.3", "  +-- body-parser@1.20.9", "  | `-- debug@2.6.9", "  +-- debug@2.6.9", "  +-- finalhandler@1.3.2", "  | `-- debug@2.6.9", "  `-- send@0.19.2", "    `-- debug@2.6.9"],
      },
      {
        title: "The same again, one level down",
        caption:
          "debug 2.6.9 needs ms 2.0.0, but the top `ms` is 2.1.3. So 2.0.0 is copied next to each old debug. Under send it goes one level deeper still, because send itself needs ms 2.1.3 and a 2.0.0 in send's folder would hide it.",
        rows: PLACE_TOP,
        marks: { exms: "copy", bpms: "copy", fhms: "copy", sendms: "warn" },
        term: ["node_modules/express/node_modules/ms        2.0.0", "node_modules/body-parser/node_modules/ms    2.0.0", "node_modules/finalhandler/node_modules/ms   2.0.0", "node_modules/send/node_modules/debug/node_modules/ms   2.0.0", "node_modules/ms                             2.1.3"],
      },
      {
        title: "You uninstall debug 4: the copies stay put",
        caption:
          "`npm uninstall debug` removes your top-level copy and nothing else. The four private copies stay where they were, so the top slot is empty, and `require('debug')` from your own code now fails.",
        rows: ["root", "nm", "ms", "express", "exnm", "exdebug", "exms", "bp", "bpdebug", "bpms", "fh", "fhdebug", "fhms", "send", "senddebug", "sendms", "more61", "pkgjson"],
        marks: { exdebug: "copy", bpdebug: "copy", fhdebug: "copy", senddebug: "copy" },
        term: ["$ npm uninstall debug", "removed 1 package in 3s", "> require('debug')", "Error: Cannot find module 'debug'"],
        result: { ok: false, text: "your require('debug') fails" },
      },
      {
        title: "npm dedupe: four copies become one",
        caption:
          "`npm dedupe` notices the top slot is free. It moves one copy of debug 2.6.9 up there, with the ms 2.0.0 it needs tucked inside it, and deletes the four private copies of each: 2 added, 8 removed. And a surprise: your code can require debug again.",
        rows: ["root", "nm", "debug2", "debug2ms", "ms", "express", "bp", "fh", "send", "more61", "pkgjson"],
        marks: { debug2: "hit", debug2ms: "copy" },
        term: ["$ npm dedupe", "added 2 packages, and removed 8 packages in 3s"],
      },
      {
        title: "A dependency you never declared",
        caption:
          "debug isn't in your package.json any more, yet `require('debug')` works and returns 2.6.9: a phantom dependency. It works only while express keeps needing it. The day express drops debug, your app breaks without you changing a line.",
        rows: ["root", "nm", "debug2", "debug2ms", "ms", "express", "bp", "fh", "send", "more61", "pkgjson"],
        marks: { debug2: "warn", pkgjson: "gone" },
        term: ["> require('debug/package.json').version", "'2.6.9'", '# package.json: "dependencies": { "express": "^4.22.3" }'],
        result: { ok: false, text: "works by accident" },
      },
    ],
  },
];
