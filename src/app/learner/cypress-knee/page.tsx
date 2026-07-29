"use client";

import { useState } from "react";
import { Mic, Pencil, Type } from "lucide-react";
import { Label, Textarea } from "@/components/shared/FormFields";
import { EnvironmentalScene } from "@/components/learner/EnvironmentalScene";
import { FieldNoteCapture } from "@/components/learner/FieldNoteCapture";
import { TheoryFragment } from "@/components/learner/TheoryFragment";
import { EvidenceQuestion } from "@/components/learner/EvidenceQuestion";
import { ConfidenceLanguageControl } from "@/components/learner/ConfidenceLanguageControl";
import { ExpeditionAction } from "@/components/learner/ExpeditionAction";
import { getMedia } from "@/data/first-landing-media";
import { getStopById } from "@/data/canonical";
import { evaluateAdaptation, getEvidenceCount } from "@/lib/adaptation-engine";
import { useDemoStore, getNotesForLearner } from "@/store/demo-store";
import { getLearnerById } from "@/data/canonical";
import { cn } from "@/lib/utils";
import type { Confidence } from "@/types";

type ResponseMode = "speak" | "sketch" | "type" | "unsure";

const RESPONSE_MODES = [
  { id: "speak" as const, label: "Speak a theory", icon: Mic },
  { id: "sketch" as const, label: "Sketch it", icon: Pencil },
  { id: "type" as const, label: "Type it", icon: Type },
  { id: "unsure" as const, label: "I'm not sure yet", icon: Type },
] as const;

