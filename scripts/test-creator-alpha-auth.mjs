/**
 * LOCUS Creator Alpha: real Supabase Auth + PostgREST + RLS smoke test.
 *
 * LOCAL STACK ONLY. Fails closed if pointed at a hosted project.
 * Uses synthetic adult CI identities, no actual emails or learner data.
 * Supabase local service-role key stays in process environment and is never logged.
 *
 * To run after supabase start + supabase db reset:
 *   API_URL=... ANON_KEY=... SERVICE_ROLE_KEY=... node scripts/test-creator-alpha-auth.mjs
 */
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const api = process.env.API_URL;
const anonKey = process.env.ANON_KEY;
const serviceKey = process.env.SERVICE_ROLE_KEY;
assert(api && anonKey && serviceKey, "Local Supabase API_URL/ANON_KEY/SERVICE_ROLE_KEY required");
const url = new URL(api);
// Hard block production and all other networks.
assert(
  ["127.0.0.1", "localhost"].includes(url.hostname) &&
    url.protocol === "http:" &&
    url.port === "54321",
  "SECURITY: This integration test runs only against local Supabase at port 54321",
);

const common = { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } };
const admin = createClient(api, serviceKey, common);
const anon = createClient(api, anonKey, common);
const identities = [
  { name: "A", email: "adult-creator-a@creator-alpha.example.invalid", role: "creator" },
  { name: "B", email: "adult-creator-b@creator-alpha.example.invalid", role: "creator" },
  { name: "C", email: "unassigned-adult@creator-alpha.example.invalid", role: null },
];
const password = "Synthetic-Only-Long-Test-Password-2026!";
const owllOrgId = "00000000-0000-4000-8000-000000000001";
let assertions = 0;
function check(condition, message) {
  assert(condition, message);
  assertions++;
}
function noError(res, message) {
  assert.equal(res.error, null, `${message}: ${res.error?.message ?? ""}`);
}
async function login(email) {
  const client = createClient(api, anonKey, common);
  const result = await client.auth.signInWithPassword({ email, password });
  noError(result, "Adult test sign-in");
  check(Boolean(result.data.session?.access_token), "Expected real Auth access token");
  return client;
}

for (const entry of identities) {
  const result = await admin.auth.admin.createUser({
    email: entry.email,
    password,
    email_confirm: true,
    user_metadata: { synthetic: true },
  });
  noError(result, `Create synthetic adult ${entry.name}`);
  check(Boolean(result.data.user?.id), "Local Auth user must have UUID");
  entry.id = result.data.user.id;
  // Trusted ADMIN ONLY bootstrap. No membership self-assignment endpoint exists.
  noError(await admin.from("profiles").insert({
    id: entry.id,
    email: entry.email,
    display_name: `Synthetic Adult ${entry.name}`,
  }), `Bootstrap profile ${entry.name}`);
  if (entry.role) {
    noError(await admin.from("organization_memberships").insert({
      organization_id: owllOrgId,
      profile_id: entry.id,
      role: entry.role,
    }), `Bootstrap trusted creator ${entry.name}`);
  }
}
console.log("Created three synthetic local adult Auth identities and trusted membership bootstrap.");

const a = await login(identities[0].email);
const b = await login(identities[1].email);
const c = await login(identities[2].email);

const anonsignup = await anon.auth.signUp({
  email: "uninvited@creator-alpha.example.invalid",
  password,
});
check(Boolean(anonsignup.error) || !anonsignup.data.user,
  "Public Auth signup must remain disabled in Creator Alpha local config");

const noAuth = await anon.from("journeys").select("id");
check(Boolean(noAuth.error), "Anonymous client must not read Journey table");

for (const [client, name] of [[a, "A"], [b, "B"], [c, "C"]]) {
  const r = await client.from("journeys").select("id");
  noError(r, `Initial visible Journeys for ${name}`);
  check(r.data.length === 0, "Fresh adult account must have zero Journeys");
}
const cDenied = await c.rpc("create_creator_journey", {
  p_slug: "unauthorized-creator",
  p_title: "Unauthorized",
  p_location: "Lab",
  p_thread: "Who is permitted?",
  p_audience: "Adult",
  p_description: "Unassigned adult test",
  p_version_meta: {},
  p_stops: [{
    position: 1, slug: "notice", title: "Notice", opening_prompt: "Notice",
    field_action: "Observe", learning_objective: "Consider the evidence",
  }],
});
check(Boolean(cDenied.error), "Unassigned adult must not invoke creator RPC");

const anonDenied = await anon.rpc("create_creator_journey", {
  p_slug: "anonymous-creator", p_title: "Unauthorized", p_location: "Lab",
  p_thread: "Can anon create?", p_audience: "Adult", p_description: "",
  p_version_meta: {}, p_stops: [{ position: 1, slug: "first", title: "First",
    opening_prompt: "Observe", field_action: "Look", learning_objective: "Learn" }],
});
check(Boolean(anonDenied.error), "Anonymous client must not invoke creator RPC");

