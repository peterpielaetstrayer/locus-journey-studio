"use client";

import Link from "next/link";
import { evaluateAdaptation, getEvidenceCount } from "@/lib/adaptation-engine";
import { LEARNERS, getStopById } from "@/data/canonical";
import { useDemoStore, getNotesForLearner } from "@/store/demo-store";
import { Card, CardDescription, CardTitle } from "@/components/shared/Card";
import { cn } from "@/lib/utils";

export default function OrchestratorDashboardPage() {
  const { setActiveLearner, interventions } = useDemoStore();
  const stop = getStopById("stop-water-fingerprints")!;

  return (
    <div className="creator-surface mx-auto max-w-6xl px-4 py-8">
      <h2 className="mb-2 text-2xl font-semibold">Cohort Dashboard</h2>
      <p className="mb-6 text-sm text-muted">
        Mock analytics · Simulated learner states · Human judgment essential
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {LEARNERS.map((learner) => {
          const notes = getNotesForLearner(learner.id);
          const rec = evaluateAdaptation({
            learner,
            stop,
            recentNotes: notes,
            evidenceCount: getEvidenceCount(notes),
            confidence: notes[notes.length - 1]?.confidence,
            simulatedInactiveMinutes: learner.adaptationProfile === "movement" ? 7 : 0,
          });
          const pending = interventions.filter(
            (i) => i.learnerId === learner.id && i.status === "recommended",
          );

          return (
            <Link
              key={learner.id}
              href={`/orchestrator/learner/${learner.id}`}
              onClick={() => setActiveLearner(learner.id)}
            >
              <Card className="h-full hover:border-primary/40 transition-colors">
                <CardTitle>{learner.name}</CardTitle>
                <CardDescription>
                  {learner.age} · {learner.identityPathways[0]}
                </CardDescription>
                <dl className="mt-4 space-y-2 text-sm">
                  <div>
                    <dt className="text-muted">Recent evidence</dt>
                    <dd>{notes.length} field note(s)</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Simulated recommendation</dt>
                    <dd className="text-accent">{rec.prompt.slice(0, 80)}…</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Reason</dt>
                    <dd className="text-xs">{rec.reason}</dd>
                  </div>
                </dl>
                <span
                  className={cn(
                    "mt-3 inline-block rounded-full px-2 py-1 text-xs",
                    rec.requiresHumanReview
                      ? "bg-accent/20 text-accent"
                      : "bg-primary/20 text-primary",
                  )}
                >
                  {rec.requiresHumanReview ? "Needs review" : "Auto-suggested"}
                </span>
                {pending.length > 0 && (
                  <p className="mt-2 text-xs text-mentor">{pending.length} pending intervention(s)</p>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
