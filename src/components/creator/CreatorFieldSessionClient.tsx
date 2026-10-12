"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createJourneyWithPersistence } from "@/hooks/useCreatorBetaSync";
import {
  CREATOR_FIELD_KEY,
  MAX_OBSERVATION_LENGTH,
  appendCreatorObservation,
  isCreatorFieldSession,
  newCreatorFieldSession,
  observationToJourneyProposal,
  type CreatorFieldSession,
} from "@/lib/creator-beta/field-session";
import type { DraftJourneyProposal } from "@/types/creator-beta";

function readSession(): { session: CreatorFieldSession; warning: string | null } {
  try {
    const raw = window.localStorage.getItem(CREATOR_FIELD_KEY);
    if (!raw) return { session: newCreatorFieldSession("First Landing, Virginia Beach"), warning: null };
    const value: unknown = JSON.parse(raw);
    if (!isCreatorFieldSession(value)) {
      return { session: newCreatorFieldSession(), warning: "Existing field session could not be verified. Its stored data has NOT been overwritten. Export or recover it before creating another." };
    }
    return { session: value, warning: null };
  } catch {
    return { session: newCreatorFieldSession(), warning: "Browser storage is unavailable or unreadable. No existing data was overwritten." };
  }
}

function saveSession(session: CreatorFieldSession): string | null {
  try {
    window.localStorage.setItem(CREATOR_FIELD_KEY, JSON.stringify(session));
    return null;
  } catch {
    return "Could not save to this browser. Free up storage or export your notes before continuing.";
  }
}

