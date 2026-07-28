import Link from "next/link";
import { ArrowRight, BookOpen, Compass, Eye, Users } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { WATER_WRITES_JOURNEY } from "@/data/canonical";

const MODES = [
  {
    href: "/creator",
    icon: BookOpen,
    title: "Create",
    description: "Design journey architecture, stops, branches, safety, and learner preview.",
  },
  {
    href: "/learner",
    icon: Compass,
    title: "Experience",
    description: "Walk the field journey as Maya — observe, capture evidence, revise, create.",
  },
  {
    href: "/orchestrator",
    icon: Users,
    title: "Orchestrate",
    description: "See learners, review evidence, adapt support, and deliver mentor interventions.",
  },
  {
    href: "/reviewer",
    icon: Eye,
    title: "Review",
    description: "Inspect learning design, safety, accessibility, and publication readiness.",
  },
];

export default function DemoGatewayPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section aria-labelledby="gateway-heading" className="mb-12 text-center">
        <p className="mb-2 text-sm uppercase tracking-widest text-secondary">
          Virginia Beach Vertical Slice
        </p>
        <h2 id="gateway-heading" className="mb-4 text-4xl font-semibold tracking-tight md:text-5xl">
          Turn the world into a learning environment.
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-muted">
          LOCUS Journey Studio demonstrates one complete place-based learning loop —
          from creator authoring through learner evidence, human orchestration,
          artifact creation, and later resurfacing.
        </p>
      </section>

      <section aria-label="Product relationship" className="mb-10 rounded-xl border border-border bg-surface p-6">
        <div className="flex flex-col items-center gap-2 text-center text-sm md:flex-row md:justify-center md:gap-6">
          <span><strong className="text-accent">OWLL</strong> → designs the learning model</span>
          <span className="hidden text-muted md:inline" aria-hidden>·</span>
          <span><strong className="text-primary">LOCUS</strong> → powers the journey</span>
          <span className="hidden text-muted md:inline" aria-hidden>·</span>
          <span><strong className="text-secondary">Field Notes</strong> → captures the experience</span>
        </div>
      </section>

      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        {MODES.map(({ href, icon: Icon, title, description }) => (
          <Link key={href} href={href} className="group block">
            <Card className="h-full transition-colors hover:border-primary/50 hover:bg-surface-raised">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
              <span className="mt-4 inline-flex items-center gap-1 text-sm text-primary group-hover:underline">
                Enter <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </Card>
          </Link>
        ))}
      </div>

      <section aria-labelledby="guided-demo" className="rounded-xl border border-accent/30 bg-surface-raised p-6">
        <h3 id="guided-demo" className="mb-2 text-lg font-semibold">
          Guided demo — {WATER_WRITES_JOURNEY.title}
        </h3>
        <p className="mb-4 text-sm text-muted">
          {WATER_WRITES_JOURNEY.location} · Field-Test Draft · {WATER_WRITES_JOURNEY.durationMinutes} min
        </p>
        <p className="mb-6 italic text-accent">
          &ldquo;{WATER_WRITES_JOURNEY.centralQuestion}&rdquo;
        </p>
        <Link href="/learner">
          <Button size="lg">
            Start as Maya Chen
            <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
          </Button>
        </Link>
      </section>
    </div>
  );
}
