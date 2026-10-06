"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, CircleCheck, CircleSlash, Info, ShieldCheck, ShieldOff } from "lucide-react";
import { HttpLines } from "./http-lines";

/*
 * Every value and console message here was captured from Helmet 8.3.0 on Express 5
 * in Chrome, so the lab shows what a real browser does with each header.
 */

type Corp = "off" | "same-origin" | "same-site";
type Coop = "off" | "same-origin" | "same-origin-allow-popups";
type State = {
  csp: boolean;
  hsts: boolean;
  nosniff: boolean;
  xfo: boolean;
  coop: Coop;
  corp: Corp;
  referrer: boolean;
  oac: boolean;
  dns: boolean;
  download: boolean;
  crossdomain: boolean;
  xss: boolean;
  poweredBy: boolean; // true = X-Powered-By removed
};
type Toggle = Exclude<keyof State, "coop" | "corp">;

const NONE: State = {
  csp: false, hsts: false, nosniff: false, xfo: false, coop: "off", corp: "off", referrer: false,
  oac: false, dns: false, download: false, crossdomain: false, xss: false, poweredBy: false,
};
const DEFAULTS: State = {
  csp: true, hsts: true, nosniff: true, xfo: true, coop: "same-origin", corp: "same-origin", referrer: true,
  oac: true, dns: true, download: true, crossdomain: true, xss: true, poweredBy: true,
};
const TUNED: State = { ...DEFAULTS, coop: "same-origin-allow-popups", corp: "same-site" };

const PRESETS: { name: string; state: State }[] = [
  { name: "No Helmet", state: NONE },
  { name: "helmet()", state: DEFAULTS },
  { name: "helmet(), tuned", state: TUNED },
];

const CSP_VALUE =
  "default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests";

type Level = "key" | "privacy" | "minor" | "legacy";
const HEADERS: { key: keyof State; name: string; option: string; meaning: string; level: Level }[] = [
  { key: "csp", name: "Content-Security-Policy", option: "contentSecurityPolicy", meaning: "Which scripts, styles and frames may run", level: "key" },
  { key: "hsts", name: "Strict-Transport-Security", option: "strictTransportSecurity", meaning: "Use only HTTPS here, for a year", level: "key" },
  { key: "nosniff", name: "X-Content-Type-Options", option: "xContentTypeOptions", meaning: "Never guess what a file is", level: "key" },
  { key: "xfo", name: "X-Frame-Options", option: "xFrameOptions", meaning: "Only my own site may frame me", level: "key" },
  { key: "coop", name: "Cross-Origin-Opener-Policy", option: "crossOriginOpenerPolicy", meaning: "Keep my window apart from other sites' windows", level: "key" },
  { key: "corp", name: "Cross-Origin-Resource-Policy", option: "crossOriginResourcePolicy", meaning: "Who may load my files", level: "key" },
  { key: "referrer", name: "Referrer-Policy", option: "referrerPolicy", meaning: "Don't tell other sites where users came from", level: "privacy" },
  { key: "dns", name: "X-DNS-Prefetch-Control", option: "xDnsPrefetchControl", meaning: "Don't look up link domains in advance", level: "privacy" },
  { key: "oac", name: "Origin-Agent-Cluster", option: "originAgentCluster", meaning: "Hint: isolate my origin in its own group", level: "minor" },
  { key: "poweredBy", name: "X-Powered-By (removed)", option: "xPoweredBy", meaning: "Stop announcing “Express”", level: "minor" },
  { key: "xss", name: "X-XSS-Protection", option: "xXssProtection", meaning: "Switch OFF old, buggy XSS filters", level: "legacy" },
  { key: "download", name: "X-Download-Options", option: "xDownloadOptions", meaning: "Internet Explorer 8 only", level: "legacy" },
  { key: "crossdomain", name: "X-Permitted-Cross-Domain-Policies", option: "xPermittedCrossDomainPolicies", meaning: "Adobe Flash and Acrobat only", level: "legacy" },
];

const levelLabel: Record<Level, string> = { key: "", privacy: "privacy", minor: "minor", legacy: "legacy" };

type Status = "protected" | "exposed" | "broken" | "works" | "info";
type Outcome = { status: Status; text: string; log?: string };
type Scenario = { id: string; title: string; kind: "attack" | "privacy" | "feature"; run: (s: State) => Outcome };

