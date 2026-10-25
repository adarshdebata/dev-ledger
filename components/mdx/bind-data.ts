/**
 * Who can reach a server, depending on the address it listens on, on a laptop and inside a container.
 * Every result here is one we reproduced: Node.js 24 on Windows, Docker Desktop with node:24-alpine,
 * Chrome 155 for the browser errors.
 */

export type Bind = "127.0.0.1" | "0.0.0.0";

export type Box = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub: string;
  kind: "caller" | "door" | "app" | "forward";
};

export type Frame = { x: number; y: number; w: number; h: number; label: string };

export type Outcome = { ok: boolean; text: string; caption: string };

export type Trip = {
  /** Points of the path the connection travels, in viewBox units. */
  path: [number, number][];
  /** The interface it arrives through, if it reaches the app's machine. */
  door?: string;
  who: string;
  result: Record<Bind, Outcome>;
};

export type Setup = { id: string; label: string; intro: string; frames: Frame[]; boxes: Box[]; trips: Trip[] };

export const SETUPS: Setup[] = [
  {
    id: "laptop",
    label: "On your laptop",
    intro: "A dev server on your laptop, listening on port 3000. Two callers try to reach it: your own browser, and your phone on the same Wi-Fi.",
    frames: [{ x: 320, y: 16, w: 664, h: 388, label: "Your laptop" }],
    boxes: [
      { id: "browser", x: 350, y: 72, w: 200, h: 64, title: "Browser", sub: "localhost:3000", kind: "caller" },
      { id: "phone", x: 24, y: 262, w: 236, h: 64, title: "Phone on the Wi-Fi", sub: "192.168.1.20:3000", kind: "caller" },
      { id: "lo", x: 590, y: 72, w: 170, h: 64, title: "loopback", sub: "127.0.0.1", kind: "door" },
      { id: "wifi", x: 590, y: 262, w: 170, h: 64, title: "Wi-Fi", sub: "192.168.1.20", kind: "door" },
      { id: "app", x: 800, y: 160, w: 170, h: 80, title: "node server.js", sub: "port 3000", kind: "app" },
    ],
    trips: [
      {
        who: "Your browser opens localhost:3000",
        door: "lo",
        path: [
          [550, 104],
          [590, 104],
          [760, 104],
          [800, 190],
        ],
        result: {
          "127.0.0.1": { ok: true, text: "200 OK", caption: "`localhost` stays inside the machine: it arrives on the loopback interface, and the server is listening right there." },
          "0.0.0.0": { ok: true, text: "200 OK", caption: "`0.0.0.0` means every interface, loopback included, so your own browser still gets in." },
        },
      },
      {
        who: "Your phone opens 192.168.1.20:3000",
        door: "wifi",
        path: [
          [260, 294],
          [590, 294],
          [760, 294],
          [800, 210],
        ],
        result: {
          "127.0.0.1": {
            ok: false,
            text: "ERR_CONNECTION_REFUSED",
            caption:
              "The phone's request arrives on the Wi-Fi interface, and nothing is listening on 192.168.1.20:3000. The laptop answers “refused” at once (or a firewall drops it, and the phone times out).",
          },
          "0.0.0.0": { ok: true, text: "200 OK", caption: "Listening on every interface includes the Wi-Fi one, so the phone gets in, as long as the laptop's firewall allows it." },
        },
      },
    ],
  },
  {
    id: "docker",
    label: "Inside Docker",
    intro: "The same server in a container, started with `docker run -p 3000:3000`. The container has its own network: its own loopback, and its own address.",
    frames: [
      { x: 16, y: 16, w: 968, h: 388, label: "Your laptop" },
      { x: 430, y: 40, w: 540, h: 340, label: "Container" },
    ],
    boxes: [
      { id: "db", x: 40, y: 72, w: 220, h: 64, title: "Postgres on your laptop", sub: "listening on 5432", kind: "caller" },
      { id: "browser", x: 40, y: 262, w: 200, h: 64, title: "Browser", sub: "localhost:3000", kind: "caller" },
      { id: "fwd", x: 262, y: 262, w: 150, h: 64, title: "Docker port", sub: ":3000 → :3000", kind: "forward" },
      { id: "wget", x: 452, y: 72, w: 176, h: 64, title: "wget in the container", sub: "127.0.0.1:3000", kind: "caller" },
      { id: "lo", x: 650, y: 72, w: 150, h: 64, title: "its loopback", sub: "127.0.0.1", kind: "door" },
      { id: "eth0", x: 650, y: 262, w: 150, h: 64, title: "eth0", sub: "172.17.0.2", kind: "door" },
      { id: "app", x: 822, y: 160, w: 136, h: 80, title: "node server.js", sub: "port 3000", kind: "app" },
    ],
    trips: [
      {
        who: "A command inside the container opens 127.0.0.1:3000",
        door: "lo",
        path: [
          [628, 104],
          [650, 104],
          [800, 104],
          [822, 190],
        ],
        result: {
          "127.0.0.1": { ok: true, text: "hi from the container", caption: "Inside the container, `127.0.0.1` is the container's own loopback, and the server is listening on it. Everything looks fine from in here." },
          "0.0.0.0": { ok: true, text: "hi from the container", caption: "Still fine: every interface includes the container's loopback." },
        },
      },
      {
        who: "Your browser opens localhost:3000 on the laptop",
        door: "eth0",
        path: [
          [240, 294],
          [262, 294],
          [412, 294],
          [650, 294],
          [800, 294],
          [822, 210],
        ],
        result: {
          "127.0.0.1": {
            ok: false,
            text: "ERR_EMPTY_RESPONSE",
            caption:
              "Docker accepts the connection on the laptop and forwards it to the container's own address, 172.17.0.2. Nothing listens there, only on the container's loopback, so the connection is closed with no reply. curl says `(52) Empty reply from server`.",
          },
          "0.0.0.0": { ok: true, text: "hi from the container", caption: "Listening on every interface includes eth0, where Docker delivers the forwarded connection. The page loads." },
        },
      },
      {
        who: "The app connects to the database at localhost:5432",
        door: "lo",
        path: [
          [822, 220],
          [725, 220],
          [725, 136],
        ],
        result: {
          "127.0.0.1": {
            ok: false,
            text: "ECONNREFUSED 127.0.0.1:5432",
            caption: "The same trap in reverse. Inside the container, `localhost` is the container itself, and there's no database in it. The one on your laptop is on a different machine, as far as the container can tell.",
          },
          "0.0.0.0": {
            ok: false,
            text: "ECONNREFUSED 127.0.0.1:5432",
            caption: "The server's own listening address doesn't matter here: this is the app calling out, and `localhost` still means the container.",
          },
        },
      },
      {
        who: "The app connects to host.docker.internal:5432 instead",
        path: [
          [890, 240],
          [890, 372],
          [251, 372],
          [251, 136],
        ],
        result: {
          "127.0.0.1": { ok: true, text: "connected", caption: "`host.docker.internal` is Docker Desktop's name for your laptop, as seen from a container. On a server, you'd use the database's own host name or a Docker network instead." },
          "0.0.0.0": { ok: true, text: "connected", caption: "`host.docker.internal` is Docker Desktop's name for your laptop, as seen from a container. On a server, you'd use the database's own host name or a Docker network instead." },
        },
      },
    ],
  },
];

/** The interfaces a server listens on for a bind address. */
export const listensOn = (bind: Bind, setup: Setup) => setup.boxes.filter((b) => b.kind === "door" && (bind === "0.0.0.0" || b.sub.startsWith("127.0.0.1"))).map((b) => b.id);
