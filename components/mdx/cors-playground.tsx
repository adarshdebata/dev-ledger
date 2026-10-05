"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  ArrowRight,
  Ban,
  Check,
  CircleCheck,
  CircleSlash,
  Code2,
  Globe,
  Server,
  ShieldAlert,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { HttpLines } from "./http-lines";
import {
  ALLOWLIST,
  API_ORIGIN,
  fetchCode,
  serverCode,
  simulate,
  type Check as CheckItem,
  type Config,
  type ContentType,
  type Credentials,
  type HeaderName,
  type Method,
  type OriginPolicy,
  type Result,
} from "./cors-sim";

const ease = [0.22, 1, 0.36, 1] as const;

const DEFAULT: Config = {
  pageOrigin: "https://app.example.com",
  method: "GET",
  contentType: "none",
  authHeader: false,
  requestId: false,
  credentials: "same-origin",
  server: { origin: "none", allowCredentials: false, methods: ["GET", "POST", "PUT", "DELETE"], headers: ["Content-Type", "Authorization"], expose: false, maxAge: 600 },
  faults: { crash: false, authFirst: false, strip: false, redirect: false, cdn: false },
  repeat: false,
};

const good: Config["server"] = {
  origin: "allowlist",
  allowCredentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  headers: ["Content-Type", "Authorization", "X-Request-Id"],
  expose: true,
  maxAge: 7200,
};

const PRESETS: { name: string; config: Config }[] = [
  { name: "Works in Postman", config: DEFAULT },
  {
    name: "JSON + token, done right",
    config: { ...DEFAULT, method: "POST", contentType: "application/json", authHeader: true, credentials: "include", server: good },
  },
  {
    name: "Wildcard + cookies",
    config: { ...DEFAULT, credentials: "include", server: { ...good, origin: "wildcard" } },
  },
  {
    name: "Auth eats the preflight",
    config: { ...DEFAULT, method: "PUT", contentType: "application/json", authHeader: true, server: good, faults: { ...DEFAULT.faults, authFirst: true } },
  },
  {
    name: "The 500 in disguise",
    config: { ...DEFAULT, method: "POST", contentType: "application/json", credentials: "include", server: good, faults: { ...DEFAULT.faults, crash: true } },
  },
  {
    name: "Form POST, no CORS",
    config: { ...DEFAULT, method: "POST", contentType: "application/x-www-form-urlencoded", pageOrigin: "https://attacker.example" },
  },
  {
    name: "Flaky: CDN cache",
    config: { ...DEFAULT, server: good, credentials: "include", faults: { ...DEFAULT.faults, cdn: true } },
  },
];

