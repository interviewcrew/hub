import { describe, it, expect } from "vitest";
import {
  createInterviewSchema,
  updateInterviewSchema,
} from "./interview";
import { generateMockUuid } from "@/tests/utils/mockUuid";

const baseMock = {
  candidateApplicationId: generateMockUuid(1),
  interviewStepId: generateMockUuid(2),
};

describe("createInterviewSchema", () => {
  it("should validate a correct full payload", () => {
    const mock = {
      ...baseMock,
      interviewerId: generateMockUuid(3),
      recordingUrl: "https://example.com/recording",
    };
    const result = createInterviewSchema.safeParse(mock);
    expect(result.success).toBe(true);
  });

  it("should validate a correct payload with missing optional fields", () => {
    const result = createInterviewSchema.safeParse(baseMock);
    expect(result.success).toBe(true);
  });

  it("should fail if candidateApplicationId is missing", () => {
    const mock = { interviewStepId: generateMockUuid(2) };
    const result = createInterviewSchema.safeParse(mock);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["candidateApplicationId"]);
    }
  });

  it("should fail if interviewStepId is missing", () => {
    const mock = { candidateApplicationId: generateMockUuid(1) };
    const result = createInterviewSchema.safeParse(mock);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["interviewStepId"]);
    }
  });

  it("should fail if candidateApplicationId is invalid", () => {
    const mock = { ...baseMock, candidateApplicationId: "not-a-uuid" };
    const result = createInterviewSchema.safeParse(mock);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["candidateApplicationId"]);
    }
  });
});

describe("updateInterviewSchema", () => {
  it("should allow partial updates", () => {
    const mock = { recordingUrl: "https://example.com/new-recording" };
    const result = updateInterviewSchema.safeParse(mock);
    expect(result.success).toBe(true);
  });

  it("should fail on invalid partial updates", () => {
    const mock = { interviewerId: "not-a-uuid" };
    const result = updateInterviewSchema.safeParse(mock);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["interviewerId"]);
    }
  });
}); 