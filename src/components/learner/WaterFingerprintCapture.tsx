"use client";

import { useEffect, useState } from "react";
import { Label, Textarea } from "@/components/shared/FormFields";
import { EnvironmentalScene } from "./EnvironmentalScene";
import { FieldNoteFragment } from "./FieldNoteFragment";
import { CausalThread } from "./CausalThread";
import { FogRouteMap } from "./FogRouteMap";
import { CaptureModeRail } from "./CaptureModeRail";
import { ConfidenceLanguageControl } from "./ConfidenceLanguageControl";
import { EvidenceQuestion } from "./EvidenceQuestion";
import { ExpeditionAction } from "./ExpeditionAction";
import { getMedia } from "@/data/first-landing-media";
import { evaluateAdaptation, getEvidenceCount } from "@/lib/adaptation-engine";
import { useDemoStore, getNotesForLearner, getDeliveredInterventions } from "@/store/demo-store";
import { getLearnerById, getStopById, JOURNEY_STOPS } from "@/data/canonical";
import type { CaptureMode, Confidence } from "@/types";

type WaterFingerprintCaptureProps = {
  stopId?: string;
};

function CaptureReticle() {
  return (
    <div className="capture-reticle" aria-hidden>
      <span className="capture-reticle__corner capture-reticle__corner--tl" />
      <span className="capture-reticle__corner capture-reticle__corner--tr" />
      <span className="capture-reticle__corner capture-reticle__corner--bl" />
      <span className="capture-reticle__corner capture-reticle__corner--br" />
    </div>
  );
}

export function WaterFingerprintCapture({ stopId = "stop-water-fingerprints" }: WaterFingerprintCaptureProps) {
  const { activeLearnerId, addFieldNote, revealMapStop } = useDemoStore();
  const learner = getLearnerById(activeLearnerId)!;
  const stop = getStopById(stopId)!;
  const interventions = getDeliveredInterventions(activeLearnerId);

  const [captureType, setCaptureType] = useState<CaptureMode | null>(null);
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
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  function handleSave() {
    if (!observation.trim() || !captureType) return;

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

  const animate = !reducedMotion;

  return (
    <EnvironmentalScene
      media={getMedia("waterFingerprint")}
      fullViewport
      overlayVariant="editorial"
      showSideVignette
      contentAlign="bottom"
      showLocation
      contentClassName="w-full px-0 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-[max(3rem,env(safe-area-inset-top))]"
      decorativeOverlay={phase === "capture" ? <CaptureReticle /> : undefined}
    >
      <div className="flex min-h-[calc(100dvh-4.5rem)] w-full flex-col self-start">
        {interventions.length > 0 && phase === "capture" && (
          <aside className="mx-4 mb-4 rounded-sm border border-mentor/30 bg-mentor/10 p-3 sm:mx-6">
            <p className="mb-1 text-[10px] uppercase tracking-widest text-mentor">Mentor intervention</p>
            <p className="text-sm">{interventions[interventions.length - 1].message}</p>
          </aside>
        )}

        <div className="mx-4 flex-1 sm:mx-6">
          {phase === "success" && savedNote ? (
            <div className="mx-auto max-w-md space-y-6 pb-6 pt-4 text-center">
              <div>
                <p className="env-type-serif text-2xl text-foreground">A fingerprint.</p>
                <p className="mt-2 text-lg text-foreground/85">
                  You found water
                  <br />
                  without photographing water.
                </p>
              </div>

              <FieldNoteFragment note={savedNote} pinned className="mx-auto max-w-sm rotate-1" />

              <div className="flex justify-center">
                <CausalThread from="water" to="soil" animate={animate} />
              </div>

              <FogRouteMap compact visibleStopCount={3} />

              <ExpeditionAction href="/learner/cypress-knee" label="Continue" className="w-full" />
            </div>
          ) : phase === "followup" && savedNote ? (
            <div className="mx-auto max-w-md space-y-6 pb-6 pt-4">
              <FieldNoteFragment note={savedNote} pinned />
              <EvidenceQuestion question={followUp} simulated />
              <ExpeditionAction
                label="Continue"
                className="w-full"
                onClick={() => setPhase("success")}
              />
            </div>
          ) : (
            <header className="max-w-lg pb-36 pt-2 md:pb-44">
              <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/60">
                Bald Cypress Trail · Stop 02
              </p>
              <h1 className="env-type-serif mt-3 text-[clamp(1.5rem,5vw,2.25rem)] leading-tight text-foreground">
                Find the trace,
                <br />
                not the water.
              </h1>
              <p className="mt-2 text-sm text-[hsl(var(--entrance-copy-muted))]">
                Find evidence of water that is not water itself.
              </p>
            </header>
          )}
        </div>

        {phase === "capture" && (
          <div className="evidence-capture-slab evidence-capture-slab--dock motion-field-sheet-unfold px-4 py-4 sm:px-6 sm:py-5">
            <CaptureModeRail
              value={captureType}
              onChange={setCaptureType}
              className="mb-4"
            />

            {captureType && (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
              >
                {(captureType === "photo" || captureType === "voice") && (
                  <p className="text-xs text-[hsl(var(--entrance-copy-muted))]">
                    {captureType === "photo"
                      ? "Photo capture simulated — describe what your photo would show."
                      : "Voice capture simulated — type what you would say aloud."}
                  </p>
                )}

                <div>
                  <Label htmlFor="observation" className="text-xs uppercase tracking-[0.16em] text-foreground/70">
                    What did you notice?
                  </Label>
                  <Textarea
                    id="observation"
                    required
                    placeholder="Dark soil, exposed roots, plant patterns, trail elevation…"
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    className="mt-2 border-[hsl(var(--entrance-rule)/0.25)] bg-[hsl(var(--env-black)/0.35)] text-foreground"
                  />
                </div>

                <ConfidenceLanguageControl
                  id="wf-confidence"
                  value={confidence}
                  onChange={setConfidence}
                />

                <p className="text-[10px] text-foreground/50">
                  Saved to Field Notes · Mentor-visible · Not automatically research data
                </p>

                <ExpeditionAction
                  label="Capture evidence"
                  disabled={!observation.trim()}
                  onClick={handleSave}
                  className="w-full"
                />
              </form>
            )}

            {!captureType && (
              <p className="text-center text-sm text-[hsl(var(--entrance-copy-muted))]">
                Choose a field tool. Your evidence will reveal part of the route.
              </p>
            )}
          </div>
        )}
      </div>
    </EnvironmentalScene>
  );
}

/** @deprecated Use WaterFingerprintCapture directly — kept for route compatibility */
export function WaterFingerprintExperience() {
  return null;
}
