/**
 * Scenario data for the request-flow players: a reverse proxy, a load balancer and a CDN.
 * Every log line, status and timing is real: Nginx 1.31.10 in front of Node.js 24 apps in Docker,
 * and curl against live CDNs (GitHub Pages / Fastly, Cloudflare) on 2026-11-28.
 */

export type Tone = "default" | "ok" | "bad" | "warn" | "muted";
export type ActorIcon = "browser" | "proxy" | "server" | "balancer" | "edge" | "origin" | "service";
export type FlowActor = { id: string; label: string; sub?: string; icon: ActorIcon };
export type FlowMsg = { from: string; to: string; label: string; tone?: Tone };
export type FlowStep = {
  title: string;
  caption: string;
  msgs?: FlowMsg[];
  /** A short state line under an actor, e.g. "copy: v1 · Age 19". */
  badges?: Record<string, { text: string; tone?: Tone }>;
  /** Requests handled so far, per actor (load balancer only). */
  meters?: Record<string, number>;
  log?: string[];
  result?: { ok: boolean; text: string };
};
export type FlowScenario = { id: string; label: string; intro: string; steps: FlowStep[] };
export type FlowData = {
  title: string;
  sub: string;
  logTitle: string;
  actors: FlowActor[];
  scenarios: FlowScenario[];
  meterMax?: number;
};

/* ------------------------------------------------------------------ reverse proxy */

const UP = "172.18.0.2:3000";

