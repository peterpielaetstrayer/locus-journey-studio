export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          display_name: string;
          email: string;
          avatar_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          email: string;
          avatar_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      organization_memberships: {
        Row: {
          id: string;
          organization_id: string;
          profile_id: string;
          role: "owner" | "creator" | "orchestrator" | "reviewer" | "admin";
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          profile_id: string;
          role: "owner" | "creator" | "orchestrator" | "reviewer" | "admin";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["organization_memberships"]["Insert"]>;
      };
      learner_profiles: {
        Row: {
          id: string;
          organization_id: string;
          display_name: string;
          age_band: string;
          interests: string[];
          strengths: string[];
          growth_areas: string[];
          preferred_capture_modes: string[];
          accessibility_preferences: string[];
          identity_pathways: string[];
          adaptation_profile: "curious" | "movement" | "structured";
          is_demo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["learner_profiles"]["Row"]> & {
          organization_id: string;
          display_name: string;
          age_band: string;
        };
        Update: Partial<Database["public"]["Tables"]["learner_profiles"]["Insert"]>;
      };
      journeys: {
        Row: {
          id: string;
          organization_id: string;
          slug: string;
          title: string;
          region: string;
          location: string;
          created_by: string | null;
          current_published_version_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["journeys"]["Row"]> & {
          organization_id: string;
          slug: string;
          title: string;
          region: string;
          location: string;
        };
        Update: Partial<Database["public"]["Tables"]["journeys"]["Insert"]>;
      };
      journey_versions: {
        Row: {
          id: string;
          journey_id: string;
          version_label: string;
          status:
            | "concept"
            | "draft"
            | "field_test"
            | "private_adult_walk"
            | "learner_pilot"
            | "published"
            | "archived";
          central_question: string;
          subtitle: string;
          description: string;
          audience: string;
          duration_minutes: number;
          learning_domains: string[];
          enduring_understandings: string[];
          prerequisite_concepts: string[];
          artifact_template: Json;
          created_by: string | null;
          created_at: string;
          published_at: string | null;
          supersedes_version_id: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["journey_versions"]["Row"]> & {
          journey_id: string;
          version_label: string;
          central_question: string;
        };
        Update: Partial<Database["public"]["Tables"]["journey_versions"]["Insert"]>;
      };
      journey_stops: {
        Row: {
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
          evidence_requirements: Json;
          mentor_interventions: Json;
          safety_notes: string[];
          accessibility_alternatives: string[];
          artifact_contribution: string | null;
          resurfacing_connection: string | null;
          is_optional: boolean;
          is_hidden_until_unlocked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["journey_stops"]["Row"]> & {
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
        };
        Update: Partial<Database["public"]["Tables"]["journey_stops"]["Insert"]>;
      };
      adaptive_branches: {
        Row: {
          id: string;
          journey_stop_id: string;
          name: string;
          learner_type: string;
          activation_type: string;
          trigger_description: string;
          prompt: string;
          action: string;
          evidence_expectation: string;
          return_to_core: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["adaptive_branches"]["Row"]> & {
          journey_stop_id: string;
          name: string;
          learner_type: string;
          activation_type: string;
          trigger_description: string;
          prompt: string;
          action: string;
          evidence_expectation: string;
        };
        Update: Partial<Database["public"]["Tables"]["adaptive_branches"]["Insert"]>;
      };
      field_notes: {
        Row: {
          id: string;
          journey_enrollment_id: string;
          journey_stop_id: string;
          learner_profile_id: string;
          created_by_profile_id: string | null;
          capture_type: string;
          media_asset_id: string | null;
          observation: string;
          inference: string | null;
          hypothesis: string | null;
          evidence: Json;
          alternative_explanation: string | null;
          confidence: number;
          question: string | null;
          visibility: "private" | "mentor" | "artifact";
          mentor_reviewed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["field_notes"]["Row"]> & {
          journey_enrollment_id: string;
          journey_stop_id: string;
          learner_profile_id: string;
          capture_type: string;
          observation: string;
          confidence: number;
        };
        Update: Partial<Database["public"]["Tables"]["field_notes"]["Insert"]>;
      };
      mentor_interventions: {
        Row: {
          id: string;
          journey_enrollment_id: string;
          journey_stop_id: string | null;
          learner_profile_id: string;
          created_by_profile_id: string | null;
          category: string;
          recommendation_source: string;
          reason: string;
          message: string;
          status: string;
          override_reason: string | null;
          delivered_at: string | null;
          learner_response: string | null;
          outcome: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["mentor_interventions"]["Row"]> & {
          journey_enrollment_id: string;
          learner_profile_id: string;
          category: string;
          recommendation_source: string;
          reason: string;
          message: string;
        };
        Update: Partial<Database["public"]["Tables"]["mentor_interventions"]["Insert"]>;
      };
      artifacts: {
        Row: {
          id: string;
          journey_enrollment_id: string;
          learner_profile_id: string;
          journey_version_id: string;
          title: string;
          selected_media_asset_id: string | null;
          original_hypothesis: string;
          strongest_evidence: Json;
          revised_explanation: string;
          systems_map: Json;
          remaining_question: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["artifacts"]["Row"]> & {
          journey_enrollment_id: string;
          learner_profile_id: string;
          journey_version_id: string;
          title: string;
          original_hypothesis: string;
          revised_explanation: string;
          remaining_question: string;
        };
        Update: Partial<Database["public"]["Tables"]["artifacts"]["Insert"]>;
      };
      journey_reviews: {
        Row: {
          id: string;
          journey_version_id: string;
          reviewer_profile_id: string;
          category:
            | "learning_design"
            | "factual"
            | "sources"
            | "safety"
            | "accessibility"
            | "field_test"
            | "maintenance";
          status: string;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["journey_reviews"]["Row"]> & {
          journey_version_id: string;
          reviewer_profile_id: string;
          category: Database["public"]["Tables"]["journey_reviews"]["Row"]["category"];
          status: string;
        };
        Update: Partial<Database["public"]["Tables"]["journey_reviews"]["Insert"]>;
      };
      audit_events: {
        Row: {
          id: string;
          organization_id: string;
          actor_profile_id: string | null;
          entity_type: string;
          entity_id: string;
          action: string;
          metadata: Json;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["audit_events"]["Row"]> & {
          organization_id: string;
          entity_type: string;
          entity_id: string;
          action: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_events"]["Insert"]>;
      };
      media_assets: {
        Row: {
          id: string;
          organization_id: string;
          owner_profile_id: string | null;
          bucket: string;
          object_path: string;
          mime_type: string;
          size_bytes: number;
          alt_text: string;
          visibility: "private" | "mentor" | "artifact" | "organization";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["media_assets"]["Row"]> & {
          organization_id: string;
          bucket: string;
          object_path: string;
          mime_type: string;
        };
        Update: Partial<Database["public"]["Tables"]["media_assets"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
