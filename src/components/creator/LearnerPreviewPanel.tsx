"use client";

import { useState } from "react";
import { LEARNERS } from "@/data/canonical";
import { evaluateAdaptation } from "@/lib/adaptation-engine";
import { getStopById } from "@/data/canonical";
import { Card, CardTitle } from "@/components/shared/Card";

export function LearnerPreviewPanel() {
  const [previewLearnerId, setPreviewLearnerId] = useState(LEARNERS[0].id);
  const learner = LEARNERS.find((l) => l.id === previewLearnerId)!;
  const stop = getStopById("stop-cypress-knee")!;

  const rec = evaluateAdaptation({
    learner,
    stop,
    recentNotes: [],
    evidenceCount: learner.id === "learner-maya" ? 3 : learner.id === "learner-jordan" ? 2 : 0,
    confidence: learner.id === "learner-maya" ? 4 : 2,
    simulatedInactiveMinutes: learner.adaptationProfile === "movement" ? 7 : 0,
  });

  return (
    <Card>
      <CardTitle className="text-base">Learner preview · Simulated</CardTitle>
      <div className="mt-3 flex flex-wrap gap-2">
        {LEARNERS.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setPreviewLearnerId(l.id)}
            className={`min-h-11 rounded-lg border px-3 py-2 text-xs ${
              previewLearnerId === l.id ? "border-primary bg-primary/20" : "border-border"
            }`}
            aria-pressed={previewLearnerId === l.id}
          >
            {l.name}
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-lg bg-surface-raised p-4 text-sm">
        <p className="font-medium">{learner.name} · {learner.identityPathways[0]}</p>
        <p className="mt-2 text-muted">Adaptive branch preview:</p>
        <p className="mt-1 text-accent">{rec.prompt}</p>
        <p className="mt-2 text-xs text-muted">{rec.reason}</p>
      </div>
    </Card>
  );
}
