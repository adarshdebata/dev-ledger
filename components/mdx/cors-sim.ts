/**
 * A browser-side model of the CORS protocol (WHATWG Fetch, "CORS protocol"),
 * with Chrome's console wording. Pure functions only: the playground renders
 * whatever this returns.
 */

export const API_ORIGIN = "https://api.example.com";
export const API_URL = `${API_ORIGIN}/orders`;
export const ALLOWLIST = ["https://app.example.com", "http://localhost:5173"];
const CDN_CACHED_ORIGIN = "https://admin.example.com";

export type Method = "GET" | "HEAD" | "POST" | "PUT" | "PATCH" | "DELETE";
export type ContentType = "none" | "text/plain" | "application/x-www-form-urlencoded" | "multipart/form-data" | "application/json";
export type Credentials = "omit" | "same-origin" | "include";
export type OriginPolicy = "none" | "wildcard" | "allowlist" | "reflect";
export type HeaderName = "Content-Type" | "Authorization" | "X-Request-Id";

export type Config = {
  pageOrigin: string;
  method: Method;
  contentType: ContentType;
  authHeader: boolean;
  requestId: boolean;
  credentials: Credentials;
  server: {
    origin: OriginPolicy;
    allowCredentials: boolean;
    methods: Method[] | "*";
    headers: HeaderName[] | "*";
    expose: boolean;
    maxAge: number | null;
  };
  faults: { crash: boolean; authFirst: boolean; strip: boolean; redirect: boolean; cdn: boolean };
  repeat: boolean;
};

export type Check = { label: string; ok: boolean | null; why?: string };

export type Leg = {
  request: string;
  response: string | null;
  status: number | null;
  checks: Check[];
  ok: boolean;
};

export type Result = {
  sameOrigin: boolean;
  preflightNeeded: boolean;
  reasons: { text: string; unsafe: boolean }[];
  preflight: (Leg & { cached: boolean; cacheNote: string }) | null;
  actual: (Leg & { handlerRan: boolean; effect: string; exposed: boolean }) | null;
  verdict: "same-origin" | "readable" | "blocked-after" | "blocked-before";
  consoleLines: string[];
  js: { expr: string; value: string; bad?: boolean }[];
  serverLog: { line: string; tone: "ok" | "bad" | "muted" }[];
  notes: string[];
};

const SAFE_METHODS: Method[] = ["GET", "HEAD", "POST"];
const SAFE_CT: ContentType[] = ["text/plain", "application/x-www-form-urlencoded", "multipart/form-data"];
const STATUS_TEXT: Record<number, string> = {
  200: "OK",
  201: "Created",
  204: "No Content",
  301: "Moved Permanently",
  401: "Unauthorized",
  500: "Internal Server Error",
};

const statusLine = (s: number) => `HTTP/1.1 ${s} ${STATUS_TEXT[s] ?? ""}`.trim();
const hasBody = (m: Method) => m !== "GET" && m !== "HEAD";
const effectOf = (m: Method) =>
  ({ GET: "read the orders", HEAD: "read the orders", POST: "created an order", PUT: "replaced an order", PATCH: "updated an order", DELETE: "deleted an order" })[m];
const successStatus = (m: Method) => (m === "POST" ? 201 : m === "DELETE" ? 204 : 200);

type H = [name: string, value: string, mark?: "+" | "-" | "!"];
const render = (start: string, headers: H[], extra: string[] = []) =>
  [start, ...headers.map(([n, v, m]) => `${m ? `${m} ` : ""}${n}: ${v}`), ...extra].join("\n");
const get = (hs: H[], name: string) => hs.find(([n, , m]) => m !== "-" && n.toLowerCase() === name.toLowerCase())?.[1] ?? null;

/** Removes Access-Control-* headers but keeps them visible as struck-through lines. */
const strip = (hs: H[]): H[] => hs.map(([n, v, m]) => (n.startsWith("Access-Control-") ? [n, v, "-"] : [n, v, m]));

