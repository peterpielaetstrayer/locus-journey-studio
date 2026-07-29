import { cn } from "@/lib/utils";

type TheoryFragmentProps = {
  theory: string;
  className?: string;
};

export function TheoryFragment({ theory, className }: TheoryFragmentProps) {
  return (
    <div
      className={cn("theory-fragment motion-theory-settle", className)}
      aria-live="polite"
      role="note"
      aria-label={`Your theory: ${theory}`}
    >
      <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/55">Your theory</p>
      <p className="mt-1 font-serif text-base italic leading-relaxed text-foreground/90 md:text-lg">
        {theory}
      </p>
    </div>
  );
}
