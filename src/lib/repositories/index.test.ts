import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/config", () => ({
  isSupabaseConfigured: vi.fn(),
}));

import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  ConnectedRepositoryError,
  getConnectedRepositories,
  getDemoRepositories,
  getRepositories,
} from "@/lib/repositories";

describe("Creator Alpha legacy backend boundary", () => {
  it("keeps the First Landing legacy interface in explicitly simulated demo mode", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);
    expect(getDemoRepositories().mode).toBe("demo");
    expect((await getRepositories()).mode).toBe("demo");
  });

  it("does NOT activate legacy institutional storage when Supabase is configured", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);
    expect((await getRepositories()).mode).toBe("demo");
    await expect(getConnectedRepositories()).rejects.toThrow(
      "Institutional connected mode is disabled in Creator Alpha",
    );
  });

  it("denies legacy connected access even when no Supabase variables exist", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(false);
    await expect(getConnectedRepositories()).rejects.toBeInstanceOf(ConnectedRepositoryError);
  });
});
