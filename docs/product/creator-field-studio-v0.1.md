# Creator Field Studio v0.1 — Virginia Creator Pilot

**Status:** proposed product slice for review, not an implementation commitment or production release.
**Product:** LOCUS Journey Studio. **Reference:** First Landing, *Water Writes the Landscape*; design must work for another Virginia place and an independent Tahoe-area educator without special-case code.
**Basis:** OWLL / LOCUS Learning Architecture Charter v0.1 and `docs/product/creator-beta-product-spine-v0.2.md`.
**Do not confuse:** Existing Creator Beta passes synthetic local Auth/Chromium tests. Creator Field Studio, proactive AI guidance, and actual field-media workflows **do not exist yet**.

## 1. One concrete promise

An adult creator can stand at a real place, start or resume a Journey, capture a meaningful observation, converse with a **bounded AI learning-design collaborator**, inspect an editable proposed Encounter, accept or decline it, and reopen the complete session in Journey Studio on a desktop.

The creator remains the author and reviewer. AI cannot silently publish, edit a reviewed Journey, or claim to have seen an uncaptured feature. Learner Explore is a separate mode sharing explicit contracts, not a duplicate implementation.

**Job to be done:** "I am at First Landing, noticing something interesting. Help me turn what I see into a learning experience I can genuinely test and refine."

## 2. Design invariants

1. **World as interface:** field observations and questions, rather than forms or generated lessons, are the default entry point.
2. **Freedom at surface, structure underneath:** conversation and captures produce existing Journey Thread/Encounter shapes rather than custom Virginia tables.
3. **Creator authority:** AI returns *proposals* with rationale and uncertainty. User must accept/edit/discard explicitly.
4. **Observation before explanation:** default prompt asks what is actually observed and how it might be tested; avoid instant polished answers.
5. **Private by default:** photos, voice, location, and unreviewed drafts remain private. No passive camera, microphone or precise GPS collection.
6. **Continuity:** make save/queued/failed/retry status visible; browser disappearance cannot silently erase authored work.
7. **Inspectability:** label creator statements, captured observations, sourced facts, and AI inferences distinctly.
8. **Phones first, glasses ready:** same observation ingestion contract can later accept supported wearable inputs without requiring always-on video.
9. **Adult creator only in first alpha:** no classroom enrollment, student photos, youth data, background recordings, or public publication.
10. **Not a chatbot veneer:** AI must help create an inspectable, field-testable Encounter, not merely provide conversational text.

## 3. Canonical field flow

```text
My Journeys
  → Enter Field Studio (existing Journey OR exploratory new session)
  → Permission choice (optional location; camera/mic on explicit action)
  → Field Session (voice/text/photo capture; visible save state)
  → Ask / notice / reflect with AI on active Journey and captures
  → AI returns typed EncounterSuggestion (not canonical mutation)
  → Creator edits, rejects or accepts suggestion
  → Accepted draft maps to existing Encounter, preserving provenance
  → Desktop Journey Studio opens source Session, captures, and draft Encounter
  → Creator validates facts/safety/accessibility, field-tests and learner-previews
```

Field note and Encounter are different objects: the observation is not automatically a pedagogically sound activity, and a learner's captured Evidence is not creator input.

### Mobile surface (one task per screen)

- Top: Journey name, "Field Session", optional **approximate** place, session/sync status.
- Main: conversation timeline with clear distinction among observation, source, AI suggestion, and creator decision.
- Primary thumb controls: **Note**, **Photo**, **Speak**, **Ask LOCUS**. No always-on listening.
- Suggestion panel: learning objective, learner action, evidence requirement, factual assumptions/source status, safety/access alternatives; **Accept draft / Edit / Save for later / Dismiss**.
- Session drawer: today's captures, pending sync, drafts, permission controls; **Return to Studio**.
- Desktop: session inbox and selected Journey, linked observations/suggestions, editor and learner preview.

Accessibility: large touch targets, transcripts/captions, keyboard navigation, high contrast, audio-off text alternative, reduced motion, and physical-access alternatives.

## 4. Proposed minimum structured contracts

These are conceptual API shapes, **not yet approved migrations**. Prefer reuse of existing Creator Beta types and repository patterns.

```typescript
type FieldSession = {
  id: string; creatorId: string; journeyId?: string;
  startedAt: string; updatedAt: string; status: "active" | "paused" | "completed";
  placeLabel?: string; // coarse and optional; precise GPS not required
};
type FieldObservation = {
  id: string; sessionId: string; creatorId: string;
  kind: "text" | "photo" | "voice"; note?: string; mediaRef?: string;
  createdAt: string; source: "creator_capture";
  privacy: "private"; uploadStatus: "local" | "queued" | "saved" | "failed";
};
type EncounterSuggestion = {
  id: string; sessionId: string; journeyId?: string;
  observationIds: string[]; title: string;
  learningObjective: string; learnerPrompt: string;
  learnerAction: string; evidenceRequest: string;
  factualAssumptions: string[]; sourceRefs: string[];
  safetyNotes: string[]; accessibilityAlternatives: string[];
  rationale: string; uncertainty: string[];
  provenance: { origin: "ai_generated"; model?: string; reviewedByCreator: boolean };
  status: "proposed" | "accepted" | "dismissed";
};
```

