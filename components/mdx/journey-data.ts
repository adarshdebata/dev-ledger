import { layoutTimings, type Durations, type Phase, type TimingRow } from "./timing";

export type StopId = "queue" | "dns" | "tcp" | "tls" | "send" | "server" | "download";

export type Stop = {
  id: StopId;
  n: number;
  name: string;
  where: string;
  title: string;
  devtools: string;
  text: string;
  /** Stops a reused connection skips. */
  setup?: boolean;
  breaks: {
    kind: "slow" | "error";
    phase: Phase;
    ms: number;
    text: string;
    /** What the console prints when this fails for a fetch() or an image (Chrome's net error names). */
    console?: string;
    /** What Chrome shows instead when the failing request is the page itself. */
    page?: string;
  };
};

/** One request to a server about 150 ms away, on a brand-new connection. Illustrative, but realistic. */
export const FRESH: Durations = { queueing: 1.84, stalled: 2.1, dns: 118.3, tcp: 148.72, ssl: 157.4, send: 0.21, wait: 642.55, download: 88.91 };

/** The same request a moment later, on the connection that's still open. */
export const REUSED: Durations = { queueing: 0.93, stalled: 0.41, send: 0.18, wait: 640.12, download: 87.36 };

export const READY = {
  title: "You press Enter",
  text: "The browser has a URL and nothing else. Press Next, or Play, to follow one request through all seven stops. Turn on Reused connection to see what a second request skips, and Break this stop to see how the stop you're on goes wrong.",
};

export const STOPS: Stop[] = [
  {
    id: "queue",
    n: 1,
    name: "Queue",
    where: "your browser",
    title: "Check the cache, wait for a connection",
    devtools: "Queueing, Stalled",
    text: "Before anything leaves your machine, the browser checks its cache. Nothing fresh is stored for this URL, so the request joins a queue and waits for a free connection to the server. Usually a few milliseconds.",
    breaks: {
      kind: "slow",
      phase: "stalled",
      ms: 1452.6,
      text: "Six requests to this server are already in flight, and over HTTP/1.1 that's the limit for one server. This one waits its turn: a long Stalled bar, and no error anywhere.",
    },
  },
  {
    id: "dns",
    n: 2,
    name: "DNS",
    where: "a DNS resolver",
    title: "Turn the name into an address",
    devtools: "DNS Lookup",
    setup: true,
    text: "The network can't deliver to `api.example.com`; it needs an IP address. The browser asks a DNS resolver, which answers with one, such as `203.0.113.10`. If the answer is already cached, this takes almost no time.",
    breaks: {
      kind: "error",
      phase: "dns",
      ms: 23.4,
      text: "The name doesn't resolve: a typo, a domain that has expired, or a DNS server that isn't answering. Nothing else happens. No connection is ever opened.",
      console: "net::ERR_NAME_NOT_RESOLVED",
      page: "This site can't be reached. api.example.com's server IP address could not be found.",
    },
  },
  {
    id: "tcp",
    n: 3,
    name: "TCP",
    where: "the server",
    title: "Open a connection",
    devtools: "Initial connection",
    setup: true,
    text: "The browser and the server shake hands: SYN, SYN-ACK, ACK. That's one full round trip across the network before a single byte of the request can move, and this server is about 150 ms away.",
    breaks: {
      kind: "error",
      phase: "connect",
      ms: 151.2,
      text: "The server's machine answered, but nothing is listening on that port: the app has crashed, or it runs on a different port. If a firewall silently drops the packets instead, the browser waits and then shows `net::ERR_CONNECTION_TIMED_OUT`.",
      console: "net::ERR_CONNECTION_REFUSED",
      page: "This site can't be reached. api.example.com refused to connect.",
    },
  },
  {
    id: "tls",
    n: 4,
    name: "TLS",
    where: "the server",
    title: "Secure the connection",
    devtools: "SSL, inside Initial connection",
    setup: true,
    text: "For HTTPS, both sides agree on encryption keys, and the browser checks the server's certificate. With TLS 1.3 that costs one more round trip. DevTools shows it as SSL, drawn inside the Initial connection bar.",
    breaks: {
      kind: "error",
      phase: "ssl",
      ms: 149.8,
      text: "The server's certificate has expired, so the browser stops before sending anything. The request never reaches your code.",
      console: "net::ERR_CERT_DATE_INVALID",
      page: "Your connection is not private. NET::ERR_CERT_DATE_INVALID",
    },
  },
  {
    id: "send",
    n: 5,
    name: "Send",
    where: "browser → server",
    title: "Send the request",
    devtools: "Request sent",
    text: "Now the request itself goes out: the method, the URL, the headers, any cookies and any body. Unless you're uploading something big, this takes well under a millisecond.",
    breaks: {
      kind: "error",
      phase: "send",
      ms: 1930,
      text: "A 40 MB upload is over a proxy's size limit. The proxy answers 413 and closes the connection while the browser is still sending, so the browser reports a broken connection instead of the 413.",
      console: "net::ERR_CONNECTION_RESET",
    },
  },
  {
    id: "server",
    n: 6,
    name: "Server",
    where: "CDN, proxy, app, database",
    title: "Wait for the server",
    devtools: "Waiting for server response",
    text: "The request travels to the server, through any CDN or proxy on the way. The app does its work, perhaps asks a database, and the first byte of the answer travels back. This bar is the TTFB, and it includes that trip there and back.",
    breaks: {
      kind: "slow",
      phase: "wait",
      ms: 4812.4,
      text: "The server, or its database, takes almost five seconds to answer. The network is fine: every millisecond of that wait lands in this one bar.",
    },
  },
  {
    id: "download",
    n: 7,
    name: "Download",
    where: "server → browser",
    title: "Receive the response",
    devtools: "Content Download",
    text: "The rest of the response streams in. How long that takes depends on its size, whether it's compressed, and the speed of the connection.",
    breaks: {
      kind: "slow",
      phase: "download",
      ms: 2904.7,
      text: "The response is 6 MB of uncompressed JSON. Turning on compression, or sending less data, shrinks this bar.",
    },
  },
];

