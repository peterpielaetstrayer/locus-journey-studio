import { NextResponse } from "next/server";
import {
  mapAuthErrorToResponse,
  requireAuthenticatedUser,
  requireOrganizationRole,
} from "@/lib/auth/authorize";
import { getConnectedCreatorBetaRepository } from "@/lib/repositories";
import type { CreateCreatorBetaJourneyInput } from "@/lib/repositories/creator-beta-types";

export async function GET() {
  try {
    const ctx = await requireAuthenticatedUser();
    requireOrganizationRole(ctx, ["owner", "admin", "creator", "reviewer"]);
    const repo = await getConnectedCreatorBetaRepository();
    const journeys = await repo.listJourneys();
    return NextResponse.json({ journeys, mode: repo.mode });
  } catch (error) {
    return mapAuthErrorToResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const ctx = await requireAuthenticatedUser();
    requireOrganizationRole(ctx, ["owner", "admin", "creator"]);
    const body = (await request.json()) as CreateCreatorBetaJourneyInput;
    if (!body.proposal?.suggestedTitle) {
      return NextResponse.json({ error: "Proposal is required" }, { status: 400 });
    }
    const repo = await getConnectedCreatorBetaRepository();
    const record = await repo.createJourney({
      proposal: body.proposal,
      creatorId: ctx.user.id,
    });
    return NextResponse.json(record);
  } catch (error) {
    return mapAuthErrorToResponse(error);
  }
}
