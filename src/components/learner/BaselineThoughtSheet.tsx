"use client";

import { Label, Textarea } from "@/components/shared/FormFields";
import { ConfidenceLanguageControl } from "./ConfidenceLanguageControl";
import { ExpeditionAction } from "./ExpeditionAction";
import type { Confidence } from "@/types";
import { cn } from "@/lib/utils";

type BaselineThoughtSheetProps = {
  explanation: string;
  confidence: Confidence;
  onExplanationChange: (value: string) => void;
  onConfidenceChange: (value: Confidence) => void;
  onSave: () => void;
  continueHref: string;
  className?: string;
  animate?: boolean;
};

export function BaselineThoughtSheet({
  explanation,
  confidence,
  onExplanationChange,
  onConfidenceChange,
  onSave,
  continueHref,
  className,
  animate,
}: BaselineThoughtSheetProps) {
  return (
    <div
      className={cn(
        "field-sheet motion-field-sheet-unfold space-y-4 p-4 sm:p-5",
        animate && "enter-landscape-animate-supporting",
        className,
      )}
    >
      <p className="font-serif text-sm italic text-[hsl(var(--quiet-amber))]">
        Water shapes a place by…
      </p>

      <div>
        <Label htmlFor="baseline-thought" className="text-xs uppercase tracking-[0.16em] text-foreground/70">
          Starting thought (not judged)
        </Label>
        <Textarea
          id="baseline-thought"
          value={explanation}
          onChange={(e) => onExplanationChange(e.target.value)}
          placeholder="Write what you think before seeing the place…"
          className="mt-2 border-[hsl(var(--entrance-rule)/0.25)] bg-[hsl(var(--env-black)/0.35)] text-foreground"
        />
      </div>

      <ConfidenceLanguageControl
        id="baseline-confidence"
        value={confidence}
        onChange={onConfidenceChange}
      />

      <ExpeditionAction
        href={continueHref}
        label="Begin walking"
        disabled={!explanation.trim()}
        onClick={onSave}
        animate={animate}
        className="w-full"
      />
    </div>
  );
}
