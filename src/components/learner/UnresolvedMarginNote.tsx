import { cn } from "@/lib/utils";

type UnresolvedMarginNoteProps = {
  question: string;
  className?: string;
};

export function UnresolvedMarginNote({ question, className }: UnresolvedMarginNoteProps) {
  return (
    <aside className={cn("atlas-margin-note", className)}>
      <p className="text-[10px] uppercase tracking-[0.2em] text-[hsl(var(--quiet-amber))]">Unresolved</p>
      <p className="mt-1 font-serif text-sm leading-relaxed">{question}</p>
    </aside>
  );
}
