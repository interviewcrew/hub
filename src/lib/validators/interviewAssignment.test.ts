import { describe, it, expect } from "vitest";
import {
  createInterviewAssignmentSchema,
  updateInterviewAssignmentSchema,
} from "./interviewAssignment";
import { generateMockUuid } from "@/tests/utils/mockUuid";

const baseMock = {
  candidateApplicationId: generateMockUuid(1),
  interviewStepId: generateMockUuid(2),
};

describe("createInterviewAssignmentSchema", () => {
  it("should validate a correct payload", () => {
    const mock = {
      ...baseMock,
      interviewerId: generateMockUuid(3),
      resourceUrl: "https://example.com/resource",
      resourceIdentifier: "file-12345",
      resourceDeletedAt: new Date(),
    };
    const result = createInterviewAssignmentSchema.safeParse(mock);
    expect(result.success).toBe(true);
  });

  it("should accept payloads where optional fields are missing", () => {
    const result = createInterviewAssignmentSchema.safeParse(baseMock);
    expect(result.success).toBe(true);
  });

  it("should fail if candidateApplicationId is not a UUID", () => {
    const mock = { ...baseMock, candidateApplicationId: "not-a-uuid" };
    const result = createInterviewAssignmentSchema.safeParse(mock);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("candidateApplicationId");
      expect(result.error.issues[0].message).toBe("Invalid uuid");
    }
  });

  it("should fail if resourceUrl is not a valid URL", () => {
    const mock = { ...baseMock, resourceUrl: "not-a-url" };
    const result = createInterviewAssignmentSchema.safeParse(mock);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("resourceUrl");
      expect(result.error.issues[0].message).toBe("Invalid url");
    }
  });

  it("should fail if resourceDeletedAt is not a date", () => {
    const mock = { ...baseMock, resourceDeletedAt: "not-a-date" };
    const result = createInterviewAssignmentSchema.safeParse(mock);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("resourceDeletedAt");
      expect(result.error.issues[0].message).toBe("Expected date, received string");
    }
  });
});

describe("updateInterviewAssignmentSchema", () => {
  it("should allow partial updates", () => {
    const mock = { resourceUrl: "https://example.com/new-url" };
    const result = updateInterviewAssignmentSchema.safeParse(mock);
    expect(result.success).toBe(true);
  });

  it("should not allow invalid types in partial updates", () => {
    const mock = { candidateApplicationId: "not-a-uuid" };
    const result = updateInterviewAssignmentSchema.safeParse(mock);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path[0]).toBe("candidateApplicationId");
      expect(result.error.issues[0].message).toBe("Invalid uuid");
    }
  });

  it("should accept an empty object for partial updates", () => {
    const result = updateInterviewAssignmentSchema.safeParse({});
    expect(result.success).toBe(true);
  });
}); 