"use client";

import { cn } from "@/lib/utils";
import type { FieldNote } from "@/types";
import { formatConfidence } from "@/lib/utils";

type FieldNoteFragmentProps = {
  note: Pick<
    FieldNote,
    "observation" | "inference" | "confidence" | "createdAt" | "captureType"
  >;
  className?: string;
  pinned?: boolean;
};

export function FieldNoteFragment({ note, className, pinned }: FieldNoteFragmentProps) {
  const date = note.createdAt
    ? new Date(note.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : null;

  return (
    <article
      className={cn(
        "field-note-surface relative rounded-sm p-4 font-serif motion-evidence-pin",
        pinned && "rotate-[-0.5deg]",
        className,
      )}
    >
      {pinned && (
        <div
          className="absolute -top-2 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-muted/40"
          aria-hidden
        />
      )}
      <p className="mb-2 text-sm leading-relaxed">{note.observation}</p>
      {note.inference && (
        <p className="mb-2 text-xs italic opacity-80">{note.inference}</p>
      )}
      <footer className="flex items-center justify-between text-xs opacity-60">
        <span>{formatConfidence(note.confidence)}</span>
        {date && <time>{date}</time>}
      </footer>
    </article>
  );
}
