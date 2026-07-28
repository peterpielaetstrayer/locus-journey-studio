"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Mic, Pencil, Type } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Label, Textarea, Select } from "@/components/shared/FormFields";
import { EnvironmentalScene } from "@/components/learner/EnvironmentalScene";
import { FieldNoteCapture } from "@/components/learner/FieldNoteCapture";
import { getMedia } from "@/data/first-landing-media";
import { getStopById } from "@/data/canonical";
import { evaluateAdaptation, getEvidenceCount } from "@/lib/adaptation-engine";
import { formatConfidence } from "@/lib/utils";
import { useDemoStore, getNotesForLearner } from "@/store/demo-store";
import { getLearnerById } from "@/data/canonical";
import type { Confidence } from "@/types";
import { cn } from "@/lib/utils";

type ResponseMode = "speak" | "sketch" | "type" | "unsure";

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

    // High confidence + weak evidence → specific prompt only
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

  return (
    <article>
      <EnvironmentalScene
        media={getMedia("cypressKnees")}
        contentAlign="bottom"
        className="min-h-[45vh] rounded-xl"
      >
        <div className="relative w-full pb-2">
          {/* Theory overlay layer */}
          {submitted && theory && (
            <div
              className="mb-4 rounded-lg bg-env-black/50 p-3 backdrop-blur-sm"
              aria-live="polite"
            >
              <p className="text-xs uppercase tracking-widest text-foreground/50">Your theory</p>
              <p className="font-serif italic text-foreground/90">{theory}</p>
            </div>
          )}

          <p className="env-type-serif text-xl leading-relaxed text-foreground md:text-2xl">
            These structures are doing something.
          </p>
          <p className="mt-2 text-lg text-foreground/85">
            What do you think they are doing?
          </p>
        </div>
      </EnvironmentalScene>

      {/* Safety — integrated */}
      <ul className="my-4 space-y-1 text-xs text-danger/90">
        {stop.safetyNotes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>

      {!submitted ? (
        <div className="space-y-4">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">How will you respond?</legend>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: "speak" as const, label: "Speak a theory", icon: Mic },
                  { id: "sketch" as const, label: "Sketch it", icon: Pencil },
                  { id: "type" as const, label: "Type it", icon: Type },
                  { id: "unsure" as const, label: "I'm not sure yet", icon: Type },
                ] as const
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-lg border px-3 py-3 text-left text-sm",
                    mode === id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface/60",
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
              <Label htmlFor="theory">Your theory</Label>
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
                className="bg-surface/80"
              />
              {mode === "speak" && (
                <p className="mt-1 text-xs text-muted">
                  Voice capture simulated — type your spoken words
                </p>
              )}
            </div>
          )}

          <div>
            <Label htmlFor="ck-confidence">Confidence</Label>
            <Select
              id="ck-confidence"
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

          <Button
            size="lg"
            className="w-full"
            onClick={handleSubmitTheory}
            disabled={!mode || (mode !== "unsure" && !theory.trim())}
          >
            Record theory
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {adaptivePrompt && (
            <div className="rounded-xl border border-accent/30 bg-accent/10 p-4">
              <p className="text-sm font-medium">{adaptivePrompt}</p>
              <p className="mt-1 text-xs text-muted">Deterministic adaptive follow-up · Simulated</p>
            </div>
          )}

          {!showEvidenceCapture ? (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setShowEvidenceCapture(true)}
            >
              Gather supporting evidence
            </Button>
          ) : (
            <FieldNoteCapture stopId="stop-cypress-knee" />
          )}

          <Link href="/learner/comparison">
            <Button size="lg" className="w-full">
              Continue to Twenty Steps, Two Worlds
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
            </Button>
          </Link>
        </div>
      )}
    </article>
  );
}
