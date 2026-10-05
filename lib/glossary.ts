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
} as const;

export type GlossaryId = keyof typeof glossary;
