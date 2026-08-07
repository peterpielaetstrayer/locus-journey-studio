"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { prototypeJourneyProposalEngine } from "@/lib/creator-beta/proposal-engine";
import { useCreatorBetaStore } from "@/store/creator-beta-store";
import type { DraftJourneyProposal } from "@/types/creator-beta";

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary";

export function CreateJourneyWorkbench() {
  const router = useRouter();
  const createJourneyFromProposal = useCreatorBetaStore(
    (state) => state.createJourneyFromProposal,
  );
  const [seed, setSeed] = useState("");
  const [proposal, setProposal] = useState<DraftJourneyProposal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateProposal() {
    const value = seed.trim();
    if (!value) {
      setError("Tell LOCUS what you are thinking about creating first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const next = await prototypeJourneyProposalEngine.propose(value);
      setProposal(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create a proposal.");
    } finally {
      setLoading(false);
    }
  }

  function createDraft() {
    if (!proposal) return;
    const journeyId = createJourneyFromProposal(proposal);
    router.push(`/creator/beta/${journeyId}`);
  }

  function updateEncounter(
    index: number,
    field: "title" | "learnerPrompt" | "learnerAction" | "evidencePrompt",
    value: string,
  ) {
    if (!proposal) return;
    const encounters = proposal.suggestedEncounters.map((encounter, encounterIndex) => {
      if (encounterIndex !== index) return encounter;
      if (field === "evidencePrompt") {
        return {
          ...encounter,
          evidenceRequest: { ...encounter.evidenceRequest, prompt: value },
        };
      }
      return { ...encounter, [field]: value };
    });
    setProposal({ ...proposal, suggestedEncounters: encounters });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8">
        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-accent">Creator Beta v0.2</p>
        <h1 className="text-3xl font-semibold">What are you thinking about creating?</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Start with a place, question, topic, lesson, observation, or rough idea. LOCUS will help
          shape it into a Journey while keeping you in control of the educational decisions.
        </p>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-primary/50 bg-surface p-4">
          <p className="font-medium">Start from an idea</p>
          <p className="mt-1 text-xs text-muted">Active in this prototype</p>
        </div>
        {[
          ["Explore a place", "Field/location intelligence comes next"],
          ["Bring existing material", "PDF and lesson-plan import comes next"],
          ["Capture from the field", "Photo + voice + location comes later"],
        ].map(([title, note]) => (
          <div key={title} className="rounded-xl border border-border bg-surface/40 p-4 opacity-70">
            <p className="font-medium">{title}</p>
            <p className="mt-1 text-xs text-muted">{note}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <label htmlFor="journey-seed" className="mb-2 block text-sm font-medium">
          Tell LOCUS what you have in mind
        </label>
        <textarea
          id="journey-seed"
          rows={6}
          className={fieldClass}
          placeholder="Example: I want to create something at First Landing around how water shapes the landscape. I want learners to observe before they receive explanations..."
          value={seed}
          onChange={(event) => setSeed(event.target.value)}
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            disabled={loading}
            onClick={generateProposal}
          >
            {loading ? "Shaping proposal…" : "Help me shape this Journey"}
          </button>
          <p className="text-xs text-muted">
            Prototype intelligence: deterministic scaffold, not live AI yet.
          </p>
        </div>
        {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
      </section>

      {proposal ? (
        <section className="mt-8 space-y-6" aria-labelledby="proposal-heading">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-accent">Draft proposal</p>
            <h2 id="proposal-heading" className="mt-1 text-2xl font-semibold">
              Here is how LOCUS is structuring your idea
            </h2>
            <p className="mt-2 text-sm text-muted">{proposal.rationale}</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <label className="block text-sm font-medium">
              Journey title
              <input
                className={`${fieldClass} mt-2`}
                value={proposal.suggestedTitle}
                onChange={(event) =>
                  setProposal({ ...proposal, suggestedTitle: event.target.value })
                }
              />
            </label>

            <label className="block text-sm font-medium">
              Intended learner context
              <input
                className={`${fieldClass} mt-2`}
                value={proposal.suggestedLearnerContext.description}
                onChange={(event) =>
                  setProposal({
                    ...proposal,
                    suggestedLearnerContext: { description: event.target.value },
                  })
                }
              />
            </label>
          </div>

          <label className="block text-sm font-medium">
            Journey Thread
            <textarea
              rows={3}
              className={`${fieldClass} mt-2`}
              value={proposal.suggestedThread.statement}
              onChange={(event) =>
                setProposal({
                  ...proposal,
                  suggestedThread: {
                    ...proposal.suggestedThread,
                    statement: event.target.value,
                  },
                })
              }
            />
          </label>

          <div>
            <div className="mb-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Suggested Encounters</p>
                <p className="text-xs text-muted">Attend → Act → Evidence</p>
              </div>
              <span className="text-xs text-muted">{proposal.suggestedEncounters.length} proposed</span>
            </div>
            <div className="space-y-4">
              {proposal.suggestedEncounters.map((encounter, index) => (
                <article key={`${proposal.id}-${index}`} className="rounded-xl border border-border p-4">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {index + 1}
                    </span>
                    <input
                      className={fieldClass}
                      value={encounter.title}
                      aria-label={`Encounter ${index + 1} title`}
                      onChange={(event) => updateEncounter(index, "title", event.target.value)}
                    />
                  </div>
                  <div className="grid gap-4 lg:grid-cols-3">
                    <label className="text-xs font-medium text-muted">
                      ATTEND · learner prompt
                      <textarea
                        rows={4}
                        className={`${fieldClass} mt-1 text-foreground`}
                        value={encounter.learnerPrompt}
                        onChange={(event) =>
                          updateEncounter(index, "learnerPrompt", event.target.value)
                        }
                      />
                    </label>
                    <label className="text-xs font-medium text-muted">
                      ACT · learner action
                      <textarea
                        rows={4}
                        className={`${fieldClass} mt-1 text-foreground`}
                        value={encounter.learnerAction}
                        onChange={(event) =>
                          updateEncounter(index, "learnerAction", event.target.value)
                        }
                      />
                    </label>
                    <label className="text-xs font-medium text-muted">
                      EVIDENCE · requested capture
                      <textarea
                        rows={4}
                        className={`${fieldClass} mt-1 text-foreground`}
                        value={encounter.evidenceRequest.prompt}
                        onChange={(event) =>
                          updateEncounter(index, "evidencePrompt", event.target.value)
                        }
                      />
                    </label>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
            <p className="text-sm font-medium">Questions LOCUS would ask next</p>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              {proposal.questionsForCreator.map((question) => (
                <li key={question}>• {question}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-border pt-5">
            <button
              type="button"
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
              onClick={createDraft}
            >
              Create editable Journey draft
            </button>
            <button
              type="button"
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium"
              onClick={generateProposal}
            >
              Reconsider structure
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
