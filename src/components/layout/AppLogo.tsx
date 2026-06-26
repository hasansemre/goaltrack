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
      {/* Dark navy background */}
      <rect width="512" height="512" rx="96" fill="#0f172a" />

      {/* Outer ring */}
      <circle cx="256" cy="256" r="166" fill="#1e3a5f" />
      <circle cx="256" cy="256" r="136" fill="#0f172a" />

      {/* Middle ring */}
      <circle cx="256" cy="256" r="120" fill="#1d4ed8" />
      <circle cx="256" cy="256" r="90" fill="#0f172a" />

      {/* Inner ring */}
      <circle cx="256" cy="256" r="74" fill="#3b82f6" />
      <circle cx="256" cy="256" r="44" fill="#0f172a" />

      {/* Bullseye center */}
      <circle cx="256" cy="256" r="28" fill="#ffffff" />
    </svg>
  );
}
