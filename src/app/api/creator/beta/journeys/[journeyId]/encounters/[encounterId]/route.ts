import { NextResponse } from "next/server";
import {
  mapAuthErrorToResponse,
  requireAuthenticatedUser,
  requireJourneyAccess,
} from "@/lib/auth/authorize";
import { getConnectedCreatorBetaRepository } from "@/lib/repositories";
import type { Encounter } from "@/types/creator-beta";

type RouteContext = { params: Promise<{ journeyId: string; encounterId: string }> };

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { journeyId, encounterId } = await context.params;
    const ctx = await requireAuthenticatedUser();
    await requireJourneyAccess(ctx, journeyId, ["owner", "admin", "creator"]);
    const updates = (await request.json()) as Partial<Encounter>;
    const repo = await getConnectedCreatorBetaRepository();
    const encounter = await repo.updateEncounter(encounterId, updates);
    return NextResponse.json(encounter);
  } catch (error) {
    return mapAuthErrorToResponse(error);
  }
}
