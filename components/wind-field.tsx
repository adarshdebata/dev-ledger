"use client";

import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; age: number; life: number; tone: number; speed: number; trail: number[] };

const TRAIL = 70; // points kept per streak (one every 2 frames): long, thin lines
const SPEED = 0.7; // px per frame on average: a slow drift, felt rather than noticed
const RADIUS = 150; // how far the pointer's influence reaches

/** Ink, coast teal, terracotta, at low alpha, per theme. */
const palette = (dark: boolean) =>
  dark
    ? ["rgba(236,230,218,0.16)", "rgba(114,198,201,0.38)", "rgba(232,145,107,0.45)"]
    : ["rgba(23,32,51,0.13)", "rgba(29,107,115,0.32)", "rgba(200,100,63,0.42)"];

/** A slowly changing direction field: left to right with long gentle waves, like a sea breeze. */
const angle = (x: number, y: number, t: number) =>
  Math.sin(x * 0.0042 + y * 0.0011 + t * 0.00012) * 0.32 +
  Math.cos(y * 0.0058 - x * 0.0009 - t * 0.00009) * 0.22 -
  0.04;

/**
 * Drifting streaks behind the hero, like a wind diagram. The pointer gently bends the
 * flow around it. It pauses off-screen and in background tabs, and draws one still
 * frame for readers who prefer reduced motion.
 */
export function WindField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let colors = palette(document.documentElement.classList.contains("dark"));
    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    let raf = 0;
    let running = false;
    let onScreen = true;
    let t = 0;
    let frames = 0;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false };

    const spawn = (p?: Particle): Particle => {
      const r = Math.random();
      const q = p ?? ({ trail: [] } as unknown as Particle);
      q.x = Math.random() * w;
      q.y = Math.random() * h;
      q.age = 0;
      q.life = 260 + Math.random() * 420;
      q.tone = r < 0.04 ? 2 : r < 0.16 ? 1 : 0;
      q.speed = SPEED * (0.75 + Math.random() * 0.5);
      q.trail = [q.x, q.y];
      return q;
    };

    const velocity = (p: Particle, time: number, withPointer: boolean) => {
      const a = angle(p.x, p.y, time);
      let vx = Math.cos(a) * p.speed;
      let vy = Math.sin(a) * p.speed;
      if (withPointer && pointer.active) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < RADIUS * RADIUS) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / RADIUS) ** 2;
          // A soft swirl around the pointer, with a slight push outwards.
          vx += (-dy / d) * f * 1.5 + (dx / d) * f * 0.5;
          vy += (dx / d) * f * 1.5 + (dy / d) * f * 0.5;
        }
      }
      return [vx, vy] as const;
    };

    const drawStreak = (p: Particle, alpha: number) => {
      const tr = p.trail;
      if (tr.length < 4) return;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = colors[p.tone];
      ctx.beginPath();
      ctx.moveTo(tr[0], tr[1]);
      for (let i = 2; i < tr.length; i += 2) ctx.lineTo(tr[i], tr[i + 1]);
      ctx.stroke();
    };

    /** One still picture of the flow, for reduced motion. */
    const drawStill = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.trail = [p.x, p.y];
        for (let i = 0; i < TRAIL * 2; i++) {
          // integrate a whole streak in one go
          const [vx, vy] = velocity(p, 0, false);
          p.x += vx;
          p.y += vy;
          if (i % 2 === 0) p.trail.push(p.x, p.y);
        }
        drawStreak(p, 1);
      }
      ctx.globalAlpha = 1;
    };

    const frame = () => {
      if (!running) return;
      t += 16;
      frames++;
      if ((frames & 31) === 0) canvas.dataset.frames = String(frames);
      pointer.x += (pointer.tx - pointer.x) * 0.12;
      pointer.y += (pointer.ty - pointer.y) * 0.12;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        const [vx, vy] = velocity(p, t, true);
        p.x += vx;
        p.y += vy;
        p.age++;
        if (frames % 2 === 0) {
          p.trail.push(p.x, p.y);
          if (p.trail.length > TRAIL * 2) p.trail.splice(0, 2);
        }
        // Fade in after spawning and out before dying, so nothing pops.
        const alpha = Math.min(1, p.age / 50, (p.life - p.age) / 50);
        drawStreak(p, Math.max(alpha, 0));
        if (p.age >= p.life || p.x < -40 || p.x > w + 40 || p.y < -40 || p.y > h + 40) spawn(p);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || reduce || !onScreen || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineWidth = 1.1;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const count = Math.min(90, Math.max(18, Math.round((w * h) / 14000)));
      particles = Array.from({ length: count }, () => {
        const p = spawn();
        p.age = Math.random() * p.life; // start mid-life so the first frame isn't empty
        return p;
      });
      if (reduce) drawStill();
    };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const inside = x > -RADIUS && y > -RADIUS && x < rect.width + RADIUS && y < rect.height + RADIUS;
      if (inside && !pointer.active) {
        pointer.x = x;
        pointer.y = y;
      }
      pointer.active = inside;
      pointer.tx = x;
      pointer.ty = y;
    };
    const onLeave = () => (pointer.active = false);
    const onVisibility = () => (document.hidden ? stop() : start());

    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    io.observe(canvas);
    const mo = new MutationObserver(() => {
      colors = palette(document.documentElement.classList.contains("dark"));
      if (reduce) drawStill();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("pointermove", onPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none [mask-image:radial-gradient(ellipse_70%_80%_at_74%_45%,black_30%,transparent_78%)] ${className}`}
    />
  );
}