export const PROXY: FlowData = {
  title: "A request through Nginx",
  sub: "browser → Nginx 1.31.10 → Node.js app in Docker",
  logTitle: "Logs",
  actors: [
    { id: "browser", label: "Browser", sub: "or curl", icon: "browser" },
    { id: "nginx", label: "Nginx", sub: "reverse proxy", icon: "proxy" },
    { id: "app", label: "Your app", sub: `upstream ${UP}`, icon: "server" },
  ],
  scenarios: [
    {
      id: "ok",
      label: "Healthy",
      intro: "The browser never talks to your app. It talks to Nginx, and Nginx opens its own connection to the app. Two separate trips, and either one can fail.",
      steps: [
        {
          title: "The browser only ever talks to Nginx",
          caption:
            "The request arrives at Nginx. If it came over HTTPS, the encryption ends here, at Nginx. Nginx picks where it should go, by host and path, and adds a few headers that describe the original request.",
          msgs: [{ from: "browser", to: "nginx", label: "GET /products?page=2" }],
          badges: { nginx: { text: "+ X-Forwarded-For, X-Forwarded-Proto" } },
        },
        {
          title: "Nginx opens its own connection to the app",
          caption:
            "To your app, this is a brand-new request from Nginx. In our test, the app saw `remoteAddress` 172.18.0.3, which is Nginx. The real caller survives only in the X-Forwarded-For header.",
          msgs: [{ from: "nginx", to: "app", label: "GET /products?page=2" }],
          badges: { app: { text: "remoteAddress: 172.18.0.3 (Nginx)" } },
          log: ['# what the app saw (real):', '"remoteAddress": "172.18.0.3"', '"x-forwarded-for": "172.18.0.1"', '"x-forwarded-proto": "http"'],
        },
        {
          title: "The answer goes back the same way",
          caption:
            "The app answers Nginx, and Nginx answers the browser, adding its own `Server` header. The browser can't tell an app was ever involved.",
          msgs: [
            { from: "app", to: "nginx", label: "200 OK", tone: "ok" },
            { from: "nginx", to: "browser", label: "200 OK", tone: "ok" },
          ],
          log: ["HTTP/1.1 200 OK", "Server: nginx/1.31.10", "Content-Type: application/json"],
          result: { ok: true, text: "200 OK" },
        },
      ],
    },
    {
      id: "refused",
      label: "502: nothing listening",
      intro: "The app's container is running, but nothing accepts connections on the address Nginx uses. In our test the app listened on 127.0.0.1 inside its container: the bug from Week 1, seen from Nginx's side.",
      steps: [
        { title: "The request reaches Nginx as usual", caption: "From the browser's side, nothing is different yet.", msgs: [{ from: "browser", to: "nginx", label: "GET /" }] },
        {
          title: "Nginx's connection to the app is refused",
          caption:
            "Nginx tries to connect to 172.18.0.2:3000. The app's machine answers at once: nobody is listening there. Your app's own logs show nothing, because no request ever reached it.",
          msgs: [{ from: "nginx", to: "app", label: "connect → refused", tone: "bad" }],
          badges: { app: { text: "listening on 127.0.0.1 only", tone: "bad" } },
          log: [`[error] connect() failed (111: Connection refused) while connecting to upstream, request: "GET / HTTP/1.1", upstream: "http://${UP}/"`],
        },
        {
          title: "Nginx answers for it: 502 Bad Gateway",
          caption:
            "Nginx is the gateway, and what went bad is the trip behind it. A 502 always comes from the proxy, not your app. The error log line says which trip and why.",
          msgs: [{ from: "nginx", to: "browser", label: "502 Bad Gateway", tone: "bad" }],
          log: [`[error] connect() failed (111: Connection refused) while connecting to upstream, request: "GET / HTTP/1.1", upstream: "http://${UP}/"`],
          result: { ok: false, text: "502 Bad Gateway" },
        },
      ],
    },
    {
      id: "closed",
      label: "502: app hangs up",
      intro: "This time the app accepts the connection, then closes it without sending a single byte: a crash in the middle of a request, a process killed for using too much memory, or a keep-alive connection it had just closed.",
      steps: [
        { title: "Nginx passes the request on", caption: "The connection to the app works, and the request is sent.", msgs: [{ from: "browser", to: "nginx", label: "GET /crash" }, { from: "nginx", to: "app", label: "GET /crash" }] },
        {
          title: "The app closes the connection with no answer",
          caption: "Nginx was waiting for the status line and the headers, and got the end of the connection instead.",
          msgs: [{ from: "app", to: "nginx", label: "connection closed", tone: "bad" }],
          badges: { app: { text: "crashed mid-request", tone: "bad" } },
          log: ['[error] upstream prematurely closed connection while reading response header from upstream, request: "GET /crash HTTP/1.1", upstream: "http://172.18.0.2:3000/crash"'],
        },
        {
          title: "502 again, but a different log line",
          caption:
            "Same status, different cause. Refused means nothing was listening; prematurely closed means the app was there and died, or hung up, mid-request. Look for a crash or a restart in the app's own logs at that second.",
          msgs: [{ from: "nginx", to: "browser", label: "502 Bad Gateway", tone: "bad" }],
          log: ['[error] upstream prematurely closed connection while reading response header from upstream, request: "GET /crash HTTP/1.1", upstream: "http://172.18.0.2:3000/crash"'],
          result: { ok: false, text: "502 Bad Gateway" },
        },
      ],
    },
    {
      id: "slow",
      label: "504: app too slow",
      intro: "The app is alive and working on the request, just slowly: a heavy query, a slow third-party API. Nginx only waits so long. Its default is 60 seconds; we set `proxy_read_timeout 5s` to see it quickly.",
      steps: [
        { title: "The app starts a slow job", caption: "The request reaches the app, which starts an eight-second piece of work.", msgs: [{ from: "browser", to: "nginx", label: "GET /slow" }, { from: "nginx", to: "app", label: "GET /slow" }], badges: { app: { text: "working… 8 s" } } },
        {
          title: "Nginx gives up first",
          caption: "Five seconds pass without a response header, so Nginx stops waiting and answers the browser itself. curl measured 5.2 seconds.",
          msgs: [{ from: "nginx", to: "browser", label: "504 Gateway Time-out", tone: "bad" }],
          badges: { app: { text: "still working…", tone: "warn" } },
          log: ['[error] upstream timed out (110: Operation timed out) while reading response header from upstream, request: "GET /slow HTTP/1.1", upstream: "http://172.18.0.2:3000/slow"'],
          result: { ok: false, text: "504 after 5.2 s" },
        },
        {
          title: "The app finishes anyway, for nobody",
          caption:
            "Three seconds later the app finishes and answers a connection Nginx has already closed. Whatever the request did, an order saved or an email sent, it did. The user saw an error and may well try again.",
          msgs: [{ from: "app", to: "nginx", label: "200 (too late)", tone: "muted" }],
          badges: { app: { text: "done: the work happened", tone: "warn" } },
        },
      ],
    },
    {
      id: "big",
      label: "413: upload too big",
      intro: "Nginx has a size limit for request bodies, `client_max_body_size`, and it's 1 MB by default. Most apps meet it the first time someone uploads a photo.",
      steps: [
        {
          title: "A 2 MB upload arrives",
          caption: "The browser sends a POST with a 2 MB body. Nginx reads the Content-Length header before reading the body itself.",
          msgs: [{ from: "browser", to: "nginx", label: "POST /upload · 2 MB" }],
        },
        {
          title: "Nginx refuses it on the spot",
          caption: "2,097,152 bytes is over the 1 MB limit, so Nginx answers 413 straight away. Your app never sees the request, so there's nothing in its logs and no error handler runs.",
          msgs: [{ from: "nginx", to: "browser", label: "413 Request Entity Too Large", tone: "bad" }],
          badges: { app: { text: "never saw it", tone: "muted" } },
          log: ['[error] client intended to send too large body: 2097152 bytes, request: "POST /upload HTTP/1.1"'],
          result: { ok: false, text: "413 Request Entity Too Large" },
        },
        {
          title: "Under the limit, Nginx buffers it first",
          caption:
            "A 900 KB upload goes through, but not as a stream. Nginx reads the whole body first, spilling it to a temporary file, and only then passes it to the app. Slow uploads never tie up your app.",
          msgs: [{ from: "browser", to: "nginx", label: "POST /upload · 900 KB" }, { from: "nginx", to: "app", label: "POST (whole body)" }, { from: "app", to: "browser", label: "got 921600 bytes", tone: "ok" }],
          log: ["[warn] a client request body is buffered to a temporary file /var/cache/nginx/client_temp/0000000001"],
          result: { ok: true, text: "200 · got 921600 bytes" },
        },
      ],
    },
    {
      id: "moved",
      label: "502: app moved",
      intro: "Nginx looks up the app's name, `app`, once, when it starts, and keeps the address. Containers get new addresses when they're recreated.",
      steps: [
        { title: "The app's container is recreated", caption: "A deploy replaces the app's container. The new one gets 172.18.0.4; something else now has 172.18.0.2.", badges: { app: { text: "now at 172.18.0.4", tone: "warn" } } },
        {
          title: "Nginx still uses the old address",
          caption: "The app is up and healthy at its new address, yet every request fails, because Nginx still connects to the address it looked up when it started.",
          msgs: [{ from: "browser", to: "nginx", label: "GET /" }, { from: "nginx", to: "app", label: "→ 172.18.0.2: refused", tone: "bad" }, { from: "nginx", to: "browser", label: "502", tone: "bad" }],
          log: ['[error] connect() failed (111: Connection refused) while connecting to upstream, request: "GET / HTTP/1.1", upstream: "http://172.18.0.2:3000/"'],
          result: { ok: false, text: "502, with a healthy app" },
        },
        {
          title: "A reload makes Nginx look again",
          caption: "`nginx -s reload` looks the name up again, and the next request works. The lasting fix is to stop relying on that one lookup: give Nginx a `resolver` and mark the upstream server `resolve`. We moved the app again with that in place, and Nginx followed it without a reload.",
          msgs: [{ from: "browser", to: "nginx", label: "GET /" }, { from: "nginx", to: "app", label: "→ 172.18.0.4" }, { from: "app", to: "browser", label: "200 OK", tone: "ok" }],
          log: ["$ nginx -s reload", "[notice] signal process started"],
          result: { ok: true, text: "200 OK" },
        },
      ],
    },
    {
      id: "ws",
      label: "WebSocket",
      intro: "A WebSocket starts as an HTTP request asking to upgrade the connection. But `Upgrade` and `Connection` are hop-by-hop headers: they describe one connection, so a proxy doesn't pass them on unless told to.",
      steps: [
        { title: "The browser asks to upgrade", caption: "The request carries `Connection: Upgrade` and `Upgrade: websocket`.", msgs: [{ from: "browser", to: "nginx", label: "GET /ws · Upgrade: websocket" }] },
        {
          title: "Nginx drops the upgrade",
          caption: "With the default proxy settings, the app receives a plain GET. It saw `Upgrade=(none)`, answered with an ordinary 200, and the browser's WebSocket fails to open.",
          msgs: [{ from: "nginx", to: "app", label: "GET /ws (no Upgrade)", tone: "warn" }, { from: "app", to: "browser", label: "200 OK, not 101", tone: "bad" }],
          log: ["# the app's view: no upgrade: Upgrade=(none) Connection=(none)", "HTTP/1.1 200 OK"],
          result: { ok: false, text: "200 instead of 101" },
        },
        {
          title: "Three lines in the config fix it",
          caption: "`proxy_http_version 1.1`, `proxy_set_header Upgrade $http_upgrade` and `proxy_set_header Connection \"upgrade\"` tell Nginx to pass the request on. Now the app answers 101 and the connection stays open.",
          msgs: [{ from: "nginx", to: "app", label: "GET /ws · Upgrade: websocket" }, { from: "app", to: "browser", label: "101 Switching Protocols", tone: "ok" }],
          log: ["HTTP/1.1 101 Switching Protocols", "Server: nginx/1.31.10"],
          result: { ok: true, text: "101 Switching Protocols" },
        },
      ],
    },
  ],
};

