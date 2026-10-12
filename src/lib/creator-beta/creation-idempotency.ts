import { createHash } from "node:crypto";

/**
 * Stable for an individual draft proposal and its authenticated creator.
 * A retry after the server commits but before the HTTP response arrives
 * addresses the SAME unique (organization_id, slug) key.
 *
 * The display title is intentionally excluded so the creator can revise it
 * without generating another draft from the same proposal.
 */
export function stableCreatorProposalSlug(creatorId: string, proposalId: string): string {
  if (!creatorId.trim() || !proposalId.trim()) {
    throw new Error("Creator and proposal identity are required.");
  }
  const fingerprint = createHash("sha256")
    .update(JSON.stringify([creatorId, proposalId]), "utf8")
    .digest("hex")
    .slice(0, 32);
  return `draft-${fingerprint}`;
}

export function isDatabaseUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}
