export type Id = string;
export type ISODateTime = string;

export type JourneyThreadType =
  | "question"
  | "problem"
  | "purpose"
  | "capability"
  | "transformation";

export type CreatorBetaJourneyStatus =
  | "concept"
  | "draft"
  | "test"
  | "published"
  | "archived";

export type ProvenanceOrigin =
  | "creator"
  | "imported"
  | "ai_generated"
  | "ai_inferred"
  | "learner";

export type SourceReferenceType =
  | "document"
  | "journey"
  | "encounter"
  | "capture"
  | "url"
  | "other";

export type SourceReference = {
  type: SourceReferenceType;
  id: Id;
  locator?: string;
};

export type Provenance = {
  origin: ProvenanceOrigin;
  createdById?: Id;
  sourceRefs: SourceReference[];
  adaptedFrom?: SourceReference;
  version: string;
};

export type JourneyThread = {
  type: JourneyThreadType;
  statement: string;
};

export type LearnerContext = {
  description: string;
};

export type CreatorJourney = {
  id: Id;
  title: string;
  creatorIds: Id[];
  status: CreatorBetaJourneyStatus;
  thread: JourneyThread;
  learnerContext: LearnerContext;
  encounterIds: Id[];
  sourceContext: SourceReference[];
  provenance: Provenance;

  description?: string;
  locationLabel?: string;
  durationMinutes?: number;
  desiredOutcome?: string;
  finalArtifactDescription?: string;
  learningDomains?: string[];
  prerequisiteConcepts?: string[];
};

export type GeoPoint = {
  latitude: number;
  longitude: number;
  altitudeMeters?: number;
};

export type EncounterTargetType =
  | "place"
  | "phenomenon"
  | "object"
  | "resource"
  | "person"
  | "problem"
  | "question"
  | "simulation"
  | "artifact"
  | "other";

export type EncounterTarget = {
  type: EncounterTargetType;
  label: string;
  location?: GeoPoint;
};

export type CreatorCaptureKind =
  | "text"
  | "photo"
  | "voice"
  | "video"
  | "sketch"
  | "choice";

export type EvidenceRequest = {
  prompt: string;
  allowedCaptureKinds: CreatorCaptureKind[];
};

export type Encounter = {
  id: Id;
  journeyId: Id;
  order: number;
  title: string;
  target: EncounterTarget;
  learnerPrompt: string;
  learnerAction: string;
  evidenceRequest: EvidenceRequest;
  provenance: Provenance;

  creatorIntent?: string;
  resources?: SourceReference[];
  scaffolds?: string[];
  safetyNotes?: string[];
  accessibilityAlternatives?: string[];
  artifactContribution?: string;
  resurfacingConnection?: string;
  optional?: boolean;
};

export type LearnerCapture = {
  id: Id;
  learnerId: Id;
  journeyId?: Id;
  encounterId?: Id;
  kind: CreatorCaptureKind;
  content?: string;
  mediaRef?: string;
  createdAt: ISODateTime;
  provenance: Provenance;
};

export type EvidenceKind =
  | "observation"
  | "explanation"
  | "retrieval"
  | "practice"
  | "comparison"
  | "artifact"
  | "action"
  | "mentor_feedback";

export type Evidence = {
  id: Id;
  learnerId: Id;
  journeyId: Id;
  encounterId?: Id;
  kind: EvidenceKind;
  supportingCaptureIds: Id[];
  claim?: string;
  confidence?: number;
  createdAt: ISODateTime;
  provenance: Provenance;
};

export type DraftEncounterProposal = Pick<
  Encounter,
  "title" | "target" | "learnerPrompt" | "learnerAction" | "evidenceRequest"
>;

export type DraftJourneyProposal = {
  id: Id;
  seedText: string;
  suggestedTitle: string;
  suggestedThread: JourneyThread;
  suggestedLearnerContext: LearnerContext;
  rationale: string;
  suggestedEncounters: DraftEncounterProposal[];
  questionsForCreator: string[];
  provenance: Provenance;
};

export type JourneyManifestV01 = {
  manifestVersion: "0.1";
  journey: CreatorJourney;
  encounters: Encounter[];
  generatedAt: ISODateTime;
};
