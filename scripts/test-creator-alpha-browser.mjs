/**
 * Creator Alpha browser acceptance test. Runs on temporary local Supabase only.
 * Prerequisites: scripts/test-creator-alpha-auth.mjs seeded three synthetic adults,
 *              Next.js running against local Supabase, Chromium installed.
 *
 * No hosted Supabase, no real user accounts, no children's data, no cloud deploy.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";

const base = process.env.CREATOR_ALPHA_BROWSER_URL ?? "http://127.0.0.1:3000";
const url = new URL(base);
assert(["127.0.0.1", "localhost"].includes(url.hostname) &&
  url.protocol === "http:" && url.port === "3000",
"Creator Alpha browser test is LOCAL ONLY on port 3000");

const password = "Synthetic-Only-Long-Test-Password-2026!";
const creatorEmail = "adult-creator-a@creator-alpha.example.invalid";
const secondCreatorEmail = "adult-creator-b@creator-alpha.example.invalid";
const unassignedEmail = "unassigned-adult@creator-alpha.example.invalid";
let assertions = 0;
function check(value, description) {
  assert(value, description);
  assertions++;
}
const browser = await chromium.launch({ headless: true });
const contextA = await browser.newContext({ acceptDownloads: true });
const pageA = await contextA.newPage();
pageA.setDefaultTimeout(20_000);

async function login(page, email) {
  await page.goto(base + "/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: /^Sign in$/ }).click();
  await page.waitForURL("**/creator", { timeout: 30_000 });
  await page.getByRole("heading", { name: "My Journeys" }).waitFor();
}

