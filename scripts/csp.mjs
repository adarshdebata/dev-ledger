// Adds a strict Content-Security-Policy to every exported page.
//
// GitHub Pages can't send response headers, so the policy goes in a <meta http-equiv> tag.
// Next.js writes a few inline <script>s into each page; instead of allowing all inline code
// ('unsafe-inline'), each one is allowed by its SHA-256 hash, so nothing else can run.
// Limits of a <meta> policy: frame-ancestors, report-uri and sandbox are ignored there.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");
const JS_TYPES = new Set(["", "text/javascript", "application/javascript", "module"]);

function* htmlFiles(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(full);
    else if (entry.name.endsWith(".html")) yield full;
  }
}

function policy(hashes) {
  return [
    "default-src 'self'",
    // 'wasm-unsafe-eval' lets Pagefind compile its WebAssembly search engine; it does not allow eval().
    `script-src 'self' 'wasm-unsafe-eval' ${hashes.map((h) => `'sha256-${h}'`).join(" ")}`.trim(),
    // React, Motion and Shiki set style="" attributes; styles can't run code.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

let pages = 0;
let scripts = 0;
for (const file of htmlFiles(OUT)) {
  let html = fs.readFileSync(file, "utf8");
  if (html.includes('http-equiv="Content-Security-Policy"')) continue;

  const hashes = new Set();
  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=/i.test(attrs) || body.length === 0) continue;
    const type = (/\btype\s*=\s*["']?([^"'\s>]+)/i.exec(attrs)?.[1] ?? "").toLowerCase();
    if (!JS_TYPES.has(type)) continue; // data blocks such as JSON-LD never run
    hashes.add(crypto.createHash("sha256").update(body, "utf8").digest("base64"));
  }

  const meta = `<meta http-equiv="Content-Security-Policy" content="${policy([...hashes])}"/>`;
  // Right after the charset declaration, so it's in force before any script or stylesheet loads.
  const charset = /<meta charSet="utf-8"\s*\/?>/i;
  html = charset.test(html) ? html.replace(charset, (m) => m + meta) : html.replace(/<head[^>]*>/i, (m) => m + meta);
  fs.writeFileSync(file, html);
  pages++;
  scripts += hashes.size;
}
console.log(`csp: ${pages} page(s) protected, ${scripts} inline script hash(es)`);
