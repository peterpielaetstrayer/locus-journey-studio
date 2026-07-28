"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Label, Textarea } from "@/components/shared/FormFields";
import { useDemoStore } from "@/store/demo-store";
import { formatConfidence } from "@/lib/utils";

export default function ExitClaimPage() {
  const { activeLearnerId, learnerSessions, saveExitClaim } = useDemoStore();
  const session = learnerSessions[activeLearnerId];
  const [claim, setClaim] = useState(session.exitClaim);
  const [revised, setRevised] = useState(session.revisedExplanation);
  const [showComparison, setShowComparison] = useState(false);

  function handleSave() {
    saveExitClaim(claim, revised);
    setShowComparison(true);
  }

  return (
    <article>
      <p className="mb-1 text-xs uppercase tracking-wide text-secondary">Stop 8</p>
      <h2 className="mb-2 text-2xl font-semibold">Exit Claim</h2>
      <p className="mb-6 text-accent italic">Water organizes this landscape by…</p>

      {!showComparison ? (
        <div className="space-y-4">
          <div>
            <Label htmlFor="claim">Your claim</Label>
            <Textarea
              id="claim"
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              placeholder="Claim, two observations, causal connection, remaining question…"
            />
          </div>
          <div>
            <Label htmlFor="revised">Revised explanation</Label>
            <Textarea
              id="revised"
              value={revised}
              onChange={(e) => setRevised(e.target.value)}
              placeholder="How has your thinking changed?"
            />
          </div>
          <Button size="lg" className="w-full" onClick={handleSave} disabled={!claim.trim()}>
            Compare with baseline
          </Button>
        </div>
      ) : (
        <section aria-labelledby="thinking-comparison" className="space-y-4">
          <h3 id="thinking-comparison" className="font-medium">Baseline vs revised thinking</h3>
          <div className="grid gap-4">
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="mb-1 text-xs uppercase text-muted">Baseline</p>
              <p className="text-sm">{session.baselineExplanation || "—"}</p>
              <p className="mt-2 text-xs text-muted">
                Confidence: {formatConfidence(session.baselineConfidence)}
              </p>
            </div>
            <div className="rounded-xl border border-primary/40 bg-primary/10 p-4">
              <p className="mb-1 text-xs uppercase text-primary">Revised</p>
              <p className="text-sm">{revised}</p>
            </div>
          </div>
          <p className="text-sm text-muted">
            What changed? What evidence shifted your thinking?
          </p>
          <Link href="/learner/artifact">
            <Button size="lg" className="w-full">
              Create artifact
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
            </Button>
          </Link>
        </section>
      )}
    </article>
  );
}
