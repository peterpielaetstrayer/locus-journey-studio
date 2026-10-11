import { afterEach, describe, expect, it, vi } from "vitest";
import type { DraftJourneyProposal } from "@/types/creator-beta";

vi.mock("@/lib/creator-beta/persistence-client", () => ({
  getClientPersistenceMode: vi.fn(),
  createConnectedJourney: vi.fn(),
  fetchConnectedJourney: vi.fn(),
  saveConnectedJourney: vi.fn(),
  createConnectedEncounter: vi.fn(),
  saveConnectedEncounter: vi.fn(),
}));
vi.mock("@/store/creator-beta-store", () => ({
  useCreatorBetaStore: {
    getState: vi.fn(),
  },
}));

import { getClientPersistenceMode, createConnectedJourney } from "@/lib/creator-beta/persistence-client";
import { useCreatorBetaStore } from "@/store/creator-beta-store";
import { createJourneyWithPersistence } from "./useCreatorBetaSync";

const proposal = { id: "test-proposal" } as DraftJourneyProposal;

afterEach(() => vi.clearAllMocks());

describe("Creator Beta connected creation safeguards", () => {
  it("does not silently create a local draft when connected API fails", async () => {
    const createJourneyFromProposal = vi.fn(() => "unexpected-local");
    vi.mocked(useCreatorBetaStore.getState).mockReturnValue({
      createJourneyFromProposal,
    } as unknown as ReturnType<typeof useCreatorBetaStore.getState>);
    vi.mocked(getClientPersistenceMode).mockReturnValue("connected");
    vi.mocked(createConnectedJourney).mockRejectedValue(new Error("Network unavailable"));

    await expect(createJourneyWithPersistence(proposal)).rejects.toThrow("Network unavailable");
    expect(createJourneyFromProposal).not.toHaveBeenCalled();
  });

  it("rejects missing confirmation instead of claiming local persistence", async () => {
    const createJourneyFromProposal = vi.fn(() => "unexpected-local");
    vi.mocked(useCreatorBetaStore.getState).mockReturnValue({
      createJourneyFromProposal,
    } as unknown as ReturnType<typeof useCreatorBetaStore.getState>);
    vi.mocked(getClientPersistenceMode).mockReturnValue("connected");
    vi.mocked(createConnectedJourney).mockResolvedValue(null);

    await expect(createJourneyWithPersistence(proposal)).rejects.toThrow(
      "Connected Journey creation was not confirmed",
    );
    expect(createJourneyFromProposal).not.toHaveBeenCalled();
  });

  it("continues to permit intentional local demo drafts", async () => {
    const createJourneyFromProposal = vi.fn(() => "local-journey");
    vi.mocked(useCreatorBetaStore.getState).mockReturnValue({
      createJourneyFromProposal,
    } as unknown as ReturnType<typeof useCreatorBetaStore.getState>);
    vi.mocked(getClientPersistenceMode).mockReturnValue("local");

    await expect(createJourneyWithPersistence(proposal)).resolves.toEqual({
      journeyId: "local-journey",
      mode: "local",
    });
    expect(createJourneyFromProposal).toHaveBeenCalledWith(proposal);
  });
});
