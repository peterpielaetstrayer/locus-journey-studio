"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Label, Textarea } from "@/components/shared/FormFields";
import { useDemoStore } from "@/store/demo-store";

export default function ComparisonPage() {
  const { activeLearnerId, learnerSessions, saveComparison } = useDemoStore();
  const session = learnerSessions[activeLearnerId];
  const [notes, setNotes] = useState(session.comparisonNotes);

  return (
    <article>
      <p className="mb-1 text-xs uppercase tracking-wide text-secondary">Stop 4</p>
      <h2 className="mb-2 text-2xl font-semibold">Twenty Steps, Two Worlds</h2>
      <p className="mb-6 text-muted">
        Compare wetter and drier zones. What changed? What stayed the same?
      </p>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="wetland-scene rounded-xl p-4 min-h-32" role="img" aria-label="Wetter zone with saturated soil and cypress knees">
          <p className="text-sm font-medium">Wetter zone</p>
        </div>
        <div className="rounded-xl p-4 min-h-32 bg-surface-raised border border-border" role="img" aria-label="Drier zone with less saturated soil">
          <p className="text-sm font-medium">Drier zone</p>
        </div>
      </div>

      <div>
        <Label htmlFor="comparison">Comparison notes</Label>
        <Textarea
          id="comparison"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Soil, roots, plants, decomposition, light, trail surface…"
        />
      </div>

      <Link href="/learner/hidden-flow" onClick={() => saveComparison(notes)} className="mt-8 block">
        <Button size="lg" className="w-full">
          Continue to The Hidden Flow
          <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
        </Button>
      </Link>
    </article>
  );
}
