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
import type { Database } from "@/types/database.types";
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
  await db.rpc("record_audit_event", {
    p_organization_id: OWLL_ORG_ID,
    p_entity_type: entityType,
    p_entity_id: entityId,
    p_action: action,
    p_metadata: metadata as Database["public"]["Functions"]["record_audit_event"]["Args"]["p_metadata"],
  });
}

async function getLatestEditableVersion(
  db: Db,
  journeyId: string,
): Promise<DbVersionRow | null> {
  const { data } = await db
    .from("journey_versions")
    .select("*")
    .eq("journey_id", journeyId)
    .order("created_at", { ascending: false });

  const versions = (data ?? []) as DbVersionRow[];
  const editable = versions.find((version) => isVersionEditable(version.status));
  return editable ?? versions[0] ?? null;
}

async function loadJourneyRecord(
  db: Db,
  journey: DbJourneyRow,
  version: DbVersionRow,
): Promise<CreatorBetaJourneyRecord> {
  const { data: stopRows } = await db
    .from("journey_stops")
    .select("*")
    .eq("journey_version_id", version.id)
    .order("position");

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
      const { data: journeyRows } = await db
        .from("journeys")
        .select("id, slug, title, location, updated_at")
        .eq("organization_id", OWLL_ORG_ID)
        .order("updated_at", { ascending: false });

      const summaries: CreatorBetaJourneySummary[] = [];

      for (const row of journeyRows ?? []) {
        const version = await getLatestEditableVersion(db, row.id);
        if (!version) continue;

        const { count } = await db
          .from("journey_stops")
          .select("id", { count: "exact", head: true })
          .eq("journey_version_id", version.id);

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
      const { data: journey } = await db
        .from("journeys")
        .select("id, slug, title, region, location")
        .eq("id", journeyId)
        .maybeSingle();

      if (!journey) return null;

      const version = await getLatestEditableVersion(db, journey.id);
      if (!version) return null;

      return loadJourneyRecord(db, journey as DbJourneyRow, version as DbVersionRow);
    },

    async createJourney(input: CreateCreatorBetaJourneyInput) {
      const {
        data: { user },
      } = await db.auth.getUser();

      const baseSlug = slugifyTitle(input.proposal.suggestedTitle);
      const slug = `${baseSlug}-${Date.now().toString(36).slice(-6)}`;

      const { data: journeyRow, error: journeyError } = await db
        .from("journeys")
        .insert({
          organization_id: OWLL_ORG_ID,
          slug,
          title: input.proposal.suggestedTitle,
          region: "General",
          location: input.proposal.suggestedLearnerContext.description.slice(0, 120) || "Unspecified",
          created_by: user?.id ?? null,
        })
        .select("id, slug, title, region, location")
        .single();

      if (journeyError || !journeyRow) {
        throw journeyError ?? new Error("Failed to create journey");
      }

      const draftJourney: CreatorJourney = {
        id: journeyRow.id,
        title: input.proposal.suggestedTitle,
        creatorIds: user?.id ? [user.id] : [],
        status: "draft",
        thread: input.proposal.suggestedThread,
        learnerContext: input.proposal.suggestedLearnerContext,
        encounterIds: [],
        sourceContext: [{ type: "other", id: input.proposal.id }],
        provenance: {
          origin: input.proposal.provenance.origin,
          createdById: user?.id,
          sourceRefs: [{ type: "other", id: input.proposal.id }],
          version: input.proposal.provenance.version,
        },
        description: input.proposal.seedText,
      };

      const { data: versionRow, error: versionError } = await db
        .from("journey_versions")
        .insert({
          journey_id: journeyRow.id,
          version_label: "Creator Beta draft",
          status: "draft",
          central_question: input.proposal.suggestedThread.statement,
          subtitle: "",
          description: input.proposal.seedText,
          audience: input.proposal.suggestedLearnerContext.description,
          artifact_template: buildVersionMeta(draftJourney) as unknown as Database["public"]["Tables"]["journey_versions"]["Insert"]["artifact_template"],
          created_by: user?.id ?? null,
        })
        .select("*")
        .single();

      if (versionError || !versionRow) {
        throw versionError ?? new Error("Failed to create journey version");
      }

      const encounters: Encounter[] = [];
      for (const [index, suggestion] of input.proposal.suggestedEncounters.entries()) {
        const encounter: Encounter = {
          id: "",
          journeyId: journeyRow.id,
          order: index + 1,
          title: suggestion.title,
          target: suggestion.target,
          learnerPrompt: suggestion.learnerPrompt,
          learnerAction: suggestion.learnerAction,
          evidenceRequest: suggestion.evidenceRequest,
          provenance: {
            origin: input.proposal.provenance.origin,
            sourceRefs: [{ type: "other", id: input.proposal.id }],
            version: input.proposal.provenance.version,
          },
        };

        const stopInsert = encounterToStopInsert(versionRow.id, encounter);
        const { data: stopRow, error: stopError } = await db
          .from("journey_stops")
          .insert(stopInsert)
          .select("*")
          .single();

        if (stopError || !stopRow) {
          throw stopError ?? new Error("Failed to create encounter");
        }

        encounters.push(stopRowToEncounter(journeyRow.id, stopRow as DbStopRow));
      }

      await recordAudit(db, "journey_version", versionRow.id, "version_created", {
        source: "creator-beta",
        encounterCount: encounters.length,
      });

      return loadJourneyRecord(db, journeyRow as DbJourneyRow, versionRow as DbVersionRow);
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
        await db.from("journeys").update(journeyPatch).eq("id", journeyId);
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