try {
  console.log("Browser: logging in invited synthetic adult A");
  await login(pageA, creatorEmail);
  await pageA.getByRole("link", { name: /Create Journey/ }).first().click();
  await pageA.getByLabel("Tell LOCUS what you have in mind").fill(
    "Explore how water shapes a shoreline through observation and comparison. " +
    "Prototype for an adult test only, no personal information.");
  await pageA.getByRole("button", { name: "Help me shape this Journey" }).click();
  await pageA.getByRole("heading", { name: "Here is how LOCUS is structuring your idea" }).waitFor();
  const requestedTitle = "Browser Alpha Shoreline Investigation";
  await pageA.getByLabel("Journey title").fill(requestedTitle);
  await pageA.getByRole("button", { name: "Create editable Journey draft" }).click();
  await pageA.waitForURL(/\/creator\/beta\/[0-9a-f-]{36}$/, { timeout: 35_000 });
  const journeyId = pageA.url().split("/").at(-1);
  check(/^[0-9a-f-]{36}$/i.test(journeyId), "Real browser created UUID-backed Journey");
  await pageA.getByText("Connected persistence").waitFor();

  // The user actually edits the browser UI; no direct REST writes stand in for it.
  const updatedTitle = "Browser Verified Shoreline Journey";
  await pageA.getByLabel("Journey title").fill(updatedTitle);
  await pageA.getByRole("status").filter({ hasText: "Saved" }).waitFor({ timeout: 30_000 });

  // Separate browser context = no shared cookies, localStorage or Zustand store.
  const contextB = await browser.newContext({ acceptDownloads: true });
  const pageB = await contextB.newPage();
  pageB.setDefaultTimeout(20_000);
  try {
    console.log("Browser: reopening creator record in independent signed-in session");
    await login(pageB, creatorEmail);
    await pageB.getByRole("link", { name: new RegExp(updatedTitle) }).first().click();
    await pageB.waitForURL(new RegExp(`/creator/beta/${journeyId}$`));
    await pageB.getByLabel("Journey title").waitFor();
    check(await pageB.getByLabel("Journey title").inputValue() === updatedTitle,
      "Separate browser login read persisted title");

    // Fail one connected save request; UI must show failure, and retry must persist.
    let failedOnce = false;
    await pageB.route(`**/api/creator/beta/journeys/${journeyId}`, async (route) => {
      if (!failedOnce && route.request().method() === "PUT") {
        failedOnce = true;
        await route.abort("failed");
      } else {
        await route.continue();
      }
    });
    const retryTitle = "Browser Retried and Persisted Journey";
    await pageB.getByLabel("Journey title").fill(retryTitle);
    await pageB.getByRole("button", { name: "Retry unsaved changes" })
      .waitFor({ timeout: 30_000 });
    check(failedOnce, "Connected editor attempted a real request and surfaced failure");
    await pageB.unroute(`**/api/creator/beta/journeys/${journeyId}`);
    await pageB.getByRole("button", { name: "Retry unsaved changes" }).click();
    await pageB.getByRole("status").filter({ hasText: "Saved" })
      .waitFor({ timeout: 30_000 });

    // Force a full reload, not optimistic state reuse.
    await pageB.reload();
    await pageB.getByLabel("Journey title").waitFor();
    check(await pageB.getByLabel("Journey title").inputValue() === retryTitle,
      "Retried connected write survives fresh browser reload");

    console.log("Browser: exporting portable Journey Manifest v0.1");
    const [download] = await Promise.all([
      pageB.waitForEvent("download"),
      pageB.getByRole("button", { name: "Export draft manifest (.json)" }).click(),
    ]);
    const downloaded = JSON.parse(await readFile(await download.path(), "utf8"));
    check(downloaded.manifestVersion === "0.1", "Exported portable Manifest v0.1");
    check(downloaded.journey.id === journeyId, "Exported Manifest matches persisted Journey");
    check(downloaded.journey.title === retryTitle, "Manifest contains saved title");
    check(Array.isArray(downloaded.encounters) && downloaded.encounters.length >= 1,
      "Manifest preserves learner Encounters");
    check(!("learnerResponses" in downloaded), "Manifest does not contain learner responses");
  } finally {
    await contextB.close();
  }

  // An HTTP response can disappear AFTER the server commits its transaction.
  // Clicking Create again with the same proposal must return the existing draft.
  console.log("Browser: forcing committed-create response loss and safely retrying");
  await pageA.goto(base + "/creator/new");
  await pageA.getByLabel("Tell LOCUS what you have in mind").fill(
    "Investigate a synthetic adult tidal basin as an evidence-based Journey.");
  await pageA.getByRole("button", { name: "Help me shape this Journey" }).click();
  await pageA.getByRole("heading", { name: "Here is how LOCUS is structuring your idea" }).waitFor();
  const idempotentTitle = "Idempotent Response Loss Demonstration";
  await pageA.getByLabel("Journey title").fill(idempotentTitle);
  let firstCommittedId;
  let swallowed = false;
  await pageA.route("**/api/creator/beta/journeys", async (route) => {
    if (route.request().method() === "POST" && !swallowed) {
      const response = await route.fetch();
      check(response.ok(), "First request committed before deliberate response loss");
      const firstBody = await response.json();
      firstCommittedId = firstBody.journey.id;
      swallowed = true;
      await route.abort("failed"); // browser sees error AFTER persisted DB commit
      return;
    }
    await route.continue();
  });
  await pageA.getByRole("button", { name: "Create editable Journey draft" }).click();
  await pageA.getByText("Failed to fetch").waitFor({ timeout: 30_000 });
  check(swallowed && Boolean(firstCommittedId), "Commit occurred but browser lost response");
  // The proposal is NOT regenerated: one stable proposal ID = one Journey.
  await pageA.getByRole("button", { name: "Create editable Journey draft" }).click();
  await pageA.waitForURL(/\/creator\/beta\/[0-9a-f-]{36}$/, { timeout: 35_000 });
  check(pageA.url().endsWith(firstCommittedId),
    "Create retry returned the exact originally committed Journey");
  await pageA.unroute("**/api/creator/beta/journeys");
  const matching = await pageA.evaluate(async (title) => {
    const response = await fetch("/api/creator/beta/journeys", { cache: "no-store" });
    if (!response.ok) throw Error("Could not verify connected library after retry");
    const { journeys } = await response.json();
    return journeys.filter((journey) => journey.title === title).map((journey) => journey.id);
  }, idempotentTitle);
  check(matching.length === 1 && matching[0] === firstCommittedId,
    "A retried committed POST creates no second Journey");

  // A different member of the same org MUST NOT see this Journey.
  const contextOther = await browser.newContext();
  const other = await contextOther.newPage();
  try {
    await login(other, secondCreatorEmail);
    const response = await other.evaluate(async (id) => {
      const result = await fetch(`/api/creator/beta/journeys/${id}`);
      return result.status;
    }, journeyId);
    check(response === 403 || response === 404,
      "Second adult creator cannot access first creator's Journey through app API");
  } finally {
    await contextOther.close();
  }
  const contextUnassigned = await browser.newContext();
  const unassigned = await contextUnassigned.newPage();
  try {
    await login(unassigned, unassignedEmail);
    const response = await unassigned.evaluate(async () => {
      const result = await fetch("/api/creator/beta/journeys");
      return result.status;
    });
    check(response === 403, "Unassigned adult denied connected library through Next.js API");
  } finally {
    await contextUnassigned.close();
  }

  // Phone-first Creator Field Studio: real browser capture → reload → draft.
  console.log("Browser: Creator Field Studio captures a real observation into a connected Journey");
  await pageA.goto(base + "/creator/field");
  await pageA.getByRole("heading", { name: "Notice something. Build from it." }).waitFor();
  const fieldObservation = "A synthetic observation of different soil textures near a boardwalk";
  await pageA.getByLabel("Your field observation").fill(fieldObservation);
  await pageA.getByRole("button", { name: "Keep observation" }).click();
  await pageA.getByText("FIELD NOTE 1").waitFor();
  check(await pageA.getByText(fieldObservation).count() === 1,
    "Creator saved a field observation using the mobile field UI");
  await pageA.reload();
  await pageA.getByText(fieldObservation).waitFor();
  check(await pageA.getByText("FIELD NOTE 1").count() === 1,
    "Field observation survives full browser reload");
  await pageA.getByRole("button", { name: "Shape an Encounter" }).click();
  await pageA.getByRole("heading", { name: "Review the Encounter scaffold" }).waitFor();
  const fieldTitle = "Field Studio Browser Created Journey";
  await pageA.getByLabel("Journey title").fill(fieldTitle);
  await pageA.getByRole("button", { name: "Create editable Journey draft" }).click();
  const fieldLink = pageA.getByRole("link", { name: "Open in Journey Studio" });
  await fieldLink.waitFor({ timeout: 35_000 });
  const fieldHref = await fieldLink.getAttribute("href");
  check(new RegExp("^/creator/beta/[0-9a-f-]{36}$", "i").test(fieldHref || ""),
    "Field Studio accepted scaffold and created a canonical connected Journey");
  await fieldLink.click();
  await pageA.waitForURL("**/creator/beta/*", { timeout: 30_000 });
  await pageA.getByLabel("Journey title").waitFor();
  check(await pageA.getByLabel("Journey title").inputValue() === fieldTitle,
    "Connected Journey editor reopens field-created Journey with preserved title");

  console.log(`PASS: ${assertions} real Chromium Creator Alpha app assertions (local stack only).`);
} catch (err) {
  console.error("FAIL: Creator Alpha browser acceptance test:", err);
  throw err;
} finally {
  await contextA.close();
  await browser.close();
}