/** The access-control check every CORS response goes through (Fetch, "CORS check"). */
function corsCheck(hs: H[], origin: string, include: boolean): { checks: Check[]; error: string | null } {
  const checks: Check[] = [];
  const acao = get(hs, "Access-Control-Allow-Origin");
  if (acao === null) {
    checks.push({ label: "Access-Control-Allow-Origin is present", ok: false });
    return { checks, error: "No 'Access-Control-Allow-Origin' header is present on the requested resource." };
  }
  if (acao === "*" && include) {
    checks.push({ label: "Allow-Origin may be * (only without credentials)", ok: false });
    return {
      checks,
      error:
        "The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' when the request's credentials mode is 'include'.",
    };
  }
  if (acao !== "*" && acao !== origin) {
    checks.push({ label: `Allow-Origin equals ${origin}`, ok: false, why: `it says ${acao}` });
    return { checks, error: `The 'Access-Control-Allow-Origin' header has a value '${acao}' that is not equal to the supplied origin.` };
  }
  checks.push({ label: acao === "*" ? "Allow-Origin is * (fine without credentials)" : `Allow-Origin equals ${origin}`, ok: true });
  if (include) {
    const acac = get(hs, "Access-Control-Allow-Credentials");
    if (acac !== "true") {
      checks.push({ label: "Allow-Credentials is exactly true", ok: false });
      return {
        checks,
        error: `The value of the 'Access-Control-Allow-Credentials' header in the response is '${acac ?? ""}' which must be 'true' when the request's credentials mode is 'include'.`,
      };
    }
    checks.push({ label: "Allow-Credentials is exactly true", ok: true });
  }
  return { checks, error: null };
}

