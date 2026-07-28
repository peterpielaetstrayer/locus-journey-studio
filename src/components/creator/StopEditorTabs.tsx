"use client";

import { useState } from "react";
import type { AdaptiveBranch, JourneyStop } from "@/types";
import { cn } from "@/lib/utils";

const TABS = [
  "Overview",
  "Prompt",
  "Branches",
  "Evidence",
  "Mentor",
  "Safety",
  "Artifact",
  "Resurfacing",
  "Sources",
] as const;

type Props = {
  stop: JourneyStop;
  branches: AdaptiveBranch[];
};

export function StopEditorTabs({ stop, branches }: Props) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="flex overflow-x-auto border-b border-border" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "min-h-11 whitespace-nowrap px-4 py-2 text-sm",
              tab === t ? "border-b-2 border-primary text-primary" : "text-muted",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="p-6 text-sm" role="tabpanel">
        {tab === "Overview" && (
          <dl className="space-y-2">
            <div><dt className="text-muted">Purpose</dt><dd>{stop.purpose}</dd></div>
            <div><dt className="text-muted">Central concept</dt><dd>{stop.centralConcept}</dd></div>
            <div><dt className="text-muted">Learning objective</dt><dd>{stop.learningObjective}</dd></div>
          </dl>
        )}
        {tab === "Prompt" && (
          <>
            <p className="font-medium">{stop.openingPrompt}</p>
            <p className="mt-2 text-muted">{stop.fieldAction}</p>
          </>
        )}
        {tab === "Branches" && (
          <ul className="space-y-3">
            {branches.map((b) => (
              <li key={b.id} className="rounded-lg border border-border p-3">
                <p className="font-medium">{b.name}</p>
                <p className="text-xs text-muted">{b.triggerDescription}</p>
                <p className="mt-1">{b.action}</p>
              </li>
            ))}
          </ul>
        )}
        {tab === "Evidence" && <p>Requires hypothesis with supporting observations.</p>}
        {tab === "Mentor" && <p>Mentor can override adaptive branch selection.</p>}
        {tab === "Safety" && (
          <ul>{stop.safetyNotes.map((n) => <li key={n}>{n}</li>)}</ul>
        )}
        {tab === "Artifact" && <p>{stop.artifactContribution ?? "—"}</p>}
        {tab === "Resurfacing" && <p>{stop.resurfacingConnection ?? "—"}</p>}
        {tab === "Sources" && <p className="text-muted">Sources to be added — factual review in progress.</p>}
      </div>
    </div>
  );
}
