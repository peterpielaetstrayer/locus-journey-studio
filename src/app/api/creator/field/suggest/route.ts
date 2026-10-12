import { NextResponse } from "next/server";
import { mapAuthErrorToResponse, requireAuthenticatedUser, requireOrganizationRole } from "@/lib/auth/authorize";
import {
  FIELD_AI_SCHEMA, fieldAiSuggestionToProposal,
  parseFieldAiInput, parseFieldAiSuggestion,
} from "@/lib/creator-beta/field-ai";

export const runtime = "nodejs";

/** Best-effort per-instance cooldown; production needs centralized enforcement. */
const lastCallByCreator = new Map<string, number>();
const COOLDOWN_MS = 30_000;

export async function POST(request: Request) {
  try {
    const ctx = await requireAuthenticatedUser();
    requireOrganizationRole(ctx, ["owner", "admin", "creator"]);
    // This feature is intentionally disabled unless an operator explicitly opts in.
    // A server-only allowlist prevents invited collaborators spending API budget.
    const allowedId = process.env.LOCUS_FIELD_AI_ALLOWED_CREATOR_ID;
    const apiKey = process.env.OPENAI_API_KEY;
    if (process.env.LOCUS_FIELD_AI_ENABLED !== "true" || !apiKey || !allowedId) {
      return NextResponse.json({ error: "Field AI is not enabled for this preview. Your notes are safe; use the local scaffold." }, { status: 503 });
    }
    if (ctx.user.id !== allowedId) {
      return NextResponse.json({ error: "Field AI is limited to the invited pilot creator." }, { status: 403 });
    }
    const raw = await request.text();
    if (raw.length > 6000) {
      return NextResponse.json({ error: "Field request is too large." }, { status: 413 });
    }
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch {
      return NextResponse.json({ error: "Expected a JSON observation." }, { status: 400 });
    }
    const input = parseFieldAiInput(parsed);
    if (!input) {
      return NextResponse.json({ error: "One valid, selected field observation is required." }, { status: 400 });
    }
    const now = Date.now();
    const last = lastCallByCreator.get(ctx.user.id) ?? 0;
    if (now - last < COOLDOWN_MS) {
      return NextResponse.json({ error: "Please review the previous suggestion before requesting another." }, { status: 429 });
    }
    if (lastCallByCreator.size > 100) lastCallByCreator.clear();
    lastCallByCreator.set(ctx.user.id, now);

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(18_000),
      body: JSON.stringify({
        model: process.env.LOCUS_FIELD_AI_MODEL || "gpt-5-mini",
        store: false,
        max_output_tokens: 1500,
        input: [
          {
            role: "developer",
            content: "You help an adult educator turn a personally observed phenomenon into one testable learning Encounter. The learner should ATTEND, ACT and produce EVIDENCE. The submitted observation is user-authored; it is not a verified scientific fact. Never claim to have viewed the environment or researched sources. Ask for factual verification, accessible alternatives and on-site safety. No claims about seeing photos, GPS or live surroundings. Return concrete, concise pedagogical suggestions. Do not publish or act for the creator.",
          },
          {
            role: "user",
            content: JSON.stringify({
              creatorObservation: input.observation,
              creatorPlaceLabel: input.placeLabel || "unspecified",
              intendedLearner: input.learnerContext || "adult test learner",
              request: "Propose one observation-based Encounter with a specific question, feasible physical-world action, authentic evidence request, a safety consideration and one fact-check question.",
            }),
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "field_encounter_suggestion_v1",
            strict: true,
            schema: FIELD_AI_SCHEMA,
          },
        },
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "The AI provider is temporarily unavailable. Your saved field notes are unchanged." }, { status: 502 });
    }
    const body = (await response.json()) as {
      status?: string;
      output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string }> }>;
    };
    if (body.status !== "completed") {
      return NextResponse.json({ error: "The model did not complete a usable suggestion. Your observation remains saved." }, { status: 502 });
    }
    const outputText = body.output?.flatMap((entry) => entry.content ?? [])
      .filter((content) => content.type === "output_text" && typeof content.text === "string")
      .map((content) => content.text).join("");
    if (!outputText || outputText.length > 9000) {
      return NextResponse.json({ error: "No valid suggestion was returned." }, { status: 502 });
    }
    let candidate: unknown;
    try { candidate = JSON.parse(outputText); } catch {
      return NextResponse.json({ error: "The suggestion could not be validated." }, { status: 502 });
    }
    const suggestion = parseFieldAiSuggestion(candidate);
    if (!suggestion) {
      return NextResponse.json({ error: "The suggestion did not pass review constraints." }, { status: 502 });
    }

    const proposal = fieldAiSuggestionToProposal(input, suggestion);
    return NextResponse.json({ proposal, generatedBy: "ai", reviewRequired: true }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    // Do not reveal provider secrets, raw user observations or internal errors.
    if (error instanceof Error && error.name === "TimeoutError") {
      return NextResponse.json({ error: "AI suggestion timed out. Your notes are unchanged." }, { status: 504 });
    }
    return mapAuthErrorToResponse(error);
  }
}
