import type {
  CreatorBetaJourneyStatus,
  CreatorCaptureKind,
  CreatorJourney,
  Encounter,
  EncounterTargetType,
  EvidenceRequest,
  JourneyThreadType,
  Provenance,
  SourceReference,
} from "@/types/creator-beta";

/** Creator Beta metadata stored in journey_versions.artifact_template */
export type CreatorBetaVersionMeta = {
  creatorBetaVersion: "0.2";
  threadType: JourneyThreadType;
  creatorIds: string[];
  sourceContext: SourceReference[];
  provenance: Provenance;
};

/** Creator Beta metadata stored in journey_stops.evidence_requirements */
export type CreatorBetaStopMeta = {
  creatorBetaVersion: "0.2";
  targetType: EncounterTargetType;
  targetLocation?: { latitude: number; longitude: number; altitudeMeters?: number };
  evidenceRequest: EvidenceRequest;
  provenance: Provenance;
  creatorIntent?: string;
  resources?: SourceReference[];
  scaffolds?: string[];
};

export type DbJourneyRow = {
  id: string;
  slug: string;
  title: string;
  region: string;
  location: string;
};

export type DbVersionRow = {
  id: string;
  journey_id: string;
  status: string;
  central_question: string;
  subtitle: string;
  description: string;
  audience: string;
  duration_minutes: number;
  learning_domains: string[];
  prerequisite_concepts: string[];
  artifact_template: unknown;
};

export type DbStopRow = {
  id: string;
  journey_version_id: string;
  position: number;
  slug: string;
  title: string;
  location_label: string;
  purpose: string;
  central_concept: string;
  learning_objective: string;
  opening_prompt: string;
  field_action: string;
  evidence_requirements: unknown;
  safety_notes: string[];
  accessibility_alternatives: string[];
  artifact_contribution: string | null;
  resurfacing_connection: string | null;
  is_optional: boolean;
};

const DEFAULT_CAPTURE_KINDS: CreatorCaptureKind[] = ["text", "photo", "voice"];

export function defaultProvenance(createdById?: string): Provenance {
  return {
    origin: "creator",
    createdById,
    sourceRefs: [],
    version: "creator-beta-v0.2",
  };
}

export function mapCreatorStatusToDb(status: CreatorBetaJourneyStatus): string {
  const map: Record<CreatorBetaJourneyStatus, string> = {
    concept: "concept",
    draft: "draft",
    test: "field_test",
    published: "published",
    archived: "archived",
  };
  return map[status] ?? "draft";
}

export function mapDbStatusToCreatorStatus(status: string): CreatorBetaJourneyStatus {
  const map: Record<string, CreatorBetaJourneyStatus> = {
    concept: "concept",
    draft: "draft",
    field_test: "test",
    private_adult_walk: "test",
    learner_pilot: "test",
    published: "published",
    archived: "archived",
  };
  return map[status] ?? "draft";
}

function parseVersionMeta(raw: unknown): CreatorBetaVersionMeta | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (obj.creatorBetaVersion !== "0.2") return null;
  return raw as CreatorBetaVersionMeta;
}

function parseStopMeta(raw: unknown): CreatorBetaStopMeta | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (obj.creatorBetaVersion !== "0.2") return null;
  return raw as CreatorBetaStopMeta;
}

function defaultEvidenceRequest(learningObjective: string): EvidenceRequest {
  return {
    prompt:
      learningObjective ||
      "Capture what you noticed, did, or concluded during this encounter.",
    allowedCaptureKinds: DEFAULT_CAPTURE_KINDS,
  };
}

function inferTargetType(row: DbStopRow, meta: CreatorBetaStopMeta | null): EncounterTargetType {
  if (meta?.targetType) return meta.targetType;
  if (row.central_concept && row.central_concept !== "Observation") {
    return "phenomenon";
  }
  return row.location_label ? "place" : "other";
}