const SCENARIOS: Scenario[] = [
  {
    id: "xss",
    kind: "attack",
    title: "An attacker's comment contains a <script>",
    run: (s) =>
      s.csp
        ? {
            status: "protected",
            text: "The browser refuses to run it.",
            log: "Executing inline script violates the following Content Security Policy directive 'script-src 'self''. … The action has been blocked.",
          }
        : { status: "exposed", text: "The script runs with your page's full power." },
  },
  {
    id: "frame",
    kind: "attack",
    title: "Another site shows your page in a hidden frame",
    run: (s) =>
      s.csp
        ? {
            status: "protected",
            text: "Blocked by the CSP's frame-ancestors rule.",
            log: "Framing 'https://app.example.com/' violates the following Content Security Policy directive: \"frame-ancestors 'self'\". The request has been blocked.",
          }
        : s.xfo
          ? {
              status: "protected",
              text: "Blocked by X-Frame-Options.",
              log: "Refused to display 'https://app.example.com/' in a frame because it set 'X-Frame-Options' to 'sameorigin'.",
            }
          : { status: "exposed", text: "Your page loads inside their frame, so clicks can be hijacked." },
  },
  {
    id: "sniff",
    kind: "attack",
    title: "A .txt upload is loaded as a <script>",
    run: (s) =>
      s.nosniff
        ? {
            status: "protected",
            text: "The browser won't run a text file as code.",
            log: "Refused to execute script from 'https://app.example.com/uploads/notes.txt' because its MIME type ('text/plain') is not executable, and strict MIME type checking is enabled.",
          }
        : { status: "exposed", text: "The browser guesses it's JavaScript and runs it." },
  },
  {
    id: "https",
    kind: "attack",
    title: "A returning user types your address on café Wi-Fi",
    run: (s) =>
      s.hsts
        ? { status: "protected", text: "The browser goes straight to https:// before sending anything." }
        : { status: "exposed", text: "The first request goes out over plain http and can be intercepted." },
  },
  {
    id: "referrer",
    kind: "privacy",
    title: "A user follows a link from your page to another site",
    run: (s) =>
      s.referrer
        ? { status: "protected", text: "No Referer header is sent at all." }
        : { status: "info", text: "Sends Referer: https://app.example.com/ (just the origin, the browser default)." },
  },
  {
    id: "fingerprint",
    kind: "privacy",
    title: "Someone checks which framework you run",
    run: (s) =>
      s.poweredBy
        ? { status: "protected", text: "X-Powered-By is gone. A small win; there are other clues." }
        : { status: "info", text: "Every response says X-Powered-By: Express." },
  },
  {
    id: "images",
    kind: "feature",
    title: "Your API's images appear on app.example.com",
    run: (s) =>
      s.corp === "same-origin"
        ? { status: "broken", text: "Blocked: the API and the app are different origins.", log: "Failed to load resource: net::ERR_BLOCKED_BY_RESPONSE.NotSameOrigin" }
        : { status: "works", text: s.corp === "same-site" ? "Loads: same site is allowed." : "Loads normally." },
  },
  {
    id: "popup",
    kind: "feature",
    title: "A payment popup reports back through window.opener",
    run: (s) =>
      s.coop === "same-origin"
        ? { status: "broken", text: "In the popup, window.opener is null, so it can't report back." }
        : { status: "works", text: s.coop === "same-origin-allow-popups" ? "Popups you open can still reach you." : "Works normally." },
  },
];

const statusStyle: Record<Status, { icon: typeof ShieldCheck; cls: string; label: string }> = {
  protected: { icon: ShieldCheck, cls: "text-ok", label: "protected" },
  exposed: { icon: ShieldOff, cls: "text-bad", label: "exposed" },
  broken: { icon: AlertTriangle, cls: "text-warn", label: "broken" },
  works: { icon: CircleCheck, cls: "text-ok", label: "works" },
  info: { icon: Info, cls: "text-subtle", label: "default" },
};

