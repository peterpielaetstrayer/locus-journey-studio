"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Label, Textarea } from "@/components/shared/FormFields";
import { LearnerStopScreen } from "@/components/learner/LearnerStopScreen";
import { useDemoStore } from "@/store/demo-store";

export default function HiddenFlowPage() {
  const { addFieldNote, revealMapStop, activeLearnerId } = useDemoStore();
  const [quietNote, setQuietNote] = useState("");
  const [saved, setSaved] = useState(false);

  function handleQuietSave() {
    if (!quietNote.trim()) return;
    addFieldNote({
      learnerId: activeLearnerId,
      journeyId: "journey-water-writes",
      stopId: "stop-hidden-flow",
      captureType: "text",
      observation: quietNote.trim(),
      evidence: [],
      confidence: 2,
      mentorReviewed: false,
      visibility: "private",
    });
    revealMapStop("stop-hidden-flow");
    setSaved(true);
  }

  return (
    <LearnerStopScreen
      stopId="stop-hidden-flow"
      sceneLabel="Still water observation point in quiet overlook"
      sceneClass="shoreline-scene"
      showFieldNote={false}
    >
      <section aria-labelledby="quiet-heading" className="rounded-xl border border-secondary/40 bg-secondary/10 p-4">
        <h3 id="quiet-heading" className="mb-2 font-medium">
          Quiet-attention choice
        </h3>
        <p className="mb-4 text-sm text-muted">
          Optional: stay still for two minutes before writing. What became visible after you stopped
          trying to move forward?
        </p>
        <Label htmlFor="quiet-note">Private quiet observation</Label>
        <Textarea
          id="quiet-note"
          value={quietNote}
          onChange={(e) => setQuietNote(e.target.value)}
          placeholder="Only you can see this unless you change visibility later…"
        />
        <Button type="button" className="mt-3" onClick={handleQuietSave} disabled={!quietNote.trim()}>
          Save private note
        </Button>
        {saved ? (
          <p className="mt-2 text-xs text-muted">Saved · Private · Not mentor-visible</p>
        ) : null}
      </section>

      <Link href="/learner/human-path" className="mt-8 block">
        <Button size="lg" className="w-full">
          Continue to The Human Path
          <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
        </Button>
      </Link>
    </LearnerStopScreen>
  );
}
