import type {
  DraftEncounterProposal,
  DraftJourneyProposal,
  EncounterTargetType,
} from "@/types/creator-beta";

export type ProposalEngineMode = "prototype-deterministic" | "live-ai";

export type JourneyProposalEngine = {
  mode: ProposalEngineMode;
  name: string;
  propose(seedText: string): Promise<DraftJourneyProposal>;
};

function makeId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now()}-${random}`;
}

function cleanSeed(seedText: string): string {
  return seedText.replace(/\s+/g, " ").trim();
}

function titleFromSeed(seedText: string): string {
  const seed = cleanSeed(seedText);
  const firstSentence = seed.split(/[.!?]/)[0]?.trim() || "Untitled Journey";
  const words = firstSentence.split(" ").filter(Boolean).slice(0, 7);
  const title = words.join(" ");
  return title.length > 4 ? title : "Untitled Journey";
}

function subjectFromSeed(seedText: string): string {
  const seed = cleanSeed(seedText);
  if (seed.length <= 120) return seed;
  return `${seed.slice(0, 117).trim()}…`;
}

function encounter(
  title: string,
  targetType: EncounterTargetType,
  targetLabel: string,
  learnerPrompt: string,
  learnerAction: string,
  evidencePrompt: string,
): DraftEncounterProposal {
  return {
    title,
    target: { type: targetType, label: targetLabel },
    learnerPrompt,
    learnerAction,
    evidenceRequest: {
      prompt: evidencePrompt,
      allowedCaptureKinds: ["text", "photo", "voice"],
    },
  };
}

export function createPrototypeJourneyProposal(seedText: string): DraftJourneyProposal {
  const seed = cleanSeed(seedText);
  const subject = subjectFromSeed(seed);

  return {
    id: makeId("proposal"),
    seedText: seed,
    suggestedTitle: titleFromSeed(seed),
    suggestedThread: {
      type: "question",
      statement: `What can a learner discover, test, or explain about: ${subject}?`,
    },
    suggestedLearnerContext: {
      description: "Curious learners; refine the audience before publishing.",
    },
    rationale:
      "This prototype scaffold starts with attention, moves into evidence-seeking investigation, and ends with synthesis/transfer. A live Creator AI should replace this scaffold while preserving the same typed proposal contract.",
    suggestedEncounters: [
      encounter(
        "Notice Before Explaining",
        "question",
        subject,
        "Before looking anything up, what do you notice, wonder, or think might be happening?",
        "Record three observations or questions without trying to produce a polished explanation yet.",
        "Capture specific observations or questions that can guide the investigation.",
      ),
      encounter(
        "Investigate the Pattern",
        "problem",
        subject,
        "What evidence would help you strengthen, challenge, or revise your first explanation?",
        "Find, compare, test, read, observe, or ask in a way that produces useful evidence.",
        "Capture the evidence you used and explain why it matters.",
      ),
      encounter(
        "Synthesize and Transfer",
        "question",
        subject,
        "What do you understand now that you did not understand at the beginning?",
        "Create a concise explanation and connect it to another place, problem, example, or future question.",
        "Capture the revised explanation plus one transfer connection or remaining question.",
      ),
    ],
    questionsForCreator: [
      "Who should this Journey serve?",
      "What should learners notice before receiving explanation?",
      "What would meaningful evidence look like?",
    ],
    provenance: {
      origin: "ai_generated",
      sourceRefs: [],
      version: "prototype-proposal-engine-v0.1",
    },
  };
}

export const prototypeJourneyProposalEngine: JourneyProposalEngine = {
  mode: "prototype-deterministic",
  name: "Prototype Creator proposal scaffold",
  async propose(seedText) {
    return createPrototypeJourneyProposal(seedText);
  },
};
