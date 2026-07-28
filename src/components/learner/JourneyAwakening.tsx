"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/shared/Button";
import { Label, Textarea, Select } from "@/components/shared/FormFields";
import { EnvironmentalScene } from "./EnvironmentalScene";
import { FogRouteMap } from "./FogRouteMap";
import { getMedia } from "@/data/first-landing-media";
import { useDemoStore } from "@/store/demo-store";
import { formatConfidence } from "@/lib/utils";
import { useState } from "react";
import type { Confidence } from "@/types";

export function JourneyAwakening() {
  const { saveBaseline, learnerSessions, activeLearnerId } = useDemoStore();
  const session = learnerSessions[activeLearnerId];
  const [explanation, setExplanation] = useState(session.baselineExplanation);
  const [confidence, setConfidence] = useState<Confidence>(session.baselineConfidence);
  const [showBaseline, setShowBaseline] = useState(false);

  function handleSaveBaseline() {
    if (explanation.trim()) {
      saveBaseline(explanation, confidence);
    }
  }

  return (
    <EnvironmentalScene
      media={getMedia("routeAwakening")}
      fullViewport
      contentAlign="bottom"
      priority
    >
      <div className="mx-auto w-full max-w-lg pb-28 md:pb-32">
        <h1 className="env-type-large env-type-serif mb-3 font-semibold text-foreground">
          Water Writes the Landscape
        </h1>
        <p className="mb-6 max-w-md text-lg leading-relaxed text-foreground/90">
          Find evidence of water
          <br />
          without looking at the water.
        </p>

        <div className="mb-6 rounded-lg bg-env-black/40 p-3 backdrop-blur-sm">
          <FogRouteMap compact visibleStopCount={2} />
        </div>

        <p className="mb-6 text-sm text-foreground/70">
          Collect evidence. Test an explanation. Leave with one page of a living field guide.
        </p>

        {/* Atlas preview */}
        <div className="mb-6 rounded-sm border border-parchment/20 bg-parchment/10 p-3 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-widest text-foreground/50">Living Atlas</p>
          <p className="font-serif text-sm italic text-foreground/80">
            One page of your Virginia Beach field guide will grow here.
          </p>
        </div>

        {!showBaseline ? (
          <div className="space-y-3">
            <Link href="/learner/threshold">
              <Button size="lg" className="w-full">
                Begin walking
                <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
              </Button>
            </Link>
            <button
              type="button"
              onClick={() => setShowBaseline(true)}
              className="min-h-11 w-full text-sm text-foreground/70 underline-offset-2 hover:underline"
            >
              Prepare first — record a baseline thought
            </button>
            <details className="text-sm text-foreground/60">
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
          <div className="rounded-xl bg-env-black/50 p-4 backdrop-blur-sm">
            <p className="mb-3 text-sm italic text-accent">
              Water shapes a place by…
            </p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="baseline" className="text-foreground/80">
                  Your starting thought (not judged)
                </Label>
                <Textarea
                  id="baseline"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Write what you think before seeing the place…"
                  className="mt-1 bg-surface/80"
                />
              </div>
              <div>
                <Label htmlFor="baseline-confidence" className="text-foreground/80">
                  Confidence
                </Label>
                <Select
                  id="baseline-confidence"
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value) as Confidence)}
                  className="mt-1 bg-surface/80"
                >
                  {[1, 2, 3, 4].map((n) => (
                    <option key={n} value={n}>
                      {n} — {formatConfidence(n)}
                    </option>
                  ))}
                </Select>
              </div>
              <Link href="/learner/threshold" onClick={handleSaveBaseline}>
                <Button size="lg" className="w-full" disabled={!explanation.trim()}>
                  Begin walking
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </EnvironmentalScene>
  );
}
