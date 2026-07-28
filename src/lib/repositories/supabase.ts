import { createClient } from "@/lib/supabase/server";
import {
  ADAPTIVE_BRANCHES,
  JOURNEY_STOPS,
  REVIEW_STATUS,
  WATER_WRITES_JOURNEY,
} from "@/data/canonical";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type {
  AdaptiveBranch,
  Artifact,
  FieldNote,
  Journey,
  JourneyStop,
  MentorIntervention,
} from "@/types";
import type {
  ArtifactsRepository,
  AuditEvent,
  FieldNotesRepository,
  InterventionsRepository,
  JourneyRepository,
  JourneyVersionSummary,
  RepositoryBundle,
  ReviewRecord,
  ReviewsRepository,
} from "./types";
import {
  isVersionEditable,
  mapDbStatusToJourneyStatus,
  mapJourneyStatusToDb,
} from "./local";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- hand-written Database types omit Relationships; use loose client for repository layer
type Db = SupabaseClient<any, "public", any>;
type JourneyVersionRow = Database["public"]["Tables"]["journey_versions"]["Row"];
type JourneyStopRow = Database["public"]["Tables"]["journey_stops"]["Row"];
type FieldNoteRow = Database["public"]["Tables"]["field_notes"]["Row"];
type InterventionRow = Database["public"]["Tables"]["mentor_interventions"]["Row"];

const OWLL_ORG_ID = "00000000-0000-4000-8000-000000000001";
const CANONICAL_JOURNEY_ID = "00000000-0000-4000-8000-000000000010";
const CANONICAL_VERSION_ID = "00000000-0000-4000-8000-000000000011";

const LEARNER_ID_MAP: Record<string, string> = {
  "learner-maya": "00000000-0000-4000-8000-000000000030",
  "learner-eli": "00000000-0000-4000-8000-000000000031",
  "learner-jordan": "00000000-0000-4000-8000-000000000032",
};

const ENROLLMENT_ID_MAP: Record<string, string> = {
  "learner-maya": "00000000-0000-4000-8000-000000000060",
  "learner-eli": "00000000-0000-4000-8000-000000000061",
  "learner-jordan": "00000000-0000-4000-8000-000000000062",
};

const STOP_ID_MAP: Record<string, string> = {
  "stop-threshold": "00000000-0000-4000-8000-000000000020",
  "stop-water-fingerprints": "00000000-0000-4000-8000-000000000021",
  "stop-cypress-knee": "00000000-0000-4000-8000-000000000022",
  "stop-two-worlds": "00000000-0000-4000-8000-000000000023",
  "stop-hidden-flow": "00000000-0000-4000-8000-000000000024",
  "stop-human-path": "00000000-0000-4000-8000-000000000025",
  "stop-build-system": "00000000-0000-4000-8000-000000000026",
  "stop-exit-claim": "00000000-0000-4000-8000-000000000027",
};

function mapStopRow(row: JourneyStopRow): JourneyStop {
  const canonical = JOURNEY_STOPS.find((s) => s.id === reverseStopId(row.id));
  return {
    id: reverseStopId(row.id) ?? row.slug,
    journeyId: "journey-water-writes",
    order: row.position,
    title: row.title,
    locationLabel: row.location_label,
    purpose: row.purpose,
    centralConcept: row.central_concept,
    learningObjective: row.learning_objective,
    openingPrompt: row.opening_prompt,
    fieldAction: row.field_action,
    evidenceRequirementIds: [],
    branchIds: ADAPTIVE_BRANCHES.filter((b) => b.stopId === reverseStopId(row.id)).map((b) => b.id),
    mentorInterventionIds: [],
    safetyNotes: row.safety_notes,
    accessibilityAlternatives: row.accessibility_alternatives,
    artifactContribution: row.artifact_contribution ?? undefined,
    resurfacingConnection: row.resurfacing_connection ?? undefined,
    optional: row.is_optional,
    hiddenUntilUnlocked: row.is_hidden_until_unlocked,
    mapX: canonical?.mapX ?? 50,
    mapY: canonical?.mapY ?? 50,
  };
}

