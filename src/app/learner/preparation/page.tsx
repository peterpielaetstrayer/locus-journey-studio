"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Label, Textarea, Select } from "@/components/shared/FormFields";
import { useDemoStore } from "@/store/demo-store";
import { formatConfidence } from "@/lib/utils";
import type { Confidence } from "@/types";

export default function PreparationPage() {
  const { saveBaseline, learnerSessions, activeLearnerId } = useDemoStore();
  const session = learnerSessions[activeLearnerId];
  const [explanation, setExplanation] = useState(session.baselineExplanation);
  const [confidence, setConfidence] = useState<Confidence>(session.baselineConfidence);

  function handleContinue() {
    saveBaseline(explanation, confidence);
  }

  return (
    <article>
      <h2 className="mb-2 text-2xl font-semibold">Preparation</h2>
      <p className="mb-6 text-muted">
        Before you enter the field, capture your starting thinking.
      </p>

      <div className="mb-6 rounded-xl border border-accent/30 bg-surface/60 p-4">
        <p className="text-accent italic">
          Imagine a forest where the water appears still. What might water still be doing?
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="baseline">Your baseline explanation (30–45 sec worth)</Label>
          <Textarea
            id="baseline"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Write what you think before seeing the place…"
          />
        </div>
        <div>
          <Label htmlFor="baseline-confidence">Confidence</Label>
          <Select
            id="baseline-confidence"
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value) as Confidence)}
          >
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>{n} — {formatConfidence(n)}</option>
            ))}
          </Select>
        </div>
      </div>

      <Link href="/learner/map" onClick={handleContinue} className="mt-8 block">
        <Button size="lg" className="w-full" disabled={!explanation.trim()}>
          Continue to map
          <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
        </Button>
      </Link>
    </article>
  );
}
