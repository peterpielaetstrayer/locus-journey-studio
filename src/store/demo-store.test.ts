import { describe, expect, it, beforeEach } from "vitest";
import { useDemoStore } from "./demo-store";

describe("demo store", () => {
  beforeEach(() => {
    useDemoStore.getState().resetDemo();
  });

  it("switches active role", () => {
    useDemoStore.getState().setActiveRole("orchestrator");
    expect(useDemoStore.getState().activeRole).toBe("orchestrator");
  });

  it("resets to initial state", () => {
    useDemoStore.getState().setActiveRole("reviewer");
    useDemoStore.getState().saveBaseline("test", 3);
    useDemoStore.getState().resetDemo();
    expect(useDemoStore.getState().activeRole).toBe("learner");
    expect(useDemoStore.getState().demoStarted).toBe(false);
  });

  it("saves field notes", () => {
    useDemoStore.getState().addFieldNote({
      learnerId: "learner-maya",
      journeyId: "journey-water-writes",
      stopId: "stop-water-fingerprints",
      captureType: "text",
      observation: "Dark soil near boardwalk",
      evidence: ["color", "moisture"],
      confidence: 3,
      mentorReviewed: false,
      visibility: "private",
    });
    expect(useDemoStore.getState().fieldNotes).toHaveLength(1);
  });

  it("persists mentor override via intervention", () => {
    const id = useDemoStore.getState().addIntervention({
      learnerId: "learner-maya",
      stopId: "stop-water-fingerprints",
      category: "deepen",
      recommendationSource: "mentor",
      reason: "Human judgment",
      message: "Compare wet and dry zones.",
      status: "recommended",
      overrideReason: "Learner ready for comparison",
    });
    useDemoStore.getState().deliverIntervention(id);
    const delivered = useDemoStore.getState().interventions.find((i) => i.id === id);
    expect(delivered?.status).toBe("delivered");
    expect(delivered?.overrideReason).toBe("Learner ready for comparison");
  });
});
