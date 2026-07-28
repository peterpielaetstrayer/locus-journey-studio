import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type OrgRole = "owner" | "admin" | "creator" | "orchestrator" | "reviewer";

export class AuthError extends Error {
  readonly status = 401 as const;
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends Error {
  readonly status = 403 as const;
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export type AuthenticatedContext = {
  user: { id: string; email?: string };
  profile: { id: string; display_name: string; email: string } | null;
  memberships: Array<{ role: OrgRole; organization_id: string }>;
};

const OWLL_ORG_ID = "00000000-0000-4000-8000-000000000001";
const CANONICAL_JOURNEY_ID = "00000000-0000-4000-8000-000000000010";
const CANONICAL_VERSION_ID = "00000000-0000-4000-8000-000000000011";

const EDITABLE_DB_STATUSES = new Set([
  "concept",
  "draft",
  "field_test",
  "private_adult_walk",
]);

export function isDbVersionEditable(status: string): boolean {
  return EDITABLE_DB_STATUSES.has(status);
}

export async function requireAuthenticatedUser(): Promise<AuthenticatedContext> {
  if (!isSupabaseConfigured()) {
    throw new AuthError("Connected Mode is unavailable");
  }
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new AuthError();
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, email")
    .eq("id", user.id)
    .maybeSingle();
  const { data: memberships } = await supabase
    .from("organization_memberships")
    .select("role, organization_id")
    .eq("profile_id", user.id);
  return {
    user: { id: user.id, email: user.email },
    profile: profile as AuthenticatedContext["profile"],
    memberships: (memberships ?? []) as AuthenticatedContext["memberships"],
  };
}

export function requireOrganizationMembership(
  ctx: AuthenticatedContext,
  organizationId: string = OWLL_ORG_ID,
): AuthenticatedContext {
  const match = ctx.memberships.find((m) => m.organization_id === organizationId);
  if (!match) {
    throw new ForbiddenError();
  }
  return ctx;
}

export function requireOrganizationRole(
  ctx: AuthenticatedContext,
  roles: OrgRole[],
  organizationId: string = OWLL_ORG_ID,
): AuthenticatedContext {
  requireOrganizationMembership(ctx, organizationId);
  const allowed = ctx.memberships.some(
    (m) => m.organization_id === organizationId && roles.includes(m.role),
  );
  if (!allowed) {
    throw new ForbiddenError();
  }
  return ctx;
}

export async function requireJourneyAccess(
  ctx: AuthenticatedContext,
  journeyId: string = CANONICAL_JOURNEY_ID,
  roles: OrgRole[] = ["owner", "admin", "creator", "reviewer"],
): Promise<AuthenticatedContext> {
  const supabase = await createClient();
  const { data: journey, error } = await supabase
    .from("journeys")
    .select("id, organization_id")
    .eq("id", journeyId)
    .maybeSingle();
  if (error || !journey) {
    throw new ForbiddenError();
  }
  requireOrganizationRole(ctx, roles, journey.organization_id);
  return ctx;
}

export async function requireEditableJourneyVersion(
  ctx: AuthenticatedContext,
  versionId: string = CANONICAL_VERSION_ID,
): Promise<{ ctx: AuthenticatedContext; status: string }> {
  const supabase = await createClient();
  const { data: version, error } = await supabase
    .from("journey_versions")
    .select("id, status, journey_id")
    .eq("id", versionId)
    .maybeSingle();
  if (error || !version) {
    throw new ForbiddenError();
  }
  const { data: journey } = await supabase
    .from("journeys")
    .select("organization_id")
    .eq("id", version.journey_id)
    .maybeSingle();
  if (!journey) {
    throw new ForbiddenError();
  }
  requireOrganizationRole(ctx, ["owner", "admin", "creator"], journey.organization_id);
  if (!isDbVersionEditable(version.status)) {
    throw new ForbiddenError("Version is not editable");
  }
  return { ctx, status: version.status };
}

export async function requireAssignedOrchestrator(
  ctx: AuthenticatedContext,
  enrollmentId: string,
): Promise<AuthenticatedContext> {
  requireOrganizationRole(ctx, ["owner", "admin", "orchestrator"]);
  const supabase = await createClient();
  const { data: enrollment } = await supabase
    .from("journey_enrollments")
    .select("id, cohort_id")
    .eq("id", enrollmentId)
    .maybeSingle();
  if (!enrollment) {
    throw new ForbiddenError();
  }
  const isAdmin = ctx.memberships.some((m) =>
    ["owner", "admin"].includes(m.role),
  );
  if (isAdmin) {
    return ctx;
  }
  const { data: assignment } = await supabase
    .from("cohort_memberships")
    .select("id")
    .eq("cohort_id", enrollment.cohort_id)
    .eq("assigned_orchestrator_id", ctx.user.id)
    .maybeSingle();
  if (!assignment) {
    throw new ForbiddenError();
  }
  return ctx;
}

export function mapAuthErrorToResponse(error: unknown) {
  if (error instanceof AuthError) {
    return Response.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof ForbiddenError) {
    return Response.json({ error: error.message }, { status: 403 });
  }
  return Response.json({ error: "Request failed" }, { status: 500 });
}

export {
  OWLL_ORG_ID,
  CANONICAL_JOURNEY_ID,
  CANONICAL_VERSION_ID,
};