export function simulate(c: Config): Result {
  const origin = c.pageOrigin;
  const sameOrigin = origin === API_ORIGIN;
  const include = c.credentials === "include";
  const sendsCookies = sameOrigin ? c.credentials !== "omit" : include;
  const ct = hasBody(c.method) && c.contentType !== "none" ? c.contentType : null;
  const notes: string[] = [];

  const authorHeaders: H[] = [];
  if (ct) authorHeaders.push(["Content-Type", ct === "multipart/form-data" ? "multipart/form-data; boundary=----7d1f" : ct]);
  if (c.authHeader) authorHeaders.push(["Authorization", "Bearer eyJhbGciOi…"]);
  if (c.requestId) authorHeaders.push(["X-Request-Id", "7f3c9a"]);

  // Which parts of the request are outside what an HTML form could already send?
  const reasons: Result["reasons"] = [];
  const unsafeMethod = !SAFE_METHODS.includes(c.method);
  reasons.push(
    unsafeMethod
      ? { text: `${c.method} is not a CORS-safelisted method (only GET, HEAD and POST are)`, unsafe: true }
      : { text: `${c.method} is a CORS-safelisted method`, unsafe: false },
  );
  const unsafeHeaders: string[] = [];
  if (ct && !SAFE_CT.includes(ct)) {
    unsafeHeaders.push("content-type");
    reasons.push({ text: `Content-Type: ${ct} is not one of the three safelisted values`, unsafe: true });
  } else if (ct) {
    reasons.push({ text: `Content-Type: ${ct} is safelisted (an HTML form can send it)`, unsafe: false });
  }
  if (c.authHeader) {
    unsafeHeaders.push("authorization");
    reasons.push({ text: "Authorization is not a CORS-safelisted request header", unsafe: true });
  }
  if (c.requestId) {
    unsafeHeaders.push("x-request-id");
    reasons.push({ text: "X-Request-Id is a custom header", unsafe: true });
  }
  if (!ct && !c.authHeader && !c.requestId) reasons.push({ text: "No custom headers", unsafe: false });
  unsafeHeaders.sort();
  const preflightNeeded = !sameOrigin && (unsafeMethod || unsafeHeaders.length > 0);

  // ---------- Server behaviour ----------
  const policy = c.server.origin;
  const allowedOrigin =
    policy === "wildcard" ? "*" : policy === "reflect" ? origin : policy === "allowlist" && ALLOWLIST.includes(origin) ? origin : null;

  const corsHeaders = (kind: "preflight" | "actual"): H[] => {
    if (policy === "none") return [];
    const hs: H[] = [];
    if (allowedOrigin) hs.push(["Access-Control-Allow-Origin", allowedOrigin]);
    if (c.server.allowCredentials) hs.push(["Access-Control-Allow-Credentials", "true"]);
    if (kind === "preflight") {
      const m = c.server.methods === "*" ? "*" : c.server.methods.join(", ");
      const h = c.server.headers === "*" ? "*" : c.server.headers.join(", ");
      if (m) hs.push(["Access-Control-Allow-Methods", m]);
      if (h) hs.push(["Access-Control-Allow-Headers", h]);
      if (c.server.maxAge !== null) hs.push(["Access-Control-Max-Age", String(c.server.maxAge)]);
    } else if (c.server.expose) {
      hs.push(["Access-Control-Expose-Headers", "X-Request-Id"]);
    }
    if (policy === "allowlist" || policy === "reflect") hs.push(["Vary", "Origin"]);
    return hs;
  };

  const serverLog: Result["serverLog"] = [];
  const consoleLines: string[] = [];
  const blockedPrefix = `Access to fetch at '${API_URL}' from origin '${origin}' has been blocked by CORS policy: `;

  // ---------- Same origin: no CORS at all ----------
  if (sameOrigin) {
    const authFails = c.faults.authFirst && !c.authHeader && !sendsCookies;
    const status = authFails ? 401 : c.faults.crash ? 500 : successStatus(c.method);
    const request = render(`${c.method} /orders HTTP/1.1`, [
      ["Host", "api.example.com"],
      ...(hasBody(c.method) ? ([["Origin", origin]] as H[]) : []),
      ...authorHeaders,
      ...(sendsCookies ? ([["Cookie", "session=4b1d…"]] as H[]) : []),
    ]);
    const response = render(statusLine(status), [["Content-Type", status === 500 ? "text/html" : "application/json"]]);
    serverLog.push({ line: `${c.method} /orders → ${status}${status < 300 ? `  (${effectOf(c.method)})` : ""}`, tone: status < 300 ? "ok" : "bad" });
    notes.push("Page and API share scheme, host and port, so the browser never runs a CORS check. Even a 500 is readable.");
    return {
      sameOrigin,
      preflightNeeded: false,
      reasons: [],
      preflight: null,
      actual: { request, response, status, checks: [], ok: true, handlerRan: !authFails, effect: effectOf(c.method), exposed: false },
      verdict: "same-origin",
      consoleLines,
      js: [
        { expr: "res.status", value: String(status) },
        { expr: "res.ok", value: String(status < 300) },
      ],
      serverLog,
      notes,
    };
  }

  // ---------- Preflight ----------
  let preflight: Result["preflight"] = null;
  if (preflightNeeded) {
    const request = render(
      `OPTIONS /orders HTTP/1.1`,
      [
        ["Host", "api.example.com"],
        ["Origin", origin, "+"],
        ["Access-Control-Request-Method", c.method, "+"],
        ...(unsafeHeaders.length ? ([["Access-Control-Request-Headers", unsafeHeaders.join(","), "+"]] as H[]) : []),
      ],
      ["# no Cookie, no Authorization: preflights never carry credentials"],
    );

    let status: number;
    let hs: H[];
    if (c.faults.redirect) {
      status = 301;
      hs = [["Location", `${API_URL}/`, "!"]];
    } else if (c.faults.authFirst) {
      status = 401;
      hs = [["WWW-Authenticate", "Bearer", "!"]];
    } else if (policy === "none") {
      status = 200;
      hs = [["Allow", "GET, HEAD, POST"]];
    } else {
      status = 204;
      hs = corsHeaders("preflight");
    }
    if (c.faults.strip) hs = strip(hs);
    if (!get(hs, "Access-Control-Allow-Origin") && !hs.some(([n]) => n === "Access-Control-Allow-Origin")) {
      hs.push(["Access-Control-Allow-Origin", "…", "-"]);
    }

    const checks: Check[] = [];
    let error: string | null = null;
    const pfx = "Response to preflight request doesn't pass access control check: ";

    if (status >= 300 && status < 400) {
      checks.push({ label: "Preflight was not redirected", ok: false, why: `${status} → ${API_URL}/` });
      error = pfx + "Redirect is not allowed for a preflight request.";
    } else {
      const access = corsCheck(hs, origin, include);
      checks.push(...access.checks);
      if (access.error) error = pfx + access.error;
      else if (status < 200 || status > 299) {
        checks.push({ label: "Status is 2xx", ok: false, why: `got ${status}` });
        error = pfx + "It does not have HTTP ok status.";
      } else {
        checks.push({ label: `Status ${status} is 2xx`, ok: true });
        const methods = (get(hs, "Access-Control-Allow-Methods") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
        if (unsafeMethod) {
          const wildcard = methods.includes("*") && !include;
          const ok = methods.includes(c.method) || wildcard;
          checks.push({
            label: wildcard ? `Allow-Methods * covers ${c.method}` : `Allow-Methods lists ${c.method}`,
            ok,
            why: !ok && methods.includes("*") ? "with credentials, * is just a method named \"*\"" : undefined,
          });
          if (!ok) error = `Method ${c.method} is not allowed by Access-Control-Allow-Methods in preflight response.`;
        }
        if (!error) {
          const allowed = (get(hs, "Access-Control-Allow-Headers") ?? "")
            .split(",")
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);
          for (const name of unsafeHeaders) {
            const listed = allowed.includes(name);
            const wildcardCovers = allowed.includes("*") && !include && name !== "authorization";
            const ok = listed || wildcardCovers;
            checks.push({
              label: listed ? `Allow-Headers lists ${name}` : `Allow-Headers covers ${name}`,
              ok,
              why:
                !ok && allowed.includes("*")
                  ? name === "authorization"
                    ? "* never covers Authorization"
                    : "with credentials, * is just a header named \"*\""
                  : undefined,
            });
            if (!ok) {
              error = `Request header field ${name} is not allowed by Access-Control-Allow-Headers in preflight response.`;
              break;
            }
          }
        }
      }
    }

    const ok = error === null;
    const maxAge = c.server.maxAge;
    const effective = maxAge === null ? 5 : Math.min(maxAge, 7200);
    let cached = false;
    let cacheNote = "";
    if (ok) {
      if (maxAge === 0) cacheNote = "Max-Age 0: the browser won't cache this preflight.";
      else if (maxAge === null) cacheNote = "No Max-Age: the browser caches this preflight for just 5 seconds.";
      else if (maxAge > 7200) cacheNote = `Max-Age ${maxAge}: Chrome caps the cache at 7200 seconds (2 hours).`;
      else cacheNote = `Cached for ${maxAge} seconds for this origin, URL and credentials mode.`;
      if (c.repeat && effective >= 60) cached = true;
    }

    serverLog.push(
      cached
        ? { line: "OPTIONS /orders  (not sent: answered from the preflight cache)", tone: "muted" }
        : { line: `OPTIONS /orders → ${status}`, tone: status < 300 ? "ok" : "bad" },
    );
    preflight = { request, response: render(statusLine(status), hs), status, checks, ok, cached, cacheNote };
    if (!ok) {
      consoleLines.push(blockedPrefix + error);
      consoleLines.push(`${c.method} ${API_URL} net::ERR_FAILED`);
    }
  }

  // ---------- Actual request ----------
  let actual: Result["actual"] = null;
  if (!preflight || preflight.ok) {
    const request = render(`${c.method} /orders HTTP/1.1`, [
      ["Host", "api.example.com"],
      ["Origin", origin, "+"],
      ...authorHeaders,
      ...(sendsCookies ? ([["Cookie", "session=4b1d…", "+"]] as H[]) : []),
    ]);

    let status: number;
    let hs: H[];
    let handlerRan = true;
    if (c.faults.authFirst && !c.authHeader && !sendsCookies) {
      status = 401;
      hs = [["WWW-Authenticate", "Bearer", "!"]];
      handlerRan = false;
    } else if (c.faults.crash) {
      status = 500;
      hs = [["Content-Type", "text/html"]];
    } else {
      status = successStatus(c.method);
      hs = [
        ...(status === 204 ? [] : ([["Content-Type", "application/json"]] as H[])),
        ["X-Request-Id", "req_7f3c9a"],
        ...corsHeaders("actual"),
      ];
      const dynamicOrigin = policy === "allowlist" || policy === "reflect";
      if (c.faults.cdn && (c.method === "GET" || c.method === "HEAD") && dynamicOrigin) {
        hs = hs
          .filter(([n]) => n !== "Vary")
          .map(([n, v, m]) => (n === "Access-Control-Allow-Origin" ? [n, CDN_CACHED_ORIGIN, "!"] : [n, v, m]));
        if (!hs.some(([n]) => n === "Access-Control-Allow-Origin")) hs.push(["Access-Control-Allow-Origin", CDN_CACHED_ORIGIN, "!"]);
        hs.push(["X-Cache", "HIT", "!"]);
      } else if (c.faults.cdn) {
        notes.push(
          c.method === "GET" || c.method === "HEAD"
            ? "The CDN fault only bites when the API echoes back a per-origin Allow-Origin: a fixed * is the same for everyone."
            : "The CDN fault only affects cacheable GET responses.",
        );
      }
    }
    if (c.faults.strip) hs = strip(hs);
    if (!hs.some(([n]) => n === "Access-Control-Allow-Origin")) hs.push(["Access-Control-Allow-Origin", "…", "-"]);

    const access = corsCheck(hs, origin, include);
    const ok = access.error === null;
    if (!ok) {
      consoleLines.push(
        blockedPrefix +
          access.error +
          (access.error!.startsWith("No 'Access") ? " If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled." : ""),
      );
      consoleLines.push(`${c.method} ${API_URL} net::ERR_FAILED ${status} (${STATUS_TEXT[status]})`);
    }
    serverLog.push({
      line: `${c.method} /orders → ${status}${handlerRan ? (status < 300 ? `  (handler ran: ${effectOf(c.method)})` : "  (handler ran, then threw)") : "  (rejected by auth middleware)"}`,
      tone: status < 300 ? "ok" : "bad",
    });
    const exposed = (get(hs, "Access-Control-Expose-Headers") ?? "").toLowerCase().includes("x-request-id");
    actual = { request, response: render(statusLine(status), hs), status, checks: access.checks, ok, handlerRan, effect: effectOf(c.method), exposed };
  } else {
    serverLog.push({ line: `${c.method} /orders  (never sent: the preflight failed)`, tone: "muted" });
  }

  // ---------- What JavaScript gets ----------
  let js: Result["js"];
  let verdict: Result["verdict"];
  if (actual?.ok) {
    verdict = "readable";
    js = [
      { expr: "res.status", value: String(actual.status) },
      { expr: "res.ok", value: String((actual.status ?? 0) < 300) },
      { expr: "res.headers.get('Content-Type')", value: actual.status === 204 ? "null" : "'application/json'" },
      {
        expr: "res.headers.get('X-Request-Id')",
        value: actual.exposed ? "'req_7f3c9a'" : "null  // not in Expose-Headers",
        bad: !actual.exposed,
      },
    ];
  } else {
    verdict = actual ? "blocked-after" : "blocked-before";
    js = [
      { expr: "await fetch(…)", value: "TypeError: Failed to fetch", bad: true },
      { expr: "status, headers, body", value: "none of it is readable", bad: true },
    ];
  }

  if (include && origin === "https://attacker.example") {
    notes.push(
      "attacker.example is a different site, so cookies are only attached if they were set with SameSite=None; Secure. app.example.com and api.example.com are the same site, so default (Lax) cookies go along.",
    );
  }
  if (policy === "reflect" && include && c.server.allowCredentials) {
    notes.push("Reflecting any Origin together with Allow-Credentials lets every website read your users' authenticated data. Use an allowlist.");
  }

  return { sameOrigin, preflightNeeded, reasons, preflight, actual, verdict, consoleLines, js, serverLog, notes };
}