function valueOf(key: keyof State, s: State): string | null {
  switch (key) {
    case "csp": return s.csp ? CSP_VALUE : null;
    case "hsts": return s.hsts ? "max-age=31536000; includeSubDomains" : null;
    case "nosniff": return s.nosniff ? "nosniff" : null;
    case "xfo": return s.xfo ? "SAMEORIGIN" : null;
    case "coop": return s.coop === "off" ? null : s.coop;
    case "corp": return s.corp === "off" ? null : s.corp;
    case "referrer": return s.referrer ? "no-referrer" : null;
    case "oac": return s.oac ? "?1" : null;
    case "dns": return s.dns ? "off" : null;
    case "download": return s.download ? "noopen" : null;
    case "crossdomain": return s.crossdomain ? "none" : null;
    case "xss": return s.xss ? "0" : null;
    default: return null;
  }
}

function responseHeaders(s: State) {
  const lines = ["HTTP/1.1 200 OK"];
  for (const h of HEADERS) {
    if (h.key === "poweredBy") continue;
    const v = valueOf(h.key, s);
    if (v) lines.push(`+ ${h.name}: ${v}`);
  }
  lines.push(s.poweredBy ? "- X-Powered-By: Express" : "X-Powered-By: Express");
  lines.push("Content-Type: text/html; charset=utf-8");
  return lines.join("\n");
}

function configCode(s: State) {
  const everythingOff = HEADERS.every((h) => (h.key === "coop" || h.key === "corp" ? s[h.key] === "off" : !s[h.key]));
  if (everythingOff) return "// No Helmet: Express sends X-Powered-By and none of these headers.\napp.get('/', handler);";
  const opts: string[] = [];
  for (const h of HEADERS) {
    if (h.key === "corp") {
      if (s.corp === "off") opts.push(`  ${h.option}: false,`);
      else if (s.corp === "same-site") opts.push(`  ${h.option}: { policy: "same-site" },`);
    } else if (h.key === "coop") {
      if (s.coop === "off") opts.push(`  ${h.option}: false,`);
      else if (s.coop === "same-origin-allow-popups") opts.push(`  ${h.option}: { policy: "same-origin-allow-popups" },`);
    } else if (!s[h.key]) {
      opts.push(`  ${h.option}: false,`);
    }
  }
  return opts.length ? `app.use(\n  helmet({\n${opts.map((o) => `  ${o}`).join("\n")}\n  }),\n);` : "app.use(helmet());";
}

