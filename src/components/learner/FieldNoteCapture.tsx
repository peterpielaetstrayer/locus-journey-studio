"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { Label, Textarea, Select } from "@/components/shared/FormFields";
import { evaluateAdaptation, getEvidenceCount } from "@/lib/adaptation-engine";
import { formatConfidence } from "@/lib/utils";
import { useDemoStore, getNotesForLearner } from "@/store/demo-store";
import { getLearnerById, getStopById, JOURNEY_STOPS } from "@/data/canonical";
import type { CaptureMode, Confidence } from "@/types";

type FieldNoteCaptureProps = {
  stopId: string;
  onSaved?: () => void;
};

export function FieldNoteCapture({ stopId, onSaved }: FieldNoteCaptureProps) {
  const { activeLearnerId, addFieldNote, revealMapStop } = useDemoStore();
  const learner = getLearnerById(activeLearnerId)!;
  const stop = getStopById(stopId)!;

  const [captureType, setCaptureType] = useState<CaptureMode>("text");
  const [observation, setObservation] = useState("");
  const [inference, setInference] = useState("");
  const [evidence, setEvidence] = useState("");
  const [alternative, setAlternative] = useState("");
  const [confidence, setConfidence] = useState<Confidence>(2);
  const [question, setQuestion] = useState("");
  const [followUp, setFollowUp] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (!observation.trim()) return;

    addFieldNote({
      learnerId: activeLearnerId,
      journeyId: "journey-water-writes",
      stopId,
      captureType,
      observation: observation.trim(),
      inference: inference.trim() || undefined,
      evidence: evidence.split("\n").filter(Boolean),
      alternativeExplanation: alternative.trim() || undefined,
      confidence,
      question: question.trim() || undefined,
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
        evidence: evidence.split("\n").filter(Boolean),
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
        "You noticed dark, wet soil near the boardwalk. What nearby comparison could strengthen or challenge your explanation?",
    });

    setFollowUp(rec.prompt);
    setSaved(true);
    onSaved?.();
  }

  if (saved && followUp) {
    return (
      <section aria-labelledby="follow-up-heading" className="space-y-4">
        <div className="rounded-xl border border-mentor/40 bg-mentor/10 p-4">
          <p className="mb-1 text-xs uppercase tracking-wide text-mentor">
            Deterministic adaptive follow-up · Simulated
          </p>
          <h3 id="follow-up-heading" className="mb-2 font-medium">
            Think about this next
          </h3>
          <p className="text-foreground">{followUp}</p>
        </div>
        <p className="text-xs text-muted">
          Saved to Field Notes · Visible to mentor · Not automatically research data
        </p>
      </section>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
    >
      <div className="wetland-scene rounded-xl p-6 mb-4" role="img" aria-label="Bald-cypress wetland scene with dark saturated soil near boardwalk">
        <p className="text-sm text-foreground/80">Boardwalk overlook · bald-cypress wetland</p>
      </div>

      <fieldset>
        <legend className="sr-only">Capture mode</legend>
        <Label htmlFor="capture-type">How are you capturing?</Label>
        <Select
          id="capture-type"
          value={captureType}
          onChange={(e) => setCaptureType(e.target.value as CaptureMode)}
        >
          <option value="photo">Photo</option>
          <option value="voice">Voice</option>
          <option value="text">Text</option>
          <option value="sketch">Sketch (placeholder)</option>
        </Select>
      </fieldset>

      <div>
        <Label htmlFor="observation">What did you notice?</Label>
        <Textarea
          id="observation"
          required
          placeholder="Describe what you see, hear, or feel…"
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="inference">What do you think it means?</Label>
        <Textarea
          id="inference"
          placeholder="Your interpretation — not the final answer"
          value={inference}
          onChange={(e) => setInference(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="evidence">What evidence supports that? (one per line)</Label>
        <Textarea
          id="evidence"
          placeholder="Specific observable details…"
          value={evidence}
          onChange={(e) => setEvidence(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="alternative">What else could explain it?</Label>
        <Textarea
          id="alternative"
          placeholder="An alternative explanation…"
          value={alternative}
          onChange={(e) => setAlternative(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="confidence">Confidence</Label>
        <Select
          id="confidence"
          value={confidence}
          onChange={(e) => setConfidence(Number(e.target.value) as Confidence)}
        >
          {[1, 2, 3, 4].map((n) => (
            <option key={n} value={n}>
              {n} — {formatConfidence(n)}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="question">Question you still have</Label>
        <Textarea
          id="question"
          placeholder="What are you still wondering?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>

      <p className="text-xs text-muted">
        Private by default · Mentor-visible · May enter artifact if you choose later
      </p>

      <Button type="submit" size="lg" className="w-full">
        Save Field Note
      </Button>
    </form>
  );
}