function reverseStopId(dbId: string): string | undefined {
  return Object.entries(STOP_ID_MAP).find(([, v]) => v === dbId)?.[0];
}

function mapVersionToJourney(version: JourneyVersionRow): Journey {
  return {
    ...WATER_WRITES_JOURNEY,
    centralQuestion: version.central_question,
    subtitle: version.subtitle,
    description: version.description,
    audience: version.audience,
    durationMinutes: version.duration_minutes,
    learningDomains: version.learning_domains,
    enduringUnderstandings: version.enduring_understandings,
    prerequisiteConcepts: version.prerequisite_concepts,
    status: mapDbStatusToJourneyStatus(version.status),
    reviewStatus: REVIEW_STATUS,
  };
}

async function recordAudit(
  db: Db,
  entityType: string,
  entityId: string,
  action: string,
  metadata: Record<string, unknown> = {},
) {
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return;
  await db.from("audit_events").insert({
    organization_id: OWLL_ORG_ID,
    actor_profile_id: user.id,
    entity_type: entityType,
    entity_id: entityId,
    action,
    metadata,
  });
}

function createJourneyRepository(db: Db): JourneyRepository {
  return {
    mode: "connected",
    async getCanonicalDraft(slug) {
      if (slug !== "water-writes-the-landscape") return null;
      const { data: version } = await db
        .from("journey_versions")
        .select("*")
        .eq("id", CANONICAL_VERSION_ID)
        .single();
      if (!version) return null;
      const { data: stops } = await db
        .from("journey_stops")
        .select("*")
        .eq("journey_version_id", version.id)
        .order("position");
      const { data: branches } = await db
        .from("adaptive_branches")
        .select("*")
        .in("journey_stop_id", (stops ?? []).map((s) => s.id));
      return {
        journey: mapVersionToJourney(version),
        stops: (stops ?? []).map(mapStopRow),
        branches: (branches ?? []).map((b) => ({
          id: b.id,
          stopId: reverseStopId(b.journey_stop_id) ?? b.journey_stop_id,
          name: b.name,
          learnerType: b.learner_type as AdaptiveBranch["learnerType"],
          activationType: b.activation_type as AdaptiveBranch["activationType"],
          triggerDescription: b.trigger_description,
          prompt: b.prompt,
          action: b.action,
          evidenceExpectation: b.evidence_expectation,
          returnToCore: b.return_to_core,
        })),
        versionId: version.id,
        versionLabel: version.version_label,
        savedAt: version.created_at,
        isEditable: isVersionEditable(version.status),
      };
    },
    async saveDraft(draft) {
      if (!draft.versionId) throw new Error("Missing version id");
      if (!draft.isEditable) throw new Error("Cannot edit published or archived versions");
      const { error: versionError } = await db
        .from("journey_versions")
        .update({
          central_question: draft.journey.centralQuestion,
          subtitle: draft.journey.subtitle,
          description: draft.journey.description,
          audience: draft.journey.audience,
          duration_minutes: draft.journey.durationMinutes,
          learning_domains: draft.journey.learningDomains,
          status: mapJourneyStatusToDb(draft.journey.status),
        })
        .eq("id", draft.versionId);
      if (versionError) throw versionError;
      for (const stop of draft.stops) {
        const dbStopId = STOP_ID_MAP[stop.id];
        if (!dbStopId) continue;
        await db
          .from("journey_stops")
          .update({
            opening_prompt: stop.openingPrompt,
            field_action: stop.fieldAction,
            safety_notes: stop.safetyNotes,
            accessibility_alternatives: stop.accessibilityAlternatives,
            updated_at: new Date().toISOString(),
          })
          .eq("id", dbStopId);
      }
      await recordAudit(db, "journey_version", draft.versionId, "draft_saved");
      return { ...draft, savedAt: new Date().toISOString() };
    },
    async createDraftVersion(slug) {
      if (slug !== "water-writes-the-landscape") throw new Error("Unknown journey");
      const { data: current } = await db
        .from("journey_versions")
        .select("*")
        .eq("id", CANONICAL_VERSION_ID)
        .single();
      if (!current) throw new Error("Canonical version not found");
      const { data: newVersion, error } = await db
        .from("journey_versions")
        .insert({
          journey_id: CANONICAL_JOURNEY_ID,
          version_label: `Draft ${new Date().toISOString().slice(0, 10)}`,
          status: "draft",
          central_question: current.central_question,
          subtitle: current.subtitle,
          description: current.description,
          audience: current.audience,
          duration_minutes: current.duration_minutes,
          learning_domains: current.learning_domains,
          enduring_understandings: current.enduring_understandings,
          prerequisite_concepts: current.prerequisite_concepts,
          artifact_template: current.artifact_template,
          supersedes_version_id: current.id,
        })
        .select("*")
        .single();
      if (error || !newVersion) throw error ?? new Error("Failed to create version");
      const { data: stops } = await db
        .from("journey_stops")
        .select("*")
        .eq("journey_version_id", current.id);
      for (const stop of stops ?? []) {
        const copy = { ...(stop as JourneyStopRow) };
        delete (copy as { id?: string }).id;
        copy.journey_version_id = newVersion.id;
        await db.from("journey_stops").insert(copy);
      }
      await recordAudit(db, "journey_version", newVersion.id, "version_created", {
        supersedes: current.id,
      });
      return {
        journey: mapVersionToJourney(newVersion),
        stops: (stops ?? []).map(mapStopRow),
        branches: ADAPTIVE_BRANCHES.map((b) => ({ ...b })),
        versionId: newVersion.id,
        versionLabel: newVersion.version_label,
        isEditable: true,
        savedAt: newVersion.created_at,
      };
    },
    async listVersions(slug) {
      if (slug !== "water-writes-the-landscape") return [];
      const { data } = await db
        .from("journey_versions")
        .select("id, version_label, status, created_at")
        .eq("journey_id", CANONICAL_JOURNEY_ID)
        .order("created_at", { ascending: false });
      return (data ?? []).map((v) => ({
        id: v.id,
        versionLabel: v.version_label,
        status: mapDbStatusToJourneyStatus(v.status),
        createdAt: v.created_at,
      })) satisfies JourneyVersionSummary[];
    },
    async restoreCanonicalDraft(slug) {
      return this.getCanonicalDraft(slug);
    },
    async listAuditEvents(journeyVersionId) {
      const { data } = await db
        .from("audit_events")
        .select("*")
        .eq("entity_id", journeyVersionId)
        .order("created_at", { ascending: false });
      return (data ?? []).map((e) => ({
        id: e.id,
        entityType: e.entity_type,
        entityId: e.entity_id,
        action: e.action,
        metadata: (e.metadata as Record<string, unknown>) ?? {},
        createdAt: e.created_at,
      })) satisfies AuditEvent[];
    },
  };
}

