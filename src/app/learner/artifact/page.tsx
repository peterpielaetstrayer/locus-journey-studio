"use client";

import { useState } from "react";
import { Label, Textarea, Input } from "@/components/shared/FormFields";
import { LivingAtlasPage } from "@/components/learner/LivingAtlasPage";
import { ExpeditionAction } from "@/components/learner/ExpeditionAction";
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
    <article className="flex min-h-[calc(100dvh-6rem)] flex-col justify-center px-4 py-8 sm:px-6">
      <div className="field-sheet mx-auto w-full max-w-lg space-y-5 p-5 sm:p-6">
        <header>
          <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/50">
            Living Atlas · Plate preparation
          </p>
          <h2 className="env-type-serif mt-2 text-2xl font-semibold text-foreground">
            Prepare your atlas page
          </h2>
          <p className="mt-2 text-sm text-[hsl(var(--entrance-copy-muted))]">
            Assemble one durable page — printable, not a badge.
          </p>
        </header>

        <div className="space-y-4">
          <div>
            <Label htmlFor="art-title" className="text-xs uppercase tracking-[0.16em] text-foreground/70">
              Page title
            </Label>
            <Input
              id="art-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 border-[hsl(var(--entrance-rule)/0.25)] bg-[hsl(var(--env-black)/0.35)] text-foreground"
            />
          </div>
          <div>
            <Label htmlFor="art-question" className="text-xs uppercase tracking-[0.16em] text-foreground/70">
              Unresolved question
            </Label>
            <Textarea
              id="art-question"
              value={remainingQuestion}
              onChange={(e) => setRemainingQuestion(e.target.value)}
              placeholder="What would you still need to observe?"
              className="mt-2 border-[hsl(var(--entrance-rule)/0.25)] bg-[hsl(var(--env-black)/0.35)] text-foreground"
            />
          </div>
        </div>

        <ExpeditionAction
          label="Assemble atlas page"
          disabled={!title.trim()}
          onClick={handleSubmit}
          className="w-full"
        />
      </div>
    </article>
  );
}
