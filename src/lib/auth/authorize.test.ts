import { describe, expect, it } from "vitest";
import {
  AuthError,
  ForbiddenError,
  isDbVersionEditable,
  requireOrganizationRole,
} from "@/lib/auth/authorize";

describe("isDbVersionEditable", () => {
  it("matches SQL allowlist", () => {
    expect(isDbVersionEditable("draft")).toBe(true);
    expect(isDbVersionEditable("field_test")).toBe(true);
    expect(isDbVersionEditable("private_adult_walk")).toBe(true);
    expect(isDbVersionEditable("learner_pilot")).toBe(false);
    expect(isDbVersionEditable("published")).toBe(false);
    expect(isDbVersionEditable("archived")).toBe(false);
  });
});

describe("requireOrganizationRole", () => {
  const ctx = {
    user: { id: "u1" },
    profile: null,
    memberships: [{ role: "creator" as const, organization_id: "org1" }],
  };

  it("allows matching role", () => {
    expect(() => requireOrganizationRole(ctx, ["creator"], "org1")).not.toThrow();
  });

  it("throws ForbiddenError for wrong role", () => {
    expect(() => requireOrganizationRole(ctx, ["owner"], "org1")).toThrow(ForbiddenError);
  });
});

describe("auth error types", () => {
  it("maps status codes", () => {
    expect(new AuthError().status).toBe(401);
    expect(new ForbiddenError().status).toBe(403);
  });
});
