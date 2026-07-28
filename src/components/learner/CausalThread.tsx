"use client";

import { cn } from "@/lib/utils";

type CausalThreadProps = {
  from: string;
  to: string;
  className?: string;
  animate?: boolean;
};

export function CausalThread({ from, to, className, animate }: CausalThreadProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm",
        animate && "motion-evidence-pin",
        className,
      )}
      role="img"
      aria-label={`Causal connection: ${from} leads to ${to}`}
    >
      <span className="text-secondary">{from}</span>
      <span className="text-muted" aria-hidden>
        →
      </span>
      <span className="text-primary">{to}</span>
    </div>
  );
}
