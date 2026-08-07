import { describe, expect, it } from "vitest";
import { createPrototypeJourneyProposal } from "./proposal-engine";

describe("Creator proposal engine boundary", () => {
  it("produces the same Journey proposal contract for a Tahoe creator seed", () => {
    const proposal = createPrototypeJourneyProposal(
      "I want to create a Tahoe journey about why the lake is so clear and how the watershed affects that clarity.",
    );

    expect(proposal.suggestedTitle.toLowerCase()).toContain("tahoe");
    expect(proposal.suggestedThread.type).toBe("question");
    expect(proposal.suggestedEncounters).toHaveLength(3);
    expect(proposal.suggestedEncounters[0].learnerPrompt).toContain("notice");
    expect(proposal.suggestedEncounters.every((encounter) => Boolean(encounter.evidenceRequest.prompt))).toBe(true);
    expect(proposal.provenance.origin).toBe("ai_generated");
  });

  it("does not require First Landing-specific identifiers or stop assumptions", () => {
    const proposal = createPrototypeJourneyProposal(
      "Help me turn an existing history lesson into a journey about competing accounts of one event.",
    );

    const serialized = JSON.stringify(proposal).toLowerCase();
    expect(serialized).not.toContain("water-writes-the-landscape");
    expect(serialized).not.toContain("cypress");
    expect(serialized).not.toContain("first landing");
    expect(proposal.suggestedEncounters.map((encounter) => encounter.title)).toEqual([
      "Notice Before Explaining",
      "Investigate the Pattern",
      "Synthesize and Transfer",
    ]);
  });
});
