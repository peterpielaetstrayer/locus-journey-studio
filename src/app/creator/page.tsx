import Link from "next/link";
import { FUTURE_JOURNEYS, WATER_WRITES_JOURNEY } from "@/data/canonical";
import { Card, CardDescription, CardTitle } from "@/components/shared/Card";

export default function CreatorLibraryPage() {
  return (
    <div className="creator-surface mx-auto max-w-6xl px-4 py-8">
      <h2 className="mb-2 text-2xl font-semibold">Journey Library</h2>
      <p className="mb-8 text-muted">Design reusable place-based learning architecture.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/creator/journey/water-writes-the-landscape">
          <Card className="h-full border-primary/40 hover:border-primary transition-colors">
            <span className="text-xs uppercase text-accent">Field-Test Draft</span>
            <CardTitle className="mt-1">{WATER_WRITES_JOURNEY.title}</CardTitle>
            <CardDescription>{WATER_WRITES_JOURNEY.location}</CardDescription>
          </Card>
        </Link>

        {FUTURE_JOURNEYS.map((j) => (
          <Card key={j.id} className="opacity-60">
            <span className="text-xs uppercase text-muted">Concept</span>
            <CardTitle className="mt-1">{j.title}</CardTitle>
            <CardDescription>{j.location}</CardDescription>
          </Card>
        ))}
      </div>

      <aside className="mt-10 rounded-xl border border-dashed border-muted p-6 text-sm text-muted">
        <strong className="text-foreground">Creator economy preview</strong> — Nonfunctional.
        Future royalties, marketplace, and payment flows are not implemented in v0.1.
      </aside>
    </div>
  );
}
