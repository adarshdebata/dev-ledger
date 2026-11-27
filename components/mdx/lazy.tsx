"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { FlowData } from "./flow-data";

function Placeholder({ label, className = "h-[34rem]" }: { label: string; className?: string }) {
  return (
    <div className={`not-prose my-10 grid place-items-center rounded-2xl border border-line bg-card ${className}`}>
      <div className="flex flex-col items-center gap-3 text-sm text-subtle">
        <span className="size-6 animate-spin rounded-full border-2 border-line-strong border-t-accent-soft motion-reduce:animate-none" />
        Loading the {label}…
      </div>
    </div>
  );
}

/**
 * Renders `children` only once the spot is about to scroll into view, so heavy widgets load late.
 * With `media`, it renders nothing at all unless that media query matches (the page shows a fallback instead).
 */
function WhenNear({ label, media, className, children }: { label: string; media?: string; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  const [allowed, setAllowed] = useState(true);

  useEffect(() => {
    if (!media) return;
    const mql = window.matchMedia(media);
    const update = () => setAllowed(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [media]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !allowed) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [allowed]);

  if (!allowed) return null;
  return (
    <div ref={ref} data-pagefind-ignore>
      {show ? children : <Placeholder label={label} className={className} />}
    </div>
  );
}

const Playground = dynamic(() => import("./cors-playground"), {
  ssr: false,
  loading: () => <Placeholder label="CORS playground" />,
});

const Lab = dynamic(() => import("./helmet-lab"), {
  ssr: false,
  loading: () => <Placeholder label="Helmet lab" />,
});

const Journey = dynamic(() => import("./request-journey"), {
  ssr: false,
  loading: () => <Placeholder label="request journey" className="h-[38rem]" />,
});

const Dns = dynamic(() => import("./dns-lookup"), {
  ssr: false,
  loading: () => <Placeholder label="DNS lookup" className="h-[34rem]" />,
});

const Handshake = dynamic(() => import("./handshake-player"), {
  ssr: false,
  loading: () => <Placeholder label="handshake player" className="h-[38rem]" />,
});

const Headers = dynamic(() => import("./header-trip-player"), {
  ssr: false,
  loading: () => <Placeholder label="header player" className="h-[44rem]" />,
});

const Bind = dynamic(() => import("./bind-player"), {
  ssr: false,
  loading: () => <Placeholder label="listening-address player" className="h-[42rem]" />,
});

const Ids = dynamic(() => import("./id-machine"), {
  ssr: false,
  loading: () => <Placeholder label="ID player" className="h-[40rem]" />,
});

export function CorsPlayground() {
  return (
    <WhenNear label="CORS playground">
      <Playground />
    </WhenNear>
  );
}

export function HelmetLab() {
  return (
    <WhenNear label="Helmet lab">
      <Lab />
    </WhenNear>
  );
}

/** Only for screens wide enough for it, and only when motion is welcome. */
export function DnsPlayer() {
  return (
    <WhenNear label="DNS lookup" className="h-[34rem]" media="(min-width: 48rem) and (prefers-reduced-motion: no-preference)">
      <Dns />
    </WhenNear>
  );
}

/** Only for screens wide enough for it, and only when motion is welcome. */
export function HandshakePlayer() {
  return (
    <WhenNear label="handshake player" className="h-[38rem]" media="(min-width: 48rem) and (prefers-reduced-motion: no-preference)">
      <Handshake />
    </WhenNear>
  );
}

/** Only for screens wide enough for it, and only when motion is welcome. */
export function HeaderTripPlayer() {
  return (
    <WhenNear label="header player" className="h-[44rem]" media="(min-width: 48rem) and (prefers-reduced-motion: no-preference)">
      <Headers />
    </WhenNear>
  );
}

/** Only for screens wide enough for it, and only when motion is welcome. */
export function BindPlayer() {
  return (
    <WhenNear label="listening-address player" className="h-[42rem]" media="(min-width: 48rem) and (prefers-reduced-motion: no-preference)">
      <Bind />
    </WhenNear>
  );
}

/** Only for screens wide enough for it, and only when motion is welcome. */
export function IdMachinePlayer() {
  return (
    <WhenNear label="ID player" className="h-[40rem]" media="(min-width: 48rem) and (prefers-reduced-motion: no-preference)">
      <Ids />
    </WhenNear>
  );
}

/** Only for screens wide enough for it, and only when motion is welcome. */
export function JourneyPlayer() {
  return (
    <WhenNear label="request journey" className="h-[38rem]" media="(min-width: 48rem) and (prefers-reduced-motion: no-preference)">
      <Journey />
    </WhenNear>
  );
}

const Install = dynamic(() => import("./install-player"), {
  ssr: false,
  loading: () => <Placeholder label="npm install player" className="h-[40rem]" />,
});

/** Only for screens wide enough for it, and only when motion is welcome. */
export function InstallPlayer() {
  return (
    <WhenNear label="npm install player" className="h-[40rem]" media="(min-width: 48rem) and (prefers-reduced-motion: no-preference)">
      <Install />
    </WhenNear>
  );
}

const Require = dynamic(() => import("./require-player"), {
  ssr: false,
  loading: () => <Placeholder label="node_modules player" className="h-[44rem]" />,
});

/** Only for screens wide enough for it, and only when motion is welcome. */
export function RequirePlayer() {
  return (
    <WhenNear label="node_modules player" className="h-[44rem]" media="(min-width: 48rem) and (prefers-reduced-motion: no-preference)">
      <Require />
    </WhenNear>
  );
}

const Lockfile = dynamic(() => import("./lockfile-player"), {
  ssr: false,
  loading: () => <Placeholder label="lockfile player" className="h-[38rem]" />,
});

/** Only for screens wide enough for it, and only when motion is welcome. */
export function LockfilePlayer() {
  return (
    <WhenNear label="lockfile player" className="h-[38rem]" media="(min-width: 48rem) and (prefers-reduced-motion: no-preference)">
      <Lockfile />
    </WhenNear>
  );
}

const Pnpm = dynamic(() => import("./pnpm-player"), {
  ssr: false,
  loading: () => <Placeholder label="pnpm player" className="h-[44rem]" />,
});

/** Only for screens wide enough for it, and only when motion is welcome. */
export function PnpmPlayer() {
  return (
    <WhenNear label="pnpm player" className="h-[44rem]" media="(min-width: 48rem) and (prefers-reduced-motion: no-preference)">
      <Pnpm />
    </WhenNear>
  );
}

const Flow = dynamic(() => import("./flow-player"), {
  ssr: false,
  loading: () => <Placeholder label="request-flow player" className="h-[40rem]" />,
});

/** Only for screens wide enough for it, and only when motion is welcome. The scenarios come from the page. */
export function FlowPlayer({ data }: { data: FlowData }) {
  return (
    <WhenNear label="request-flow player" className="h-[40rem]" media="(min-width: 48rem) and (prefers-reduced-motion: no-preference)">
      <Flow data={data} />
    </WhenNear>
  );
}
