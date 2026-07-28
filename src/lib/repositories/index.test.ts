import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/config", () => ({
  isSupabaseConfigured: vi.fn(),
}));

vi.mock("@/lib/repositories/supabase", () => ({
  createSupabaseRepositories: vi.fn(async () => ({
    mode: "connected" as const,
    journeys: {},
    fieldNotes: {},
    interventions: {},
    artifacts: {},
    reviews: {},
  })),
}));

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseRepositories } from "@/lib/repositories/supabase";
import {
  ConnectedRepositoryError,
  getConnectedRepositories,
  getDemoRepositories,
  getRepositories,
} from "@/lib/repositories";

describe("repository adapter selection", () => {
  it("demo adapter reports demo mode", () => {
    const repos = getDemoRepositories();
    expect(repos.mode).toBe("demo");
  });

  it("getRepositories uses demo when Supabase not configured", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);
    const repos = await getRepositories();
    expect(repos.mode).toBe("demo");
  });

  it("getConnectedRepositories throws when Supabase not configured", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);
    await expect(getConnectedRepositories()).rejects.toBeInstanceOf(ConnectedRepositoryError);
  });

  it("getRepositories uses connected when configured", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    const repos = await getRepositories();
    expect(repos.mode).toBe("connected");
    expect(createSupabaseRepositories).toHaveBeenCalled();
  });
});