const ORIGINS = [
  { value: "https://app.example.com", label: "https://app.example.com", note: "your frontend" },
  { value: "http://localhost:5173", label: "http://localhost:5173", note: "your dev server" },
  { value: "https://attacker.example", label: "https://attacker.example", note: "someone else's site" },
  { value: API_ORIGIN, label: API_ORIGIN, note: "same origin as the API" },
];
const METHODS: Method[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const CTYPES: ContentType[] = ["none", "text/plain", "application/x-www-form-urlencoded", "multipart/form-data", "application/json"];
const CREDS: Credentials[] = ["omit", "same-origin", "include"];
const HEADERS: HeaderName[] = ["Content-Type", "Authorization", "X-Request-Id"];
const POLICIES: { value: OriginPolicy; label: string }[] = [
  { value: "none", label: "No CORS config at all" },
  { value: "wildcard", label: "*  (anyone)" },
  { value: "allowlist", label: "Allowlist: app + localhost:5173" },
  { value: "reflect", label: "Reflect any Origin (risky)" },
];
const MAX_AGES: { value: number | null; label: string }[] = [
  { value: null, label: "not sent (5 s default)" },
  { value: 0, label: "0 (don't cache)" },
  { value: 600, label: "600 (10 min)" },
  { value: 7200, label: "7200 (2 h, Chrome's cap)" },
  { value: 86400, label: "86400 (24 h)" },
];

export default function CorsPlayground() {
  const [c, setC] = useState<Config>(PRESETS[0].config);
  const [preset, setPreset] = useState(0);
  const r = useMemo(() => simulate(c), [c]);

  const update = (patch: Partial<Config>) => {
    setPreset(-1);
    setC((prev) => ({ ...prev, ...patch }));
  };
  const server = (patch: Partial<Config["server"]>) => update({ server: { ...c.server, ...patch } });
  const fault = (patch: Partial<Config["faults"]>) => update({ faults: { ...c.faults, ...patch } });
  const bodyless = c.method === "GET";
  let section = 0;
  const next = () => ++section;

  return (
    <div className="not-prose my-10 overflow-hidden rounded-2xl border border-line bg-card">
      {/* Title + presets */}
      <div className="border-b border-line bg-bg-soft/70 px-4 pt-4 pb-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-fg text-bg">
            <Sparkles className="size-4" />
          </span>
          <p className="font-semibold">CORS playground</p>
          <span className="ml-auto hidden font-mono text-[11px] text-subtle sm:inline">simulated in your browser · no network</span>
        </div>
        <p className="mt-2 text-[13px] text-muted">Start from a scenario, then change one thing at a time.</p>
        <div className="-mx-1 mt-2.5 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {PRESETS.map((p, i) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setPreset(i);
                setC(p.config);
              }}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-[12.5px] font-medium whitespace-nowrap transition-colors ${
                preset === i ? "border-fg bg-fg text-bg" : "border-line bg-card text-muted hover:border-line-strong hover:text-fg"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="grid gap-px bg-line sm:grid-cols-2">
        <Panel icon={<Globe className="size-4" />} title="In the browser" sub="your fetch() call">
          <Field label="Page origin (where your JavaScript runs)">
            <Select value={c.pageOrigin} onChange={(v) => update({ pageOrigin: v })} options={ORIGINS.map((o) => ({ value: o.value, label: o.label }))} />
            <p className="mt-1 text-[11.5px] text-subtle">{ORIGINS.find((o) => o.value === c.pageOrigin)?.note}</p>
          </Field>
          <Field label="Method">
            <Segmented
              value={c.method}
              options={METHODS}
              onChange={(m) => update({ method: m, contentType: m === "GET" ? "none" : c.contentType === "none" ? "application/json" : c.contentType })}
            />
          </Field>
          <Field label="Content-Type" muted={bodyless}>
            <Select
              value={c.contentType}
              disabled={bodyless}
              onChange={(v) => update({ contentType: v as ContentType })}
              options={CTYPES.map((t) => ({ value: t, label: t === "none" ? "(no body)" : t }))}
            />
          </Field>
          <Field label="Extra request headers">
            <div className="flex flex-wrap gap-1.5">
              <Chip on={c.authHeader} onClick={() => update({ authHeader: !c.authHeader })}>Authorization</Chip>
              <Chip on={c.requestId} onClick={() => update({ requestId: !c.requestId })}>X-Request-Id</Chip>
            </div>
          </Field>
          <Field label="credentials">
            <Segmented value={c.credentials} options={CREDS} onChange={(v) => update({ credentials: v })} />
          </Field>
        </Panel>

        <Panel icon={<Server className="size-4" />} title="On the API" sub="api.example.com's CORS config">
          <Field label="Access-Control-Allow-Origin">
            <Select value={c.server.origin} onChange={(v) => server({ origin: v as OriginPolicy })} options={POLICIES} />
          </Field>
          <Toggle on={c.server.allowCredentials} onClick={() => server({ allowCredentials: !c.server.allowCredentials })} disabled={c.server.origin === "none"}>
            Allow-Credentials: true
          </Toggle>
          <Field label="Access-Control-Allow-Methods" muted={c.server.origin === "none"}>
            <MultiChips
              all={METHODS}
              value={c.server.methods}
              disabled={c.server.origin === "none"}
              onChange={(v) => server({ methods: v as Method[] | "*" })}
            />
          </Field>
          <Field label="Access-Control-Allow-Headers" muted={c.server.origin === "none"}>
            <MultiChips
              all={HEADERS}
              value={c.server.headers}
              disabled={c.server.origin === "none"}
              onChange={(v) => server({ headers: v as HeaderName[] | "*" })}
            />
          </Field>
          <Toggle on={c.server.expose} onClick={() => server({ expose: !c.server.expose })} disabled={c.server.origin === "none"}>
            Expose-Headers: X-Request-Id
          </Toggle>
          <Field label="Access-Control-Max-Age" muted={c.server.origin === "none"}>
            <Select
              value={String(c.server.maxAge)}
              disabled={c.server.origin === "none"}
              onChange={(v) => server({ maxAge: v === "null" ? null : Number(v) })}
              options={MAX_AGES.map((m) => ({ value: String(m.value), label: m.label }))}
            />
          </Field>
        </Panel>
      </div>

      <div className="border-t border-line px-4 py-4 sm:px-5">
        <p className="flex items-center gap-2 text-[13px] font-semibold">
          <ShieldAlert className="size-4 text-warn" /> Things that go wrong in between
        </p>
        <div className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          <Toggle on={c.faults.crash} onClick={() => fault({ crash: !c.faults.crash })}>Route crashes: 500 without CORS headers</Toggle>
          <Toggle on={c.faults.authFirst} onClick={() => fault({ authFirst: !c.faults.authFirst })}>Auth middleware runs before CORS</Toggle>
          <Toggle on={c.faults.strip} onClick={() => fault({ strip: !c.faults.strip })}>A proxy strips Access-Control-* headers</Toggle>
          <Toggle on={c.faults.redirect} onClick={() => fault({ redirect: !c.faults.redirect })}>/orders redirects to /orders/ (301)</Toggle>
          <Toggle on={c.faults.cdn} onClick={() => fault({ cdn: !c.faults.cdn })}>CDN caches without Vary: Origin</Toggle>
          <Toggle on={c.repeat} onClick={() => update({ repeat: !c.repeat })}>Send it again a minute later</Toggle>
        </div>
      </div>

      {/* Verdict: sticks to the bottom of the screen while you're still among the controls */}
      <div className="sticky bottom-3 z-10 px-3 sm:px-4">
        <Verdict r={r} />
      </div>

      {/* Results */}
      <div className="space-y-6 px-4 pt-5 pb-6 sm:px-5">
        <Wire r={r} method={c.method} />

        {!r.sameOrigin && (
          <Section n={next()} title="Does it need a preflight?">
            <ul className="space-y-1.5 text-[13.5px]">
              {r.reasons.map((x) => (
                <li key={x.text} className="flex gap-2">
                  {x.unsafe ? <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warn" /> : <Check className="mt-0.5 size-4 shrink-0 text-ok" />}
                  <span className={x.unsafe ? "text-fg" : "text-muted"}>{x.text}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 rounded-lg bg-bg-soft px-3 py-2 text-[13.5px]">
              {r.preflightNeeded ? (
                <>
                  <strong>Yes.</strong> At least one part of this request is something an HTML form could never send, so the browser asks
                  first with <code className="font-mono text-accent">OPTIONS</code>.
                </>
              ) : (
                <>
                  <strong>No.</strong> This is a <em>simple request</em>: a form could already send it, so the browser sends it straight
                  away and checks the response afterwards.
                </>
              )}
            </p>
          </Section>
        )}

        {r.preflight && (
          <Section n={next()} title={r.preflight.cached ? "The preflight (answered from cache)" : "The preflight"}>
            {r.preflight.cached ? (
              <p className="text-[13.5px] text-muted">
                A matching preflight passed less than Max-Age seconds ago, so the browser skips OPTIONS and goes straight to the real
                request. {r.preflight.cacheNote}
              </p>
            ) : (
              <>
                <Label>Browser sends</Label>
                <HttpLines text={r.preflight.request} />
                <Label>API answers</Label>
                <HttpLines text={r.preflight.response ?? ""} />
                <Checks checks={r.preflight.checks} />
                {r.preflight.ok && <p className="mt-2 text-[12.5px] text-subtle">{r.preflight.cacheNote}</p>}
              </>
            )}
          </Section>
        )}

        {r.actual ? (
          <Section n={next()} title="The actual request">
            <Label>Browser sends</Label>
            <HttpLines text={r.actual.request} />
            <Label>API answers</Label>
            <HttpLines text={r.actual.response ?? ""} />
            {r.actual.checks.length > 0 && <Checks checks={r.actual.checks} />}
          </Section>
        ) : (
          <Section n={next()} title="The actual request">
            <p className="flex items-center gap-2 text-[13.5px] text-muted">
              <CircleSlash className="size-4 text-subtle" /> Never sent. The browser stopped at the failed preflight.
            </p>
          </Section>
        )}

        <Section n={next()} title="What your JavaScript gets">
          <div className="rounded-lg border border-line bg-code px-3 py-2.5 font-mono text-[12px] leading-[1.9]">
            {r.js.map((l) => (
              <div key={l.expr} className="flex flex-wrap gap-x-2">
                <span className="text-fg">{l.expr}</span>
                <span className="text-subtle">→</span>
                <span className={l.bad ? "text-bad" : "text-ok"}>{l.value}</span>
              </div>
            ))}
          </div>
        </Section>

        {r.consoleLines.length > 0 && (
          <Section n={next()} title="Chrome's console says">
            <div className="overflow-hidden rounded-lg border border-bad/25 font-mono text-[12px]">
              {r.consoleLines.map((l) => (
                <div key={l} className="flex gap-2 border-b border-bad/15 bg-bad-tint px-3 py-2 leading-relaxed break-words text-bad last:border-b-0">
                  <XCircle className="mt-[3px] size-3.5 shrink-0" />
                  <span className="min-w-0">{l}</span>
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section n={next()} title="What the API's access log shows">
          <div className="rounded-lg border border-line bg-code px-3 py-2.5 font-mono text-[12px] leading-[1.9]">
            {r.serverLog.map((l) => (
              <div key={l.line} className={l.tone === "ok" ? "text-ok" : l.tone === "bad" ? "text-bad" : "text-subtle"}>
                {l.line}
              </div>
            ))}
          </div>
          {r.verdict === "blocked-after" && r.actual?.handlerRan && (
            <p className="mt-2 flex gap-2 rounded-lg border border-warn/30 bg-warn-tint px-3 py-2 text-[13px]">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warn" />
              <span>
                The browser blocked the <em>response</em>, not the request. The API {r.actual.effect}.
                {c.method === "GET" || c.method === "HEAD" ? " Harmless for a read, but the same thing happens to writes." : " Retrying blindly would do it again."}
              </span>
            </p>
          )}
        </Section>

        {r.notes.map((n) => (
          <p key={n} className="flex gap-2 rounded-lg bg-info-tint px-3 py-2 text-[13px] text-fg">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-info" />
            {n}
          </p>
        ))}

        <CodeView fetch={fetchCode(c)} server={serverCode(c)} />
      </div>
    </div>
  );
}

/* ---------- Verdict ---------- */

function Verdict({ r }: { r: Result }) {
  const v = {
    "same-origin": {
      icon: CircleCheck,
      cls: "border-info/40 bg-[color-mix(in_oklab,var(--info)_10%,var(--card))]",
      iconCls: "text-info",
      title: "Same origin: CORS never enters the picture",
      body: "The page and the API share scheme, host and port, so JavaScript reads the response whatever its status.",
    },
    readable: {
      icon: CircleCheck,
      cls: "border-ok/40 bg-[color-mix(in_oklab,var(--ok)_10%,var(--card))]",
      iconCls: "text-ok",
      title: "JavaScript can read the response",
      body: r.preflight
        ? r.preflight.cached
          ? "Preflight reused from cache, request sent, response carried the right headers."
          : "Preflight passed, request sent, response carried the right headers."
        : "A simple request: sent straight away, and the response carried the right headers.",
    },
    "blocked-after": {
      icon: AlertTriangle,
      cls: "border-warn/50 bg-[color-mix(in_oklab,var(--warn)_11%,var(--card))]",
      iconCls: "text-warn",
      title: r.actual?.handlerRan ? "Blocked, but the server already ran it" : "Blocked after it reached the server",
      body: r.actual?.handlerRan
        ? `The API ${r.actual.effect} and answered ${r.actual.status}. Then the browser withheld the response from JavaScript.`
        : `The API answered ${r.actual?.status} without CORS headers, so JavaScript can't even see the status.`,
    },
    "blocked-before": {
      icon: Ban,
      cls: "border-bad/40 bg-[color-mix(in_oklab,var(--bad)_9%,var(--card))]",
      iconCls: "text-bad",
      title: "Blocked before the real request was sent",
      body: "The preflight failed, so the browser never sent the actual request. Only the OPTIONS check reached the API.",
    },
  }[r.verdict];
  const Icon = v.icon;

  return (
    <div className={`overflow-hidden rounded-xl border shadow-lift backdrop-blur ${v.cls}`} role="status" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={v.title + v.body}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease }}
          className="flex gap-3 px-4 py-3"
        >
          <Icon className={`mt-0.5 size-5 shrink-0 ${v.iconCls}`} />
          <div className="min-w-0">
            <p className="text-[14.5px] font-semibold">{v.title}</p>
            <p className="mt-0.5 text-[13px] leading-snug text-muted">{v.body}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ---------- Wire: the request on the wire, replayed whenever the outcome changes ---------- */

type WireRow =
  | { kind: "arrow"; dir: "out" | "in"; label: string; tone: "default" | "ok" | "bad" | "muted"; dashed?: boolean }
  | { kind: "note"; text: string; tone: "ok" | "bad" | "muted" };

function wireRows(r: Result, method: Method): WireRow[] {
  const rows: WireRow[] = [];
  if (r.sameOrigin) {
    rows.push({ kind: "note", text: "No preflight: same origin", tone: "muted" });
    rows.push({ kind: "note", text: "No CORS check either", tone: "muted" });
  } else if (!r.preflight) {
    rows.push({ kind: "note", text: "No preflight: simple request", tone: "muted" });
    rows.push({ kind: "note", text: "Sent straight away", tone: "muted" });
  } else if (r.preflight.cached) {
    rows.push({ kind: "arrow", dir: "out", label: "OPTIONS (skipped)", tone: "muted", dashed: true });
    rows.push({ kind: "note", text: "Preflight answered from cache", tone: "ok" });
  } else {
    rows.push({ kind: "arrow", dir: "out", label: "OPTIONS /orders", tone: "default" });
    rows.push({ kind: "arrow", dir: "in", label: `${r.preflight.status} ${r.preflight.ok ? "✓" : "✗"}`, tone: r.preflight.ok ? "ok" : "bad" });
  }
  if (r.actual) {
    rows.push({ kind: "arrow", dir: "out", label: `${method} /orders`, tone: "default" });
    const st = r.actual.status ?? 0;
    rows.push({ kind: "arrow", dir: "in", label: `${st}${r.actual.ok ? "" : " · no usable CORS headers"}`, tone: r.actual.ok ? (st < 300 ? "ok" : "bad") : "bad" });
  } else {
    rows.push({ kind: "arrow", dir: "out", label: `${method} never sent`, tone: "muted", dashed: true });
    rows.push({ kind: "note", text: "", tone: "muted" });
  }
  rows.push(
    r.verdict === "readable" || r.verdict === "same-origin"
      ? { kind: "note", text: "JavaScript gets the response", tone: "ok" }
      : { kind: "note", text: "JavaScript gets TypeError: Failed to fetch", tone: "bad" },
  );
  return rows;
}

const wireColor = { default: "var(--accent-soft)", ok: "var(--ok)", bad: "var(--bad)", muted: "var(--subtle)" };

function Wire({ r, method }: { r: Result; method: Method }) {
  const rows = wireRows(r, method);
  const signature = JSON.stringify(rows);

  return (
    <div className="rounded-xl border border-line bg-bg-soft/50 p-3 sm:p-4">
      <div className="flex justify-between text-[11.5px] font-semibold">
        <span className="flex items-center gap-1.5">
          <Code2 className="size-3.5 text-accent" /> Browser
        </span>
        <span className="flex items-center gap-1.5">
          API <Server className="size-3.5 text-accent" />
        </span>
      </div>
      <div key={signature} className="relative mt-2">
        <span className="absolute top-0 bottom-0 left-0 border-l border-dashed border-line-strong" aria-hidden="true" />
        <span className="absolute top-0 right-0 bottom-0 border-l border-dashed border-line-strong" aria-hidden="true" />
        {rows.map((row, i) => (
          <div key={i} className="relative h-9">
            {row.kind === "arrow" ? (
              <WireArrow row={row} delay={i * 0.28} />
            ) : (
              <motion.p
                className="absolute inset-x-3 top-1/2 -translate-y-1/2 text-center text-[12px] font-medium"
                style={{ color: wireColor[row.tone] }}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.28, duration: 0.3, ease }}
              >
                {row.text}
              </motion.p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function WireArrow({ row, delay }: { row: Extract<WireRow, { kind: "arrow" }>; delay: number }) {
  const color = wireColor[row.tone];
  const out = row.dir === "out";
  return (
    <>
      <motion.span
        className="absolute left-1/2 top-0 -translate-x-1/2 rounded bg-bg-soft px-1.5 font-mono text-[11px] whitespace-nowrap"
        style={{ color }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.1, duration: 0.25 }}
      >
        {row.label}
      </motion.span>
      <motion.span
        className="absolute inset-x-1 top-[22px] h-[2px] rounded-full"
        style={{
          transformOrigin: out ? "left" : "right",
          background: row.dashed ? `repeating-linear-gradient(90deg, ${color} 0 5px, transparent 5px 10px)` : color,
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay, duration: 0.45, ease }}
      />
      <motion.span
        className="absolute top-[17px]"
        style={{ [out ? "right" : "left"]: 2, color }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.38, duration: 0.15 }}
        aria-hidden="true"
      >
        {out ? <ArrowRight className="size-3" /> : <ArrowRight className="size-3 rotate-180" />}
      </motion.span>
    </>
  );
}

/* ---------- Small building blocks ---------- */

function Panel({ icon, title, sub, children }: { icon: React.ReactNode; title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3.5 bg-card px-4 py-4 sm:px-5">
      <p className="flex items-center gap-2 text-[13px] font-semibold">
        <span className="text-accent">{icon}</span>
        {title}
        <span className="font-normal text-subtle">· {sub}</span>
      </p>
      {children}
    </div>
  );
}

function Field({ label, muted, children }: { label: string; muted?: boolean; children: React.ReactNode }) {
  return (
    <div className={muted ? "opacity-50" : ""}>
      <p className="mb-1.5 font-mono text-[11px] text-subtle">{label}</p>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full cursor-pointer rounded-lg border border-line bg-card px-2.5 font-mono text-[12px] text-fg transition-colors hover:border-line-strong focus:border-accent-soft focus:outline-none disabled:cursor-not-allowed"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: T[]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-line bg-bg-soft p-0.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          aria-pressed={value === o}
          className={`flex-1 rounded-md px-2 py-1 font-mono text-[11.5px] font-medium transition-all ${
            value === o ? "bg-card text-accent shadow-card" : "text-muted hover:text-fg"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function Chip({ on, onClick, disabled, children }: { on: boolean; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[11.5px] transition-colors disabled:cursor-not-allowed ${
        on ? "border-accent-soft/60 bg-accent-tint text-accent" : "border-line text-muted hover:border-line-strong hover:text-fg"
      }`}
    >
      {on ? <Check className="size-3" /> : <span className="size-3" />}
      {children}
    </button>
  );
}

function MultiChips({
  all,
  value,
  onChange,
  disabled,
}: {
  all: string[];
  value: string[] | "*";
  onChange: (v: string[] | "*") => void;
  disabled?: boolean;
}) {
  const star = value === "*";
  const toggle = (item: string) => {
    const cur = star ? [] : value;
    onChange(cur.includes(item) ? cur.filter((x) => x !== item) : all.filter((x) => x === item || cur.includes(x)));
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {all.map((m) => (
        <Chip key={m} on={!star && value.includes(m)} onClick={() => toggle(m)} disabled={disabled}>
          {m}
        </Chip>
      ))}
      <Chip on={star} onClick={() => onChange(star ? [] : "*")} disabled={disabled}>
        *
      </Chip>
    </div>
  );
}

function Toggle({ on, onClick, disabled, children }: { on: boolean; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      disabled={disabled}
      className="group flex w-full items-center gap-2.5 text-left text-[13px] disabled:cursor-not-allowed disabled:opacity-45"
    >
      <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ${on ? "bg-brand" : "bg-line-strong"}`}>
        <motion.span
          className="absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow"
          initial={false}
          animate={{ x: on ? 16 : 0 }}
          transition={{ type: "spring", stiffness: 600, damping: 35 }}
        />
      </span>
      <span className={on ? "text-fg" : "text-muted group-hover:text-fg"}>{children}</span>
    </button>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="mb-2.5 flex items-center gap-2 text-[13.5px] font-semibold">
        <span className="grid size-5 place-items-center rounded-full bg-accent-tint font-mono text-[10.5px] text-accent">{n}</span>
        {title}
      </p>
      {children}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 mb-1.5 font-mono text-[10.5px] tracking-wider text-subtle uppercase first:mt-0">{children}</p>;
}

function Checks({ checks }: { checks: CheckItem[] }) {
  return (
    <ul className="mt-3 space-y-1">
      {checks.map((ch) => (
        <li key={ch.label} className="flex items-start gap-2 text-[13px]">
          {ch.ok ? <Check className="mt-0.5 size-4 shrink-0 text-ok" /> : <X className="mt-0.5 size-4 shrink-0 text-bad" />}
          <span className={ch.ok ? "text-muted" : "font-medium text-fg"}>
            {ch.label}
            {ch.why && <span className="text-subtle"> ({ch.why})</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

function CodeView({ fetch, server }: { fetch: string; server: string }) {
  const [tab, setTab] = useState<"fetch" | "server">("fetch");
  return (
    <div>
      <div className="flex items-center gap-1 rounded-t-lg border border-b-0 border-line bg-bg-soft px-1.5 pt-1.5">
        {(["fetch", "server"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            aria-pressed={tab === t}
            className={`rounded-t-md px-3 py-1.5 font-mono text-[11.5px] transition-colors ${
              tab === t ? "bg-code text-fg" : "text-muted hover:text-fg"
            }`}
          >
            {t === "fetch" ? "client.js" : "server.js (Express + cors)"}
          </button>
        ))}
      </div>
      <pre className="overflow-x-auto rounded-b-lg border border-line bg-code px-4 py-3 font-mono text-[12px] leading-[1.75] text-fg">
        {tab === "fetch" ? fetch : server}
      </pre>
      <p className="mt-2 text-[11.5px] text-subtle">
        Allowlist in this playground: {ALLOWLIST.join(", ")}. Everything here is simulated; no request leaves your browser.
      </p>
    </div>
  );
}
