"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { getLearnerById } from "@/data/canonical";
import { getNotesForLearner } from "@/store/demo-store";
import type { Artifact, LearnerSession, SystemsMap } from "@/types";
import { getMedia } from "@/data/first-landing-media";
import Image from "next/image";
import { focalToObjectPosition } from "@/data/first-landing-media";

type LivingAtlasPageProps = {
  learnerId: string;
  session: LearnerSession;
  artifact: Artifact;
  systemsMap?: SystemsMap;
  onAddToAtlas?: () => void;
};

export function LivingAtlasPage({
  learnerId,
  session,
  artifact,
  systemsMap,
  onAddToAtlas,
}: LivingAtlasPageProps) {
  const learner = getLearnerById(learnerId)!;
  const notes = getNotesForLearner(learnerId);
  const media = getMedia("shorelineTransfer");

  return (
    <article className="motion-atlas-unfold">
      <div className="atlas-surface rounded-sm shadow-2xl">
        {/* Atlas spread header */}
        <header className="border-b border-parchment-ink/10 px-6 py-4 md:px-10 md:py-6">
          <p className="text-xs uppercase tracking-[0.25em] opacity-60">
            Virginia Beach Living Systems Atlas
          </p>
          <h2 className="mt-2 font-serif text-3xl font-semibold">{artifact.title}</h2>
          <p className="mt-1 text-sm opacity-70">
            First Landing State Park · {new Date().toLocaleDateString()} ·{" "}
            {new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </p>
        </header>

        <div className="grid gap-6 px-6 py-6 md:grid-cols-2 md:px-10 md:py-8">
          {/* Image panel */}
          <figure className="relative aspect-[4/3] overflow-hidden rounded-sm">
            <Image
              src={media.src}
              alt={notes[0]?.observation ?? media.alt}
              fill
              className="object-cover"
              style={{ objectPosition: focalToObjectPosition(media.focal) }}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <figcaption className="mt-2 text-xs italic opacity-70">
              {notes[0]?.observation ?? "Field observation — learner capture"}
            </figcaption>
          </figure>

          {/* Evidence columns */}
          <div className="space-y-5 font-serif text-sm leading-relaxed">
            <section>
              <h3 className="mb-1 text-xs uppercase tracking-widest opacity-60">Original hypothesis</h3>
              <p>{artifact.originalHypothesis || session.baselineExplanation}</p>
            </section>

            <section>
              <h3 className="mb-1 text-xs uppercase tracking-widest opacity-60">Strongest evidence</h3>
              <ul className="list-disc space-y-1 pl-4">
                {(artifact.strongestEvidence.length > 0
                  ? artifact.strongestEvidence
                  : notes.map((n) => n.observation).slice(0, 3)
                ).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="mb-1 text-xs uppercase tracking-widest opacity-60">Revised explanation</h3>
              <p>{artifact.revisedExplanation || session.revisedExplanation || session.exitClaim}</p>
            </section>
          </div>
        </div>

        {/* Systems diagram */}
        {systemsMap && (
          <section className="border-t border-parchment-ink/10 px-6 py-6 md:px-10">
            <h3 className="mb-3 text-xs uppercase tracking-widest opacity-60">Systems map</h3>
            <svg viewBox="0 0 100 60" className="h-40 w-full" role="img" aria-label="Learner systems diagram">
              {systemsMap.edges.map((edge) => {
                const src = systemsMap.nodes.find((n) => n.id === edge.source);
                const tgt = systemsMap.nodes.find((n) => n.id === edge.target);
                if (!src || !tgt) return null;
                return (
                  <line
                    key={edge.id}
                    x1={src.x}
                    y1={src.y * 0.6}
                    x2={tgt.x}
                    y2={tgt.y * 0.6}
                    stroke="hsl(157 28% 35%)"
                    strokeWidth="0.6"
                  />
                );
              })}
              {systemsMap.nodes.map((node) => (
                <text
                  key={node.id}
                  x={node.x}
                  y={node.y * 0.6}
                  textAnchor="middle"
                  fill="hsl(205 24% 18%)"
                  fontSize="3"
                >
                  {node.label}
                </text>
              ))}
            </svg>
          </section>
        )}

        <footer className="border-t border-parchment-ink/10 px-6 py-6 md:px-10">
          <section className="mb-4">
            <h3 className="mb-1 text-xs uppercase tracking-widest text-quiet-amber opacity-80">
              Unresolved question
            </h3>
            <p className="font-serif italic">{artifact.remainingQuestion || "What would you still need to observe?"}</p>
          </section>

          <section className="mb-4">
            <h3 className="mb-1 text-xs uppercase tracking-widest opacity-60">Connection to another place</h3>
            <p className="text-sm">Virginia Beach shoreline — where freshwater meets tidal influence</p>
          </section>

          <p className="text-xs opacity-60">
            Identity pathway: {learner.identityPathways.join(" · ")}
          </p>
        </footer>
      </div>

      <div className="mt-8 text-center">
        <p className="env-type-serif mb-6 text-xl leading-relaxed text-foreground">
          You did not finish a lesson.
          <br />
          You learned to read one part of the world.
        </p>

        <Button size="lg" variant="parchment" className="w-full max-w-md" onClick={onAddToAtlas}>
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
