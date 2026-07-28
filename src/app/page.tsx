import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { EnvironmentalScene } from "@/components/learner/EnvironmentalScene";
import { getMedia } from "@/data/first-landing-media";

export default function PublicEntrancePage() {
  const media = getMedia("entrance");

  return (
    <EnvironmentalScene
      media={media}
      fullViewport
      contentAlign="bottom-left"
      priority
      parallax
    >
      <div className="mx-auto w-full max-w-2xl pb-16 md:pb-24">
        {/* Minimal LOCUS mark */}
        <p className="mb-8 text-xs uppercase tracking-[0.3em] text-foreground/50">
          LOCUS
        </p>

        <div className="mb-10 space-y-1">
          <h1 className="text-sm font-medium uppercase tracking-[0.2em] text-foreground/80">
            {media.location}
          </h1>
          <p className="text-sm text-foreground/60">{media.time}</p>
        </div>

        <div className="mb-12 max-w-md space-y-2">
          <p className="env-type-large env-type-serif text-foreground">
            The water looks still.
          </p>
          <p className="env-type-serif text-2xl text-foreground/80 md:text-3xl">
            It isn&apos;t.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href="/learner">
            <Button size="lg" className="w-full sm:w-auto">
              Enter the landscape
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
            </Button>
          </Link>
          <p className="text-sm text-foreground/50">
            or use <strong className="font-normal text-foreground/70">Studio</strong> above
          </p>
        </div>
      </div>
    </EnvironmentalScene>
  );
}