function mapFieldNoteRow(row: FieldNoteRow): FieldNote {
  const learnerKey = Object.entries(LEARNER_ID_MAP).find(([, v]) => v === row.learner_profile_id)?.[0];
  const stopKey = reverseStopId(row.journey_stop_id);
  return {
    id: row.id,
    learnerId: learnerKey ?? row.learner_profile_id,
    journeyId: "journey-water-writes",
    stopId: stopKey ?? row.journey_stop_id,
    captureType: row.capture_type as FieldNote["captureType"],
    observation: row.observation,
    inference: row.inference ?? undefined,
    hypothesis: row.hypothesis ?? undefined,
    evidence: Array.isArray(row.evidence) ? (row.evidence as string[]) : [],
    alternativeExplanation: row.alternative_explanation ?? undefined,
    confidence: row.confidence as FieldNote["confidence"],
    question: row.question ?? undefined,
    createdAt: row.created_at,
    mentorReviewed: row.mentor_reviewed,
    visibility: row.visibility,
  };
}

function createFieldNotesRepository(db: Db): FieldNotesRepository {
  return {
    mode: "connected",
    async listForLearner(learnerId) {
      const profileId = LEARNER_ID_MAP[learnerId] ?? learnerId;
      const { data } = await db
        .from("field_notes")
        .select("*")
        .eq("learner_profile_id", profileId)
        .order("created_at", { ascending: false });
      return (data ?? []).map(mapFieldNoteRow);
    },
    async create(input) {
      const {
        data: { user },
      } = await db.auth.getUser();
      if (!user) throw new Error("Unauthorized");
      const enrollmentId = input.enrollmentId ?? ENROLLMENT_ID_MAP[input.learnerId];
      const stopId = STOP_ID_MAP[input.stopId] ?? input.stopId;
      const learnerProfileId = LEARNER_ID_MAP[input.learnerId] ?? input.learnerId;
      let mediaAssetId: string | undefined;
      if (input.mediaFile) {
        const ext = input.mediaFile.name.split(".").pop() ?? "jpg";
        const objectPath = `${OWLL_ORG_ID}/${user.id}/${enrollmentId}/${crypto.randomUUID()}-upload.${ext}`;
        const { error: uploadError } = await db.storage
          .from("field-media")
          .upload(objectPath, input.mediaFile, { contentType: input.mediaFile.type });
        if (uploadError) throw uploadError;
        const { data: asset, error: assetError } = await db
          .from("media_assets")
          .insert({
            organization_id: OWLL_ORG_ID,
            owner_profile_id: user.id,
            bucket: "field-media",
            object_path: objectPath,
            mime_type: input.mediaFile.type,
            size_bytes: input.mediaFile.size,
            alt_text: input.altText ?? "Field capture",
            visibility: input.visibility === "private" ? "private" : "mentor",
          })
          .select("id")
          .single();
        if (assetError) throw assetError;
        mediaAssetId = asset.id;
      }
      const { data, error } = await db
        .from("field_notes")
        .insert({
          journey_enrollment_id: enrollmentId,
          journey_stop_id: stopId,
          learner_profile_id: learnerProfileId,
          created_by_profile_id: user.id,
          capture_type: input.captureType,
          media_asset_id: mediaAssetId ?? null,
          observation: input.observation,
          inference: input.inference ?? null,
          hypothesis: input.hypothesis ?? null,
          evidence: input.evidence,
          alternative_explanation: input.alternativeExplanation ?? null,
          confidence: input.confidence,
          question: input.question ?? null,
          visibility: input.visibility,
          mentor_reviewed: input.mentorReviewed,
        })
        .select("*")
        .single();
      if (error || !data) throw error ?? new Error("Failed to save field note");
      await recordAudit(db, "field_note", data.id, "created");
      return mapFieldNoteRow(data);
    },
  };
}

