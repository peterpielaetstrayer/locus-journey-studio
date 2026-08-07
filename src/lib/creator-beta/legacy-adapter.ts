import type { FieldNote, Journey, JourneyStop } from "@/types";
import type {
  CreatorBetaJourneyStatus,
  CreatorCaptureKind,
  CreatorJourney,
  Encounter,
  Evidence,
  JourneyManifestV01,
  LearnerCapture,
  Provenance,
} from "@/types/creator-beta";

const LEGACY_VERSION = "journey-studio-v0.1";

function legacyJourneyStatus(status: Journey["status"]): CreatorBetaJourneyStatus {
  switch (status) {
    case "concept":
      return "concept";
    case "published":
      return "published";
    case "archived":
      return "archived";
    case "draft":
      return "draft";
    case "field-test":
    case "private-adult-walk":
    case "learner-pilot":
      return "test";
  }
}

function legacyJourneyProvenance(journey: Journey): Provenance {
  return {
    origin: "imported",
    createdById: journey.creatorIds[0],
    sourceRefs: [{ type: "journey", id: journey.id }],
    version: LEGACY_VERSION,
  };
}

function legacyEncounterProvenance(stop: JourneyStop): Provenance {
  return {
    origin: "imported",
    sourceRefs: [
      { type: "journey", id: stop.journeyId },
      { type: "encounter", id: stop.id },
    ],
    version: LEGACY_VERSION,
  };
}

export function legacyJourneyToCreatorJourney(journey: Journey): CreatorJourney {
  return {
    id: journey.id,
    title: journey.title,
    creatorIds: journey.creatorIds,
    status: legacyJourneyStatus(journey.status),
    thread: {
      type: "question",
      statement: journey.centralQuestion,
    },
    learnerContext: {
      description: journey.audience,
    },
    encounterIds: [...journey.stopIds],
    sourceContext: [{ type: "journey", id: journey.id }],
    provenance: legacyJourneyProvenance(journey),
    description: journey.description,
    locationLabel: journey.location,
    durationMinutes: journey.durationMinutes,
    finalArtifactDescription: journey.artifactTemplateId,
    learningDomains: [...journey.learningDomains],
    prerequisiteConcepts: [...journey.prerequisiteConcepts],
  };
}

export function legacyStopToEncounter(stop: JourneyStop): Encounter {
  return {
    id: stop.id,
    journeyId: stop.journeyId,
    order: stop.order,
    title: stop.title,
    target: {
      type: "place",
      label: stop.locationLabel,
      location: stop.coordinates
        ? {
            latitude: stop.coordinates.latitude,
            longitude: stop.coordinates.longitude,
          }
        : undefined,
    },
    creatorIntent: stop.purpose,
    learnerPrompt: stop.openingPrompt,
    learnerAction: stop.fieldAction,
    evidenceRequest: {
      prompt:
        stop.evidenceRequirementIds.length > 0
          ? `Capture evidence that supports this learning intention: ${stop.learningObjective}`
          : "Capture what you noticed, did, or concluded during this encounter.",
      allowedCaptureKinds: ["text", "photo", "voice", "sketch"],
    },
    safetyNotes: [...stop.safetyNotes],
    accessibilityAlternatives: [...stop.accessibilityAlternatives],
    artifactContribution: stop.artifactContribution,
    resurfacingConnection: stop.resurfacingConnection,
    optional: stop.optional,
    provenance: legacyEncounterProvenance(stop),
  };
}

export function legacyFieldNoteToCapture(note: FieldNote): LearnerCapture {
  const captureKind = note.captureType as CreatorCaptureKind;
  const details = [
    note.observation,
    note.inference ? `Interpretation: ${note.inference}` : undefined,
    note.hypothesis ? `Hypothesis: ${note.hypothesis}` : undefined,
    note.alternativeExplanation
      ? `Alternative explanation: ${note.alternativeExplanation}`
      : undefined,
    note.question ? `Open question: ${note.question}` : undefined,
  ].filter((value): value is string => Boolean(value));

  return {
    id: `capture-${note.id}`,
    learnerId: note.learnerId,
    journeyId: note.journeyId,
    encounterId: note.stopId,
    kind: captureKind,
    content: details.join("\n\n"),
    mediaRef: note.mediaUrl,
    createdAt: note.createdAt,
    provenance: {
      origin: "learner",
      createdById: note.learnerId,
      sourceRefs: [{ type: "capture", id: note.id }],
      version: LEGACY_VERSION,
    },
  };
}

export function legacyFieldNoteToEvidence(note: FieldNote): Evidence {
  const capture = legacyFieldNoteToCapture(note);

  return {
    id: `evidence-${note.id}`,
    learnerId: note.learnerId,
    journeyId: note.journeyId,
    encounterId: note.stopId,
    kind: note.evidence.length > 0 ? "observation" : "explanation",
    supportingCaptureIds: [capture.id],
    claim: note.inference ?? note.hypothesis,
    confidence: note.confidence / 4,
    createdAt: note.createdAt,
    provenance: {
      origin: "learner",
      createdById: note.learnerId,
      sourceRefs: [{ type: "capture", id: capture.id }],
      version: LEGACY_VERSION,
    },
  };
}

export function buildLegacyJourneyManifest(
  journey: Journey,
  stops: JourneyStop[],
  generatedAt = new Date().toISOString(),
): JourneyManifestV01 {
  const encounterOrder = new Map(journey.stopIds.map((id, index) => [id, index]));
  const relevantStops = stops
    .filter((stop) => stop.journeyId === journey.id)
    .sort((a, b) => {
      const aIndex = encounterOrder.get(a.id) ?? a.order;
      const bIndex = encounterOrder.get(b.id) ?? b.order;
      return aIndex - bIndex;
    });

  return {
    manifestVersion: "0.1",
    journey: legacyJourneyToCreatorJourney(journey),
    encounters: relevantStops.map(legacyStopToEncounter),
    generatedAt,
  };
}
