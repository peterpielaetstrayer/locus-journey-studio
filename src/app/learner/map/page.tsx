import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FogRouteMap, MapStopList } from "@/components/learner/FogRouteMap";
import { Button } from "@/components/shared/Button";
import { WATER_WRITES_JOURNEY } from "@/data/canonical";

export default function MapPage() {
  return (
    <article>
      <h2 className="mb-2 font-serif text-2xl font-semibold">Journey map</h2>
      <p className="mb-6 text-sm text-muted">
        Stops reveal through evidence — not speed.
      </p>

      <FogRouteMap />
      <div className="mt-6">
        <MapStopList />
      </div>

      <section id="safety" className="mt-8 rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm">
        <h3 className="mb-2 font-medium text-danger">Route & safety</h3>
        <ul className="space-y-1 text-muted">
          <li>{WATER_WRITES_JOURNEY.location}</li>
          <li>Stay on designated trail · No water entry</li>
          <li>Two screened adults recommended for field test</li>
          <li>Field-Test Draft — not approved for public youth programs</li>
        </ul>
      </section>

      <Link href="/learner/water-fingerprints" className="mt-8 block">
        <Button size="lg" className="w-full">
          Go to Water Fingerprints
          <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
        </Button>
      </Link>
    </article>
  );
}
