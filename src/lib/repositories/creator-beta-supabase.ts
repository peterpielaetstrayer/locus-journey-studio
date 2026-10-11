import { createClient } from "@/lib/supabase/server";
import {
  buildStopMeta,
  buildVersionMeta,
  encounterToStopInsert,
  mapCreatorStatusToDb,
  mapDbStatusToCreatorStatus,
  slugifyTitle,
  stopRowToEncounter,
  versionRowsToCreatorJourney,
  type DbJourneyRow,
  type DbStopRow,
  type DbVersionRow,
} from "@/lib/creator-beta/db-adapter";
import { isVersionEditable } from "@/lib/repositories/local";
import { OWLL_ORG_ID } from "@/lib/auth/authorize";
import type { Database, Json } from "@/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreatorJourney, Encounter } from "@/types/creator-beta";
import type {
  CreateCreatorBetaEncounterInput,
  CreateCreatorBetaJourneyInput,
  CreatorBetaJourneyRecord,
  CreatorBetaJourneySummary,
  CreatorBetaRepository,
  UpdateCreatorBetaJourneyInput,
} from "./creator-beta-types";

type Db = SupabaseClient<Database>;

async function recordAudit(
  db: Db,
  entityType: string,
  entityId: string,
  action: string,
  metadata: Record<string, unknown> = {},
) {
  const { error } = await db.rpc("record_audit_event", {
    p_organization_id: OWLL_ORG_ID,
    p_entity_type: entityType,
    p_entity_id: entityId,
    p_action: action,
    p_metadata: metadata as Database["public"]["Functions"]["record_audit_event"]["Args"]["p_metadata"],
  });
  if (error) throw error;
}

