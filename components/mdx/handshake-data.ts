/**
 * The messages that cross the network before the first byte of a response, per connection type.
 * `at` is when a message leaves, in round trips; every message takes half a round trip to arrive.
 * What an observer can read comes from our lab capture (see the post): the server name is in the
 * clear in the ClientHello; the path, cookies and token never are.
 */

export type Layer = "tcp" | "tls" | "http" | "quic";

export type Msg = {
  dir: "out" | "back";
  at: number;
  label: string;
  /** Smaller text under the label: what else rides in the same flight. */
  sub?: string;
  layer: Layer;
  /** Encrypted, so an observer sees only its size and timing. */
  sealed?: boolean;
  /** What someone on the same Wi-Fi, or any network on the way, can read from this message. */
  seen: string[];
  caption: string;
};

export type Scenario = { id: string; label: string; short: string; intro: string; msgs: Msg[]; outcome: string };

export const DISTANCES = [
  { id: "city", label: "Same city", rtt: 10 },
  { id: "country", label: "Across the country", rtt: 40 },
  { id: "continent", label: "Another continent", rtt: 150 },
] as const;

const ADDRS = "Your IP address and the server's, and the port: 443";

const SYN: Msg = {
  dir: "out",
  at: 0,
  label: "SYN",
  layer: "tcp",
  seen: [ADDRS, "That you're opening a connection"],
  caption: "The browser asks to open a TCP connection. A SYN carries no data, only “can we talk?” and the number it will start counting its bytes from.",
};

const SYN_ACK: Msg = {
  dir: "back",
  at: 0.5,
  label: "SYN-ACK",
  layer: "tcp",
  seen: [ADDRS],
  caption: "The server agrees and picks its own starting number. When this arrives, one full round trip has passed, and not one byte of your request has moved.",
};

const CLIENT_HELLO: Msg = {
  dir: "out",
  at: 1,
  label: "ACK + ClientHello",
  sub: "TLS starts in the same flight",
  layer: "tls",
  seen: [
    "The server name, `api.example.com` (SNI), in plain text",
    "The TLS versions and ciphers your browser supports",
    "The protocols it can speak next (`h2`, `http/1.1`)",
  ],
  caption:
    "TCP is open, so the browser's ACK and its TLS ClientHello leave together. The ClientHello names the site it wants, because one server often hosts many sites and must pick the right certificate.",
};

