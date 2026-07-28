import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type EnterLandscapeActionProps = {
  className?: string;
  animate?: boolean;
};

export function EnterLandscapeAction({ className, animate }: EnterLandscapeActionProps) {
  return (
    <Link
      href="/learner"
      className={cn(
        "enter-landscape__action group inline-flex min-h-11 items-center justify-between gap-6",
        "border-y border-[hsl(var(--entrance-rule))] bg-[hsl(var(--env-black)/0.35)] px-6 py-4",
        "text-[hsl(var(--field-note-paper))] backdrop-blur-[2px]",
        "transition-colors hover:bg-[hsl(var(--env-black)/0.5)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--quiet-amber))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--env-black))]",
        animate && "enter-landscape-animate-cta",
        className,
      )}
    >
      <span className="text-sm font-medium uppercase tracking-[0.18em] md:text-base">
        Enter the landscape
      </span>
      <ArrowRight
        className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}