export default function HelmetLab() {
  const [s, setS] = useState<State>(DEFAULTS);
  const [preset, setPreset] = useState(1);
  const outcomes = useMemo(() => SCENARIOS.map((sc) => ({ ...sc, out: sc.run(s) })), [s]);
  const attacks = outcomes.filter((o) => o.kind === "attack");
  const blocked = attacks.filter((o) => o.out.status === "protected").length;
  const broken = outcomes.filter((o) => o.out.status === "broken").length;

  const set = (patch: Partial<State>) => {
    setPreset(-1);
    setS((prev) => ({ ...prev, ...patch }));
  };

  return (
    <div className="not-prose my-10 overflow-hidden rounded-2xl border border-line bg-card">
      <div className="border-b border-line bg-bg-soft px-4 pt-4 pb-3 sm:px-5">
        <div className="flex items-center gap-2">
          <p className="font-semibold">Helmet lab</p>
          <span className="ml-auto hidden font-mono text-[11px] text-subtle sm:inline">behaviour captured from real Chrome</span>
        </div>
        <p className="mt-1.5 text-[13.5px] text-muted">Pick a starting point, then switch headers off one at a time and watch what changes.</p>
        <div className="-mx-1 mt-2.5 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {PRESETS.map((p, i) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setPreset(i);
                setS(p.state);
              }}
              className={`shrink-0 rounded-full border px-3 py-1.5 font-mono text-[12px] font-medium whitespace-nowrap transition-colors ${
                preset === i ? "border-fg bg-fg text-bg" : "border-line bg-card text-muted hover:border-line-strong hover:text-fg"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-px bg-line md:grid-cols-2">
        {/* What the browser does */}
        <section className="bg-card px-4 py-4 sm:px-5" aria-label="What the browser does">
          <p className="eyebrow text-subtle">What the browser does</p>
          <ul className="mt-3 space-y-3">
            {outcomes.map((o) => {
              const st = statusStyle[o.out.status];
              const Icon = st.icon;
              return (
                <li key={o.id} className="flex gap-2.5">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={o.out.status}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className={`mt-0.5 shrink-0 ${st.cls}`}
                    >
                      <Icon className="size-[18px]" />
                    </motion.span>
                  </AnimatePresence>
                  <div className="min-w-0">
                    <p className="text-[13.5px] leading-snug font-semibold">
                      {o.title}
                      {o.kind === "feature" && <span className="ml-1.5 font-mono text-[10.5px] font-normal text-subtle">your feature</span>}
                    </p>
                    <p className={`mt-0.5 text-[13px] leading-snug ${o.out.status === "exposed" ? "text-bad" : o.out.status === "broken" ? "text-warn" : "text-muted"}`}>
                      {o.out.text}
                    </p>
                    {o.out.log && (
                      <p className="mt-1 rounded-md bg-bg-soft px-2 py-1 font-mono text-[11px] leading-snug break-words text-subtle">{o.out.log}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Headers */}
        <section className="bg-card px-4 py-4 sm:px-5" aria-label="Headers">
          <p className="eyebrow text-subtle">Headers</p>
          <ul className="mt-3 space-y-2.5">
            {HEADERS.map((h) => (
              <li key={h.key} className="flex items-start gap-2.5">
                {h.key === "coop" || h.key === "corp" ? (
                  <div className="min-w-0 flex-1">
                    <HeaderName name={h.name} level={h.level} />
                    <p className="text-[12px] text-muted">{h.meaning}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1 rounded-lg border border-line bg-bg-soft p-0.5">
                      {(h.key === "coop"
                        ? (["off", "same-origin", "same-origin-allow-popups"] as const)
                        : (["off", "same-origin", "same-site"] as const)
                      ).map((v) => {
                        const on = s[h.key] === v;
                        return (
                          <button
                            key={v}
                            type="button"
                            aria-pressed={on}
                            onClick={() => set({ [h.key]: v } as Partial<State>)}
                            className={`flex-1 rounded-md px-1.5 py-1 font-mono text-[10.5px] whitespace-nowrap transition-colors ${
                              on ? "bg-card text-accent shadow-card" : "text-muted hover:text-fg"
                            }`}
                          >
                            {v === "same-origin-allow-popups" ? "allow-popups" : v}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <>
                    <Switch on={s[h.key as Toggle]} onClick={() => set({ [h.key]: !s[h.key as Toggle] } as Partial<State>)} label={h.name} />
                    <div className="min-w-0 flex-1">
                      <HeaderName name={h.name} level={h.level} />
                      <p className="text-[12px] text-muted">{h.meaning}</p>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Summary: sticks to the bottom of the screen while you're among the toggles */}
      <div className="sticky bottom-3 z-10 px-3 py-3 sm:px-4">
        <div className="glass flex flex-wrap items-center gap-x-5 gap-y-1 rounded-xl px-4 py-3 text-[13.5px] shadow-lift" role="status" aria-live="polite">
          <span className="flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="size-4 text-ok" /> {blocked} of {attacks.length} attacks blocked
          </span>
          <span className={`flex items-center gap-1.5 font-semibold ${broken ? "text-warn" : "text-muted"}`}>
            {broken ? <AlertTriangle className="size-4" /> : <CircleSlash className="size-4" />}
            {broken ? `${broken} of your own features broken` : "nothing of yours broken"}
          </span>
        </div>
      </div>

      <div className="space-y-4 px-4 pb-5 sm:px-5">
        <div>
          <p className="eyebrow mb-2 text-subtle">The response, as the browser receives it</p>
          <HttpLines text={responseHeaders(s)} />
        </div>
        <div>
          <p className="eyebrow mb-2 text-subtle">The matching config</p>
          <pre className="overflow-x-auto rounded-lg border border-line bg-code px-4 py-3 font-mono text-[12px] leading-[1.75] text-fg">
            {configCode(s)}
          </pre>
        </div>
      </div>
    </div>
  );
}

function HeaderName({ name, level }: { name: string; level: Level }) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-1.5 font-mono text-[12px] leading-snug text-fg">
      {name}
      {levelLabel[level] && <span className="rounded bg-bg-soft px-1 text-[10px] text-subtle">{levelLabel[level]}</span>}
    </p>
  );
}

function Switch({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${on ? "bg-accent-soft" : "bg-line-strong"}`}
    >
      <motion.span
        className="absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow"
        initial={false}
        animate={{ x: on ? 16 : 0 }}
        transition={{ type: "spring", stiffness: 600, damping: 35 }}
      />
    </button>
  );
}