/** Which journey stop draws each DevTools row. Initial connection starts at TCP and grows during TLS. */
const ROW_STOP: Record<Phase, number> = { queueing: 1, stalled: 1, dns: 2, connect: 3, ssl: 4, send: 5, wait: 6, download: 7 };

const KEY: Record<Phase, keyof Durations> = {
  queueing: "queueing",
  stalled: "stalled",
  dns: "dns",
  connect: "tcp",
  ssl: "ssl",
  send: "send",
  wait: "wait",
  download: "download",
};

/**
 * The DevTools rows for the journey so far. `at` is the number of the stop the reader is on (0 before the first),
 * and `broken` makes that stop slow or fail. A failure ends the request, so later rows don't exist.
 */
export function journeyRows(reused: boolean, at: number, broken: Stop | null) {
  const d: Durations = { ...(reused ? REUSED : FRESH) };
  if (broken) {
    d[KEY[broken.breaks.phase]] = broken.breaks.ms;
    if (broken.breaks.kind === "error") {
      // Everything after the failing phase never happens.
      const order: (keyof Durations)[] = ["queueing", "stalled", "dns", "tcp", "ssl", "send", "wait", "download"];
      for (const k of order.slice(order.indexOf(KEY[broken.breaks.phase]) + 1)) delete d[k];
    }
  }
  const full = layoutTimings(d);
  const rows: TimingRow[] = full.map((r) => {
    const stop = ROW_STOP[r.phase];
    const reached = at >= stop;
    // Initial connection grows in two steps: the TCP handshake first, then TLS inside it.
    const dur = r.phase === "connect" && at === 3 && d.tcp !== undefined ? d.tcp : r.dur;
    const active = at === stop || (r.phase === "connect" && at === 4 && d.ssl !== undefined);
    return {
      ...r,
      dur,
      shown: reached ? dur : 0,
      state: !reached ? "pending" : active ? "active" : "done",
      problem: broken && at === broken.n && broken.breaks.phase === r.phase ? broken.breaks.kind : undefined,
    };
  });
  const scale = Math.max(...full.map((r) => r.start + r.dur));
  const elapsed = Math.max(0, ...rows.filter((r) => r.state !== "pending").map((r) => r.start + (r.shown ?? 0)));
  return { rows, scale, elapsed };
}