export function stopRowToEncounter(journeyId: string, row: DbStopRow): Encounter {
  const meta = parseStopMeta(row.evidence_requirements);
  const targetType = inferTargetType(row, meta);

  return {
    id: row.id,
    journeyId,
    order: row.position,
    title: row.title,
    target: {
      type: targetType,
      label: row.location_label,
      location: meta?.targetLocation,
    },
    creatorIntent: meta?.creatorIntent ?? row.purpose,
    learnerPrompt: row.opening_prompt,
    learnerAction: row.field_action,
    evidenceRequest: meta?.evidenceRequest ?? defaultEvidenceRequest(row.learning_objective),
    provenance: meta?.provenance ?? defaultProvenance(),
    resources: meta?.resources,
    scaffolds: meta?.scaffolds,
    safetyNotes: [...row.safety_notes],
    accessibilityAlternatives: [...row.accessibility_alternatives],
    artifactContribution: row.artifact_contribution ?? undefined,
    resurfacingConnection: row.resurfacing_connection ?? undefined,
    optional: row.is_optional,
  };
}

export function versionRowsToCreatorJourney(
  journey: DbJourneyRow,
  version: DbVersionRow,
  encounterIds: string[],
  creatorId?: string,
): CreatorJourney {
  const meta = parseVersionMeta(version.artifact_template);

  return {
    id: journey.id,
    title: journey.title,
    creatorIds: meta?.creatorIds ?? (creatorId ? [creatorId] : []),
    status: mapDbStatusToCreatorStatus(version.status),
    thread: {
      type: meta?.threadType ?? "question",
      statement: version.central_question,
    },
    learnerContext: {
      description: version.audience,
    },
    encounterIds,
    sourceContext: meta?.sourceContext ?? [],
    provenance: meta?.provenance ?? defaultProvenance(creatorId),
    description: version.description,
    locationLabel: journey.location,
    durationMinutes: version.duration_minutes,
    learningDomains: [...version.learning_domains],
    prerequisiteConcepts: [...version.prerequisite_concepts],
  };
}

export function buildVersionMeta(
  journey: CreatorJourney,
  existing?: CreatorBetaVersionMeta | null,
): CreatorBetaVersionMeta {
  return {
    creatorBetaVersion: "0.2",
    threadType: journey.thread.type,
    creatorIds: journey.creatorIds,
    sourceContext: journey.sourceContext,
    provenance: journey.provenance,
    ...(existing?.creatorBetaVersion ? {} : {}),
  };
}

export function buildStopMeta(encounter: Encounter, existing?: CreatorBetaStopMeta | null): CreatorBetaStopMeta {
  return {
    creatorBetaVersion: "0.2",
    targetType: encounter.target.type,
    targetLocation: encounter.target.location,
    evidenceRequest: encounter.evidenceRequest,
    provenance: encounter.provenance,
    creatorIntent: encounter.creatorIntent,
    resources: encounter.resources,
    scaffolds: encounter.scaffolds,
    ...(existing?.creatorBetaVersion ? {} : {}),
  };
}

export function encounterToStopInsert(
  versionId: string,
  encounter: Encounter,
  slug?: string,
): {
  journey_version_id: string;
  position: number;
  slug: string;
  title: string;
  location_label: string;
  purpose: string;
  central_concept: string;
  learning_objective: string;
  opening_prompt: string;
  field_action: string;
  evidence_requirements: CreatorBetaStopMeta;
  safety_notes: string[];
  accessibility_alternatives: string[];
  artifact_contribution: string | null;
  resurfacing_connection: string | null;
  is_optional: boolean;
  is_hidden_until_unlocked: boolean;
} {
  const stopSlug =
    slug ??
    (encounter.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || `encounter-${encounter.order}`);

  return {
    journey_version_id: versionId,
    position: encounter.order,
    slug: stopSlug,
    title: encounter.title,
    location_label: encounter.target.label,
    purpose: encounter.creatorIntent ?? encounter.title,
    central_concept: encounter.target.type,
    learning_objective: encounter.evidenceRequest.prompt,
    opening_prompt: encounter.learnerPrompt,
    field_action: encounter.learnerAction,
    evidence_requirements: buildStopMeta(encounter),
    safety_notes: encounter.safetyNotes ?? [],
    accessibility_alternatives: encounter.accessibilityAlternatives ?? [],
    artifact_contribution: encounter.artifactContribution ?? null,
    resurfacing_connection: encounter.resurfacingConnection ?? null,
    is_optional: encounter.optional ?? false,
    is_hidden_until_unlocked: false,
  };
}

export function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return base || "journey";
}