**Ownership and sync:** creator-owned tables/storage (if cloud persistence is approved), RLS by creator, signed/private image references, upload consent, and no service-role credential in client. Field text should survive a network outage; media remains local/explicit pending upload until confirmed. New data model and migrations require security review. Reuse existing `Journey`, `Encounter`, `DraftJourneyProposal`, and Manifest contracts on acceptance. Do not overload the learner's simulated `FieldNoteCapture` or convert learner data into creator artifacts.

## 5. Bounded AI collaboration

First useful AI action: **"Suggest a testable Encounter from these observations, in the context of this Journey."** Inputs require the creator's chosen captures, an active Journey Thread, selected age/audience, and consented place context if available. Where place facts require verification, retrieve cited material or mark as hypotheses needing research.

Output is a schema-validated `EncounterSuggestion`, not a direct write to `journey_stops`. Must state what is observed versus inferred and include at least one action asking the learner to attend, act and produce Evidence. Creator reviews before the canonical draft changes.

**Inference budget**: send text/lightweight context by default; upload/analyze one explicit photo or transcribed short voice note on request; cache repeat suggestions; token/output cap, cooldown, provider failure handling and per-session cost ledger. No constant frames, blanket location histories or compulsory GPS.

**Proactive v0.x**: only opt-in, triggered by meaningful non-sensitive context changes (new capture, route milestone, creator request, or approved coarse location event), with Quiet / Occasional / Active controls. Never imply live visual perception without a deliberately captured image. GPS boundary, bystander privacy, site rules and safety must be tested before on-location prompts.

## 6. Build increments with explicit gates

| Increment | Work | Evidence required |
|---|---|---|
| 0. Hosted foundation | Deploy **exact CI-passing** connected preview SHA, verify Vercel protection, invite one approved adult in hosted Supabase Auth and trusted creator membership, run cloud reopen/export | User can log in and edit/reopen one adult-only Journey; no prod change |
| 1. Field Session shell | Mobile-first session UI; attach to Journey; **text capture**, durable local queue, permission controls, saved/session inbox and desktop continuity | Phone capture survives refresh/poor reception; desktop can find it |
| 2. Assisted Encounter | Server-side budgeted real AI proposal using selected capture + Journey; provenance, human approve/edit, existing Encounter adapter | A genuine observation becomes one editable draft Encounter with clear source/fact caveats |
| 3. Multimodal field inputs | Explicit photo and voice capture/transcription, upload and failure recovery, opt-in coarse location | Same Encounter flow works with camera/voice; no passive capture |
| 4. First Landing field trial | Founder 20–30 min on site, one useful Encounter, re-open and refine at desk; replay via learner preview | Real usability evidence, field bugs/latency/cost/accuracy captured |
| 5. Generality + creator handoff | Second distinct Virginia setting; later independent Tahoe-area educator creation test | Works without hardcoded First Landing data or founder intervention |

Do not represent increments 0–5 as already implemented. Detailed sequencing remains contingent on prototype feedback.

## 7. Actual field test / decision criteria

**First Landing creator walk:** creator starts session, captures >=3 observations, gets >=1 meaningful proposed Encounter, accepts/edits one, sees all captures on desktop, tests the Encounter as learner, records inaccuracies and missing safeguards. No claim that observation alone demonstrates learner mastery.

Measure: time to first useful capture; successful persistence after offline/poor connectivity; number of prompts and AI invocations; latency and approximate cost; suggestion usefulness; factual/source errors; safety/accessibility gaps; seconds to approve a useful Encounter; uninterrupted interaction while walking.

**Transfer test:** creator without coding experience can open an account, create a place-based Journey elsewhere, capture field material, edit the suggestion, and preview it. Prospective independent educator Kelsey/Tahoe is an **optional candidate**, not a confirmed scheduled partner.

**Commercial validation:** after a successful field workflow, offer a narrowly scoped paid custom-Journey design/field-test service to qualified adult customers/partners and learn their willingness to pay; do not assume subscriptions or marketplace revenue. Keep work/employer resources and youth permissions separate.

## 8. Immediate repository and deployment hygiene

- Existing Creator Alpha branch `preview/creator-alpha-connected-20261011` has verified tests at `25f0e079...`, but an earlier Vercel connected preview was the only READY deployment at the previous verification; confirm exact commit before claiming it is live.
- Hosting Supabase dev schema has 7 RLS-enabled tables; first invited Auth creator not yet provisioned at previous verification. Confirm live status before new DDL.
- Remote migration history IDs differ from local filenames; **do not blindly push migrations**.
- Keep existing operational PR stack reviewable; this design should not be merged/deployed merely because it has been documented.
- Product implementation should be a *separate stacked draft PR*, tests and access boundaries per increment.
- Do not expand into youth cohorts, wearable video streaming, maps everywhere, marketplace, regional content scale or complex multi-agent orchestration before the first working field-to-desk loop.

## 9. Explicit next choice

Approve the **scope and experience bar** for increment 1, then implement a phone-first **field-session capture and resume** draft slice with tests. Keep increment 2 as the minimum *AI-enabled* extension, not an endless research phase. Separately finish increment 0 with controlled hosted preview access. Review UI with actual phone use before broadening to media/GPS.
