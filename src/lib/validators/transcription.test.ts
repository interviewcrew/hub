import { describe, it, expect } from "vitest";
import {
  createTranscriptionSchema,
  updateTranscriptionSchema,
} from "./transcription";
import { generateMockUuid } from "@/tests/utils/mockUuid";
import { TRANSCRIPTION_PROCESSING_STATUSES, TRANSCRIPTION_TYPES } from "@/db/schema";

const baseMock = {
  interviewId: generateMockUuid(1),
  type: TRANSCRIPTION_TYPES.LIVE,
  status: TRANSCRIPTION_PROCESSING_STATUSES.COMPLETED,
  content: { text: "This is a test transcription." },
  provider: "test-provider",
};

describe("createTranscriptionSchema", () => {
  it("should validate a correct full payload", () => {
    const result = createTranscriptionSchema.safeParse(baseMock);
    expect(result.success).toBe(true);
  });

  it("should validate with optional fields missing", () => {
    const mock = {
      interviewId: baseMock.interviewId,
      type: baseMock.type,
      status: baseMock.status,
    };
    const result = createTranscriptionSchema.safeParse(mock);
    expect(result.success).toBe(true);
  });

  it("should fail if interviewId is missing", () => {
    const mock = {
      type: TRANSCRIPTION_TYPES.LIVE,
      status: TRANSCRIPTION_PROCESSING_STATUSES.COMPLETED,
    };
    const result = createTranscriptionSchema.safeParse(mock);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["interviewId"]);
    }
  });

  it("should fail if status is missing", () => {
    const mock = {
      interviewId: generateMockUuid(1),
      type: TRANSCRIPTION_TYPES.LIVE,
    };
    const result = createTranscriptionSchema.safeParse(mock);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["status"]);
    }
  });

  it("should fail if type is missing", () => {
    const mock = {
      interviewId: generateMockUuid(1),
      status: TRANSCRIPTION_PROCESSING_STATUSES.COMPLETED,
    };
    const result = createTranscriptionSchema.safeParse(mock);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["type"]);
    }
  });

  it("should fail if status is not a valid enum value", () => {
    const mock = { ...baseMock, status: 'invalid-status' };
    const result = createTranscriptionSchema.safeParse(mock);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["status"]);
    }
  });
});

describe("updateTranscriptionSchema", () => {
  it("should allow a partial update", () => {
    const mock = { provider: "new-provider" };
    const result = updateTranscriptionSchema.safeParse(mock);
    expect(result.success).toBe(true);
  });

  it("should fail an invalid partial update", () => {
    const mock = { interviewId: "not-a-uuid" };
    const result = updateTranscriptionSchema.safeParse(mock);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["interviewId"]);
    }
  });
}); 