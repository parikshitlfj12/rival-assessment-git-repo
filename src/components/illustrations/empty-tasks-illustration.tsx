export function EmptyTasksIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <rect x="24" y="20" width="152" height="120" rx="16" fill="var(--muted)" stroke="var(--border)" strokeWidth="1.5" />
      <rect x="44" y="48" width="80" height="8" rx="4" fill="var(--muted-foreground)" opacity="0.25" />
      <rect x="44" y="64" width="112" height="6" rx="3" fill="var(--muted-foreground)" opacity="0.15" />
      <rect x="44" y="78" width="96" height="6" rx="3" fill="var(--muted-foreground)" opacity="0.15" />
      <circle cx="100" cy="108" r="20" fill="var(--accent)" stroke="var(--primary)" strokeWidth="2" />
      <path d="M92 108h16M100 100v16" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
