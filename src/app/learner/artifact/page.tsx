"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Label, Textarea, Input } from "@/components/shared/FormFields";
import { useDemoStore, getNotesForLearner } from "@/store/demo-store";
import { getLearnerById } from "@/data/canonical";

export default function ArtifactPage() {
  const { activeLearnerId, learnerSessions, systemsMaps, saveArtifact, artifacts } =
    useDemoStore();
  const session = learnerSessions[activeLearnerId];
  const learner = getLearnerById(activeLearnerId)!;
  const notes = getNotesForLearner(activeLearnerId);
  const existing = artifacts.find((a) => a.learnerId === activeLearnerId);

  const [title, setTitle] = useState(existing?.title ?? "Micro-Landscape Systems Card");
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
      strongestEvidence: notes.flatMap((n) => n.evidence).slice(0, 3),
      revisedExplanation: session.revisedExplanation || session.exitClaim,
      systemsMap: systemsMaps[activeLearnerId],
      remainingQuestion,
      status: "submitted",
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <article>
        <div className="parchment-card rounded-xl p-6 shadow-lg font-serif">
          <p className="text-xs uppercase tracking-widest opacity-70 mb-2">
            Virginia Beach Living Systems Field Guide
          </p>
          <h2 className="text-2xl font-semibold mb-4">{title}</h2>
          <p className="text-sm mb-4 opacity-80">
            First Landing State Park · {new Date().toLocaleDateString()}
          </p>
          <section className="mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-1">Original hypothesis</h3>
            <p>{session.baselineExplanation}</p>
          </section>
          <section className="mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-1">Strongest evidence</h3>
            <ul className="list-disc pl-5">
              {notes.flatMap((n) => n.evidence).slice(0, 3).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </section>
          <section className="mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-1">Revised explanation</h3>
            <p>{session.revisedExplanation || session.exitClaim}</p>
          </section>
          <section className="mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-1">Remaining question</h3>
            <p>{remainingQuestion}</p>
          </section>
          <p className="text-xs opacity-70">
            Identity pathway: {learner.identityPathways.join(", ")}
          </p>
        </div>
        <Link href="/learner/resurfacing" className="mt-8 block">
          <Button size="lg" className="w-full">
            Idea returns
            <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
          </Button>
        </Link>
      </article>
    );
  }

  return (
    <article>
      <h2 className="mb-2 text-2xl font-semibold">Micro-Landscape Systems Card</h2>
      <p className="mb-6 text-muted">
        Assemble your durable artifact — portfolio-worthy, not a badge.
      </p>

      <div className="space-y-4">
        <div>
          <Label htmlFor="art-title">Title</Label>
          <Input id="art-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="art-question">Remaining question</Label>
          <Textarea
            id="art-question"
            value={remainingQuestion}
            onChange={(e) => setRemainingQuestion(e.target.value)}
          />
        </div>
      </div>

      <Button size="lg" className="mt-8 w-full" onClick={handleSubmit}>
        Submit artifact
      </Button>
    </article>
  );
}