function mapInterventionRow(row: InterventionRow): MentorIntervention {
  const learnerKey = Object.entries(LEARNER_ID_MAP).find(([, v]) => v === row.learner_profile_id)?.[0];
  const stopKey = row.journey_stop_id ? reverseStopId(row.journey_stop_id) : undefined;
  return {
    id: row.id,
    learnerId: learnerKey ?? row.learner_profile_id,
    stopId: stopKey ?? row.journey_stop_id ?? "",
    category: row.category as MentorIntervention["category"],
    recommendationSource: row.recommendation_source as MentorIntervention["recommendationSource"],
    reason: row.reason,
    message: row.message,
    status: row.status as MentorIntervention["status"],
    deliveredAt: row.delivered_at ?? undefined,
    learnerResponse: row.learner_response ?? undefined,
    outcome: row.outcome ?? undefined,
    overrideReason: row.override_reason ?? undefined,
  };
}

function createInterventionsRepository(db: Db): InterventionsRepository {
  return {
    mode: "connected",
    async listForLearner(learnerId) {
      const profileId = LEARNER_ID_MAP[learnerId] ?? learnerId;
      const { data } = await db
        .from("mentor_interventions")
        .select("*")
        .eq("learner_profile_id", profileId)
        .order("created_at", { ascending: false });
      return (data ?? []).map(mapInterventionRow);
    },
    async create(input) {
      const {
        data: { user },
      } = await db.auth.getUser();
      if (!user) throw new Error("Unauthorized");
      const { data, error } = await db
        .from("mentor_interventions")
        .insert({
          journey_enrollment_id: input.enrollmentId ?? ENROLLMENT_ID_MAP[input.learnerId],
          journey_stop_id: input.stopId ? STOP_ID_MAP[input.stopId] ?? input.stopId : null,
          learner_profile_id: LEARNER_ID_MAP[input.learnerId] ?? input.learnerId,
          created_by_profile_id: user.id,
          category: input.category,
          recommendation_source: input.recommendationSource,
          reason: input.reason,
          message: input.message,
          status: input.status,
          override_reason: input.overrideReason ?? null,
        })
        .select("*")
        .single();
      if (error || !data) throw error ?? new Error("Failed to create intervention");
      await recordAudit(db, "mentor_intervention", data.id, "created", {
        override: Boolean(input.overrideReason),
      });
      return mapInterventionRow(data);
    },
    async update(id, updates) {
      const { data, error } = await db
        .from("mentor_interventions")
        .update({
          message: updates.message,
          status: updates.status,
          override_reason: updates.overrideReason,
          learner_response: updates.learnerResponse,
          outcome: updates.outcome,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();
      if (error || !data) throw error ?? new Error("Failed to update intervention");
      if (updates.overrideReason) {
        await recordAudit(db, "mentor_intervention", id, "override", {
          reason: updates.overrideReason,
        });
      }
      return mapInterventionRow(data);
    },
    async deliver(id) {
      const { data, error } = await db
        .from("mentor_interventions")
        .update({
          status: "delivered",
          delivered_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();
      if (error || !data) throw error ?? new Error("Failed to deliver intervention");
      await recordAudit(db, "mentor_intervention", id, "delivered");
      return mapInterventionRow(data);
    },
  };
}

function createArtifactsRepository(db: Db): ArtifactsRepository {
  return {
    mode: "connected",
    async getForLearner(learnerId) {
      const profileId = LEARNER_ID_MAP[learnerId] ?? learnerId;
      const { data } = await db
        .from("artifacts")
        .select("*")
        .eq("learner_profile_id", profileId)
        .maybeSingle();
      if (!data) return null;
      return {
        id: data.id,
        learnerId,
        journeyId: "journey-water-writes",
        title: data.title,
        originalHypothesis: data.original_hypothesis,
        strongestEvidence: Array.isArray(data.strongest_evidence)
          ? (data.strongest_evidence as string[])
          : [],
        revisedExplanation: data.revised_explanation,
        systemsMap: (data.systems_map as Artifact["systemsMap"]) ?? { nodes: [], edges: [] },
        remainingQuestion: data.remaining_question,
        status: data.status as Artifact["status"],
      };
    },
    async save(artifact) {
      const profileId = LEARNER_ID_MAP[artifact.learnerId] ?? artifact.learnerId;
      const enrollmentId = artifact.enrollmentId ?? ENROLLMENT_ID_MAP[artifact.learnerId];
      const payload = {
        journey_enrollment_id: enrollmentId,
        learner_profile_id: profileId,
        journey_version_id: CANONICAL_VERSION_ID,
        title: artifact.title,
        original_hypothesis: artifact.originalHypothesis,
        strongest_evidence: artifact.strongestEvidence,
        revised_explanation: artifact.revisedExplanation,
        systems_map: artifact.systemsMap,
        remaining_question: artifact.remainingQuestion,
        status: artifact.status,
        updated_at: new Date().toISOString(),
      };
      const existing = await this.getForLearner(artifact.learnerId);
      if (existing) {
        const { data, error } = await db
          .from("artifacts")
          .update(payload)
          .eq("id", existing.id)
          .select("*")
          .single();
        if (error || !data) throw error ?? new Error("Failed to update artifact");
        await recordAudit(db, "artifact", data.id, "updated");
        return {
          id: data.id,
          learnerId: artifact.learnerId,
          journeyId: artifact.journeyId,
          title: data.title,
          originalHypothesis: data.original_hypothesis,
          strongestEvidence: artifact.strongestEvidence,
          revisedExplanation: data.revised_explanation,
          systemsMap: artifact.systemsMap,
          remainingQuestion: data.remaining_question,
          status: data.status as Artifact["status"],
        };
      }
      const { data, error } = await db.from("artifacts").insert(payload).select("*").single();
      if (error || !data) throw error ?? new Error("Failed to save artifact");
      await recordAudit(db, "artifact", data.id, "created");
      return {
        id: data.id,
        learnerId: artifact.learnerId,
        journeyId: artifact.journeyId,
        title: data.title,
        originalHypothesis: data.original_hypothesis,
        strongestEvidence: artifact.strongestEvidence,
        revisedExplanation: data.revised_explanation,
        systemsMap: artifact.systemsMap,
        remainingQuestion: data.remaining_question,
        status: data.status as Artifact["status"],
      };
    },
  };
}

const REVIEW_CATEGORY_MAP: Record<string, ReviewRecord["category"]> = {
  learning_design: "learningDesign",
  factual: "factual",
  sources: "sources",
  safety: "safety",
  accessibility: "accessibility",
  field_test: "fieldTest",
  maintenance: "maintenance",
};

function createReviewsRepository(db: Db): ReviewsRepository {
  return {
    mode: "connected",
    async listForJourneyVersion(versionId) {
      const { data } = await db
        .from("journey_reviews")
        .select("*")
        .eq("journey_version_id", versionId);
      return (data ?? []).map((r) => ({
        id: r.id,
        category: REVIEW_CATEGORY_MAP[r.category] ?? "learningDesign",
        status: r.status,
        notes: r.notes,
        updatedAt: r.updated_at,
      }));
    },
    async upsert(review) {
      const {
        data: { user },
      } = await db.auth.getUser();
      if (!user) throw new Error("Unauthorized");
      const dbCategory =
        Object.entries(REVIEW_CATEGORY_MAP).find(([, v]) => v === review.category)?.[0] ??
        "learning_design";
      const { data, error } = await db
        .from("journey_reviews")
        .upsert(
          {
            journey_version_id: review.versionId,
            reviewer_profile_id: user.id,
            category: dbCategory ?? "learning_design",
            status: review.status,
            notes: review.notes,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "journey_version_id,reviewer_profile_id,category" },
        )
        .select("*")
        .single();
      if (error || !data) throw error ?? new Error("Failed to save review");
      await recordAudit(db, "journey_review", data.id, "upserted");
      return {
        id: data.id,
        category: REVIEW_CATEGORY_MAP[data.category] ?? "learningDesign",
        status: data.status,
        notes: data.notes,
        updatedAt: data.updated_at,
      };
    },
  };
}

export async function createSupabaseRepositories(): Promise<RepositoryBundle> {
  const db = (await createClient()) as Db;
  return {
    mode: "connected",
    journeys: createJourneyRepository(db),
    fieldNotes: createFieldNotesRepository(db),
    interventions: createInterventionsRepository(db),
    artifacts: createArtifactsRepository(db),
    reviews: createReviewsRepository(db),
  };
}