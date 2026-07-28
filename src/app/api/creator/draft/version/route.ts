import { NextResponse } from "next/server";
import {
  mapAuthErrorToResponse,
  requireAuthenticatedUser,
  requireJourneyAccess,
} from "@/lib/auth/authorize";
import { getConnectedRepositories } from "@/lib/repositories";

export async function POST() {
  try {
    const ctx = await requireAuthenticatedUser();
    await requireJourneyAccess(ctx, undefined, ["owner", "admin", "creator"]);
    const repos = await getConnectedRepositories();
    const draft = await repos.journeys.createDraftVersion("water-writes-the-landscape");
    return NextResponse.json(draft);
  } catch (error) {
    return mapAuthErrorToResponse(error);
  }
}
