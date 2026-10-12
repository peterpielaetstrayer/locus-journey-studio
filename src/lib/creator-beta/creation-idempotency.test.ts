import { describe, expect, it } from "vitest";
import { isDatabaseUniqueViolation, stableCreatorProposalSlug } from "./creation-idempotency";

const creatorA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const creatorB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

describe("Creator Alpha idempotent create identity", () => {
  it("returns the same unique key when a creator retries the same proposal", () => {
    const first = stableCreatorProposalSlug(creatorA, "proposal-123");
    expect(first).toBe(stableCreatorProposalSlug(creatorA, "proposal-123"));
    expect(first).toMatch(/^draft-[a-f0-9]{32}$/);
    expect(first.length).toBeLessThanOrEqual(80);
  });

  it("separates different creators and distinct proposals", () => {
    expect(stableCreatorProposalSlug(creatorA, "proposal-123"))
      .not.toBe(stableCreatorProposalSlug(creatorB, "proposal-123"));
    expect(stableCreatorProposalSlug(creatorA, "proposal-123"))
      .not.toBe(stableCreatorProposalSlug(creatorA, "proposal-456"));
  });

  it("rejects absent creator or proposal identifiers instead of using a shared slug", () => {
    expect(() => stableCreatorProposalSlug("", "proposal-123")).toThrow();
    expect(() => stableCreatorProposalSlug(creatorA, "  ")).toThrow();
  });

  it("only considers Postgres uniqueness conflicts recoverable", () => {
    expect(isDatabaseUniqueViolation({ code: "23505", message: "duplicate key" })).toBe(true);
    expect(isDatabaseUniqueViolation({ code: "42501" })).toBe(false);
    expect(isDatabaseUniqueViolation({ code: "PGRST301" })).toBe(false);
    expect(isDatabaseUniqueViolation(null)).toBe(false);
  });
});
