"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { FieldNoteCapture } from "@/components/learner/FieldNoteCapture";
import { getStopById } from "@/data/canonical";
import { useDemoStore } from "@/store/demo-store";
import { cn } from "@/lib/utils";

type LearnerStopScreenProps = {
  stopId: string;
  sceneClass?: string;
  sceneLabel: string;
  nextHref?: string;
  nextLabel?: string;
  showFieldNote?: boolean;
  children?: React.ReactNode;
};

export function LearnerStopScreen({
  stopId,
  sceneClass = "wetland-scene",
  sceneLabel,
  nextHref,
  nextLabel = "Continue",
  showFieldNote = true,
  children,
}: LearnerStopScreenProps) {
  const stop = getStopById(stopId);
  const { revealMapStop, setCurrentStop } = useDemoStore();

  if (!stop) {
    return <p>Stop not found.</p>;
  }

  function handleReveal() {
    revealMapStop(stopId);
    setCurrentStop(stopId);
  }

  return (
    <article>
      <p className="mb-1 text-xs uppercase tracking-wide text-muted">
        Stop {stop.order} · {stop.locationLabel}
      </p>
      <h2 className="mb-4 text-2xl font-semibold">{stop.title}</h2>

      <div
        className={cn("mb-6 rounded-xl p-8", sceneClass)}
        role="img"
        aria-label={sceneLabel}
      >
        <p className="text-sm text-foreground/85">{stop.purpose}</p>
      </div>

      <div className="mb-6 rounded-xl border border-accent/30 bg-surface/60 p-4">
        <p className="font-medium">{stop.openingPrompt}</p>
        <p className="mt-2 text-sm text-muted">{stop.fieldAction}</p>
      </div>

      {stop.safetyNotes.length > 0 ? (
        <ul className="mb-4 space-y-1 text-sm text-danger">
          {stop.safetyNotes.map((note) => (
            <li key={note}>⚠ {note}</li>
          ))}
        </ul>
      ) : null}

      {stop.accessibilityAlternatives.length > 0 ? (
        <ul className="mb-6 space-y-1 text-sm text-muted">
          {stop.accessibilityAlternatives.map((alt) => (
            <li key={alt}>♿ {alt}</li>
          ))}
        </ul>
      ) : null}

      {children}

      {showFieldNote ? (
        <div className="mt-6">
          <FieldNoteCapture stopId={stopId} onSaved={handleReveal} />
        </div>
      ) : null}

      {nextHref ? (
        <Link href={nextHref} className="mt-8 block" onClick={handleReveal}>
          <Button size="lg" className="w-full">
            {nextLabel}
            <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
          </Button>
        </Link>
      ) : null}
    </article>
  );
}
