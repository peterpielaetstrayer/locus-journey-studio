import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { WATER_WRITES_JOURNEY } from "@/data/canonical";

export default function LearnerInvitationPage() {
  return (
    <article>
      <p className="mb-2 text-xs uppercase tracking-widest text-secondary">
        Field-Test Draft · Private adult co-design only
      </p>
      <h2 className="mb-4 font-serif text-3xl font-semibold">
        {WATER_WRITES_JOURNEY.title}
      </h2>
      <p className="mb-2 text-sm text-muted">{WATER_WRITES_JOURNEY.location}</p>

      <blockquote className="my-6 border-l-2 border-accent pl-4 text-lg italic text-accent">
        {WATER_WRITES_JOURNEY.centralQuestion}
      </blockquote>

      <p className="mb-8 text-muted">
        Collect evidence, test an explanation, and create one page of your
        Virginia Beach Living Systems Field Guide.
      </p>

      <section aria-labelledby="journey-overview" className="mb-8 space-y-3 rounded-xl border border-border bg-surface/60 p-4 text-sm">
        <h3 id="journey-overview" className="font-medium">Journey overview</h3>
        <ul className="space-y-1 text-muted">
          <li>8 stops · {WATER_WRITES_JOURNEY.durationMinutes} minutes</li>
          <li>Artifact: Micro-Landscape Systems Card</li>
          <li>Domains: {WATER_WRITES_JOURNEY.learningDomains.join(", ")}</li>
        </ul>
        <p className="text-xs">
          LOCUS does not replace park rules, permits, trained supervision, or emergency judgment.
        </p>
      </section>

      <Link href="/learner/preparation">
        <Button size="lg" className="w-full">
          Begin as Maya Chen
          <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
        </Button>
      </Link>
    </article>
  );
}