// ---------- Code generation ----------

export function fetchCode(c: Config) {
  const url = c.pageOrigin === API_ORIGIN ? "/orders" : API_URL;
  const lines = [`const res = await fetch('${url}', {`];
  if (c.method !== "GET") lines.push(`  method: '${c.method}',`);
  if (c.credentials !== "same-origin") lines.push(`  credentials: '${c.credentials}',`);
  const headers: string[] = [];
  const ct = hasBody(c.method) && c.contentType !== "none" ? c.contentType : null;
  if (ct && ct !== "multipart/form-data") headers.push(`    'Content-Type': '${ct}',`);
  if (c.authHeader) headers.push(`    'Authorization': \`Bearer \${token}\`,`);
  if (c.requestId) headers.push(`    'X-Request-Id': crypto.randomUUID(),`);
  if (headers.length) lines.push("  headers: {", ...headers, "  },");
  if (ct === "application/json") lines.push("  body: JSON.stringify({ item: 'book', qty: 1 }),");
  else if (ct === "text/plain") lines.push("  body: 'item=book;qty=1',");
  else if (ct === "application/x-www-form-urlencoded") lines.push("  body: new URLSearchParams({ item: 'book', qty: '1' }),");
  else if (ct === "multipart/form-data") lines.push("  body: formData, // the browser sets the multipart Content-Type itself");
  lines.push("});");
  return lines.join("\n");
}

