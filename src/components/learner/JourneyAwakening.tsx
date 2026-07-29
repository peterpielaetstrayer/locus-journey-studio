"use client";

import { useEffect, useState } from "react";
import { EnvironmentalScene } from "./EnvironmentalScene";
import { FogRouteMap } from "./FogRouteMap";
import { ExpeditionAction } from "./ExpeditionAction";
import { BaselineThoughtSheet } from "./BaselineThoughtSheet";
import { getMedia } from "@/data/first-landing-media";
import { useDemoStore } from "@/store/demo-store";
import { cn } from "@/lib/utils";
import type { Confidence } from "@/types";

export function JourneyAwakening() {
  const { saveBaseline, learnerSessions, activeLearnerId } = useDemoStore();
  const session = learnerSessions[activeLearnerId];
  const [explanation, setExplanation] = useState(session.baselineExplanation);
  const [confidence, setConfidence] = useState<Confidence>(session.baselineConfidence);
  const [showBaseline, setShowBaseline] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const animate = !reducedMotion;

  function handleSaveBaseline() {
    if (explanation.trim()) {
      saveBaseline(explanation, confidence);
    }
  }

  return (
    <EnvironmentalScene
      media={getMedia("routeAwakening")}
      fullViewport
      priority
      overlayVariant="editorial"
      showSideVignette
      showAtmosphericWash
      contentAlign="bottom-left"
      contentClassName="w-full px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(3.25rem,env(safe-area-inset-top))] sm:px-6 lg:pb-12 lg:pl-10 lg:pr-8 xl:pl-14"
    >
      <div className="flex min-h-[calc(100dvh-4.5rem)] w-full max-w-2xl flex-col self-start lg:max-w-xl xl:max-w-2xl">
        <p
          className={cn(
            "text-[10px] font-medium uppercase tracking-[0.28em] text-[hsl(var(--entrance-copy-muted))] md:text-xs",
            animate && "enter-landscape-animate-metadata",
          )}
        >
          LOCUS / FIELD JOURNEY
        </p>

        <div className="min-h-[6vh] flex-1" aria-hidden />

        <div className="space-y-5 lg:space-y-6">
          <header>
            <h1
              className={cn(
                "env-type-large env-type-serif font-normal uppercase tracking-[0.06em] text-foreground",
                animate && "enter-landscape-animate-headline-1",
              )}
            >
              Water Writes the Landscape
            </h1>
            <p
              className={cn(
                "mt-3 max-w-md font-serif text-[clamp(1.25rem,4.5vw,1.75rem)] leading-snug text-foreground/90",
                animate && "enter-landscape-animate-headline-2",
              )}
            >
              Find evidence of water
              <br />
              without looking at the water.
            </p>
          </header>

          <div
            className={cn(
              "max-w-xs lg:max-w-sm",
              animate && "enter-landscape-animate-supporting",
            )}
          >
            <FogRouteMap compact visibleStopCount={2} />
          </div>

          <div
            className={cn(
              "atlas-preview-chip max-w-xs rounded-sm p-3",
              animate && "enter-landscape-animate-supporting",
            )}
          >
            <p className="text-[10px] uppercase tracking-[0.22em] text-foreground/50">Living Atlas</p>
            <p className="mt-1 font-serif text-sm italic text-foreground/80">
              One page of your Virginia Beach field guide will grow here.
            </p>
          </div>

          {!showBaseline ? (
            <div className={cn("space-y-3", animate && "enter-landscape-animate-cta")}>
              <ExpeditionAction href="/learner/threshold" label="Begin walking" className="w-full max-w-md" />
              <button
                type="button"
                onClick={() => setShowBaseline(true)}
                className="min-h-11 text-sm text-[hsl(var(--entrance-copy-muted))] underline-offset-2 hover:underline"
              >
                Prepare first — record a baseline thought
              </button>
              <details className="text-sm text-[hsl(var(--entrance-copy-muted))]">
                <summary className="min-h-11 cursor-pointer py-2">Route & accessibility</summary>
                <ul className="mt-2 space-y-1 pl-4 text-xs">
                  <li>75–90 min · 8 stops · boardwalk route</li>
                  <li>No water entry · stay on designated trail</li>
                  <li>Seated observation alternatives available</li>
                  <li>Field-Test Draft · private adult co-design only</li>
                </ul>
              </details>
            </div>
          ) : (
            <BaselineThoughtSheet
              explanation={explanation}
              confidence={confidence}
              onExplanationChange={setExplanation}
              onConfidenceChange={setConfidence}
              onSave={handleSaveBaseline}
              continueHref="/learner/threshold"
              animate={animate}
              className="max-w-md"
            />
          )}
        </div>
      </div>
    </EnvironmentalScene>
  );
}
