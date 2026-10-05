export const site = {
  name: "Dev Ledger",
  url: "https://adarshdebata.github.io/dev-ledger",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",
  description:
    "A running record of backend engineering: practical, interactive deep dives for developers, from students to seniors.",
  theme: "Engineering Under the Hood",
  tagline: "Understand the systems behind the code you write every day.",
  hook: "You use it every day. But do you actually know what happens underneath?",
  author: {
    name: "Adarsh Kumar Debata",
    role: "Backend developer · fintech and digital payments",
    github: "https://github.com/adarshdebata",
  },
  repo: "https://github.com/adarshdebata/dev-ledger",
  pageSize: 10,
};

/** Absolute URL for a site path such as "/posts/x/". */
export const absoluteUrl = (path = "/") => `${site.url}${path}`;

/** Page metadata alternates: a canonical URL plus the RSS feed (Next merges metadata shallowly). */
export const alternates = (canonical: string) => ({
  canonical,
  types: { "application/rss+xml": [{ url: "/rss.xml", title: "Dev Ledger" }] },
});

/** Path with the GitHub Pages base path, for places next/link doesn't handle. */
export const withBase = (path: string) => `${site.basePath}${path}`;

export type SeriesInfo = { n: number; title: string; blurb: string };

export const series: SeriesInfo[] = [
  { n: 1, title: "The Web You Think You Understand", blurb: "HTTP, browsers, DNS, TCP and TLS: the layers every request quietly passes through." },
  { n: 2, title: "Things We Install Without Understanding", blurb: "Helmet, Nginx, CDNs, proxies and npm: the tools on every stack, opened up." },
  { n: 3, title: "Docker Under the Hood", blurb: "Images, layers, namespaces and cgroups: what a container really is." },
  { n: 4, title: "Databases Under the Hood", blurb: "Indexes, transactions, locks and WAL: what your queries set in motion." },
  { n: 5, title: "Distributed Systems", blurb: "Timeouts, retries, idempotency and queues: what changes once a network is involved." },
];

export const getSeries = (n: number) => series.find((s) => s.n === n);

export type ChainId = "request" | "payment";
export type ChainStage = { name: string; roadmap: number[]; note: string };
export type Chain = { id: ChainId; title: string; blurb: string; stages: ChainStage[] };

export const chains: Chain[] = [
  {
    id: "request",
    title: "Follow One Request",
    blurb: "One click, traced from the browser to the database and back: every hop gets its own article.",
    stages: [
      { name: "Browser", roadmap: [1, 3, 9, 10, 11], note: "Same-origin policy, CORS and what fetch() really does." },
      { name: "DNS", roadmap: [15, 16], note: "Turning a name into an address, and what happens when that fails." },
      { name: "TCP", roadmap: [17, 18, 19], note: "Handshakes, connections and keep-alive." },
      { name: "TLS", roadmap: [13, 14], note: "How a browser decides to trust a server." },
      { name: "HTTP", roadmap: [2, 4, 5, 6, 20], note: "Methods, status codes, headers and protocol versions." },
      { name: "CDN", roadmap: [25, 26], note: "Edge caches and why Cloudflare sits in front of everything." },
      { name: "Load balancer", roadmap: [24], note: "What exactly is being balanced." },
      { name: "Reverse proxy", roadmap: [22, 23, 32], note: "Nginx and friends: the server in front of your server." },
      { name: "Node.js", roadmap: [39, 40], note: "What happens when your process starts listening." },
      { name: "Middleware", roadmap: [21], note: "The pipeline every request walks through." },
      { name: "Authentication", roadmap: [7, 8], note: "Sessions, cookies and who the request belongs to." },
      { name: "Database", roadmap: [61, 76], note: "Queries, connections and pools." },
      { name: "Response", roadmap: [5], note: "The trip back, and what the browser does with it." },
    ],
  },
  {
    id: "payment",
    title: "Follow One Payment",
    blurb: "A single payment, traced from the button click to settlement and reconciliation.",
    stages: [
      { name: "User", roadmap: [], note: "A tap on a Pay button starts a long journey." },
      { name: "Frontend", roadmap: [], note: "What the client must get right before anything is sent." },
      { name: "API", roadmap: [81, 82], note: "The first network hop, and the first place things can time out." },
      { name: "Authentication", roadmap: [8], note: "Proving who is paying." },
      { name: "Payment service", roadmap: [99], note: "Where a payment becomes a record with a lifecycle." },
      { name: "Idempotency", roadmap: [87, 88, 89], note: "Making sure one click is one payment." },
      { name: "Database", roadmap: [66, 67, 68], note: "Transactions that must never half-happen." },
      { name: "Queue", roadmap: [92, 93, 94], note: "Outboxes, consumers and duplicate messages." },
      { name: "PSP", roadmap: [83, 84], note: "Calling a provider you don't control." },
      { name: "Bank", roadmap: [100], note: "Where the money actually moves." },
      { name: "Settlement", roadmap: [100], note: "When a payment is really final." },
      { name: "Reconciliation", roadmap: [], note: "Proving every record matches every rupee." },
    ],
  },
];

export const getChain = (id: string) => chains.find((c) => c.id === id);

