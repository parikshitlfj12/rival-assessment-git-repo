export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="hero-blob" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="hero-accent" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="hero-mint" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="hero-amber" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <filter id="hero-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="8" />
          <feOffset dy="8" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.18" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse cx="260" cy="240" rx="240" ry="180" fill="url(#hero-blob)" />
      <circle cx="80" cy="120" r="3" fill="#0EA5E9" opacity="0.4" />
      <circle cx="460" cy="100" r="4" fill="#0EA5E9" opacity="0.35" />
      <circle cx="440" cy="340" r="3" fill="#06B6D4" opacity="0.4" />
      <circle cx="60" cy="320" r="2" fill="#0EA5E9" opacity="0.5" />
      <path
        d="M430 60 L430 76 M422 68 L438 68"
        stroke="#0EA5E9"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M70 380 L70 392 M64 386 L76 386"
        stroke="#06B6D4"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />

      <g transform="translate(60 80) rotate(-6)" filter="url(#hero-shadow)" opacity="0.65">
        <rect width="280" height="80" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="1" />
        <circle cx="28" cy="40" r="10" fill="none" stroke="#94A3B8" strokeWidth="2" />
        <rect x="52" y="28" width="160" height="10" rx="5" fill="#94A3B8" opacity="0.55" />
        <rect x="52" y="46" width="100" height="8" rx="4" fill="#94A3B8" opacity="0.3" />
        <rect x="232" y="32" width="34" height="16" rx="8" fill="url(#hero-amber)" opacity="0.85" />
      </g>

      <g transform="translate(80 168) rotate(-2)" filter="url(#hero-shadow)" opacity="0.85">
        <rect width="320" height="90" rx="20" fill="var(--card)" stroke="var(--border)" strokeWidth="1" />
        <circle cx="32" cy="45" r="11" fill="none" stroke="#0EA5E9" strokeWidth="2.5" />
        <path d="M27 45 L31 49 L38 41" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="58" y="32" width="170" height="11" rx="5.5" fill="var(--foreground)" opacity="0.78" />
        <rect x="58" y="52" width="120" height="9" rx="4.5" fill="var(--foreground)" opacity="0.32" />
        <rect x="248" y="36" width="56" height="20" rx="10" fill="url(#hero-mint)" opacity="0.18" />
        <rect x="248" y="36" width="56" height="20" rx="10" fill="none" stroke="url(#hero-mint)" strokeWidth="1.2" />
        <circle cx="263" cy="46" r="3" fill="#10B981" />
        <text x="272" y="50" fontSize="10" fontWeight="600" fill="#059669">Done</text>
      </g>

      <g transform="translate(110 282) rotate(3)" filter="url(#hero-shadow)">
        <rect width="340" height="96" rx="22" fill="var(--card)" stroke="var(--border)" strokeWidth="1" />
        <rect x="20" y="22" width="46" height="52" rx="12" fill="url(#hero-accent)" />
        <text
          x="43"
          y="42"
          fontSize="11"
          fontWeight="700"
          fill="white"
          textAnchor="middle"
          opacity="0.85"
        >
          JUN
        </text>
        <text
          x="43"
          y="62"
          fontSize="18"
          fontWeight="800"
          fill="white"
          textAnchor="middle"
        >
          18
        </text>
        <rect x="82" y="28" width="170" height="12" rx="6" fill="var(--foreground)" opacity="0.85" />
        <rect x="82" y="50" width="130" height="9" rx="4.5" fill="var(--foreground)" opacity="0.35" />
        <rect x="82" y="66" width="80" height="9" rx="4.5" fill="var(--foreground)" opacity="0.25" />
        <rect x="272" y="36" width="50" height="20" rx="10" fill="url(#hero-accent)" opacity="0.16" />
        <rect x="272" y="36" width="50" height="20" rx="10" fill="none" stroke="url(#hero-accent)" strokeWidth="1.2" />
        <text x="297" y="50" fontSize="10" fontWeight="600" fill="#0284C7" textAnchor="middle">High</text>
      </g>

      <g transform="translate(384 84)">
        <circle cx="0" cy="0" r="34" fill="url(#hero-mint)" />
        <circle cx="0" cy="0" r="34" fill="none" stroke="white" strokeWidth="2" opacity="0.25" />
        <path
          d="M-12 -1 L-3 8 L13 -10"
          stroke="white"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      <g transform="translate(58 252)">
        <path
          d="M0 -12 L3 -3 L12 0 L3 3 L0 12 L-3 3 L-12 0 L-3 -3 Z"
          fill="url(#hero-accent)"
          opacity="0.85"
        />
      </g>

      <g transform="translate(478 250)">
        <path
          d="M0 -8 L2.4 -2.4 L8 0 L2.4 2.4 L0 8 L-2.4 2.4 L-8 0 L-2.4 -2.4 Z"
          fill="#06B6D4"
          opacity="0.7"
        />
      </g>
    </svg>
  );
}
