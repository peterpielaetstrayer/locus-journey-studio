"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SystemsMapEditor } from "@/components/learner/SystemsMapEditor";
import { Button } from "@/components/shared/Button";
import { useDemoStore } from "@/store/demo-store";

export default function SystemsPage() {
  const { activeLearnerId } = useDemoStore();

  return (
    <article>
      <p className="mb-1 text-xs uppercase tracking-wide text-secondary">Stop 7</p>
      <h2 className="mb-2 text-2xl font-semibold">Build the System</h2>
      <p className="mb-6 text-muted">
        Connect rainfall, water level, soil, plants, and trail design. Mark one uncertainty.
      </p>

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
