import { cn } from "@/lib/utils";

type LocationStampProps = {
  location?: string;
  time?: string;
  className?: string;
};

export function LocationStamp({ location, time, className }: LocationStampProps) {
  if (!location && !time) return null;

  return (
    <p
      className={cn(
        "text-xs font-medium uppercase tracking-[0.2em] text-foreground/70",
        className,
      )}
    >
      {location}
      {location && time && (
        <span className="mx-2 text-foreground/40" aria-hidden>
          ·
        </span>
      )}
      {time}
    </p>
  );
}
