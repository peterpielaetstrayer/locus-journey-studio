import type {
  CreatorJourney,
  Encounter,
  JourneyManifestV01,
} from "@/types/creator-beta";

export type ManifestExportResult =
  | { ok: true; manifest: JourneyManifestV01 }
  | { ok: false; issues: string[] };

const CAPTURE_KINDS = new Set(["text", "photo", "voice", "video", "sketch", "choice"]);

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Assemble a portable, creator-reviewed draft for a separate adult-only learner test.
 * This is a local-only export boundary, NOT publication or a security validator for
 * untrusted imported manifests. The receiving application must validate again.
 */
export function buildJourneyManifestForExport(
  journey: CreatorJourney,
  encounterById: Record<string, Encounter>,
  generatedAt = new Date().toISOString(),
): ManifestExportResult {
  const issues: string[] = [];

  if (!hasText(journey.id)) issues.push("Journey ID is missing.");
  if (!hasText(journey.title)) issues.push("Add a Journey title.");
  if (!hasText(journey.thread?.statement)) issues.push("Add a Journey Thread.");
  if (!hasText(journey.learnerContext?.description)) {
    issues.push("Describe the intended learner context.");
  }
  if (!hasText(journey.provenance?.version) || !hasText(journey.provenance?.origin)) {
    issues.push("Journey provenance is incomplete.");
  }
  if (!Array.isArray(journey.encounterIds) || journey.encounterIds.length === 0) {
    issues.push("Add at least one Encounter.");
  }
  if (Number.isNaN(Date.parse(generatedAt))) issues.push("Manifest timestamp is invalid.");

  const ids = Array.isArray(journey.encounterIds) ? journey.encounterIds : [];
  if (new Set(ids).size !== ids.length) {
    issues.push("Encounter IDs must not repeat.");
  }

  const encounters: Encounter[] = [];
  for (const [index, id] of ids.entries()) {
    const encounter = encounterById[id];
    if (!encounter) {
      issues.push(`Encounter ${index + 1} (${id}) is missing.`);
      continue;
    }
    if (encounter.journeyId !== journey.id) {
      issues.push(`Encounter ${index + 1} belongs to a different Journey.`);
    }
    if (encounter.order !== index + 1) {
      issues.push(`Encounter ${index + 1} order does not match the Journey sequence.`);
    }
    if (!hasText(encounter.id) || !hasText(encounter.title)) {
      issues.push(`Encounter ${index + 1} needs an ID and title.`);
    }
    if (!hasText(encounter.target?.type) || !hasText(encounter.target?.label)) {
      issues.push(`Encounter ${index + 1} needs a target type and label.`);
    }
    if (!hasText(encounter.learnerPrompt) || !hasText(encounter.learnerAction)) {
      issues.push(`Encounter ${index + 1} needs ATTEND and ACT instructions.`);
    }
    if (!hasText(encounter.evidenceRequest?.prompt)) {
      issues.push(`Encounter ${index + 1} needs an evidence request.`);
    }
    const kinds = encounter.evidenceRequest?.allowedCaptureKinds;
    if (!Array.isArray(kinds) || kinds.length === 0 ||
      !kinds.every((kind) => CAPTURE_KINDS.has(kind))) {
      issues.push(`Encounter ${index + 1} needs valid capture kinds.`);
    }
    if (!hasText(encounter.provenance?.version) || !hasText(encounter.provenance?.origin)) {
      issues.push(`Encounter ${index + 1} provenance is incomplete.`);
    }
    encounters.push(encounter);
  }

  if (issues.length > 0) return { ok: false, issues };

  // Snapshot object: later edits to the live Zustand store should not mutate
  // the exported manifest, and the source provenance stays intact.
  return {
    ok: true,
    manifest: JSON.parse(JSON.stringify({
      manifestVersion: "0.1",
      journey,
      encounters,
      generatedAt,
    })) as JourneyManifestV01,
  };
}

export function manifestFilename(title: string): string {
  const slug = title.toLowerCase().normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 64);
  return `locus-journey-${slug || "untitled"}-manifest-v0.1.json`;
}
