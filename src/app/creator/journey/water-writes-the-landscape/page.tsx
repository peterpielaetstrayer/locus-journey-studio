import Link from "next/link";
import {
  ADAPTIVE_BRANCHES,
  JOURNEY_STOPS,
  REVIEW_STATUS,
  WATER_WRITES_JOURNEY,
} from "@/data/canonical";
import { Card, CardTitle } from "@/components/shared/Card";
import { CreatorRouteMap } from "@/components/creator/CreatorRouteMap";
import { LearnerPreviewPanel } from "@/components/creator/LearnerPreviewPanel";
import { StopEditorTabs } from "@/components/creator/StopEditorTabs";

export default function CreatorJourneyPage() {
  const cypressStop = JOURNEY_STOPS.find((s) => s.id === "stop-cypress-knee")!;

  return (
    <div className="creator-surface mx-auto max-w-6xl px-4 py-8">
      <Link href="/creator" className="mb-4 inline-block text-sm text-muted hover:text-foreground">
        ← Journey Library
      </Link>

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="text-xs uppercase text-accent">Field-Test Draft</span>
          <h2 className="text-2xl font-semibold">{WATER_WRITES_JOURNEY.title}</h2>
          <p className="text-muted">{WATER_WRITES_JOURNEY.location}</p>
        </div>
        <div className="rounded-lg border border-border px-4 py-2 text-sm">
          Review: {REVIEW_STATUS.unresolvedIssues} unresolved issues
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section aria-labelledby="overview">
            <h3 id="overview" className="mb-3 font-medium">Overview</h3>
            <Card>
              <p className="mb-4">{WATER_WRITES_JOURNEY.description}</p>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div><dt className="text-muted">Central question</dt><dd className="italic text-accent">{WATER_WRITES_JOURNEY.centralQuestion}</dd></div>
                <div><dt className="text-muted">Audience</dt><dd>{WATER_WRITES_JOURNEY.audience}</dd></div>
                <div><dt className="text-muted">Duration</dt><dd>{WATER_WRITES_JOURNEY.durationMinutes} min</dd></div>
                <div><dt className="text-muted">Domains</dt><dd>{WATER_WRITES_JOURNEY.learningDomains.join(", ")}</dd></div>
              </dl>
            </Card>
          </section>

          <section aria-labelledby="route">
            <h3 id="route" className="mb-3 font-medium">Route — 8 stops</h3>
            <CreatorRouteMap />
            <ol className="mt-4 space-y-2">
              {JOURNEY_STOPS.map((s) => (
                <li key={s.id} className="rounded-lg border border-border px-4 py-2 text-sm">
                  <span className="font-medium">{s.order}. {s.title}</span>
                  <span className="block text-xs text-muted">{s.locationLabel}</span>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="stop-editor">
            <h3 id="stop-editor" className="mb-3 font-medium">Stop Editor — Cypress-Knee Mystery</h3>
            <StopEditorTabs stop={cypressStop} branches={ADAPTIVE_BRANCHES} />
          </section>

          <section aria-labelledby="safety">
            <h3 id="safety" className="mb-3 font-medium">Safety &amp; Accessibility</h3>
            <Card>
              <ul className="space-y-2 text-sm">
                {cypressStop.safetyNotes.map((n) => (
                  <li key={n} className="text-danger">⚠ {n}</li>
                ))}
                {cypressStop.accessibilityAlternatives.map((n) => (
                  <li key={n}>♿ {n}</li>
                ))}
              </ul>
            </Card>
          </section>
        </div>

        <aside className="space-y-6">
          <LearnerPreviewPanel />
          <Card>
            <CardTitle className="text-base">Review status</CardTitle>
            <ul className="mt-3 space-y-1 text-sm">
              <li>Learning design: {REVIEW_STATUS.learningDesign}</li>
              <li>Factual: {REVIEW_STATUS.factual}</li>
              <li>Safety: {REVIEW_STATUS.safety}</li>
              <li>Accessibility: {REVIEW_STATUS.accessibility}</li>
              <li>Field test: {REVIEW_STATUS.fieldTest}</li>
            </ul>
            <p className="mt-3 text-xs text-muted">
              Max approval: Private Adult Co-Design Walk
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
