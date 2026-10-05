export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="relative overflow-hidden border-b border-line">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[44rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(139,92,246,0.18),transparent)]" />
      <div className="container-page relative py-14 sm:py-20">
        <p className="animate-fade-up font-mono text-xs tracking-widest text-accent uppercase">{eyebrow}</p>
        <h1 className="animate-fade-up mt-3 max-w-3xl text-3xl font-bold tracking-tight text-balance [animation-delay:60ms] sm:text-5xl">
          {title}
        </h1>
        {children && <div className="animate-fade-up mt-4 max-w-2xl text-lg text-muted [animation-delay:120ms]">{children}</div>}
      </div>
    </header>
  );
}