export type RoadmapItem = { n: number; series: number; title: string };

const roadmapTitles: string[] = [
  // Series 1
  "What actually happens when you type a URL and press Enter?",
  "What is an HTTP request, really?",
  "What actually happens when you call fetch()?",
  "HTTP methods aren't just GET, POST, PUT and DELETE",
  "HTTP status codes: what 200, 201, 204, 400 and 500 actually mean",
  "Headers: the metadata travelling with every request",
  "Cookies vs localStorage vs sessionStorage",
  "What is a session, and where does it actually live?",
  "What is CORS and why does your browser care?",
  "CORS is not a server-to-server security mechanism",
  "Preflight requests: why did my browser send OPTIONS?",
  "What is CSRF and how is it different from CORS?",
  "What is HTTPS actually doing?",
  "TLS: how does a browser trust a server?",
  "What is DNS, and why isn't a domain name an IP address?",
  "What happens when DNS goes wrong?",
  "TCP vs HTTP: they are not the same thing",
  "Why does TCP need a handshake?",
  "HTTP keep-alive: why doesn't every request open a new connection?",
  "HTTP/1.1 vs HTTP/2 vs HTTP/3: what actually changed?",
  // Series 2
  "You installed Helmet. What did it actually change?",
  "What does a reverse proxy actually do?",
  "Nginx isn't a magical \"server\"",
  "What is a load balancer actually balancing?",
  "What is a CDN actually doing?",
  "Why does Cloudflare sit in front of so many websites?",
  "What is a firewall actually blocking?",
  "What is a port?",
  "What does localhost actually mean?",
  "127.0.0.1 vs 0.0.0.0: why does my app work locally but not in Docker?",
  "What is a proxy?",
  "Forward proxy vs reverse proxy",
  "What does curl actually do?",
  "What does Postman actually do?",
  "What happens when you run npm install?",
  "What is node_modules, and why is it so huge?",
  "What does package-lock.json actually lock?",
  "npm vs pnpm: what is actually different?",
  "What happens when you run a Node.js application?",
  "What does \"port already in use\" actually mean?",
  // Series 3
  "What is a Docker container, actually?",
  "A container is not a lightweight VM",
  "What actually happens when you run docker run?",
  "Docker images are not containers",
  "What is a Docker layer?",
  "Why does Docker build cache work?",
  "What is a Dockerfile actually producing?",
  "Why does COPY order matter in Docker?",
  "What are Linux namespaces?",
  "What are cgroups and why does Docker need them?",
  "How does a container get its own network?",
  "Why can two containers talk to each other by name?",
  "What actually happens when you run docker compose up?",
  "Why does my container have internet access?",
  "What happens to data when a container dies?",
  "Volumes vs bind mounts",
  "Why does my Docker image have 1 GB of dependencies?",
  "Multi-stage builds explained from first principles",
  "Distroless images: what did we remove?",
  "Docker security: what isolation does a container actually provide?",
  // Series 4
  "What actually happens when you run SELECT?",
  "Why does a database need an index?",
  "B-trees explained without making them boring",
  "Why can an index make a query slower?",
  "What actually happens during an INSERT?",
  "What is a database transaction?",
  "ACID explained with a real transaction",
  "What happens when two transactions modify the same row?",
  "Database locks: what are we actually locking?",
  "Isolation levels: why can't everyone just read the latest data?",
  "What is a deadlock?",
  "What happens when your database crashes during a write?",
  "What is WAL and why does PostgreSQL need it?",
  "Replication: why do we have more than one database?",
  "Why can a read replica return old data?",
  "Connection pools: why don't we open a connection per request?",
  "What happens when the connection pool is exhausted?",
  "N+1 queries: the problem hiding inside innocent code",
  "Offset pagination vs cursor pagination",
  "Soft delete: convenient pattern or future problem?",
  // Series 5
  "Your function call is reliable. Your network call isn't.",
  "What actually happens when a network request times out?",
  "A timeout does not mean the operation failed",
  "Why retrying a request can create a bigger problem",
  "Exponential backoff explained",
  "Why random jitter exists",
  "What is idempotency?",
  "Why payment APIs need idempotency keys",
  "How do you prevent the same payment from happening twice?",
  "At-most-once vs at-least-once vs exactly-once",
  "Why \"exactly once\" is harder than it sounds",
  "What happens when your database succeeds but Kafka fails?",
  "The transactional outbox pattern",
  "What happens when a Kafka consumer processes the same message twice?",
  "What is eventual consistency?",
  "Why distributed systems can't always agree immediately",
  "What happens when Redis goes down?",
  "Circuit breakers: why stop calling a broken service?",
  "How a payment actually moves through a system",
  "A ₹100 payment: from button click to bank settlement",
];

export const roadmap: RoadmapItem[] = roadmapTitles.map((title, i) => ({
  n: i + 1,
  series: Math.floor(i / 20) + 1,
  title,
}));

export const external = {
  title: "npm to pnpm Migration",
  blurb: "A real migration story: the undeclared dependency pnpm exposed, a Jest 30 surprise, and the Docker build we had been getting wrong.",
  url: "https://adarshdebata.github.io/npm-to-pnpm-migration/",
};