/* ------------------------------------------------------------------ load balancer */

export const BALANCER: FlowData = {
  title: "Three servers behind one balancer",
  sub: "Nginx as the load balancer, three identical Node.js apps",
  logTitle: "What we measured",
  meterMax: 300,
  actors: [
    { id: "client", label: "Clients", sub: "curl, fetch, browsers", icon: "service" },
    { id: "lb", label: "Load balancer", sub: "Nginx", icon: "balancer" },
    { id: "app1", label: "app1", icon: "server" },
    { id: "app2", label: "app2", icon: "server" },
    { id: "app3", label: "app3", icon: "server" },
  ],
  scenarios: [
    {
      id: "rr",
      label: "Round robin",
      intro: "The default: hand requests out in turn, without asking how busy each server is. With six requests on six separate connections, it's as even as it looks.",
      steps: [
        { title: "Request 1 goes to app1", caption: "The balancer keeps a pointer to whose turn it is.", msgs: [{ from: "client", to: "lb", label: "request 1" }, { from: "lb", to: "app1", label: "→ app1" }], meters: { app1: 1, app2: 0, app3: 0 } },
        { title: "Request 2 goes to app2", caption: "Next in line.", msgs: [{ from: "client", to: "lb", label: "request 2" }, { from: "lb", to: "app2", label: "→ app2" }], meters: { app1: 1, app2: 1, app3: 0 } },
        { title: "Request 3 goes to app3", caption: "And the next.", msgs: [{ from: "client", to: "lb", label: "request 3" }, { from: "lb", to: "app3", label: "→ app3" }], meters: { app1: 1, app2: 1, app3: 1 } },
        {
          title: "Then round again",
          caption: "Six requests, two each. This is the picture everyone has of load balancing. The rest of these scenarios are about when it stops being true.",
          msgs: [{ from: "client", to: "lb", label: "requests 4–6" }, { from: "lb", to: "app1", label: "→ app1, app2, app3" }],
          meters: { app1: 2, app2: 2, app3: 2 },
          log: ["# 6 requests, 6 connections, through an HTTP (L7) balancer:", "app1 app2 app3 app1 app2 app3"],
        },
      ],
    },
    {
      id: "keepalive",
      label: "One connection: L7 vs L4",
      intro: "Clients reuse connections: browsers, curl and Node's fetch all keep them alive. What does a balancer hand out then: requests, or connections? It depends on the layer it works at.",
      steps: [
        {
          title: "An HTTP (L7) balancer reads every request",
          caption: "curl sends six requests over a single kept-alive connection. An L7 balancer reads each HTTP request, so it can send each one somewhere else: two each, as before.",
          msgs: [{ from: "client", to: "lb", label: "1 connection, 6 requests" }, { from: "lb", to: "app1", label: "app1 app2 app3 ×2" }],
          meters: { app1: 2, app2: 2, app3: 2 },
          log: ["# one curl, six URLs, one connection, L7:", "app1 app2 app3 app1 app2 app3"],
        },
        {
          title: "A TCP (L4) balancer only sees connections",
          caption: "Same six requests through a TCP (L4) balancer. It never reads HTTP: it picks a server when the connection opens, then passes bytes along. All six go to app1.",
          msgs: [{ from: "client", to: "lb", label: "1 connection, 6 requests" }, { from: "lb", to: "app1", label: "everything → app1", tone: "warn" }],
          meters: { app1: 6, app2: 0, app3: 0 },
          log: ["# same command through the L4 balancer:", "app1 app1 app1 app1 app1 app1", "* Reusing existing http: connection with host 127.0.0.1"],
          result: { ok: false, text: "app1: 6 · app2: 0 · app3: 0" },
        },
      ],
    },
    {
      id: "service",
      label: "A service calling a service",
      intro: "Now a real client: a Node.js service calling another service with `fetch`, one request after another, through the L4 balancer. Plenty of internal traffic looks like this.",
      steps: [
        { title: "fetch keeps two connections open", caption: "Node's fetch reuses connections. Sending requests one at a time, it ended up keeping exactly two open.", msgs: [{ from: "client", to: "lb", label: "2 connections" }], badges: { client: { text: "fetch × 300, one at a time" } } },
        { title: "The balancer picks a server per connection", caption: "Each connection gets a server when it opens. Two connections, two servers. That choice stays for as long as the connection lives.", msgs: [{ from: "lb", to: "app1", label: "connection A" }, { from: "lb", to: "app2", label: "connection B" }], meters: { app1: 1, app2: 1, app3: 0 } },
        {
          title: "300 requests later, app3 has done nothing",
          caption: "Every request rode one of the two connections, so app1 and app2 took 150 each and app3 got none. The balancer is working exactly as designed. Each of four runs split 15/15/0 across some two servers.",
          meters: { app1: 150, app2: 150, app3: 0 },
          log: ['{"app1":150,"app2":150}', "# app3: 0 of 300"],
          result: { ok: false, text: "app3 idle" },
        },
        {
          title: "More connections, even spread",
          caption: "Send six requests at a time and fetch needs more connections to carry them, so the L4 balancer finally spreads the work: 10 each. The spread follows the number of connections, not requests.",
          meters: { app1: 10, app2: 10, app3: 10 },
          log: ["# 30 requests, 6 at a time, L4:", '{"app3":10,"app2":10,"app1":10}'],
          result: { ok: true, text: "10 · 10 · 10" },
        },
      ],
    },
    {
      id: "slow",
      label: "One slow server",
      intro: "app2 has a problem: every response takes a full second. 60 requests, 6 at a time. Round robin keeps handing it its turn. Least connections notices it's busy.",
      steps: [
        {
          title: "Round robin: everyone gets a third",
          caption: "app2 got exactly a third of the requests, as slow as it was, and everyone queued behind it. The batch took 5.7 seconds.",
          msgs: [{ from: "lb", to: "app2", label: "every 3rd request", tone: "warn" }],
          meters: { app1: 20, app2: 20, app3: 20 },
          badges: { app2: { text: "1 s per response", tone: "warn" } },
          log: ['round robin: {"app1":20,"app3":20,"app2":20}', "real 0m5.722s"],
        },
        {
          title: "Least connections: work goes where it gets done",
          caption: "`least_conn` sends each request to the server with the fewest in progress. app2 always had one in flight, so it got just 2 of 60. Same servers, same requests: 1.8 seconds.",
          msgs: [{ from: "lb", to: "app1", label: "to the least busy", tone: "ok" }],
          meters: { app1: 31, app2: 2, app3: 27 },
          badges: { app2: { text: "1 s per response", tone: "warn" } },
          log: ['least_conn: {"app1":31,"app3":27,"app2":2}', "real 0m1.789s"],
          result: { ok: true, text: "5.7 s → 1.8 s" },
        },
      ],
    },
    {
      id: "dead",
      label: "A server dies",
      intro: "Open-source Nginx doesn't test servers on a timer. It notices a dead one when a real request to it fails: a passive health check. We stopped app2's container.",
      steps: [
        {
          title: "The unlucky request",
          caption: "One request is sent to app2's address, where nothing answers. Nginx waits until the network gives up, 18.7 seconds here, then retries on app3. The user gets a 200, eventually.",
          msgs: [{ from: "lb", to: "app2", label: "connect… 18.7 s", tone: "bad" }, { from: "lb", to: "app3", label: "retry → 200", tone: "ok" }],
          badges: { app2: { text: "stopped", tone: "bad" } },
          log: ['[error] connect() failed (113: Host is unreachable) while connecting to upstream, upstream: "http://172.18.0.3:3000/"', "200 18.662643s app3"],
        },
        {
          title: "app2 is skipped for 10 seconds",
          caption: "Nginx marks app2 as failed. For the next 10 seconds (`fail_timeout`), requests go only to app1 and app3, in a few milliseconds.",
          msgs: [{ from: "lb", to: "app1", label: "app1, app3 only", tone: "ok" }],
          badges: { app2: { text: "temporarily disabled", tone: "bad" } },
          log: ['[warn] upstream server temporarily disabled while connecting to upstream, upstream: "http://172.18.0.3:3000/"', "200 0.009276s app3", "200 0.011101s app1"],
        },
        {
          title: "Then a user pays again",
          caption: "After 10 seconds Nginx gives app2 another chance, using a real user's request: 3.1 seconds this time. Every 10 seconds, until someone fixes app2, one user waits.",
          msgs: [{ from: "lb", to: "app2", label: "retry… 3.1 s", tone: "bad" }, { from: "lb", to: "app1", label: "→ 200", tone: "ok" }],
          badges: { app2: { text: "still dead", tone: "bad" } },
          log: ["200 3.147370s app1"],
          result: { ok: false, text: "a slow request every 10 s" },
        },
      ],
    },
    {
      id: "retry",
      label: "Retries: GET vs POST",
      intro: "When a server fails mid-request, Nginx tries the next one, but only for requests that are safe to repeat. Here every app hangs up on `/crash`.",
      steps: [
        {
          title: "One GET, three attempts",
          caption: "Nginx sent the same GET to app1, app2 and app3 in turn, then gave up with a 502. If that GET had a side effect, it happened three times.",
          msgs: [{ from: "lb", to: "app1", label: "GET /crash ✗", tone: "bad" }, { from: "lb", to: "app2", label: "retry ✗", tone: "bad" }, { from: "lb", to: "app3", label: "retry ✗", tone: "bad" }],
          log: ["*91 upstream prematurely closed connection -> http://172.18.0.4:3000/crash", "*91 upstream prematurely closed connection -> http://172.18.0.2:3000/crash", "*91 upstream prematurely closed connection -> http://172.18.0.3:3000/crash"],
        },
        {
          title: "All three are now marked failed",
          caption: "Each failure marked a server as down, so the very next request didn't reach any server: 502 in 4 ms, \"no live upstreams\".",
          msgs: [{ from: "client", to: "lb", label: "POST /crash" }, { from: "lb", to: "client", label: "502 at once", tone: "bad" }],
          log: ['[error] no live upstreams while connecting to upstream, request: "POST /crash HTTP/1.1", upstream: "http://app_l7/crash"'],
        },
        {
          title: "A POST is tried once",
          caption: "Ten seconds later, a POST to `/crash` reached one server, failed, and came straight back as a 502. Nginx doesn't resend a POST once it's been sent, because the server may have acted on it already.",
          msgs: [{ from: "lb", to: "app2", label: "POST /crash ✗", tone: "bad" }, { from: "lb", to: "client", label: "502", tone: "bad" }],
          log: ['[error] upstream prematurely closed connection while reading response header from upstream, request: "POST /crash HTTP/1.1", upstream: "http://172.18.0.2:3000/crash"'],
          result: { ok: false, text: "GET: 3 attempts · POST: 1" },
        },
      ],
    },
    {
      id: "race",
      label: "The keep-alive 502",
      intro: "Balancers keep idle connections to your app open for reuse. Your app closes idle connections too, on its own timer. When the app's timer is the shorter one, the two can collide.",
      steps: [
        {
          title: "Two timers on one connection",
          caption: "Node.js closes an idle connection after 5 seconds (`keepAliveTimeout`, plus a 1-second buffer in Node 24). Proxies often keep it 60 seconds. For us, the app's side was 1 s + 1 s, to hit the window quickly.",
          badges: { lb: { text: "keeps idle connections" }, app1: { text: "closes idle after ~2 s" } },
        },
        {
          title: "A request leaves just as the app hangs up",
          caption: "At almost exactly 2 seconds of idle, the app closes the connection while the balancer is sending a POST down it. The POST hits a closed socket. It isn't retried, so the user gets a 502.",
          msgs: [{ from: "lb", to: "app1", label: "POST at 1,997 ms", tone: "bad" }, { from: "lb", to: "client", label: "502", tone: "bad" }],
          log: ["# 2 of 63 POSTs, gaps swept from 1,990 to 2,010 ms:", "failures at: 1990ms:502 1997ms:502", '[error] recv() failed (104: Connection reset by peer) while reading response header from upstream', "[error] upstream prematurely closed connection while reading response header from upstream"],
          result: { ok: false, text: "rare, random 502s" },
        },
        {
          title: "Let the balancer close first",
          caption: "Make the balancer give up on idle connections before the app does. We set `keepalive_timeout 500ms` on the upstream; the same sweep then ran 63 for 63. With a cloud balancer, raise the app's timeout above the balancer's instead.",
          badges: { lb: { text: "closes idle after 0.5 s", tone: "ok" }, app1: { text: "closes idle after ~2 s" } },
          log: ['{"200":63} failures at: none'],
          result: { ok: true, text: "0 of 63 failed" },
        },
      ],
    },
  ],
};

