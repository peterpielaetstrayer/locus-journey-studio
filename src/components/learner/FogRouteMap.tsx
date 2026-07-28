"use client";

import { JOURNEY_STOPS } from "@/data/canonical";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";
import type { JourneyStop } from "@/types";

type FogRouteMapProps = {
  onStopSelect?: (stop: JourneyStop) => void;
  compact?: boolean;
  /** Only show first N stops clearly; rest fogged */
  visibleStopCount?: number;
  className?: string;
};

export function FogRouteMap({
  onStopSelect,
  compact,
  visibleStopCount = 2,
  className,
}: FogRouteMapProps) {
  const { activeLearnerId, learnerSessions } = useDemoStore();
  const revealed = learnerSessions[activeLearnerId]?.revealedMapStops ?? [];

  return (
    <div className={cn("relative w-full", compact ? "h-48" : "h-56 md:h-72", className)}>
      <svg
        viewBox="0 0 100 90"
        className="h-full w-full rounded-lg"
        role="img"
        aria-label="Fogged journey map — route reveals through evidence"
      >
        <defs>
          <linearGradient id="map-bg-fog" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(203 35% 14%)" />
            <stop offset="50%" stopColor="hsl(157 25% 18%)" />
            <stop offset="100%" stopColor="hsl(193 30% 22%)" />
          </linearGradient>
          <radialGradient id="fog-mask" cx="65%" cy="35%" r="55%">
            <stop offset="0%" stopColor="hsl(203 25% 18% / 0.85)" />
            <stop offset="100%" stopColor="hsl(203 25% 18% / 0)" />
          </radialGradient>
          <marker id="route-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="3" markerHeight="3" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(40 42% 70%)" />
          </marker>
        </defs>

        <rect width="100" height="90" fill="url(#map-bg-fog)" rx="1" />

        {/* Water zone */}
        <ellipse cx="35" cy="55" rx="18" ry="12" fill="hsl(193 40% 35% / 0.35)" />

        {/* Hand-drawn route — only drawn to visible portion */}
        <path
          d="M 8 75 Q 25 65 40 50 Q 55 35 70 25 Q 85 15 92 10"
          fill="none"
          stroke="hsl(40 42% 70%)"
          strokeWidth="1.2"
          strokeDasharray="200"
          strokeDashoffset="0"
          opacity="0.55"
          className="motion-route-draw"
          markerEnd="url(#route-arrow)"
        />

        {JOURNEY_STOPS.map((stop) => {
          const isRevealed = revealed.includes(stop.id);
          const isEarly = stop.order <= visibleStopCount;
          const x = stop.mapX * 0.95;
          const y = stop.mapY * 0.85 + 5;
          const showStop = isRevealed || isEarly;

          return (
            <g key={stop.id}>
              {!showStop && (
                <circle
                  cx={x}
                  cy={y}
                  r="5"
                  fill="hsl(203 25% 18% / 0.9)"
                  stroke="hsl(198 18% 28%)"
                  strokeWidth="0.4"
                />
              )}
              {showStop && (
                <>
                  <circle
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill={isRevealed ? "hsl(157 28% 43%)" : "hsl(40 42% 70% / 0.6)"}
                    className={isRevealed ? "cursor-pointer" : undefined}
                    onClick={() => isRevealed && onStopSelect?.(stop)}
                  />
                  {isRevealed && (
                    <text
                      x={x}
                      y={y - 5}
                      textAnchor="middle"
                      fill="hsl(42 35% 94%)"
                      fontSize="3"
                      fontWeight="500"
                    >
                      {stop.order}
                    </text>
                  )}
                </>
              )}
            </g>
          );
        })}

        {/* Atmospheric fog overlay */}
        <rect width="100" height="90" fill="url(#fog-mask)" className="motion-fog-clear" pointerEvents="none" />
      </svg>

      {!compact && (
        <p className="mt-2 text-xs text-muted">
          Route reveals through evidence — not speed.{" "}
          <span className="text-accent/80">Simulated position</span>
        </p>
      )}
    </div>
  );
}

export function MapStopList() {
  const { activeLearnerId, learnerSessions } = useDemoStore();
  const revealed = learnerSessions[activeLearnerId]?.revealedMapStops ?? [];

  return (
    <nav aria-label="Journey stops list alternative to map">
      <h3 className="mb-2 text-sm font-medium">Stops</h3>
      <ol className="space-y-2">
        {JOURNEY_STOPS.map((stop) => {
          const isRevealed = revealed.includes(stop.id);
          return (
            <li
              key={stop.id}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm",
                isRevealed
                  ? "border-primary/40 bg-primary/10"
                  : "border-border bg-surface text-muted",
              )}
            >
              <span className="font-medium">
                {isRevealed ? stop.title : "— Withheld —"}
              </span>
              {isRevealed && (
                <span className="block text-xs text-muted">{stop.locationLabel}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
