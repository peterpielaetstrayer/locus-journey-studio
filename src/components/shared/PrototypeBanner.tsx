type PrototypeBannerProps = {
  compact?: boolean;
};

export function PrototypeBanner({ compact }: PrototypeBannerProps) {
  if (compact) {
    return (
      <aside
        role="status"
        className="fixed left-0 right-0 top-0 z-50 border-b border-border/30 bg-env-black/80 px-3 py-1 text-center text-[10px] text-muted backdrop-blur-sm"
      >
        Field-Test Draft · Prototype · Simulated AI
      </aside>
    );
  }

  return (
    <aside
      role="status"
      className="border-b border-border bg-surface px-4 py-2 text-center text-xs text-muted"
    >
      <strong className="text-accent">Prototype</strong> — Field-Test Draft. Not
      approved for public youth programs. Simulated AI and mock analytics.
      LOCUS does not replace park rules, permits, trained supervision, or
      emergency judgment.
    </aside>
  );
}