export function serverCode(c: Config) {
  const s = c.server;
  const out: string[] = [];
  if (c.faults.authFirst) out.push("app.use(requireAuth); // runs first: a preflight has no credentials, so it gets 401");
  if (s.origin === "none") {
    out.push("// No CORS middleware: the API never sends Access-Control-* headers.");
  } else {
    const origin =
      s.origin === "wildcard"
        ? "'*'"
        : s.origin === "reflect"
          ? "true, // reflects whatever Origin arrives"
          : `[${ALLOWLIST.map((o) => `'${o}'`).join(", ")}]`;
    out.push("app.use(cors({");
    out.push(`  origin: ${origin}${s.origin === "reflect" ? "" : ","}`);
    if (s.allowCredentials) out.push("  credentials: true,");
    out.push(`  methods: ${s.methods === "*" ? "'*'" : `[${s.methods.map((m) => `'${m}'`).join(", ")}]`},`);
    out.push(`  allowedHeaders: ${s.headers === "*" ? "'*'" : `[${s.headers.map((h) => `'${h}'`).join(", ")}]`},`);
    if (s.expose) out.push("  exposedHeaders: ['X-Request-Id'],");
    if (s.maxAge !== null) out.push(`  maxAge: ${s.maxAge},`);
    out.push("}));");
  }
  if (c.faults.crash) out.push("", "// The route throws, and the 500 comes from a layer that never adds CORS headers.");
  if (c.faults.redirect) out.push("", "// Something in front 301-redirects /orders to /orders/ before CORS runs.");
  if (c.faults.strip) out.push("", "// A proxy in front drops Access-Control-* headers on the way out.");
  if (c.faults.cdn) out.push("", "// A CDN caches GET /orders without Vary: Origin, keyed only on the URL.");
  return out.join("\n");
}
