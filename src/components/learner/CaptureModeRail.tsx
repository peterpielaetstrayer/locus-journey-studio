"use client";

import { Camera, Mic, Pencil, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CaptureMode } from "@/types";

type CaptureModeRailProps = {
  value: CaptureMode | null;
  onChange: (mode: CaptureMode) => void;
  className?: string;
};

const MODES = [
  { id: "photo" as const, label: "Photo", icon: Camera },
  { id: "voice" as const, label: "Voice", icon: Mic },
  { id: "text" as const, label: "Write", icon: PenLine },
  { id: "sketch" as const, label: "Sketch", icon: Pencil },
] as const;

export function CaptureModeRail({ value, onChange, className }: CaptureModeRailProps) {
  return (
    <fieldset className={cn("capture-mode-rail", className)}>
      <legend className="sr-only">Capture mode</legend>
      <div className="grid grid-cols-4 gap-1 sm:gap-2">
        {MODES.map(({ id, label, icon: Icon }) => {
          const selected = value === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-pressed={selected}
              className={cn(
                "capture-mode-rail__tool flex min-h-11 flex-col items-center justify-center gap-1 px-2 py-3",
                selected && "capture-mode-rail__tool--selected",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span className="text-[10px] uppercase tracking-[0.14em] sm:text-xs">{label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
