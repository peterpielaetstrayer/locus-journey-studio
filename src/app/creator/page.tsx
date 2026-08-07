"use client";

import Link from "next/link";
import { FUTURE_JOURNEYS, WATER_WRITES_JOURNEY } from "@/data/canonical";
import { Card, CardDescription, CardTitle } from "@/components/shared/Card";
import { useCreatorBetaStore } from "@/store/creator-beta-store";

export default function CreatorLibraryPage() {
  const journeys = useCreatorBetaStore((state) => Object.values(state.journeys));

  return (
    <div className="creator-surface mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs uppercase tracking-[0.18em] text-accent">LOCUS Creator Beta</p>
          <h1 className="text-3xl font-semibold">My Journeys</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Turn knowledge, curiosity, existing curriculum, and real-world observations into reusable learning Journeys.
          </p>
        </div>
        <Link
          href="/creator/new"
          className="rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
        >
          + Create Journey
        </Link>
      </div>

      {journeys.length > 0 ? (
        <section className="mb-10" aria-labelledby="beta-journeys-heading">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 id="beta-journeys-heading" className="text-lg font-semibold">Creator Beta drafts</h2>
              <p className="text-sm text-muted">Saved locally in this browser for the current prototype.</p>
            </div>
            <span className="text-xs text-muted">{journeys.length} draft{journeys.length === 1 ? "" : "s"}</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {journeys.map((journey) => (
              <Link key={journey.id} href={`/creator/beta/${journey.id}`}>
                <Card className="h-full border-primary/40 transition-colors hover:border-primary">
                  <span className="text-xs uppercase text-accent">{journey.status}</span>
                  <CardTitle className="mt-1">{journey.title}</CardTitle>
                  <CardDescription>{journey.thread.statement}</CardDescription>
                  <p className="mt-4 text-xs text-muted">{journey.encounterIds.length} Encounter{journey.encounterIds.length === 1 ? "" : "s"}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section className="mb-10 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-6">
          <h2 className="font-semibold">Build the first Journey through LOCUS itself</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Start with a rough idea. The current prototype creates a structured proposal that you can edit into a Journey and preview as a learner.
          </p>
          <Link href="/creator/new" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            Create a Journey →
          </Link>
        </section>
      )}

      <section aria-labelledby="reference-heading">
        <div className="mb-4">
          <h2 id="reference-heading" className="text-lg font-semibold">Reference implementation</h2>
          <p className="text-sm text-muted">
            The original First Landing prototype remains available while its content is migrated to the generalized Journey / Encounter architecture.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/creator/journey/water-writes-the-landscape">
            <Card className="h-full border-accent/40 transition-colors hover:border-accent">
              <span className="text-xs uppercase text-accent">Legacy field-test draft</span>
              <CardTitle className="mt-1">{WATER_WRITES_JOURNEY.title}</CardTitle>
              <CardDescription>{WATER_WRITES_JOURNEY.location}</CardDescription>
              <p className="mt-4 text-xs text-muted">Preserved First Landing reference journey</p>
            </Card>
          </Link>

          {FUTURE_JOURNEYS.map((journey) => (
            <Card key={journey.id} className="opacity-55">
              <span className="text-xs uppercase text-muted">Concept · not yet migrated</span>
              <CardTitle className="mt-1">{journey.title}</CardTitle>
              <CardDescription>{journey.location}</CardDescription>
            </Card>
          ))}
        </div>
      </section>

      <aside className="mt-10 rounded-xl border border-dashed border-muted p-6 text-sm text-muted">
        <strong className="text-foreground">Creator Beta boundary</strong> — Creation and learner preview are local prototype workflows. Live AI, PDF import, private publishing, sharing, royalties, and marketplace flows are not implemented yet.
      </aside>
    </div>
  );
}
