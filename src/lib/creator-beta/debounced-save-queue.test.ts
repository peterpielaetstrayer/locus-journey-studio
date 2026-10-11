import { afterEach, describe, expect, it, vi } from "vitest";
import { DebouncedSaveQueue } from "./debounced-save-queue";

type Patch = { title?: string; description?: string };

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("creator connected-save queue", () => {
  it("does not cancel a Journey save when an Encounter is edited", async () => {
    vi.useFakeTimers();
    const writes: Array<[string, Patch]> = [];
    const send = vi.fn(async (key: string, patch: Patch) => {
      writes.push([key, patch]);
    });
    const queue = new DebouncedSaveQueue<Patch>(send, () => {}, 600);
    queue.enqueue("journey", { title: "Water" });
    queue.enqueue("encounter-1", { title: "Observation" });
    await vi.advanceTimersByTimeAsync(601);
    expect(writes).toEqual([
      ["journey", { title: "Water" }],
      ["encounter-1", { title: "Observation" }],
    ]);
    expect(queue.hasOutstanding()).toBe(false);
  });

  it("coalesces different fields without losing the latest value", async () => {
    const send = vi.fn(async (_key: string, _patch: Patch) => {});
    const queue = new DebouncedSaveQueue<Patch>(send, () => {});
    queue.enqueue("j", { title: "W" });
    queue.enqueue("j", { title: "Water" });
    queue.enqueue("j", { description: "How water works" });
    await queue.flush("j");
    expect(send).toHaveBeenCalledTimes(1);
    expect(send).toHaveBeenCalledWith("j", {
      title: "Water",
      description: "How water works",
    });
  });

  it("serializes writes on one record even when an earlier request is slow", async () => {
    let releaseFirst: (() => void) | undefined;
    const held = new Promise<void>((resolve) => { releaseFirst = resolve; });
    const order: string[] = [];
    const send = vi.fn(async (_key: string, patch: Patch) => {
      order.push(patch.title ?? "");
      if (patch.title === "first") await held;
    });
    const queue = new DebouncedSaveQueue<Patch>(send, () => {});
    queue.enqueue("same", { title: "first" });
    const first = queue.flush("same");
    await Promise.resolve();
    await Promise.resolve();
    queue.enqueue("same", { title: "second" });
    const second = queue.flush("same");
    expect(order).toEqual(["first"]);
    releaseFirst?.();
    await Promise.all([first, second]);
    expect(order).toEqual(["first", "second"]);
  });

  it("retains failed writes and retries them with an explicit action", async () => {
    vi.useFakeTimers();
    const send = vi.fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(undefined);
    const phases: string[] = [];
    const queue = new DebouncedSaveQueue<Patch>(
      send,
      (_id, phase) => phases.push(phase),
    );
    queue.enqueue("j", { title: "Retain me" });
    await queue.flush("j");
    expect(queue.hasFailed()).toBe(true);
    expect(queue.hasOutstanding()).toBe(true);
    expect(send).toHaveBeenCalledTimes(1);

    queue.retryFailed();
    await vi.runAllTimersAsync();
    expect(send).toHaveBeenCalledTimes(2);
    expect(send).toHaveBeenLastCalledWith("j", { title: "Retain me" });
    expect(queue.hasFailed()).toBe(false);
    expect(queue.hasOutstanding()).toBe(false);
    expect(phases).toContain("failed");
    expect(phases).toContain("saved");
  });

  it("preserves newer edits over a failed older patch", async () => {
    const send = vi.fn().mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(undefined);
    const queue = new DebouncedSaveQueue<Patch>(send, () => {});
    queue.enqueue("e", { title: "old", description: "first" });
    await queue.flush("e");
    queue.enqueue("e", { title: "new" });
    await queue.flush("e");
    expect(send).toHaveBeenLastCalledWith("e", {
      title: "new",
      description: "first",
    });
  });

  it("flushes changes on navigation before the debounce expires", async () => {
    const send = vi.fn(async (_key: string, _patch: Patch) => {});
    const queue = new DebouncedSaveQueue<Patch>(send, () => {}, 600);
    queue.enqueue("one", { title: "a" });
    queue.enqueue("two", { title: "b" });
    await queue.flushAll();
    expect(send).toHaveBeenCalledTimes(2);
    expect(queue.hasOutstanding()).toBe(false);
  });
});
