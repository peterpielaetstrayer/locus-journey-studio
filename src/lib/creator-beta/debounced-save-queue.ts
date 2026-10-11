/**
 * Coalesces rapid edits PER RECORD, never across different records.
 *
 * A failed write preserves its patch until an explicit retry or a later edit.
 * Writes for the same record run sequentially; a late response can never
 * overwrite a newer optimistic local edit.
 *
 * This queue improves navigation reliability but cannot promise that a
 * browser process killed mid-request completed a remote save.
 */
export type SaveQueuePhase = "queued" | "saving" | "saved" | "failed";

type SaveEntry<TPatch> = {
  pending: TPatch | null;
  timer: ReturnType<typeof setTimeout> | null;
  inFlight: Promise<void> | null;
  failed: boolean;
};

export class DebouncedSaveQueue<TPatch extends object> {
  private entries = new Map<string, SaveEntry<TPatch>>();

  constructor(
    private readonly write: (recordId: string, patch: TPatch) => Promise<void>,
    private readonly onState: (recordId: string, phase: SaveQueuePhase, error?: unknown) => void,
    private readonly delayMs = 600,
  ) {}

  private entry(id: string): SaveEntry<TPatch> {
    let entry = this.entries.get(id);
    if (!entry) {
      entry = { pending: null, timer: null, inFlight: null, failed: false };
      this.entries.set(id, entry);
    }
    return entry;
  }

  enqueue(recordId: string, patch: TPatch): void {
    const entry = this.entry(recordId);
    // The newest update to a field wins, without discarding changes to
    // other fields pending in the same debounce window.
    entry.pending = { ...(entry.pending ?? {}), ...patch } as TPatch;
    entry.failed = false;
    this.schedule(recordId);
    this.onState(recordId, "queued");
  }

  private schedule(recordId: string, delayMs = this.delayMs): void {
    const entry = this.entry(recordId);
    if (entry.timer !== null) clearTimeout(entry.timer);
    entry.timer = setTimeout(() => {
      entry.timer = null;
      void this.flush(recordId);
    }, delayMs);
  }

  async flush(recordId: string): Promise<void> {
    const entry = this.entries.get(recordId);
    if (!entry) return;
    if (entry.timer !== null) {
      clearTimeout(entry.timer);
      entry.timer = null;
    }
    if (entry.inFlight) {
      await entry.inFlight;
      if (!entry.failed && entry.pending) await this.flush(recordId);
      return;
    }
    if (entry.failed || !entry.pending) return;

    const patch = entry.pending;
    entry.pending = null;
    this.onState(recordId, "saving");

    const writing = Promise.resolve()
      .then(() => this.write(recordId, patch))
      .then(() => {
        this.onState(recordId, "saved");
      })
      .catch((error: unknown) => {
        // Keep edits made DURING the failing request. Never silently drop
        // the older failed patch or replace newer field values with it.
        entry.pending = { ...patch, ...(entry.pending ?? {}) } as TPatch;
        entry.failed = true;
        if (entry.timer !== null) {
          clearTimeout(entry.timer);
          entry.timer = null;
        }
        this.onState(recordId, "failed", error);
      })
      .finally(() => {
        entry.inFlight = null;
        if (entry.pending && !entry.failed && entry.timer === null) {
          this.schedule(recordId, 0);
        }
      });

    entry.inFlight = writing;
    await writing;
  }

  async flushAll(): Promise<void> {
    await Promise.all([...this.entries.keys()].map((id) => this.flush(id)));
  }

  retryFailed(): void {
    for (const [id, entry] of this.entries) {
      if (entry.failed && entry.pending) {
        entry.failed = false;
        this.schedule(id, 0);
        this.onState(id, "queued");
      }
    }
  }

  hasOutstanding(): boolean {
    return [...this.entries.values()].some(
      (entry) => entry.pending !== null || entry.inFlight !== null,
    );
  }

  hasFailed(): boolean {
    return [...this.entries.values()].some((entry) => entry.failed);
  }
}
