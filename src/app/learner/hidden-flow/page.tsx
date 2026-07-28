"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { EnvironmentalScene } from "@/components/learner/EnvironmentalScene";
import { QuietAttentionMode } from "@/components/learner/QuietAttentionMode";
import { getMedia } from "@/data/first-landing-media";
import { useDemoStore } from "@/store/demo-store";
import { getStopById } from "@/data/canonical";

export default function HiddenFlowPage() {
  const { addFieldNote, revealMapStop, activeLearnerId } = useDemoStore();
  const stop = getStopById("stop-hidden-flow")!;
  const [phase, setPhase] = useState<"intro" | "quiet" | "done">("intro");
  const [saved, setSaved] = useState(false);

  function handleComplete(observation: string) {
    addFieldNote({
      learnerId: activeLearnerId,
      journeyId: "journey-water-writes",
      stopId: "stop-hidden-flow",
      captureType: "text",
      observation,
      evidence: [],
      confidence: 2,
      mentorReviewed: false,
      visibility: "private",
    });
    revealMapStop("stop-hidden-flow");
    setSaved(true);
    setPhase("done");
  }

  if (phase === "quiet") {
    return (
      <div className="fixed inset-0 z-50 bg-env-black">
        <EnvironmentalScene
          media={getMedia("hiddenFlow")}
          fullViewport
          showLocation={false}
          contentAlign="center"
        >
          <QuietAttentionMode
            durationSeconds={120}
            onComplete={handleComplete}
            onExit={() => setPhase("intro")}
          />
        </EnvironmentalScene>
      </div>
    );
  }

  return (
    <article>
      <EnvironmentalScene
        media={getMedia("hiddenFlow")}
        contentAlign="bottom"
        className="min-h-[55vh] rounded-xl"
        showLocation
      >
        <div className="w-full pb-4">
          <p className="env-type-serif mb-6 text-2xl leading-relaxed text-foreground">
            For two minutes,
            <br />
            stop trying to move forward.
          </p>
          {phase === "intro" && (
            <Button
              size="lg"
              className="w-full"
              onClick={() => setPhase("quiet")}
            >
              Enter quiet attention
            </Button>
          )}
        </div>
      </EnvironmentalScene>

      {phase === "done" && saved && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted">Private note saved · Not mentor-visible by default</p>
          <Link href="/learner/human-path">
            <Button size="lg" className="w-full">
              Continue to The Human Path
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
            </Button>
          </Link>
        </div>
      )}

      {/* Safety — always accessible */}
      <aside className="mt-6 text-xs text-muted" aria-label="Safety information">
        {stop.safetyNotes.map((note) => (
          <p key={note}>{note}</p>
        ))}
      </aside>
    </article>
  );
}
