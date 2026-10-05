export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="dl-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#667EEA" />
          <stop offset="1" stopColor="#764BA2" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#dl-g)" />
      <path d="M9 11h14M9 16h9M9 21h14" stroke="#fff" strokeOpacity=".9" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="22" cy="16" r="2.4" fill="#fff" />
    </svg>
  );
}
