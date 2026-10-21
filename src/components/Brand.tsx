import { useId } from 'react';
export function Brand({ compact = false }: { readonly compact?: boolean }) {
  const gradientId = useId();
  return (
    <span className="brand">
      <svg
        viewBox="0 0 40 40"
        width="36"
        height="36"
        fill="none"
        role="img"
        aria-label="OpenWorkLog logo"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="6"
            y1="4"
            x2="34"
            y2="36"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#3aa3f5" />
            <stop offset=".55" stopColor="#0a70cb" />
            <stop offset="1" stopColor="#0753a5" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="36" height="36" rx="12" fill={`url(#${gradientId})`} />
        <path
          d="M27.5 12.8a10 10 0 1 0 1.2 13.1"
          stroke="white"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <path
          d="m14 18 3.2 7.2 3.6-7.2 3.2 7.2 5.1-10.4"
          stroke="white"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {!compact && (
        <span>
          Open<span className="brand-light">WorkLog</span>
        </span>
      )}
    </span>
  );
}
