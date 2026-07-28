"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/shared/Button";
import { Label, Textarea } from "@/components/shared/FormFields";
import { ADAPTIVE_BRANCHES, JOURNEY_STOPS, WATER_WRITES_JOURNEY } from "@/data/canonical";
import { createLocalRepositories } from "@/lib/repositories/local";
import type { JourneyDraft } from "@/lib/repositories/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClientIfConfigured } from "@/lib/supabase/client";

type Props = {
  initialConnected?: boolean;
};

export function CreatorConnectedToolbar({ initialConnected = false }: Props) {
  const [connected, setConnected] = useState(initialConnected);
  const [draft, setDraft] = useState<JourneyDraft | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [centralQuestion, setCentralQuestion] = useState(WATER_WRITES_JOURNEY.centralQuestion);
  const [cypressPrompt, setCypressPrompt] = useState(
    JOURNEY_STOPS.find((s) => s.id === "stop-cypress-knee")?.openingPrompt ?? "",
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured()) return;
      const supabase = createClientIfConfigured();
      if (!supabase) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setConnected(Boolean(user));
      if (!user) return;
      const res = await fetch("/api/creator/draft");
      if (res.ok) {
        const data = (await res.json()) as JourneyDraft;
        setDraft(data);
        setCentralQuestion(data.journey.centralQuestion);
        const cypress = data.stops.find((s) => s.id === "stop-cypress-knee");
        if (cypress) setCypressPrompt(cypress.openingPrompt);
        setSavedAt(data.savedAt ?? null);
      }
    }
    void load();
  }, []);

  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      if (!connected) {
        const repos = createLocalRepositories();
        const localDraft = await repos.journeys.getCanonicalDraft("water-writes-the-landscape");
        if (!localDraft) throw new Error("Draft unavailable");
        const updated: JourneyDraft = {
          ...localDraft,
          journey: { ...localDraft.journey, centralQuestion },
          stops: localDraft.stops.map((s) =>
            s.id === "stop-cypress-knee" ? { ...s, openingPrompt: cypressPrompt } : s,
          ),
        };
        const saved = await repos.journeys.saveDraft(updated);
        setSavedAt(saved.savedAt ?? new Date().toISOString());
        return;
      }
      const res = await fetch("/api/creator/draft", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ centralQuestion, cypressPrompt }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Save failed");
      }
      const data = (await res.json()) as JourneyDraft;
      setDraft(data);
      setSavedAt(data.savedAt ?? new Date().toISOString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleNewVersion() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/creator/draft/version", { method: "POST" });
      if (!res.ok) throw new Error("Could not create version");
      const data = (await res.json()) as JourneyDraft;
      setDraft(data);
      setSavedAt(data.savedAt ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Version creation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section aria-labelledby="connected-creator" className="rounded-xl border border-primary/30 bg-surface p-4">
      <h3 id="connected-creator" className="mb-2 font-medium">
        Creator draft {connected ? "· Connected persistence" : "· Local demo persistence"}
      </h3>
      {draft && !draft.isEditable ? (
        <p className="mb-3 text-sm text-danger">
          This version is read-only (published/archived). Create a new draft to edit.
        </p>
      ) : null}
      <div className="space-y-3 text-sm">
        <div>
          <Label htmlFor="central-question">Central question</Label>
          <Textarea
            id="central-question"
            value={centralQuestion}
            onChange={(e) => setCentralQuestion(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="cypress-prompt">Cypress-Knee opening prompt</Label>
          <Textarea
            id="cypress-prompt"
            value={cypressPrompt}
            onChange={(e) => setCypressPrompt(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" onClick={handleSave} disabled={loading || draft?.isEditable === false}>
          {loading ? "Saving…" : "Save draft"}
        </Button>
        {connected ? (
          <Button type="button" variant="secondary" onClick={handleNewVersion} disabled={loading}>
            New draft version
          </Button>
        ) : null}
      </div>
      {savedAt ? (
        <p className="mt-2 text-xs text-muted">Last saved {new Date(savedAt).toLocaleString()}</p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <p className="mt-3 text-xs text-muted">
        Branches in demo: {ADAPTIVE_BRANCHES.length}. Max prototype approval: Private Adult Co-Design Walk.
      </p>
    </section>
  );
}
