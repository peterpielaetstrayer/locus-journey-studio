import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ExpeditionActionProps = {
  href?: string;
  label: string;
  className?: string;
  animate?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export function ExpeditionAction({
  href,
  label,
  className,
  animate,
  disabled,
  onClick,
}: ExpeditionActionProps) {
  const classes = cn(
    "enter-landscape__action group inline-flex min-h-11 items-center justify-between gap-6",
    "border-y border-[hsl(var(--entrance-rule))] bg-[hsl(var(--env-black)/0.35)] px-6 py-4",
    "text-[hsl(var(--field-note-paper))] backdrop-blur-[2px]",
    "transition-colors hover:bg-[hsl(var(--env-black)/0.5)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--quiet-amber))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--env-black))]",
    animate && "enter-landscape-animate-cta",
    disabled && "pointer-events-none opacity-50",
    className,
  );

  const content = (
    <>
      <span className="text-sm font-medium uppercase tracking-[0.18em] md:text-base">{label}</span>
      <ArrowRight
        className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} disabled={disabled} onClick={onClick}>
      {content}
    </button>
  );
}
