/**
 * Renders an HTTP message with light annotations. Line prefixes:
 *   "+ " added by the browser/server (green)   "- " missing or stripped (red, struck)
 *   "! " worth noticing (accent)                "# " a comment (muted)
 */
export function HttpLines({ text, className = "" }: { text: string; className?: string }) {
  const lines = text.replace(/^\n+|\n+$/g, "").split("\n");
  return (
    <pre
      className={`overflow-x-auto rounded-lg border border-line bg-code py-2.5 font-mono text-[11.5px] leading-[1.75] sm:text-[12px] ${className}`}
    >
      {lines.map((raw, i) => {
        const tag = raw.slice(0, 2);
        const kind = tag === "+ " ? "add" : tag === "- " ? "missing" : tag === "! " ? "hl" : tag === "# " ? "comment" : null;
        const line = kind ? raw.slice(2) : raw;
        const header = line.match(/^([A-Za-z0-9-]+):(.*)$/);
        const startLine = i === 0 && /^(GET|HEAD|POST|PUT|PATCH|DELETE|OPTIONS|HTTP\/)/.test(line);
        const rowCls =
          kind === "add"
            ? "bg-ok-tint border-ok"
            : kind === "missing"
              ? "bg-bad-tint border-bad"
              : kind === "hl"
                ? "bg-accent-tint border-accent-soft"
                : "border-transparent";
        return (
          <div key={i} className={`flex min-w-max items-baseline gap-3 border-l-2 pr-4 pl-3 ${rowCls}`}>
            <span className={kind === "missing" ? "text-bad line-through decoration-bad/60" : kind === "comment" ? "text-subtle italic" : ""}>
              {header && kind !== "comment" ? (
                <>
                  <span className={kind === "missing" ? "" : "text-accent"}>{header[1]}</span>
                  <span className={kind === "missing" ? "" : "text-fg"}>:{header[2]}</span>
                </>
              ) : startLine ? (
                <span className="font-semibold text-fg">{line}</span>
              ) : (
                <span className="text-fg/90">{line || " "}</span>
              )}
            </span>
            {kind === "missing" && <span className="text-[10px] font-sans font-semibold tracking-wide text-bad uppercase">missing</span>}
          </div>
        );
      })}
    </pre>
  );
}