export default function CypressKneePage() {
  const stop = getStopById("stop-cypress-knee")!;
  const { activeLearnerId, addFieldNote, revealMapStop } = useDemoStore();
  const learner = getLearnerById(activeLearnerId)!;

  const [mode, setMode] = useState<ResponseMode | null>(null);
  const [theory, setTheory] = useState("");
  const [confidence, setConfidence] = useState<Confidence>(2);
  const [adaptivePrompt, setAdaptivePrompt] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showEvidenceCapture, setShowEvidenceCapture] = useState(false);

  function handleSubmitTheory() {
    if (!theory.trim() && mode !== "unsure") return;

    const observation =
      mode === "unsure"
        ? "I'm not sure yet what these structures are doing."
        : theory.trim();

    addFieldNote({
      learnerId: activeLearnerId,
      journeyId: "journey-water-writes",
      stopId: "stop-cypress-knee",
      captureType: mode === "sketch" ? "sketch" : mode === "speak" ? "voice" : "text",
      observation,
      inference: observation,
      evidence: [],
      confidence,
      mentorReviewed: false,
      visibility: "mentor",
    });

    revealMapStop("stop-cypress-knee");

    const notes = [
      ...getNotesForLearner(activeLearnerId),
      {
        learnerId: activeLearnerId,
        journeyId: "journey-water-writes",
        stopId: "stop-cypress-knee",
        captureType: "text" as const,
        observation,
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
    });

    if (confidence >= 3 && getEvidenceCount(notes) < 2) {
      setAdaptivePrompt(
        "What would you need to observe before trusting that explanation?",
      );
    } else if (mode === "unsure" || confidence <= 1) {
      setAdaptivePrompt(
        "Start with one possibility. What detail made you consider it?",
      );
    } else if (learner.adaptationProfile === "movement") {
      setAdaptivePrompt("Find the strangest example within ten safe steps.");
    } else if (learner.adaptationProfile === "curious" && getEvidenceCount(notes) >= 3) {
      setAdaptivePrompt(
        "Design a field comparison that could separate two competing explanations.",
      );
    } else {
      setAdaptivePrompt(rec.prompt);
    }

    setSubmitted(true);
  }

  const displayTheory = mode === "unsure" ? "I'm not sure yet." : theory;

  return (
    <EnvironmentalScene
      media={getMedia("cypressKnees")}
      fullViewport
      overlayVariant="editorial"
      showSideVignette
      contentAlign="bottom"
      showLocation
      contentClassName="w-full px-0 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-[max(3rem,env(safe-area-inset-top))]"
    >
      <div className="flex min-h-[calc(100dvh-4.5rem)] w-full flex-col self-start">
        <div className="relative mx-4 flex-1 sm:mx-6">
          {submitted && displayTheory && (
            <TheoryFragment
              theory={displayTheory}
              className="absolute left-0 right-0 top-[12%] max-w-sm md:top-[18%]"
            />
          )}

          <header className="max-w-lg pb-36 pt-2 md:pb-44">
            <p className="env-type-serif text-[clamp(1.375rem,4.5vw,2rem)] leading-snug text-foreground">
              These structures are doing something.
            </p>
            <p className="mt-2 text-lg text-foreground/85">
              What do you think they are doing?
            </p>
          </header>
        </div>

        <div className="evidence-capture-slab evidence-capture-slab--dock px-4 py-4 sm:px-6 sm:py-5">
          <ul className="safety-field-note mb-4 space-y-1">
            {stop.safetyNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>

          {!submitted ? (
            <div className="mx-auto max-w-lg space-y-4">
              <fieldset>
                <legend className="mb-2 text-xs uppercase tracking-[0.16em] text-foreground/70">
                  How will you respond?
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {RESPONSE_MODES.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setMode(id)}
                      className={cn(
                        "capture-mode-rail__tool flex min-h-11 items-center gap-2 px-3 py-3 text-left text-sm",
                        mode === id && "capture-mode-rail__tool--selected",
                      )}
                      aria-pressed={mode === id}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              {mode && mode !== "unsure" && (
                <div>
                  <Label htmlFor="theory" className="text-xs uppercase tracking-[0.16em] text-foreground/70">
                    Your theory
                  </Label>
                  <Textarea
                    id="theory"
                    value={theory}
                    onChange={(e) => setTheory(e.target.value)}
                    placeholder={
                      mode === "speak"
                        ? "Transcript of your spoken theory…"
                        : mode === "sketch"
                          ? "Describe your sketch…"
                          : "What do you think these structures are doing?"
                    }
                    className="mt-2 border-[hsl(var(--entrance-rule)/0.25)] bg-[hsl(var(--env-black)/0.35)] text-foreground"
                  />
                  {mode === "speak" && (
                    <p className="mt-1 text-xs text-foreground/50">
                      Voice capture simulated — type your spoken words
                    </p>
                  )}
                </div>
              )}

              {mode && (
                <ConfidenceLanguageControl
                  id="ck-confidence"
                  value={confidence}
                  onChange={setConfidence}
                />
              )}

              {mode && (
                <ExpeditionAction
                  label="Record theory"
                  disabled={mode !== "unsure" && !theory.trim()}
                  onClick={handleSubmitTheory}
                  className="w-full"
                />
              )}
            </div>
          ) : (
            <div className="mx-auto max-w-lg space-y-4">
              {adaptivePrompt && (
                <EvidenceQuestion question={adaptivePrompt} simulated />
              )}

              {!showEvidenceCapture ? (
                <button
                  type="button"
                  onClick={() => setShowEvidenceCapture(true)}
                  className="min-h-11 w-full border border-[hsl(var(--entrance-rule)/0.35)] bg-[hsl(var(--env-black)/0.35)] px-4 py-3 text-sm text-foreground/80 transition-colors hover:bg-[hsl(var(--env-black)/0.5)]"
                >
                  Gather supporting evidence
                </button>
              ) : (
                <div className="rounded-sm border border-[hsl(var(--entrance-rule)/0.25)] bg-[hsl(var(--env-black)/0.35)] p-4">
                  <FieldNoteCapture stopId="stop-cypress-knee" />
                </div>
              )}

              <ExpeditionAction
                href="/learner/comparison"
                label="Continue to Twenty Steps, Two Worlds"
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    </EnvironmentalScene>
  );
}
