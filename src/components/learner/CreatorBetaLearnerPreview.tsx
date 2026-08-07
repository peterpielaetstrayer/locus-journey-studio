"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCreatorBetaStore } from "@/store/creator-beta-store";
import type { Encounter } from "@/types/creator-beta";

export function CreatorBetaLearnerPreview({ journeyId }: { journeyId: string }) {
  const journey = useCreatorBetaStore((state) => state.journeys[journeyId]);
  const allEncounters = useCreatorBetaStore((state) => state.encounters);
  const captures = useCreatorBetaStore((state) => state.captures);
  const evidence = useCreatorBetaStore((state) => state.evidence);
  const addLearnerEvidence = useCreatorBetaStore((state) => state.addLearnerEvidence);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [response, setResponse] = useState("");
  const [saved, setSaved] = useState(false);

  const encounters = useMemo(
    () =>
      journey
        ? journey.encounterIds
            .map((id) => allEncounters[id])
            .filter((encounter): encounter is Encounter => Boolean(encounter))
        : [],
    [journey, allEncounters],
  );

  const encounter = encounters[currentIndex];
  const journeyCaptures = captures.filter((capture) => capture.journeyId === journeyId);
  const journeyEvidence = evidence.filter((item) => item.journeyId === journeyId);

  if (!journey || !encounter) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-muted">This Journey does not have a previewable Encounter yet.</p>
        <Link href={`/creator/beta/${journeyId}`} className="mt-4 inline-block text-primary hover:underline">
          Return to Journey Builder
        </Link>
      </div>
    );
  }

  function submitCapture() {
    const content = response.trim();
    if (!content) return;
    addLearnerEvidence({
      journeyId,
      encounterId: encounter.id,
      content,
    });
    setResponse("");
    setSaved(true);
  }

  function moveTo(index: number) {
    setCurrentIndex(index);
    setResponse("");
    setSaved(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <Link href={`/creator/beta/${journeyId}`} className="text-sm text-muted hover:text-foreground">
            ← Return to Creator
          </Link>
          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
            Learner preview · private draft
          </span>
        </div>

        <header className="mb-8 border-b border-border pb-6">
          <p className="text-xs uppercase tracking-[0.18em] text-accent">{journey.title}</p>
          <h1 className="mt-2 text-2xl font-semibold">{journey.thread.statement}</h1>
          <p className="mt-3 text-sm text-muted">{journey.learnerContext.description}</p>
        </header>

        <nav aria-label="Journey progress" className="mb-8 flex flex-wrap gap-2">
          {encounters.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => moveTo(index)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                index === currentIndex
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted"
              }`}
              aria-current={index === currentIndex ? "step" : undefined}
            >
              {index + 1}
            </button>
          ))}
        </nav>

        <article>
          <p className="text-xs uppercase tracking-wide text-muted">
            Encounter {currentIndex + 1} of {encounters.length} · {encounter.target.label}
          </p>
          <h2 className="mt-2 text-3xl font-semibold">{encounter.title}</h2>

          <section className="mt-7 rounded-2xl border border-accent/30 bg-surface p-5 sm:p-6">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">Notice</p>
            <p className="mt-3 text-lg leading-relaxed">{encounter.learnerPrompt}</p>
          </section>

          <section className="mt-5 rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Your challenge</p>
            <p className="mt-3 leading-relaxed">{encounter.learnerAction}</p>
          </section>

          <section className="mt-5 rounded-2xl border border-border p-5 sm:p-6">
            <label htmlFor="learner-capture" className="block text-sm font-medium">
              Capture evidence
            </label>
            <p className="mt-1 text-sm text-muted">{encounter.evidenceRequest.prompt}</p>
            <textarea
              id="learner-capture"
              rows={6}
              className="mt-4 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              placeholder="Record what you noticed, found, explained, or concluded…"
              value={response}
              onChange={(event) => {
                setResponse(event.target.value);
                setSaved(false);
              }}
            />
            <button
              type="button"
              onClick={submitCapture}
              disabled={!response.trim()}
              className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              Save learner capture
            </button>
            {saved ? (
              <div className="mt-4 rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm">
                <p className="font-medium">Capture saved.</p>
                <p className="mt-1 text-muted">
                  LOCUS stored the learner record and a separate Evidence record that references it.
                  This does not declare mastery.
                </p>
              </div>
            ) : null}
          </section>

          <div className="mt-7 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => moveTo(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => moveTo(Math.min(encounters.length - 1, currentIndex + 1))}
              disabled={currentIndex === encounters.length - 1}
              className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40"
            >
              Next Encounter
            </button>
          </div>
        </article>

        <aside className="mt-10 border-t border-border pt-5 text-xs text-muted">
          Preview session records: {journeyCaptures.length} learner capture{journeyCaptures.length === 1 ? "" : "s"} · {journeyEvidence.length} Evidence record{journeyEvidence.length === 1 ? "" : "s"}.
        </aside>
      </div>
    </div>
  );
}
