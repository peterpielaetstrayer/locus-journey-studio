import { JOURNEY_STOPS } from "@/data/canonical";

export function CreatorRouteMap() {
  return (
    <div className="relative h-64 rounded-xl border border-border bg-surface-raised">
      <svg viewBox="0 0 100 90" className="h-full w-full" role="img" aria-label="Creator route map with eight numbered stops">
        <defs>
          <linearGradient id="creator-map-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(203 35% 18%)" />
            <stop offset="100%" stopColor="hsl(157 25% 22%)" />
          </linearGradient>
        </defs>
        <rect width="100" height="90" fill="url(#creator-map-bg)" />
        <path
          d="M 8 75 Q 25 65 40 50 Q 55 35 70 25 Q 85 15 92 10"
          fill="none"
          stroke="hsl(40 42% 70%)"
          strokeWidth="1.2"
        />
        <ellipse cx="35" cy="55" rx="18" ry="12" fill="hsl(193 40% 35% / 0.35)" />
        {JOURNEY_STOPS.map((stop) => (
          <g key={stop.id}>
            <circle
              cx={stop.mapX * 0.95}
              cy={stop.mapY * 0.85 + 5}
              r="3.5"
              fill={stop.id === "stop-cypress-knee" ? "hsl(39 78% 61%)" : "hsl(157 28% 43%)"}
            />
            <text
              x={stop.mapX * 0.95}
              y={stop.mapY * 0.85 + 1}
              textAnchor="middle"
              fill="white"
              fontSize="2.5"
            >
              {stop.order}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
