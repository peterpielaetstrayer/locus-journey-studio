"use client";

import { getBranchesForStop } from "@/data/canonical";
import { LearnerStopScreen } from "@/components/learner/LearnerStopScreen";

export default function CypressKneePage() {
  const branches = getBranchesForStop("stop-cypress-knee");

  return (
    <LearnerStopScreen
      stopId="stop-cypress-knee"
      sceneLabel="Cypress grove with knees at standing water edge"
      nextHref="/learner/comparison"
      nextLabel="Continue to Twenty Steps, Two Worlds"
    >
      <section aria-labelledby="branches-heading" className="mb-6">
        <h3 id="branches-heading" className="mb-2 text-sm font-medium">
          Adaptive branches · Simulated selection
        </h3>
        <ul className="space-y-2 text-sm">
          {branches.map((branch) => (
            <li key={branch.id} className="rounded-lg border border-border p-3">
              <p className="font-medium">{branch.name}</p>
              <p className="text-xs text-muted">{branch.triggerDescription}</p>
              <p className="mt-1">{branch.action}</p>
            </li>
          ))}
        </ul>
      </section>
    </LearnerStopScreen>
  );
}
