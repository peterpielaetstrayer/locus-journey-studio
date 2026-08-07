import type { CreatorJourney, DraftJourneyProposal, Encounter } from "@/types/creator-beta";
import type { DataMode } from "./types";

export type CreatorBetaJourneySummary = {
  id: string;
  slug: string;
  title: string;
  status: CreatorJourney["status"];
  encounterCount: number;
  threadStatement: string;
  updatedAt?: string;
};

export type CreatorBetaJourneyRecord = {
  journey: CreatorJourney;
  encounters: Encounter[];
  slug: string;
  versionId: string;
  isEditable: boolean;
};

export type CreateCreatorBetaJourneyInput = {
  proposal: DraftJourneyProposal;
  creatorId?: string;
};

export type UpdateCreatorBetaJourneyInput = Partial<
  Pick<
    CreatorJourney,
    | "title"
    | "status"
    | "thread"
    | "learnerContext"
    | "description"
    | "locationLabel"
    | "durationMinutes"
    | "learningDomains"
    | "prerequisiteConcepts"
  >
>;

export type CreateCreatorBetaEncounterInput = {
  title?: string;
  targetLabel?: string;
  targetType?: Encounter["target"]["type"];
};

export interface CreatorBetaRepository {
  readonly mode: DataMode;
  listJourneys(): Promise<CreatorBetaJourneySummary[]>;
  getJourneyById(journeyId: string): Promise<CreatorBetaJourneyRecord | null>;
  createJourney(input: CreateCreatorBetaJourneyInput): Promise<CreatorBetaJourneyRecord>;
  updateJourney(
    journeyId: string,
    updates: UpdateCreatorBetaJourneyInput,
  ): Promise<CreatorBetaJourneyRecord>;
  listEncountersForJourney(journeyId: string): Promise<Encounter[]>;
  getEncounterById(encounterId: string): Promise<Encounter | null>;
  createEncounter(
    journeyId: string,
    input?: CreateCreatorBetaEncounterInput,
  ): Promise<Encounter>;
  updateEncounter(encounterId: string, updates: Partial<Encounter>): Promise<Encounter>;
}
