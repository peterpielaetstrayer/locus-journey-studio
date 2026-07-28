"use client";

import { useEffect, useState } from "react";
import { EnvironmentalScene } from "./EnvironmentalScene";
import { EnterLandscapeAction } from "./EnterLandscapeAction";
import { RouteThreadPreview } from "./RouteThreadPreview";
import type { EnvironmentalMedia } from "@/data/first-landing-media";
import { cn } from "@/lib/utils";

type EnterLandscapeScreenProps = {
  media: EnvironmentalMedia;
};

export function EnterLandscapeScreen({ media }: EnterLandscapeScreenProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const animate = !reducedMotion;

  const placeBlock = (
    <div
      className={cn(
        "space-y-1",
        animate && "enter-landscape-animate-metadata",
      )}
    >
      <p
        className="text-xs font-medium uppercase tracking-[0.22em] text-foreground/85 md:text-sm"
        aria-label={`Location: ${media.location}`}
      >
        {media.location?.toUpperCase() ?? "FIRST LANDING"}
      </p>
      <p
        className="text-xs tracking-[0.12em] text-[hsl(var(--entrance-copy-muted))] md:text-sm"
        aria-label={`Time: ${media.time}`}
      >
        {media.time}
      </p>
    </div>
  );

  return (
    <EnvironmentalScene
      media={media}
      fullViewport
      priority
      preferProduction
      showLocation={false}
      overlayVariant="editorial"
      showSideVignette
      showAtmosphericWash
      contentAlign="bottom-left"
      contentClassName="enter-landscape w-full px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(3.25rem,env(safe-area-inset-top))] sm:px-6 lg:pb-12 lg:pl-10 lg:pr-8 xl:pl-14"
      decorativeOverlay={
        <>
          <RouteThreadPreview
            showLabels
            animate={animate}
            className="absolute bottom-[12%] right-[6%] hidden h-[min(52vh,420px)] w-auto lg:block xl:right-[8%]"
          />
          <RouteThreadPreview
            showLabels={false}
            animate={animate}
            className="absolute bottom-[20%] right-3 h-20 w-7 opacity-35 sm:opacity-40 lg:hidden"
          />
        </>
      }
    >
      <div className="enter-landscape__grid flex min-h-[calc(100dvh-4.5rem)] w-full flex-col lg:min-h-[calc(100dvh-5rem)] lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:grid-rows-[auto_1fr_auto] lg:gap-x-12">
        {/* Brand */}
        <p
          className={cn(
            "enter-landscape__brand shrink-0 text-[10px] font-medium uppercase tracking-[0.28em] text-[hsl(var(--entrance-copy-muted))] md:text-xs",
            animate && "enter-landscape-animate-metadata",
          )}
        >
          LOCUS / FIELD JOURNEY
        </p>

        {/* Mobile: place/time near top */}
        <div className="mt-5 shrink-0 lg:hidden">{placeBlock}</div>

        {/* Spacer — pushes headline toward lower-middle on mobile */}
        <div className="min-h-[8vh] flex-1 lg:row-span-1 lg:min-h-0" aria-hidden />

        {/* Editorial + CTA block */}
        <div className="enter-landscape__editorial flex shrink-0 flex-col lg:col-start-1 lg:row-start-2 lg:justify-end lg:pb-6">
          {/* Desktop: place/time mid-lower-left */}
          <div className="mb-6 hidden lg:mb-10 lg:block">{placeBlock}</div>

          <h1 className="enter-landscape__headline mb-4 font-serif leading-[1.12] text-foreground lg:mb-6">
            <span
              className={cn(
                "block text-[clamp(1.625rem,6.5vw,2.75rem)] font-normal",
                animate && "enter-landscape-animate-headline-1",
              )}
            >
              The water looks still.
            </span>
            <span
              className={cn(
                "mt-1 block text-[clamp(1.625rem,6.5vw,2.75rem)] font-normal text-foreground/90",
                animate && "enter-landscape-animate-headline-2",
              )}
            >
              It isn&apos;t.
            </span>
          </h1>

          <p
            className={cn(
              "enter-landscape__supporting mb-6 max-w-[22rem] text-sm leading-relaxed text-[hsl(var(--entrance-copy-muted))] sm:max-w-sm md:text-[0.9375rem] md:leading-7 lg:mb-0 lg:max-w-md",
              animate && "enter-landscape-animate-supporting",
            )}
          >
            A place-based learning journey through the hidden work of water.
            <br />
            You&apos;ll uncover it through evidence.
          </p>

          {/* Mobile CTA — thumb reach */}
          <div className="enter-landscape__cta lg:hidden">
            <EnterLandscapeAction animate={animate} className="w-full" />
          </div>
        </div>

        {/* Desktop CTA — lower right */}
        <div className="enter-landscape__cta hidden lg:col-start-2 lg:row-start-3 lg:block lg:self-end lg:justify-self-end">
          <EnterLandscapeAction animate={animate} className="min-w-[300px]" />
        </div>
      </div>
    </EnvironmentalScene>
  );
}
