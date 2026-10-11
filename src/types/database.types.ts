export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_events: {
        Row: {
          action: string
          actor_profile_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json
          organization_id: string
        }
        Insert: {
          action: string
          actor_profile_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json
          organization_id: string
        }
        Update: {
          action?: string
          actor_profile_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_actor_profile_id_fkey"
            columns: ["actor_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_stops: {
        Row: {
          accessibility_alternatives: string[]
          artifact_contribution: string | null
          central_concept: string
          created_at: string
          evidence_requirements: Json
          field_action: string
          id: string
          is_hidden_until_unlocked: boolean
          is_optional: boolean
          journey_version_id: string
          learning_objective: string
          location_label: string
          mentor_interventions: Json
          opening_prompt: string
          position: number
          purpose: string
          resurfacing_connection: string | null
          safety_notes: string[]
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          accessibility_alternatives?: string[]
          artifact_contribution?: string | null
          central_concept: string
          created_at?: string
          evidence_requirements?: Json
          field_action: string
          id?: string
          is_hidden_until_unlocked?: boolean
          is_optional?: boolean
          journey_version_id: string
          learning_objective: string
          location_label: string
          mentor_interventions?: Json
          opening_prompt: string
          position: number
          purpose: string
          resurfacing_connection?: string | null
          safety_notes?: string[]
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          accessibility_alternatives?: string[]
          artifact_contribution?: string | null
          central_concept?: string
          created_at?: string
          evidence_requirements?: Json
          field_action?: string
          id?: string
          is_hidden_until_unlocked?: boolean
          is_optional?: boolean
          journey_version_id?: string
          learning_objective?: string
          location_label?: string
          mentor_interventions?: Json
          opening_prompt?: string
          position?: number
          purpose?: string
          resurfacing_connection?: string | null
          safety_notes?: string[]
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_stops_journey_version_id_fkey"
            columns: ["journey_version_id"]
            isOneToOne: false
            referencedRelation: "journey_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_versions: {
        Row: {
          artifact_template: Json
          audience: string
          central_question: string
          created_at: string
          created_by: string | null
          description: string
          duration_minutes: number
          enduring_understandings: string[]
          id: string
          journey_id: string
          learning_domains: string[]
          prerequisite_concepts: string[]
          published_at: string | null
          status: Database["public"]["Enums"]["journey_version_status"]
          subtitle: string
          supersedes_version_id: string | null
          version_label: string
        }
        Insert: {
          artifact_template?: Json
          audience?: string
          central_question: string
          created_at?: string
          created_by?: string | null
          description?: string
          duration_minutes?: number
          enduring_understandings?: string[]
          id?: string
          journey_id: string
          learning_domains?: string[]
          prerequisite_concepts?: string[]
          published_at?: string | null
          status?: Database["public"]["Enums"]["journey_version_status"]
          subtitle?: string
          supersedes_version_id?: string | null
          version_label: string
        }
        Update: {
          artifact_template?: Json
          audience?: string
          central_question?: string
          created_at?: string
          created_by?: string | null
          description?: string
          duration_minutes?: number
          enduring_understandings?: string[]
          id?: string
          journey_id?: string
          learning_domains?: string[]
          prerequisite_concepts?: string[]
          published_at?: string | null
          status?: Database["public"]["Enums"]["journey_version_status"]
          subtitle?: string
          supersedes_version_id?: string | null
          version_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_versions_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_versions_supersedes_version_id_fkey"
            columns: ["supersedes_version_id"]
            isOneToOne: false
            referencedRelation: "journey_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      journeys: {
        Row: {
          created_at: string
          created_by: string
          current_published_version_id: string | null
          id: string
          location: string
          organization_id: string
          region: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          current_published_version_id?: string | null
          id?: string
          location: string
          organization_id: string
          region: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          current_published_version_id?: string | null
          id?: string
          location?: string
          organization_id?: string
          region?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journeys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journeys_current_published_version_fk"
            columns: ["current_published_version_id"]
            isOneToOne: false
            referencedRelation: "journey_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journeys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_memberships: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          profile_id: string
          role: Database["public"]["Enums"]["org_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          profile_id: string
          role: Database["public"]["Enums"]["org_role"]
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          profile_id?: string
          role?: Database["public"]["Enums"]["org_role"]
        }
        Relationships: [
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_memberships_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_path: string | null
          created_at: string
          display_name: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          created_at?: string
          display_name: string
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      record_audit_event: {
        Args: {
          p_action: string
          p_entity_id: string
          p_entity_type: string
          p_metadata?: Json
          p_organization_id: string
        }
        Returns: string
      }
    }
    Enums: {
      journey_version_status:
        | "concept"
        | "draft"
        | "field_test"
        | "private_adult_walk"
        | "learner_pilot"
        | "published"
        | "archived"
      org_role: "owner" | "creator" | "orchestrator" | "reviewer" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      journey_version_status: [
        "concept",
        "draft",
        "field_test",
        "private_adult_walk",
        "learner_pilot",
        "published",
        "archived",
      ],
      org_role: ["owner", "creator", "orchestrator", "reviewer", "admin"],
    },
  },
} as const

