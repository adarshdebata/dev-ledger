function Part({ text, label, muted }: { text: string; label: string; muted?: boolean }) {
  return (
    <span className="flex flex-col items-center">
      <span className={`rounded-md px-1.5 py-1 ${muted ? "bg-bg-soft text-subtle" : "bg-accent-tint text-accent"}`}>{text}</span>
      <span className="mt-1.5 font-sans text-[11px] font-medium text-muted">{label}</span>
    </span>
  );
}

function Bracket({ label, muted }: { label: string; muted?: boolean }) {
  return (
    <span className="mt-2 flex flex-col items-center">
      <span className={`h-2 w-full rounded-b-md border-x-2 border-b-2 ${muted ? "border-line-strong" : "border-accent-soft"}`} />
      <span className={`mt-1.5 font-sans text-[12px] font-semibold ${muted ? "text-subtle" : "text-accent"}`}>{label}</span>
    </span>
  );
}

/** A URL split into the three parts that make an origin, and the rest that doesn't count. */
export function UrlAnatomy({
  scheme = "https",
  host = "app.example.com",
  port = "443",
  rest = "/orders?page=2",
}: {
  scheme?: string;
  host?: string;
  port?: string;
  rest?: string;
}) {
  return (
    <figure className="not-prose my-8 rounded-2xl border border-line bg-card px-4 py-6 shadow-card sm:px-6">
      <div className="flex flex-wrap items-start justify-center gap-x-1 gap-y-5 font-mono text-[15px] sm:text-[17px]">
        <span className="flex flex-col">
          <span className="flex items-start">
            <Part text={scheme} label="scheme" />
            <span className="py-1 text-subtle">://</span>
            <Part text={host} label="host" />
            <span className="py-1 text-subtle">:</span>
            <Part text={port} label="port" />
          </span>
          <Bracket label="the origin" />
        </span>
        <span className="flex flex-col">
          <Part text={rest} label="path + query" muted />
          <Bracket label="not part of it" muted />
        </span>
      </div>
      <figcaption className="mt-5 text-center text-[13px] text-muted">
        A default port is dropped when an origin is written out, so the browser sends this one as{" "}
        <code className="font-mono text-fg">
          {scheme}://{host}
        </code>
        .
      </figcaption>
    </figure>
  );
}
