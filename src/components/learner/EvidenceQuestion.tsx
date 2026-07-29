import { cn } from "@/lib/utils";

type EvidenceQuestionProps = {
  question: string;
  className?: string;
  simulated?: boolean;
};

export function EvidenceQuestion({ question, className, simulated }: EvidenceQuestionProps) {
  return (
    <aside className={cn("evidence-question", className)} aria-live="polite">
      <p className="evidence-question__label text-[10px] uppercase tracking-[0.2em] text-foreground/50">
        One question
      </p>
      <p className="mt-2 font-serif text-base leading-relaxed text-foreground md:text-lg">{question}</p>
      {simulated && (
        <p className="mt-2 text-[10px] tracking-wide text-foreground/45">
          Deterministic adaptive follow-up · Simulated
        </p>
      )}
    </aside>
  );
}
