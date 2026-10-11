"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCreatorBetaSync } from "@/hooks/useCreatorBetaSync";
import { useCreatorBetaStore } from "@/store/creator-beta-store";
import { buildJourneyManifestForExport, manifestFilename } from "@/lib/creator-beta/manifest-export";

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary";

function PersistenceBadge({
  mode,
  lastSavedAt,
  syncError,
  syncStatus,
  onRetry,
}: {
  mode: "local" | "connected";
  lastSavedAt: string | null;
  syncError: string | null;
  syncStatus: "idle" | "saving" | "saved" | "failed";
  onRetry: () => void;
}) {
  return (
    <div className="text-xs text-muted">
      <span
        className={`rounded-full border px-2 py-0.5 ${
          mode === "connected" ? "border-accent/40 text-accent" : "border-border"
        }`}
      >
        {mode === "connected" ? "Connected persistence" : "Local browser draft"}
      </span>
      {mode === "connected" && syncStatus === "saving" ? (
        <span className="ml-2" role="status">Saving changes…</span>
      ) : null}
      {mode === "connected" && syncStatus === "saved" && lastSavedAt ? (
        <span className="ml-2" role="status">Saved {new Date(lastSavedAt).toLocaleTimeString()}</span>
      ) : null}
      {syncError ? (
        <div role="alert" className="mt-2">
          <p className="text-danger">{syncError}</p>
          <button type="button" onClick={onRetry}
            className="mt-1 rounded border border-danger px-2 py-1 font-medium text-danger">
            Retry unsaved changes
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function CreatorBetaJourneyBuilder({ journeyId }: { journeyId: string }) {
  const journey = useCreatorBetaStore((state) => state.journeys[journeyId]);
  const allEncounters = useCreatorBetaStore((state) => state.encounters);
  const updateJourney = useCreatorBetaStore((state) => state.updateJourney);
  const updateEncounter = useCreatorBetaStore((state) => state.updateEncounter);
  const {
    loading,
    syncError,
    lastSavedAt,
    syncStatus,
    retryFailedSaves,
    persistenceMode,
    queueJourneySave,
    queueEncounterSave,
    addConnectedEncounter,
  } = useCreatorBetaSync(journeyId);
  const [selectedEncounterId, setSelectedEncounterId] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const encounters = useMemo(
    () =>
      journey
        ? journey.encounterIds
            .map((id) => allEncounters[id])
            .filter((encounter) => Boolean(encounter))
        : [],
    [journey, allEncounters],
  );

  useEffect(() => {
    if (!selectedEncounterId && encounters[0]) {
      setSelectedEncounterId(encounters[0].id);
    }
  }, [encounters, selectedEncounterId]);

  const selectedEncounter = selectedEncounterId
    ? allEncounters[selectedEncounterId]
    : undefined;

  if (loading && !journey) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-muted">Loading Journey from connected storage…</p>
      </div>
    );
  }

  if (!journey) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-muted">Journey not found or unavailable in this browser.</p>
        <Link href="/creator" className="mt-4 inline-block text-sm text-primary hover:underline">
          Return to My Journeys
        </Link>
      </div>
    );
  }

  function patchJourney(updates: Parameters<typeof updateJourney>[1]) {
    updateJourney(journeyId, updates);
    queueJourneySave(updates);
  }

  function patchEncounter(encounterId: string, updates: Parameters<typeof updateEncounter>[1]) {
    updateEncounter(encounterId, updates);
    queueEncounterSave(encounterId, updates);
  }

  async function createEncounter() {
    const encounterId = await addConnectedEncounter();
    setSelectedEncounterId(encounterId);
  }

  function exportManifest() {
    if (!journey) return;
    const result = buildJourneyManifestForExport(journey, allEncounters);
    if (!result.ok) {
      setExportError(result.issues.join(" "));
      return;
    }

    const blob = new Blob([JSON.stringify(result.manifest, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = manifestFilename(journey.title);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setExportError(null);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/creator" className="text-sm text-muted hover:text-foreground">
          ← My Journeys
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <PersistenceBadge
            mode={persistenceMode}
            lastSavedAt={lastSavedAt}
            syncError={syncError}
            syncStatus={syncStatus}
            onRetry={retryFailedSaves}
          />
          <span className="rounded-full border border-border px-3 py-1 text-xs uppercase tracking-wide text-muted">
            {journey.status}
          </span>
          <button
            type="button"
            onClick={exportManifest}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-primary"
          >
            Export draft manifest (.json)
          </button>
          <Link
            href={`/creator/beta/${journeyId}/preview`}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Preview as learner
          </Link>
        </div>
      </div>

      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.18em] text-accent">LOCUS Creator Beta</p>
        <input
          className="mt-2 w-full border-0 bg-transparent p-0 text-3xl font-semibold outline-none"
          value={journey.title}
          aria-label="Journey title"
          onChange={(event) => patchJourney({ title: event.target.value })}
        />
        <p className="mt-2 text-sm text-muted">
          Structured underneath as Journey → Encounters.
          {persistenceMode === "connected"
            ? " Edits sync to the connected repository when you are signed in."
            : " Changes save to this browser only until Supabase is configured and you sign in."}
        </p>
      </header>

      {exportError ? (
        <p role="alert" className="mb-4 rounded-lg border border-danger/40 p-3 text-sm text-danger">
          Cannot export yet: {exportError}
        </p>
      ) : null}
      <p className="mb-5 text-xs text-muted">
        This file is a private, adult-only testing draft. Export does not publish the Journey,
        verify factual accuracy, certify safety, or transmit any learner responses.
        Review the prompts, source material, safety notes and accessibility before sharing.
      </p>

      <div className="grid gap-8 xl:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <section className="rounded-xl border border-border bg-surface p-4">
            <label className="text-xs font-medium uppercase tracking-wide text-muted">
              Journey Thread
              <textarea
                rows={4}
                className={`${fieldClass} mt-2 normal-case tracking-normal text-foreground`}
                value={journey.thread.statement}
                onChange={(event) =>
                  patchJourney({
                    thread: { ...journey.thread, statement: event.target.value },
                  })
                }
              />
            </label>
            <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-muted">
              Learner context
              <textarea
                rows={3}
                className={`${fieldClass} mt-2 normal-case tracking-normal text-foreground`}
                value={journey.learnerContext.description}
                onChange={(event) =>
                  patchJourney({
                    learnerContext: { description: event.target.value },
                  })
                }
              />
            </label>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="font-medium">Encounters</h2>
                <p className="text-xs text-muted">Attend → Act → Evidence</p>
              </div>
              <button
                type="button"
                onClick={createEncounter}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-primary"
              >
                + Add
              </button>
            </div>
            <ol className="space-y-2">
              {encounters.map((encounter, index) => (
                <li key={encounter.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedEncounterId(encounter.id)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      selectedEncounterId === encounter.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-surface hover:border-primary/40"
                    }`}
                  >
                    <span className="text-xs text-muted">Encounter {index + 1}</span>
                    <span className="mt-1 block text-sm font-medium">{encounter.title}</span>
                    <span className="mt-1 block truncate text-xs text-muted">
                      {encounter.target.label}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-xl border border-dashed border-border p-4 text-xs text-muted">
            <p className="font-medium text-foreground">Provenance</p>
            <p className="mt-1">Journey origin: {journey.provenance.origin}</p>
            <p>Version: {journey.provenance.version}</p>
          </section>
        </aside>

        <main>
          {selectedEncounter ? (
            <article className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-accent">
                    Encounter {selectedEncounter.order}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">Encounter editor</h2>
                </div>
                <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
                  {selectedEncounter.target.type}
                </span>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <label className="text-sm font-medium">
                  Encounter title
                  <input
                    className={`${fieldClass} mt-2`}
                    value={selectedEncounter.title}
                    onChange={(event) =>
                      patchEncounter(selectedEncounter.id, { title: event.target.value })
                    }
                  />
                </label>
                <label className="text-sm font-medium">
                  What is being encountered?
                  <input
                    className={`${fieldClass} mt-2`}
                    value={selectedEncounter.target.label}
                    onChange={(event) =>
                      patchEncounter(selectedEncounter.id, {
                        target: { ...selectedEncounter.target, label: event.target.value },
                      })
                    }
                  />
                </label>
              </div>

              <label className="mt-5 block text-sm font-medium">
                Creator intent · private design context
                <textarea
                  rows={3}
                  className={`${fieldClass} mt-2`}
                  placeholder="Why does this Encounter matter? What do you want learners to notice before explanation?"
                  value={selectedEncounter.creatorIntent ?? ""}
                  onChange={(event) =>
                    patchEncounter(selectedEncounter.id, {
                      creatorIntent: event.target.value,
                    })
                  }
                />
              </label>

              <div className="mt-6 grid gap-5 lg:grid-cols-3">
                <label className="rounded-xl border border-border p-4 text-xs font-medium uppercase tracking-wide text-muted">
                  ATTEND · learner prompt
                  <textarea
                    rows={8}
                    className={`${fieldClass} mt-2 normal-case tracking-normal text-foreground`}
                    value={selectedEncounter.learnerPrompt}
                    onChange={(event) =>
                      patchEncounter(selectedEncounter.id, {
                        learnerPrompt: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="rounded-xl border border-border p-4 text-xs font-medium uppercase tracking-wide text-muted">
                  ACT · learner action
                  <textarea
                    rows={8}
                    className={`${fieldClass} mt-2 normal-case tracking-normal text-foreground`}
                    value={selectedEncounter.learnerAction}
                    onChange={(event) =>
                      patchEncounter(selectedEncounter.id, {
                        learnerAction: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="rounded-xl border border-border p-4 text-xs font-medium uppercase tracking-wide text-muted">
                  EVIDENCE · requested capture
                  <textarea
                    rows={8}
                    className={`${fieldClass} mt-2 normal-case tracking-normal text-foreground`}
                    value={selectedEncounter.evidenceRequest.prompt}
                    onChange={(event) =>
                      patchEncounter(selectedEncounter.id, {
                        evidenceRequest: {
                          ...selectedEncounter.evidenceRequest,
                          prompt: event.target.value,
                        },
                      })
                    }
                  />
                </label>
              </div>

              <div className="mt-6 rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm">
                <p className="font-medium">Creator intelligence slot</p>
                <p className="mt-1 text-muted">
                  Future live AI can critique this Encounter, suggest scaffolds, or strengthen the
                  evidence request through typed proposals. It is intentionally not faked here.
                </p>
              </div>
            </article>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
              Add an Encounter to begin building the Journey.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