/* ------------------------------------------------------------------ CDN */

export const EDGE: FlowData = {
  title: "Between your deploy and your users",
  sub: "a browser, a CDN edge server, and your origin",
  logTitle: "Response headers",
  actors: [
    { id: "browser", label: "Browser", sub: "with its own cache", icon: "browser" },
    { id: "edge", label: "CDN edge", sub: "nearby, e.g. Delhi", icon: "edge" },
    { id: "origin", label: "Origin", sub: "your server", icon: "origin" },
  ],
  scenarios: [
    {
      id: "hit",
      label: "MISS, then HIT",
      intro: "This blog runs on GitHub Pages, which puts the Fastly CDN in front of every site. Here's /about/, read from Delhi.",
      steps: [
        {
          title: "First request: the edge has nothing",
          caption: "The edge has no copy, so it fetches the page from the origin, passes it on and keeps a copy. `X-Cache: MISS` and `Age: 0` say this answer came fresh from the origin.",
          msgs: [{ from: "browser", to: "edge", label: "GET /about/" }, { from: "edge", to: "origin", label: "MISS → fetch" }, { from: "origin", to: "edge", label: "200 · max-age=600" }, { from: "edge", to: "browser", label: "200", tone: "ok" }],
          badges: { edge: { text: "copy: v1 · Age 0" }, browser: { text: "copy: v1, fresh for 600 s" } },
          log: ["Cache-Control: max-age=600", "X-Cache: MISS", "Age: 0", "X-Served-By: cache-del-vibw2260039-DEL"],
        },
        {
          title: "Next request: answered at the edge",
          caption: "Another reader, a few seconds later. The edge answers from its copy and the origin isn't asked at all. `Age` counts how long the copy has been at the edge.",
          msgs: [{ from: "browser", to: "edge", label: "GET /about/" }, { from: "edge", to: "browser", label: "200 · HIT", tone: "ok" }],
          badges: { edge: { text: "copy: v1 · Age 19" }, origin: { text: "not asked", tone: "muted" } },
          log: ["X-Cache: HIT", "Age: 19"],
        },
        {
          title: "Same reader, same page: no request at all",
          caption: "Within the 600 seconds, the browser doesn't even ask. It uses its own copy, and DevTools shows the request as `(disk cache)`. No server, not even the edge, sees it.",
          msgs: [{ from: "browser", to: "browser", label: "(disk cache)", tone: "ok" }],
          badges: { browser: { text: "copy: v1, still fresh" } },
        },
      ],
    },
    {
      id: "deploy",
      label: "You deploy a fix",
      intro: "We watched it happen: we merged a change to this blog and polled /about/ every 10 seconds while GitHub deployed it.",
      steps: [
        {
          title: "Before the deploy: the old copy everywhere",
          caption: "The edge copy was 97 seconds old, with 503 seconds of its 600 still to go. Readers who had the page open had their own copies too.",
          badges: { edge: { text: "v1 · Age 97" }, browser: { text: "v1, fresh" }, origin: { text: "v1" } },
          log: ['20:25:47  X-Cache: HIT  Age: 97  ETag: "6b027a0b-ddc0"'],
        },
        {
          title: "The deploy lands, and GitHub purges the edge",
          caption: "The new files went live at 20:25:53. Thirteen seconds later the edge had already dropped its old copy: a MISS, and the new version. GitHub Pages purges its CDN on every deploy.",
          msgs: [{ from: "browser", to: "edge", label: "GET /about/" }, { from: "edge", to: "origin", label: "MISS → fetch" }, { from: "origin", to: "edge", label: "200 · v2" }, { from: "edge", to: "browser", label: "200 · v2", tone: "ok" }],
          badges: { edge: { text: "v2 · Age 1", tone: "ok" }, origin: { text: "v2", tone: "ok" } },
          log: ['20:26:06  X-Cache: MISS  Age: 1  ETag: "6b09e751-ddc0"', 'Last-Modified: Fri, 27 Nov 2026 20:25:53 GMT'],
        },
        {
          title: "But the browser still shows v1",
          caption: "A reader who loaded the page at 20:25 keeps using their copy until its 600 seconds are up, without asking anyone. Here the stale copy is in the browser, not the CDN, and you can't purge a browser.",
          msgs: [{ from: "browser", to: "browser", label: "v1 from disk cache", tone: "warn" }],
          badges: { browser: { text: "v1, fresh until 20:35", tone: "warn" }, edge: { text: "v2" } },
          result: { ok: false, text: "this reader sees the old version" },
        },
        {
          title: "Ten minutes later, the browser asks again",
          caption: "Once its copy is stale, the browser revalidates, sending the ETag it has. GitHub builds ETags from each file's timestamp and size, so every deploy changes every ETag, and the answer is a full 200 with the new version.",
          msgs: [{ from: "browser", to: "edge", label: 'If-None-Match: "6b027a0b-ddc0"' }, { from: "edge", to: "browser", label: '200 · ETag "6b09e751-ddc0"', tone: "ok" }],
          badges: { browser: { text: "v2", tone: "ok" } },
          result: { ok: true, text: "v2 at last" },
        },
      ],
    },
    {
      id: "query",
      label: "?v=2 to bust it?",
      intro: "A classic trick: add a query string, `/series/?v=2`, so the cache sees a new URL. Whether it works depends on the cache key, and the browser and the CDN may use different ones.",
      steps: [
        {
          title: "The browser treats it as a new URL",
          caption: "The browser's cache key is the full URL, query string included, so it has no copy of `?v=2` and sends a request.",
          msgs: [{ from: "browser", to: "edge", label: "GET /series/?nocache=…" }],
          badges: { browser: { text: "new URL: no copy" } },
        },
        {
          title: "GitHub Pages' edge ignores the query string",
          caption: "The edge answered with the same copy it already had: same ETag, and an Age that kept climbing, 4, then 8, then 11 seconds. For this CDN, `?v=2` is the same page. The trick busts the browser's cache, not the edge's.",
          msgs: [{ from: "edge", to: "browser", label: "200 · HIT · same copy", tone: "warn" }],
          badges: { edge: { text: 'same copy · Age 8', tone: "warn" }, origin: { text: "not asked", tone: "muted" } },
          log: ["bare   HIT  Age: 4   ETag: \"6b027a0b-242fc\"", "?nocache=…  HIT  Age: 8   ETag: \"6b027a0b-242fc\"", "?v=…        HIT  Age: 11  ETag: \"6b027a0b-242fc\""],
          result: { ok: false, text: "same cached copy" },
        },
      ],
    },
    {
      id: "hashed",
      label: "Hashed files",
      intro: "The pattern that makes most of this go away: put a hash of each file's contents in its name, cache those files forever, and keep only the HTML short-lived.",
      steps: [
        {
          title: "A hashed file can be cached forever",
          caption: "nextjs.org serves its scripts as `…/chunks/3bjr1e_6b78k5.js` with `max-age=31536000, immutable`: keep it a year, and don't even ask. That's safe, because changed contents get a new name.",
          msgs: [{ from: "browser", to: "edge", label: "GET …/3bjr1e_6b78k5.js" }, { from: "edge", to: "browser", label: "200 · immutable", tone: "ok" }],
          badges: { browser: { text: "keeps it a year" } },
          log: ["Cache-Control: public,max-age=31536000,immutable", "Age: 109442"],
        },
        {
          title: "A deploy changes the names, not the files",
          caption: "The new build references `…/chunks/<new hash>.js`. No cache anywhere has that name, so every reader fetches the new file at once. Nothing needs purging.",
          msgs: [{ from: "browser", to: "edge", label: "GET …/<new hash>.js" }, { from: "edge", to: "origin", label: "MISS → fetch" }, { from: "edge", to: "browser", label: "200 · new file", tone: "ok" }],
          badges: { edge: { text: "new name: MISS" } },
        },
        {
          title: "Only the HTML has to be checked",
          caption: "The page that lists those names is the one file whose address never changes. Vercel and Netlify send it with `max-age=0, must-revalidate`: browsers check every time, while their edges keep it until the next deploy.",
          msgs: [{ from: "browser", to: "edge", label: "GET / (revalidate)" }, { from: "edge", to: "browser", label: "304 or new HTML", tone: "ok" }],
          log: ["react.dev:  Cache-Control: public, max-age=0, must-revalidate", "            Age: 272288"],
          result: { ok: true, text: "fresh HTML, cached assets" },
        },
      ],
    },
  ],
};
