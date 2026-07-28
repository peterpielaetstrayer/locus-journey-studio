import type {
  AdaptiveBranch,
  Artifact,
  FieldNote,
  Journey,
  JourneyStop,
  MentorIntervention,
  ReviewStatus,
} from "@/types";

export type DataMode = "demo" | "connected";

export type JourneyDraft = {
  journey: Journey;
  stops: JourneyStop[];
  branches: AdaptiveBranch[];
  versionId?: string;
  versionLabel?: string;
  savedAt?: string;
  isEditable: boolean;
};

export type JourneyVersionSummary = {
  id: string;
  versionLabel: string;
  status: string;
  createdAt: string;
};

export type AuditEvent = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  actorName?: string;
};

export interface JourneyRepository {
  readonly mode: DataMode;
  getCanonicalDraft(journeySlug: string): Promise<JourneyDraft | null>;
  saveDraft(draft: JourneyDraft): Promise<JourneyDraft>;
  createDraftVersion(
    journeySlug: string,
    supersedesVersionId?: string,
  ): Promise<JourneyDraft>;
  listVersions(journeySlug: string): Promise<JourneyVersionSummary[]>;
  restoreCanonicalDraft(journeySlug: string): Promise<JourneyDraft | null>;
  listAuditEvents(journeyVersionId: string): Promise<AuditEvent[]>;
}

export type CreateFieldNoteInput = Omit<FieldNote, "id" | "createdAt"> & {
  enrollmentId?: string;
  mediaFile?: File;
  altText?: string;
};

export interface FieldNotesRepository {
  readonly mode: DataMode;
  listForLearner(learnerId: string): Promise<FieldNote[]>;
  create(input: CreateFieldNoteInput): Promise<FieldNote>;
}

export type CreateInterventionInput = Omit<MentorIntervention, "id"> & {
  enrollmentId?: string;
};

export interface InterventionsRepository {
  readonly mode: DataMode;
  listForLearner(learnerId: string): Promise<MentorIntervention[]>;
  create(input: CreateInterventionInput): Promise<MentorIntervention>;
  update(id: string, updates: Partial<MentorIntervention>): Promise<MentorIntervention>;
  deliver(id: string): Promise<MentorIntervention>;
}

export interface ArtifactsRepository {
  readonly mode: DataMode;
  getForLearner(learnerId: string): Promise<Artifact | null>;
  save(artifact: Omit<Artifact, "id"> & { enrollmentId?: string }): Promise<Artifact>;
}

export type ReviewRecord = {
  id: string;
  category: keyof ReviewStatus | "sources" | "maintenance";
  status: string;
  notes: string;
  updatedAt: string;
};

export interface ReviewsRepository {
  readonly mode: DataMode;
  listForJourneyVersion(versionId: string): Promise<ReviewRecord[]>;
  upsert(review: Omit<ReviewRecord, "id" | "updatedAt"> & { versionId: string }): Promise<ReviewRecord>;
}

export interface RepositoryBundle {
  mode: DataMode;
  journeys: JourneyRepository;
  fieldNotes: FieldNotesRepository;
  interventions: InterventionsRepository;
  artifacts: ArtifactsRepository;
  reviews: ReviewsRepository;
}
