/** Renders `code` spans inside plain-string props. Usable from server and client components. */
export function inline(text: string) {
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith("`") && part.endsWith("`") ? (
      <code key={i} className="rounded bg-accent-tint px-1 py-px font-mono text-[0.88em] text-fg [box-decoration-break:clone]">
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    ),
  );
}
