"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type QuietMode = "listen" | "watch" | "silence";

type QuietAttentionModeProps = {
  durationSeconds?: number;
  onComplete: (observation: string) => void;
  onExit: () => void;
};

const MODES: { id: QuietMode; label: string; description: string }[] = [
  { id: "listen", label: "Listen", description: "Attend to sound layers around you" },
  { id: "watch", label: "Watch one small area", description: "Hold your gaze on a single patch" },
  { id: "silence", label: "Sit in silence", description: "No task — only presence" },
];

export function QuietAttentionMode({
  durationSeconds = 120,
  onComplete,
  onExit,
}: QuietAttentionModeProps) {
  const [phase, setPhase] = useState<"choose" | "quiet" | "reflect">("choose");
  const [mode, setMode] = useState<QuietMode | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [observation, setObservation] = useState("");
  const [reducedMotion, setReducedMotion] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
  }, []);

  useEffect(() => {
    if (phase !== "quiet") return;

    intervalRef.current = setInterval(() => {
      setElapsed((e) => {
        if (e + 1 >= durationSeconds) {
          clearInterval(intervalRef.current!);
          setPhase("reflect");
          return durationSeconds;
        }
        return e + 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, durationSeconds]);

  function startQuiet(selected: QuietMode) {
    setMode(selected);
    setElapsed(0);
    setPhase("quiet");
  }

  function handleSubmit() {
    if (observation.trim()) onComplete(observation.trim());
  }

  /* Accessible exit — always visible */
  const exitButton = (
    <button
      type="button"
      onClick={onExit}
      className="fixed right-4 top-4 z-50 min-h-11 rounded-lg bg-env-black/60 px-4 py-2 text-sm text-foreground backdrop-blur-sm"
    >
      Exit quiet mode
    </button>
  );

  if (phase === "choose") {
    return (
      <div className="relative min-h-[60vh]">
        {exitButton}
        <p className="env-type-serif mb-8 text-center text-2xl leading-relaxed md:text-3xl">
          For two minutes,
          <br />
          stop trying to move forward.
        </p>
        <ul className="mx-auto max-w-sm space-y-3">
          {MODES.map(({ id, label, description }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => startQuiet(id)}
                className="min-h-11 w-full rounded-xl border border-border/50 bg-surface/40 px-4 py-4 text-left backdrop-blur-sm transition-colors hover:border-secondary/50 hover:bg-surface/60"
              >
                <span className="block font-medium">{label}</span>
                <span className="text-sm text-muted">{description}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (phase === "quiet") {
    const progress = elapsed / durationSeconds;
    return (
      <div className="relative flex min-h-[70vh] flex-col items-center justify-center">
        {exitButton}
        {/* Subtle breathing light / waveform — no loud countdown */}
        <div
          className={cn(
            "mb-8 h-24 w-24 rounded-full border border-secondary/20",
            !reducedMotion && "motion-breathing",
          )}
          style={{
            background: `radial-gradient(circle, hsl(193 40% 38% / ${0.15 + progress * 0.15}) 0%, transparent 70%)`,
          }}
          role="progressbar"
          aria-valuenow={elapsed}
          aria-valuemin={0}
          aria-valuemax={durationSeconds}
          aria-label={`Quiet attention in progress — ${mode}`}
        />
        {!reducedMotion && (
          <svg viewBox="0 0 200 40" className="h-8 w-48 opacity-30" aria-hidden>
            <path
              d={`M 0 20 ${Array.from({ length: 40 }, (_, i) => {
                const x = i * 5;
                const y = 20 + Math.sin(i * 0.5 + elapsed * 0.3) * 8;
                return `L ${x} ${y}`;
              }).join(" ")}`}
              fill="none"
              stroke="hsl(193 40% 52%)"
              strokeWidth="1"
            />
          </svg>
        )}
        <p className="mt-6 text-sm text-muted capitalize">{mode}…</p>
        <button
          type="button"
          onClick={() => setPhase("reflect")}
          className="mt-8 min-h-11 text-sm text-foreground/60 underline-offset-2 hover:underline"
        >
          I&apos;m ready to reflect
        </button>
        {/* Screen-reader accessible time — not visually loud */}
        <p className="sr-only" aria-live="polite">
          {elapsed} of {durationSeconds} seconds elapsed
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {exitButton}
      <label htmlFor="quiet-reflection" className="env-type-serif mb-4 block text-xl">
        What became visible when you stopped searching?
      </label>
      <textarea
        id="quiet-reflection"
        value={observation}
        onChange={(e) => setObservation(e.target.value)}
        placeholder="Insect movement, reflection changes, sound layers, light shifts…"
        className="min-h-32 w-full rounded-xl border border-border bg-surface/60 p-4 text-foreground"
      />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!observation.trim()}
        className="mt-4 min-h-12 w-full rounded-lg bg-primary px-6 py-3 text-primary-foreground disabled:opacity-50"
      >
        Save observation
      </button>
    </div>
  );
}