async function getLatestEditableVersion(
  db: Db,
  journeyId: string,
): Promise<DbVersionRow | null> {
  const { data, error } = await db
    .from("journey_versions")
    .select("*")
    .eq("journey_id", journeyId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const versions = (data ?? []) as DbVersionRow[];
  const editable = versions.find((version) => isVersionEditable(version.status));
  return editable ?? versions[0] ?? null;
}

async function loadJourneyRecord(
  db: Db,
  journey: DbJourneyRow,
  version: DbVersionRow,
): Promise<CreatorBetaJourneyRecord> {
  const { data: stopRows, error: stopError } = await db
    .from("journey_stops")
    .select("*")
    .eq("journey_version_id", version.id)
    .order("position");
  if (stopError) throw stopError;

  const stops = (stopRows ?? []) as DbStopRow[];
  const encounters = stops.map((stop) => stopRowToEncounter(journey.id, stop));

  return {
    journey: versionRowsToCreatorJourney(
      journey,
      version,
      encounters.map((encounter) => encounter.id),
    ),
    encounters,
    slug: journey.slug,
    versionId: version.id,
    isEditable: isVersionEditable(version.status),
  };
}

function createCreatorBetaRepository(db: Db): CreatorBetaRepository {
  return {
    mode: "connected",

    async listJourneys() {
      const { data: journeyRows, error: listError } = await db
        .from("journeys")
        .select("id, slug, title, location, updated_at")
        .eq("organization_id", OWLL_ORG_ID)
        .order("updated_at", { ascending: false });
      if (listError) throw listError;

      const summaries: CreatorBetaJourneySummary[] = [];

      for (const row of journeyRows ?? []) {
        const version = await getLatestEditableVersion(db, row.id);
        if (!version) continue;

        const { count, error: countError } = await db
          .from("journey_stops")
          .select("id", { count: "exact", head: true })
          .eq("journey_version_id", version.id);
        if (countError) throw countError;

        summaries.push({
          id: row.id,
          slug: row.slug,
          title: row.title,
          status: mapDbStatusToCreatorStatus(version.status),
          encounterCount: count ?? 0,
          threadStatement: version.central_question,
          updatedAt: row.updated_at,
        });
      }

      return summaries;
    },

    async getJourneyById(journeyId) {
      const { data: journey, error: journeyError } = await db
        .from("journeys")
        .select("id, slug, title, region, location")
        .eq("id", journeyId)
        .maybeSingle();
      if (journeyError) throw journeyError;

      if (!journey) return null;

      const version = await getLatestEditableVersion(db, journey.id);
      if (!version) return null;

      return loadJourneyRecord(db, journey as DbJourneyRow, version as DbVersionRow);
    },

    async createJourney(input: CreateCreatorBetaJourneyInput) {
      const {
        data: { user },
        error: authError,
      } = await db.auth.getUser();
      if (authError || !user) {
        throw new Error("An authenticated adult creator is required.");
      }

      const proposal = input.proposal;
      const slug = `${slugifyTitle(proposal.suggestedTitle)}-${Date.now().toString(36).slice(-6)}`;

      // The database RPC is a SINGLE transaction. Failure at any Encounter
      // causes Journey, version, all earlier Encounters and audit to roll back.
      // This is still creator-only (no learner or cohort data).
      const draftJourney: CreatorJourney = {
        id: "",
        title: proposal.suggestedTitle,
        creatorIds: [user.id],
        status: "draft",
        thread: proposal.suggestedThread,
        learnerContext: proposal.suggestedLearnerContext,
        encounterIds: [],
        sourceContext: [{ type: "other", id: proposal.id }],
        provenance: {
          origin: proposal.provenance.origin,
          createdById: user.id,
          sourceRefs: [{ type: "other", id: proposal.id }],
          version: proposal.provenance.version,
        },
        description: proposal.seedText,
      };

      const proposedStops = proposal.suggestedEncounters.map((suggestion, index) => {
        const encounter: Encounter = {
          id: "",
          journeyId: "",
          order: index + 1,
          title: suggestion.title,
          target: suggestion.target,
          learnerPrompt: suggestion.learnerPrompt,
          learnerAction: suggestion.learnerAction,
          evidenceRequest: suggestion.evidenceRequest,
          provenance: {
            origin: proposal.provenance.origin,
            sourceRefs: [{ type: "other", id: proposal.id }],
            version: proposal.provenance.version,
          },
        };
        const stop = encounterToStopInsert("00000000-0000-0000-0000-000000000000", encounter);
        const { journey_version_id: _provisionalVersionId, ...withoutVersion } = stop;
        return withoutVersion;
      });

      const { data: created, error: createError } = await db.rpc("create_creator_journey", {
        p_slug: slug,
        p_title: proposal.suggestedTitle,
        p_location: proposal.suggestedLearnerContext.description.slice(0, 120),
        p_thread: proposal.suggestedThread.statement,
        p_audience: proposal.suggestedLearnerContext.description,
        p_description: proposal.seedText,
        p_version_meta: buildVersionMeta(draftJourney) as unknown as Json,
        p_stops: proposedStops as unknown as Json,
      });
      if (createError) throw createError;
      const savedId = created?.[0]?.journey_id;
      if (!savedId) throw new Error("Creator Journey transaction returned no Journey ID");

      const record = await this.getJourneyById(savedId);
      if (!record) {
        throw new Error("Creator Journey was committed, but its saved record could not be loaded.");
      }
      return record;
    },

    async updateJourney(journeyId, updates: UpdateCreatorBetaJourneyInput) {
      const record = await this.getJourneyById(journeyId);
      if (!record) throw new Error("Journey not found");
      if (!record.isEditable) throw new Error("Journey version is not editable");

      const merged: CreatorJourney = {
        ...record.journey,
        ...updates,
        thread: updates.thread
          ? { ...record.journey.thread, ...updates.thread }
          : record.journey.thread,
        learnerContext: updates.learnerContext
          ? { ...record.journey.learnerContext, ...updates.learnerContext }
          : record.journey.learnerContext,
      };

      const {
        data: { user },
      } = await db.auth.getUser();

      const journeyPatch: Database["public"]["Tables"]["journeys"]["Update"] = {};
      if (updates.title) journeyPatch.title = updates.title;
      if (updates.locationLabel) journeyPatch.location = updates.locationLabel;
      if (Object.keys(journeyPatch).length > 0) {
        journeyPatch.updated_at = new Date().toISOString();
        const { error: journeyError } = await db.from("journeys").update(journeyPatch).eq("id", journeyId);
        if (journeyError) throw journeyError;
      }

      const { error: versionError } = await db
        .from("journey_versions")
        .update({
          central_question: merged.thread.statement,
          audience: merged.learnerContext.description,
          description: merged.description ?? record.journey.description ?? "",
          duration_minutes: merged.durationMinutes ?? record.journey.durationMinutes ?? 90,
          learning_domains: merged.learningDomains ?? record.journey.learningDomains ?? [],
          prerequisite_concepts:
            merged.prerequisiteConcepts ?? record.journey.prerequisiteConcepts ?? [],
          status: updates.status
            ? (mapCreatorStatusToDb(updates.status) as Database["public"]["Tables"]["journey_versions"]["Update"]["status"])
            : undefined,
          artifact_template: buildVersionMeta(merged) as unknown as Database["public"]["Tables"]["journey_versions"]["Update"]["artifact_template"],
        })
        .eq("id", record.versionId);

      if (versionError) throw versionError;

      await recordAudit(db, "journey_version", record.versionId, "draft_saved", {
        source: "creator-beta",
        editor: user?.id,
      });

      const { data: journey } = await db
        .from("journeys")
        .select("id, slug, title, region, location")
        .eq("id", journeyId)
        .single();

      const { data: version } = await db
        .from("journey_versions")
        .select("*")
        .eq("id", record.versionId)
        .single();

      if (!journey || !version) throw new Error("Failed to reload journey");

      return loadJourneyRecord(db, journey as DbJourneyRow, version as DbVersionRow);
    },

    async listEncountersForJourney(journeyId) {
      const record = await this.getJourneyById(journeyId);
      return record?.encounters ?? [];
    },

    async getEncounterById(encounterId) {
      const { data: stop } = await db
        .from("journey_stops")
        .select("*")
        .eq("id", encounterId)
        .maybeSingle();

      if (!stop) return null;

      const { data: version } = await db
        .from("journey_versions")
        .select("journey_id")
        .eq("id", stop.journey_version_id)
        .maybeSingle();

      if (!version) return null;

      return stopRowToEncounter(version.journey_id, stop as DbStopRow);
    },

    async createEncounter(journeyId, input?: CreateCreatorBetaEncounterInput) {
      const record = await this.getJourneyById(journeyId);
      if (!record) throw new Error("Journey not found");
      if (!record.isEditable) throw new Error("Journey version is not editable");

      const order = record.encounters.length + 1;
      const draftEncounter: Encounter = {
        id: "",
        journeyId,
        order,
        title: input?.title ?? "Untitled Encounter",
        target: {
          type: input?.targetType ?? "other",
          label: input?.targetLabel ?? "Define what the learner will encounter",
        },
        learnerPrompt: "What should the learner attend to?",
        learnerAction: "Define a meaningful learner action.",
        evidenceRequest: {
          prompt: "What learner-produced evidence would make this Encounter meaningful?",
          allowedCaptureKinds: ["text"],
        },
        provenance: {
          origin: "creator",
          createdById: record.journey.creatorIds[0],
          sourceRefs: [],
          version: "creator-beta-v0.2",
        },
      };

      const stopInsert = encounterToStopInsert(record.versionId, draftEncounter);
      const { data: stopRow, error } = await db
        .from("journey_stops")
        .insert(stopInsert)
        .select("*")
        .single();

      if (error || !stopRow) throw error ?? new Error("Failed to create encounter");

      await recordAudit(db, "journey_stop", stopRow.id, "created", {
        source: "creator-beta",
        journeyId,
      });

      return stopRowToEncounter(journeyId, stopRow as DbStopRow);
    },

    async updateEncounter(encounterId, updates) {
      const current = await this.getEncounterById(encounterId);
      if (!current) throw new Error("Encounter not found");

      const record = await this.getJourneyById(current.journeyId);
      if (!record?.isEditable) throw new Error("Journey version is not editable");

      const merged: Encounter = {
        ...current,
        ...updates,
        target: updates.target ? { ...current.target, ...updates.target } : current.target,
        evidenceRequest: updates.evidenceRequest
          ? { ...current.evidenceRequest, ...updates.evidenceRequest }
          : current.evidenceRequest,
      };

      const { error } = await db
        .from("journey_stops")
        .update({
          title: merged.title,
          location_label: merged.target.label,
          purpose: merged.creatorIntent ?? merged.title,
          central_concept: merged.target.type,
          learning_objective: merged.evidenceRequest.prompt,
          opening_prompt: merged.learnerPrompt,
          field_action: merged.learnerAction,
          evidence_requirements: buildStopMeta(merged) as unknown as Database["public"]["Tables"]["journey_stops"]["Update"]["evidence_requirements"],
          safety_notes: merged.safetyNotes ?? [],
          accessibility_alternatives: merged.accessibilityAlternatives ?? [],
          artifact_contribution: merged.artifactContribution ?? null,
          resurfacing_connection: merged.resurfacingConnection ?? null,
          is_optional: merged.optional ?? false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", encounterId);

      if (error) throw error;

      await recordAudit(db, "journey_stop", encounterId, "updated", {
        source: "creator-beta",
      });

      return (await this.getEncounterById(encounterId))!;
    },
  };
}

export async function createSupabaseCreatorBetaRepository(): Promise<CreatorBetaRepository> {
  const db = await createClient();
  return createCreatorBetaRepository(db);
}
