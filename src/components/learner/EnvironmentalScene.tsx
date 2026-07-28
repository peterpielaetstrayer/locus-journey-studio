"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  focalToObjectPosition,
  type EnvironmentalMedia,
} from "@/data/first-landing-media";
import { LocationStamp } from "./LocationStamp";

type ContentAlign = "bottom" | "center" | "bottom-left";
type OverlayVariant = "default" | "editorial";

type EnvironmentalSceneProps = {
  media: EnvironmentalMedia;
  children?: React.ReactNode;
  className?: string;
  contentAlign?: ContentAlign;
  contentClassName?: string;
  showLegibility?: boolean;
  overlayVariant?: OverlayVariant;
  showSideVignette?: boolean;
  showAtmosphericWash?: boolean;
  showLocation?: boolean;
  parallax?: boolean;
  /** Try productionSrc first, fall back to src on error */
  preferProduction?: boolean;
  /** Optional ambient sound — off by default per accessibility */
  ambientSoundSrc?: string;
  ambientSoundLabel?: string;
  fullViewport?: boolean;
  priority?: boolean;
  decorativeOverlay?: React.ReactNode;
};

export function EnvironmentalScene({
  media,
  children,
  className,
  contentAlign = "bottom",
  contentClassName,
  showLegibility = true,
  overlayVariant = "default",
  showSideVignette = false,
  showAtmosphericWash = false,
  showLocation = true,
  parallax = false,
  preferProduction = false,
  ambientSoundSrc,
  ambientSoundLabel = "Ambient wetland sound",
  fullViewport = false,
  priority = false,
  decorativeOverlay,
}: EnvironmentalSceneProps) {
  const initialSrc = preferProduction ? media.productionSrc : media.src;
  const [imageSrc, setImageSrc] = useState(initialSrc);
  const [imageError, setImageError] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setImageSrc(preferProduction ? media.productionSrc : media.src);
    setImageError(false);
  }, [media.productionSrc, media.src, preferProduction]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  function handleImageError() {
    if (imageSrc === media.productionSrc && media.src !== media.productionSrc) {
      setImageSrc(media.src);
      return;
    }
    setImageError(true);
  }

  const alignClass = {
    bottom: "items-end justify-center pb-16 md:pb-20",
    center: "items-center justify-center",
    "bottom-left": "items-end justify-start pb-16 md:pb-20 pl-4 md:pl-6",
  }[contentAlign];

  return (
    <section
      className={cn(
        "env-scene-root relative overflow-hidden",
        fullViewport ? "min-h-dvh" : "min-h-[50vh] md:min-h-[60vh]",
        className,
      )}
      aria-label={media.alt}
    >
      {/* Background image or fallback gradient */}
      <div
        className={cn(
          "absolute inset-0",
          parallax && !reducedMotion && "motion-safe:scale-105",
        )}
        style={
          imageError
            ? { background: media.fallbackGradient }
            : undefined
        }
      >
        {!imageError && (
          <Image
            src={imageSrc}
            alt={media.alt}
            fill
            priority={priority}
            className="object-cover"
            style={{ objectPosition: focalToObjectPosition(media.focal) }}
            onError={handleImageError}
            sizes="100vw"
          />
        )}
      </div>

      {showAtmosphericWash && (
        <div className="atmospheric-fog pointer-events-none absolute inset-0" aria-hidden />
      )}

      {showLegibility && (
        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            overlayVariant === "editorial"
              ? "legibility-gradient-editorial"
              : "legibility-gradient",
          )}
          aria-hidden
        />
      )}

      {showSideVignette && (
        <div className="enter-landscape__vignette pointer-events-none absolute inset-0" aria-hidden />
      )}

      {decorativeOverlay}

      {/* Optional ambient sound — user-initiated only */}
      {ambientSoundSrc && (
        <div className="absolute right-4 top-4 z-20">
          <button
            type="button"
            onClick={() => setSoundEnabled((v) => !v)}
            className="min-h-11 rounded-lg bg-env-black/60 px-3 py-2 text-xs text-foreground backdrop-blur-sm"
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? "Turn off ambient sound" : `Enable ${ambientSoundLabel}`}
          >
            {soundEnabled ? "Sound on" : "Sound off"}
          </button>
          {soundEnabled && (
            <audio src={ambientSoundSrc} loop aria-label={ambientSoundLabel}>
              <track kind="captions" />
            </audio>
          )}
        </div>
      )}

      {/* Content overlay */}
      <div
        className={cn(
          "relative z-10 flex min-h-[inherit] flex-col px-4 md:px-8",
          alignClass,
          contentClassName,
        )}
      >
        {showLocation && (media.location || media.time) && (
          <LocationStamp
            location={media.location}
            time={media.time}
            className="mb-auto pt-6 md:pt-8"
          />
        )}
        {children}
      </div>
    </section>
  );
}
