import { NextResponse } from "next/server";
import { getRepositories } from "@/lib/repositories";

export async function GET() {
  try {
    const repos = await getRepositories();
    const draft = await repos.journeys.getCanonicalDraft("water-writes-the-landscape");
    if (!draft) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(draft);
  } catch {
    return NextResponse.json({ error: "Unauthorized or unavailable" }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    const repos = await getRepositories();
    if (repos.mode !== "connected") {
      return NextResponse.json({ error: "Connected Mode required" }, { status: 400 });
    }
    const body = (await request.json()) as {
      centralQuestion?: string;
      cypressPrompt?: string;
    };
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
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Save failed" },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const repos = await getRepositories();
    if (repos.mode !== "connected") {
      return NextResponse.json({ error: "Connected Mode required" }, { status: 400 });
    }
    const draft = await repos.journeys.createDraftVersion("water-writes-the-landscape");
    return NextResponse.json(draft);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Version creation failed" },
      { status: 500 },
    );
  }
}
