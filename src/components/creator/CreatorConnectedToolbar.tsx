"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { Label, Textarea } from "@/components/shared/FormFields";
import { ADAPTIVE_BRANCHES, JOURNEY_STOPS, WATER_WRITES_JOURNEY } from "@/data/canonical";
import { createLocalRepositories } from "@/lib/repositories/local";
import type { JourneyDraft } from "@/lib/repositories/types";

/**
 * Historical First Landing editor is intentionally DEMO-ONLY in Creator Alpha.
 * It never reaches the adult Creator Beta persistence API or legacy cohorts.
 */
export function CreatorConnectedToolbar(_props: { initialConnected?: boolean }) {
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [centralQuestion, setCentralQuestion] = useState(WATER_WRITES_JOURNEY.centralQuestion);
  const [cypressPrompt, setCypressPrompt] = useState(
    JOURNEY_STOPS.find((s) => s.id === "stop-cypress-knee")?.openingPrompt ?? "",
  );
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      const repos = createLocalRepositories();
      const current = await repos.journeys.getCanonicalDraft("water-writes-the-landscape");
      if (!current) throw new Error("Legacy demo draft is unavailable");
      const updated: JourneyDraft = {
        ...current,
        journey: { ...current.journey, centralQuestion },
        stops: current.stops.map((stop) =>
          stop.id === "stop-cypress-knee"
            ? { ...stop, openingPrompt: cypressPrompt }
            : stop,
        ),
      };
      const saved = await repos.journeys.saveDraft(updated);
      setSavedAt(saved.savedAt ?? new Date().toISOString());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save demo draft");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section aria-labelledby="legacy-creator" className="rounded-xl border border-primary/30 bg-surface p-4">
      <h3 id="legacy-creator" className="mb-2 font-medium">
        First Landing reference · Local demo only
      </h3>
      <p className="mb-4 text-xs text-muted">
        This historical editor is separate from Creator Alpha. Changes remain in this
        browser demo and do not sync to Supabase. Use Creator Beta for connected drafts.
      </p>
      <div className="space-y-3 text-sm">
        <div>
          <Label htmlFor="central-question">Central question</Label>
          <Textarea id="central-question" value={centralQuestion}
            onChange={(e) => setCentralQuestion(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="cypress-prompt">Cypress-Knee opening prompt</Label>
          <Textarea id="cypress-prompt" value={cypressPrompt}
            onChange={(e) => setCypressPrompt(e.target.value)} />
        </div>
      </div>
      <div className="mt-4">
        <Button type="button" onClick={handleSave} disabled={loading}>
          {loading ? "Saving demo…" : "Save demo draft"}
        </Button>
      </div>
      {savedAt ? <p className="mt-2 text-xs text-muted">Demo saved {new Date(savedAt).toLocaleString()}</p> : null}
      {error ? <p role="alert" className="mt-2 text-sm text-danger">{error}</p> : null}
      <p className="mt-3 text-xs text-muted">
        Prototype branches: {ADAPTIVE_BRANCHES.length}. Not approved for public or youth delivery.
      </p>
    </section>
  );
}
