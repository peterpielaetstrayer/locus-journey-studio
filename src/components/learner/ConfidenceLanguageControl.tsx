"use client";

import { cn, formatConfidence } from "@/lib/utils";
import type { Confidence } from "@/types";

type ConfidenceLanguageControlProps = {
  id: string;
  value: Confidence;
  onChange: (value: Confidence) => void;
  className?: string;
};

const LEVELS: Confidence[] = [1, 2, 3, 4];

export function ConfidenceLanguageControl({
  id,
  value,
  onChange,
  className,
}: ConfidenceLanguageControlProps) {
  return (
    <fieldset className={cn("space-y-2", className)}>
      <legend className="text-xs uppercase tracking-[0.18em] text-foreground/70">Confidence</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby={`${id}-legend`}>
        {LEVELS.map((level) => {
          const selected = value === level;
          return (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={selected}
              id={`${id}-${level}`}
              onClick={() => onChange(level)}
              className={cn(
                "min-h-11 rounded-sm border px-3 py-2 text-sm transition-colors",
                selected
                  ? "border-[hsl(var(--quiet-amber))] bg-[hsl(var(--quiet-amber)/0.12)] text-foreground"
                  : "border-[hsl(var(--entrance-rule)/0.35)] bg-[hsl(var(--env-black)/0.25)] text-foreground/75 hover:border-[hsl(var(--entrance-rule)/0.6)]",
              )}
            >
              {formatConfidence(level)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
