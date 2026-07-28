"use client";

import { use } from "react";
import Link from "next/link";
import { evaluateAdaptation, getEvidenceCount } from "@/lib/adaptation-engine";
import { getLearnerById, getStopById } from "@/data/canonical";
import { useDemoStore, getNotesForLearner } from "@/store/demo-store";
import { Card, CardTitle } from "@/components/shared/Card";
import { InterventionComposer } from "@/components/orchestrator/InterventionComposer";

export default function LearnerDetailPage({
  params,
}: {
  params: Promise<{ learnerId: string }>;
}) {
  const { learnerId } = use(params);
  const learner = getLearnerById(learnerId)!;
  const stop = getStopById("stop-water-fingerprints")!;
  const notes = getNotesForLearner(learnerId);
  const { interventions, artifacts } = useDemoStore();

  const rec = evaluateAdaptation({
    learner,
    stop,
    recentNotes: notes,
    evidenceCount: getEvidenceCount(notes),
    confidence: notes[notes.length - 1]?.confidence,
    simulatedInactiveMinutes: learner.adaptationProfile === "movement" ? 7 : 0,
  });

  const learnerInterventions = interventions.filter((i) => i.learnerId === learnerId);
  const artifact = artifacts.find((a) => a.learnerId === learnerId);

  return (
    <div className="creator-surface mx-auto max-w-4xl px-4 py-8">
      <Link href="/orchestrator" className="mb-4 inline-block text-sm text-muted hover:text-foreground">
        ← Cohort dashboard
      </Link>

      <h2 className="mb-1 text-2xl font-semibold">{learner.name}</h2>
      <p className="mb-6 text-muted">
        {learner.identityPathways[0]} · Profile: {learner.adaptationProfile}
      </p>

      <section aria-labelledby="evidence-section" className="mb-8">
        <h3 id="evidence-section" className="mb-3 font-medium">Recent evidence</h3>
        {notes.length === 0 ? (
          <p className="text-sm text-muted">No field notes yet.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((n) => (
              <li key={n.id} className="rounded-lg border border-border bg-surface p-4 text-sm">
                <p>{n.observation}</p>
                <p className="mt-1 text-xs text-muted">
                  Confidence {n.confidence} · {n.evidence.length} evidence item(s)
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Card className="mb-8 border-mentor/30">
        <CardTitle className="text-base">Deterministic recommendation · Simulated</CardTitle>
        <p className="mt-2">{rec.prompt}</p>
        <p className="mt-2 text-xs text-muted">Reason: {rec.reason}</p>
        <p className="mt-1 text-xs text-muted">
          Category: {rec.category} · Priority: {rec.priority} · Source: {rec.source}
        </p>
      </Card>

      <InterventionComposer
        learnerId={learnerId}
        stopId="stop-water-fingerprints"
        defaultMessage={rec.prompt}
        defaultReason={rec.reason}
      />

      {learnerInterventions.length > 0 && (
        <section aria-labelledby="history" className="mt-8">
          <h3 id="history" className="mb-3 font-medium">Intervention history</h3>
          <ul className="space-y-2">
            {learnerInterventions.map((i) => (
              <li key={i.id} className="rounded-lg border border-border p-3 text-sm">
                <span className="text-xs uppercase text-muted">{i.status}</span>
                <p>{i.message}</p>
                {i.overrideReason && (
                  <p className="text-xs text-mentor">Override: {i.overrideReason}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {artifact && (
        <section aria-labelledby="artifact-review" className="mt-8">
          <h3 id="artifact-review" className="mb-3 font-medium">Artifact review</h3>
          <Card>
            <p className="font-medium">{artifact.title}</p>
            <p className="mt-2 text-sm">{artifact.revisedExplanation}</p>
            <dl className="mt-4 grid gap-2 text-xs text-muted">
              <div><dt className="inline">Evidence quality: </dt><dd className="inline">Review against rubric (simulated)</dd></div>
              <div><dt className="inline">Revision depth: </dt><dd className="inline">Compare baseline to revised</dd></div>
              <div><dt className="inline">Systems connection: </dt><dd className="inline">{artifact.systemsMap.edges.length} links</dd></div>
            </dl>
          </Card>
        </section>
      )}
    </div>
  );
}
