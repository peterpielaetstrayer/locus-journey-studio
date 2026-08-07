import { NextResponse } from "next/server";
import {
  mapAuthErrorToResponse,
  requireAuthenticatedUser,
  requireJourneyAccess,
  requireOrganizationRole,
} from "@/lib/auth/authorize";
import { getConnectedCreatorBetaRepository } from "@/lib/repositories";
import type { UpdateCreatorBetaJourneyInput } from "@/lib/repositories/creator-beta-types";

type RouteContext = { params: Promise<{ journeyId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { journeyId } = await context.params;
    const ctx = await requireAuthenticatedUser();
    await requireJourneyAccess(ctx, journeyId);
    const repo = await getConnectedCreatorBetaRepository();
    const record = await repo.getJourneyById(journeyId);
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(record);
  } catch (error) {
    return mapAuthErrorToResponse(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { journeyId } = await context.params;
    const ctx = await requireAuthenticatedUser();
    await requireJourneyAccess(ctx, journeyId, ["owner", "admin", "creator"]);
    const updates = (await request.json()) as UpdateCreatorBetaJourneyInput;
    const repo = await getConnectedCreatorBetaRepository();
    const record = await repo.updateJourney(journeyId, updates);
    return NextResponse.json(record);
  } catch (error) {
    return mapAuthErrorToResponse(error);
  }
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { journeyId } = await context.params;
    const ctx = await requireAuthenticatedUser();
    requireOrganizationRole(ctx, ["owner", "admin", "creator"]);
    await requireJourneyAccess(ctx, journeyId, ["owner", "admin", "creator"]);
    const repo = await getConnectedCreatorBetaRepository();
    const encounter = await repo.createEncounter(journeyId);
    return NextResponse.json(encounter);
  } catch (error) {
    return mapAuthErrorToResponse(error);
  }
}
