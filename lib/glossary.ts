/**
 * Plain-language definitions shown when a reader hovers or taps a keyword
 * (`<Term id="origin">` in MDX). Keep each one short enough to read in a few seconds.
 */
export const glossary = {
  origin: {
    term: "Origin",
    def: "A website's home address: its scheme (http or https), its domain and its port. https://app.example.com and https://api.example.com are two different origins.",
  },
  cors: {
    term: "CORS",
    def: "Cross-Origin Resource Sharing. Rules that let a server say which other websites may read its answers inside a browser.",
  },
  "same-origin-policy": {
    term: "Same-origin policy",
    def: "The browser's basic safety rule: a page from one website can't read data from another website unless that website allows it.",
  },
  preflight: {
    term: "Preflight",
    def: "A quick “may I?” request (method OPTIONS) that the browser sends before some requests, to check the server will accept them.",
  },
  header: {
    term: "Header",
    def: "A small label sent along with a request or a response, like Content-Type: application/json. It carries extra details, not the main content.",
  },
  "status-code": {
    term: "Status code",
    def: "The three-digit number in every response that says how it went: 200 means OK, 404 means not found, 500 means the server failed.",
  },
  response: {
    term: "Response",
    def: "What the server sends back: a status code, some headers and usually a body, such as JSON.",
  },
  credentials: {
    term: "Credentials",
    def: "Things that prove who you are, mainly cookies. In fetch, credentials: 'include' tells the browser to send cookies to another website too.",
  },
  cookie: {
    term: "Cookie",
    def: "A small piece of data a website keeps in your browser. The browser sends it back with each request, which is how sites remember you're logged in.",
  },
  "simple-request": {
    term: "Simple request",
    def: "A request that a normal HTML form could already send: GET, HEAD or POST with only basic headers. The browser sends it without a preflight.",
  },
  fetch: {
    term: "fetch()",
    def: "The built-in JavaScript function a web page uses to make network requests.",
  },
  api: {
    term: "API",
    def: "A server that programs talk to instead of people. You send it an HTTP request and it usually replies with JSON.",
  },
  middleware: {
    term: "Middleware",
    def: "A function that runs on every request before your route code, for example to check the login or add headers.",
  },
  csrf: {
    term: "CSRF",
    def: "Cross-Site Request Forgery: another website tricks your browser into sending a request to a site you're logged in to, using your cookies.",
  },
  cdn: {
    term: "CDN",
    def: "Content Delivery Network: servers around the world that keep copies of your responses so people get them faster.",
  },
  proxy: {
    term: "Proxy",
    def: "A server that sits in front of your app and passes requests along to it. Nginx is a common example.",
  },
  cache: {
    term: "Cache",
    def: "A saved copy of an answer that can be reused instead of asking the server again.",
  },
  redirect: {
    term: "Redirect",
    def: "A response that says “go to this other URL instead”, using a 3xx status code such as 301 or 302.",
  },
  wildcard: {
    term: "Wildcard",
    def: "The * symbol, which means “anything” or “anyone”.",
  },
  allowlist: {
    term: "Allowlist",
    def: "A list of the only values you accept, such as the websites that may call your API.",
  },
  authentication: {
    term: "Authentication",
    def: "Checking who is making a request, for example with a login cookie or a token.",
  },
  token: {
    term: "Token",
    def: "A long string that proves who you are, usually sent in the Authorization header as “Bearer <token>”.",
  },
  port: {
    term: "Port",
    def: "A number that decides which program on a computer receives the traffic, like 443 for HTTPS or 3000 for a dev server.",
  },
  localhost: {
    term: "localhost",
    def: "Your own computer. localhost:3000 means port 3000 on the machine you're using.",
  },
  devtools: {
    term: "DevTools",
    def: "The developer tools built into your browser (press F12). The Console tab shows errors; the Network tab shows every request.",
  },
  "forbidden-header": {
    term: "Forbidden header",
    def: "A header that only the browser may set. JavaScript can't change it, so a web page can't fake its Origin.",
  },
  "opaque-response": {
    term: "Opaque response",
    def: "A response the browser hands over but won't let you look inside: no status, no headers, no body.",
  },
  "max-age": {
    term: "Max-Age",
    def: "How many seconds the browser may remember a preflight answer before asking again.",
  },
  vary: {
    term: "Vary",
    def: "A response header that tells caches the answer depends on part of the request. Vary: Origin means “different websites may get different answers”.",
  },
  idempotent: {
    term: "Idempotent",
    def: "Safe to repeat: doing it twice has the same effect as doing it once. Reading data is idempotent; placing an order usually isn't.",
  },
  xss: {
    term: "XSS",
    def: "Cross-site scripting: an attacker gets their own JavaScript to run inside your page, for example through a comment your site displays without escaping it.",
  },
  clickjacking: {
    term: "Clickjacking",
    def: "Another site loads your page in an invisible frame and tricks people into clicking buttons on it, like “Transfer” or “Delete account”.",
  },
  csp: {
    term: "Content-Security-Policy",
    def: "A header that tells the browser which scripts, styles, images and frames a page may use. Anything not on the list is blocked.",
  },
  hsts: {
    term: "HSTS",
    def: "HTTP Strict Transport Security: a header that tells the browser to use only HTTPS for your site, for a set number of seconds.",
  },
  "mime-type": {
    term: "MIME type",
    def: "The label that says what a file is, sent in the Content-Type header: text/html, image/png, application/json and so on.",
  },
  iframe: {
    term: "iframe",
    def: "An HTML element that shows one web page inside another, like a window in the wall.",
  },
  referer: {
    term: "Referer",
    def: "A request header that tells a site which page the user came from. (It really is spelled with one r: a typo in the early HTTP specs that stuck.)",
  },
  mitm: {
    term: "Man-in-the-middle",
    def: "Someone between you and the server, such as a fake Wi-Fi hotspot, who can read or change traffic that isn't encrypted.",
  },
  nonce: {
    term: "Nonce",
    def: "A random value made fresh for each response. A CSP can say “only run inline scripts that carry this exact nonce”.",
  },
  spectre: {
    term: "Spectre",
    def: "A family of CPU flaws that can let code on one web page read memory belonging to another page in the same browser process.",
  },
  dns: {
    term: "DNS",
    def: "The Domain Name System: the internet's phone book. It turns a name like api.example.com into an IP address.",
  },
  "ip-address": {
    term: "IP address",
    def: "The numeric address of a machine on the internet, like 203.0.113.10. Networks deliver to addresses, not names.",
  },
  resolver: {
    term: "DNS resolver",
    def: "The server that looks up names for you, usually run by your internet provider, your company or a public DNS service. It remembers answers for a while.",
  },
  tcp: {
    term: "TCP",
    def: "The protocol that gives two machines a reliable, ordered connection. It opens with a three-message handshake: SYN, SYN-ACK, ACK.",
  },
  tls: {
    term: "TLS",
    def: "The encryption behind HTTPS. Before any data moves, both sides agree on keys and the browser checks the server's certificate. DevTools still calls it SSL, its old name.",
  },
  certificate: {
    term: "Certificate",
    def: "A server's ID card for HTTPS: which domain it belongs to, who vouched for it, and when it expires. Browsers refuse expired ones, ones for the wrong name, and ones from an issuer they don't trust.",
  },
  "round-trip": {
    term: "Round trip",
    def: "The time for a message to reach the other side and for the reply to come back. Distance alone costs about 1 ms of round trip for every 100 km.",
  },
  ttfb: {
    term: "TTFB",
    def: "Time to first byte: how long from sending a request until the first byte of the response arrives. It includes the trip there and back, not just the server's work.",
  },
  "connection-reuse": {
    term: "Connection reuse",
    def: "Keeping a connection open after a response, so the next request to the same server skips DNS, the TCP handshake and TLS. HTTP/1.1 calls it keep-alive.",
  },
  http2: {
    term: "HTTP/2",
    def: "A newer version of HTTP that carries many requests at once over a single connection, so they don't queue behind HTTP/1.1's limit of six connections per server.",
  },
  compression: {
    term: "Compression",
    def: "Shrinking a response before it's sent, usually with gzip or Brotli. Text such as JSON and HTML often gets 70–90% smaller.",
  },
  ttl: {
    term: "TTL",
    def: "Time to live: how many seconds a DNS answer may be kept in a cache before it has to be asked for again.",
  },
  nxdomain: {
    term: "NXDOMAIN",
    def: "The DNS answer for “this name doesn't exist”. Caches remember that “no” too, for a time the domain sets.",
  },
  "authoritative-server": {
    term: "Authoritative name server",
    def: "The server that holds a domain's real records, set up by whoever runs the domain. Every other answer you get is a copy.",
  },
  "root-server": {
    term: "Root server",
    def: "The top of DNS. Root servers don't know any website's address; they only say which servers handle .com, .org, .in and the rest.",
  },
  tld: {
    term: "TLD",
    def: "Top-level domain: the last part of a name, like .com, .org or .in. Each one has its own set of servers.",
  },
  "hosts-file": {
    term: "Hosts file",
    def: "A small text file on your computer that maps names to addresses. It's checked before DNS, so a stale line in it overrides everything.",
  },
  "a-record": {
    term: "A record",
    def: "A DNS record that maps a name to an IPv4 address. An AAAA record does the same for an IPv6 address.",
  },
  cname: {
    term: "CNAME",
    def: "A DNS record that says “this name is really that other name”, so the resolver goes on to look up the other one.",
  },
  "search-suffix": {
    term: "DNS search suffix",
    def: "A domain your computer adds to names, so typing “wiki” can mean wiki.corp.example. Windows' nslookup adds it even to names that already have dots.",
  },
  "snowflake-id": {
    term: "Snowflake ID",
    def: "A 64-bit number built from the current time, a machine number and a counter. Any server can make one without asking a database, and they sort roughly by time. Twitter made the idea popular.",
  },
  "bit-shift": {
    term: "Bit shift",
    def: "Sliding a number's bits left or right. Shifting left by 22 multiplies by 2^22 (4,194,304) and leaves 22 empty bits at the bottom for other data.",
  },
  "safe-integer": {
    term: "Safe integer",
    def: "A whole number a JavaScript number can hold exactly: up to 9,007,199,254,740,991 (2^53 − 1). Above that, some whole numbers can't be stored, and they round to a neighbour.",
  },
  bigint: {
    term: "BigInt",
    def: "JavaScript's whole-number type with no size limit, written with an n on the end: 42n. It never rounds, but it can't be mixed with ordinary numbers in maths.",
  },
  upsert: {
    term: "Upsert",
    def: "Update or insert: a write that adds the row if its key is new, and quietly replaces the old row if the key already exists. No error either way.",
  },
} as const;

export type GlossaryId = keyof typeof glossary;
