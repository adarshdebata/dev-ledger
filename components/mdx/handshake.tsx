import { inline } from "./inline";
import { DISTANCES, SCENARIOS, firstByte } from "./handshake-data";
import { HandshakePlayer } from "./lazy";

/**
 * The handshakes before the first byte. Laptops and tablets get the step-by-step player, wide on big
 * screens; phones and readers who prefer reduced motion get the same story as plain numbered steps.
 */
export function HandshakeTimeline() {
  return (
    <figure className="not-prose my-10 md:motion-safe:breakout" data-wide>
      <div className="max-md:hidden motion-reduce:hidden">
        <HandshakePlayer />
      </div>
      <HandshakeSteps />
    </figure>
  );
}

function HandshakeSteps() {
  const [main] = SCENARIOS;
  const far = DISTANCES.at(-1)!.rtt;
  return (
    <div className="mx-auto max-w-[45rem] overflow-hidden rounded-2xl border border-line bg-card md:motion-safe:hidden">
      <div className="border-b border-line bg-bg-soft/70 px-4 py-3">
        <p className="text-[14px] font-semibold">Before the first byte</p>
        <p className="font-mono text-[11.5px] text-subtle">GET https://api.example.com/orders ({main.label})</p>
      </div>
      <ol>
        {main.msgs.map((m, i) => (
          <li key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-b border-line px-4 py-3.5">
            <span className="grid size-8 place-items-center rounded-full border border-accent-soft/50 font-mono text-sm font-semibold text-accent">{i + 1}</span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-muted">
                {m.dir === "out" ? "Browser → Server" : "Server → Browser"}: <span className="text-fg">{m.label}</span>
                <span className="ml-2 font-mono text-[11.5px] font-normal text-subtle">arrives at {m.at + 0.5} RTT</span>
              </p>
              <p className="mt-1 text-[14.5px] leading-relaxed text-muted">{inline(m.caption)}</p>
              <p className="mt-1.5 text-[13px] leading-snug text-subtle">
                {m.sealed ? "Encrypted. Visible: " : "Readable on the network: "}
                {inline(m.seen.join(" · "))}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <p className="border-b border-line px-4 py-3.5 text-[14px] leading-relaxed text-muted">
        <span className="font-semibold text-fg">{inline(main.outcome)}</span>
      </p>
      <table className="w-full text-left text-[13.5px]">
        <caption className="px-4 pt-3 text-left text-[12.5px] font-semibold text-subtle">First byte, with a server {far} ms away</caption>
        <thead>
          <tr className="border-b border-line text-[12px] text-subtle">
            <th className="px-4 py-2 font-semibold">Connection</th>
            <th className="px-4 py-2 font-semibold">Round trips</th>
            <th className="px-4 py-2 font-semibold">Time</th>
          </tr>
        </thead>
        <tbody>
          {SCENARIOS.map((s) => (
            <tr key={s.id} className="border-b border-line last:border-0">
              <td className="px-4 py-2 text-fg">{s.label}</td>
              <td className="px-4 py-2 font-mono tabular-nums">{firstByte(s)}</td>
              <td className="px-4 py-2 font-mono tabular-nums">{firstByte(s) * far} ms</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
