# Creator Field AI alpha — operator gate (not active by default)

This is a **code-only adult pilot integration**, stacked on Creator Field Studio PR #15. It is **disabled unless explicitly enabled** and requires a server-side OpenAI API key, creator allowlist, Vercel preview access protection and an operator-controlled API spend limit. Do not add secrets to `NEXT_PUBLIC_*` or commit them.

## What this actually implements

A signed-in OWLL owner/admin/creator can explicitly choose **Ask LOCUS AI** on one previously saved text observation in `/creator/field`. The browser sends **only that selected observation, its local IDs, an optional manually typed place label, and audience text** to `/api/creator/field/suggest`. No background processing or continuous location/photo/audio monitoring occurs. The server checks authenticated membership and a single explicitly approved Auth user ID; calls the Responses API with `store:false`, structured JSON schema, 1,500 output-token cap, and an 18-second timeout; validates output again; and returns an **editable draft proposal**. Nothing is published or written to Supabase until the creator chooses **Create editable Journey draft**.

The suggestion has explicit `ai_generated` provenance and links to the creator's capture ID. Safety and fact-check notes are visible in the review rationale. **These notes are not yet persisted as dedicated Encounter safety/source fields**, so the creator must fill/review these in Journey Studio before any field test or sharing. The model does not browse research sources and should not assert site-specific facts as verified.

The deterministic scaffold remains accessible without an API key. If not enabled, the server returns HTTP 503; there is no silent AI simulation or client-side key fallback.

## Activation prerequisites (operator action, not completed)

1. Protected, correct-SHA Vercel Preview; first verified adult creator Auth account and membership; no public signup.
2. In **Preview-scoped, server-only** environment variables: `OPENAI_API_KEY`, `LOCUS_FIELD_AI_ENABLED=true`, `LOCUS_FIELD_AI_ALLOWED_CREATOR_ID=<exact invited Supabase auth.users.id>`. Optional `LOCUS_FIELD_AI_MODEL` (default `gpt-5-mini`).
3. Dedicated provider project with a restrictive spend budget and usage alerts, **and** robust centralized per-creator quota enforcement before more than a supervised one-creator trial. The current 30-second server-process cooldown is best effort only and is **not** a durable multi-instance rate limit. This limitation is a production blocker.
4. Obtain informed adult consent for sending selected notes to a third-party model API. Avoid people-identifying material or youth data. Review provider retention/data-processing and cost settings before enabling.
5. Run hosted smoke validation: disabled endpoint 503, unauthorized creator 403, approved creator receives one structurally valid proposal, edit/approve journey, reload, inspect audit and provider usage. Verify no public key disclosure.

## Test status / boundaries

CI has pure contract tests (input size, typed output, provenance) and a browser assertion that disabled-by-default settings return 503. **No real provider API request is made in CI.** API functionality cannot be claimed live until the authorized operator configures preview-only secrets and verifies one controlled request.

No schema migrations, payment changes, OpenAI billing activation or hosted Supabase modification in this PR. Keep all changes in draft until reviewed.
