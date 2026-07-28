import { NextResponse } from "next/server";
import { getRepositories } from "@/lib/repositories";

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
