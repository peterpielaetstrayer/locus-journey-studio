"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FieldNoteCapture } from "@/components/learner/FieldNoteCapture";
import { Button } from "@/components/shared/Button";
import { getDeliveredInterventions } from "@/store/demo-store";
import { useDemoStore } from "@/store/demo-store";

export default function WaterFingerprintsPage() {
  const { activeLearnerId } = useDemoStore();
  const interventions = getDeliveredInterventions(activeLearnerId);

  return (
    <article>
      <p className="mb-1 text-xs uppercase tracking-wide text-secondary">Stop 2</p>
      <h2 className="mb-2 text-2xl font-semibold">Water Fingerprints</h2>
      <p className="mb-4 text-muted">Find three clues that water shaped this place.</p>

      {interventions.length > 0 && (
        <aside className="mb-6 rounded-xl border border-mentor/40 bg-mentor/10 p-4">
          <p className="mb-1 text-xs uppercase text-mentor">Mentor intervention</p>
          <p>{interventions[interventions.length - 1].message}</p>
        </aside>
      )}

      <FieldNoteCapture stopId="stop-water-fingerprints" />

      <Link href="/learner/comparison" className="mt-8 block">
        <Button variant="secondary" size="lg" className="w-full">
          Continue to comparison
          <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
        </Button>
      </Link>
    </article>
  );
}
