"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FUTURE_JOURNEYS, WATER_WRITES_JOURNEY } from "@/data/canonical";
import { Card, CardDescription, CardTitle } from "@/components/shared/Card";
import { ImportFirstLandingButton } from "@/components/creator/ImportFirstLandingButton";
import {
  fetchConnectedJourneys,
  getClientPersistenceMode,
} from "@/lib/creator-beta/persistence-client";
import type { CreatorBetaJourneySummary } from "@/lib/repositories/creator-beta-types";
import { useCreatorBetaStore } from "@/store/creator-beta-store";

const FIRST_LANDING_CONNECTED_ID = "00000000-0000-4000-8000-000000000010";

export default function CreatorLibraryPage() {
  const journeysById = useCreatorBetaStore((state) => state.journeys);
  const connectedIds = useCreatorBetaStore((state) => state.connectedJourneyIds);
  const localJourneys = useMemo(() => Object.values(journeysById), [journeysById]);
  const [connectedJourneys, setConnectedJourneys] = useState<CreatorBetaJourneySummary[]>([]);
  const [connectedLoaded, setConnectedLoaded] = useState(false);
  const clientMode = getClientPersistenceMode();

  useEffect(() => {
    if (clientMode !== "connected") {
      setConnectedLoaded(true);
      return;
    }
    fetchConnectedJourneys()
      .then(({ journeys }) => setConnectedJourneys(journeys))
      .finally(() => setConnectedLoaded(true));
  }, [clientMode]);

  const localOnlyJourneys = useMemo(
    () => localJourneys.filter((journey) => !connectedIds.includes(journey.id)),
    [connectedIds, localJourneys],
  );

  const connectedSummaries = useMemo(() => {
    const fromApi = connectedJourneys;
    const apiIds = new Set(fromApi.map((journey) => journey.id));
    const fromLocalConnected = localJourneys
      .filter((journey) => connectedIds.includes(journey.id) && !apiIds.has(journey.id))
      .map((journey) => ({
        id: journey.id,
        slug: journey.id,
        title: journey.title,
        status: journey.status,
        encounterCount: journey.encounterIds.length,
        threadStatement: journey.thread.statement,
      }));
    return [...fromApi, ...fromLocalConnected];
  }, [connectedIds, connectedJourneys, localJourneys]);

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

      {clientMode === "connected" && connectedLoaded && connectedSummaries.length > 0 ? (
        <section className="mb-10" aria-labelledby="connected-journeys-heading">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 id="connected-journeys-heading" className="text-lg font-semibold">
                Connected Journeys
              </h2>
              <p className="text-sm text-muted">
                Persisted through the repository/API layer when you are signed in.
              </p>
            </div>
            <span className="text-xs text-muted">
              {connectedSummaries.length} Journey{connectedSummaries.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {connectedSummaries.map((journey) => (
              <Link key={journey.id} href={`/creator/beta/${journey.id}`}>
                <Card className="h-full border-accent/40 transition-colors hover:border-accent">
                  <span className="text-xs uppercase text-accent">Connected · {journey.status}</span>
                  <CardTitle className="mt-1">{journey.title}</CardTitle>
                  <CardDescription>{journey.threadStatement}</CardDescription>
                  <p className="mt-4 text-xs text-muted">
                    {journey.encounterCount} Encounter{journey.encounterCount === 1 ? "" : "s"}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {localOnlyJourneys.length > 0 ? (
        <section className="mb-10" aria-labelledby="beta-journeys-heading">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 id="beta-journeys-heading" className="text-lg font-semibold">Local browser drafts</h2>
              <p className="text-sm text-muted">
                {clientMode === "connected"
                  ? "Prototype fallback when not signed in or before connected save."
                  : "Saved locally until Supabase credentials and sign-in are available."}
              </p>
            </div>
            <span className="text-xs text-muted">
              {localOnlyJourneys.length} draft{localOnlyJourneys.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {localOnlyJourneys.map((journey) => (
              <Link key={journey.id} href={`/creator/beta/${journey.id}`}>
                <Card className="h-full border-primary/40 transition-colors hover:border-primary">
                  <span className="text-xs uppercase text-accent">{journey.status}</span>
                  <CardTitle className="mt-1">{journey.title}</CardTitle>
                  <CardDescription>{journey.thread.statement}</CardDescription>
                  <p className="mt-4 text-xs text-muted">
                    {journey.encounterIds.length} Encounter{journey.encounterIds.length === 1 ? "" : "s"}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : connectedSummaries.length === 0 ? (
        <section className="mb-10 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-6">
          <h2 className="font-semibold">Build the first Journey through LOCUS itself</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Start with a rough idea. The current prototype creates a structured proposal that you can edit into a Journey and preview as a learner.
          </p>
          <Link href="/creator/new" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
            Create a Journey →
          </Link>
        </section>
      ) : null}

      <section aria-labelledby="reference-heading">
        <div className="mb-4">
          <h2 id="reference-heading" className="text-lg font-semibold">Reference implementation</h2>
          <p className="text-sm text-muted">
            The original First Landing prototype remains available while its content is migrated to the generalized Journey / Encounter architecture.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="h-full border-accent/40">
            <span className="text-xs uppercase text-accent">First Landing reference journey</span>
            <CardTitle className="mt-1">{WATER_WRITES_JOURNEY.title}</CardTitle>
            <CardDescription>{WATER_WRITES_JOURNEY.location}</CardDescription>
            <p className="mt-4 text-xs text-muted">
              Open through the legacy manifest locally, or through connected storage when signed in.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <ImportFirstLandingButton />
              {clientMode === "connected" ? (
                <Link
                  href={`/creator/beta/${FIRST_LANDING_CONNECTED_ID}`}
                  className="rounded-lg border border-accent/40 px-3 py-2 text-xs font-medium text-accent"
                >
                  Open connected reference
                </Link>
              ) : null}
              <Link
                href="/creator/journey/water-writes-the-landscape"
                className="rounded-lg border border-border px-3 py-2 text-xs font-medium"
              >
                View legacy prototype
              </Link>
            </div>
          </Card>

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
        <strong className="text-foreground">Creator Beta boundary</strong> —{" "}
        {clientMode === "connected"
          ? "Connected persistence is available when signed in. Local browser drafts remain as explicit fallback."
          : "Connected persistence requires Supabase configuration and sign-in. Until then, drafts stay in this browser only."}{" "}
        Live AI, PDF import, private publishing, sharing, royalties, and marketplace flows are not implemented yet.
      </aside>
    </div>
  );
}
