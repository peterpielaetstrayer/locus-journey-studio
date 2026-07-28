"use client";

import { useState } from "react";
import { Label, Textarea, Input } from "@/components/shared/FormFields";
import { LivingAtlasPage } from "@/components/learner/LivingAtlasPage";
import { useDemoStore, getNotesForLearner } from "@/store/demo-store";
import { getLearnerById } from "@/data/canonical";

export default function ArtifactPage() {
  const { activeLearnerId, learnerSessions, systemsMaps, saveArtifact, artifacts } =
    useDemoStore();
  const session = learnerSessions[activeLearnerId];
  const learner = getLearnerById(activeLearnerId)!;
  const notes = getNotesForLearner(activeLearnerId);
  const existing = artifacts.find((a) => a.learnerId === activeLearnerId);

  const [title, setTitle] = useState(
    existing?.title ?? `${learner.name}'s Wetland Reading`,
  );
  const [remainingQuestion, setRemainingQuestion] = useState(
    existing?.remainingQuestion ?? "",
  );
  const [submitted, setSubmitted] = useState(!!existing);

  function handleSubmit() {
    saveArtifact({
      learnerId: activeLearnerId,
      journeyId: "journey-water-writes",
      title,
      originalHypothesis: session.baselineExplanation,
      strongestEvidence: notes.flatMap((n) => n.evidence.length > 0 ? n.evidence : [n.observation]).slice(0, 3),
      revisedExplanation: session.revisedExplanation || session.exitClaim,
      systemsMap: systemsMaps[activeLearnerId],
      remainingQuestion,
      status: "submitted",
    });
    setSubmitted(true);
  }

  if (submitted) {
    const artifact = artifacts.find((a) => a.learnerId === activeLearnerId) ?? {
      learnerId: activeLearnerId,
      journeyId: "journey-water-writes",
      title,
      originalHypothesis: session.baselineExplanation,
      strongestEvidence: notes.map((n) => n.observation).slice(0, 3),
      revisedExplanation: session.revisedExplanation || session.exitClaim,
      systemsMap: systemsMaps[activeLearnerId],
      remainingQuestion,
      status: "submitted" as const,
      id: "preview",
    };

    return (
      <LivingAtlasPage
        learnerId={activeLearnerId}
        session={session}
        artifact={artifact}
        systemsMap={systemsMaps[activeLearnerId]}
        onAddToAtlas={() => {
          /* Simulated atlas save — local persistence only */
        }}
      />
    );
  }

  return (
    <article>
      <h2 className="env-type-serif mb-2 text-2xl font-semibold">
        Your Living Atlas page
      </h2>
      <p className="mb-6 text-sm text-muted">
        Assemble one durable page — printable, not a badge.
      </p>

      <div className="space-y-4">
        <div>
          <Label htmlFor="art-title">Title</Label>
          <Input id="art-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="art-question">Unresolved question</Label>
          <Textarea
            id="art-question"
            value={remainingQuestion}
            onChange={(e) => setRemainingQuestion(e.target.value)}
            placeholder="What would you still need to observe?"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="mt-8 min-h-12 w-full rounded-lg bg-primary px-8 py-4 text-lg text-primary-foreground"
      >
        Assemble atlas page
      </button>
    </article>
  );
}
