"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SystemsMapEditor } from "@/components/learner/SystemsMapEditor";
import { EvidenceReveal } from "@/components/learner/EvidenceReveal";
import { EnvironmentalScene } from "@/components/learner/EnvironmentalScene";
import { Button } from "@/components/shared/Button";
import { getMedia } from "@/data/first-landing-media";
import { useDemoStore, getNotesForLearner } from "@/store/demo-store";

export default function SystemsPage() {
  const { activeLearnerId } = useDemoStore();
  const notes = getNotesForLearner(activeLearnerId);
  const observations = notes.map((n) => n.observation);

  return (
    <article>
      <EnvironmentalScene
        media={getMedia("systemsOverlook")}
        contentAlign="bottom"
        className="mb-6 min-h-[30vh] rounded-xl"
      >
        <p className="pb-2 text-sm text-foreground/80">Build the system from your evidence</p>
      </EnvironmentalScene>

      <EvidenceReveal learnerObservations={observations} className="mb-8" />

      <SystemsMapEditor learnerId={activeLearnerId} />

      <Link href="/learner/exit-claim" className="mt-8 block">
        <Button size="lg" className="w-full">
          Make your exit claim
          <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
        </Button>
      </Link>
    </article>
  );
}
