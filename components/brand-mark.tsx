import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={cn("size-10", className)}
    >
      <defs>
        <linearGradient id="glass-a" x1="8" y1="4" x2="40" y2="44">
          <stop offset="0%" stopColor="#F6E27A" />
          <stop offset="45%" stopColor="#D4A017" />
          <stop offset="100%" stopColor="#8A5A12" />
        </linearGradient>
        <linearGradient id="glass-b" x1="12" y1="10" x2="36" y2="38">
          <stop offset="0%" stopColor="#FFF6C8" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#D4A017" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <path
        d="M24 3.5 42 13.2v21.6L24 44.5 6 34.8V13.2L24 3.5Z"
        fill="url(#glass-a)"
      />
      <path
        d="M24 7.2 37.5 14.4v19.2L24 40.8 10.5 33.6V14.4L24 7.2Z"
        fill="url(#glass-b)"
      />
      <path
        d="M24 7.2v33.6M10.5 14.4 24 21.2 37.5 14.4M10.5 33.6 24 26.8 37.5 33.6"
        stroke="#1A1408"
        strokeOpacity="0.35"
        strokeWidth="1.1"
      />
    </svg>
  );
}
