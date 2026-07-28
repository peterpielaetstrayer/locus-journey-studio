"use client";

import { JOURNEY_STOPS } from "@/data/canonical";
import { cn } from "@/lib/utils";
import { useDemoStore } from "@/store/demo-store";
import type { JourneyStop } from "@/types";

type FoggedMapProps = {
  onStopSelect?: (stop: JourneyStop) => void;
  compact?: boolean;
};

export function FoggedMap({ onStopSelect, compact }: FoggedMapProps) {
  const { activeLearnerId, learnerSessions } = useDemoStore();
  const revealed = learnerSessions[activeLearnerId]?.revealedMapStops ?? [];

  return (
    <div className={cn("relative w-full", compact ? "h-48" : "h-64 md:h-80")}>
      <svg
        viewBox="0 0 100 90"
        className="h-full w-full rounded-xl border border-border bg-surface-raised"
        role="img"
        aria-label="Illustrated journey map of First Landing State Park wetland trail"
      >
        <defs>
          <linearGradient id="map-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(203 35% 18%)" />
            <stop offset="50%" stopColor="hsl(157 25% 22%)" />
            <stop offset="100%" stopColor="hsl(193 30% 28%)" />
          </linearGradient>
        </defs>
        <rect width="100" height="90" fill="url(#map-bg)" rx="2" />
        {/* Trail path */}
        <path
          d="M 8 75 Q 25 65 40 50 Q 55 35 70 25 Q 85 15 92 10"
          fill="none"
          stroke="hsl(40 42% 70%)"
          strokeWidth="1.5"
          strokeDasharray="2 1"
          opacity="0.6"
        />
        {/* Water zone */}
        <ellipse cx="35" cy="55" rx="18" ry="12" fill="hsl(193 40% 35% / 0.4)" />
        {JOURNEY_STOPS.map((stop) => {
          const isRevealed = revealed.includes(stop.id);
          const x = stop.mapX * 0.95;
          const y = stop.mapY * 0.85 + 5;
          return (
            <g key={stop.id}>
              {!isRevealed && (
                <circle
                  cx={x}
                  cy={y}
                  r="6"
                  fill="hsl(207 36% 10% / 0.85)"
                  stroke="hsl(198 18% 28%)"
                  strokeWidth="0.5"
                />
              )}
              {isRevealed && (
                <>
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="hsl(157 28% 43%)"
                    className="cursor-pointer"
                    onClick={() => onStopSelect?.(stop)}
                  />
                  <text
                    x={x}
                    y={y - 6}
                    textAnchor="middle"
                    fill="hsl(42 35% 94%)"
                    fontSize="3.5"
                    fontWeight="500"
                  >
                    {stop.order}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-xs text-muted">
        Map reveals through evidence — not speed.{" "}
        <span className="text-accent">Simulated map position</span> (no live GPS).
      </p>
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
                {isRevealed ? stop.title : "— Hidden —"}
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
