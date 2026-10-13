/**
 * One DNS lookup, hop by hop. Names and addresses use the documentation ranges (example.com, 192.0.2.0/24 …);
 * the TTLs are the real ones we saw: 172800 s for delegations from the root and .com, 300 s for example.com.
 */

export const STOPS = [
  { id: "browser", name: "Browser", where: "its own cache" },
  { id: "computer", name: "This computer", where: "OS cache, hosts file" },
  { id: "resolver", name: "Resolver", where: "your ISP, or 8.8.8.8" },
  { id: "root", name: "Root", where: "knows the TLDs" },
  { id: "tld", name: ".com", where: "knows .com names" },
  { id: "auth", name: "Authoritative", where: "example.com's own" },
] as const;

export type StopIndex = 0 | 1 | 2 | 3 | 4 | 5;

export type Hop = {
  from: StopIndex;
  to: StopIndex;
  /** What rides on the chip: the question going out, or the answer coming back. */
  chip: string;
  kind: "ask" | "answer" | "check" | "bad" | "fix";
  caption: string;
  log: string;
  ms: number;
};

export type Scenario = { id: string; label: string; question: string; intro: string; hops: Hop[]; outcome: string };

const ASK = "A? api.example.com";

export const SCENARIOS: Scenario[] = [
  {
    id: "cold",
    label: "Nothing cached",
    question: "api.example.com",
    intro: "Nobody nearby has asked for api.example.com recently, so the question has to travel all the way to the server that knows.",
    hops: [
      { from: 0, to: 0, chip: "cache?", kind: "check", ms: 0, log: "browser cache: no entry", caption: "The browser checks its own short-term cache first. Nothing there for api.example.com." },
      { from: 0, to: 1, chip: ASK, kind: "ask", ms: 1, log: "this computer: no cache entry, nothing in the hosts file", caption: "It asks the operating system, which checks its own cache and the hosts file. Nothing there either." },
      { from: 1, to: 2, chip: ASK, kind: "ask", ms: 9, log: "→ resolver 192.0.2.53: A? api.example.com", caption: "The computer sends the question to its DNS resolver, usually run by your internet provider, unless you picked a public one like 8.8.8.8." },
      { from: 2, to: 3, chip: ASK, kind: "ask", ms: 13, log: "resolver → root: A? api.example.com", caption: "The resolver has no copy either. It starts at the top and asks a root server." },
      { from: 3, to: 2, chip: "ask .com", kind: "answer", ms: 13, log: "root: don't know, ask .com's servers (keep this 172800 s)", caption: "The root doesn't know any website's address. It only knows who handles .com, and says that answer may be kept for 48 hours." },
      { from: 2, to: 4, chip: ASK, kind: "ask", ms: 15, log: "resolver → .com: A? api.example.com", caption: "The resolver asks one of the .com servers." },
      { from: 4, to: 2, chip: "ask ns1.example.com", kind: "answer", ms: 15, log: ".com: ask example.com's name servers (keep this 172800 s)", caption: "The .com server doesn't know the address either. It knows which servers hold example.com's records, and that can be kept for 48 hours too." },
      { from: 2, to: 5, chip: ASK, kind: "ask", ms: 21, log: "resolver → ns1.example.com: A? api.example.com", caption: "Finally the resolver asks example.com's own name server, the authoritative one." },
      { from: 5, to: 2, chip: "203.0.113.10", kind: "answer", ms: 21, log: "api.example.com  300  IN  A  203.0.113.10", caption: "The real answer: 203.0.113.10. The 300 is the TTL: anyone may keep this answer for 300 seconds before asking again." },
      { from: 2, to: 1, chip: "203.0.113.10", kind: "answer", ms: 9, log: "resolver → you: 203.0.113.10 (cached for 300 s)", caption: "The resolver keeps a copy for the next person who asks, and sends the answer back." },
      { from: 1, to: 0, chip: "203.0.113.10", kind: "answer", ms: 1, log: "this computer: cached, browser can connect", caption: "Your computer keeps a copy too, and the browser finally has an address it can connect to." },
    ],
    outcome: "118 ms, the DNS Lookup bar from the last post. Every copy made on the way back is why the next lookup is much faster.",
  },
  {
    id: "resolver",
    label: "Cached at the resolver",
    question: "api.example.com",
    intro: "Someone else using the same resolver asked for this name a minute ago, so the resolver still has a copy.",
    hops: [
      { from: 0, to: 0, chip: "cache?", kind: "check", ms: 0, log: "browser cache: no entry", caption: "Nothing in the browser's cache." },
      { from: 0, to: 1, chip: ASK, kind: "ask", ms: 1, log: "this computer: no cache entry", caption: "Nothing on this computer either." },
      { from: 1, to: 2, chip: ASK, kind: "ask", ms: 9, log: "→ resolver: A? api.example.com", caption: "The question goes to the resolver, as before." },
      { from: 2, to: 2, chip: "copy found", kind: "check", ms: 0, log: "resolver cache: hit, 231 s of the TTL left", caption: "This time the resolver has a copy, with 231 of its 300 seconds left. The root, .com and the authoritative server are never asked." },
      { from: 2, to: 1, chip: "203.0.113.10", kind: "answer", ms: 9, log: "resolver → you: 203.0.113.10", caption: "The answer comes straight back." },
      { from: 1, to: 0, chip: "203.0.113.10", kind: "answer", ms: 1, log: "this computer: cached", caption: "The browser has its address." },
    ],
    outcome: "20 ms instead of 118: one trip to the resolver and back. This is the usual case for popular names.",
  },
  {
    id: "local",
    label: "Cached on this computer",
    question: "api.example.com",
    intro: "You opened this site a few seconds ago, so your own computer still has the answer.",
    hops: [
      { from: 0, to: 0, chip: "cache?", kind: "check", ms: 0, log: "browser cache: no entry", caption: "The browser's own cache has expired already, so it asks the operating system." },
      { from: 0, to: 1, chip: ASK, kind: "ask", ms: 1, log: "this computer: hit, 19 s of the TTL left", caption: "The operating system still has a copy. Nothing leaves your machine at all." },
      { from: 1, to: 0, chip: "203.0.113.10", kind: "answer", ms: 0, log: "this computer → browser: 203.0.113.10", caption: "The answer is back in about a millisecond." },
    ],
    outcome: "About 1 ms. In DevTools, the DNS Lookup row is tiny or simply missing.",
  },
  {
    id: "liar",
    label: "A resolver that lies",
    question: "go.example",
    intro: "A short link won't open. The resolver you're using hands out an address that no longer works.",
    hops: [
      { from: 0, to: 1, chip: "A? go.example", kind: "ask", ms: 1, log: "this computer: no cache entry", caption: "Nothing cached, so the question goes out as usual." },
      { from: 1, to: 2, chip: "A? go.example", kind: "ask", ms: 9, log: "→ your ISP's resolver: A? go.example", caption: "It reaches your internet provider's resolver." },
      { from: 2, to: 2, chip: "old copy", kind: "bad", ms: 0, log: "ISP resolver: 198.51.100.7 (this address is dead)", caption: "The resolver answers from a copy that's wrong. The service moved, but this resolver keeps handing out the old address." },
      { from: 2, to: 0, chip: "198.51.100.7", kind: "bad", ms: 10, log: "browser → 198.51.100.7: nothing answers", caption: "The browser connects to that address and waits. Nothing is there, so the link never loads. DNS 'worked', but the answer was wrong." },
      { from: 1, to: 2, chip: "A? go.example (8.8.8.8)", kind: "fix", ms: 12, log: "nslookup go.example. 8.8.8.8  →  192.0.2.44", caption: "The fix: ask a different resolver directly. Google's public resolver, 8.8.8.8, returns 192.0.2.44, an address that works." },
      { from: 2, to: 0, chip: "192.0.2.44", kind: "answer", ms: 10, log: "browser → 192.0.2.44: connected", caption: "With the right address, the link opens. The wrong copy stays in that one resolver until it expires or someone fixes it." },
    ],
    outcome: "Same name, two resolvers, two different answers. When something works on one network and not another, compare what each resolver says.",
  },
];
