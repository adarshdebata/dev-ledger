/**
 * One request and its response, through a CDN and a load balancer, header by header: who sets,
 * reads, adds or removes each one. The browser's own headers are the ones Chrome really sent
 * for a plain fetch(); the hops in the middle are typical, not one vendor's exact behaviour.
 */

export const STOPS = [
  { id: "browser", name: "Browser" },
  { id: "cdn", name: "CDN" },
  { id: "lb", name: "Load balancer" },
  { id: "app", name: "Your app" },
] as const;

export type StopId = (typeof STOPS)[number]["id"];
export type Act = "sets" | "reads" | "adds" | "removes";

export type Row = {
  name: string;
  value: string;
  dir: "req" | "res";
  /** What each stop does with this header, and why, in a few words. */
  acts: Partial<Record<StopId, { act: Act; why: string }>>;
};

export type TripStep = { stop: StopId; dir: "req" | "res"; title: string; caption: string };

export const STEPS: TripStep[] = [
  {
    stop: "browser",
    dir: "req",
    title: "The browser builds the request",
    caption:
      "Your code called `fetch('https://api.example.com/products?page=2')` with no headers at all. Chrome still sends more than a dozen: where it's going, what it accepts, the cookies it holds for that site, and where the request came from.",
  },
  {
    stop: "cdn",
    dir: "req",
    title: "The CDN reads just enough to find a cached copy",
    caption:
      "The CDN looks at the Host to know which site this is, and at Accept-Encoding to know which compressed copy would do. No copy yet, so it passes the request on, adding where it came from and dropping the header that only described the last hop.",
  },
  {
    stop: "lb",
    dir: "req",
    title: "The load balancer picks a server",
    caption:
      "The load balancer routes on the Host and the path, appends the address it saw to X-Forwarded-For, and often stamps a trace ID so the request can be followed through the logs.",
  },
  {
    stop: "app",
    dir: "req",
    title: "Your app reads what it needs",
    caption:
      "Your app finally sees the request, but the connection comes from the load balancer, not the user. The user's address and the original https are only known from the X-Forwarded headers, and only if you tell your framework to trust them.",
  },
  {
    stop: "app",
    dir: "res",
    title: "Your app answers, with instructions",
    caption:
      "The response headers are instructions for everyone on the way back: what the body is, who may cache it and for how long, and which other site may read it.",
  },
  {
    stop: "lb",
    dir: "res",
    title: "The load balancer passes it back",
    caption: "Load balancers rarely touch responses. This one passes it straight through.",
  },
  {
    stop: "cdn",
    dir: "res",
    title: "The CDN follows the caching rules",
    caption:
      "The CDN obeys Cache-Control and keeps a copy for 60 seconds, keyed by the Vary header, then compresses the body and says how old its copy is. The next visitor gets that copy without reaching your app.",
  },
  {
    stop: "browser",
    dir: "res",
    title: "The browser acts on the answer",
    caption:
      "The browser decompresses the body, checks it may hand it to the page (that's CORS), decides how long it can reuse it, and keeps the ETag to ask “has it changed?” next time.",
  },
];

export const ROWS: Row[] = [
  // Request headers
  { name: "Host", value: "api.example.com", dir: "req", acts: { browser: { act: "sets", why: "from the URL" }, cdn: { act: "reads", why: "which site" }, lb: { act: "reads", why: "routing rule" }, app: { act: "reads", why: "which app" } } },
  { name: "Accept", value: "*/*", dir: "req", acts: { browser: { act: "sets", why: "any type" }, app: { act: "reads", why: "pick a format" } } },
  { name: "Accept-Encoding", value: "gzip, deflate, br, zstd", dir: "req", acts: { browser: { act: "sets", why: "can unzip these" }, cdn: { act: "reads", why: "which copy" } } },
  { name: "Origin", value: "https://shop.example.com", dir: "req", acts: { browser: { act: "sets", why: "page's site" }, app: { act: "reads", why: "CORS check" } } },
  { name: "Cookie", value: "session=9f2c…", dir: "req", acts: { browser: { act: "sets", why: "stored for this site" }, app: { act: "reads", why: "who is this?" } } },
  { name: "Sec-Fetch-Site", value: "same-site", dir: "req", acts: { browser: { act: "sets", why: "can't be faked" }, app: { act: "reads", why: "optional guard" } } },
  { name: "Connection", value: "keep-alive", dir: "req", acts: { browser: { act: "sets", why: "this hop only" }, cdn: { act: "removes", why: "hop-by-hop" } } },
  { name: "X-Forwarded-For", value: "203.0.113.7, 198.51.100.2", dir: "req", acts: { cdn: { act: "adds", why: "user's address" }, lb: { act: "adds", why: "appends CDN's" }, app: { act: "reads", why: "req.ip" } } },
  { name: "X-Forwarded-Proto", value: "https", dir: "req", acts: { cdn: { act: "adds", why: "user used https" }, app: { act: "reads", why: "req.protocol" } } },
  { name: "X-Request-Id", value: "7f3a91c2", dir: "req", acts: { lb: { act: "adds", why: "trace ID" }, app: { act: "reads", why: "into every log line" } } },
  // Response headers
  { name: "Content-Type", value: "application/json; charset=utf-8", dir: "res", acts: { app: { act: "sets", why: "what the body is" }, browser: { act: "reads", why: "how to parse" } } },
  { name: "Cache-Control", value: "public, max-age=60", dir: "res", acts: { app: { act: "sets", why: "caching rules" }, cdn: { act: "reads", why: "keep 60 s" }, browser: { act: "reads", why: "reuse 60 s" } } },
  { name: "Vary", value: "Accept-Encoding", dir: "res", acts: { app: { act: "sets", why: "copies differ by" }, cdn: { act: "reads", why: "cache key" } } },
  { name: "ETag", value: "\"v42\"", dir: "res", acts: { app: { act: "sets", why: "version tag" }, browser: { act: "reads", why: "for If-None-Match" } } },
  { name: "Access-Control-Allow-Origin", value: "https://shop.example.com", dir: "res", acts: { app: { act: "sets", why: "who may read" }, browser: { act: "reads", why: "CORS check" } } },
  { name: "Content-Encoding", value: "br", dir: "res", acts: { cdn: { act: "adds", why: "compressed it" }, browser: { act: "reads", why: "decompress" } } },
  { name: "Age", value: "0", dir: "res", acts: { cdn: { act: "adds", why: "copy's age" } } },
];

/** The step at which a stop deals with a row (the stop's step in the row's direction), if it does. */
export const stepOf = (row: Row, stop: StopId) =>
  row.acts[stop] ? STEPS.findIndex((s) => s.stop === stop && s.dir === row.dir) + 1 : undefined;

/** The step at which a row first exists: when the earliest stop that touches it gets to it. */
export const bornAt = (row: Row) => Math.min(...STOPS.map((s) => stepOf(row, s.id) ?? Infinity));
