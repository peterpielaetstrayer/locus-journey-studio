type ModeIndicatorProps = {
  configured: boolean;
  connected: boolean;
};

export function ModeIndicator({ configured, connected }: ModeIndicatorProps) {
  if (!configured) {
    return (
      <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs text-accent">
        Demo Mode
      </span>
    );
  }

  return (
    <span
      className={
        connected
          ? "rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary"
          : "rounded-full border border-border px-3 py-1 text-xs text-muted"
      }
    >
      {connected ? "Connected Mode" : "Demo Mode · Supabase available"}
    </span>
  );
}
