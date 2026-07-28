"use client";

import { cn } from "@/lib/utils";

const CAUSAL_CHAIN = [
  "rain",
  "water level",
  "soil saturation",
  "plant distribution",
  "habitat",
  "where humans can walk",
] as const;

type EvidenceRevealProps = {
  learnerObservations?: string[];
  className?: string;
  animate?: boolean;
};

export function EvidenceReveal({
  learnerObservations = [],
  className,
  animate = true,
}: EvidenceRevealProps) {
  return (
    <section
      aria-labelledby="systems-reveal-heading"
      className={cn("space-y-4", className)}
    >
      <h3 id="systems-reveal-heading" className="text-sm font-medium text-muted">
        Your evidence assembles into structure
      </h3>

      {learnerObservations.length > 0 && (
        <ul className="space-y-1 text-sm text-foreground/80">
          {learnerObservations.slice(0, 3).map((obs, i) => (
            <li key={i} className="italic">
              &ldquo;{obs}&rdquo;
            </li>
          ))}
        </ul>
      )}

      <ol className="font-serif text-base leading-relaxed" aria-label="Causal chain from rain to human paths">
        {CAUSAL_CHAIN.map((node, i) => (
          <li
            key={node}
            className={cn(animate && "motion-systems-assemble")}
            style={animate ? { animationDelay: `${i * 0.12}s` } : undefined}
          >
            <span className="text-foreground">{node}</span>
            {i < CAUSAL_CHAIN.length - 1 && (
              <span className="my-1 block text-secondary pl-4" aria-hidden>
                ↓
              </span>
            )}
          </li>
        ))}
      </ol>

      <p className="text-sm text-quiet-amber">
        The boardwalk and route were part of this system — shaped by where water allows humans to walk.
      </p>
    </section>
  );
}