function exportSession(session: CreatorFieldSession) {
  const blob = new Blob([JSON.stringify({ notice: "Creator field observations. Private export, not a learning assessment.", session }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "locus-creator-field-" + session.createdAt.slice(0, 10) + ".json";
  anchor.click();
  URL.revokeObjectURL(url);
}

const inputClass = "w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none";
const cardClass = "rounded-2xl border border-border bg-surface p-5 shadow-sm";

export function CreatorFieldSessionClient() {
  const [session, setSession] = useState<CreatorFieldSession | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [proposal, setProposal] = useState<DraftJourneyProposal | null>(null);
  const [creating, setCreating] = useState(false);
  const [journeyMode, setJourneyMode] = useState<"connected" | "local" | null>(null);

  useEffect(() => {
    const loaded = readSession();
    setSession(loaded.session);
    setWarning(loaded.warning);
  }, []);

  function persist(next: CreatorFieldSession): boolean {
    const error = saveSession(next);
    if (error) {
      setWarning(error);
      return false;
    }
    setSession(next);
    setWarning(null);
    return true;
  }

  function keepObservation() {
    if (!session || warning) return;
    try {
      const next = appendCreatorObservation(session, draft);
      if (persist(next)) setDraft("");
    } catch (error) {
      setWarning(error instanceof Error ? error.message : "Observation was not saved.");
    }
  }

  function startProposal(observationId: string) {
    if (!session) return;
    try {
      setProposal(observationToJourneyProposal(session, observationId));
      setWarning(null);
    } catch (error) {
      setWarning(error instanceof Error ? error.message : "Cannot shape this observation.");
    }
  }

  async function createJourney() {
    if (!proposal || !session || creating) return;
    setCreating(true);
    setWarning(null);
    try {
      const result = await createJourneyWithPersistence(proposal);
      const next = { ...session, createdJourneyId: result.journeyId, updatedAt: new Date().toISOString() };
      const error = saveSession(next);
      setSession(next);
      setJourneyMode(result.mode);
      if (error) setWarning("Journey created, but linking it to this local field session failed. Copy its link before leaving.");
    } catch (error) {
      setWarning(error instanceof Error ? error.message : "Could not create Journey. Your field notes remain here.");
    } finally {
      setCreating(false);
    }
  }

  if (!session) return <main className="mx-auto max-w-3xl px-4 py-12" role="status">Opening your field notebook…</main>;

  return (
    <main className="creator-surface mx-auto max-w-3xl px-4 pb-24 pt-5 sm:pt-9">
      <nav className="mb-6 flex items-center justify-between text-sm">
        <Link href="/creator" className="text-muted underline-offset-4 hover:underline">← My Journeys</Link>
        <span className="rounded-full border border-accent/30 px-3 py-1 text-xs text-accent">FIELD STUDIO · ALPHA</span>
      </nav>
      <section className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">The world is the curriculum</p>
        <h1 className="text-3xl font-semibold sm:text-5xl">Notice something. Build from it.</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">Capture what catches your attention in the world. Shape it into a reviewed learning Encounter, then continue in Journey Studio.</p>
      </section>
      <div className="mb-6 rounded-xl border border-accent/35 bg-accent/5 p-3 text-sm">
        <strong>Current capabilities:</strong> private text field notes and a deterministic Encounter scaffold. This build does <strong>not</strong> use live AI, location tracking, photography or voice recording. Field observations stay in this browser; only an accepted Journey draft uses connected persistence when configured.
      </div>
      {warning ? <div role="alert" className="mb-5 rounded-xl border border-danger/40 bg-danger/5 p-4 text-sm text-danger">{warning}</div> : null}
      <section className={cardClass + " mb-5"} aria-labelledby="place-heading">
        <label id="place-heading" htmlFor="field-place" className="mb-2 block text-sm font-semibold">Where are you exploring?</label>
        <input id="field-place" className={inputClass} value={session.placeLabel} maxLength={120}
          onChange={(event) => persist({ ...session, placeLabel: event.target.value, updatedAt: new Date().toISOString() })}
          placeholder="A park, street, room or question…" disabled={Boolean(warning)} />
        <p className="mt-2 text-xs text-muted">A label you control. LOCUS does not request your GPS location.</p>
      </section>

      <section className={cardClass + " mb-5"} aria-labelledby="observation-heading">
        <p className="mb-1 text-xs uppercase tracking-[0.14em] text-accent">01 · Observe</p>
        <h2 id="observation-heading" className="text-xl font-semibold">What are you noticing?</h2>
        <p className="mb-3 mt-1 text-sm text-muted">Describe something you actually see, hear, wonder about or want to investigate. Observation first, explanation later.</p>
        <label className="sr-only" htmlFor="field-note">Your field observation</label>
        <textarea id="field-note" className={inputClass + " min-h-36"} value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={MAX_OBSERVATION_LENGTH}
          placeholder="I noticed…"
          disabled={Boolean(warning)} />
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-xs text-muted">{draft.length}/{MAX_OBSERVATION_LENGTH} characters</span>
          <button type="button" onClick={keepObservation} disabled={!draft.trim() || Boolean(warning)}
            className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40">Keep observation</button>
        </div>
      </section>

      <section className={cardClass + " mb-5"} aria-labelledby="field-captures-heading">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="mb-1 text-xs uppercase tracking-[0.14em] text-accent">02 · Your attention</p>
            <h2 id="field-captures-heading" className="text-xl font-semibold">Field observations</h2>
          </div>
          <span className="text-xs text-muted">{session.observations.length} saved here</span>
        </div>
        {session.observations.length === 0 ?
          <p className="text-sm text-muted">Nothing captured yet. Try one specific observation from your surroundings.</p> :
          <ol className="space-y-3">
            {session.observations.map((item, index) => (
              <li key={item.id} className="rounded-xl border border-border bg-background p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-accent">FIELD NOTE {index + 1}</span>
                  <time className="text-xs text-muted" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time>
                </div>
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{item.text}</p>
                <button type="button" onClick={() => startProposal(item.id)}
                  className="mt-3 rounded-lg border border-primary/40 px-3 py-2 text-sm font-medium text-primary">
                  Shape an Encounter →
                </button>
              </li>
            ))}
          </ol>}
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => exportSession(session)} className="rounded-xl border border-border px-4 py-2 text-sm">Export field notes (.json)</button>
          <button type="button" onClick={() => {
            if (!window.confirm("Start a new session? Export first. Existing local observations will be replaced.")) return;
            const next = newCreatorFieldSession(session.placeLabel);
            if (persist(next)) { setProposal(null); setDraft(""); setJourneyMode(null); }
          }} className="rounded-xl border border-border px-4 py-2 text-sm" disabled={Boolean(warning)}>
            New field session
          </button>
        </div>
      </section>

      {proposal ? (
        <section className={cardClass + " mb-5"} aria-labelledby="suggestion-heading">
          <p className="mb-1 text-xs uppercase tracking-[0.14em] text-accent">03 · Design</p>
          <h2 id="suggestion-heading" className="text-xl font-semibold">Review the Encounter scaffold</h2>
          <p className="mb-4 mt-2 text-sm text-muted">{proposal.rationale}</p>
          <label className="mb-3 block text-sm font-semibold">Journey title
            <input className={inputClass + " mt-2"} value={proposal.suggestedTitle}
              onChange={(event) => setProposal({ ...proposal, suggestedTitle: event.target.value })} />
          </label>
          <label className="mb-3 block text-sm font-semibold">Journey Thread
            <textarea className={inputClass + " mt-2"} rows={2} value={proposal.suggestedThread.statement}
              onChange={(event) => setProposal({ ...proposal, suggestedThread: { ...proposal.suggestedThread, statement: event.target.value } })} />
          </label>
          {proposal.suggestedEncounters.map((encounter, index) => (
            <div key={index} className="space-y-3 rounded-xl border border-border bg-background p-4">
              <label className="block text-sm font-semibold">Encounter title
                <input className={inputClass + " mt-1"} value={encounter.title}
                  onChange={(e) => setProposal({ ...proposal, suggestedEncounters: proposal.suggestedEncounters.map((v,i) => i===index ? {...v,title:e.target.value}:v) })} />
              </label>
              {(["learnerPrompt","learnerAction"] as const).map((field) => (
                <label className="block text-sm font-semibold" key={field}>{field === "learnerPrompt" ? "Learner question" : "Learner action"}
                  <textarea className={inputClass + " mt-1"} rows={2} value={encounter[field]}
                    onChange={(e) => setProposal({ ...proposal, suggestedEncounters: proposal.suggestedEncounters.map((v,i) => i===index ? {...v,[field]:e.target.value}:v) })} />
                </label>
              ))}
              <label className="block text-sm font-semibold">Evidence to request
                <textarea className={inputClass + " mt-1"} rows={2} value={encounter.evidenceRequest.prompt}
                  onChange={(e) => setProposal({ ...proposal, suggestedEncounters: proposal.suggestedEncounters.map((v,i) => i===index ? {...v,evidenceRequest:{...v.evidenceRequest,prompt:e.target.value}}:v) })} />
              </label>
            </div>
          ))}
          <p className="mt-3 text-xs text-muted">You must review factual claims, site permissions, safety and accessibility before involving learners. This is not published.</p>
          <button type="button" disabled={creating || Boolean(session.createdJourneyId) || !proposal.suggestedTitle.trim()}
            onClick={() => void createJourney()}
            className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40">
            {creating ? "Creating draft…" : "Create editable Journey draft"}
          </button>
        </section>
      ) : null}

      {session.createdJourneyId ? (
        <section className="rounded-xl border border-accent bg-accent/5 p-5" role="status">
          <h2 className="text-lg font-semibold">Your Encounter is in a Journey draft</h2>
          <p className="mt-2 text-sm text-muted">
            {journeyMode === "connected" ? "Journey saved through the connected API." : "Journey saved in this browser."}
            {" "}Raw field observations remain private to this browser, not synchronized.
          </p>
          <Link className="mt-4 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            href={`/creator/beta/${session.createdJourneyId}`}>Open in Journey Studio →</Link>
        </section>
      ) : null}
    </main>
  );
}