export const SCENARIOS: Scenario[] = [
  {
    id: "tls13",
    label: "HTTPS, TLS 1.3",
    short: "TLS 1.3",
    intro: "A brand-new HTTPS connection with TLS 1.3, what Chrome uses with almost every modern server.",
    msgs: [
      SYN,
      SYN_ACK,
      {
        ...CLIENT_HELLO,
        caption:
          CLIENT_HELLO.caption +
          " In TLS 1.3 it also carries the browser's half of the key exchange, a guess that saves a whole round trip.",
      },
      {
        dir: "back",
        at: 1.5,
        label: "ServerHello",
        sub: "+ certificate + Finished, encrypted",
        layer: "tls",
        seen: ["The cipher the server chose, and its half of the key exchange", "Then only encrypted bytes: in TLS 1.3 even the certificate is hidden"],
        caption:
          "The server sends its half of the key exchange. Both sides can now compute the same secret keys, so the rest of this flight, certificate included, is already encrypted. The browser checks the certificate: the right name, still valid, signed by someone it trusts.",
      },
      {
        dir: "out",
        at: 2,
        label: "Finished + GET /orders",
        sub: "the request rides with the last handshake message",
        layer: "http",
        sealed: true,
        seen: ["About 170 encrypted bytes", "Not the path, the query string, the cookies or the token"],
        caption: "The browser confirms the handshake and sends the HTTP request in the same flight. Two round trips have passed, and the request is only now leaving.",
      },
      {
        dir: "back",
        at: 2.5,
        label: "200 OK",
        layer: "http",
        sealed: true,
        seen: ["Encrypted bytes, their size and their timing"],
        caption: "The first byte of the response arrives after three round trips, before counting a single millisecond of server work.",
      },
    ],
    outcome: "Three round trips before the first byte: one for TCP, one for TLS 1.3, one for the request itself.",
  },
  {
    id: "tls12",
    label: "HTTPS, TLS 1.2",
    short: "TLS 1.2",
    intro: "The same connection with TLS 1.2, which many older servers and internal services still use.",
    msgs: [
      SYN,
      SYN_ACK,
      CLIENT_HELLO,
      {
        dir: "back",
        at: 1.5,
        label: "ServerHello + Certificate",
        sub: "+ key exchange + ServerHelloDone",
        layer: "tls",
        seen: ["The server's whole certificate, in plain text: exactly which site this is", "The cipher it chose"],
        caption:
          "TLS 1.2 sends the certificate unencrypted, and the key exchange only starts now: the browser didn't send its half in advance.",
      },
      {
        dir: "out",
        at: 2,
        label: "ClientKeyExchange + Finished",
        layer: "tls",
        seen: ["The browser's half of the key exchange", "Then its first encrypted message"],
        caption: "Only now does the browser send its half of the key exchange. This is the extra round trip that TLS 1.3 removed.",
      },
      {
        dir: "back",
        at: 2.5,
        label: "Finished",
        layer: "tls",
        sealed: true,
        seen: ["A short encrypted message"],
        caption: "The server confirms. Two round trips of TLS are done, three in total, and the request still hasn't left.",
      },
      {
        dir: "out",
        at: 3,
        label: "GET /orders",
        layer: "http",
        sealed: true,
        seen: ["Encrypted bytes only"],
        caption: "The request finally goes out.",
      },
      {
        dir: "back",
        at: 3.5,
        label: "200 OK",
        layer: "http",
        sealed: true,
        seen: ["Encrypted bytes, their size and their timing"],
        caption: "First byte after four round trips: one more than TLS 1.3, on every new connection.",
      },
    ],
    outcome: "Four round trips before the first byte. On a server 150 ms away, upgrading to TLS 1.3 saves 150 ms on every new connection.",
  },
  {
    id: "reuse",
    label: "Reused connection",
    short: "Reused",
    intro: "A second request to the same server while the first connection is still open. TCP and TLS are already done.",
    msgs: [
      {
        dir: "out",
        at: 0,
        label: "GET /orders",
        layer: "http",
        sealed: true,
        seen: ["Encrypted bytes only: no ClientHello, so not even the name is sent again"],
        caption: "The connection is still open and the keys are still agreed, so the request leaves at once.",
      },
      {
        dir: "back",
        at: 0.5,
        label: "200 OK",
        layer: "http",
        sealed: true,
        seen: ["Encrypted bytes, their size and their timing"],
        caption: "One round trip. This is why the first request to a server is the slowest, and why keeping connections open matters so much.",
      },
    ],
    outcome: "One round trip. DNS, TCP and TLS were all paid for by an earlier request.",
  },
  {
    id: "h3",
    label: "HTTP/3 (QUIC)",
    short: "HTTP/3",
    intro: "HTTP/3 runs over QUIC, on UDP. QUIC builds TLS 1.3 into its own handshake, so there's no separate TCP step.",
    msgs: [
      {
        dir: "out",
        at: 0,
        label: "Initial: ClientHello",
        sub: "over UDP, port 443",
        layer: "quic",
        seen: [
          "The server name. QUIC scrambles this first packet, but with keys anyone can work out, so an observer who bothers can read it",
          ADDRS + " (UDP)",
        ],
        caption: "No TCP handshake: the very first packet already carries the TLS 1.3 ClientHello, with the browser's half of the key exchange.",
      },
      {
        dir: "back",
        at: 0.5,
        label: "ServerHello",
        sub: "+ certificate + Finished, encrypted",
        layer: "quic",
        seen: ["The server's half of the key exchange", "Then only encrypted bytes"],
        caption: "The server answers with its half of the keys, its encrypted certificate and its Finished, exactly like TLS 1.3 over TCP.",
      },
      {
        dir: "out",
        at: 1,
        label: "Finished + GET /orders",
        layer: "http",
        sealed: true,
        seen: ["Encrypted bytes only"],
        caption: "One round trip in, the request is already on its way.",
      },
      {
        dir: "back",
        at: 1.5,
        label: "200 OK",
        layer: "http",
        sealed: true,
        seen: ["Encrypted bytes, their size and their timing"],
        caption: "The first byte after two round trips: as fast as plain, unencrypted HTTP over TCP.",
      },
    ],
    outcome:
      "Two round trips. But the browser only tries HTTP/3 after a server has said it can, in an `alt-svc` header on an earlier response, so a first visit usually still starts over TCP.",
  },
  {
    id: "http",
    label: "Plain HTTP",
    short: "HTTP",
    intro: "No TLS at all, as on http:// URLs. Faster to start, and completely readable.",
    msgs: [
      SYN,
      SYN_ACK,
      {
        dir: "out",
        at: 1,
        label: "ACK + GET /orders?card=4111…",
        layer: "http",
        seen: ["Everything: the path and query string, the Host, the cookies, the Authorization token", "Anyone on the way can also change it"],
        caption: "The request leaves with the ACK. Every byte of it is readable, and changeable, by any network it crosses.",
      },
      {
        dir: "back",
        at: 1.5,
        label: "200 OK",
        layer: "http",
        seen: ["The whole response, body included"],
        caption: "The first byte after two round trips.",
      },
    ],
    outcome: "Two round trips, with everything visible. TLS 1.3 costs exactly one round trip more; a reused HTTPS connection costs none.",
  },
];

/** When the first byte of the response arrives, in round trips. */
export const firstByte = (s: Scenario) => s.msgs.at(-1)!.at + 0.5;
