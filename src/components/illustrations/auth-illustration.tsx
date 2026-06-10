export function AuthIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 440 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="auth-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="auth-primary" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="auth-mint" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <filter id="auth-shadow" x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="10" />
          <feOffset dy="10" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.16" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse cx="220" cy="210" rx="200" ry="170" fill="url(#auth-bg)" />

      <circle cx="60" cy="80" r="3" fill="#0EA5E9" opacity="0.4" />
      <circle cx="380" cy="110" r="4" fill="#06B6D4" opacity="0.35" />
      <circle cx="80" cy="340" r="3" fill="#0EA5E9" opacity="0.45" />
      <circle cx="380" cy="320" r="2.5" fill="#06B6D4" opacity="0.4" />
      <path
        d="M50 200 L50 214 M43 207 L57 207"
        stroke="#0EA5E9"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M385 230 L385 244 M378 237 L392 237"
        stroke="#06B6D4"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />

      <g transform="translate(80 120) rotate(-4)" filter="url(#auth-shadow)" opacity="0.45">
        <rect width="260" height="58" rx="16" fill="var(--card)" stroke="var(--border)" strokeWidth="1" />
        <circle cx="28" cy="29" r="9" fill="none" stroke="#94A3B8" strokeWidth="2" />
        <rect x="50" y="22" width="140" height="8" rx="4" fill="#94A3B8" opacity="0.45" />
        <rect x="50" y="36" width="90" height="6" rx="3" fill="#94A3B8" opacity="0.28" />
      </g>

      <g transform="translate(70 178)" filter="url(#auth-shadow)">
        <rect width="300" height="156" rx="22" fill="var(--card)" stroke="var(--border)" strokeWidth="1" />

        <rect x="24" y="24" width="80" height="8" rx="4" fill="url(#auth-primary)" opacity="0.85" />
        <rect x="24" y="40" width="120" height="6" rx="3" fill="var(--foreground)" opacity="0.25" />
        <line x1="24" y1="62" x2="276" y2="62" stroke="var(--border)" strokeWidth="1" />

        <g transform="translate(24 80)">
          <circle cx="10" cy="10" r="10" fill="url(#auth-mint)" opacity="0.18" />
          <circle cx="10" cy="10" r="10" fill="none" stroke="url(#auth-mint)" strokeWidth="1.5" />
          <path d="M6 10 L9 13 L14 7" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <rect x="28" y="4" width="140" height="9" rx="4.5" fill="var(--foreground)" opacity="0.8" />
          <rect x="28" y="17" width="80" height="6" rx="3" fill="var(--foreground)" opacity="0.3" />
        </g>

        <g transform="translate(24 116)">
          <circle cx="10" cy="10" r="10" fill="url(#auth-primary)" opacity="0.18" />
          <circle cx="10" cy="10" r="10" fill="none" stroke="url(#auth-primary)" strokeWidth="1.5" />
          <rect x="6" y="6" width="8" height="8" rx="2" fill="url(#auth-primary)" />
          <rect x="28" y="4" width="170" height="9" rx="4.5" fill="var(--foreground)" opacity="0.8" />
          <rect x="28" y="17" width="100" height="6" rx="3" fill="var(--foreground)" opacity="0.3" />
        </g>
      </g>

      <g transform="translate(340 90)" filter="url(#auth-shadow)">
        <circle cx="0" cy="0" r="38" fill="url(#auth-primary)" />
        <circle cx="0" cy="0" r="38" fill="none" stroke="white" strokeWidth="2" opacity="0.25" />
        <path
          d="M-14 0 L-3 11 L15 -11"
          stroke="white"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>

      <g transform="translate(74 340) rotate(-5)" filter="url(#auth-shadow)">
        <rect width="88" height="60" rx="14" fill="url(#auth-primary)" />
        <text
          x="44"
          y="26"
          fontSize="11"
          fontWeight="700"
          fill="white"
          textAnchor="middle"
          opacity="0.85"
        >
          TODAY
        </text>
        <text
          x="44"
          y="48"
          fontSize="22"
          fontWeight="800"
          fill="white"
          textAnchor="middle"
        >
          12
        </text>
      </g>

      <g transform="translate(360 290)">
        <path
          d="M0 -14 L3.5 -3.5 L14 0 L3.5 3.5 L0 14 L-3.5 3.5 L-14 0 L-3.5 -3.5 Z"
          fill="#06B6D4"
          opacity="0.75"
        />
      </g>
    </svg>
  );
}
