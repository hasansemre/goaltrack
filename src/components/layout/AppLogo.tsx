interface Props {
  size?: number;
}

export default function AppLogo({ size = 32 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="al-bg" x1="0" y1="512" x2="512" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0c0120" />
          <stop offset="50%" stopColor="#2d0b61" />
          <stop offset="100%" stopColor="#1c1680" />
        </linearGradient>
        <radialGradient id="al-cg" cx="50%" cy="44%" r="54%">
          <stop offset="0%" stopColor="#5b21b6" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#0c0120" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="al-rg" x1="177" y1="393" x2="335" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#e879f9" />
          <stop offset="38%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <filter id="al-dg" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="10" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="512" height="512" rx="112" fill="url(#al-bg)" />
      <rect width="512" height="512" rx="112" fill="url(#al-cg)" />

      <path
        d="M 177 393 A 158 158 0 1 1 335 393"
        fill="none" stroke="url(#al-rg)" strokeWidth="22" strokeLinecap="round"
      />

      <path
        d="M 174 256 L 231 316 L 346 191"
        fill="none" stroke="white" strokeWidth="34"
        strokeLinecap="round" strokeLinejoin="round" opacity={0.96}
      />

      <circle cx="177" cy="393" r="17" fill="#e879f9" filter="url(#al-dg)" opacity={0.95} />
      <circle cx="335" cy="393" r="17" fill="#22d3ee" filter="url(#al-dg)" opacity={0.95} />
    </svg>
  );
}
