import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/config", () => ({
  isSupabaseConfigured: vi.fn(),
}));

import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  fetchConnectedJourney,
  fetchConnectedJourneys,
  getClientPersistenceMode,
} from "./persistence-client";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("Creator Alpha connected reads fail visibly instead of becoming local", () => {
  it("uses local mode only when Supabase is intentionally not configured", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);
    expect(getClientPersistenceMode()).toBe("local");
    expect(await fetchConnectedJourneys()).toEqual({ journeys: [], mode: "local" });
  });

  it("does not translate an unauthorized connected request into an empty local library", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: false,
      status: 401,
      json: async () => ({ error: "Unauthorized" }),
    })));
    await expect(fetchConnectedJourneys()).rejects.toThrow("Unauthorized");
    expect(getClientPersistenceMode()).toBe("connected");
  });

  it("reports a failed connected Journey fetch instead of claiming it was not saved", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: false,
      status: 503,
      json: async () => ({ error: "Database temporarily unavailable" }),
    })));
    await expect(fetchConnectedJourney("example")).rejects.toThrow(
      "Database temporarily unavailable",
    );
  });

  it("reads a successful connected library without a local fallback", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    vi.stubGlobal("fetch", vi.fn(async () => ({
      ok: true,
      json: async () => ({ journeys: [], mode: "connected" }),
    })));
    await expect(fetchConnectedJourneys()).resolves.toEqual({
      journeys: [],
      mode: "connected",
    });
  });
});