const fakeOwner = await b.from("journeys").insert({
  organization_id: owllOrgId,
  slug: "forged-owner", title: "Impersonation", region: "General",
  location: "Lab", created_by: identities[0].id,
});
check(Boolean(fakeOwner.error), "B must never create A-owned Journey");

const created = await a.rpc("create_creator_journey", {
  p_slug: "real-auth-smoke-journey",
  p_title: "Water Writes the Landscape Test",
  p_location: "Synthetic field site",
  p_thread: "How does water shape a landscape?",
  p_audience: "Adult prototype",
  p_description: "Synthetic creator test, no learner responses",
  p_version_meta: {
    creatorBetaVersion: "0.2", threadType: "question",
    creatorIds: [identities[0].id], sourceContext: [],
    provenance: { origin: "creator", createdById: identities[0].id, sourceRefs: [], version: "creator-beta-v0.2" },
  },
  p_stops: [
    {
      position: 1, slug: "first", title: "Observe first",
      opening_prompt: "What do you notice?", field_action: "Observe safely",
      learning_objective: "Gather one observation", location_label: "Site",
      evidence_requirements: { creatorBetaVersion: "0.2", targetType: "place",
        evidenceRequest: { prompt: "Describe your observation", allowedCaptureKinds: ["text"] } },
    },
    {
      position: 2, slug: "second", title: "Make a claim",
      opening_prompt: "What could explain that?", field_action: "Compare observations",
      learning_objective: "Explain using evidence", location_label: "Site",
      evidence_requirements: { creatorBetaVersion: "0.2", targetType: "place",
        evidenceRequest: { prompt: "Write a claim", allowedCaptureKinds: ["text"] } },
    },
  ],
});
noError(created, "Create complete Journey via real Auth RPC");
const createdRow = created.data?.[0];
check(Boolean(createdRow?.journey_id && createdRow?.version_id),
  "RPC must return Journey and version IDs");
const journeyId = createdRow.journey_id;
const versionId = createdRow.version_id;

const own = await a.from("journeys").select("id,title").eq("id", journeyId).single();
noError(own, "Creator A reads own Journey through REST");
check(own.data.id === journeyId, "A must own created Journey");
const ownStops = await a.from("journey_stops").select("id,title").eq("journey_version_id", versionId);
noError(ownStops, "Creator A reads both Encounters");
check(ownStops.data.length === 2, "Two persisted Encounters must be visible");

const otherJourney = await b.from("journeys").select("id").eq("id", journeyId);
noError(otherJourney, "B's owner-filtered view");
check(otherJourney.data.length === 0, "B must not read A's Journey");
const otherStops = await b.from("journey_stops").select("id").eq("journey_version_id", versionId);
noError(otherStops, "B's owner-filtered stops");
check(otherStops.data.length === 0, "B must not read A's Encounters");
const otherUpdate = await b.from("journeys").update({ title: "B's unauthorized edit" })
  .eq("id", journeyId).select("id");
noError(otherUpdate, "B unauthorized update filtered by RLS");
check(otherUpdate.data.length === 0, "B must not edit A's Journey");

const forgedMembership = await a.from("organization_memberships").insert({
  organization_id: owllOrgId, profile_id: identities[2].id, role: "owner",
});
check(Boolean(forgedMembership.error), "A may not make C an owner");

const secondDevice = await login(identities[0].email);
const reopen = await secondDevice.from("journeys").select("id,title").eq("id", journeyId).single();
noError(reopen, "Independent second login reopens persisted Journey");
check(reopen.data.title === "Water Writes the Landscape Test", "Second login sees stored title");
const edit = await secondDevice.from("journey_versions")
  .update({ central_question: "What evidence explains water's influence?" })
  .eq("id", versionId).select("id,central_question").single();
noError(edit, "Independent second session edits own draft");
check(edit.data.central_question.includes("evidence"), "Second session update persisted");
const readAgain = await a.from("journey_versions")
  .select("central_question").eq("id", versionId).single();
noError(readAgain, "First session sees second-session edit");
check(readAgain.data.central_question === edit.data.central_question,
  "Two independent authenticated sessions observe same stored record");

const audits = await a.from("audit_events")
  .select("id").eq("entity_id", versionId);
noError(audits, "Creator A reads own audit");
check(audits.data.length === 1, "Atomic RPC audit exists");
const otherAudits = await b.from("audit_events").select("id").eq("entity_id", versionId);
noError(otherAudits, "Creator B audit visibility");
check(otherAudits.data.length === 0, "B must not read A's audit");

console.log(`PASS: ${assertions} actual Supabase Auth/PostgREST/RLS assertions, synthetic adult identities only.`);
