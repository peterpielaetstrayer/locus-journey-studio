"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Label, Textarea, Select } from "@/components/shared/FormFields";
import { EnvironmentalScene } from "./EnvironmentalScene";
import { FieldNoteFragment } from "./FieldNoteFragment";
import { CausalThread } from "./CausalThread";
import { FogRouteMap } from "./FogRouteMap";
import { getMedia } from "@/data/first-landing-media";
import { evaluateAdaptation, getEvidenceCount } from "@/lib/adaptation-engine";
import { formatConfidence } from "@/lib/utils";
import { useDemoStore, getNotesForLearner, getDeliveredInterventions } from "@/store/demo-store";
import { getLearnerById, getStopById, JOURNEY_STOPS } from "@/data/canonical";
import type { CaptureMode, Confidence } from "@/types";

type WaterFingerprintCaptureProps = {
  stopId?: string;
};

export function WaterFingerprintCapture({ stopId = "stop-water-fingerprints" }: WaterFingerprintCaptureProps) {
  const { activeLearnerId, addFieldNote, revealMapStop } = useDemoStore();
  const learner = getLearnerById(activeLearnerId)!;
  const stop = getStopById(stopId)!;
  const interventions = getDeliveredInterventions(activeLearnerId);

  const [captureType, setCaptureType] = useState<CaptureMode>("text");
  const [observation, setObservation] = useState("");
  const [confidence, setConfidence] = useState<Confidence>(2);
  const [phase, setPhase] = useState<"capture" | "followup" | "success">("capture");
  const [followUp, setFollowUp] = useState("");
  const [savedNote, setSavedNote] = useState<{
    observation: string;
    confidence: Confidence;
    createdAt: string;
    captureType: CaptureMode;
  } | null>(null);

  function handleSave() {
    if (!observation.trim()) return;

    addFieldNote({
      learnerId: activeLearnerId,
      journeyId: "journey-water-writes",
      stopId,
      captureType,
      observation: observation.trim(),
      evidence: [],
      confidence,
      mentorReviewed: false,
      visibility: "mentor",
    });

    revealMapStop(stopId);
    const nextStop = JOURNEY_STOPS.find((s) => s.order === stop.order + 1);
    if (nextStop) revealMapStop(nextStop.id);

    const notes = [
      ...getNotesForLearner(activeLearnerId),
      {
        learnerId: activeLearnerId,
        journeyId: "journey-water-writes",
        stopId,
        captureType,
        observation: observation.trim(),
        evidence: [],
        confidence,
        createdAt: new Date().toISOString(),
        mentorReviewed: false,
        visibility: "private" as const,
        id: "temp",
      },
    ];

    const rec = evaluateAdaptation({
      learner,
      stop,
      recentNotes: notes,
      evidenceCount: getEvidenceCount(notes),
      confidence,
      creatorFallbackPrompt:
        "What nearby comparison could strengthen or challenge that idea?",
    });

    setSavedNote({
      observation: observation.trim(),
      confidence,
      createdAt: new Date().toISOString(),
      captureType,
    });
    setFollowUp(rec.prompt);
    setPhase("followup");
  }

  function handleContinue() {
    setPhase("success");
  }

  if (phase === "success" && savedNote) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="env-type-serif text-2xl text-foreground">A fingerprint.</p>
          <p className="mt-2 text-lg text-foreground/80">
            You found water
            <br />
            without photographing water.
          </p>
        </div>

        <FieldNoteFragment note={savedNote} pinned className="mx-auto max-w-sm rotate-1" />

        <div className="flex justify-center">
          <CausalThread from="water" to="soil" animate />
        </div>

        <FogRouteMap compact visibleStopCount={3} />

        <Link href="/learner/cypress-knee">
          <Button size="lg" className="w-full">
            Continue
            <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
          </Button>
        </Link>
      </div>
    );
  }

  if (phase === "followup") {
    return (
      <div className="space-y-6">
        <FieldNoteFragment note={savedNote!} pinned />
        <div className="rounded-xl border border-mentor/30 bg-mentor/10 p-4">
          <p className="mb-1 text-xs text-mentor">One question</p>
          <p className="font-medium">{followUp}</p>
        </div>
        <Button size="lg" className="w-full" onClick={handleContinue}>
          Continue
        </Button>
      </div>
    );
  }

  return (
    <>
      {interventions.length > 0 && (
        <aside className="mb-4 rounded-xl border border-mentor/40 bg-mentor/10 p-4">
          <p className="mb-1 text-xs uppercase text-mentor">Mentor intervention</p>
          <p className="text-sm">{interventions[interventions.length - 1].message}</p>
        </aside>
      )}

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <fieldset>
          <legend className="sr-only">Capture mode</legend>
          <Label htmlFor="capture-type">How are you capturing?</Label>
          <Select
            id="capture-type"
            value={captureType}
            onChange={(e) => setCaptureType(e.target.value as CaptureMode)}
            className="bg-surface/80"
          >
            <option value="photo">Photo</option>
            <option value="voice">Voice</option>
            <option value="text">Text</option>
            <option value="sketch">Sketch</option>
          </Select>
        </fieldset>

        <div>
          <Label htmlFor="observation">What did you notice?</Label>
          <Textarea
            id="observation"
            required
            placeholder="Dark soil, exposed roots, plant patterns, trail elevation…"
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            className="bg-surface/80"
          />
        </div>

        <div>
          <Label htmlFor="confidence">Confidence</Label>
          <Select
            id="confidence"
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value) as Confidence)}
            className="bg-surface/80"
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n} — {formatConfidence(n)}
              </option>
            ))}
          </Select>
        </div>

        <p className="text-xs text-muted">
          Saved to Field Notes · Mentor-visible · Not automatically research data
        </p>

        <Button type="submit" size="lg" className="w-full">
          Capture evidence
        </Button>
      </form>
    </>
  );
}

export function WaterFingerprintExperience() {
  return (
    <EnvironmentalScene
      media={getMedia("waterFingerprint")}
      contentAlign="bottom"
      className="min-h-[40vh] rounded-xl"
    >
      <div className="w-full pb-4">
        <p className="mb-2 text-sm text-foreground/90">
          Find evidence of water that is not water itself.
        </p>
      </div>
    </EnvironmentalScene>
  );
}
