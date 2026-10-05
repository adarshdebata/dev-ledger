export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="relative isolate overflow-hidden border-b border-line">
      <div className="bg-airflow pointer-events-none absolute inset-0 -z-10 opacity-80 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="container-page relative py-14 sm:py-20">
        <p className="eyebrow animate-fade-up text-accent">{eyebrow}</p>
        <h1 className="animate-fade-up mt-4 max-w-3xl text-4xl leading-[1.05] font-semibold tracking-[-0.04em] text-balance [animation-delay:60ms] sm:text-6xl">
          {title}
        </h1>
        {children && <div className="animate-fade-up mt-4 max-w-2xl text-lg text-muted [animation-delay:120ms]">{children}</div>}
      </div>
    </header>
  );
}
