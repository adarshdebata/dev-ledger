"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

function Placeholder({ label }: { label: string }) {
  return (
    <div className="not-prose my-10 grid h-[34rem] place-items-center rounded-2xl border border-line bg-card">
      <div className="flex flex-col items-center gap-3 text-sm text-subtle">
        <span className="size-6 animate-spin rounded-full border-2 border-line-strong border-t-accent-soft motion-reduce:animate-none" />
        Loading the {label}…
      </div>
    </div>
  );
}

const Playground = dynamic(() => import("./cors-playground"), {
  ssr: false,
  loading: () => <Placeholder label="CORS playground" />,
});

/** Downloads and mounts the playground only when it's about to scroll into view. */
export function CorsPlayground() {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
  }, []);

  return (
    <div ref={ref} data-pagefind-ignore>
      {show ? <Playground /> : <Placeholder label="CORS playground" />}
    </div>
  );
}
