import { createPrototypeJourneyProposal } from "./proposal-engine";
import type { DraftJourneyProposal } from "@/types/creator-beta";

export type CreatorFieldObservation = {
  id: string;
  text: string;
  createdAt: string;
};

export type CreatorFieldSession = {
  version: 1;
  id: string;
  placeLabel: string;
  observations: CreatorFieldObservation[];
  createdAt: string;
  updatedAt: string;
  createdJourneyId?: string;
};

export const CREATOR_FIELD_KEY = "locus:creator:field-session:v1";
export const MAX_FIELD_NOTES = 30;
export const MAX_OBSERVATION_LENGTH = 1500;

export function newCreatorFieldSession(placeLabel = ""): CreatorFieldSession {
  const now = new Date().toISOString();
  return {
    version: 1,
    id: crypto.randomUUID(),
    placeLabel: placeLabel.trim().slice(0, 120),
    observations: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function appendCreatorObservation(
  session: CreatorFieldSession,
  raw: string,
  id: string = crypto.randomUUID(),
  now: string = new Date().toISOString(),
): CreatorFieldSession {
  const text = raw.trim();
  if (!text || text.length > MAX_OBSERVATION_LENGTH) {
    throw new Error("Write an observation between 1 and 1,500 characters.");
  }
  if (session.observations.length >= MAX_FIELD_NOTES) {
    throw new Error("This session is full. Export it before recording more observations.");
  }
  return {
    ...session,
    observations: [...session.observations, { id, text, createdAt: now }],
    updatedAt: now,
  };
}

export function isCreatorFieldSession(value: unknown): value is CreatorFieldSession {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const session = value as Partial<CreatorFieldSession>;
  return session.version === 1 &&
    typeof session.id === "string" &&
    typeof session.placeLabel === "string" &&
    typeof session.createdAt === "string" &&
    typeof session.updatedAt === "string" &&
    Array.isArray(session.observations) &&
    session.observations.length <= MAX_FIELD_NOTES &&
    session.observations.every((note) =>
      note && typeof note.id === "string" &&
      typeof note.text === "string" && note.text.length <= MAX_OBSERVATION_LENGTH &&
      typeof note.createdAt === "string"
    ) &&
    (session.createdJourneyId === undefined || typeof session.createdJourneyId === "string");
}

/** Honest prototype scaffold, NOT a live AI suggestion or a researched site fact. */
export function observationToJourneyProposal(
  session: CreatorFieldSession,
  observationId: string,
): DraftJourneyProposal {
  const note = session.observations.find((item) => item.id === observationId);
  if (!note) throw new Error("The observation is no longer in this session.");
  const place = session.placeLabel.trim() || "this place";
  const proposal = createPrototypeJourneyProposal(note.text);
  return {
    ...proposal,
    id: `field-${session.id}-${note.id}`,
    seedText: note.text,
    suggestedTitle: `Investigating ${place}`.slice(0, 100),
    suggestedThread: {
      type: "question",
      statement: `What can we discover and test about this observation at ${place}?`,
    },
    suggestedLearnerContext: { description: "Adult field prototype; creator to refine audience." },
    rationale: "Deterministic learning-design scaffold based on your observation. It has not interpreted a photo, researched this location, or used an AI model. Review the question, activity, evidence, safety and accuracy.",
    suggestedEncounters: [{
      title: "Notice, compare, explain",
      target: { type: "phenomenon", label: note.text.slice(0, 160) },
      learnerPrompt: "What can you directly observe here, before consulting an explanation?",
      learnerAction: "Record one observation, compare it with another example or location, and investigate what might explain a difference.",
      evidenceRequest: {
        prompt: "Record the observation, comparison, a tentative explanation and one unanswered question.",
        allowedCaptureKinds: ["text"],
      },
    }],
    questionsForCreator: [
      "Is the comparison safe and accessible for your learner?",
      "What sources or field evidence could verify the explanation?",
    ],
    provenance: {
      origin: "creator",
      sourceRefs: [{ type: "capture", id: note.id }],
      version: "creator-field-scaffold-v0.1",
    },
  };
}
