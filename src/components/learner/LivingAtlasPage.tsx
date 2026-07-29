"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { getLearnerById } from "@/data/canonical";
import { getNotesForLearner } from "@/store/demo-store";
import type { Artifact, LearnerSession, SystemsMap } from "@/types";
import { getMedia, focalToObjectPosition, type FirstLandingMediaKey } from "@/data/first-landing-media";
import Image from "next/image";
import { AtlasCausalSystem } from "./AtlasCausalSystem";
import { UnresolvedMarginNote } from "./UnresolvedMarginNote";

type LivingAtlasPageProps = {
  learnerId: string;
  session: LearnerSession;
  artifact: Artifact;
  systemsMap?: SystemsMap;
  onAddToAtlas?: () => void;
};

function resolveEvidenceMedia(notes: ReturnType<typeof getNotesForLearner>): {
  media: ReturnType<typeof getMedia>;
  caption: string;
} {
  const waterNote = notes.find((n) => n.stopId === "stop-water-fingerprints");
  const cypressNote = notes.find((n) => n.stopId === "stop-cypress-knee");

  if (cypressNote) {
    return { media: getMedia("cypressKnees"), caption: cypressNote.observation };
  }
  if (waterNote) {
    return { media: getMedia("waterFingerprint"), caption: waterNote.observation };
  }

  const key: FirstLandingMediaKey = "waterFingerprint";
  return {
    media: getMedia(key),
    caption: notes[0]?.observation ?? "Field observation — learner capture",
  };
}

export function LivingAtlasPage({
  learnerId,
  session,
  artifact,
  systemsMap,
  onAddToAtlas,
}: LivingAtlasPageProps) {
  const learner = getLearnerById(learnerId)!;
  const notes = getNotesForLearner(learnerId);
  const { media, caption } = resolveEvidenceMedia(notes);
  const now = new Date();

  const evidenceItems =
    artifact.strongestEvidence.length > 0
      ? artifact.strongestEvidence
      : notes.map((n) => n.observation).slice(0, 3);

  return (
    <article className="motion-atlas-unfold px-4 py-6 sm:px-6 md:py-10">
      <div className="atlas-spread mx-auto max-w-5xl overflow-hidden rounded-sm">
        <header className="border-b border-[hsl(var(--parchment-ink)/0.08)] px-5 py-5 md:px-8 md:py-6">
          <p className="text-[10px] uppercase tracking-[0.25em] opacity-55">
            Virginia Beach / Living Atlas
          </p>
          <h2 className="mt-2 font-serif text-2xl font-semibold md:text-3xl">{artifact.title}</h2>
          <p className="mt-2 text-sm opacity-70">
            {learner.name} · First Landing State Park ·{" "}
            {now.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })} ·{" "}
            {now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </p>
        </header>

        <div className="atlas-spread__seam h-px w-full" aria-hidden />

        <div className="grid md:grid-cols-2">
          {/* Left page — evidence */}
          <div className="border-b border-[hsl(var(--parchment-ink)/0.06)] p-5 md:border-b-0 md:border-r md:p-8">
            <figure className="relative">
              <div className="atlas-tape absolute -top-2 left-1/2 z-10 h-5 w-16 -translate-x-1/2" aria-hidden />
              <div className="relative aspect-[4/3] overflow-hidden bg-[hsl(var(--parchment-ink)/0.04)]">
                <Image
                  src={media.src}
                  alt={caption}
                  fill
                  className="object-cover"
                  style={{ objectPosition: focalToObjectPosition(media.focal) }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <figcaption className="mt-3 text-xs italic opacity-70">{caption}</figcaption>
            </figure>

            <section className="mt-6">
              <h3 className="mb-1 text-[10px] uppercase tracking-[0.2em] opacity-55">Original theory</h3>
              <p className="font-serif text-sm leading-relaxed">
                {artifact.originalHypothesis || session.baselineExplanation || "—"}
              </p>
            </section>

            <section className="mt-5">
              <h3 className="mb-1 text-[10px] uppercase tracking-[0.2em] opacity-55">Evidence note</h3>
              <ul className="list-disc space-y-1 pl-4 font-serif text-sm leading-relaxed">
                {evidenceItems.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </section>

            <div className="mt-6 flex justify-end">
              <span className="atlas-stamp">First Landing · Virginia Beach</span>
            </div>
          </div>

          {/* Right page — systems */}
          <div className="p-5 md:p-8">
            <section className="mb-5">
              <h3 className="mb-1 text-[10px] uppercase tracking-[0.2em] opacity-55">Revised explanation</h3>
              <p className="font-serif text-lg leading-relaxed">
                {artifact.revisedExplanation || session.revisedExplanation || session.exitClaim || "—"}
              </p>
            </section>

            {systemsMap && <AtlasCausalSystem systemsMap={systemsMap} className="mb-6" />}

            <UnresolvedMarginNote
              question={artifact.remainingQuestion || "What would you still need to observe?"}
            />

            <section className="mt-6">
              <h3 className="mb-1 text-[10px] uppercase tracking-[0.2em] opacity-55">
                Connection to another place
              </h3>
              <p className="text-sm">
                Virginia Beach shoreline — where freshwater meets tidal influence
              </p>
            </section>

            <p className="mt-4 text-xs opacity-55">
              Identity pathway: {learner.identityPathways.join(" · ")}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-lg text-center">
        <p className="env-type-serif mb-6 text-xl leading-relaxed text-foreground">
          You did not finish a lesson.
          <br />
          You learned to read one part of the world.
        </p>

        <Button size="lg" variant="parchment" className="w-full" onClick={onAddToAtlas}>
          Add this page to my Virginia Beach Atlas
        </Button>

        <Link href="/learner/resurfacing" className="mt-4 block">
          <Button variant="ghost" size="md" className="text-muted">
            Idea returns
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Button>
        </Link>
      </div>
    </article>
  );
}
