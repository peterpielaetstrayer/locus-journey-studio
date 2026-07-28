import { NextResponse } from "next/server";
import {
  mapAuthErrorToResponse,
  requireAuthenticatedUser,
  requireEditableJourneyVersion,
  requireJourneyAccess,
} from "@/lib/auth/authorize";
import { getConnectedRepositories } from "@/lib/repositories";

export async function GET() {
  try {
    const ctx = await requireAuthenticatedUser();
    await requireJourneyAccess(ctx);
    const repos = await getConnectedRepositories();
    const draft = await repos.journeys.getCanonicalDraft("water-writes-the-landscape");
    if (!draft) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(draft);
  } catch (error) {
    return mapAuthErrorToResponse(error);
  }
}

export async function PUT(request: Request) {
  try {
    const ctx = await requireAuthenticatedUser();
    await requireEditableJourneyVersion(ctx);
    const body = (await request.json()) as {
      centralQuestion?: string;
      cypressPrompt?: string;
    };
    const repos = await getConnectedRepositories();
    const draft = await repos.journeys.getCanonicalDraft("water-writes-the-landscape");
    if (!draft) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!draft.isEditable) {
      return NextResponse.json({ error: "Version is not editable" }, { status: 403 });
    }
    const updated = {
      ...draft,
      journey: {
        ...draft.journey,
        centralQuestion: body.centralQuestion ?? draft.journey.centralQuestion,
      },
      stops: draft.stops.map((s) =>
        s.id === "stop-cypress-knee"
          ? { ...s, openingPrompt: body.cypressPrompt ?? s.openingPrompt }
          : s,
      ),
    };
    const saved = await repos.journeys.saveDraft(updated);
    return NextResponse.json(saved);
  } catch (error) {
    return mapAuthErrorToResponse(error);
  }
}

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
