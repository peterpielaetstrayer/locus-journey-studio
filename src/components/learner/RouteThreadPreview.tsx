import { cn } from "@/lib/utils";

type RouteThreadPreviewProps = {
  className?: string;
  showLabels?: boolean;
  animate?: boolean;
};

export function RouteThreadPreview({
  className,
  showLabels = true,
  animate = true,
}: RouteThreadPreviewProps) {
  return (
    <svg
      viewBox="0 0 120 400"
      className={cn(
        "enter-landscape__route pointer-events-none",
        animate && "enter-landscape-animate-route",
        className,
      )}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="route-thread-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--route-thread) / 0.15)" />
          <stop offset="40%" stopColor="hsl(var(--route-thread) / 0.55)" />
          <stop offset="100%" stopColor="hsl(var(--route-thread) / 0.25)" />
        </linearGradient>
      </defs>

      {/* Route path — draws upward */}
      <path
        d="M 55 360 Q 48 300 52 240 Q 58 180 50 120 Q 45 70 60 30"
        fill="none"
        stroke="url(#route-thread-gradient)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeDasharray="420"
        className={animate ? "enter-landscape-route-path" : undefined}
      />

      {/* Nodes */}
      <circle cx="55" cy="360" r="3" fill="hsl(var(--route-thread) / 0.7)" />
      <circle cx="52" cy="240" r="2.5" fill="hsl(var(--route-thread) / 0.5)" />
      <circle cx="60" cy="30" r="2" fill="hsl(var(--route-thread) / 0.35)" />

      {showLabels && (
        <>
          <text
            x="68"
            y="365"
            fill="hsl(var(--route-thread) / 0.65)"
            fontSize="7"
            fontFamily="var(--font-geist-sans), system-ui, sans-serif"
            letterSpacing="0.12em"
          >
            LOOK CLOSER
          </text>
          <text
            x="68"
            y="125"
            fill="hsl(var(--route-thread) / 0.5)"
            fontSize="7"
            fontFamily="var(--font-geist-sans), system-ui, sans-serif"
            letterSpacing="0.12em"
          >
            FIND EVIDENCE
          </text>
        </>
      )}
    </svg>
  );
}
