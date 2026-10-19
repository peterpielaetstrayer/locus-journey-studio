import type { JourneyManifestV01 } from "@/types/creator-beta";

/**
 * Mirrors the currently supported LOCUS learner Manifest v0.1 acceptance
 * boundary (locus/lib/journey-manifest.ts, MVE-001). This is a *creator-side
 * preflight* for actionable feedback, not a trusted import validator.
 *
 * Keep parity checked by pinned, cross-repository contract tests.
 */
const MAX_BYTES = 256 * 1024;
const MAX_ENCOUNTERS = 32;
const MAX_TEXT = 8_000;
const MAX_ID = 200;

const ORIGINS = new Set(["creator", "imported", "ai_generated", "ai_inferred", "learner"]);
const REF_TYPES = new Set(["document", "journey", "encounter", "capture", "url", "other"]);
const THREAD_TYPES = new Set(["question", "problem", "purpose", "capability", "transformation"]);
const JOURNEY_STATUSES = new Set(["concept", "draft", "test", "published", "archived"]);
const TARGET_TYPES = new Set([
  "place", "phenomenon", "object", "resource", "person",
  "problem", "question", "simulation", "artifact", "other",
]);
const CAPTURE_KINDS = new Set(["text", "photo", "voice", "video", "sketch", "choice"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function hasTextWithin(value: unknown, limit = MAX_TEXT): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= limit;
}
function optionalTextWithin(value: unknown, limit = MAX_TEXT): boolean {
  return value === undefined || hasTextWithin(value, limit);
}
function textArrayWithin(value: unknown, maxItems = MAX_ENCOUNTERS): boolean {
  return Array.isArray(value) && value.length <= maxItems &&
    value.every((item) => hasTextWithin(item));
}
function validReference(value: unknown): boolean {
  return isRecord(value) &&
    REF_TYPES.has(String(value.type)) &&
    hasTextWithin(value.id, MAX_ID) &&
    optionalTextWithin(value.locator);
}
function referenceListWithin(value: unknown): boolean {
  return Array.isArray(value) && value.length <= MAX_ENCOUNTERS &&
    value.every(validReference);
}

function checkProvenance(value: unknown, label: string, issues: string[]) {
  if (!isRecord(value)) {
    issues.push(`${label}: include provenance with origin, version and source references.`);
    return;
  }
  if (!ORIGINS.has(String(value.origin))) {
    issues.push(`${label}: choose a supported provenance origin.`);
  }
  if (!hasTextWithin(value.version, MAX_ID) || !optionalTextWithin(value.createdById, MAX_ID)) {
    issues.push(`${label}: provenance version/creator ID must be nonblank and at most 200 characters.`);
  }
  if (!referenceListWithin(value.sourceRefs) ||
      (value.adaptedFrom !== undefined && !validReference(value.adaptedFrom))) {
    issues.push(`${label}: repair provenance source references (max 32; valid type and ID).`);
  }
}

function validCoordinates(value: unknown): boolean {
  if (value === undefined) return true;
  if (!isRecord(value)) return false;
  const lat = value.latitude;
  const lon = value.longitude;
  return typeof lat === "number" && Number.isFinite(lat) && lat >= -90 && lat <= 90 &&
    typeof lon === "number" && Number.isFinite(lon) && lon >= -180 && lon <= 180 &&
    (value.altitudeMeters === undefined ||
      (typeof value.altitudeMeters === "number" && Number.isFinite(value.altitudeMeters)));
}

/** Issues are displayed *before* a draft is downloaded for LOCUS import. */
export function validateLearnerImportCompatibility(
  manifest: JourneyManifestV01,
  downloadedJson: string,
): string[] {
  const issues: string[] = [];
  if (new TextEncoder().encode(downloadedJson).length > MAX_BYTES) {
    issues.push("Draft exceeds the LOCUS learner 256 KB import limit. Shorten content or remove media/source data.");
  }
  if (manifest.manifestVersion !== "0.1") {
    issues.push("LOCUS learner supports only Journey Manifest v0.1.");
  }
  if (!hasTextWithin(manifest.generatedAt, 80) ||
      !Number.isFinite(Date.parse(manifest.generatedAt))) {
    issues.push("The manifest timestamp is invalid.");
  }
  const j: unknown = manifest.journey;
  const entries: unknown = manifest.encounters;
  if (!isRecord(j) || !Array.isArray(entries)) {
    issues.push("The Journey and Encounter list must both exist.");
    return issues;
  }
  if (!hasTextWithin(j.id, MAX_ID) || !hasTextWithin(j.title) ||
      !optionalTextWithin(j.description) || !optionalTextWithin(j.locationLabel)) {
    issues.push("Journey ID must be 1–200 characters; title and optional descriptions must be 1–8,000 characters.");
  }
  if (!JOURNEY_STATUSES.has(String(j.status))) {
    issues.push("Choose a supported Journey status.");
  }
  if (!textArrayWithin(j.creatorIds)) {
    issues.push("Creator IDs must be nonblank; no more than 32 may be included.");
  }
  if (!isRecord(j.thread) || !THREAD_TYPES.has(String(j.thread.type)) ||
      !hasTextWithin(j.thread.statement)) {
    issues.push("Journey Thread must have a supported type and a statement no longer than 8,000 characters.");
  }
  if (!isRecord(j.learnerContext) || !hasTextWithin(j.learnerContext.description)) {
    issues.push("Learner context must describe the intended learner in 8,000 characters or fewer.");
  }
  if (!textArrayWithin(j.encounterIds) || !referenceListWithin(j.sourceContext)) {
    issues.push("Encounter IDs and source references must be valid and limited to 32 each.");
  }
  checkProvenance(j.provenance, "Journey", issues);
  if (!Array.isArray(j.encounterIds)) return issues;

  if (entries.length < 1 || entries.length > MAX_ENCOUNTERS ||
      entries.length !== j.encounterIds.length) {
    issues.push("LOCUS learner accepts 1–32 ordered Encounters per Journey.");
  }
  if (new Set(j.encounterIds).size !== j.encounterIds.length) {
    issues.push("Encounter IDs must not repeat.");
  }
  for (const [index, raw] of entries.entries()) {
    const label = `Encounter ${index + 1}`;
    if (!isRecord(raw)) {
      issues.push(`${label} must be an object.`);
      continue;
    }
    if (!hasTextWithin(raw.id, MAX_ID) ||
        raw.id !== j.encounterIds[index] ||
        raw.journeyId !== j.id || raw.order !== index + 1 ||
        !hasTextWithin(raw.title)) {
      issues.push(`${label}: fix ID (max 200 characters), sequence, Journey link or title (max 8,000).`);
    }
    if (!isRecord(raw.target) || !TARGET_TYPES.has(String(raw.target.type)) ||
        !hasTextWithin(raw.target.label) || !validCoordinates(raw.target.location)) {
      issues.push(`${label}: check target type, label (max 8,000) and coordinates.`);
    }
    if (!hasTextWithin(raw.learnerPrompt) || !hasTextWithin(raw.learnerAction)) {
      issues.push(`${label}: ATTEND and ACT instructions must each be 1–8,000 characters.`);
    }
    if (!isRecord(raw.evidenceRequest) || !hasTextWithin(raw.evidenceRequest.prompt) ||
        !textArrayWithin(raw.evidenceRequest.allowedCaptureKinds, 6) ||
        (Array.isArray(raw.evidenceRequest.allowedCaptureKinds) &&
          (raw.evidenceRequest.allowedCaptureKinds.length === 0 ||
           !raw.evidenceRequest.allowedCaptureKinds.every((k) => CAPTURE_KINDS.has(k))))) {
      issues.push(`${label}: Evidence prompt must be 1–8,000 characters with 1–6 supported capture kinds.`);
    }
    checkProvenance(raw.provenance, label, issues);
    for (const key of ["safetyNotes", "accessibilityAlternatives", "scaffolds"]) {
      if (raw[key] !== undefined && !textArrayWithin(raw[key])) {
        issues.push(`${label}: ${key} must contain at most 32 nonblank notes, up to 8,000 characters each.`);
      }
    }
    if (raw.resources !== undefined && !referenceListWithin(raw.resources)) {
      issues.push(`${label}: resources must contain at most 32 valid references.`);
    }
  }
  return issues;
}
