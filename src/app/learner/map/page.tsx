import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FoggedMap, MapStopList } from "@/components/learner/FoggedMap";
import { Button } from "@/components/shared/Button";

export default function MapPage() {
  return (
    <article>
      <h2 className="mb-2 text-2xl font-semibold">Journey map</h2>
      <p className="mb-6 text-sm text-muted">
        Stops reveal through evidence and comparison — not speed.
      </p>

      <FoggedMap />
      <div className="mt-6">
        <MapStopList />
      </div>

      <Link href="/learner/water-fingerprints" className="mt-8 block">
        <Button size="lg" className="w-full">
          Go to Water Fingerprints
          <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
        </Button>
      </Link>
    </article>
  );
}
